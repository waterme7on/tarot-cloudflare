const enc = new TextEncoder();

const API_BASE = 'https://api.waffo.ai';

function pemToDer(pem: string): ArrayBuffer {
  const b64 = pem.replace(/-----[A-Z ]+-----/g, '').replace(/\s+/g, '');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

function b64(buf: ArrayBuffer): string {
  let s = '';
  for (const b of new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s);
}

function b64ToBuf(s: string): ArrayBuffer {
  return pemToDer(s);
}

export interface WaffoConfig {
  merchantId: string;
  privateKeyPem: string;
}

export interface WaffoError {
  message: string;
  layer?: string;
}

async function signedRequest<T>(cfg: WaffoConfig, path: string, body: unknown, idempotencyKey?: string): Promise<T> {
  const bodyStr = JSON.stringify(body);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyHash = b64(await crypto.subtle.digest('SHA-256', enc.encode(bodyStr)));
  const canonical = `POST\n${path}\n${timestamp}\n${bodyHash}`;
  const key = await crypto.subtle.importKey('pkcs8', pemToDer(cfg.privateKeyPem), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const signature = b64(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, enc.encode(canonical)));
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Merchant-Id': cfg.merchantId,
    'X-Timestamp': timestamp,
    'X-Signature': signature,
  };
  if (idempotencyKey) headers['X-Idempotency-Key'] = idempotencyKey;
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: bodyStr });
  const json = (await res.json()) as { data: T | null; errors?: WaffoError[] };
  if (!res.ok || !json.data) throw new Error(`waffo ${path} ${res.status}: ${json.errors?.[0]?.message ?? 'unknown error'}`);
  return json.data;
}

export interface CheckoutSession {
  sessionId: string;
  checkoutUrl: string;
  expiresAt: string;
}

export async function createCheckoutSession(
  cfg: WaffoConfig,
  input: { productId: string; reportId: string; successUrl: string; metadata: Record<string, string>; language?: string },
): Promise<CheckoutSession> {
  const data = await signedRequest<CheckoutSession | { session: CheckoutSession }>(
    cfg,
    '/v1/actions/checkout/create-session',
    {
      productId: input.productId,
      currency: 'USD',
      successUrl: input.successUrl,
      expiresInSeconds: 3600,
      darkMode: true,
      language: input.language ?? 'en',
      metadata: input.metadata,
      orderMerchantExternalId: input.reportId,
    },
    `${cfg.merchantId}-checkout-${input.reportId}`,
  );
  return 'session' in data ? data.session : data;
}

export async function createRefundTicket(cfg: WaffoConfig, input: { paymentId: string; amount: string; currency: string; reason: string; reportId: string }): Promise<{ id: string; status: string }> {
  const data = await signedRequest<{ ticket: { id: string; status: string } }>(
    cfg,
    '/v1/actions/refund/create-ticket',
    {
      paymentId: input.paymentId,
      reason: input.reason,
      requestedAmount: { amount: input.amount, currency: input.currency },
      refundTicketMerchantExternalId: `refund-${input.reportId}`,
    },
    `${cfg.merchantId}-refund-${input.reportId}`,
  );
  return data.ticket;
}

export interface WaffoWebhookEvent {
  id: string;
  timestamp: string;
  eventType: string;
  eventId: string;
  storeId: string;
  mode: 'test' | 'prod';
  data: {
    orderId: string;
    orderStatus?: string;
    buyerEmail?: string;
    currency: string;
    chargedAmount?: string;
    amount?: string;
    total?: string;
    orderMetadata?: Record<string, string>;
    orderMerchantExternalId?: string;
    paymentId?: string;
    paymentStatus?: string;
    refundStatus?: string;
    refundedAmount?: string;
    productName?: string;
  };
}

// X-Waffo-Signature: t=<ms>,v1=<base64 RSA-SHA256 over `${t}.${rawBody}`>
export async function verifyWaffoSignature(rawBody: string, header: string | null, publicKeyPemOrB64: string, toleranceMs = 45 * 60 * 1000, now = Date.now()): Promise<boolean> {
  if (!header) return false;
  const parts: Record<string, string> = {};
  for (const pair of header.split(',')) {
    const idx = pair.indexOf('=');
    if (idx > 0) parts[pair.slice(0, idx).trim()] = pair.slice(idx + 1).trim();
  }
  const t = parts['t'];
  const v1 = parts['v1'];
  if (!t || !v1 || !/^\d+$/.test(t)) return false;
  if (Math.abs(now - Number(t)) > toleranceMs) return false;
  try {
    const key = await crypto.subtle.importKey('spki', b64ToBuf(publicKeyPemOrB64), { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    return await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, b64ToBuf(v1), enc.encode(`${t}.${rawBody}`));
  } catch {
    return false;
  }
}

export function toCents(display: string | undefined): number | null {
  if (!display) return null;
  const n = Number(display);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
}

export function toDisplay(cents: number): string {
  return (cents / 100).toFixed(2);
}
