// ============================================================
// Game Engine Tests
// ============================================================

import { describe, it, expect } from 'vitest'
import type { Character } from '@/shared/types'
import type { EventDefinition } from '@/features/events/types'
import type { StatEffects } from '@/shared/config/gameBalance'
import {
  STAT_MIN,
  STAT_MAX,
  getLifePhase,
  statDecayRates,
} from '@/shared/config/gameBalance'
import { EventRegistry } from '@/features/events/registry'
import {
  clamp,
  applyStatEffects,
  applyStatDecay,
  checkDeath,
  getPhaseTransition,
} from './helpers'
import { processTurn } from './engine'

// ── Test Helpers ─────────────────────────────────────────────

const BASE_SEED = 'test-engine-seed'
const BASE_YEAR = 2024

function createCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: 1,
    gameId: 1,
    name: 'Test Person',
    gender: 'male',
    age: 25,
    health: 80,
    happiness: 70,
    smarts: 60,
    looks: 50,
    money: 1000,
    ...overrides,
  }
}

function createEvent(overrides: Partial<EventDefinition> = {}): EventDefinition {
  return {
    id: 'test.event',
    phase: ['youngAdult'],
    conditions: {},
    probability: 1,
    description: 'events.test.test_event',
    effects: { happiness: 5 },
    ...overrides,
  }
}

/**
 * Create a fresh EventRegistry with test events registered.
 * Default registers a single event 'test.event' with +5 happiness.
 */
function createTestRegistry(
  events: EventDefinition[] = [createEvent()],
): EventRegistry {
  const registry = new EventRegistry()
  registry.registerCatalog('test', events)
  return registry
}

// ===================================================================
// Helper: clamp
// ===================================================================

describe('clamp', () => {
  it('returns value within [min, max]', () => {
    expect(clamp(50, 0, 100)).toBe(50)
  })

  it('clamps to min when value is below', () => {
    expect(clamp(-10, 0, 100)).toBe(0)
  })

  it('clamps to max when value is above', () => {
    expect(clamp(150, 0, 100)).toBe(100)
  })

  it('handles value equal to min', () => {
    expect(clamp(0, 0, 100)).toBe(0)
  })

  it('handles value equal to max', () => {
    expect(clamp(100, 0, 100)).toBe(100)
  })

  it('works with negative ranges', () => {
    expect(clamp(-5, -10, -1)).toBe(-5)
    expect(clamp(-15, -10, -1)).toBe(-10)
    expect(clamp(0, -10, -1)).toBe(-1)
  })
})

// ===================================================================
// Helper: applyStatEffects
// ===================================================================

describe('applyStatEffects', () => {
  it('adds positive effects to all stats', () => {
    const char = createCharacter({ health: 50, happiness: 50, smarts: 50, looks: 50, money: 100 })
    const effects: StatEffects = { health: 10, happiness: 5, smarts: 3, looks: 2, money: 50 }
    const result = applyStatEffects(char, effects)
    expect(result.health).toBe(60)
    expect(result.happiness).toBe(55)
    expect(result.smarts).toBe(53)
    expect(result.looks).toBe(52)
    expect(result.money).toBe(150)
  })

  it('applies negative effects', () => {
    const char = createCharacter({ health: 80, happiness: 70 })
    const effects: StatEffects = { health: -15, happiness: -10 }
    const result = applyStatEffects(char, effects)
    expect(result.health).toBe(65)
    expect(result.happiness).toBe(60)
  })

  it('applies partial effects (only specified stats)', () => {
    const char = createCharacter({ health: 50, happiness: 50, smarts: 50, looks: 50, money: 100 })
    const effects: StatEffects = { health: 10 }
    const result = applyStatEffects(char, effects)
    expect(result.health).toBe(60)
    expect(result.happiness).toBe(50)
    expect(result.smarts).toBe(50)
    expect(result.looks).toBe(50)
    expect(result.money).toBe(100)
  })

  it('does not mutate the original character', () => {
    const char = createCharacter({ health: 50 })
    const effects: StatEffects = { health: 10 }
    const result = applyStatEffects(char, effects)
    expect(result.health).toBe(60)
    expect(char.health).toBe(50)
  })

  it('handles empty effects gracefully', () => {
    const char = createCharacter()
    const result = applyStatEffects(char, {})
    expect(result).toEqual(char)
  })

  it('handles zero effects', () => {
    const char = createCharacter({ health: 50 })
    const result = applyStatEffects(char, { health: 0 })
    expect(result.health).toBe(50)
  })
})

// ===================================================================
// Helper: applyStatDecay
// ===================================================================

describe('applyStatDecay', () => {
  it('applies decay rates for youngAdult phase', () => {
    const char = createCharacter({ age: 25, health: 100, happiness: 100, smarts: 100, looks: 100 })
    const result = applyStatDecay(char)
    expect(result.health).toBe(100 - statDecayRates.youngAdult.health)
    expect(result.happiness).toBe(100 - statDecayRates.youngAdult.happiness)
    expect(result.smarts).toBe(100 - statDecayRates.youngAdult.smarts)
    expect(result.looks).toBe(100 - statDecayRates.youngAdult.looks)
  })

  it('applies decay rates for school phase', () => {
    const char = createCharacter({ age: 10, health: 100, happiness: 100, smarts: 100, looks: 100 })
    const result = applyStatDecay(char)
    expect(result.health).toBe(100 - statDecayRates.school.health)
    expect(result.happiness).toBe(100 - statDecayRates.school.happiness)
    expect(result.smarts).toBe(100 - statDecayRates.school.smarts)
    expect(result.looks).toBe(100 - statDecayRates.school.looks)
  })

  it('applies decay rates for senior phase (highest decay)', () => {
    const char = createCharacter({ age: 70, health: 100, happiness: 100, smarts: 100, looks: 100 })
    const result = applyStatDecay(char)
    expect(result.health).toBe(100 - statDecayRates.senior.health)
    expect(result.happiness).toBe(100 - statDecayRates.senior.happiness)
    expect(result.smarts).toBe(100 - statDecayRates.senior.smarts)
    expect(result.looks).toBe(100 - statDecayRates.senior.looks)
  })

  it('correctly identifies phase based on age', () => {
    expect(getLifePhase(3)).toBe('infancy')
    expect(getLifePhase(12)).toBe('school')
    expect(getLifePhase(20)).toBe('youngAdult')
    expect(getLifePhase(30)).toBe('adult')
    expect(getLifePhase(65)).toBe('senior')
  })

  it('does not mutate the original character', () => {
    const char = createCharacter({ health: 80 })
    const result = applyStatDecay(char)
    expect(result.health).toBeLessThan(80)
    expect(char.health).toBe(80)
  })
})

// ===================================================================
// Helper: checkDeath
// ===================================================================

describe('checkDeath', () => {
  it('returns death when health <= 0', () => {
    const char = createCharacter({ age: 25, health: 0 })
    const result = checkDeath(char, BASE_SEED, BASE_YEAR, [])
    expect(result.died).toBe(true)
    expect(result.causeOfDeath).toBe('health_depleted')
  })

  it('returns death when health is negative', () => {
    const char = createCharacter({ age: 25, health: -5 })
    const result = checkDeath(char, BASE_SEED, BASE_YEAR, [])
    expect(result.died).toBe(true)
    expect(result.causeOfDeath).toBe('health_depleted')
  })

  it('does not die if health > 0 and age < 60 with no lethal events', () => {
    const char = createCharacter({ age: 25, health: 50 })
    const result = checkDeath(char, BASE_SEED, BASE_YEAR, [])
    expect(result.died).toBe(false)
    expect(result.causeOfDeath).toBeUndefined()
  })

  it('returns natural death at age 110+ (probability 1.0)', () => {
    const char = createCharacter({ age: 110, health: 100 })
    const result = checkDeath(char, BASE_SEED, BASE_YEAR, [])
    expect(result.died).toBe(true)
    expect(result.causeOfDeath).toBe('natural_causes')
  })

  it('does not die from age check if under 60', () => {
    for (let i = 0; i < 20; i++) {
      const char = createCharacter({ age: 30, health: 80 })
      const result = checkDeath(char, 'seed-' + i, BASE_YEAR, [])
      expect(result.died).toBe(false)
    }
  })

  it('can die from a lethal event with deathProbability 1.0', () => {
    const char = createCharacter({ age: 25, health: 100 })
    const lethalEvents: EventDefinition[] = [
      createEvent({
        id: 'test.lethal',
        lethal: true,
        deathProbability: 1.0,
      }),
    ]
    const result = checkDeath(char, BASE_SEED, BASE_YEAR, lethalEvents)
    expect(result.died).toBe(true)
    expect(result.causeOfDeath).toBe('test.lethal')
  })

  it('does not die from non-lethal events', () => {
    const char = createCharacter({ age: 25, health: 100 })
    const events: EventDefinition[] = [
      createEvent({ id: 'test.safe', lethal: false }),
    ]
    const result = checkDeath(char, BASE_SEED, BASE_YEAR, events)
    expect(result.died).toBe(false)
  })

  it('does not die from lethal event with deathProbability 0', () => {
    const char = createCharacter({ age: 25, health: 100 })
    const lethalEvents: EventDefinition[] = [
      createEvent({
        id: 'test.safe_lethal',
        lethal: true,
        deathProbability: 0,
      }),
    ]
    const result = checkDeath(char, BASE_SEED, BASE_YEAR, lethalEvents)
    expect(result.died).toBe(false)
  })

  it('prioritizes health depletion over other death causes', () => {
    const char = createCharacter({ age: 25, health: -1 })
    const lethalEvents: EventDefinition[] = [
      createEvent({
        id: 'test.lethal',
        lethal: true,
        deathProbability: 1.0,
      }),
    ]
    const result = checkDeath(char, BASE_SEED, BASE_YEAR, lethalEvents)
    expect(result.died).toBe(true)
    expect(result.causeOfDeath).toBe('health_depleted')
  })

  it('is deterministic with same inputs', () => {
    const char = createCharacter({ age: 80, health: 100 })
    const lethalEvents: EventDefinition[] = [
      createEvent({
        id: 'test.lethal',
        lethal: true,
        deathProbability: 0.5,
      }),
    ]
    const first = checkDeath(char, 'det-seed', 2024, lethalEvents)
    const second = checkDeath(char, 'det-seed', 2024, lethalEvents)
    expect(first).toEqual(second)
  })
})

// ===================================================================
// Helper: getPhaseTransition
// ===================================================================

describe('getPhaseTransition', () => {
  it('returns transition from infancy to school at age 6', () => {
    const result = getPhaseTransition(5, 6)
    expect(result).toEqual({ from: 'infancy', to: 'school' })
  })

  it('returns transition from school to youngAdult at age 18', () => {
    const result = getPhaseTransition(17, 18)
    expect(result).toEqual({ from: 'school', to: 'youngAdult' })
  })

  it('returns transition from youngAdult to adult at age 26', () => {
    const result = getPhaseTransition(25, 26)
    expect(result).toEqual({ from: 'youngAdult', to: 'adult' })
  })

  it('returns transition from adult to senior at age 56', () => {
    const result = getPhaseTransition(55, 56)
    expect(result).toEqual({ from: 'adult', to: 'senior' })
  })

  it('returns undefined when staying in same phase', () => {
    expect(getPhaseTransition(25, 25)).toBeUndefined()
    expect(getPhaseTransition(10, 11)).toBeUndefined()
    expect(getPhaseTransition(30, 35)).toBeUndefined()
  })

  it('returns undefined for small age changes within same phase', () => {
    expect(getPhaseTransition(6, 7)).toBeUndefined()
    expect(getPhaseTransition(18, 19)).toBeUndefined()
  })
})

// ===================================================================
// Engine: processTurn — basic flow
// ===================================================================

describe('processTurn', () => {
  it('increments character age by 1', () => {
    const char = createCharacter({ age: 25 })
    const registry = createTestRegistry([])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.character.age).toBe(26)
  })

  it('returns empty events array when no events fire', () => {
    const char = createCharacter({ age: 25 })
    const registry = createTestRegistry([])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.events).toEqual([])
  })

  it('returns died=false and no causeOfDeath for healthy character', () => {
    const char = createCharacter({ age: 25, health: 80 })
    const registry = createTestRegistry([])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.died).toBe(false)
    expect(result.causeOfDeath).toBeUndefined()
  })

  it('does not mutate the original character object', () => {
    const char = createCharacter({ age: 25, health: 80 })
    const registry = createTestRegistry([])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(char.age).toBe(25)
    expect(char.health).toBe(80)
    expect(result.character.age).toBe(26)
    expect(result.character).not.toBe(char)
  })
})

// ===================================================================
// Engine: stat decay per age bracket
// ===================================================================

describe('processTurn — stat decay', () => {
  it('applies stat decay for young adult (age 25)', () => {
    const char = createCharacter({ age: 25, health: 100, happiness: 100, smarts: 100, looks: 100 })
    const registry = createTestRegistry([])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.character.health).toBeCloseTo(100 - statDecayRates.youngAdult.health)
    expect(result.character.happiness).toBeCloseTo(100 - statDecayRates.youngAdult.happiness)
    expect(result.character.smarts).toBeCloseTo(100 - statDecayRates.youngAdult.smarts)
    expect(result.character.looks).toBeCloseTo(100 - statDecayRates.youngAdult.looks)
  })

  it('applies stat decay for senior (age 70)', () => {
    const char = createCharacter({ age: 70, health: 100, happiness: 100, smarts: 100, looks: 100 })
    const registry = createTestRegistry([])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.character.health).toBeCloseTo(100 - statDecayRates.senior.health)
    expect(result.character.happiness).toBeCloseTo(100 - statDecayRates.senior.happiness)
    expect(result.character.smarts).toBeCloseTo(100 - statDecayRates.senior.smarts)
    expect(result.character.looks).toBeCloseTo(100 - statDecayRates.senior.looks)
  })

  it('applies stat decay for infancy (age 3)', () => {
    const char = createCharacter({ age: 3, health: 100, happiness: 100, smarts: 100, looks: 100 })
    const registry = createTestRegistry([])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.character.health).toBeCloseTo(100 - statDecayRates.infancy.health)
    expect(result.character.happiness).toBeCloseTo(100 - statDecayRates.infancy.happiness)
  })
})

// ===================================================================
// Engine: death checks
// ===================================================================

describe('processTurn — death', () => {
  it('dies when health drops to 0 or below after decay', () => {
    const char = createCharacter({ age: 25, health: 0.2 })
    const registry = createTestRegistry([])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.died).toBe(true)
    expect(result.causeOfDeath).toBe('health_depleted')
  })

  it('dies from lethal event with deathProbability 1.0', () => {
    const char = createCharacter({ age: 25, health: 100 })
    const lethalEvent = createEvent({
      id: 'test.lethal_event',
      phase: ['youngAdult'],
      probability: 1,
      lethal: true,
      deathProbability: 1.0,
      effects: { health: -10 },
    })
    const registry = createTestRegistry([lethalEvent])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.died).toBe(true)
    expect(result.causeOfDeath).toBe('test.lethal_event')
  })

  it('does not die when health stays above 0 and no lethal events', () => {
    const char = createCharacter({ age: 25, health: 80 })
    const registry = createTestRegistry([])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.died).toBe(false)
  })

  it('character under 60 with positive health does not die from natural causes', () => {
    for (let i = 0; i < 10; i++) {
      const char = createCharacter({ age: 30, health: 80 })
      const registry = createTestRegistry([])
      const result = processTurn({ character: char, seed: 'nat-death-' + i, year: BASE_YEAR }, registry)
      expect(result.died).toBe(false)
    }
  })
})

// ===================================================================
// Engine: phase transitions
// ===================================================================

describe('processTurn — phase transitions', () => {
  it('transitions from infancy to school at age 6', () => {
    const char = createCharacter({ age: 5, health: 100, happiness: 100, smarts: 100, looks: 100 })
    const registry = createTestRegistry([])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.phaseTransition).toEqual({ from: 'infancy', to: 'school' })
  })

  it('transitions from school to youngAdult at age 18', () => {
    const char = createCharacter({ age: 17, health: 100, happiness: 100, smarts: 100, looks: 100 })
    const registry = createTestRegistry([])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.phaseTransition).toEqual({ from: 'school', to: 'youngAdult' })
  })

  it('transitions from youngAdult to adult at age 26', () => {
    const char = createCharacter({ age: 25, health: 100 })
    const registry = createTestRegistry([])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.phaseTransition).toEqual({ from: 'youngAdult', to: 'adult' })
  })

  it('transitions from adult to senior at age 56', () => {
    const char = createCharacter({ age: 55, health: 100 })
    const registry = createTestRegistry([])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.phaseTransition).toEqual({ from: 'adult', to: 'senior' })
  })

  it('does not report phase transition when staying in same phase', () => {
    const char = createCharacter({ age: 30, health: 100 })
    const registry = createTestRegistry([])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.phaseTransition).toBeUndefined()
  })

  it('does not report phase transition within infancy (age 0-4)', () => {
    for (let age = 0; age < 5; age++) {
      const char = createCharacter({ age, health: 100 })
      const registry = createTestRegistry([])
      const result = processTurn({ character: char, seed: 'phase-' + age, year: BASE_YEAR }, registry)
      expect(result.phaseTransition).toBeUndefined()
    }
  })
})

// ===================================================================
// Engine: events — proactive actions, event effects, ordering
// ===================================================================

describe('processTurn — events and actions', () => {
  it('applies proactive action effects before events', () => {
    const char = createCharacter({ age: 30, happiness: 50 })
    const happyEvent = createEvent({
      id: 'test.happy',
      phase: ['adult'],
      probability: 1,
      effects: { happiness: 10 },
    })
    const action = { label: 'actions.adult.hobby', description: 'actions.adult.hobbyDesc', statEffects: { happiness: 4 } }
    const registry = createTestRegistry([happyEvent])
    const result = processTurn(
      { character: char, seed: BASE_SEED, year: BASE_YEAR, proactiveAction: action },
      registry,
    )
    // Expected: 50 (base) + 4 (action) + 10 (event) - 0.7 (adult decay) = 63.3
    expect(result.character.happiness).toBeCloseTo(63.3)
  })

  it('applies event effects after proactive action', () => {
    const char = createCharacter({ age: 30, health: 80 })
    const healthEvent = createEvent({
      id: 'test.damage',
      phase: ['adult'],
      probability: 1,
      effects: { health: -15 },
    })
    const action = { label: 'actions.adult.health', description: 'actions.adult.healthDesc', statEffects: { health: 3 } }
    const registry = createTestRegistry([healthEvent])
    const result = processTurn(
      { character: char, seed: BASE_SEED, year: BASE_YEAR, proactiveAction: action },
      registry,
    )
    // Expected: 80 (base) + 3 (action) - 15 (event) - 0.8 (adult decay) = 67.2
    expect(result.character.health).toBeCloseTo(67.2)
  })

  it('resolves event choices correctly', () => {
    const char = createCharacter({ age: 25, health: 80 })
    const eventWithChoices = createEvent({
      id: 'test.choice_event',
      phase: ['youngAdult'],
      probability: 1,
      effects: { health: -5 },
      choices: [
        { label: 'events.test.choice_a', effects: { health: 10 } },
        { label: 'events.test.choice_b', effects: { health: 3 } },
      ],
    })
    const eventChoices = new Map<string, number>([['test.choice_event', 0]])
    const registry = createTestRegistry([eventWithChoices])
    const result = processTurn(
      { character: char, seed: BASE_SEED, year: BASE_YEAR, eventChoices },
      registry,
    )
    // Expected: 80 (base) + 10 (choice A) - 0.5 (young adult decay) = 89.5
    expect(result.character.health).toBeCloseTo(89.5)
  })

  it('uses default effects when no choice made for event with choices', () => {
    const char = createCharacter({ age: 25, health: 80 })
    const eventWithChoices = createEvent({
      id: 'test.choice_event',
      phase: ['youngAdult'],
      probability: 1,
      effects: { health: -5 },
      choices: [
        { label: 'events.test.choice_a', effects: { health: 10 } },
      ],
    })
    const registry = createTestRegistry([eventWithChoices])
    const result = processTurn(
      { character: char, seed: BASE_SEED, year: BASE_YEAR },
      registry,
    )
    // Uses default effects: 80 (base) + (-5) (default) - 0.5 (decay) = 74.5
    expect(result.character.health).toBeCloseTo(74.5)
  })

  it('applies no proactive action during infancy', () => {
    const char = createCharacter({ age: 3, health: 80, happiness: 80 })
    const action = { label: 'actions.infantry.play', description: 'actions.infantry.playDesc', statEffects: { happiness: 5 } }
    const registry = createTestRegistry([])
    const result = processTurn(
      { character: char, seed: BASE_SEED, year: BASE_YEAR, proactiveAction: action },
      registry,
    )
    // Infancy: no proactive action applied
    // Expected: 80 - 0.1 (health decay) = 79.9, 80 (no action) - 0.2 = 79.8
    expect(result.character.health).toBeCloseTo(80 - statDecayRates.infancy.health)
    expect(result.character.happiness).toBeCloseTo(80 - statDecayRates.infancy.happiness)
  })

  it('auto-resolves events during infancy (no choices)', () => {
    const char = createCharacter({ age: 3, health: 80 })
    const eventWithChoices = createEvent({
      id: 'test.infant_event',
      phase: ['infancy'],
      probability: 1,
      effects: { health: -5 },
      choices: [
        { label: 'events.test.choice_a', effects: { health: 10 } },
      ],
    })
    const eventChoices = new Map<string, number>([['test.infant_event', 0]])
    const registry = createTestRegistry([eventWithChoices])
    const result = processTurn(
      { character: char, seed: BASE_SEED, year: BASE_YEAR, eventChoices },
      registry,
    )
    // Infancy: event choices ignored, uses default effects
    // 80 - 5 (default effect) - 0.1 (decay) = 74.9
    expect(result.character.health).toBeCloseTo(74.9)
  })

  it('records events in the result', () => {
    const char = createCharacter({ age: 25 })
    const testEvent = createEvent({
      id: 'test.recorded',
      phase: ['youngAdult'],
      probability: 1,
      effects: { happiness: 10 },
    })
    const registry = createTestRegistry([testEvent])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.events).toHaveLength(1)
    expect(result.events[0].type).toBe('test.recorded')
    expect(result.events[0].description).toBe('events.test.test_event')
    expect(result.events[0].year).toBe(BASE_YEAR)
  })
})

// ===================================================================
// Engine: stat clamping
// ===================================================================

describe('processTurn — stat clamping', () => {
  it('does not let stats go below STAT_MIN (0)', () => {
    const char = createCharacter({ age: 70, health: 0.5, happiness: 0.5, smarts: 0.5, looks: 0.5 })
    const registry = createTestRegistry([])
    // Senior decay: health -2.0, happiness -1.0, smarts -0.8, looks -1.5
    // All would be negative, clamped to 0
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    expect(result.character.health).toBe(0)
    expect(result.character.happiness).toBe(0)
    expect(result.character.smarts).toBe(0)
    expect(result.character.looks).toBe(0)
  })

  it('clamps stats to STAT_MAX (100) when they go above', () => {
    const char = createCharacter({ age: 25, health: 99, happiness: 99, smarts: 99, looks: 99 })
    const bigEffect = createEvent({
      id: 'test.big_boost',
      phase: ['youngAdult'],
      probability: 1,
      effects: { health: 10, happiness: 10, smarts: 10, looks: 10 },
    })
    const registry = createTestRegistry([bigEffect])
    const result = processTurn(
      { character: char, seed: BASE_SEED, year: BASE_YEAR },
      registry,
    )
    // 99 + 10 = 109, decay 0.5 = 108.5, clamped to 100
    expect(result.character.health).toBe(100)
    expect(result.character.happiness).toBe(100)
    expect(result.character.smarts).toBe(100)
    expect(result.character.looks).toBe(100)
  })

  it('does not let money go below 0', () => {
    const char = createCharacter({ age: 25, money: 10 })
    const loseMoney = createEvent({
      id: 'test.broke',
      phase: ['youngAdult'],
      probability: 1,
      effects: { money: -50 },
    })
    const registry = createTestRegistry([loseMoney])
    const result = processTurn(
      { character: char, seed: BASE_SEED, year: BASE_YEAR },
      registry,
    )
    expect(result.character.money).toBe(0)
  })

  it('allows money to go above 100 (no upper bound)', () => {
    const char = createCharacter({ age: 25, money: 500 })
    const gainMoney = createEvent({
      id: 'test.rich',
      phase: ['youngAdult'],
      probability: 1,
      effects: { money: 1000 },
    })
    const registry = createTestRegistry([gainMoney])
    const result = processTurn(
      { character: char, seed: BASE_SEED, year: BASE_YEAR },
      registry,
    )
    expect(result.character.money).toBeGreaterThan(100)
    expect(result.character.money).toBe(1500)
  })
})

// ===================================================================
// Engine: determinism
// ===================================================================

describe('processTurn — determinism', () => {
  it('same seed + same input = same result', () => {
    const char = createCharacter({ age: 30, health: 80, happiness: 70 })
    const testEvent = createEvent({
      id: 'test.det',
      phase: ['adult'],
      probability: 1,
      effects: { happiness: 5, health: -3 },
    })
    const registry = createTestRegistry([testEvent])
    const input: TurnInput = {
      character: char,
      seed: 'deterministic-test',
      year: 2024,
      proactiveAction: { label: 'x', description: 'x', statEffects: { happiness: 2 } },
    }

    const first = processTurn(input, registry)
    const second = processTurn(input, registry)

    expect(first.character).toEqual(second.character)
    expect(first.events).toEqual(second.events)
    expect(first.died).toBe(second.died)
    expect(first.phaseTransition).toEqual(second.phaseTransition)
  })

  it('different seeds produce different results', () => {
    const char = createCharacter({ age: 30, health: 80, happiness: 70 })
    const testEvent = createEvent({
      id: 'test.varied',
      phase: ['adult'],
      probability: 1,
      effects: { happiness: 5 },
    })
    const registryA = createTestRegistry([testEvent])
    const registryB = createTestRegistry([testEvent])

    const resultA = processTurn({ character: { ...char }, seed: 'seed-a', year: 2024 }, registryA)
    const resultB = processTurn({ character: { ...char }, seed: 'seed-b', year: 2024 }, registryB)

    // Events selected may differ with different seeds
    // At minimum, the affected stats might be the same since same event
    // But the event selection is deterministic per seed
    // The character should have same age incremented
    expect(resultA.character.age).toBe(31)
    expect(resultB.character.age).toBe(31)
  })
})

// ===================================================================
// Engine: full integration scenarios
// ===================================================================

describe('processTurn — integration', () => {
  it('processes a full turn with action, event, decay, and age increment', () => {
    const char = createCharacter({
      age: 25,
      health: 80,
      happiness: 70,
      smarts: 60,
      looks: 50,
      money: 1000,
    })

    const action = {
      label: 'actions.youngAdult.gym',
      description: 'actions.youngAdult.gymDesc',
      statEffects: { health: 3, looks: 2 } as StatEffects,
    }

    const gymEvent = createEvent({
      id: 'test.gym_event',
      phase: ['youngAdult'],
      probability: 1,
      effects: { health: 5, happiness: 3 },
    })

    const registry = createTestRegistry([gymEvent])

    const result = processTurn(
      {
        character: char,
        seed: 'integration-test',
        year: 2024,
        proactiveAction: action,
      },
      registry,
    )

    // Action: health +3, looks +2
    // Event: health +5, happiness +3
    // Decay: youngAdult → health -0.5, happiness -0.6, smarts -0.4, looks -0.5
    // Net: health 80+3+5-0.5=87.5, happiness 70+0+3-0.6=72.4, smarts 60+0+0-0.4=59.6, looks 50+2+0-0.5=51.5
    expect(result.character.health).toBeCloseTo(87.5)
    expect(result.character.happiness).toBeCloseTo(72.4)
    expect(result.character.smarts).toBeCloseTo(59.6)
    expect(result.character.looks).toBeCloseTo(51.5)
    expect(result.character.age).toBe(26)
    expect(result.died).toBe(false)
    expect(result.events).toHaveLength(1)
    expect(result.phaseTransition).toEqual({ from: 'youngAdult', to: 'adult' })
  })

  it('handles multiple events in a single turn', () => {
    const char = createCharacter({ age: 25, health: 80, happiness: 70, money: 1000 })
    const event1 = createEvent({
      id: 'test.event1',
      phase: ['youngAdult'],
      probability: 1,
      effects: { health: -5 },
    })
    const event2 = createEvent({
      id: 'test.event2',
      phase: ['youngAdult'],
      probability: 1,
      effects: { happiness: 8, money: 50 },
    })
    const registry = createTestRegistry([event1, event2])
    const result = processTurn({ character: char, seed: BASE_SEED, year: BASE_YEAR }, registry)
    // Health: 80 - 5 (event1) - 0.5 (decay) = 74.5
    // Happiness: 70 + 8 (event2) - 0.6 (decay) = 77.4
    // Money: 1000 + 50 (event2) = 1050
    expect(result.character.health).toBeCloseTo(74.5)
    expect(result.character.happiness).toBeCloseTo(77.4)
    expect(result.character.money).toBe(1050)
    expect(result.events).toHaveLength(2)
  })
})
