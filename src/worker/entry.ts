import type { SSRManifest } from 'astro';
import { App } from 'astro/app';
import { handle } from '@astrojs/cloudflare/handler';
import { WorkflowEntrypoint, type WorkflowEvent, type WorkflowStep } from 'cloudflare:workers';
import { ALL_CARDS, getCard } from '../data/cards';
import { generateReportWithFallback } from '../lib/ai';
import { buildRulesReport } from '../lib/interpretation';
import { getReadingById, getReadingByToken, getReportById, updateReport, updateReportIfStatus, REPORT_FILE_TTL_DAYS } from '../lib/db';
import { track } from '../lib/events';
import { runRefundSweep, type StaleReport } from '../lib/refund-sweep';
import { GENERATION_STATUSES } from '../lib/report-state';
import { createRefundTicket, toDisplay } from '../lib/waffo';
import { renderShareSvg } from '../lib/share-image';
import type { DrawnCard, ReportQueueMessage } from '../lib/schema';

export interface ReportWorkflowParams {
  reportId: string;
}

export class ReportWorkflow extends WorkflowEntrypoint<Env, ReportWorkflowParams> {
  async run(event: WorkflowEvent<ReportWorkflowParams>, step: WorkflowStep) {
    const { reportId } = event.payload;
    const env = this.env;

    const order = await step.do('verify-order', async () => {
      const report = await getReportById(env.DB, reportId);
      if (!report) throw new Error(`report ${reportId} missing`);
      if (!GENERATION_STATUSES.includes(report.status)) return { skip: true as const, report };
      const reading = await getReadingById(env.DB, report.reading_id);
      if (!reading) throw new Error(`reading ${report.reading_id} missing`);
      const claimed = await updateReportIfStatus(env.DB, reportId, GENERATION_STATUSES, { status: 'generating', workflow_id: event.instanceId });
      if (!claimed) return { skip: true as const, report };
      return { skip: false as const, report, reading };
    });
    if (order.skip) return { status: 'skipped' };

    const drawn = JSON.parse(order.reading.cards_json) as DrawnCard[];
    const content = await step.do('generate', { retries: { limit: 2, delay: '10 seconds', backoff: 'exponential' }, timeout: '2 minutes' }, async () =>
      generateReportWithFallback(env, { drawn, lookup: getCard, spread: order.reading.spread, questionType: order.reading.question_type, userSummary: order.report.user_summary }),
    );

    const r2Key = await step.do('save-r2', async () => {
      const key = `reports/${order.report.public_token}.json`;
      await env.MEDIA.put(key, JSON.stringify({ ...content, product: order.report.product, generatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + REPORT_FILE_TTL_DAYS * 86400_000).toISOString() }), {
        httpMetadata: { contentType: 'application/json' },
      });
      return key;
    });

    const markedReady = await step.do('mark-ready', async () => {
      const changed = await updateReportIfStatus(env.DB, reportId, GENERATION_STATUSES, { status: 'ready', r2_key: r2Key, delivered_at: new Date().toISOString(), error: null });
      if (changed) track(env, { name: 'report_ready', readingId: order.report.reading_id, meta: { generator: content.generator, product: order.report.product } });
      return changed;
    });
    return markedReady ? { status: 'ready', generator: content.generator } : { status: 'skipped' };
  }
}

async function handleQueue(batch: MessageBatch<ReportQueueMessage>, env: Env): Promise<void> {
  for (const msg of batch.messages) {
    try {
      const m = msg.body;
      if ((m.type === 'generate-report' || m.type === 'retry-report') && m.reportId) {
        await env.REPORT_WORKFLOW.create({ id: `${m.reportId}-${Date.now()}`, params: { reportId: m.reportId } });
      } else if (m.type === 'share-image' && m.readingId) {
        const reading = await getReadingById(env.DB, m.readingId);
        if (reading) {
          const cards = JSON.parse(reading.cards_json) as DrawnCard[];
          const summary = JSON.parse(reading.summary_json) as { headline: string };
          const svg = renderShareSvg({ cards, headline: summary.headline, siteName: new URL(env.SITE_URL).host });
          await env.MEDIA.put(`share/${reading.public_token}.svg`, svg, { httpMetadata: { contentType: 'image/svg+xml' } });
        }
      }
      msg.ack();
    } catch (err) {
      console.error('queue message failed', msg.body, String(err));
      msg.retry({ delaySeconds: 30 });
    }
  }
}

async function handleScheduled(event: ScheduledController, env: Env): Promise<void> {
  const now = new Date().toISOString();
  if (event.cron === '*/10 * * * *') {
    // Reports paid more than 10 minutes ago and still not ready: retry once, then refund.
    await runRefundSweep({
      listStale: async () => (await env.DB.prepare(
        `SELECT id, waffo_payment_id, amount_cents, currency, reading_id, error, status FROM reports WHERE status IN ('paid','generating','failed') AND paid_at IS NOT NULL AND paid_at < datetime('now','-10 minutes') LIMIT 50`,
      ).all<StaleReport>()).results,
      markRetried: (id) => updateReportIfStatus(env.DB, id, GENERATION_STATUSES, { error: 'retried' }),
      enqueueRetry: async (id) => { await env.REPORT_QUEUE.send({ type: 'retry-report', reportId: id }); },
      canRefund: (r) => Boolean(env.WAFFO_MERCHANT_ID && env.WAFFO_PRIVATE_KEY && r.waffo_payment_id && r.amount_cents),
      claimRefund: (id) => updateReportIfStatus(env.DB, id, GENERATION_STATUSES, { status: 'refund_pending', error: 'auto_refund_claiming' }),
      createRefundTicket: (r) => createRefundTicket(
        { merchantId: env.WAFFO_MERCHANT_ID!, privateKeyPem: env.WAFFO_PRIVATE_KEY! },
        { paymentId: r.waffo_payment_id!, amount: toDisplay(r.amount_cents!), currency: (r.currency ?? 'usd').toUpperCase(), reason: 'Report was not generated within 10 minutes', reportId: r.id },
      ),
      recordRefundTicket: (id, ticketId) => updateReportIfStatus(env.DB, id, ['refund_pending'], { error: 'auto_refund_pending', waffo_refund_ticket_id: ticketId }),
      recordRefundFailure: (id, claimed) => updateReportIfStatus(env.DB, id, claimed ? ['refund_pending'] : GENERATION_STATUSES, { status: 'refund_failed', error: 'timeout_refund_failed' }),
      track: (r, outcome) => {
        if (outcome === 'retry') return;
        track(env, { name: 'report_failed', readingId: r.reading_id, meta: { reason: 'timeout', refund: outcome } });
      },
    });
    return;
  }

  // Daily 03:00 UTC housekeeping.
  await env.DB.prepare(`DELETE FROM readings WHERE expires_at IS NOT NULL AND expires_at < ?1 AND id NOT IN (SELECT reading_id FROM reports)`).bind(now).run();

  const expiredReports = await env.DB.prepare(`SELECT id, r2_key FROM reports WHERE r2_key IS NOT NULL AND delivered_at < datetime('now', ?1)`).bind(`-${REPORT_FILE_TTL_DAYS} days`).all<{ id: string; r2_key: string }>();
  for (const r of expiredReports.results) {
    await env.MEDIA.delete(r.r2_key);
    await updateReport(env.DB, r.id, { r2_key: null });
  }

  await env.DB.prepare(
    `INSERT OR REPLACE INTO daily_event_stats (day, event_name, count)
     SELECT substr(created_at,1,10), event_name, COUNT(*) FROM events WHERE created_at >= datetime('now','-2 days') GROUP BY 1,2`,
  ).run();
  await env.DB.prepare(`DELETE FROM events WHERE created_at < datetime('now','-30 days')`).run();

  // Weekly D1 export to R2 (Mondays); checked for success and recorded.
  if (new Date().getUTCDay() === 1) {
    const tables = ['cards', 'readings', 'reports', 'daily_event_stats', 'content_versions'];
    const dump: Record<string, unknown[]> = {};
    for (const t of tables) dump[t] = (await env.DB.prepare(`SELECT * FROM ${t}`).all()).results;
    const key = `backups/d1-${now.slice(0, 10)}.json`;
    const body = JSON.stringify(dump);
    await env.MEDIA.put(key, body, { httpMetadata: { contentType: 'application/json' } });
    const head = await env.MEDIA.head(key);
    if (!head) {
      console.error('backup verification failed', key);
    } else {
      await env.DB.prepare('INSERT INTO backups (id, r2_key, size_bytes, created_at) VALUES (?1, ?2, ?3, ?4)').bind(crypto.randomUUID(), key, head.size, now).run();
      const old = await env.MEDIA.list({ prefix: 'backups/' });
      const sorted = old.objects.sort((a, b) => (a.key < b.key ? 1 : -1));
      for (const o of sorted.slice(5)) await env.MEDIA.delete(o.key);
    }
  }
}

export function createExports(manifest: SSRManifest) {
  const app = new App(manifest);
  return {
    default: {
      async fetch(request, env, ctx) {
        const response = await handle(manifest, app, request as unknown as Parameters<typeof handle>[2], env as unknown as Parameters<typeof handle>[3], ctx as unknown as Parameters<typeof handle>[4]);
        if (env.ENVIRONMENT !== 'preview' || response.headers.get('X-Robots-Tag') === 'noindex, nofollow') return response;

        // Static assets can bypass Astro middleware even when the Worker runs first.
        const previewResponse = new Response(response.body, response);
        previewResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
        return previewResponse;
      },
      async queue(batch, env) {
        await handleQueue(batch as MessageBatch<ReportQueueMessage>, env);
      },
      async scheduled(event, env, ctx) {
        ctx.waitUntil(handleScheduled(event, env));
      },
    } satisfies ExportedHandler<Env, ReportQueueMessage>,
    ReportWorkflow,
  };
}

export { getReadingByToken, buildRulesReport, ALL_CARDS };
