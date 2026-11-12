import type { APIRoute } from 'astro';
import { ALL_CARDS, getCard } from '@/data/cards';
import { drawCards, validDrawSlots } from '@/lib/draw';
import { buildFreeSummary } from '@/lib/interpretation';
import { checkRateLimit, LIMITS } from '@/lib/rate-limit';
import { clientIp, hashIp, randomToken, verifyTurnstile } from '@/lib/auth';
import { getReadingByIdempotency, insertReading } from '@/lib/db';
import { track } from '@/lib/events';
import { error, isResponse, json, readJson } from '@/lib/http';
import { isQuestionType, isSpread, type DrawRequest, type DrawResponse, type DrawnCard, type ReadingSummary } from '@/lib/schema';

export const prerender = false;

const UUID_RE = /^[0-9a-f-]{20,64}$/i;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = locals.runtime.env;
  const body = await readJson<DrawRequest>(request);
  if (isResponse(body)) return body;

  if (!isSpread(body.spread)) return error(400, 'invalid_spread', 'spread must be one-card, three-card or celtic-cross');
  if (!isQuestionType(body.questionType)) return error(400, 'invalid_question_type', 'questionType must be general, love, career, money or decision');
  if (typeof body.idempotencyKey !== 'string' || !UUID_RE.test(body.idempotencyKey)) return error(400, 'invalid_idempotency_key', 'idempotencyKey must be a UUID');
  if (body.slots !== undefined && !validDrawSlots(body.slots, body.spread === 'one-card' ? 1 : body.spread === 'three-card' ? 3 : 10)) {
    return error(400, 'invalid_slots', 'slots must be unique integer positions within 0–77, one per card');
  }
  const locale = typeof body.locale === 'string' && /^[a-z]{2}(-[a-z]{2})?$/i.test(body.locale) ? body.locale.toLowerCase() : 'en';

  const existing = await getReadingByIdempotency(env.DB, body.idempotencyKey);
  if (existing) return json(toResponse(existing.id, existing.public_token, existing.spread, existing.question_type, JSON.parse(existing.cards_json), JSON.parse(existing.summary_json), existing.created_at));

  const ip = clientIp(request);
  const ipHash = ip ? await hashIp(ip, env.IP_HASH_SALT ?? 'dev-salt') : null;

  if (ipHash) {
    const rl = await checkRateLimit(env.CACHE, `draw:ip:${ipHash}`, LIMITS.drawPerIpPerMinute, 60);
    if (!rl.allowed) return error(429, 'rate_limited', 'Too many draws. Take a breath and try again in a minute.', { retryAfterSeconds: rl.retryAfterSeconds });
  }

  const human = await verifyTurnstile(env.TURNSTILE_SECRET_KEY, body.turnstileToken, ip);
  if (!human) return error(403, 'turnstile_failed', 'Human verification failed. Reload and try again.');

  if (ipHash) {
    const now = new Date();
    const day = now.toISOString().slice(0, 10);
    const secondsToMidnight = 86_400 - (now.getUTCHours() * 3_600 + now.getUTCMinutes() * 60 + now.getUTCSeconds());
    const daily = await checkRateLimit(env.CACHE, `draw:ip:${ipHash}:day:${day}`, LIMITS.drawsPerIpPerDay, Math.max(60, secondsToMidnight));
    if (!daily.allowed) {
      return error(429, 'daily_limit', 'You have used your 3 free draws for today. Free draws reset after midnight UTC.', { retryAfterSeconds: daily.retryAfterSeconds });
    }
  }

  track(env, { name: 'draw_started', route: '/api/v1/draw', locale, meta: { spread: body.spread, questionType: body.questionType } });

  const cards = drawCards(ALL_CARDS, body.spread, undefined, body.slots);
  const summary = buildFreeSummary(cards, getCard, body.spread, body.questionType);
  const id = randomToken('rdg');
  const publicToken = randomToken('pub');

  await insertReading(env.DB, {
    id,
    publicToken,
    spread: body.spread,
    questionType: body.questionType,
    cards,
    summary,
    locale,
    ipHash,
    idempotencyKey: body.idempotencyKey,
    utm: null,
  });

  track(env, { name: 'draw_completed', readingId: id, route: '/api/v1/draw', locale, meta: { spread: body.spread, questionType: body.questionType, questionLength: body.questionLength ?? 0, interactivePick: !!body.slots } });

  return json(toResponse(id, publicToken, body.spread, body.questionType, cards, summary, new Date().toISOString()));
};

function toResponse(
  readingId: string,
  publicToken: string,
  spread: DrawResponse['spread'],
  questionType: DrawResponse['questionType'],
  cards: DrawnCard[],
  summary: ReadingSummary,
  createdAt: string,
): DrawResponse {
  return {
    readingId,
    publicToken,
    spread,
    questionType,
    cards,
    headline: summary.headline,
    summary: summary.summary,
    nextAction: summary.nextAction,
    limitation: summary.limitation,
    yesNo: summary.yesNo,
    createdAt,
  };
}
