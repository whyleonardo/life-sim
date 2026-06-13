// ============================================================
// Engine Helpers — pure functions for game turn processing.
// No side effects, no database calls, no UI.
// ============================================================

import type { Character } from '@/shared/types'
import type { EventDefinition } from '@/features/events/types'
import type { StatEffects, LifePhase } from '@/shared/config/gameBalance'
import {
  STAT_MIN,
  STAT_MAX,
  getLifePhase,
  statDecayRates,
  deathProbabilities,
} from '@/shared/config/gameBalance'
import { probabilityCheck } from '@/shared/lib/prng'

/**
 * Clamp a number to [min, max].
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Apply stat effects to a character, returning a new character object.
 * Only modifies stats present in `effects`; all others remain unchanged.
 */
export function applyStatEffects(
  character: Character,
  effects: Partial<StatEffects>,
): Character {
  return {
    ...character,
    ...(effects.health !== undefined
      ? { health: character.health + effects.health }
      : {}),
    ...(effects.happiness !== undefined
      ? { happiness: character.happiness + effects.happiness }
      : {}),
    ...(effects.smarts !== undefined
      ? { smarts: character.smarts + effects.smarts }
      : {}),
    ...(effects.looks !== undefined
      ? { looks: character.looks + effects.looks }
      : {}),
    ...(effects.money !== undefined
      ? { money: character.money + effects.money }
      : {}),
  }
}

/**
 * Apply stat decay based on the character's current life phase.
 * Returns a new character object with reduced stats.
 */
export function applyStatDecay(character: Character): Character {
  const phase = getLifePhase(character.age)
  const rates = statDecayRates[phase]
  return {
    ...character,
    health: character.health - rates.health,
    happiness: character.happiness - rates.happiness,
    smarts: character.smarts - rates.smarts,
    looks: character.looks - rates.looks,
  }
}

/**
 * Check if a character should die this turn.
 *
 * Death conditions (checked in order):
 * 1. Health <= 0 → health_depleted
 * 2. Age >= 60 → natural death probability
 * 3. Lethal events → per-event death probability
 */
export function checkDeath(
  character: Character,
  seed: string,
  year: number,
  lethalEvents: EventDefinition[],
): { died: boolean; causeOfDeath?: string } {
  // Health depletion check
  if (character.health <= 0) {
    return { died: true, causeOfDeath: 'health_depleted' }
  }

  // Natural death for seniors
  if (character.age >= 60) {
    const prob = deathProbabilities[character.age]
    if (prob !== undefined && probabilityCheck(seed, year, prob)) {
      return { died: true, causeOfDeath: 'natural_causes' }
    }
  }

  // Lethal event checks
  for (const event of lethalEvents) {
    if (
      event.lethal &&
      event.deathProbability !== undefined &&
      probabilityCheck(
        `${seed}:${event.id}:death`,
        year,
        event.deathProbability,
      )
    ) {
      return { died: true, causeOfDeath: event.id }
    }
  }

  return { died: false }
}

/**
 * Determine life phase transition between two ages.
 * Returns `{ from, to }` if the phase changed, or `undefined` if same phase.
 */
export function getPhaseTransition(
  oldAge: number,
  newAge: number,
): { from: LifePhase; to: LifePhase } | undefined {
  const fromPhase = getLifePhase(oldAge)
  const toPhase = getLifePhase(newAge)
  if (fromPhase !== toPhase) {
    return { from: fromPhase, to: toPhase }
  }
  return undefined
}
