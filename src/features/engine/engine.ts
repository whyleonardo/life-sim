// ============================================================
// Game Engine — core turn processing for the life simulation.
//
// Pure logic: transforms character state for one turn.
// No side effects, no database calls, no UI.
// ============================================================

import type { Character, LifeEvent } from '@/shared/types'
import type { EventDefinition } from '@/features/events/types'
import type { ProactiveAction, LifePhase } from '@/shared/config/gameBalance'
import { STAT_MIN, STAT_MAX, getLifePhase } from '@/shared/config/gameBalance'
import { eventRegistry, EventRegistry } from '@/features/events/registry'
import {
  clamp,
  applyStatEffects,
  applyStatDecay,
  checkDeath,
  getPhaseTransition,
} from './helpers'

// ── Public Types ─────────────────────────────────────────────

export interface TurnInput {
  character: Character
  seed: string
  year: number
  proactiveAction?: ProactiveAction
  eventChoices?: Map<string, number>
}

export interface TurnResult {
  character: Character
  events: LifeEvent[]
  died: boolean
  causeOfDeath?: string
  phaseTransition?: { from: LifePhase; to: LifePhase }
}

// ── Turn Processing ──────────────────────────────────────────

/**
 * Process a single game turn.
 *
 * Sequence (from PRD):
 * 1. Apply proactive action effects (skipped during infancy)
 * 2. Generate events (using EventRegistry)
 * 3. Resolve event choices and apply effects
 * 4. Apply stat decay (based on life phase)
 * 5. Increment character age
 * 6. Check for death conditions (uses new age)
 * 7. Check for phase transitions
 * 8. Clamp all stats
 *
 * @param input - Turn input parameters
 * @param registry - Optional EventRegistry (defaults to singleton)
 */
export function processTurn(
  input: TurnInput,
  registry: EventRegistry = eventRegistry,
): TurnResult {
  let { character } = input
  const { seed, year, proactiveAction, eventChoices } = input
  const lifeEvents: LifeEvent[] = []
  const lethalEvents: EventDefinition[] = []

  const currentPhase = getLifePhase(character.age)
  const isInfancy = currentPhase === 'infancy'

  // ── Step 1: Apply proactive action effects ───────────────
  // Proactive actions are skipped during infancy (0-5).
  if (proactiveAction && !isInfancy) {
    character = applyStatEffects(character, proactiveAction.statEffects)
  }

  // ── Step 2: Generate events ──────────────────────────────
  const eligibleEvents = registry.getEventsForTurn(character, year, seed)
  const selectedEvents = registry.selectEvents(eligibleEvents, 3, seed, year)

  // Track lethal events for death check
  for (const eventDef of selectedEvents) {
    if (eventDef.lethal) {
      lethalEvents.push(eventDef)
    }
  }

  // ── Step 3: Resolve event choices and apply effects ──────
  for (const eventDef of selectedEvents) {
    let effects: Partial<import('@/shared/config/gameBalance').StatEffects>

    if (eventDef.choices && eventDef.choices.length > 0 && !isInfancy) {
      // During non-infancy: check if player made a choice
      const choiceIndex = eventChoices?.get(eventDef.id) ?? -1
      effects = registry.resolveChoice(eventDef, choiceIndex)
    } else {
      // During infancy: auto-resolve with default effects
      effects = eventDef.effects
    }

    character = applyStatEffects(character, effects)

    // Record the life event
    lifeEvents.push({
      gameId: character.gameId,
      year,
      type: eventDef.id,
      description: eventDef.description,
      effects: { ...effects },
      choices: eventDef.choices ? [...eventDef.choices] : undefined,
    })
  }

  // ── Step 4: Apply stat decay ─────────────────────────────
  character = applyStatDecay(character)

  // ── Step 5: Increment character age ─────────────────────
  const oldAge = character.age
  character = { ...character, age: character.age + 1 }

  // ── Step 6: Check for death conditions (using new age) ──
  const deathResult = checkDeath(character, seed, year, lethalEvents)

  // ── Step 7: Check for phase transitions ─────────────────
  const phaseTransition = getPhaseTransition(oldAge, character.age)

  // ── Step 8: Clamp all stats ──────────────────────────────
  character = {
    ...character,
    health: clamp(
      Math.round(character.health * 100) / 100,
      STAT_MIN,
      STAT_MAX,
    ),
    happiness: clamp(
      Math.round(character.happiness * 100) / 100,
      STAT_MIN,
      STAT_MAX,
    ),
    smarts: clamp(
      Math.round(character.smarts * 100) / 100,
      STAT_MIN,
      STAT_MAX,
    ),
    looks: clamp(
      Math.round(character.looks * 100) / 100,
      STAT_MIN,
      STAT_MAX,
    ),
    money: Math.max(0, Math.round(character.money * 100) / 100),
  }

  return {
    character,
    events: lifeEvents,
    died: deathResult.died,
    causeOfDeath: deathResult.causeOfDeath,
    phaseTransition,
  }
}
