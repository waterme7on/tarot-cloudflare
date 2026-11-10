import { readFileSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import RitualDraw from '../src/components/RitualDraw';
import { CardResult } from '../src/components/CardResult';
import type { DrawResponse } from '../src/lib/schema';

const reading: DrawResponse = {
  readingId: 'rdg_mobile', publicToken: 'pub_mobile', spread: 'three-card', questionType: 'general',
  cards: ['The Star', 'The Sun', 'The Moon'].map((name, index) => ({
    name, slug: ['the-star', 'the-sun', 'the-moon'][index]!, position: index + 1,
    positionLabel: ['Past', 'Present', 'Future'][index]!,
    orientation: index === 0 ? 'reversed' as const : 'upright' as const,
    keywords: ['reflection'], summary: 'A little space to reflect.',
  })),
  headline: 'Three cards', summary: 'Consider what has changed.', nextAction: 'Pause before deciding.',
  limitation: 'For entertainment and self-reflection only.', createdAt: '2026-11-09T00:00:00Z',
};

describe('mobile-first tarot ritual', () => {
  it('renders a complete game entry with a usable leave action and accessible topic choices', () => {
    const html = renderToStaticMarkup(createElement(RitualDraw, { defaultSpread: 'three-card' }));
    expect(html).toContain('ritual-topbar');
    expect(html).toContain('aria-label="Exit reading and browse the deck"');
    expect(html).toContain('href="/cards/"');
    expect(html).toContain('Continue to the deck');
    expect(html).toContain('aria-label="Reading topic"');
    expect(html).toContain('Add a question (optional)');
    expect(html).not.toContain('<canvas');
  });
  it('keeps the preselected reading covered until the flip and labels card progress', () => {
    const html = renderToStaticMarkup(createElement(CardResult, { reading, immersive: true, preselected: true }));
    expect(html).toContain('ritual-reveal-screen');
    expect(html).toContain('Tap to turn over');
    expect(html).toContain('Turn over your selected card 1');
    expect(html).toContain('1 / 3');
    expect(html).not.toContain('the-star.webp');
  });
  it('drives the 3D flip, the mist veil and the content settle from one timing source', () => {
    const source = readFileSync(new URL('../src/components/CardResult.tsx', import.meta.url), 'utf8');
    expect(source).toContain('const FLIP_MS = 280');
    expect(source).toContain('flipDone');
    expect(source).toContain('FlipCard');
    expect(source).toContain('card-mist');
    const flip = readFileSync(new URL('../src/components/FlipCard.tsx', import.meta.url), 'utf8');
    expect(flip).toContain('flip-card-inner');
    expect(flip).toContain('flip-front');
    const css = readFileSync(new URL('../public/reading-table.css', import.meta.url), 'utf8');
    expect(css).toContain('.reveal-stage{--flip-ms:280ms}');
    expect(css).toContain('.flip-card.is-open .flip-card-inner{transform:rotateY(180deg)}');
    expect(css).toContain('transition:transform var(--flip-ms)');
    expect(css).toContain('.reveal-stage.is-open .card-mist');
    expect(css).toContain('@keyframes mist-veil');
    const mobile = readFileSync(new URL('../public/mobile-ritual.css', import.meta.url), 'utf8');
    expect(mobile).toContain('.ritual-reveal-screen .reveal-stage.is-open .turned-card-layer');
    const baseCss = readFileSync(new URL('../public/styles.css', import.meta.url), 'utf8');
    expect(baseCss).toMatch(/\.holo-card img\{[^}]*transition:opacity \.22s ease/s);
  });
  it('keeps the fan away from its controls at narrow and short heights', () => {
    const css = readFileSync(new URL('../public/mobile-ritual.css', import.meta.url), 'utf8');
    expect(css).toContain('--fan-step:clamp(23px,7.2vw,35px)');
    expect(css).toContain('translateX(calc(var(--offset) * var(--fan-step');
    expect(css).toContain('.ritual-fan{height:190px}');
    expect(css).toContain('scroll-padding-bottom:1rem');
    expect(css).toContain('ritual-fan-settle');
    expect(css).toContain('ritual-card-lift');
    expect(css).toContain('animation:none!important');
    expect(css).not.toContain('translateX(calc(var(--offset) * 37px))');
  });
  it('renders an honest paid report preview and a dedicated checkout verification hook', () => {
    const html = renderToStaticMarkup(createElement(CardResult, { reading, reveal: false }));
    expect(html).toContain('Report preview');
    expect(html).toContain('Example layout');
    expect(html).toContain('not your generated report');
    expect(html).toContain('The Star');
    const source = readFileSync(new URL('../src/components/CardResult.tsx', import.meta.url), 'utf8');
    expect(source).toContain('checkoutWidgetRef');
    expect(source).toContain('getResponse(checkoutWidgetId.current');
  });
  it('preserves the static shared-reading layout', () => {
    const html = renderToStaticMarkup(createElement(CardResult, { reading, reveal: false }));
    expect(html).toContain('alt="The Star, reversed"');
    expect(html).not.toContain('ritual-summary-screen');
    expect(html).toContain('href="/reading/pub_mobile/"');
  });
  it('keeps actions outside the scrollable meaning region and supports safe areas', () => {
    const css = readFileSync(new URL('../public/mobile-ritual.css', import.meta.url), 'utf8');
    expect(css).toContain('.ritual-reveal-screen .flow-body.reveal-body');
    expect(css).toMatch(/\.ritual-reveal-screen \.flow-body\.reveal-body\{[^}]*overflow-y:auto/s);
    expect(css).toMatch(/\.ritual-reveal-screen \.flow-actions\{[^}]*position:relative/s);
    expect(css).toContain('height:100dvh');
    expect(css).toContain('env(safe-area-inset-bottom)');
    expect(css).toContain('@media(prefers-reduced-motion:reduce)');
  });
});
