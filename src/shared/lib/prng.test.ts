import { describe, it, expect } from 'vitest'
import {
  randomInRange,
  weightedPick,
  probabilityCheck,
} from './prng'

describe('PRNG Module', () => {
  describe('determinism', () => {
    it('same seed + same year produces the same random value', () => {
      const a = randomInRange('test-seed', 2024, 0, 100)
      const b = randomInRange('test-seed', 2024, 0, 100)
      expect(a).toBe(b)
    })

    it('same seed + same year produces the same weighted pick', () => {
      const items = ['a', 'b', 'c']
      const weights = [1, 1, 1]
      const a = weightedPick('deterministic', 2024, items, weights)
      const b = weightedPick('deterministic', 2024, items, weights)
      expect(a).toBe(b)
    })

    it('same seed + same year produces the same probability check', () => {
      const a = probabilityCheck('consistent', 2024, 0.5)
      const b = probabilityCheck('consistent', 2024, 0.5)
      expect(a).toBe(b)
    })

    it('different seeds produce different results', () => {
      const results = new Set<number>()
      for (let i = 0; i < 10; i++) {
        results.add(randomInRange(`seed-${i}`, 2024, 0, 1000000))
      }
      // With 10 different seeds, we should have a mix of results
      // (very unlikely all 10 are the same)
      expect(results.size).toBeGreaterThan(1)
    })

    it('same seed + different years produce different results', () => {
      const results = new Set<number>()
      for (let year = 2000; year < 2010; year++) {
        results.add(randomInRange('year-test', year, 0, 1000000))
      }
      // With 10 different years, we should have a mix of results
      expect(results.size).toBeGreaterThan(1)
    })
  })

  describe('randomInRange', () => {
    it('returns a number within [min, max] inclusive', () => {
      for (let i = 0; i < 100; i++) {
        const value = randomInRange(`range-test-${i}`, 2024 + i, 5, 10)
        expect(value).toBeGreaterThanOrEqual(5)
        expect(value).toBeLessThanOrEqual(10)
      }
    })

    it('works with negative ranges', () => {
      for (let i = 0; i < 50; i++) {
        const value = randomInRange(`neg-test-${i}`, 2024, -100, -1)
        expect(value).toBeGreaterThanOrEqual(-100)
        expect(value).toBeLessThanOrEqual(-1)
      }
    })

    it('works when min equals max', () => {
      const value = randomInRange('fixed', 2024, 42, 42)
      expect(value).toBe(42)
    })

    it('returns an integer when min and max are integers', () => {
      const value = randomInRange('integer-test', 2024, 0, 100)
      expect(Number.isInteger(value)).toBe(true)
    })
  })

  describe('weightedPick', () => {
    it('returns one of the provided items', () => {
      const items = ['apple', 'banana', 'cherry']
      const weights = [1, 1, 1]
      for (let i = 0; i < 20; i++) {
        const pick = weightedPick(`pick-${i}`, 2024, items, weights)
        expect(items).toContain(pick)
      }
    })

    it('throws error when items and weights lengths differ', () => {
      expect(() =>
        weightedPick('error-test', 2024, ['a', 'b'], [1]),
      ).toThrow()
    })

    it('throws error when weights array is empty', () => {
      expect(() =>
        weightedPick('empty', 2024, ['a'], []),
      ).toThrow()
    })

    it('throws error when items array is empty', () => {
      expect(() =>
        weightedPick('no-items', 2024, [], []),
      ).toThrow()
    })

    it('respects weighted probabilities (heavily weighted item is chosen often)', () => {
      const items = ['rare', 'common']
      const weights = [1, 99]
      let commonCount = 0
      const trials = 200
      for (let i = 0; i < trials; i++) {
        const pick = weightedPick(`weight-test-${i}`, 2024, items, weights)
        if (pick === 'common') commonCount++
      }
      // 'common' should be chosen far more often (~99% of the time)
      expect(commonCount).toBeGreaterThan(trials * 0.8)
    })
  })

  describe('probabilityCheck', () => {
    it('returns a boolean', () => {
      const result = probabilityCheck('bool-check', 2024, 0.5)
      expect(typeof result).toBe('boolean')
    })

    it('always returns true for threshold of 1', () => {
      for (let i = 0; i < 50; i++) {
        expect(probabilityCheck(`always-true-${i}`, 2024, 1)).toBe(true)
      }
    })

    it('always returns false for threshold of 0', () => {
      for (let i = 0; i < 50; i++) {
        expect(probabilityCheck(`always-false-${i}`, 2024, 0)).toBe(false)
      }
    })

    it('returns true approximately at the expected rate', () => {
      const threshold = 0.5
      let trueCount = 0
      const trials = 1000
      for (let i = 0; i < trials; i++) {
        if (probabilityCheck(`rate-test-${i}`, 2024, threshold)) {
          trueCount++
        }
      }
      // With 1000 trials at 0.5 threshold, should be roughly 400-600
      expect(trueCount).toBeGreaterThan(300)
      expect(trueCount).toBeLessThan(700)
    })
  })
})
