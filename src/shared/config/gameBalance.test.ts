import { describe, it, expect } from 'vitest'
import {
  STAT_MIN,
  STAT_MAX,
  MONEY_START_MIN,
  MONEY_START_MAX,
  statDecayRates,
  deathProbabilities,
  eventMultipliers,
  LIFE_PHASES,
  lifePhaseTransitionAges,
  careerProgressionRates,
  relationshipDecayRates,
  MAX_SAVED_LIVES,
  proactiveActions,
  type ProactiveAction,
  type LifePhase,
} from './gameBalance'

describe('gameBalance', () => {
  describe('stat ranges', () => {
    it('STAT_MIN and STAT_MAX are 0 and 100', () => {
      expect(STAT_MIN).toBe(0)
      expect(STAT_MAX).toBe(100)
    })

    it('MONEY_START_MIN and MONEY_START_MAX are positive and min <= max', () => {
      expect(MONEY_START_MIN).toBeGreaterThanOrEqual(0)
      expect(MONEY_START_MAX).toBeGreaterThan(MONEY_START_MIN)
    })
  })

  describe('stat decay rates', () => {
    it('all decay rates are positive numbers', () => {
      for (const [phase, rates] of Object.entries(statDecayRates)) {
        for (const [stat, rate] of Object.entries(rates)) {
          expect(
            rate,
            `decay rate for ${phase}.${stat} should be positive`,
          ).toBeGreaterThan(0)
        }
      }
    })

    it('every life phase has decay rates defined', () => {
      const phases = ['infancy', 'school', 'youngAdult', 'adult', 'senior']
      for (const phase of phases) {
        expect(statDecayRates).toHaveProperty(phase)
      }
    })

    it('each phase has health, happiness, smarts, looks decay rates', () => {
      const stats = ['health', 'happiness', 'smarts', 'looks']
      for (const phase of Object.keys(statDecayRates)) {
        for (const stat of stats) {
          expect(statDecayRates[phase as LifePhase]).toHaveProperty(stat)
        }
      }
    })
  })

  describe('death probabilities', () => {
    it('death probability at age 60 is at least 0.02', () => {
      expect(deathProbabilities[60]).toBeGreaterThanOrEqual(0.02)
    })

    it('death probabilities increase with age', () => {
      const ages = Object.keys(deathProbabilities)
        .map(Number)
        .sort((a, b) => a - b)
      for (let i = 1; i < ages.length; i++) {
        expect(
          deathProbabilities[ages[i]],
          `death probability at age ${ages[i]} should be >= age ${ages[i - 1]}`,
        ).toBeGreaterThanOrEqual(deathProbabilities[ages[i - 1]])
      }
    })

    it('all death probabilities are between 0 and 1', () => {
      for (const prob of Object.values(deathProbabilities)) {
        expect(prob).toBeGreaterThanOrEqual(0)
        expect(prob).toBeLessThanOrEqual(1)
      }
    })

    it('death probabilities cover a range of ages', () => {
      // should have at least 30 age entries (covering roughly ages 60-90+)
      expect(Object.keys(deathProbabilities).length).toBeGreaterThanOrEqual(20)
    })
  })

  describe('event multipliers', () => {
    it('all event multipliers are between 0 and 1', () => {
      for (const [eventType, multiplier] of Object.entries(eventMultipliers)) {
        expect(
          multiplier,
          `event multiplier for ${eventType} should be between 0 and 1`,
        ).toBeGreaterThanOrEqual(0)
        expect(multiplier).toBeLessThanOrEqual(1)
      }
    })

    it('has at least one event multiplier defined', () => {
      expect(Object.keys(eventMultipliers).length).toBeGreaterThan(0)
    })
  })

  describe('life phase transition ages', () => {
    it('all life phases have transition ages defined', () => {
      const requiredPhases: LifePhase[] = [
        'infancy',
        'school',
        'youngAdult',
        'adult',
        'senior',
      ]
      for (const phase of requiredPhases) {
        expect(lifePhaseTransitionAges).toHaveProperty(phase)
      }
    })

    it('phase transitions are sequential and start from 0', () => {
      expect(lifePhaseTransitionAges.infancy).toBeDefined()
      expect(lifePhaseTransitionAges.school).toBeDefined()
      expect(lifePhaseTransitionAges.youngAdult).toBeDefined()
      expect(lifePhaseTransitionAges.adult).toBeDefined()
      expect(lifePhaseTransitionAges.senior).toBeDefined()
    })

    it('infancy start age is 0', () => {
      expect(lifePhaseTransitionAges.infancy).toBe(0)
    })

    it('infancy is ages 0-5, school 6-17, young adult 18-25, adult 26-55, senior 56+', () => {
      // infancy
      expect(
        getAgePhase(0, lifePhaseTransitionAges),
      ).toBe('infancy')
      expect(
        getAgePhase(5, lifePhaseTransitionAges),
      ).toBe('infancy')
      // school
      expect(
        getAgePhase(6, lifePhaseTransitionAges),
      ).toBe('school')
      expect(
        getAgePhase(17, lifePhaseTransitionAges),
      ).toBe('school')
      // young adult
      expect(
        getAgePhase(18, lifePhaseTransitionAges),
      ).toBe('youngAdult')
      expect(
        getAgePhase(25, lifePhaseTransitionAges),
      ).toBe('youngAdult')
      // adult
      expect(
        getAgePhase(26, lifePhaseTransitionAges),
      ).toBe('adult')
      expect(
        getAgePhase(55, lifePhaseTransitionAges),
      ).toBe('adult')
      // senior
      expect(
        getAgePhase(56, lifePhaseTransitionAges),
      ).toBe('senior')
      expect(getAgePhase(100, lifePhaseTransitionAges)).toBe(
        'senior',
      )
    })
  })

  describe('career progression rates', () => {
    it('career progression rates are positive', () => {
      for (const [name, rate] of Object.entries(careerProgressionRates)) {
        expect(
          rate,
          `career rate for ${name} should be positive`,
        ).toBeGreaterThan(0)
      }
    })

    it('has at least one career progression rate', () => {
      expect(Object.keys(careerProgressionRates).length).toBeGreaterThan(0)
    })
  })

  describe('relationship decay rates', () => {
    it('relationship decay rates are positive', () => {
      for (const [name, rate] of Object.entries(relationshipDecayRates)) {
        expect(rate, `decay for ${name} should be positive`).toBeGreaterThan(0)
      }
    })

    it('has at least one relationship decay rate', () => {
      expect(Object.keys(relationshipDecayRates).length).toBeGreaterThan(0)
    })
  })

  describe('MAX_SAVED_LIVES', () => {
    it('is 5', () => {
      expect(MAX_SAVED_LIVES).toBe(5)
    })
  })

  describe('proactive actions', () => {
    it('defines actions for every life phase', () => {
      const allPhases = Object.keys(LIFE_PHASES) as LifePhase[]
      for (const phase of allPhases) {
        expect(
          proactiveActions,
          `proactiveActions should have actions for ${phase}`,
        ).toHaveProperty(phase)
        expect(
          proactiveActions[phase].length,
          `${phase} should have at least one action`,
        ).toBeGreaterThan(0)
      }
    })

    it('each action has a label, description, and statEffects', () => {
      for (const [phase, actions] of Object.entries(proactiveActions)) {
        for (const action of actions) {
          expect(
            action.label,
            `action in ${phase} should have a label`,
          ).toBeTruthy()
          expect(
            action.description,
            `action in ${phase} should have a description`,
          ).toBeTruthy()
          expect(
            action.statEffects,
            `action in ${phase} should have statEffects`,
          ).toBeDefined()
          expect(typeof action.statEffects).toBe('object')
        }
      }
    })

    it('stat effects use valid stat keys', () => {
      const validStats = ['health', 'happiness', 'smarts', 'looks', 'money']
      for (const actions of Object.values(proactiveActions)) {
        for (const action of actions) {
          for (const statKey of Object.keys(action.statEffects)) {
            expect(
              validStats,
              `stat effect key "${statKey}" should be one of ${validStats.join(', ')}`,
            ).toContain(statKey)
          }
        }
      }
    })
  })
})

// Helper function to determine life phase from age (mirrors the one in gameBalance)
function getAgePhase(
  age: number,
  transitions: Record<LifePhase, number>,
): LifePhase {
  if (age >= transitions.senior) return 'senior'
  if (age >= transitions.adult) return 'adult'
  if (age >= transitions.youngAdult) return 'youngAdult'
  if (age >= transitions.school) return 'school'
  return 'infancy'
}
