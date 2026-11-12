import { afterEach, describe, expect, it, vi } from 'vitest';
import { DrawRequestError, newIdempotencyKey, requestDraw } from '../src/lib/draw-client';
import type { DrawRequest, DrawResponse } from '../src/lib/schema';

const body: DrawRequest = {
  spread: 'one-card',
  questionType: 'general',
  locale: 'en',
  slots: [4],
  idempotencyKey: '0f0e0d0c-0b0a-4908-8706-050403020100',
};

const ok: DrawResponse = {
  readingId: 'rdg_1',
  publicToken: 'pub_1',
  spread: 'one-card',
  questionType: 'general',
  cards: [],
  headline: 'x',
  summary: 'x',
  nextAction: 'x',
  limitation: 'x',
  createdAt: '2026-11-12T00:00:00.000Z',
};

afterEach(() => vi.unstubAllGlobals());

describe('bounded draw requests', () => {
  it('aborts a hung fetch instead of leaving the spinner forever', async () => {
    const fetchImpl = (() => new Promise<Response>(() => {})) as typeof fetch;
    await expect(requestDraw(body, { timeoutMs: 25, fetchImpl })).rejects.toMatchObject({
      name: 'DrawRequestError',
      kind: 'timeout',
    });
  });

  it('also bounds a response whose body never finishes', async () => {
    const fetchImpl = (async () => ({ ok: true, json: () => new Promise<unknown>(() => {}) })) as unknown as typeof fetch;
    const error = await requestDraw(body, { timeoutMs: 25, fetchImpl }).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(DrawRequestError);
    expect((error as DrawRequestError).kind).toBe('timeout');
    expect((error as DrawRequestError).message).toContain('Try again');
  });

  it('keeps the caller idempotency key unchanged so a retry recovers the same draw', async () => {
    const seen: DrawRequest[] = [];
    const fetchImpl = (async (_url: string, init: RequestInit) => {
      seen.push(JSON.parse(String(init.body)) as DrawRequest);
      return { ok: true, json: async () => ok } as Response;
    }) as unknown as typeof fetch;
    await requestDraw(body, { fetchImpl });
    await requestDraw(body, { fetchImpl });
    expect(seen.map((b) => b.idempotencyKey)).toEqual([body.idempotencyKey, body.idempotencyKey]);
  });

  it('turns a cancelled reset into a distinct non-error outcome', async () => {
    const controller = new AbortController();
    const fetchImpl = (() => new Promise<Response>(() => {})) as typeof fetch;
    const pending = requestDraw(body, { timeoutMs: 5_000, signal: controller.signal, fetchImpl });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ kind: 'cancelled' });
  });

  it('surfaces rate-limit codes and messages for retry UX', async () => {
    const fetchImpl = (async () => ({
      ok: false,
      json: async () => ({ error: { code: 'daily_limit', message: 'Three draws used', retryAfterSeconds: 900 } }),
    })) as unknown as typeof fetch;
    await expect(requestDraw(body, { fetchImpl })).rejects.toMatchObject({
      kind: 'http',
      code: 'daily_limit',
      retryAfterSeconds: 900,
    });
  });
});

describe('idempotency key generation', () => {
  it('uses randomUUID when available', () => {
    const key = newIdempotencyKey();
    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it('falls back when Safari exposes crypto without randomUUID', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (array: Uint8Array) => {
        for (let i = 0; i < array.length; i++) array[i] = i * 7 + 1;
        return array;
      },
    });
    expect(newIdempotencyKey()).toMatch(/^[0-9a-f-]{20,64}$/);
  });

  it('never throws when no crypto API is usable', () => {
    vi.stubGlobal('crypto', undefined);
    expect(newIdempotencyKey()).toMatch(/^[0-9a-f-]{20,64}$/);
  });
});
