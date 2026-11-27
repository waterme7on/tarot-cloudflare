// Slugs with a published /cards/<slug>/ page. validate-content.ts fails if this drifts.
export const PUBLISHED_CARD_SLUGS = [
  'ace-of-cups',
  'ace-of-pentacles',
  'ace-of-swords',
  'ace-of-wands',
  'death',
  'judgement',
  'justice',
  'king-of-cups',
  'king-of-wands',
  'knight-of-cups',
  'knight-of-wands',
  'page-of-cups',
  'page-of-wands',
  'queen-of-cups',
  'queen-of-wands',
  'strength',
  'temperance',
  'ten-of-cups',
  'ten-of-pentacles',
  'the-chariot',
  'the-devil',
  'the-emperor',
  'the-empress',
  'the-fool',
  'the-hanged-man',
  'the-hermit',
  'the-hierophant',
  'the-high-priestess',
  'the-lovers',
  'the-magician',
  'the-moon',
  'the-star',
  'the-sun',
  'the-tower',
  'the-world',
  'three-of-swords',
  'two-of-cups',
  'wheel-of-fortune',
] as const;

const published = new Set<string>(PUBLISHED_CARD_SLUGS);

export function hasCardPage(slug: string): boolean {
  return published.has(slug);
}
