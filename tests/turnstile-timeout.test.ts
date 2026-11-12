import { describe, expect, it } from 'vitest';
import { verifyTurnstile } from '../src/lib/auth';

describe('turnstile verification deadline', () => {
  it('fails closed when siteverify never responds', async () => {
    const fetchImpl = (() => new Promise<Response>(() => {})) as typeof fetch;
    const started = Date.now();
    expect(await verifyTurnstile('secret', 'token', '203.0.113.9', { timeoutMs: 25, fetchImpl })).toBe(false);
    expect(Date.now() - started).toBeLessThan(1_000);
  });

  it('fails closed when the verification body never finishes', async () => {
    const fetchImpl = (async () => ({ ok: true, json: () => new Promise(() => {}) })) as unknown as typeof fetch;
    expect(await verifyTurnstile('secret', 'token', null, { timeoutMs: 25, fetchImpl })).toBe(false);
  });

  it('accepts only a successful siteverify payload', async () => {
    const okay = (async () => ({ ok: true, json: async () => ({ success: true }) })) as unknown as typeof fetch;
    const failed = (async () => ({ ok: true, json: async () => ({ success: false }) })) as unknown as typeof fetch;
    expect(await verifyTurnstile('secret', 'token', null, { fetchImpl: okay })).toBe(true);
    expect(await verifyTurnstile('secret', 'token', null, { fetchImpl: failed })).toBe(false);
  });

  it('keeps the local-development bypass', async () => {
    expect(await verifyTurnstile(undefined, undefined, null)).toBe(true);
    expect(await verifyTurnstile('secret', undefined, null)).toBe(false);
  });
});
