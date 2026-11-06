import type { APIRoute } from 'astro';
import { getReadingByToken } from '@/lib/db';
import { error } from '@/lib/http';
import { renderShareSvg } from '@/lib/share-image';
import type { DrawnCard } from '@/lib/schema';

export const prerender = false;

// Share image: served from R2 if the queue already rendered it, otherwise rendered on the fly and cached.
export const GET: APIRoute = async ({ params, locals }) => {
  const env = locals.runtime.env;
  const token = params.token ?? '';
  if (!/^pub_[0-9a-f]{32}$/.test(token)) return error(400, 'invalid_token', 'Bad token');
  const key = `share/${token}.svg`;
  const cached = await env.MEDIA.get(key);
  if (cached) return new Response(cached.body, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' } });

  const reading = await getReadingByToken(env.DB, token);
  if (!reading) return error(404, 'not_found', 'Reading not found');
  const summary = JSON.parse(reading.summary_json) as { headline: string };
  const svg = renderShareSvg({ cards: JSON.parse(reading.cards_json) as DrawnCard[], headline: summary.headline, siteName: new URL(env.SITE_URL).host });
  await env.MEDIA.put(key, svg, { httpMetadata: { contentType: 'image/svg+xml' } });
  return new Response(svg, { headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' } });
};
