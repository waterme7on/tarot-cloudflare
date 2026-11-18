import { describe, expect, it } from 'vitest';
import {
  API_CATALOG_MEDIA_TYPE,
  API_CATALOG_PATH,
  AUTH_MD_PATH,
  OPENAPI_MEDIA_TYPE,
  OPENAPI_PATH,
  agentDocument,
  buildApiCatalog,
  buildAuthMd,
  buildOpenApi,
  homeLinkHeaders,
} from '../src/lib/agent-discovery';

const SITE = 'https://randomtarot.site';

describe('api catalog', () => {
  it('points at the OpenAPI description and the auth doc', () => {
    const catalog = buildApiCatalog(SITE);
    expect(catalog.linkset).toHaveLength(1);
    expect(catalog.linkset[0].anchor).toBe(`${SITE}/`);
    expect(catalog.linkset[0]['service-desc'][0]).toEqual({ href: `${SITE}${OPENAPI_PATH}`, type: OPENAPI_MEDIA_TYPE });
    expect(catalog.linkset[0]['service-doc'][0].href).toBe(`${SITE}${AUTH_MD_PATH}`);
    expect(API_CATALOG_MEDIA_TYPE).toMatch(/^application\/linkset\+json/);
    expect(API_CATALOG_MEDIA_TYPE).toContain('rfc9727');
  });
});

describe('openapi', () => {
  it('describes only routes the site really serves', () => {
    const spec = buildOpenApi(SITE);
    expect(spec.openapi).toBe('3.1.0');
    expect(Object.keys(spec.paths)).toEqual(
      expect.arrayContaining(['/', '/cards/{card}/', '/spreads/{spread}/', '/questions/{question}/', '/llms.txt', '/sitemap-index.xml', '/robots.txt']),
    );
    expect(spec.servers[0].url).toBe(SITE);
    expect(OPENAPI_MEDIA_TYPE).toBe('application/vnd.oai.openapi+json');
  });
});

describe('auth.md', () => {
  it('is self-contained and states that no agent registration exists', () => {
    const doc = buildAuthMd(SITE);
    expect(doc.startsWith('# auth.md')).toBe(true);
    expect(doc).toContain(`${SITE}${API_CATALOG_PATH}`);
    expect(doc).toContain(`${SITE}${OPENAPI_PATH}`);
    expect(doc).toContain('No agent registration exists');
    expect(doc).toContain('Content-Signal');
    expect(doc).toContain('support@randomtarot.site');
  });
});

describe('homepage Link headers', () => {
  it('advertises the four registered relation types', () => {
    const header = homeLinkHeaders(SITE);
    for (const rel of ['rel="api-catalog"', 'rel="service-desc"', 'rel="service-doc"', 'rel="describedby"']) {
      expect(header).toContain(rel);
    }
  });
});

describe('agentDocument', () => {
  it('serves the three discovery documents with their exact media types', () => {
    expect(agentDocument(API_CATALOG_PATH, SITE)?.headers.get('content-type')).toBe(API_CATALOG_MEDIA_TYPE);
    expect(agentDocument(OPENAPI_PATH, SITE)?.headers.get('content-type')).toBe(OPENAPI_MEDIA_TYPE);
    expect(agentDocument(AUTH_MD_PATH, SITE)?.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
  });

  it('leaves app routes to Astro', () => {
    expect(agentDocument('/', SITE)).toBeNull();
    expect(agentDocument('/cards/the-tower/', SITE)).toBeNull();
    expect(agentDocument('/llms.txt', SITE)).toBeNull();
  });
});
