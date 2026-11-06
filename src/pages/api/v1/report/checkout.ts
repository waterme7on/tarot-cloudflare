import type { APIRoute } from 'astro';
import { clientIp, hashIp, randomToken, verifyTurnstile } from '@/lib/auth';
import { getReadingByToken, insertReport, updateReport } from '@/lib/db';
import { track } from '@/lib/events';
import { error, isResponse, json, readJson } from '@/lib/http';
import { checkRateLimit, LIMITS } from '@/lib/rate-limit';
import { createCheckoutSession } from '@/lib/waffo';
import type { ReportProduct } from '@/lib/schema';

export const prerender = false;

interface CheckoutBody {
  publicToken: string;
  product: ReportProduct;
  turnstileToken?: string;
  userSummary?: string;
  consent?: boolean;
}

export const PRODUCTS: Record<ReportProduct, { name: string; priceVar: 'REPORT_PRICE_SINGLE_CENTS' | 'REPORT_PRICE_THREE_CENTS'; productVar: 'WAFFO_PRODUCT_SINGLE' | 'WAFFO_PRODUCT_THREE'; spreads: string[] }> = {
  single: { name: 'Single Card Deep Reading', priceVar: 'REPORT_PRICE_SINGLE_CENTS', productVar: 'WAFFO_PRODUCT_SINGLE', spreads: ['one-card'] },
  three: { name: 'Three Card Reading', priceVar: 'REPORT_PRICE_THREE_CENTS', productVar: 'WAFFO_PRODUCT_THREE', spreads: ['three-card', 'celtic-cross'] },
};

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const body = await readJson<CheckoutBody>(request);
  if (isResponse(body)) return body;

  if (typeof body.publicToken !== 'string' || !/^pub_[0-9a-f]{32}$/.test(body.publicToken)) return error(400, 'invalid_token', 'Bad reading token');
  if (body.product !== 'single' && body.product !== 'three') return error(400, 'invalid_product', 'Unknown product');
  const userSummary = typeof body.userSummary === 'string' && body.consent === true ? body.userSummary.replace(/\s+/g, ' ').trim().slice(0, 280) : null;

  const ip = clientIp(request);
  const ipHash = ip ? await hashIp(ip, env.IP_HASH_SALT ?? 'dev-salt') : null;
  if (ipHash) {
    const rl = await checkRateLimit(env.CACHE, `checkout:ip:${ipHash}`, LIMITS.checkoutPerIpPerHour, 3600);
    if (!rl.allowed) return error(429, 'rate_limited', 'Too many checkout attempts', { retryAfterSeconds: rl.retryAfterSeconds });
  }
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, body.turnstileToken, ip))) return error(403, 'turnstile_failed', 'Human verification failed');

  const reading = await getReadingByToken(env.DB, body.publicToken);
  if (!reading) return error(404, 'not_found', 'Reading not found');
  const product = PRODUCTS[body.product];
  if (!product.spreads.includes(reading.spread)) return error(400, 'product_mismatch', 'This product does not match the spread you drew');
  const productId = env[product.productVar];
  if (!env.WAFFO_MERCHANT_ID || !env.WAFFO_PRIVATE_KEY || !productId) return error(503, 'payments_unavailable', 'Payments are not configured');

  const amountCents = Number(env[product.priceVar]);
  const reportId = randomToken('rpt');
  const reportToken = randomToken('rep');
  await insertReport(env.DB, { id: reportId, readingId: reading.id, publicToken: reportToken, product: body.product, amountCents, currency: 'usd', userSummary });

  const site = env.SITE_URL.replace(/\/$/, '');
  let session;
  try {
    session = await createCheckoutSession(
      { merchantId: env.WAFFO_MERCHANT_ID, privateKeyPem: env.WAFFO_PRIVATE_KEY },
      { productId, reportId, successUrl: `${site}/report/${reportToken}/?checkout=success`, metadata: { reportId, readingToken: reading.public_token, product: body.product } },
    );
  } catch (err) {
    console.error('waffo checkout error', String(err));
    await updateReport(env.DB, reportId, { status: 'failed', error: 'checkout_create_failed' });
    return error(502, 'payments_error', 'Could not start checkout. Please try again in a moment.');
  }
  await updateReport(env.DB, reportId, { waffo_session_id: session.sessionId });
  track(env, { name: 'checkout_started', readingId: reading.id, route: '/api/v1/report/checkout', meta: { product: body.product, amountCents } });

  return json({ reportToken, checkoutUrl: session.checkoutUrl });
};
