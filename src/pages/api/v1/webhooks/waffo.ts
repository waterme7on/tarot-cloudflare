import type { APIRoute } from 'astro';
import { getReportById, updateReport, updateReportIfStatus } from '@/lib/db';
import { track } from '@/lib/events';
import { error, json } from '@/lib/http';
import { refundFailureStatus } from '@/lib/report-state';
import { toCents, verifyWaffoSignature, type WaffoWebhookEvent } from '@/lib/waffo';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  if (!env.WAFFO_WEBHOOK_PUBLIC_KEY) return error(503, 'webhook_not_configured', 'Missing webhook public key');
  const payload = await request.text();
  if (payload.length > 64 * 1024) return error(413, 'payload_too_large', 'Too large');
  const ok = await verifyWaffoSignature(payload, request.headers.get('x-waffo-signature'), env.WAFFO_WEBHOOK_PUBLIC_KEY);
  if (!ok) return error(401, 'bad_signature', 'Invalid Waffo signature');

  const event = JSON.parse(payload) as WaffoWebhookEvent;
  const expectedMode = env.ENVIRONMENT === 'production' ? 'prod' : 'test';
  if (event.mode !== expectedMode) return json({ received: true, ignored: 'mode' });

  const dedupeKey = `waffo:evt:${event.eventType}:${event.id}`;
  if (await env.CACHE.get(dedupeKey)) return json({ received: true, duplicate: true });

  const reportId = event.data.orderMerchantExternalId ?? event.data.orderMetadata?.reportId;

  if (event.eventType === 'order.completed' && reportId && event.data.paymentStatus === 'succeeded') {
    const report = await getReportById(env.DB, reportId);
    if (report && report.status === 'pending_payment') {
      // Amount comes from the webhook, never from the client.
      await updateReport(env.DB, reportId, {
        status: 'paid',
        waffo_order_id: event.data.orderId,
        waffo_payment_id: event.data.paymentId ?? null,
        amount_cents: toCents(event.data.chargedAmount ?? event.data.amount ?? event.data.total) ?? report.amount_cents,
        currency: event.data.currency?.toLowerCase() ?? report.currency,
        paid_at: new Date().toISOString(),
      });
      await env.REPORT_QUEUE.send({ type: 'generate-report', reportId });
      track(env, { name: 'checkout_completed', readingId: report.reading_id, route: '/api/v1/webhooks/waffo', meta: { product: report.product, amountCents: toCents(event.data.chargedAmount) ?? 0 } });
    }
  } else if (event.eventType === 'refund.succeeded' && reportId) {
    // The provider has confirmed the refund; this is the only success transition.
    await updateReport(env.DB, reportId, { status: 'refunded', error: null });
    track(env, { name: 'refund_requested', route: '/api/v1/webhooks/waffo', meta: { reportId, outcome: 'succeeded' } });
  } else if (event.eventType === 'refund.failed' && reportId) {
    const report = await getReportById(env.DB, reportId);
    const status = report ? refundFailureStatus(report.status) : null;
    if (report && status) await updateReportIfStatus(env.DB, reportId, [report.status], { status, error: 'refund_failed' });
    track(env, { name: 'refund_requested', route: '/api/v1/webhooks/waffo', meta: { reportId, outcome: 'failed', previousStatus: report?.status ?? null } });
  }

  await env.CACHE.put(dedupeKey, '1', { expirationTtl: 86400 * 3 });
  return json({ received: true });
};
