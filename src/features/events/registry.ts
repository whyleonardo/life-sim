// ============================================================
// Event Registry — central registry that collects event catalogs
// and provides filtering, selection, and choice resolution.
//
// Stateless: all decisions are deterministic based on seed + year.
// ============================================================

import type { Character } from '@/shared/types'
import { getLifePhase } from '@/shared/config/gameBalance'
import type { LifePhase } from '@/shared/config/gameBalance'
import { probabilityCheck, weightedPick } from '@/shared/lib/prng'
import type { EventDefinition } from './types'

export class EventRegistry {
  private catalogs: Map<string, EventDefinition[]> = new Map()

  /**
   * Register a named catalog of events.
   * Calling this multiple times with the same catalog name will
   * replace the previous entries.
   */
  registerCatalog(name: string, events: EventDefinition[]): void {
    this.catalogs.set(name, [...events])
  }

  /**
   * Return all events from all registered catalogs.
   */
  getAllEvents(): EventDefinition[] {
    const all: EventDefinition[] = []
    for (const events of this.catalogs.values()) {
      all.push(...events)
    }
    return all
  }

  /**
   * Return all events that are eligible for a character on a given turn.
   *
   * Eligibility is determined by:
   *   - Life phase match
   *   - Age range (ageMin / ageMax)
   *   - Stat minimums (minSmarts, minHealth, minHappiness, minLooks, minMoney)
   *   - Probability check (deterministic per event using seed + year)
   */
  getEventsForTurn(
    character: Character,
    year: number,
    seed: string,
  ): EventDefinition[] {
    const phase = getLifePhase(character.age)

    return this.getAllEvents().filter((event) => {
      // Phase check — event must include the character's current phase
      if (!event.phase.includes(phase)) return false

      // Age range checks
      if (event.conditions.ageMin !== undefined && character.age < event.conditions.ageMin) return false
      if (event.conditions.ageMax !== undefined && character.age > event.conditions.ageMax) return false

      // Stat minimum checks
      if (event.conditions.minSmarts !== undefined && character.smarts < event.conditions.minSmarts) return false
      if (event.conditions.minHealth !== undefined && character.health < event.conditions.minHealth) return false
      if (event.conditions.minHappiness !== undefined && character.happiness < event.conditions.minHappiness) return false
      if (event.conditions.minLooks !== undefined && character.looks < event.conditions.minLooks) return false
      if (event.conditions.minMoney !== undefined && character.money < event.conditions.minMoney) return false

      // Probability check — use a per-event derived seed so each
      // event gets an independent deterministic roll
      if (!probabilityCheck(`${seed}:${event.id}`, year, event.probability)) return false

      return true
    })
  }

  /**
   * Select `count` events from the eligible pool using
   * probability-weighted random selection.
   *
   * Uses the PRNG module's weightedPick for deterministic results.
   * Returns fewer events if pool is smaller than `count`.
   * No duplicate events are returned.
   */
  selectEvents(
    eligibleEvents: EventDefinition[],
    count: number,
    seed: string,
    year: number,
  ): EventDefinition[] {
    if (eligibleEvents.length === 0) return []
    if (count <= 0) return []

    const taken = new Set<string>()
    const selected: EventDefinition[] = []
    const pool = [...eligibleEvents]

    // If pool is smaller than requested count, adjust
    const targetCount = Math.min(count, pool.length)

    while (selected.length < targetCount) {
      // Filter out already-selected events
      const available = pool.filter((e) => !taken.has(e.id))
      if (available.length === 0) break

      const weights = available.map((e) => e.probability)

      try {
        const picked = weightedPick(seed, year, available, weights)

        // Prevent infinite loop if same event keeps getting picked
        // (unlikely but safeguard)
        if (taken.has(picked.id)) break

        taken.add(picked.id)
        selected.push(picked)
      } catch {
        // If weightedPick fails (e.g., all weights are 0), break
        break
      }
    }

    return selected
  }

  /**
   * Resolve the stat effects of a player's choice in an event.
   *
   * - If `choiceIndex` is valid (0 <= choiceIndex < event.choices.length),
   *   returns the choice's effects.
   * - Otherwise returns the event's default effects.
   */
  resolveChoice(
    event: EventDefinition,
    choiceIndex: number,
  ): Partial<import('@/shared/config/gameBalance').StatEffects> {
    if (
      event.choices &&
      event.choices.length > 0 &&
      choiceIndex >= 0 &&
      choiceIndex < event.choices.length
    ) {
      return event.choices[choiceIndex].effects
    }
    return event.effects
  }
}

/** Singleton event registry instance. */
export const eventRegistry = new EventRegistry()
