import type { APIRoute } from 'astro';
import { getReportById, updateReport } from '@/lib/db';
import { track } from '@/lib/events';
import { error, json } from '@/lib/http';
import { parseStripeEvent, verifyStripeSignature } from '@/lib/stripe';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  if (!env.STRIPE_WEBHOOK_SECRET) return error(503, 'webhook_not_configured', 'Missing webhook secret');
  const payload = await request.text();
  if (payload.length > 64 * 1024) return error(413, 'payload_too_large', 'Too large');
  const ok = await verifyStripeSignature(payload, request.headers.get('stripe-signature'), env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return error(400, 'bad_signature', 'Invalid Stripe signature');

  const event = parseStripeEvent(payload);
  const dedupeKey = `stripe:evt:${event.id}`;
  if (await env.CACHE.get(dedupeKey)) return json({ received: true, duplicate: true });

  if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.async_payment_succeeded') {
    const session = event.data.object as { id: string; client_reference_id?: string; payment_intent?: string; amount_total?: number; currency?: string; payment_status?: string; metadata?: Record<string, string> };
    const reportId = session.client_reference_id ?? session.metadata?.report_id;
    if (reportId && session.payment_status === 'paid') {
      const report = await getReportById(env.DB, reportId);
      if (report && report.status === 'pending_payment') {
        // Amount comes from Stripe, never from the client.
        await updateReport(env.DB, reportId, {
          status: 'paid',
          stripe_session_id: session.id,
          stripe_payment_intent: session.payment_intent ?? null,
          amount_cents: session.amount_total ?? report.amount_cents,
          currency: session.currency ?? report.currency,
          paid_at: new Date().toISOString(),
        });
        await env.REPORT_QUEUE.send({ type: 'generate-report', reportId });
        track(env, { name: 'checkout_completed', readingId: report.reading_id, route: '/api/v1/webhooks/stripe', meta: { product: report.product, amountCents: session.amount_total ?? 0 } });
      }
    }
  } else if (event.type === 'charge.refunded') {
    const charge = event.data.object as { payment_intent?: string; metadata?: Record<string, string> };
    const reportId = charge.metadata?.report_id;
    if (reportId) {
      await updateReport(env.DB, reportId, { status: 'refunded' });
      track(env, { name: 'refund_requested', route: '/api/v1/webhooks/stripe', meta: { reportId } });
    }
  }

  await env.CACHE.put(dedupeKey, '1', { expirationTtl: 86400 * 3 });
  return json({ received: true });
};
