/**
 * Markdown content negotiation for agents (Accept: text/markdown).
 *
 * The zone-level converter needs a paid plan, so the Worker converts HTML via
 * the Workers AI binding. Helpers stay free of bindings so they are unit tested.
 */

export const CONTENT_SIGNAL = 'ai-train=no, search=yes, ai-input=no';
export const MARKDOWN_MEDIA_TYPE = 'text/markdown; charset=utf-8';
const MAX_HTML_BYTES = 6_000_000;

export type MarkdownConverter = (html: string) => Promise<{ markdown: string; tokens?: number } | null>;

export type MarkdownAI = {
  toMarkdown: (
    input: { name: string; blob: Blob },
  ) => Promise<{ format?: string; data?: string; tokens?: number }> | Promise<Array<{ format?: string; data?: string; tokens?: number }>>;
};

export function acceptsMarkdown(accept: string | null): boolean {
  if (!accept) return false;
  return accept.split(',').some((part) => {
    const [media, ...params] = part.trim().toLowerCase().split(';');
    if (media.trim() !== 'text/markdown') return false;
    const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
    return !q || Number.parseFloat(q.slice(2)) > 0;
  });
}

/** HTML pages have no file extension; assets, API routes and discovery docs are skipped. */
export function isConvertiblePath(pathname: string): boolean {
  if (pathname.startsWith('/api/')) return false;
  if (pathname.startsWith('/.well-known/')) return false;
  if (pathname.startsWith('/_astro/')) return false;
  return !pathname.includes('.');
}

export async function markdownResponse(
  response: Response,
  convert: MarkdownConverter,
  headOnly = false,
): Promise<Response> {
  const contentType = response.headers.get('content-type') ?? '';
  if (response.status !== 200 || !contentType.includes('text/html')) return response;

  const html = await response.clone().text();
  if (html.length > MAX_HTML_BYTES) return response;

  let converted: { markdown: string; tokens?: number } | null = null;
  try {
    converted = await convert(html);
  } catch {
    return response;
  }
  if (!converted?.markdown) return response;

  const headers = new Headers(response.headers);
  for (const name of ['content-encoding', 'content-length', 'content-range', 'etag', 'last-modified', 'transfer-encoding']) {
    headers.delete(name);
  }
  headers.set('content-type', MARKDOWN_MEDIA_TYPE);
  headers.set('content-signal', CONTENT_SIGNAL);
  const vary = headers.get('vary');
  headers.set('vary', !vary || vary === '*' ? 'Accept' : `${vary}, Accept`);
  if (typeof converted.tokens === 'number') headers.set('x-markdown-tokens', String(converted.tokens));

  return new Response(headOnly ? null : converted.markdown, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
