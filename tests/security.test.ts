import { describe, expect, it } from 'vitest';
import { verifyWaffoSignature } from '../src/lib/waffo';
import { hmacHex, signR2Path, verifyR2Signature, timingSafeEqual } from '../src/lib/auth';
import { LIMITS, checkRateLimit } from '../src/lib/rate-limit';
import { readFileSync } from 'node:fs';
import { sanitizeMeta } from '../src/lib/events';

describe('waffo webhook signature', () => {
  it('accepts a valid RSA signature and rejects tampering', async () => {
    const kp = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
    const spki = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.exportKey('spki', kp.publicKey))));
    const payload = '{"id":"PAY_1","eventType":"order.completed","mode":"prod","data":{}}';
    const t = String(Date.now());
    const sig = btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5', kp.privateKey, new TextEncoder().encode(`${t}.${payload}`)))));
    expect(await verifyWaffoSignature(payload, `t=${t},v1=${sig}`, spki)).toBe(true);
    expect(await verifyWaffoSignature(payload + ' ', `t=${t},v1=${sig}`, spki)).toBe(false);
    expect(await verifyWaffoSignature(payload, `t=${Number(t) - 60 * 60 * 1000},v1=${sig}`, spki)).toBe(false);
    expect(await verifyWaffoSignature(payload, null, spki)).toBe(false);
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

describe('free draw allowance', () => {
  it('caps free draws at three per IP per day', () => {
    expect(LIMITS.drawsPerIpPerDay).toBe(3);
    const api = readFileSync(new URL('../src/pages/api/v1/draw.ts', import.meta.url), 'utf8');
    expect(api).toContain('drawsPerIpPerDay');
    expect(api).toContain('daily_limit');
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
