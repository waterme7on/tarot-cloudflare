import { readdirSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CardResult } from '../src/components/CardResult';
import { PUBLISHED_CARD_SLUGS } from '../src/data/card-pages';
import type { DrawResponse } from '../src/lib/schema';

function reading(questionType: DrawResponse['questionType']): DrawResponse {
  return {
    readingId: 'rdg_links',
    publicToken: 'pub_links',
    spread: 'three-card',
    questionType,
    cards: [
      { name: 'The Star', slug: 'the-star', position: 1, positionLabel: 'Past', orientation: 'upright', keywords: ['hope'], summary: 'A little space to reflect.' },
      { name: 'Ace of Swords', slug: 'ace-of-swords', position: 2, positionLabel: 'Present', orientation: 'upright', keywords: ['clarity'], summary: 'A little space to reflect.' },
      { name: 'The Sun', slug: 'the-sun', position: 3, positionLabel: 'Future', orientation: 'upright', keywords: ['warmth'], summary: 'A little space to reflect.' },
    ],
    headline: 'Three cards',
    summary: 'Consider what has changed.',
    nextAction: 'Pause before deciding.',
    limitation: 'For entertainment and self-reflection only.',
    createdAt: '2026-11-10T00:00:00Z',
  };
}

describe('result card links', () => {
  it('links only cards that have a published meaning page', () => {
    const html = renderToStaticMarkup(createElement(CardResult, { reading: reading('career'), reveal: false }));
    expect(html).toContain('href="/cards/the-star/"');
    expect(html).toContain('href="/cards/the-sun/"');
    expect(html).not.toContain('href="/cards/ace-of-swords/"');
    expect(html).toContain('href="/spreads/three-card/"');
    expect(html).toContain('href="/questions/career/"');
    expect(html).toContain('href="/cards/"');
  });

  it('does not invent a general question page', () => {
    const html = renderToStaticMarkup(createElement(CardResult, { reading: reading('general'), reveal: false }));
    expect(html).not.toContain('href="/questions/general/"');
    expect(html).toContain('href="/cards/"');
  });

  it('keeps the published slug list in sync with content files', () => {
    const files = readdirSync(new URL('../src/content/cards', import.meta.url))
      .filter((file) => file.endsWith('.md'))
      .map((file) => file.replace(/\.md$/, ''))
      .sort();
    expect([...PUBLISHED_CARD_SLUGS].sort()).toEqual(files);
  });
});
