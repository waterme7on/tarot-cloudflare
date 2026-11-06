import { describe, expect, it } from 'vitest';
import { drawCards, randomInt, shuffle, type RandomSource } from '../src/lib/draw';
import { ALL_CARDS, getCard } from '../src/data/cards';
import { buildFreeSummary, buildRulesReport } from '../src/lib/interpretation';
import { validateReport } from '../src/lib/ai';

describe('deck', () => {
  it('has 78 unique cards', () => {
    expect(ALL_CARDS).toHaveLength(78);
    expect(new Set(ALL_CARDS.map((c) => c.slug)).size).toBe(78);
    expect(ALL_CARDS.filter((c) => c.arcana === 'major')).toHaveLength(22);
    for (const suit of ['wands', 'cups', 'swords', 'pentacles']) expect(ALL_CARDS.filter((c) => c.suit === suit)).toHaveLength(14);
  });
});

describe('randomInt', () => {
  it('rejects values above the unbiased limit', () => {
    const seq = [0xffffffff, 5];
    const rng: RandomSource = { fill: (b) => (b[0] = seq.shift()!) };
    expect(randomInt(10, rng)).toBe(5);
  });
  it('stays within range over many draws', () => {
    for (let i = 0; i < 2000; i++) {
      const v = randomInt(78);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(78);
    }
  });
});

describe('drawCards', () => {
  it('draws the right number of distinct cards per spread', () => {
    expect(drawCards(ALL_CARDS, 'one-card')).toHaveLength(1);
    const three = drawCards(ALL_CARDS, 'three-card');
    expect(three).toHaveLength(3);
    expect(new Set(three.map((c) => c.slug)).size).toBe(3);
    expect(three.map((c) => c.positionLabel)).toEqual(['Past', 'Present', 'Future']);
    expect(drawCards(ALL_CARDS, 'celtic-cross')).toHaveLength(10);
  });
  it('can reach every card and both orientations', () => {
    const seen = new Set<string>();
    let reversed = 0;
    const n = 5000;
    for (let i = 0; i < n; i++) {
      const [c] = drawCards(ALL_CARDS, 'one-card');
      seen.add(c!.slug);
      if (c!.orientation === 'reversed') reversed++;
    }
    expect(seen.size).toBe(78);
    expect(reversed / n).toBeGreaterThan(0.42);
    expect(reversed / n).toBeLessThan(0.58);
  });
  it('shuffle keeps all items', () => {
    expect(shuffle([1, 2, 3, 4]).sort()).toEqual([1, 2, 3, 4]);
  });
});

describe('interpretation', () => {
  it('is deterministic for the same cards', () => {
    const drawn = drawCards(ALL_CARDS, 'three-card');
    const a = buildFreeSummary(drawn, getCard, 'three-card', 'love');
    const b = buildFreeSummary(drawn, getCard, 'three-card', 'love');
    expect(a).toEqual(b);
    expect(a.limitation).toMatch(/entertainment/i);
    expect(a.nextAction.length).toBeGreaterThan(10);
  });
  it('gives a yes/no lean only for decision questions', () => {
    const drawn = drawCards(ALL_CARDS, 'one-card');
    expect(buildFreeSummary(drawn, getCard, 'one-card', 'decision').yesNo).toMatch(/^(yes|no|maybe)$/);
    expect(buildFreeSummary(drawn, getCard, 'one-card', 'love').yesNo).toBeUndefined();
  });
  it('rules report validates against the schema', () => {
    const drawn = drawCards(ALL_CARDS, 'three-card');
    const report = buildRulesReport(drawn, getCard, 'three-card', 'career');
    expect(validateReport(report, drawn)).toBe(true);
    expect(report.disclaimer.toLowerCase()).toContain('entertainment only');
  });
  it('rejects reports that change the drawn cards', () => {
    const drawn = drawCards(ALL_CARDS, 'one-card');
    const report = buildRulesReport(drawn, getCard, 'one-card', 'general');
    report.cards[0]!.orientation = drawn[0]!.orientation === 'upright' ? 'reversed' : 'upright';
    expect(validateReport(report, drawn)).toBe(false);
  });
});
