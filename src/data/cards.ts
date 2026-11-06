import type { CardData } from '../lib/schema';
import { MAJOR_ARCANA } from './cards-major';
import { MINOR_WANDS_CUPS } from './cards-minor-wands-cups';
import { MINOR_SWORDS_PENTACLES } from './cards-minor-swords-pentacles';

export const ALL_CARDS: CardData[] = [...MAJOR_ARCANA, ...MINOR_WANDS_CUPS, ...MINOR_SWORDS_PENTACLES];

const bySlug = new Map(ALL_CARDS.map((c) => [c.slug, c]));

export function getCard(slug: string): CardData | undefined {
  return bySlug.get(slug);
}

export const DECK_SIZE = ALL_CARDS.length;
