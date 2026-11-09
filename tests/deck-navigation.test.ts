import { describe, expect, it } from 'vitest';
import { moveToUnpickedPosition, wrapDeckPosition } from '../src/lib/deck-navigation';

describe('tarot fan navigation', () => {
  it('wraps around the 78-card deck in either direction', () => {
    expect(wrapDeckPosition(78)).toBe(0);
    expect(wrapDeckPosition(-1)).toBe(77);
    expect(moveToUnpickedPosition(77, 1, [])).toBe(0);
    expect(moveToUnpickedPosition(0, -1, [])).toBe(77);
  });

  it('skips already chosen slots for arrows, swipe and the next card', () => {
    const chosen = [5, 6, 8, 77];
    expect(moveToUnpickedPosition(4, 1, chosen)).toBe(7);
    expect(moveToUnpickedPosition(4, 2, chosen)).toBe(9);
    expect(moveToUnpickedPosition(0, -1, chosen)).toBe(76);
    expect(moveToUnpickedPosition(3, 4, chosen)).toBe(10);
    expect(moveToUnpickedPosition(3, -1, [2, 1, 0, 77])).toBe(76);
  });

  it('never mutates selection and preserves the exact picked slot for the server', () => {
    const chosen = [12, 13, 14];
    expect(moveToUnpickedPosition(11, 1, chosen)).toBe(15);
    expect(chosen).toEqual([12, 13, 14]);
  });

  it('handles a full deck, zero movement and tiny decks safely', () => {
    expect(moveToUnpickedPosition(3, 0, [2])).toBe(3);
    expect(moveToUnpickedPosition(2, 1, [0, 1, 2], 3)).toBe(2);
    expect(moveToUnpickedPosition(3, 2, [0, 1, 2, 4], 5)).toBe(3);
    expect(() => wrapDeckPosition(0, 0)).toThrow();
  });
});
