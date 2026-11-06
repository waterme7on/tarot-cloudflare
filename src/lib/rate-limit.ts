export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
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
  };
}

export const LIMITS = {
  drawPerIpPerMinute: 10,
  drawPerTokenPerHour: 30,
  checkoutPerIpPerHour: 5,
  eventsPerIpPerMinute: 60,
} as const;
