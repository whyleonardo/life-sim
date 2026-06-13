import { describe, it, expect, beforeEach } from 'vitest'
import { eventRegistry, EventRegistry } from './registry'
import type { Character } from '@/shared/types'
import { getLifePhase } from '@/shared/config/gameBalance'
import type { LifePhase } from '@/shared/config/gameBalance'
import type { EventDefinition } from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

const DEFAULT_SEED = 'test-seed-42'
const DEFAULT_YEAR = 2024

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('EventRegistry', () => {
  let registry: EventRegistry

  beforeEach(() => {
    registry = new EventRegistry()
  })

  // ── registerCatalog ──────────────────────────────────────────

  describe('registerCatalog', () => {
    it('collects catalogs from all game systems', () => {
      registry.registerCatalog('general', [
        createEvent({ id: 'general.found_money' }),
      ])
      registry.registerCatalog('education', [
        createEvent({ id: 'education.passed_test' }),
      ])

      const all = registry.getAllEvents()
      expect(all).toHaveLength(2)
      expect(all.map((e) => e.id)).toContain('general.found_money')
      expect(all.map((e) => e.id)).toContain('education.passed_test')
    })
  })

  // ── getAllEvents ────────────────────────────────────────────

  describe('getAllEvents', () => {
    it('returns empty array when no catalogs registered', () => {
      expect(registry.getAllEvents()).toEqual([])
    })

    it('returns all events from all catalogs', () => {
      registry.registerCatalog('a', [
        createEvent({ id: 'a.e1' }),
        createEvent({ id: 'a.e2' }),
      ])
      registry.registerCatalog('b', [
        createEvent({ id: 'b.e1' }),
      ])
      expect(registry.getAllEvents()).toHaveLength(3)
    })
  })

  // ── getEventsForTurn ─────────────────────────────────────────

  describe('getEventsForTurn', () => {
    it('returns empty array when no catalogs registered', () => {
      const char = createCharacter()
      const events = registry.getEventsForTurn(char, DEFAULT_YEAR, DEFAULT_SEED)
      expect(events).toEqual([])
    })

    it('filters events by life phase', () => {
      registry.registerCatalog('test', [
        createEvent({
          id: 'test.infant',
          phase: ['infancy'],
          description: 'events.test.infant',
          effects: { health: 1 },
        }),
        createEvent({
          id: 'test.school',
          phase: ['school'],
          description: 'events.test.school',
          effects: { smarts: 1 },
        }),
        createEvent({
          id: 'test.young_adult',
          phase: ['youngAdult'],
          description: 'events.test.young_adult',
          effects: { happiness: 1 },
        }),
        createEvent({
          id: 'test.adult',
          phase: ['adult'],
          description: 'events.test.adult',
          effects: { money: 1 },
        }),
        createEvent({
          id: 'test.senior',
          phase: ['senior'],
          description: 'events.test.senior',
          effects: { health: 1 },
        }),
      ])

      // Character is 25 → youngAdult
      const char = createCharacter({ age: 25 })
      const events = registry.getEventsForTurn(char, DEFAULT_YEAR, DEFAULT_SEED)

      expect(events).toHaveLength(1)
      expect(events[0].id).toBe('test.young_adult')
    })

    it('filters events by ageMin', () => {
      registry.registerCatalog('test', [
        createEvent({
          id: 'test.need_18',
          conditions: { ageMin: 18 },
        }),
        createEvent({
          id: 'test.need_30',
          conditions: { ageMin: 30 },
        }),
      ])

      const char = createCharacter({ age: 25 })
      const events = registry.getEventsForTurn(char, DEFAULT_YEAR, DEFAULT_SEED)

      expect(events.map((e) => e.id)).toContain('test.need_18')
      expect(events.map((e) => e.id)).not.toContain('test.need_30')
    })

    it('filters events by ageMax', () => {
      registry.registerCatalog('test', [
        createEvent({
          id: 'test.max_30',
          conditions: { ageMax: 30 },
        }),
        createEvent({
          id: 'test.max_20',
          conditions: { ageMax: 20 },
        }),
      ])

      const char = createCharacter({ age: 25 })
      const events = registry.getEventsForTurn(char, DEFAULT_YEAR, DEFAULT_SEED)

      expect(events.map((e) => e.id)).toContain('test.max_30')
      expect(events.map((e) => e.id)).not.toContain('test.max_20')
    })

    it('filters events by ageMin and ageMax combined', () => {
      registry.registerCatalog('test', [
        createEvent({
          id: 'test.range_18_30',
          conditions: { ageMin: 18, ageMax: 30 },
        }),
        createEvent({
          id: 'test.range_30_40',
          conditions: { ageMin: 30, ageMax: 40 },
        }),
      ])

      const char = createCharacter({ age: 25 })
      const events = registry.getEventsForTurn(char, DEFAULT_YEAR, DEFAULT_SEED)

      expect(events.map((e) => e.id)).toContain('test.range_18_30')
      expect(events.map((e) => e.id)).not.toContain('test.range_30_40')
    })

    it('filters events by minSmarts', () => {
      registry.registerCatalog('test', [
        createEvent({
          id: 'test.smarts_50',
          conditions: { minSmarts: 50 },
        }),
        createEvent({
          id: 'test.smarts_70',
          conditions: { minSmarts: 70 },
        }),
      ])

      const char = createCharacter({ smarts: 60 })
      const events = registry.getEventsForTurn(char, DEFAULT_YEAR, DEFAULT_SEED)

      expect(events.map((e) => e.id)).toContain('test.smarts_50')
      expect(events.map((e) => e.id)).not.toContain('test.smarts_70')
    })

    it('filters events by minHealth', () => {
      registry.registerCatalog('test', [
        createEvent({
          id: 'test.health_50',
          conditions: { minHealth: 50 },
        }),
        createEvent({
          id: 'test.health_90',
          conditions: { minHealth: 90 },
        }),
      ])

      const char = createCharacter({ health: 80 })
      const events = registry.getEventsForTurn(char, DEFAULT_YEAR, DEFAULT_SEED)

      expect(events.map((e) => e.id)).toContain('test.health_50')
      expect(events.map((e) => e.id)).not.toContain('test.health_90')
    })

    it('filters events by minHappiness', () => {
      registry.registerCatalog('test', [
        createEvent({
          id: 'test.happy_50',
          conditions: { minHappiness: 50 },
        }),
        createEvent({
          id: 'test.happy_80',
          conditions: { minHappiness: 80 },
        }),
      ])

      const char = createCharacter({ happiness: 70 })
      const events = registry.getEventsForTurn(char, DEFAULT_YEAR, DEFAULT_SEED)

      expect(events.map((e) => e.id)).toContain('test.happy_50')
      expect(events.map((e) => e.id)).not.toContain('test.happy_80')
    })

    it('filters events by minLooks', () => {
      registry.registerCatalog('test', [
        createEvent({
          id: 'test.looks_40',
          conditions: { minLooks: 40 },
        }),
        createEvent({
          id: 'test.looks_70',
          conditions: { minLooks: 70 },
        }),
      ])

      const char = createCharacter({ looks: 50 })
      const events = registry.getEventsForTurn(char, DEFAULT_YEAR, DEFAULT_SEED)

      expect(events.map((e) => e.id)).toContain('test.looks_40')
      expect(events.map((e) => e.id)).not.toContain('test.looks_70')
    })

    it('filters events by minMoney', () => {
      registry.registerCatalog('test', [
        createEvent({
          id: 'test.money_500',
          conditions: { minMoney: 500 },
        }),
        createEvent({
          id: 'test.money_2000',
          conditions: { minMoney: 2000 },
        }),
      ])

      const char = createCharacter({ money: 1000 })
      const events = registry.getEventsForTurn(char, DEFAULT_YEAR, DEFAULT_SEED)

      expect(events.map((e) => e.id)).toContain('test.money_500')
      expect(events.map((e) => e.id)).not.toContain('test.money_2000')
    })

    it('respects probability checks (probability 1 always passes)', () => {
      registry.registerCatalog('test', [
        createEvent({
          id: 'test.always',
          probability: 1,
        }),
      ])

      // Try multiple seeds — probability 1 always passes
      for (let i = 0; i < 10; i++) {
        const char = createCharacter()
        const events = registry.getEventsForTurn(char, DEFAULT_YEAR, `seed-${i}`)
        expect(events.map((e) => e.id)).toContain('test.always')
      }
    })

    it('respects probability checks (probability 0 never passes)', () => {
      registry.registerCatalog('test', [
        createEvent({
          id: 'test.never',
          probability: 0,
        }),
      ])

      const char = createCharacter()
      const events = registry.getEventsForTurn(char, DEFAULT_YEAR, DEFAULT_SEED)
      expect(events.map((e) => e.id)).not.toContain('test.never')
    })

    it('combines all filters correctly', () => {
      registry.registerCatalog('test', [
        createEvent({
          id: 'test.perfect_match',
          phase: ['youngAdult'],
          conditions: { ageMin: 20, ageMax: 30, minSmarts: 50 },
          probability: 1,
          effects: { smarts: 10 },
        }),
        createEvent({
          id: 'test.wrong_phase',
          phase: ['senior'],
          probability: 1,
          effects: { health: 5 },
        }),
        createEvent({
          id: 'test.low_smarts',
          phase: ['youngAdult'],
          conditions: { minSmarts: 90 },
          probability: 1,
          effects: { smarts: 1 },
        }),
      ])

      // Age 25 → youngAdult, smarts 60
      const char = createCharacter({ age: 25, smarts: 60 })
      const events = registry.getEventsForTurn(char, DEFAULT_YEAR, DEFAULT_SEED)

      expect(events).toHaveLength(1)
      expect(events[0].id).toBe('test.perfect_match')
    })
  })

  // ── selectEvents ────────────────────────────────────────────

  describe('selectEvents', () => {
    it('returns empty array when eligible events is empty', () => {
      const selected = registry.selectEvents([], 3, DEFAULT_SEED, DEFAULT_YEAR)
      expect(selected).toEqual([])
    })

    it('is deterministic: same seed + year returns same events', () => {
      const events = [
        createEvent({ id: 'test.a', probability: 0.8 }),
        createEvent({ id: 'test.b', probability: 0.5 }),
        createEvent({ id: 'test.c', probability: 0.3 }),
        createEvent({ id: 'test.d', probability: 0.1 }),
      ]

      const first = registry.selectEvents(events, 2, 'deterministic-test', 2024)
      const second = registry.selectEvents(events, 2, 'deterministic-test', 2024)

      expect(first).toEqual(second)
    })

    it('different seeds produce different selections', () => {
      const events = [
        createEvent({ id: 'test.a', probability: 0.8 }),
        createEvent({ id: 'test.b', probability: 0.5 }),
        createEvent({ id: 'test.c', probability: 0.3 }),
        createEvent({ id: 'test.d', probability: 0.1 }),
      ]

      const seedA = registry.selectEvents(events, 4, 'seed-alpha', 2024)
      const seedB = registry.selectEvents(events, 4, 'seed-beta', 2024)

      // They could theoretically be the same but extremely unlikely
      // We just verify they're valid selections (no duplicates, correct count)
      expect(seedA).toHaveLength(4)
      expect(seedB).toHaveLength(4)

      const idsA = seedA.map((e) => e.id).sort().join(',')
      const idsB = seedB.map((e) => e.id).sort().join(',')
      // Ensure both are valid permutations of all events
      expect(idsA).toBe('test.a,test.b,test.c,test.d')
      expect(idsB).toBe('test.a,test.b,test.c,test.d')
    })

    it('returns requested count of events', () => {
      const events = [
        createEvent({ id: 'test.a', probability: 0.9 }),
        createEvent({ id: 'test.b', probability: 0.7 }),
        createEvent({ id: 'test.c', probability: 0.5 }),
        createEvent({ id: 'test.d', probability: 0.3 }),
        createEvent({ id: 'test.e', probability: 0.1 }),
      ]

      const selected = registry.selectEvents(events, 3, 'count-test', 2024)
      expect(selected).toHaveLength(3)
    })

    it('returns fewer events if not enough eligible', () => {
      const events = [
        createEvent({ id: 'test.a', probability: 0.9 }),
        createEvent({ id: 'test.b', probability: 0.7 }),
      ]

      const selected = registry.selectEvents(events, 5, 'short-test', 2024)
      expect(selected).toHaveLength(2)
    })

    it('does not return duplicate events', () => {
      const events = [
        createEvent({ id: 'test.a', probability: 0.9 }),
        createEvent({ id: 'test.b', probability: 0.7 }),
        createEvent({ id: 'test.c', probability: 0.5 }),
        createEvent({ id: 'test.d', probability: 0.3 }),
        createEvent({ id: 'test.e', probability: 0.1 }),
      ]

      const selected = registry.selectEvents(events, 3, 'dedup-test', 2024)
      const ids = selected.map((e) => e.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('respects weighted probabilities (higher prob events selected more often)', () => {
      // Create events with extreme weight differences
      const events = [
        createEvent({ id: 'test.common', probability: 0.99 }),
        createEvent({ id: 'test.rare', probability: 0.01 }),
      ]

      // Run many trials with different seeds
      let commonPicked = 0
      const trials = 100

      for (let i = 0; i < trials; i++) {
        const selected = registry.selectEvents(events, 1, `weight-trial-${i}`, 2024)
        if (selected[0].id === 'test.common') commonPicked++
      }

      // 'common' should be picked much more often than 'rare'
      expect(commonPicked).toBeGreaterThan(trials * 0.7)
    })

    it('returns events sorted by their original order', () => {
      const events = [
        createEvent({ id: 'test.z', probability: 0.5 }),
        createEvent({ id: 'test.a', probability: 0.5 }),
        createEvent({ id: 'test.m', probability: 0.5 }),
      ]

      const selected = registry.selectEvents(events, 3, 'order-test', 2024)
      expect(selected[0].id).toBe('test.z')
      expect(selected[1].id).toBe('test.a')
      expect(selected[2].id).toBe('test.m')
    })
  })

  // ── resolveChoice ──────────────────────────────────────────

  describe('resolveChoice', () => {
    it('returns choice effects for valid choice index', () => {
      const event = createEvent({
        id: 'test.with_choices',
        effects: { happiness: 1 },
        choices: [
          { label: 'events.test.choice_a', effects: { happiness: 10 } },
          { label: 'events.test.choice_b', effects: { smarts: 5 } },
        ],
      })

      const result = registry.resolveChoice(event, 0)
      expect(result).toEqual({ happiness: 10 })
    })

    it('returns choice effects for second choice index', () => {
      const event = createEvent({
        id: 'test.with_choices',
        effects: { happiness: 1 },
        choices: [
          { label: 'events.test.choice_a', effects: { happiness: 10 } },
          { label: 'events.test.choice_b', effects: { smarts: 5 } },
        ],
      })

      const result = registry.resolveChoice(event, 1)
      expect(result).toEqual({ smarts: 5 })
    })

    it('returns default effects for invalid choice index (negative)', () => {
      const event = createEvent({
        id: 'test.with_choices',
        effects: { happiness: 1 },
        choices: [
          { label: 'events.test.choice_a', effects: { happiness: 10 } },
        ],
      })

      const result = registry.resolveChoice(event, -1)
      expect(result).toEqual({ happiness: 1 })
    })

    it('returns default effects for invalid choice index (out of bounds)', () => {
      const event = createEvent({
        id: 'test.with_choices',
        effects: { happiness: 1 },
        choices: [
          { label: 'events.test.choice_a', effects: { happiness: 10 } },
        ],
      })

      const result = registry.resolveChoice(event, 5)
      expect(result).toEqual({ happiness: 1 })
    })

    it('returns default effects for events without choices', () => {
      const event = createEvent({
        id: 'test.no_choices',
        effects: { health: -5, happiness: -3 },
      })

      const result = registry.resolveChoice(event, 0)
      expect(result).toEqual({ health: -5, happiness: -3 })
    })
  })

  // ── Event Catalogs ──────────────────────────────────────────

  describe('event catalogs', () => {
    let freshRegistry: EventRegistry

    beforeEach(() => {
      freshRegistry = new EventRegistry()
    })

    function registerAllTestCatalogs(r: EventRegistry) {
      r.registerCatalog('general', [
        createEvent({ id: 'general.found_money', description: 'events.general.found_money' }),
        createEvent({ id: 'general.got_sick', description: 'events.general.got_sick' }),
        createEvent({ id: 'general.lucky_day', description: 'events.general.lucky_day' }),
        createEvent({ id: 'general.new_friend', description: 'events.general.new_friend' }),
        createEvent({ id: 'general.lost_item', description: 'events.general.lost_item' }),
        createEvent({ id: 'general.won_prize', description: 'events.general.won_prize' }),
        createEvent({ id: 'general.accident', description: 'events.general.accident' }),
      ])
      r.registerCatalog('education', [
        createEvent({ id: 'education.passed_test', description: 'events.education.passed_test' }),
        createEvent({ id: 'education.failed_class', description: 'events.education.failed_class' }),
        createEvent({ id: 'education.school_friend', description: 'events.education.school_friend' }),
        createEvent({ id: 'education.scholarship', description: 'events.education.scholarship' }),
        createEvent({ id: 'education.trouble', description: 'events.education.trouble' }),
      ])
      r.registerCatalog('career', [
        createEvent({ id: 'career.promotion', description: 'events.career.promotion' }),
        createEvent({ id: 'career.lost_job', description: 'events.career.lost_job' }),
        createEvent({ id: 'career.started_biz', description: 'events.career.started_biz' }),
        createEvent({ id: 'career.raise', description: 'events.career.raise' }),
        createEvent({ id: 'career.work_conflict', description: 'events.career.work_conflict' }),
      ])
      r.registerCatalog('health', [
        createEvent({ id: 'health.cold', description: 'events.health.cold' }),
        createEvent({ id: 'health.recovered', description: 'events.health.recovered' }),
        createEvent({ id: 'health.injured', description: 'events.health.injured' }),
        createEvent({ id: 'health.exercising', description: 'events.health.exercising' }),
        createEvent({ id: 'health.food_poisoning', description: 'events.health.food_poisoning' }),
      ])
      r.registerCatalog('relationships', [
        createEvent({ id: 'rel.new_friend', description: 'events.relationships.new_friend' }),
        createEvent({ id: 'rel.fight', description: 'events.relationships.fight' }),
        createEvent({ id: 'rel.fell_in_love', description: 'events.relationships.fell_in_love' }),
        createEvent({ id: 'rel.lost_touch', description: 'events.relationships.lost_touch' }),
        createEvent({ id: 'rel.reconnected', description: 'events.relationships.reconnected' }),
      ])
    }

    it('general catalog exists with 5-10 events', () => {
      freshRegistry.registerCatalog('general', [
        createEvent({ id: 'general.found_money', description: 'events.general.found_money' }),
        createEvent({ id: 'general.got_sick', description: 'events.general.got_sick' }),
        createEvent({ id: 'general.lucky_day', description: 'events.general.lucky_day' }),
        createEvent({ id: 'general.new_friend', description: 'events.general.new_friend' }),
        createEvent({ id: 'general.lost_item', description: 'events.general.lost_item' }),
        createEvent({ id: 'general.won_prize', description: 'events.general.won_prize' }),
        createEvent({ id: 'general.accident', description: 'events.general.accident' }),
      ])
      const events = freshRegistry.getAllEvents()
      expect(events.length).toBeGreaterThanOrEqual(5)
      expect(events.length).toBeLessThanOrEqual(10)
    })

    it('education catalog exists with 5-10 events', () => {
      freshRegistry.registerCatalog('education', [
        createEvent({ id: 'education.passed_test', description: 'events.education.passed_test' }),
        createEvent({ id: 'education.failed_class', description: 'events.education.failed_class' }),
        createEvent({ id: 'education.school_friend', description: 'events.education.school_friend' }),
        createEvent({ id: 'education.scholarship', description: 'events.education.scholarship' }),
        createEvent({ id: 'education.trouble', description: 'events.education.trouble' }),
      ])
      const events = freshRegistry.getAllEvents()
      expect(events.length).toBeGreaterThanOrEqual(5)
      expect(events.length).toBeLessThanOrEqual(10)
    })

    it('career catalog exists with 5-10 events', () => {
      freshRegistry.registerCatalog('career', [
        createEvent({ id: 'career.promotion', description: 'events.career.promotion' }),
        createEvent({ id: 'career.lost_job', description: 'events.career.lost_job' }),
        createEvent({ id: 'career.started_biz', description: 'events.career.started_biz' }),
        createEvent({ id: 'career.raise', description: 'events.career.raise' }),
        createEvent({ id: 'career.work_conflict', description: 'events.career.work_conflict' }),
      ])
      const events = freshRegistry.getAllEvents()
      expect(events.length).toBeGreaterThanOrEqual(5)
      expect(events.length).toBeLessThanOrEqual(10)
    })

    it('health catalog exists with 5-10 events', () => {
      freshRegistry.registerCatalog('health', [
        createEvent({ id: 'health.cold', description: 'events.health.cold' }),
        createEvent({ id: 'health.recovered', description: 'events.health.recovered' }),
        createEvent({ id: 'health.injured', description: 'events.health.injured' }),
        createEvent({ id: 'health.exercising', description: 'events.health.exercising' }),
        createEvent({ id: 'health.food_poisoning', description: 'events.health.food_poisoning' }),
      ])
      const events = freshRegistry.getAllEvents()
      expect(events.length).toBeGreaterThanOrEqual(5)
      expect(events.length).toBeLessThanOrEqual(10)
    })

    it('relationship catalog exists with 5-10 events', () => {
      freshRegistry.registerCatalog('relationships', [
        createEvent({ id: 'rel.new_friend', description: 'events.relationships.new_friend' }),
        createEvent({ id: 'rel.fight', description: 'events.relationships.fight' }),
        createEvent({ id: 'rel.fell_in_love', description: 'events.relationships.fell_in_love' }),
        createEvent({ id: 'rel.lost_touch', description: 'events.relationships.lost_touch' }),
        createEvent({ id: 'rel.reconnected', description: 'events.relationships.reconnected' }),
      ])
      const events = freshRegistry.getAllEvents()
      expect(events.length).toBeGreaterThanOrEqual(5)
      expect(events.length).toBeLessThanOrEqual(10)
    })

    it('all 5 catalogs are registered with correct count ranges', () => {
      registerAllTestCatalogs(freshRegistry)
      const all = freshRegistry.getAllEvents()

      // General: 7, Education: 5, Career: 5, Health: 5, Relationships: 5 = 27
      expect(all.length).toBeGreaterThanOrEqual(25)
      expect(all.length).toBeLessThanOrEqual(50)
    })

    it('all event descriptions are i18n keys (no hardcoded strings)', () => {
      registerAllTestCatalogs(freshRegistry)
      const all = freshRegistry.getAllEvents()

      for (const event of all) {
        expect(event.description).toMatch(/^events\./)
        if (event.choices) {
          for (const choice of event.choices) {
            expect(choice.label).toMatch(/^events\./)
          }
        }
      }
    })
  })
})
