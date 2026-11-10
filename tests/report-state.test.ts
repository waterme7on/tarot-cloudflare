import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { GENERATION_STATUSES, refundFailureStatus, reportPublicError } from '../src/lib/report-state';

describe('report refund states', () => {
  it('never lets a late refund.failed downgrade a confirmed refund', () => {
    expect(refundFailureStatus('refunded')).toBeNull();
    expect(refundFailureStatus('refund_failed')).toBeNull();
    expect(refundFailureStatus('refund_pending')).toBe('refund_failed');
    expect(refundFailureStatus('failed')).toBe('refund_failed');
  });

  it('keeps generation and mark-ready away from refund and terminal states', () => {
    for (const status of ['pending_payment', 'ready', 'refund_pending', 'refunded', 'refund_failed']) {
      expect(GENERATION_STATUSES).not.toContain(status);
    }
    expect(GENERATION_STATUSES).toEqual(['paid', 'generating', 'failed']);
  });

  it('describes a refund request as pending rather than complete', () => {
    const pending = reportPublicError('refund_pending');
    expect(pending).toContain('requested');
    expect(pending).toContain('awaiting confirmation');
    expect(pending).not.toMatch(/was refunded|has been refunded|refunded in full/i);
    expect(reportPublicError('refund_failed')).toContain('could not be completed');
    expect(reportPublicError('refunded')).toBeNull();
  });

  it('does not promise an instant refund at the ten-minute mark', () => {
    const result = readFileSync(new URL('../src/components/CardResult.tsx', import.meta.url), 'utf8');
    const guide = readFileSync(new URL('../src/content/guides/refund.md', import.meta.url), 'utf8');
    expect(result).not.toMatch(/you are refunded automatically/i);
    expect(result).toContain('automatically request a refund');
    expect(guide).not.toMatch(/automatically refunded in full/i);
    expect(guide).toContain('automatically request a full refund');
  });
});
