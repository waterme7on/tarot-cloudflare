import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const resultSource = readFileSync(new URL('../src/components/CardResult.tsx', import.meta.url), 'utf8');
const checkoutApi = readFileSync(new URL('../src/pages/api/v1/report/checkout.ts', import.meta.url), 'utf8');

describe('checkout Turnstile lifecycle', () => {
  it('mounts a fresh checkout widget and targets it for token, reset and cleanup', () => {
    expect(resultSource).toContain('checkoutWidgetRef');
    expect(resultSource).toContain('checkoutWidgetId');
    expect(resultSource).toContain('turnstile.render(checkoutWidgetRef.current');
    expect(resultSource).toContain('getResponse(checkoutWidgetId.current ?? undefined)');
    expect(resultSource).toContain('reset(checkoutWidgetId.current ?? undefined)');
    expect(resultSource).toContain('remove(checkoutWidgetId.current)');
    expect(resultSource).not.toContain('turnstile?.getResponse()');
  });

  it('renders the fresh widget inside the checkout offer', () => {
    expect(resultSource).toContain('className="report-check" ref={checkoutWidgetRef}');
    expect(resultSource).toContain("'refresh-expired': 'auto'");
  });

  it('keeps server-side Turnstile verification unchanged', () => {
    expect(checkoutApi).toContain('verifyTurnstile(env.TURNSTILE_SECRET_KEY, body.turnstileToken, ip)');
    expect(checkoutApi).toContain("error(403, 'turnstile_failed'");
  });
});
