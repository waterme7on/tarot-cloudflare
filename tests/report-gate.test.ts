import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { enqueueReportJob, type ReportJobDeps } from '../src/lib/report-jobs';
import { isServerConfirmedPaid, type PaidReportEvidence } from '../src/lib/report-state';

function report(patch: Partial<PaidReportEvidence> = {}): PaidReportEvidence {
  return {
    status: 'paid',
    paid_at: '2026-11-12T00:00:00.000Z',
    waffo_order_id: 'ord_1',
    waffo_payment_id: 'pay_1',
    ...patch,
  };
}

describe('server-confirmed payment gate', () => {
  it('allows only paid records that carry webhook payment evidence', () => {
    expect(isServerConfirmedPaid(report())).toBe(true);
    expect(isServerConfirmedPaid(report({ status: 'generating' }))).toBe(true);
    expect(isServerConfirmedPaid(report({ status: 'failed' }))).toBe(true);
    expect(isServerConfirmedPaid(report({ waffo_payment_id: null }))).toBe(true);
    expect(isServerConfirmedPaid(report({ waffo_order_id: null }))).toBe(true);
  });

  it('rejects unpaid, refunded, missing and evidence-free rows', () => {
    expect(isServerConfirmedPaid(null)).toBe(false);
    expect(isServerConfirmedPaid(report({ status: 'pending_payment', paid_at: null }))).toBe(false);
    expect(isServerConfirmedPaid(report({ status: 'failed', paid_at: null }))).toBe(false);
    expect(isServerConfirmedPaid(report({ status: 'refunded' }))).toBe(false);
    expect(isServerConfirmedPaid(report({ status: 'refund_pending' }))).toBe(false);
    expect(isServerConfirmedPaid(report({ status: 'ready' }))).toBe(false);
    expect(isServerConfirmedPaid(report({ paid_at: null }))).toBe(false);
    expect(isServerConfirmedPaid(report({ waffo_order_id: null, waffo_payment_id: null }))).toBe(false);
  });
});

describe('queue enqueue gate', () => {
  function harness(loaded: PaidReportEvidence | null) {
    const enqueued: string[] = [];
    const deps: ReportJobDeps = {
      loadReport: async () => loaded,
      enqueue: async (id) => { enqueued.push(id); },
    };
    return { deps, enqueued };
  }

  it('never enqueues a report whose checkout was never confirmed paid', async () => {
    const h = harness(report({ status: 'failed', paid_at: null, waffo_order_id: null, waffo_payment_id: null }));
    expect(await enqueueReportJob({ type: 'generate-report', reportId: 'rpt_1' }, h.deps)).toBe('skipped');
    expect(await enqueueReportJob({ type: 'retry-report', reportId: 'rpt_1' }, h.deps)).toBe('skipped');
    expect(h.enqueued).toEqual([]);
  });

  it('never enqueues when the report is missing', async () => {
    const h = harness(null);
    expect(await enqueueReportJob({ type: 'generate-report', reportId: 'rpt_x' }, h.deps)).toBe('skipped');
    expect(h.enqueued).toEqual([]);
  });

  it('enqueues a confirmed paid report', async () => {
    const h = harness(report());
    expect(await enqueueReportJob({ type: 'generate-report', reportId: 'rpt_1' }, h.deps)).toBe('enqueued');
    expect(h.enqueued).toEqual(['rpt_1']);
  });
});

describe('worker wiring', () => {
  const entry = readFileSync(new URL('../src/worker/entry.ts', import.meta.url), 'utf8');

  it('re-checks payment in the queue consumer before creating a workflow', () => {
    expect(entry).toContain('enqueueReportJob({ type: m.type');
    expect(entry).toContain('no confirmed payment');
  });

  it('checks the persisted order before any AI generation call', () => {
    const gate = entry.indexOf('isServerConfirmedPaid(report)');
    const generate = entry.indexOf('generateReportWithFallback(env');
    expect(gate).toBeGreaterThan(-1);
    expect(generate).toBeGreaterThan(gate);
  });

  it('keeps the free draw route free of AI and payment bindings', () => {
    const draw = readFileSync(new URL('../src/pages/api/v1/draw.ts', import.meta.url), 'utf8');
    expect(draw).not.toMatch(/generateReport|generateAiReport|env\.AI\b|REPORT_QUEUE|WAFFO|REPORT_WORKFLOW|REPORT_PRICE/);
  });
});

// Keep the shared helper honest: a gate that is bypassed by a future import is
// still a regression even when the helper unit tests pass.
describe('generation imports', () => {
  it('imports the gate into both queue and workflow paths', () => {
    const entry = readFileSync(new URL('../src/worker/entry.ts', import.meta.url), 'utf8');
    expect(entry).toMatch(/import \{[^}]*isServerConfirmedPaid[^}]*\} from '\.\.\/lib\/report-state'/);
  });
});
