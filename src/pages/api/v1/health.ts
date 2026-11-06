import type { APIRoute } from 'astro';
import { DECK_SIZE } from '@/data/cards';
import { json } from '@/lib/http';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const env = locals.runtime.env;
  let db = 'ok';
  try {
    await env.DB.prepare('SELECT 1').first();
  } catch {
    db = 'error';
  }
  return json({ status: db === 'ok' ? 'ok' : 'degraded', deck: DECK_SIZE, db, environment: env.ENVIRONMENT, time: new Date().toISOString() }, { status: db === 'ok' ? 200 : 503 });
};
