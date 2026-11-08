import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import DrawTool from '../src/components/DrawTool';
import { CardResult } from '../src/components/CardResult';
import type { DrawResponse } from '../src/lib/schema';

const reading: DrawResponse = {
  readingId: 'rdg_test', publicToken: 'pub_test', spread: 'one-card', questionType: 'general',
  cards: [{ slug: 'the-star', name: 'The Star', orientation: 'reversed', position: 1, positionLabel: 'The answer', keywords: ['hope', 'rest'], summary: 'Take time to notice what is helping.' }],
  headline: 'The Star (reversed)', summary: 'A reflection, not a prediction.', nextAction: 'Make room for one quiet moment.',
  limitation: 'For entertainment and self-reflection only.', createdAt: '2026-11-07T00:00:00.000Z',
};

describe('guided mobile flow SSR', () => {
  it('starts with one choice stage and crawlable instructions', () => {
    const html = renderToStaticMarkup(createElement(DrawTool));
    expect(html).toContain('What’s on your mind?');
    expect(html).toContain('Choose my spread');
    expect(html).toContain('aria-current="step"');
    expect(html.match(/class="choice-row"/g)).toHaveLength(5);
    expect(html).not.toContain('<textarea');
    expect(html).not.toContain('<canvas');
    expect(html).toContain('Enable JavaScript');
  });
  it('does not expose the face before the reveal action', () => {
    const html = renderToStaticMarkup(createElement(CardResult, { reading }));
    expect(html).toContain('Reveal card 1');
    expect(html).toContain('Skip to the full reading');
    expect(html).not.toContain('the-star.webp');
    expect(html).not.toContain('The Star');
    expect(html).not.toContain('Get the full reading');
  });
  it('server-renders shared readings without browser globals', () => {
    const html = renderToStaticMarkup(createElement(CardResult, { reading, reveal: false }));
    expect(html).toContain('The Star');
    expect(html).toContain('alt="The Star, reversed"');
    expect(html).toContain('Make room for one quiet moment.');
    expect(html).toContain('href="/reading/pub_test/"');
    expect(html).not.toContain('<canvas');
  });
  it('renders ten-card summaries as static images rather than ten WebGL contexts', () => {
    const expanded = { ...reading, spread: 'celtic-cross' as const, cards: Array.from({ length: 10 }, (_, i) => ({ ...reading.cards[0]!, position: i + 1 })) };
    const html = renderToStaticMarkup(createElement(CardResult, { reading: expanded, reveal: false }));
    expect(html.match(/<img /g)).toHaveLength(10);
    expect(html).not.toContain('holo-card');
  });
});
