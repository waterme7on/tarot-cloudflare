import { defineMiddleware } from 'astro:middleware';

const NOINDEX_PREFIXES = ['/reading/', '/report/', '/admin', '/api/'];

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.requestId = crypto.randomUUID();
  if (context.url.protocol === 'http:' || context.url.hostname === 'www.randomtarot.site') {
    const url = new URL(context.url);
    url.protocol = 'https:';
    if (context.url.hostname === 'www.randomtarot.site') url.hostname = 'randomtarot.site';
    return context.redirect(url.toString(), 301);
  }

  const path = context.url.pathname;
  const cleanPath = path.replace(/\/+$/, '');
  const legacyTargets: Record<string, string> = {
    '/tarot-card-meanings': '/cards/',
    '/one-card-tarot': '/spreads/one-card/',
    '/three-card-tarot': '/spreads/three-card/',
    '/love-tarot': '/questions/love/',
  };
  const legacyTarget = legacyTargets[cleanPath];
  if (legacyTarget) return context.redirect(`${legacyTarget}${context.url.search}`, 301);

  if (path !== '/' && !path.endsWith('/') && !path.startsWith('/api/') && !path.includes('.')) {
    const url = new URL(context.url);
    url.pathname = `${path}/`;
    return context.redirect(url.toString(), 308);
  }

  if (path.startsWith('/admin')) {
    const denied = await requireAccess(context.request, context.locals.runtime?.env);
    if (denied) return denied;
  }

  const response = await next();
  const h = response.headers;
  h.set('X-Request-Id', context.locals.requestId);
  h.set('X-Content-Type-Options', 'nosniff');
  h.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  h.set('X-Frame-Options', 'DENY');
  h.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  h.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  if (!h.has('Content-Security-Policy')) {
    h.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com https://analytics.yololab.cc; frame-src https://challenges.cloudflare.com; connect-src 'self' https://cloudflareinsights.com https://analytics.yololab.cc; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; font-src 'self'; form-action 'self' https://pancake.waffo.ai; base-uri 'self'; object-src 'none'",
    );
  }
  if (context.locals.runtime?.env?.ENVIRONMENT === 'preview') h.set('X-Robots-Tag', 'noindex, nofollow');
  else if (NOINDEX_PREFIXES.some((p) => path.startsWith(p))) h.set('X-Robots-Tag', 'noindex, follow');
  return response;
});

interface AccessJwk {
  kid: string;
  kty: string;
  n: string;
  e: string;
  alg: string;
}

async function requireAccess(request: Request, env: Env | undefined): Promise<Response | null> {
  if (!env || env.ENVIRONMENT === 'local') return null;
  const team = env.CF_ACCESS_TEAM_DOMAIN;
  const aud = env.CF_ACCESS_AUD;
  const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
  if (!team || !aud || !jwt) return new Response('Forbidden', { status: 403 });
  try {
    const [h, p, s] = jwt.split('.');
    if (!h || !p || !s) throw new Error('malformed');
    const header = JSON.parse(atob(h.replace(/-/g, '+').replace(/_/g, '/'))) as { kid: string; alg: string };
    const payload = JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/'))) as { aud: string | string[]; exp: number; iss: string };
    const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!auds.includes(aud) || payload.exp * 1000 < Date.now() || payload.iss !== `https://${team}`) throw new Error('claims');
    const certs = (await (await fetch(`https://${team}/cdn-cgi/access/certs`, { cf: { cacheTtl: 3600 } } as RequestInit)).json()) as { keys: AccessJwk[] };
    const jwk = certs.keys.find((k) => k.kid === header.kid);
    if (!jwk) throw new Error('kid');
    const key = await crypto.subtle.importKey('jwk', jwk, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
    const sig = Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', key, sig, new TextEncoder().encode(`${h}.${p}`));
    if (!ok) throw new Error('sig');
    return null;
  } catch {
    return new Response('Forbidden', { status: 403 });
  }
}
