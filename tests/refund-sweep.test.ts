import { describe, expect, it } from 'vitest';
import { runRefundSweep, type RefundSweepDeps, type StaleReport } from '../src/lib/refund-sweep';
import { GENERATION_STATUSES, refundFailureStatus, staleReportAction } from '../src/lib/report-state';

interface Row extends StaleReport {
  ticketId?: string;
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
}

function canGenerate(status: string): boolean {
  return (GENERATION_STATUSES as string[]).includes(status);
}

function harness(initial: Row, options: { blockProvider?: boolean; failProvider?: boolean } = {}) {
  const row: Row = { ...initial };
  const snapshot: Row = { ...initial };
  const providerCalls: string[] = [];
  const retries: string[] = [];
  const tracked: [string, string][] = [];
  const enteredProvider = deferred();
  const releaseProvider = deferred();

  const deps: RefundSweepDeps = {
    listStale: async () => [{ ...snapshot }],
    markRetried: async (id) => {
      if (id !== row.id || !canGenerate(row.status)) return false;
      row.error = 'retried';
      return true;
    },
    enqueueRetry: async (id) => { retries.push(id); },
    canRefund: () => true,
    claimRefund: async (id) => {
      if (id !== row.id || !canGenerate(row.status)) return false;
      row.status = 'refund_pending';
      row.error = 'auto_refund_claiming';
      return true;
    },
    createRefundTicket: async (report) => {
      providerCalls.push(report.id);
      if (options.failProvider) throw new Error('provider unavailable');
      if (options.blockProvider) {
        enteredProvider.resolve();
        await releaseProvider.promise;
      }
      return { id: 'tkt_1' };
    },
    recordRefundTicket: async (id, ticketId) => {
      if (id !== row.id || row.status !== 'refund_pending') return false;
      row.error = 'auto_refund_pending';
      row.ticketId = ticketId;
      return true;
    },
    recordRefundFailure: async (id, claimed) => {
      const allowed = claimed ? ['refund_pending'] : (GENERATION_STATUSES as string[]);
      if (id !== row.id || !allowed.includes(row.status)) return false;
      row.status = 'refund_failed';
      row.error = 'timeout_refund_failed';
      return true;
    },
    track: (_report, outcome) => { tracked.push([row.id, outcome]); },
  };

  return { row, providerCalls, retries, tracked, deps, enteredProvider, releaseProvider };
}

const stale: Row = {
  id: 'rpt_1',
  reading_id: 'rdg_1',
  status: 'paid',
  error: 'retried',
  waffo_payment_id: 'pay_1',
  amount_cents: 499,
  currency: 'usd',
};

describe('refund sweep orchestration', () => {
  it('claims refund_pending before the provider call so generation cannot mark ready', async () => {
    const h = harness(stale, { blockProvider: true });
    const sweep = runRefundSweep(h.deps);
    await h.enteredProvider.promise;
    expect(h.row.status).toBe('refund_pending');
    expect(h.row.error).toBe('auto_refund_claiming');
    expect(canGenerate(h.row.status)).toBe(false);
    h.releaseProvider.resolve();
    await sweep;
    expect(h.row.status).toBe('refund_pending');
    expect(h.row.ticketId).toBe('tkt_1');
  });

  it('lets only one concurrent sweep request a refund', async () => {
    const h = harness(stale, { blockProvider: true });
    const first = runRefundSweep(h.deps);
    await h.enteredProvider.promise;
    const second = runRefundSweep(h.deps);
    h.releaseProvider.resolve();
    await Promise.all([first, second]);
    expect(h.providerCalls).toHaveLength(1);
    expect(h.row.status).toBe('refund_pending');
    expect(h.tracked.filter(([, outcome]) => outcome === 'refund_pending')).toHaveLength(1);
  });

  it('never downgrades a refund confirmed before the ticket response is recorded', async () => {
    const h = harness(stale, { blockProvider: true });
    const sweep = runRefundSweep(h.deps);
    await h.enteredProvider.promise;
    // Provider callback lands while the create-ticket response is still in flight.
    h.row.status = 'refunded';
    h.row.error = null;
    h.releaseProvider.resolve();
    await sweep;
    expect(h.row.status).toBe('refunded');
    expect(h.tracked).not.toContainEqual(['rpt_1', 'refund_pending']);
    expect(await h.deps.recordRefundFailure('rpt_1', true)).toBe(false);
    expect(h.row.status).toBe('refunded');
    expect(refundFailureStatus('refunded')).toBeNull();
  });

  it('retries once before requesting a refund', async () => {
    const h = harness({ ...stale, error: null });
    await runRefundSweep(h.deps);
    expect(h.retries).toEqual(['rpt_1']);
    expect(h.providerCalls).toHaveLength(0);
    expect(h.row.status).toBe('paid');
    expect(h.row.error).toBe('retried');
  });

  it('marks a failed provider call refund_failed and never touches terminal states', async () => {
    const h = harness(stale, { failProvider: true });
    await runRefundSweep(h.deps);
    expect(h.row.status).toBe('refund_failed');
    expect(h.tracked).toContainEqual(['rpt_1', 'refund_failed']);
    expect(staleReportAction('refund_pending', 'auto_refund_claiming')).toBe('skip');
    expect(staleReportAction('refunded', null)).toBe('skip');
    expect(staleReportAction('refund_failed', 'timeout_refund_failed')).toBe('skip');
  });
});
