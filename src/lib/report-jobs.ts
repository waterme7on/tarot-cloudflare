import type { PaidReportEvidence } from './report-state';
import { isServerConfirmedPaid } from './report-state';

export interface ReportQueueJob {
  type: 'generate-report' | 'retry-report';
  reportId?: string;
}

export interface ReportJobDeps {
  loadReport(id: string): Promise<PaidReportEvidence | null>;
  enqueue(reportId: string): Promise<void>;
}

export type ReportJobOutcome = 'enqueued' | 'skipped';

/**
 * Queue messages are not proof of payment. Re-check the persisted order before
 * creating a report workflow so no unpaid row can ever reach AI generation.
 */
export async function enqueueReportJob(message: ReportQueueJob, deps: ReportJobDeps): Promise<ReportJobOutcome> {
  if (!message.reportId) return 'skipped';
  const report = await deps.loadReport(message.reportId);
  if (!isServerConfirmedPaid(report)) return 'skipped';
  await deps.enqueue(message.reportId);
  return 'enqueued';
}
