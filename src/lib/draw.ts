import type { CardData, DrawnCard, Orientation, Spread } from './schema';
import { SPREAD_SIZES } from './schema';

export const SPREAD_POSITIONS: Record<Spread, string[]> = {
  'one-card': ['The answer'],
  'three-card': ['Past', 'Present', 'Future'],
  'celtic-cross': [
    'Present',
    'Challenge',
    'Past',
    'Future',
    'Above',
    'Below',
    'Advice',
    'External influences',
    'Hopes and fears',
    'Outcome',
  ],
};

export interface RandomSource {
  fill(buf: Uint32Array): void;
}

export const cryptoRandom: RandomSource = {
  fill(buf) {
    crypto.getRandomValues(buf);
  },
};

// Rejection sampling: uniform integer in [0, max) without modulo bias.
export function randomInt(max: number, rng: RandomSource = cryptoRandom): number {
  if (!Number.isInteger(max) || max <= 0 || max > 0x100000000) throw new RangeError('bad max');
  const limit = 0x100000000 - (0x100000000 % max);
  const buf = new Uint32Array(1);
  for (;;) {
    rng.fill(buf);
    const v = buf[0]!;
    if (v < limit) return v % max;
  }
}

export function randomOrientation(rng: RandomSource = cryptoRandom): Orientation {
  return randomInt(2, rng) === 0 ? 'upright' : 'reversed';
}

export function shuffle<T>(items: T[], rng: RandomSource = cryptoRandom): T[] {
  const arr = items.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = randomInt(i + 1, rng);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function drawCards(deck: CardData[], spread: Spread, rng: RandomSource = cryptoRandom): DrawnCard[] {
  const count = SPREAD_SIZES[spread];
  const positions = SPREAD_POSITIONS[spread];
  const shuffled = shuffle(deck, rng);
  return shuffled.slice(0, count).map((card, i) => {
    const orientation = randomOrientation(rng);
    const meaning = card[orientation];
    return {
      slug: card.slug,
      name: card.name,
      orientation,
      position: i + 1,
      positionLabel: positions[i] ?? `Card ${i + 1}`,
      keywords: meaning.keywords,
      summary: meaning.summary,
    };
  });
}
