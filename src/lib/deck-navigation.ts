/**
 * Navigate the visual 78-card fan without landing on a previously picked slot.
 * The server remains authoritative for the shuffled card identities.
 */
export const TAROT_DECK_SIZE = 78;

export function wrapDeckPosition(position: number, size = TAROT_DECK_SIZE): number {
  if (!Number.isInteger(size) || size < 1) throw new RangeError('invalid deck size');
  return ((position % size) + size) % size;
}

/** Move by a given number of *available* positions, wrapping around the deck. */
export function moveToUnpickedPosition(
  start: number,
  delta: number,
  picked: readonly number[],
  size = TAROT_DECK_SIZE,
): number {
  let position = wrapDeckPosition(start, size);
  if (!Number.isInteger(delta) || delta === 0 || picked.length >= size) return position;
  const direction = Math.sign(delta);
  const used = new Set(picked);
  const steps = Math.min(Math.abs(delta), size);
  for (let step = 0; step < steps; step++) {
    let candidate = position;
    let found = false;
    for (let scan = 0; scan < size; scan++) {
      candidate = wrapDeckPosition(candidate + direction, size);
      if (!used.has(candidate)) {
        position = candidate;
        found = true;
        break;
      }
    }
    if (!found) break;
  }
  return position;
}
