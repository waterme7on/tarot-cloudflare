import type { APIRoute } from 'astro';
import { clientIp, hashIp } from '@/lib/auth';
import { json } from '@/lib/http';
import { dailyDrawKey, LIMITS, readRateLimit, secondsUntilUtcMidnight } from '@/lib/rate-limit';

export const prerender = false;

export const GET: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const limit = LIMITS.drawsPerIpPerDay;
  const fallbackResetAt = Date.now() + Math.max(60, secondsUntilUtcMidnight()) * 1000;
  const ip = clientIp(request);
  const ipHash = ip ? await hashIp(ip, env.IP_HASH_SALT ?? 'dev-salt') : null;
  if (!ipHash) return json({ limit, remaining: limit, resetAt: fallbackResetAt });

  const quota = await readRateLimit(env.CACHE, dailyDrawKey(ipHash), limit);
  return json({
    limit,
    remaining: quota.remaining,
    resetAt: quota.resetAt > Date.now() ? quota.resetAt : fallbackResetAt,
  });
};
