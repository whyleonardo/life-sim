// ============================================================
// PRNG Module — deterministic pseudo-random number generator
// wrapping seedrandom.
//
// Stateless: every call takes seed + year as inputs.
// Deterministic: same seed + same year = same results.
// ============================================================

import seedrandom from 'seedrandom'

/**
 * Derive a unique per-year seed by combining the base seed with the year.
 * This ensures the same seed produces **different** results for different years,
 * but the **same** result for the same year.
 */
function deriveSeed(seed: string, year: number): string {
  return `${seed}:${year}`
}

/**
 * Returns a random integer in [min, max] (inclusive).
 */
export function randomInRange(
  seed: string,
  year: number,
  min: number,
  max: number,
): number {
  const rng = seedrandom(deriveSeed(seed, year))
  // seedrandom.quick() returns a float in [0, 1)
  const value = rng.quick()
  return Math.floor(value * (max - min + 1)) + min
}

/**
 * Picks one item from `items` based on the provided `weights`.
 * Items with higher weights are more likely to be selected.
 *
 * @throws if arrays are empty or differ in length.
 */
export function weightedPick<T>(
  seed: string,
  year: number,
  items: readonly T[],
  weights: readonly number[],
): T {
  if (items.length === 0) {
    throw new Error('weightedPick: items array is empty')
  }
  if (weights.length === 0) {
    throw new Error('weightedPick: weights array is empty')
  }
  if (items.length !== weights.length) {
    throw new Error(
      `weightedPick: items length (${items.length}) does not match weights length (${weights.length})`,
    )
  }

  const rng = seedrandom(deriveSeed(seed, year))
  const totalWeight = weights.reduce((sum, w) => sum + w, 0)
  let random = rng.quick() * totalWeight

  for (let i = 0; i < items.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      return items[i]
    }
  }

  // Fallback (should not normally reach here)
  return items[items.length - 1]
}

/**
 * Returns `true` with probability `threshold` (0 = never, 1 = always).
 */
export function probabilityCheck(
  seed: string,
  year: number,
  threshold: number,
): boolean {
  const rng = seedrandom(deriveSeed(seed, year))
  return rng.quick() < threshold
}
