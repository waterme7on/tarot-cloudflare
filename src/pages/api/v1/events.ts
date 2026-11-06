import type { APIRoute } from 'astro';
import { clientIp, hashIp } from '@/lib/auth';
import { insertEvent } from '@/lib/db';
import { sanitizeMeta, track } from '@/lib/events';
import { error, isResponse, json, readJson } from '@/lib/http';
import { checkRateLimit, LIMITS } from '@/lib/rate-limit';
import { isEventName } from '@/lib/schema';

export const prerender = false;

interface EventBody {
  name: string;
  readingId?: string;
  route?: string;
  locale?: string;
  meta?: Record<string, unknown>;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const body = await readJson<EventBody>(request, 2048);
  if (isResponse(body)) return body;
  if (!isEventName(body.name)) return error(400, 'invalid_event', 'Unknown event name');

  const ip = clientIp(request);
  if (ip) {
    const rl = await checkRateLimit(env.CACHE, `events:ip:${await hashIp(ip, env.IP_HASH_SALT ?? 'dev-salt')}`, LIMITS.eventsPerIpPerMinute, 60);
    if (!rl.allowed) return error(429, 'rate_limited', 'Slow down');
  }

  const readingId = typeof body.readingId === 'string' && /^rdg_[0-9a-f]{32}$/.test(body.readingId) ? body.readingId : null;
  const route = typeof body.route === 'string' ? body.route.slice(0, 200) : null;
  const locale = typeof body.locale === 'string' ? body.locale.slice(0, 10) : null;
  const meta = sanitizeMeta(body.meta);

  track(env, { name: body.name, readingId, route, locale, meta });
  await insertEvent(env.DB, { eventName: body.name, readingId, locale, route, metadata: meta });
  return json({ ok: true }, { status: 202 });
};
