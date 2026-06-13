import { describe, it, expect } from 'vitest'
import { createCharacter, customizeCharacter } from './factory'
import {
  STAT_MIN,
  STAT_MAX,
  MONEY_START_MIN,
  MONEY_START_MAX,
} from '@/shared/config/gameBalance'
import { maleNames, femaleNames } from './data/names'

describe('Character Factory', () => {
  describe('createCharacter', () => {
    it('age starts at 0', () => {
      const result = createCharacter('age-test', 2024)
      expect(result.character.age).toBe(0)
    })

    it('gender is either male or female', () => {
      for (let i = 0; i < 50; i++) {
        const result = createCharacter(`gender-test-${i}`, 2024)
        expect(['male', 'female']).toContain(result.character.gender)
      }
    })

    it('name is from the appropriate name list based on gender', () => {
      // Test with many seeds to cover both genders
      for (let i = 0; i < 50; i++) {
        const result = createCharacter(`name-list-test-${i}`, 2024)
        if (result.character.gender === 'male') {
          expect(maleNames).toContain(result.character.name)
        } else {
          expect(femaleNames).toContain(result.character.name)
        }
      }
    })

    it('stats are within configured ranges', () => {
      const result = createCharacter('stats-test', 2024)
      expect(result.character.health).toBeGreaterThanOrEqual(STAT_MIN)
      expect(result.character.health).toBeLessThanOrEqual(STAT_MAX)
      expect(result.character.happiness).toBeGreaterThanOrEqual(STAT_MIN)
      expect(result.character.happiness).toBeLessThanOrEqual(STAT_MAX)
      expect(result.character.smarts).toBeGreaterThanOrEqual(STAT_MIN)
      expect(result.character.smarts).toBeLessThanOrEqual(STAT_MAX)
      expect(result.character.looks).toBeGreaterThanOrEqual(STAT_MIN)
      expect(result.character.looks).toBeLessThanOrEqual(STAT_MAX)
    })

    it('money is within configured range', () => {
      // Test with many seeds for confidence
      for (let i = 0; i < 20; i++) {
        const result = createCharacter(`money-range-test-${i}`, 2024)
        expect(result.character.money).toBeGreaterThanOrEqual(MONEY_START_MIN)
        expect(result.character.money).toBeLessThanOrEqual(MONEY_START_MAX)
      }
    })

    it('same seed produces identical character (determinism)', () => {
      const a = createCharacter('deterministic-test', 2024)
      const b = createCharacter('deterministic-test', 2024)
      expect(a.character).toEqual(b.character)
      expect(a.familyRelationships).toEqual(b.familyRelationships)
    })

    it('reroll with new seed produces different stats', () => {
      const a = createCharacter('reroll-a', 2024)
      const b = createCharacter('reroll-b', 2024)
      // All stats should differ (extremely unlikely all 5 match across seeds)
      const statsA = [
        a.character.health,
        a.character.happiness,
        a.character.smarts,
        a.character.looks,
        a.character.money,
      ]
      const statsB = [
        b.character.health,
        b.character.happiness,
        b.character.smarts,
        b.character.looks,
        b.character.money,
      ]
      expect(statsA).not.toEqual(statsB)
    })

    it('reroll with different year produces different character', () => {
      const a = createCharacter('year-reroll', 2024)
      const b = createCharacter('year-reroll', 2025)
      const statsA = [
        a.character.gender,
        a.character.health,
        a.character.happiness,
        a.character.smarts,
        a.character.looks,
        a.character.money,
      ]
      const statsB = [
        b.character.gender,
        b.character.health,
        b.character.happiness,
        b.character.smarts,
        b.character.looks,
        b.character.money,
      ]
      expect(statsA).not.toEqual(statsB)
    })

    it('family relationships include exactly 2 parents', () => {
      const result = createCharacter('parents-test', 2024)
      expect(result.familyRelationships.length).toBeGreaterThanOrEqual(2)
      const parents = result.familyRelationships.slice(0, 2)
      expect(parents).toHaveLength(2)
      for (const parent of parents) {
        expect(parent.type).toBe('family')
      }
    })

    it('one parent is male and one parent is female', () => {
      for (let i = 0; i < 20; i++) {
        const result = createCharacter(`parent-gender-${i}`, 2024)
        const parents = result.familyRelationships.slice(0, 2)
        const genders = parents.map((p) => {
          // Parents have names; infer gender from whether name is in male/female list
          if (maleNames.includes(p.name)) return 'male'
          if (femaleNames.includes(p.name)) return 'female'
          return 'unknown'
        })
        expect(genders).toContain('male')
        expect(genders).toContain('female')
      }
    })

    it('parent relationships have closeness 80-100', () => {
      for (let i = 0; i < 20; i++) {
        const result = createCharacter(`parent-closeness-${i}`, 2024)
        const parents = result.familyRelationships.slice(0, 2)
        for (const parent of parents) {
          expect(parent.closeness).toBeGreaterThanOrEqual(80)
          expect(parent.closeness).toBeLessThanOrEqual(100)
        }
      }
    })

    it('sibling relationships have type family and closeness 50-80', () => {
      let foundSibling = false
      for (let i = 0; i < 100; i++) {
        const result = createCharacter(`sibling-test-${i}`, 2024)
        const siblings = result.familyRelationships.slice(2)
        if (siblings.length > 0) {
          foundSibling = true
          for (const sibling of siblings) {
            expect(sibling.type).toBe('family')
            expect(sibling.closeness).toBeGreaterThanOrEqual(50)
            expect(sibling.closeness).toBeLessThanOrEqual(80)
          }
        }
      }
      // 0-2 siblings is valid range; at least some seeds should produce siblings
      // with ~33% chance per sibling slot, over 100 seeds we should see some
      expect(foundSibling).toBe(true)
    })

    it('number of siblings is between 0 and 2', () => {
      for (let i = 0; i < 50; i++) {
        const result = createCharacter(`sibling-count-${i}`, 2024)
        const siblings = result.familyRelationships.slice(2)
        expect(siblings.length).toBeGreaterThanOrEqual(0)
        expect(siblings.length).toBeLessThanOrEqual(2)
      }
    })

    it('returns character without id or gameId', () => {
      const result = createCharacter('no-id-test', 2024)
      expect(result.character).not.toHaveProperty('id')
      expect(result.character).not.toHaveProperty('gameId')
      for (const rel of result.familyRelationships) {
        expect(rel).not.toHaveProperty('id')
        expect(rel).not.toHaveProperty('gameId')
      }
    })
  })

  describe('customizeCharacter', () => {
    it('custom name override works', () => {
      const result = createCharacter('custom-name-test', 2024)
      const customized = customizeCharacter(result, { name: 'João' })
      expect(customized.character.name).toBe('João')
      // Gender should remain unchanged
      expect(customized.character.gender).toBe(result.character.gender)
    })

    it('custom gender override works', () => {
      const result = createCharacter('custom-gender-test', 2024)
      const customized = customizeCharacter(result, { gender: 'female' })
      expect(customized.character.gender).toBe('female')
      // Name should remain unchanged
      expect(customized.character.name).toBe(result.character.name)
    })

    it('both name and gender can be overridden together', () => {
      const result = createCharacter('custom-both-test', 2024)
      const customized = customizeCharacter(result, {
        name: 'Maria',
        gender: 'female',
      })
      expect(customized.character.name).toBe('Maria')
      expect(customized.character.gender).toBe('female')
    })

    it('partial override (empty) keeps original values', () => {
      const result = createCharacter('partial-test', 2024)
      const customized = customizeCharacter(result, {})
      expect(customized.character.name).toBe(result.character.name)
      expect(customized.character.gender).toBe(result.character.gender)
      expect(customized.character.health).toBe(result.character.health)
      expect(customized.familyRelationships).toEqual(
        result.familyRelationships,
      )
    })

    it('does not mutate original result', () => {
      const result = createCharacter('immutable-test', 2024)
      const originalName = result.character.name
      const originalGender = result.character.gender
      customizeCharacter(result, { name: 'Novo', gender: 'female' })
      expect(result.character.name).toBe(originalName)
      expect(result.character.gender).toBe(originalGender)
    })
  })
})
