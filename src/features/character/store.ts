// ============================================================
// Character Creation Store — Zustand store managing the
// character creation flow state.
//
// Generates a random character, allows customization,
// and persists to Dexie on confirmation.
// ============================================================

import { create } from 'zustand'
import {
  createCharacter,
  customizeCharacter,
  type CharacterCreationResult,
} from './factory'
import {
  createGame,
  createCharacter as createCharacterInDb,
  createRelationship,
} from '@/shared/db/storage'

// ── Seed Generation ────────────────────────────────────────

function generateSeed(): string {
  return Math.random().toString(36).substring(2, 15)
}

// ── Types ───────────────────────────────────────────────────

export interface CharacterCreationState {
  // State
  seed: string
  creationResult: CharacterCreationResult | null
  customName: string | null
  customGender: 'male' | 'female' | null
  saving: boolean
  error: string | null

  // Actions
  initialize: () => void
  reroll: () => void
  setName: (name: string) => void
  setGender: (gender: 'male' | 'female') => void
  confirmCreation: () => Promise<number>
  reset: () => void
}

// ── Store ───────────────────────────────────────────────────

export const useCharacterCreationStore = create<CharacterCreationState>(
  (set, get) => ({
    seed: '',
    creationResult: null,
    customName: null,
    customGender: null,
    saving: false,
    error: null,

    initialize: () => {
      const seed = generateSeed()
      const creationResult = createCharacter(seed)
      set({ seed, creationResult, customName: null, customGender: null, error: null })
    },

    reroll: () => {
      const seed = generateSeed()
      const creationResult = createCharacter(seed)
      set({ seed, creationResult, customName: null, customGender: null })
    },

    setName: (name: string) => {
      set({ customName: name })
    },

    setGender: (gender: 'male' | 'female') => {
      set({ customGender: gender })
    },

    confirmCreation: async () => {
      const { seed, creationResult, customName, customGender } = get()
      if (!creationResult) throw new Error('No character to confirm')

      set({ saving: true, error: null })

      try {
        // Apply customizations
        const finalResult = customizeCharacter(creationResult, {
          ...(customName !== null ? { name: customName } : {}),
          ...(customGender !== null ? { gender: customGender } : {}),
        })

        // Create game
        const game = await createGame(seed)

        // Create character
        await createCharacterInDb({
          gameId: game.id!,
          ...finalResult.character,
        })

        // Create family relationships
        for (const rel of finalResult.familyRelationships) {
          await createRelationship({
            gameId: game.id!,
            ...rel,
          })
        }

        set({ saving: false })
        return game.id!
      } catch (error) {
        set({ saving: false, error: (error as Error).message })
        throw error
      }
    },

    reset: () => {
      set({
        seed: '',
        creationResult: null,
        customName: null,
        customGender: null,
        saving: false,
        error: null,
      })
    },
  }),
)

// ── Selector: current character with customizations applied ──

export function getCurrentCharacter(
  state: CharacterCreationState,
): CharacterCreationResult | null {
  if (!state.creationResult) return null

  return customizeCharacter(state.creationResult, {
    ...(state.customName !== null ? { name: state.customName } : {}),
    ...(state.customGender !== null ? { gender: state.customGender } : {}),
  })
}