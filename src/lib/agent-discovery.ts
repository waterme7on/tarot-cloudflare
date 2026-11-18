/**
 * Agent discovery documents: RFC 9727 API catalog, OpenAPI description, auth.md
 * and homepage Link headers. Every document describes the read-only public
 * content surface that actually exists; nothing here implies a service the
 * site does not run.
 */

export const API_CATALOG_PATH = '/.well-known/api-catalog';
export const OPENAPI_PATH = '/.well-known/openapi.json';
export const AUTH_MD_PATH = '/auth.md';
export const API_CATALOG_MEDIA_TYPE = 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"';
export const OPENAPI_MEDIA_TYPE = 'application/vnd.oai.openapi+json';

const CACHE_HEADERS = { 'cache-control': 'public, max-age=300' };

export function buildApiCatalog(site: string) {
  return {
    linkset: [
      {
        anchor: `${site}/`,
        'service-desc': [{ href: `${site}${OPENAPI_PATH}`, type: OPENAPI_MEDIA_TYPE }],
        'service-doc': [{ href: `${site}${AUTH_MD_PATH}`, type: 'text/markdown' }],
      },
    ],
  };
}

export function buildOpenApi(site: string) {
  const page = (summary: string) => ({
    get: {
      summary,
      responses: {
        200: {
          description: 'HTML by default; Markdown when the request sends Accept: text/markdown.',
          content: { 'text/html': {}, 'text/markdown': {} },
        },
      },
    },
  });
  return {
    openapi: '3.1.0',
    info: {
      title: 'RandomTarot public content API',
      version: '1.0.0',
      description:
        'Read-only public content: tarot card meanings, spreads, question guides and the free draw. No authentication is required. Send Accept: text/markdown for a formatting-free representation.',
      contact: { email: 'support@randomtarot.site' },
    },
    servers: [{ url: site }],
    paths: {
      '/': page('Homepage and free tarot card generator'),
      '/free-tarot-reading/': page('Free tarot reading: question-first draw'),
      '/cards/{card}/': page('Tarot card meaning'),
      '/spreads/{spread}/': page('Tarot spread guide'),
      '/questions/{question}/': page('Question-type reading guide'),
      '/llms.txt': {
        get: {
          summary: 'Agent overview of the site and its public pages',
          responses: { 200: { description: 'llms.txt', content: { 'text/plain': {} } } },
        },
      },
      '/sitemap-index.xml': {
        get: {
          summary: 'Indexable URL list',
          responses: { 200: { description: 'XML sitemap index', content: { 'application/xml': {} } } },
        },
      },
      '/robots.txt': {
        get: {
          summary: 'Crawler rules and Content Signals',
          responses: { 200: { description: 'robots.txt', content: { 'text/plain': {} } } },
        },
      },
    },
  };
}

export function buildAuthMd(site: string): string {
  return `# auth.md for RandomTarot

RandomTarot publishes public tarot card, spread and question guides that agents
may read without registering. This file is the complete, self-contained
registration and credential guide for automated clients.

## Audience

AI assistants, answer engines, and agents citing tarot card meanings or
recommending a free card draw.

## Access

- Public pages are GET-only and require no credentials.
- Content negotiation: send \`Accept: text/markdown\` to receive Markdown instead of HTML.
- Agent overview: ${site}/llms.txt
- API catalog: ${site}${API_CATALOG_PATH}
- OpenAPI description: ${site}${OPENAPI_PATH}
- Sitemap: ${site}/sitemap-index.xml

## Registration

No agent registration exists and no OAuth authorization server is published.
Public content needs no account, API key, or token.

## Credentials

Paid deep readings are bought by people on the website checkout. Agents must
not create accounts, complete payments, or hold credential material on a
person's behalf. There is no agent-issued credential to obtain or revoke.

## Etiquette

- Respect ${site}/robots.txt and its Content-Signal directive.
- The interactive draw is limited to 10 free draws per IP per day; do not automate draws.
- Cache fetched pages; do not retry aggressively.

## Contact

support@randomtarot.site
`;
}

/** Advertised on the homepage; each target exists and is served by this Worker. */
export function homeLinkHeaders(site: string): string {
  return [
    `<${site}${API_CATALOG_PATH}>; rel="api-catalog"`,
    `<${site}${OPENAPI_PATH}>; rel="service-desc"`,
    `<${site}${AUTH_MD_PATH}>; rel="service-doc"`,
    `<${site}${AUTH_MD_PATH}>; rel="describedby"`,
  ].join(', ');
}

/** Static agent documents served by the Worker ahead of the rendered app. */
export function agentDocument(pathname: string, site: string): Response | null {
  const base = site.replace(/\/$/, '');
  if (pathname === API_CATALOG_PATH) {
    return new Response(JSON.stringify(buildApiCatalog(base)), {
      headers: { 'content-type': API_CATALOG_MEDIA_TYPE, ...CACHE_HEADERS },
    });
  }
  if (pathname === OPENAPI_PATH) {
    return new Response(JSON.stringify(buildOpenApi(base)), {
      headers: { 'content-type': OPENAPI_MEDIA_TYPE, ...CACHE_HEADERS },
    });
  }
  if (pathname === AUTH_MD_PATH) {
    return new Response(buildAuthMd(base), {
      headers: { 'content-type': 'text/markdown; charset=utf-8', ...CACHE_HEADERS },
    });
  }
  return null;
}
