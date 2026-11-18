import { describe, expect, it } from 'vitest';
import { acceptsMarkdown, isConvertiblePath, markdownResponse } from '../src/lib/agent-markdown';

const htmlResponse = () =>
  new Response('<html><body><h1>Hi</h1></body></html>', {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', etag: '"abc"', vary: 'rsc', 'cache-control': 'private, no-cache' },
  });

describe('acceptsMarkdown', () => {
  it('only treats text/markdown with q>0 as markdown', () => {
    expect(acceptsMarkdown(null)).toBe(false);
    expect(acceptsMarkdown('text/html')).toBe(false);
    expect(acceptsMarkdown('text/markdown')).toBe(true);
    expect(acceptsMarkdown('text/html, text/markdown;q=0.9')).toBe(true);
    expect(acceptsMarkdown('text/markdown;q=0')).toBe(false);
  });
});

describe('isConvertiblePath', () => {
  it('converts extensionless pages and skips assets, API and discovery docs', () => {
    expect(isConvertiblePath('/')).toBe(true);
    expect(isConvertiblePath('/cards/the-tower/')).toBe(true);
    expect(isConvertiblePath('/api/v1/draw')).toBe(false);
    expect(isConvertiblePath('/.well-known/openapi.json')).toBe(false);
    expect(isConvertiblePath('/_astro/page.js')).toBe(false);
    expect(isConvertiblePath('/robots.txt')).toBe(false);
  });
});

describe('markdownResponse', () => {
  it('swaps the body and agent headers, dropping stale representation headers', async () => {
    const res = await markdownResponse(htmlResponse(), async () => ({ markdown: '# Hi\n', tokens: 2 }));
    expect(res.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(res.headers.get('x-markdown-tokens')).toBe('2');
    expect(res.headers.get('content-signal')).toBe('ai-train=no, search=yes, ai-input=no');
    expect(res.headers.get('vary')).toBe('rsc, Accept');
    expect(res.headers.get('etag')).toBeNull();
    expect(await res.text()).toBe('# Hi\n');
  });

  it('returns no body for HEAD but keeps the markdown headers', async () => {
    const res = await markdownResponse(htmlResponse(), async () => ({ markdown: '# Hi\n' }), true);
    expect(res.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(await res.text()).toBe('');
  });

  it('falls back to HTML when conversion fails or returns nothing', async () => {
    const failed = await markdownResponse(htmlResponse(), async () => {
      throw new Error('no binding');
    });
    expect(failed.headers.get('content-type')).toBe('text/html; charset=utf-8');
    expect(await failed.text()).toContain('<h1>Hi</h1>');

    const empty = await markdownResponse(htmlResponse(), async () => null);
    expect(empty.headers.get('content-type')).toBe('text/html; charset=utf-8');
  });

  it('never converts non-HTML or non-200 responses', async () => {
    const json = new Response('{}', { headers: { 'content-type': 'application/json' } });
    expect(await markdownResponse(json, async () => ({ markdown: 'x' }))).toBe(json);

    const missing = new Response('nope', { status: 404, headers: { 'content-type': 'text/html' } });
    expect(await markdownResponse(missing, async () => ({ markdown: 'x' }))).toBe(missing);
  });
});
