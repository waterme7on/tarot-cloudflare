import { staleReportAction } from './report-state';

export interface StaleReport {
  id: string;
  reading_id: string;
  status: string;
  error: string | null;
  waffo_payment_id: string | null;
  amount_cents: number | null;
  currency: string | null;
}

export interface RefundSweepDeps {
  listStale(): Promise<StaleReport[]>;
  markRetried(id: string): Promise<boolean>;
  enqueueRetry(id: string): Promise<void>;
  canRefund(report: StaleReport): boolean;
  /** Atomically move an eligible report to refund_pending; false means another sweep won. */
  claimRefund(id: string): Promise<boolean>;
  createRefundTicket(report: StaleReport): Promise<{ id: string }>;
  /** Only records the ticket while the report is still refund_pending, never after refunded. */
  recordRefundTicket(id: string, ticketId: string): Promise<boolean>;
  recordRefundFailure(id: string, claimed: boolean): Promise<boolean>;
  track(report: StaleReport, outcome: 'retry' | 'refund_pending' | 'refund_failed'): void;
}

export async function runRefundSweep(deps: RefundSweepDeps): Promise<void> {
  const stale = await deps.listStale();
  for (const report of stale) {
    const action = staleReportAction(report.status, report.error);
    if (action === 'skip') continue;
    if (action === 'retry') {
      if (await deps.markRetried(report.id)) {
        await deps.enqueueRetry(report.id);
        deps.track(report, 'retry');
      }
      continue;
    }
    if (!deps.canRefund(report)) {
      if (await deps.recordRefundFailure(report.id, false)) deps.track(report, 'refund_failed');
      continue;
    }
    // The local claim must land before the provider side effect so concurrent
    // sweeps lose, and generation can no longer advance this report to ready.
    if (!(await deps.claimRefund(report.id))) continue;
    try {
      const ticket = await deps.createRefundTicket(report);
      if (await deps.recordRefundTicket(report.id, ticket.id)) deps.track(report, 'refund_pending');
    } catch {
      if (await deps.recordRefundFailure(report.id, true)) deps.track(report, 'refund_failed');
    }
  }
}
