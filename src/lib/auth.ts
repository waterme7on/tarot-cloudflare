const enc = new TextEncoder();

export function toHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function randomToken(prefix: string, bytes = 16): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return `${prefix}_${toHex(buf)}`;
}

export async function sha256Hex(input: string): Promise<string> {
  return toHex(await crypto.subtle.digest('SHA-256', enc.encode(input)));
}

export async function hashIp(ip: string, salt: string): Promise<string> {
  return sha256Hex(`${salt}:${ip}`);
}

export async function hmacHex(key: string, message: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return toHex(await crypto.subtle.sign('HMAC', k, enc.encode(message)));
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

// Short-lived signed URL for private R2 objects served through the Worker.
export async function signR2Path(key: string, expiresAt: number, signingKey: string): Promise<string> {
  const sig = await hmacHex(signingKey, `${key}:${expiresAt}`);
  return `/api/v1/files/${encodeURIComponent(key)}?exp=${expiresAt}&sig=${sig}`;
}

export async function verifyR2Signature(key: string, exp: string | null, sig: string | null, signingKey: string): Promise<boolean> {
  if (!exp || !sig) return false;
  const expiresAt = Number(exp);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  const expected = await hmacHex(signingKey, `${key}:${expiresAt}`);
  return timingSafeEqual(expected, sig);
}

export async function verifyTurnstile(
  secret: string | undefined,
  token: string | undefined,
  ip: string | null,
  options: { timeoutMs?: number; fetchImpl?: typeof fetch } = {},
): Promise<boolean> {
  if (!secret) return true; // local dev without Turnstile configured
  if (!token) return false;
  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set('remoteip', ip);
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  // Fail closed instead of holding the free-draw request open on a stalled verify.
  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('turnstile verify timeout'));
    }, options.timeoutMs ?? 5_000);
  });
  try {
    const res = await Promise.race([
      (options.fetchImpl ?? fetch)('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body,
        signal: controller.signal,
      }),
      deadline,
    ]);
    if (!res.ok) return false;
    const data = (await Promise.race([res.json(), deadline])) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

export function clientIp(request: Request): string | null {
  return request.headers.get('CF-Connecting-IP') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
}
