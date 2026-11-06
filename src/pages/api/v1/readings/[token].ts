import type { APIRoute } from 'astro';
import { getReadingByToken } from '@/lib/db';
import { error, json } from '@/lib/http';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const token = params.token ?? '';
  if (!/^pub_[0-9a-f]{32}$/.test(token)) return error(400, 'invalid_token', 'Bad token');
  const row = await getReadingByToken(locals.runtime.env.DB, token);
  if (!row) return error(404, 'not_found', 'Reading not found or expired');
  const summary = JSON.parse(row.summary_json);
  return json({
    publicToken: row.public_token,
    spread: row.spread,
    questionType: row.question_type,
    cards: JSON.parse(row.cards_json),
    headline: summary.headline,
    summary: summary.summary,
    nextAction: summary.nextAction,
    limitation: summary.limitation,
    yesNo: summary.yesNo,
    createdAt: row.created_at,
  });
};
