import type { ReportRow } from './db';

export type ReportStatus = ReportRow['status'];

// Only these states may enter generation. Refund and ready states are terminal.
export const GENERATION_STATUSES: ReportStatus[] = ['paid', 'generating', 'failed'];

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
