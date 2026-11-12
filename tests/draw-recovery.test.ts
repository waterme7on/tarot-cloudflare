import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const ritual = readFileSync(new URL('../src/components/RitualDraw.tsx', import.meta.url), 'utf8');

describe('ritual draw recovery wiring', () => {
  it('creates the idempotency key inside the protected request block', () => {
    const tryBlock = ritual.indexOf('try {\n      // Stable for every retry');
    const key = ritual.indexOf('idempotency.current ??= newIdempotencyKey()');
    expect(tryBlock).toBeGreaterThan(-1);
    expect(key).toBeGreaterThan(tryBlock);
  });

  it('lets the user restart while a draw is loading', () => {
    expect(ritual).not.toContain('disabled={loading || stage === \'prepare\'}');
    expect(ritual).toContain("disabled={stage === 'prepare'}");
  });

  it('guards stale request cleanup behind the attempt sequence and its own timer', () => {
    expect(ritual).toContain('attemptSeq.current !== attempt');
    expect(ritual).toContain('attemptSeq.current === attempt');
    expect(ritual).toContain('slowTimer.current === slowTimerId');
  });

  it('uses an unambiguous draw label and a slow-network hint', () => {
    expect(ritual).toContain('Drawing your cards…');
    expect(ritual).not.toContain('Reading your cards…');
    expect(ritual).toContain('Restart is safe');
  });

  it('renders one alert inside the action bar, outside the clipped scroll scene', () => {
    expect(ritual.match(/role="alert"/g)).toHaveLength(1);
    expect(ritual.indexOf('role="alert"')).toBeGreaterThan(ritual.indexOf('className="ritual-actionbar"'));
  });

  it('keeps the action-bar alert readable at 12px or larger', () => {
    const css = readFileSync(new URL('../public/mobile-ritual.css', import.meta.url), 'utf8');
    expect(css).toMatch(/\.ritual-actionbar \.ritual-error\{[^}]*font-size:max\(12px,\.8rem\)/);
  });
});
