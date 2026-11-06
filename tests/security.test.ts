import { describe, expect, it } from 'vitest';
import { verifyStripeSignature } from '../src/lib/stripe';
import { hmacHex, signR2Path, verifyR2Signature, timingSafeEqual } from '../src/lib/auth';
import { checkRateLimit } from '../src/lib/rate-limit';
import { sanitizeMeta } from '../src/lib/events';

describe('stripe signature', () => {
  it('accepts a valid signature and rejects tampering', async () => {
    const secret = 'whsec_test';
    const payload = '{"id":"evt_1","type":"checkout.session.completed"}';
    const t = Math.floor(Date.now() / 1000);
    const sig = await hmacHex(secret, `${t}.${payload}`);
    expect(await verifyStripeSignature(payload, `t=${t},v1=${sig}`, secret)).toBe(true);
    expect(await verifyStripeSignature(payload + ' ', `t=${t},v1=${sig}`, secret)).toBe(false);
    expect(await verifyStripeSignature(payload, `t=${t - 1000},v1=${sig}`, secret)).toBe(false);
    expect(await verifyStripeSignature(payload, null, secret)).toBe(false);
  });
});

describe('signed R2 paths', () => {
  it('round-trips and expires', async () => {
    const key = 'reports/rep_abc.json';
    const path = await signR2Path(key, Date.now() + 60_000, 'k');
    const u = new URL(path, 'https://x');
    expect(await verifyR2Signature(key, u.searchParams.get('exp'), u.searchParams.get('sig'), 'k')).toBe(true);
    expect(await verifyR2Signature(key, u.searchParams.get('exp'), u.searchParams.get('sig'), 'other')).toBe(false);
    const expired = await signR2Path(key, Date.now() - 1, 'k');
    const e = new URL(expired, 'https://x');
    expect(await verifyR2Signature(key, e.searchParams.get('exp'), e.searchParams.get('sig'), 'k')).toBe(false);
  });
  it('timingSafeEqual', () => {
    expect(timingSafeEqual('abc', 'abc')).toBe(true);
    expect(timingSafeEqual('abc', 'abd')).toBe(false);
    expect(timingSafeEqual('abc', 'ab')).toBe(false);
  });
});

function fakeKv(): KVNamespace {
  const store = new Map<string, string>();
  return {
    get: async (k: string, type?: string) => {
      const v = store.get(k);
      if (v === undefined) return null;
      return type === 'json' ? JSON.parse(v) : v;
    },
    put: async (k: string, v: string) => {
      store.set(k, v);
    },
  } as unknown as KVNamespace;
}

describe('rate limit', () => {
  it('blocks after the limit within a window', async () => {
    const kv = fakeKv();
    for (let i = 0; i < 3; i++) expect((await checkRateLimit(kv, 'x', 3, 60, 1000)).allowed).toBe(true);
    const blocked = await checkRateLimit(kv, 'x', 3, 60, 1000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect((await checkRateLimit(kv, 'x', 3, 60, 1000 + 61_000)).allowed).toBe(true);
  });
});

describe('event meta sanitisation', () => {
  it('drops sensitive keys and truncates', () => {
    const out = sanitizeMeta({ question: 'secret', spread: 'one-card', n: 1, long: 'x'.repeat(500), obj: { a: 1 } });
    expect(out).not.toHaveProperty('question');
    expect(out).not.toHaveProperty('obj');
    expect(out.spread).toBe('one-card');
    expect((out.long as string).length).toBe(120);
  });
});
