import { describe, expect, it } from 'vitest';
import { POST } from '../src/pages/api/v1/draw';

function fakeD1(): D1Database {
  return {
    prepare: () => ({
      bind: () => ({
        first: async () => null,
        run: async () => ({ meta: { changes: 1 } }),
      }),
    }),
  } as unknown as D1Database;
}

function fakeKv(): KVNamespace {
  return {
    get: async () => null,
    put: async () => undefined,
  } as unknown as KVNamespace;
}

describe('free draw independence', () => {
  it('draws and persists a reading without AI, queue or payment bindings', async () => {
    const env = {
      DB: fakeD1(),
      CACHE: fakeKv(),
      EVENTS: { writeDataPoint: () => undefined },
      IP_HASH_SALT: 'test-salt',
      // Deliberately no AI, REPORT_QUEUE, REPORT_WORKFLOW, WAFFO_* or price vars.
    };
    expect('AI' in env).toBe(false);
    expect('REPORT_QUEUE' in env).toBe(false);

    const response = await POST({
      request: new Request('https://randomtarot.site/api/v1/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.9' },
        body: JSON.stringify({
          spread: 'one-card',
          questionType: 'general',
          locale: 'en',
          slots: [4],
          idempotencyKey: '0f0e0d0c-0b0a-4908-8706-050403020100',
          questionLength: 0,
        }),
      }),
      locals: { runtime: { env } },
    } as never);

    expect(response.status).toBe(200);
    const data = (await response.json()) as { cards: { position: number }[]; publicToken: string };
    expect(data.cards).toHaveLength(1);
    expect(data.cards[0]!.position).toBe(1);
    expect(data.publicToken).toMatch(/^pub_[0-9a-f]{32}$/);
  });

  it('keeps the draw route independent of Turnstile when no secret is configured', async () => {
    const env = { DB: fakeD1(), CACHE: fakeKv(), EVENTS: { writeDataPoint: () => undefined } };
    const response = await POST({
      request: new Request('https://randomtarot.site/api/v1/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spread: 'one-card',
          questionType: 'love',
          idempotencyKey: '1f0e0d0c-0b0a-4908-8706-050403020100',
          slots: [9],
        }),
      }),
      locals: { runtime: { env } },
    } as never);
    expect(response.status).toBe(200);
  });
});
