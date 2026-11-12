import { describe, expect, it, vi } from 'vitest';
import { minilyticsPaymentBody, recordMinilyticsPayment } from '../src/lib/minilytics';

const payment = {
  transactionId: 'pay_123',
  amountCents: 499,
  currency: 'usd',
  timestamp: '2026-11-12T10:00:00.000Z',
  visitorId: 'visitor-1234',
  sessionId: 'session-1234',
};

describe('Minilytics payments', () => {
  it('sends major units and attribution fields', () => {
    expect(minilyticsPaymentBody(payment)).toEqual({
      transaction_id: 'pay_123',
      amount: 4.99,
      currency: 'USD',
      timestamp: '2026-11-12T10:00:00.000Z',
      visitor_id: 'visitor-1234',
      session_id: 'session-1234',
      refunded: undefined,
    });
  });

  it('marks refunds without changing the transaction id', () => {
    const body = minilyticsPaymentBody({ ...payment, refunded: true });
    expect(body.transaction_id).toBe('pay_123');
    expect(body.refunded).toBe(true);
  });

  it('posts with the site API key and skips when unconfigured', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }));
    await recordMinilyticsPayment({ MINILYTICS_API_KEY: 'ml_test' }, payment, fetchMock as unknown as typeof fetch);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('https://analytics.yololab.cc/api/v1/payments');
    expect((init.headers as Record<string, string>).authorization).toBe('Bearer ml_test');

    const skipped = vi.fn(async () => new Response('{}', { status: 200 }));
    await recordMinilyticsPayment({}, payment, skipped as unknown as typeof fetch);
    expect(skipped).not.toHaveBeenCalled();
  });
});
