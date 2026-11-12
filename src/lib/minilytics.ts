const API_BASE = 'https://analytics.yololab.cc/api/v1';
const PAYMENTS_URL = `${API_BASE}/payments`;
const GOALS_URL = `${API_BASE}/goals`;

export interface MinilyticsPayment {
  transactionId: string;
  amountCents: number;
  currency: string;
  timestamp: string;
  visitorId?: string | null;
  sessionId?: string | null;
  refunded?: boolean;
}

export function minilyticsPaymentBody(payment: MinilyticsPayment) {
  return {
    transaction_id: payment.transactionId,
    amount: payment.amountCents / 100,
    currency: payment.currency.toUpperCase(),
    timestamp: payment.timestamp,
    visitor_id: payment.visitorId ?? undefined,
    session_id: payment.sessionId ?? undefined,
    refunded: payment.refunded || undefined,
  };
}

export async function recordMinilyticsPayment(
  env: Pick<Env, 'MINILYTICS_API_KEY'>,
  payment: MinilyticsPayment,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  if (!env.MINILYTICS_API_KEY) return;
  try {
    const res = await fetchImpl(PAYMENTS_URL, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.MINILYTICS_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify(minilyticsPaymentBody(payment)),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) console.error('minilytics payment failed', res.status);
  } catch (error) {
    console.error('minilytics payment error', String(error));
  }
}

export interface MinilyticsGoal {
  visitorId?: string | null;
  name: string;
  props?: Record<string, string | number | boolean>;
}

export async function recordMinilyticsGoal(
  env: Pick<Env, 'MINILYTICS_API_KEY'>,
  goal: MinilyticsGoal,
  fetchImpl: typeof fetch = fetch,
): Promise<void> {
  if (!env.MINILYTICS_API_KEY || !goal.visitorId) return;
  try {
    const res = await fetchImpl(GOALS_URL, {
      method: 'POST',
      headers: { authorization: `Bearer ${env.MINILYTICS_API_KEY}`, 'content-type': 'application/json' },
      body: JSON.stringify({ visitor_id: goal.visitorId, name: goal.name, props: goal.props }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) console.error('minilytics goal failed', res.status);
  } catch (error) {
    console.error('minilytics goal error', String(error));
  }
}
