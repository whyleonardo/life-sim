import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/shared/db/database'
import { useCharacterCreationStore } from './store'
import { createCharacter } from './factory'
import type { CharacterCreationResult } from './factory'

// ── Mock seed generation to make tests deterministic ──────

const mockSeeds = ['test-seed-1', 'test-seed-2', 'test-seed-3']
let seedIndex = 0

vi.mock('./store', async () => {
  const actual = await vi.importActual('./store')
  return actual
})

// We'll inject seeds via the store's _generateSeed override for testing

// ── Reset database and store before each test ────────────

beforeEach(async () => {
  await db.games.clear()
  await db.characters.clear()
  await db.lifeEvents.clear()
  await db.relationships.clear()
  await db.careers.clear()
  seedIndex = 0
  useCharacterCreationStore.setState({
    seed: '',
    creationResult: null,
    customName: null,
    customGender: null,
    saving: false,
    error: null,
  })
})

// ═════════════════════════════════════════════════════════
// Character Creation Store Tests
// ═════════════════════════════════════════════════════════

describe('CharacterCreationStore', () => {
  describe('initialize', () => {
    it('generates a character with randomized stats on initialize', () => {
      const store = useCharacterCreationStore.getState()
      expect(store.creationResult).toBeNull()

      store.initialize()

      const updated = useCharacterCreationStore.getState()
      expect(updated.creationResult).not.toBeNull()
      expect(updated.seed).toBeTruthy()
      expect(updated.creationResult!.character).toBeDefined()
      expect(updated.creationResult!.character.name).toBeTruthy()
      expect(updated.creationResult!.character.gender).toMatch(/^(male|female)$/)
      expect(updated.creationResult!.character.age).toBe(0)
      expect(updated.creationResult!.character.health).toBeGreaterThanOrEqual(0)
      expect(updated.creationResult!.character.health).toBeLessThanOrEqual(100)
      expect(updated.creationResult!.character.happiness).toBeGreaterThanOrEqual(0)
      expect(updated.creationResult!.character.happiness).toBeLessThanOrEqual(100)
      expect(updated.creationResult!.character.smarts).toBeGreaterThanOrEqual(0)
      expect(updated.creationResult!.character.smarts).toBeLessThanOrEqual(100)
      expect(updated.creationResult!.character.looks).toBeGreaterThanOrEqual(0)
      expect(updated.creationResult!.character.looks).toBeLessThanOrEqual(100)
    })

    it('generates family relationships on initialize', () => {
      const store = useCharacterCreationStore.getState()
      store.initialize()

      const updated = useCharacterCreationStore.getState()
      expect(updated.creationResult!.familyRelationships.length).toBeGreaterThanOrEqual(2) // at least 2 parents
    })

    it('clears previous customizations on initialize', () => {
      const store = useCharacterCreationStore.getState()
      store.initialize()
      store.setName('Custom Name')
      store.setGender('female')

      // Re-initialize should clear customizations
      store.initialize()

      const updated = useCharacterCreationStore.getState()
      expect(updated.customName).toBeNull()
      expect(updated.customGender).toBeNull()
    })
  })

  describe('reroll', () => {
    it('generates a completely new character with a new seed', () => {
      const store = useCharacterCreationStore.getState()
      store.initialize()

      const firstResult = useCharacterCreationStore.getState().creationResult!
      const firstSeed = useCharacterCreationStore.getState().seed

      store.reroll()

      const updated = useCharacterCreationStore.getState()
      // New seed should be different (extremely unlikely to match)
      expect(updated.seed).not.toBe(firstSeed)
      // New character should be generated
      expect(updated.creationResult).not.toBeNull()
    })

    it('clears customizations on reroll', () => {
      const store = useCharacterCreationStore.getState()
      store.initialize()
      store.setName('Custom Name')
      store.setGender('female')

      store.reroll()

      const updated = useCharacterCreationStore.getState()
      expect(updated.customName).toBeNull()
      expect(updated.customGender).toBeNull()
    })
  })

  describe('setName', () => {
    it('updates custom name without changing the creation result', () => {
      const store = useCharacterCreationStore.getState()
      store.initialize()

      const originalName = useCharacterCreationStore.getState().creationResult!.character.name
      store.setName('New Name')

      const updated = useCharacterCreationStore.getState()
      expect(updated.customName).toBe('New Name')
      // Original creation result should be unchanged
      expect(updated.creationResult!.character.name).toBe(originalName)
    })
  })

  describe('setGender', () => {
    it('updates custom gender without changing the creation result', () => {
      const store = useCharacterCreationStore.getState()
      store.initialize()

      const originalGender = useCharacterCreationStore.getState().creationResult!.character.gender
      store.setGender('female')

      const updated = useCharacterCreationStore.getState()
      expect(updated.customGender).toBe('female')
      // Original creation result should be unchanged
      expect(updated.creationResult!.character.gender).toBe(originalGender)
    })
  })

  describe('confirmCreation', () => {
    it('saves game, character, and relationships to Dexie and returns game ID', async () => {
      const store = useCharacterCreationStore.getState()
      store.initialize()

      const creationResult = useCharacterCreationStore.getState().creationResult!
      const gameId = await store.confirmCreation()

      expect(gameId).toBeDefined()
      expect(typeof gameId).toBe('number')

      // Verify game was saved
      const game = await db.games.get(gameId)
      expect(game).toBeDefined()
      expect(game!.seed).toBe(useCharacterCreationStore.getState().seed)

      // Verify character was saved
      const character = await db.characters.where('gameId').equals(gameId).first()
      expect(character).toBeDefined()
      expect(character!.name).toBe(creationResult.character.name)
      expect(character!.gender).toBe(creationResult.character.gender)

      // Verify relationships were saved
      const relationships = await db.relationships.where('gameId').equals(gameId).toArray()
      expect(relationships.length).toBe(creationResult.familyRelationships.length)
    })

    it('applies custom name and gender before saving', async () => {
      const store = useCharacterCreationStore.getState()
      store.initialize()
      store.setName('Custom Name')
      store.setGender('female')

      const gameId = await store.confirmCreation()

      const character = await db.characters.where('gameId').equals(gameId).first()
      expect(character!.name).toBe('Custom Name')
      expect(character!.gender).toBe('female')
    })

    it('sets saving to true during creation and false after', async () => {
      const store = useCharacterCreationStore.getState()
      store.initialize()

      const promise = store.confirmCreation()

      // Should be saving during the operation
      expect(useCharacterCreationStore.getState().saving).toBe(true)

      await promise

      expect(useCharacterCreationStore.getState().saving).toBe(false)
    })

    it('throws error when no character has been generated', async () => {
      const store = useCharacterCreationStore.getState()
      await expect(store.confirmCreation()).rejects.toThrow('No character to confirm')
    })
  })

  describe('reset', () => {
    it('clears all creation state', () => {
      const store = useCharacterCreationStore.getState()
      store.initialize()
      store.setName('Test')
      store.setGender('male')

      store.reset()

      const updated = useCharacterCreationStore.getState()
      expect(updated.seed).toBe('')
      expect(updated.creationResult).toBeNull()
      expect(updated.customName).toBeNull()
      expect(updated.customGender).toBeNull()
      expect(updated.saving).toBe(false)
      expect(updated.error).toBeNull()
    })
  })
})