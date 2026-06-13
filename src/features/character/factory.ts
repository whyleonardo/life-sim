// ============================================================
// Character Factory — pure logic module for creating new
// Character entities with randomized stats and family.
//
// All randomness goes through the PRNG module for determinism.
// No side effects, no database calls, no UI.
// ============================================================

import type { Character, Relationship } from '@/shared/types'
import { randomInRange } from '@/shared/lib/prng'
import {
  STAT_MIN,
  STAT_MAX,
  MONEY_START_MIN,
  MONEY_START_MAX,
} from '@/shared/config/gameBalance'
import { maleNames, femaleNames } from './data/names'

// ── Types ───────────────────────────────────────────────────

export interface CharacterCreationResult {
  character: Omit<Character, 'id' | 'gameId'>
  familyRelationships: Omit<Relationship, 'id' | 'gameId'>[]
}

// ── Helpers ─────────────────────────────────────────────────

/**
 * Deterministically derive a unique seed for a specific property,
 * ensuring different random calls within the same factory invocation
 * produce independent values.
 */
function propSeed(baseSeed: string, property: string): string {
  return `${baseSeed}:char-${property}`
}

/**
 * Pick a random name from the appropriate gender list.
 */
function pickName(
  seed: string,
  year: number,
  gender: 'male' | 'female',
): string {
  const names = gender === 'male' ? maleNames : femaleNames
  const idx = randomInRange(
    propSeed(seed, `${gender}-name`),
    year,
    0,
    names.length - 1,
  )
  return names[idx]
}

// ── Main Factory ────────────────────────────────────────────

export function createCharacter(
  seed: string,
  year: number = 0,
): CharacterCreationResult {
  // ── Gender (50/50) ──────────────────────────────────────
  const gender: 'male' | 'female' =
    randomInRange(propSeed(seed, 'gender'), year, 0, 1) === 0
      ? 'male'
      : 'female'

  // ── Name ────────────────────────────────────────────────
  const name = pickName(seed, year, gender)

  // ── Stats ───────────────────────────────────────────────
  const health = randomInRange(
    propSeed(seed, 'health'),
    year,
    STAT_MIN,
    STAT_MAX,
  )
  const happiness = randomInRange(
    propSeed(seed, 'happiness'),
    year,
    STAT_MIN,
    STAT_MAX,
  )
  const smarts = randomInRange(
    propSeed(seed, 'smarts'),
    year,
    STAT_MIN,
    STAT_MAX,
  )
  const looks = randomInRange(propSeed(seed, 'looks'), year, STAT_MIN, STAT_MAX)

  // ── Money ───────────────────────────────────────────────
  const money = randomInRange(
    propSeed(seed, 'money'),
    year,
    MONEY_START_MIN,
    MONEY_START_MAX,
  )

  // ── Age (always 0 at birth) ─────────────────────────────
  const age = 0

  // ── Family: 2 Parents ───────────────────────────────────
  const parent1Name = pickName(propSeed(seed, 'parent1-name'), year, 'male')
  const parent2Name = pickName(
    propSeed(seed, 'parent2-name'),
    year,
    'female',
  )
  const parent1Closeness = randomInRange(
    propSeed(seed, 'parent1-closeness'),
    year,
    80,
    100,
  )
  const parent2Closeness = randomInRange(
    propSeed(seed, 'parent2-closeness'),
    year,
    80,
    100,
  )

  const parents: Omit<Relationship, 'id' | 'gameId'>[] = [
    { name: parent1Name, type: 'family', closeness: parent1Closeness },
    { name: parent2Name, type: 'family', closeness: parent2Closeness },
  ]

  // ── Family: 0-2 Siblings ────────────────────────────────
  const siblingCount = randomInRange(
    propSeed(seed, 'sibling-count'),
    year,
    0,
    2,
  )

  const siblings: Omit<Relationship, 'id' | 'gameId'>[] = []
  for (let i = 0; i < siblingCount; i++) {
    const siblingGender: 'male' | 'female' =
      randomInRange(propSeed(seed, `sibling-${i}-gender`), year, 0, 1) === 0
        ? 'male'
        : 'female'
    const siblingName = pickName(
      propSeed(seed, `sibling-${i}`),
      year,
      siblingGender,
    )
    const siblingCloseness = randomInRange(
      propSeed(seed, `sibling-${i}-closeness`),
      year,
      50,
      80,
    )
    siblings.push({
      name: siblingName,
      type: 'family',
      closeness: siblingCloseness,
    })
  }

  // ── Assemble Result ─────────────────────────────────────
  const character: Omit<Character, 'id' | 'gameId'> = {
    name,
    gender,
    age,
    health,
    happiness,
    smarts,
    looks,
    money,
  }

  return {
    character,
    familyRelationships: [...parents, ...siblings],
  }
}

// ── Customization ──────────────────────────────────────────

/**
 * Apply overrides to a character creation result.
 * Returns a new object; does not mutate the original.
 */
export function customizeCharacter(
  result: CharacterCreationResult,
  overrides: { name?: string; gender?: 'male' | 'female' },
): CharacterCreationResult {
  return {
    character: {
      ...result.character,
      ...(overrides.name !== undefined ? { name: overrides.name } : {}),
      ...(overrides.gender !== undefined ? { gender: overrides.gender } : {}),
    },
    familyRelationships: result.familyRelationships,
  }
}
