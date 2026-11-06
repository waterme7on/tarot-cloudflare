import type { EventName } from './schema';

export interface TrackInput {
  name: EventName;
  readingId?: string | null;
  route?: string | null;
  locale?: string | null;
  value?: number;
  meta?: Record<string, string | number | boolean | null | undefined>;
}

const BLOCKED_META_KEYS = new Set(['question', 'q', 'text', 'email', 'name', 'ip', 'birthday', 'dob']);

export function sanitizeMeta(meta: Record<string, unknown> | undefined): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!meta) return out;
  for (const [k, v] of Object.entries(meta)) {
    if (BLOCKED_META_KEYS.has(k.toLowerCase())) continue;
    if (typeof v === 'string') out[k] = v.slice(0, 120);
    else if (typeof v === 'number' || typeof v === 'boolean') out[k] = v;
  }
  return out;
}

export function track(env: Pick<Env, 'EVENTS'>, input: TrackInput): void {
  try {
    const meta = sanitizeMeta(input.meta);
    env.EVENTS?.writeDataPoint({
      indexes: [input.name],
      blobs: [input.name, input.route ?? '', input.locale ?? 'en', input.readingId ?? '', JSON.stringify(meta).slice(0, 1000)],
      doubles: [input.value ?? 1],
    });
  } catch {
    // Analytics must never break the request path.
  }
}
