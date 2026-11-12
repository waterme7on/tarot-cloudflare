import type { DrawRequest, DrawResponse } from './schema';

export const DRAW_TIMEOUT_MS = 15_000;
export const DRAW_SLOW_HINT_MS = 8_000;

export type DrawFailureKind = 'timeout' | 'network' | 'http' | 'cancelled';

export class DrawRequestError extends Error {
  constructor(
    message: string,
    readonly kind: DrawFailureKind,
    readonly code?: string,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'DrawRequestError';
  }
}

/**
 * Idempotency key for retries. Older Safari exposes crypto without randomUUID,
 * and an insecure context may expose no usable crypto at all; neither case may
 * leave the draw spinner stuck.
 */
export function newIdempotencyKey(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  if (c && typeof c.getRandomValues === 'function') {
    const bytes = c.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6]! & 0x0f) | 0x40;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
  const time = Date.now().toString(16).padStart(12, '0');
  let random = '';
  for (let i = 0; i < 20; i++) random += Math.floor(Math.random() * 16).toString(16);
  return `${time.slice(0, 8)}-${time.slice(8, 12)}-4${random.slice(0, 3)}-a${random.slice(3, 6)}-${random.slice(6, 18)}`;
}

interface DrawErrorBody {
  error?: { code?: string; message?: string; retryAfterSeconds?: number };
}

interface RequestDrawOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
}

/**
 * POST /api/v1/draw with a deadline. A stalled connection must never leave the
 * free draw spinner running forever; callers retry with the same idempotencyKey
 * so a reading that the server already saved is returned instead of redrawn.
 */
/** Download/parse the Three.js module while the draw request is in flight. */
function warmHoloRuntime(): void {
  if (typeof window === 'undefined') return;
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ((nav.hardwareConcurrency || 8) <= 4 || (nav.deviceMemory || 8) <= 4) return;
  void import('three').catch(() => {});
}

export async function requestDraw(body: DrawRequest, options: RequestDrawOptions = {}): Promise<DrawResponse> {
  warmHoloRuntime();
  const timeoutMs = options.timeoutMs ?? DRAW_TIMEOUT_MS;
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  let onAbort = () => controller.abort();
  const cancelled = new Promise<never>((_, reject) => {
    onAbort = () => {
      controller.abort();
      reject(new Error('draw cancelled'));
    };
    if (options.signal) {
      if (options.signal.aborted) onAbort();
      else options.signal.addEventListener('abort', onAbort, { once: true });
    }
  });

  let timedOut = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
      reject(new Error('draw deadline exceeded'));
    }, timeoutMs);
  });

  try {
    const response = await Promise.race([
      fetchImpl('/api/v1/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify(body),
      }),
      deadline,
      cancelled,
    ]);
    const data = (await Promise.race([response.json().catch(() => null), deadline, cancelled])) as (DrawResponse & DrawErrorBody) | null;
    if (!data || !response.ok || data.error) {
      throw new DrawRequestError(
        data?.error?.message ?? 'The draw could not load. Try again.',
        'http',
        data?.error?.code,
        data?.error?.retryAfterSeconds,
      );
    }
    return data;
  } catch (err) {
    if (err instanceof DrawRequestError) throw err;
    if (timedOut) {
      throw new DrawRequestError(
        'The draw took too long. Your cards may already be saved — tap Try again to recover the same selection.',
        'timeout',
      );
    }
    if (options.signal?.aborted) throw new DrawRequestError('Draw cancelled.', 'cancelled');
    throw new DrawRequestError('Connection interrupted. Tap Try again to recover the same selection.', 'network');
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', onAbort);
  }
}
