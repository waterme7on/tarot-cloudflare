export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

// Fixed-window counter in KV. Good enough for abuse control; WAF rate limiting rules add the hard edge layer.
export async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowSeconds: number,
  now = Date.now(),
): Promise<RateLimitResult> {
  const kvKey = `rl:${key}`;
  const existing = (await kv.get<Bucket>(kvKey, 'json')) ?? null;
  let bucket: Bucket;
  if (!existing || existing.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowSeconds * 1000 };
  } else {
    bucket = existing;
  }
  bucket.count += 1;
  const ttl = Math.max(60, Math.ceil((bucket.resetAt - now) / 1000));
  await kv.put(kvKey, JSON.stringify(bucket), { expirationTtl: ttl });
  const allowed = bucket.count <= limit;
  return {
    allowed,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: allowed ? 0 : Math.ceil((bucket.resetAt - now) / 1000),
    resetAt: bucket.resetAt,
  };
}

/** Read the counter without consuming a slot (used by the pre-draw quota check). */
export async function readRateLimit(kv: KVNamespace, key: string, limit: number, now = Date.now()): Promise<RateLimitResult> {
  const existing = (await kv.get<Bucket>(`rl:${key}`, 'json')) ?? null;
  const count = existing && existing.resetAt > now ? existing.count : 0;
  const resetAt = existing && existing.resetAt > now ? existing.resetAt : now;
  return {
    allowed: count < limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: count < limit ? 0 : Math.max(0, Math.ceil((resetAt - now) / 1000)),
    resetAt,
  };
}

export function secondsUntilUtcMidnight(now = new Date()): number {
  return 86_400 - (now.getUTCHours() * 3_600 + now.getUTCMinutes() * 60 + now.getUTCSeconds());
}

export function dailyDrawKey(ipHash: string, now = new Date()): string {
  return `draw:ip:${ipHash}:day:${now.toISOString().slice(0, 10)}`;
}

export const LIMITS = {
  drawPerIpPerMinute: 10,
  drawsPerIpPerDay: 10,
  drawPerTokenPerHour: 30,
  checkoutPerIpPerHour: 5,
  eventsPerIpPerMinute: 60,
} as const;
