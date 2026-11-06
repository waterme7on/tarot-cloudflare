export function json(data: unknown, init: ResponseInit = {}): Response {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  if (!headers.has('Cache-Control')) headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function error(status: number, code: string, message: string, extra: Record<string, unknown> = {}): Response {
  return json({ error: { code, message, ...extra } }, { status });
}

export const MAX_JSON_BODY = 8 * 1024;

export async function readJson<T>(request: Request, max = MAX_JSON_BODY): Promise<T | Response> {
  const ct = request.headers.get('content-type') ?? '';
  if (!ct.includes('application/json')) return error(415, 'unsupported_media_type', 'Send application/json');
  const len = Number(request.headers.get('content-length') ?? '0');
  if (len > max) return error(413, 'payload_too_large', `Body must be under ${max} bytes`);
  const text = await request.text();
  if (text.length > max) return error(413, 'payload_too_large', `Body must be under ${max} bytes`);
  try {
    return JSON.parse(text) as T;
  } catch {
    return error(400, 'invalid_json', 'Body is not valid JSON');
  }
}

export function isResponse(v: unknown): v is Response {
  return v instanceof Response;
}
