import { hmacHex, timingSafeEqual } from './auth';

const STRIPE_API = 'https://api.stripe.com/v1';

export interface CheckoutSession {
  id: string;
  url: string;
  payment_intent?: string | null;
  amount_total?: number | null;
  currency?: string | null;
}

function form(data: Record<string, string>): string {
  return new URLSearchParams(data).toString();
}

export async function createCheckoutSession(
  secretKey: string,
  input: {
    reportId: string;
    productName: string;
    description: string;
    amountCents: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
  },
): Promise<CheckoutSession> {
  const res = await fetch(`${STRIPE_API}/checkout/sessions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Idempotency-Key': `checkout_${input.reportId}` },
    body: form({
      mode: 'payment',
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      client_reference_id: input.reportId,
      'metadata[report_id]': input.reportId,
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][currency]': input.currency,
      'line_items[0][price_data][unit_amount]': String(input.amountCents),
      'line_items[0][price_data][product_data][name]': input.productName,
      'line_items[0][price_data][product_data][description]': input.description,
      'payment_intent_data[metadata][report_id]': input.reportId,
    }),
  });
  if (!res.ok) throw new Error(`stripe checkout failed: ${res.status} ${await res.text()}`);
  return (await res.json()) as CheckoutSession;
}

export async function refundPaymentIntent(secretKey: string, paymentIntent: string, reason: string): Promise<boolean> {
  const res = await fetch(`${STRIPE_API}/refunds`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/x-www-form-urlencoded', 'Idempotency-Key': `refund_${paymentIntent}` },
    body: form({ payment_intent: paymentIntent, 'metadata[reason]': reason }),
  });
  return res.ok;
}

export interface StripeEvent {
  id: string;
  type: string;
  data: { object: Record<string, unknown> };
}

// Stripe-Signature: t=timestamp,v1=signature[,v1=...]
export async function verifyStripeSignature(payload: string, header: string | null, secret: string, toleranceSeconds = 300, now = Date.now()): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const idx = kv.indexOf('=');
      return [kv.slice(0, idx).trim(), kv.slice(idx + 1).trim()];
    }),
  );
  const t = parts['t'];
  if (!t) return false;
  const ts = Number(t);
  if (!Number.isFinite(ts) || Math.abs(now / 1000 - ts) > toleranceSeconds) return false;
  const expected = await hmacHex(secret, `${t}.${payload}`);
  const sigs = header
    .split(',')
    .map((kv) => kv.trim())
    .filter((kv) => kv.startsWith('v1='))
    .map((kv) => kv.slice(3));
  return sigs.some((s) => timingSafeEqual(s, expected));
}

export function parseStripeEvent(payload: string): StripeEvent {
  return JSON.parse(payload) as StripeEvent;
}
