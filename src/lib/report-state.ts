import type { ReportRow } from './db';

export type ReportStatus = ReportRow['status'];

// Only these states may enter generation. Refund and ready states are terminal.
export const GENERATION_STATUSES: ReportStatus[] = ['paid', 'generating', 'failed'];

export interface PaidReportEvidence {
  status: string;
  paid_at: string | null;
  waffo_order_id: string | null;
  waffo_payment_id: string | null;
}

/**
 * The only gate for AI report parsing/generation. paid_at and a provider
 * order/payment id can only be written after the signed Waffo webhook
 * confirms a succeeded payment; a failed checkout never qualifies.
 */
export function isServerConfirmedPaid<T extends PaidReportEvidence>(report: T | null | undefined): report is T {
  if (!report) return false;
  if (!GENERATION_STATUSES.includes(report.status as ReportStatus)) return false;
  if (!report.paid_at) return false;
  return Boolean(report.waffo_order_id || report.waffo_payment_id);
}

// Waffo's create-ticket endpoint only opens a refund ticket. A refund is
// confirmed by the refund.succeeded webhook, never by ticket creation itself.
export type StaleReportAction = 'retry' | 'request-refund' | 'skip';

export function staleReportAction(status: string, error: string | null): StaleReportAction {
  if (!GENERATION_STATUSES.includes(status as ReportStatus)) return 'skip';
  return error === 'retried' ? 'request-refund' : 'retry';
}

export function refundFailureStatus(current: string): ReportStatus | null {
  return current === 'refund_pending' || current === 'failed' ? 'refund_failed' : null;
}

export function reportPublicError(status: ReportStatus): string | null {
  if (status === 'failed') return 'We could not generate your report. A retry is scheduled; if it still fails, a refund will be requested automatically.';
  if (status === 'refund_pending') return 'Your report could not be generated. A refund has been requested from the payment provider and is awaiting confirmation.';
  if (status === 'refund_failed') return 'Your report could not be generated and the automatic refund could not be completed. Keep this order link for your records.';
  return null;
}
