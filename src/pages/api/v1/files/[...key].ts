import type { APIRoute } from 'astro';
import { verifyR2Signature } from '@/lib/auth';
import { error } from '@/lib/http';

export const prerender = false;

// Serves private R2 objects (reports) via short-lived HMAC-signed paths. Share images are public.
export const GET: APIRoute = async ({ params, url, locals }) => {
  const env = locals.runtime.env;
  const key = decodeURIComponent(params.key ?? '');
  if (!key || key.includes('..')) return error(400, 'bad_key', 'Bad key');

  const isPublic = key.startsWith('share/');
  if (!isPublic) {
    const ok = await verifyR2Signature(key, url.searchParams.get('exp'), url.searchParams.get('sig'), env.TOKEN_SIGNING_KEY ?? 'dev-signing-key');
    if (!ok) return error(403, 'bad_signature', 'Link expired or invalid');
  }

  const obj = await env.MEDIA.get(key);
  if (!obj) return error(404, 'not_found', 'File not found');
  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('etag', obj.httpEtag);
  headers.set('Cache-Control', isPublic ? 'public, max-age=86400' : 'private, no-store');
  if (!isPublic) headers.set('Content-Disposition', 'inline');
  return new Response(obj.body, { headers });
};
