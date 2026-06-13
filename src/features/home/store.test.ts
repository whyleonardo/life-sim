import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach } from 'vitest'
import { db } from '@/shared/db/database'
import {
  createGame,
  createCharacter,
  updateGame,
  listGames,
  getCharacterByGameId,
} from '@/shared/db/storage'
import { useHomeStore } from './store'
import { MAX_SAVED_LIVES } from '@/shared/config/gameBalance'
import type { Game, Character } from '@/shared/types'

// ── Helpers ───────────────────────────────────────────────

function seed(i = 0): string {
  return `test-seed-${i}`
}

async function createFullGame(i = 0): Promise<{ game: Game; character: Character }> {
  const game = await createGame(seed(i))
  const character = await createCharacter({
    gameId: game.id!,
    name: `TestChar${i}`,
    gender: 'male' as const,
    age: 25,
    health: 80,
    happiness: 70,
    smarts: 60,
    looks: 75,
    money: 5000,
  })
  return { game, character }
}

// ── Reset database and store before each test ────────────

beforeEach(async () => {
  await db.games.clear()
  await db.characters.clear()
  await db.lifeEvents.clear()
  await db.relationships.clear()
  await db.careers.clear()
  useHomeStore.setState({
    games: [],
    loading: false,
    error: null,
  })
})

// ═════════════════════════════════════════════════════════
// Home Store Tests
// ═════════════════════════════════════════════════════════

describe('HomeStore', () => {
  describe('loadGames', () => {
    it('populates games list from storage', async () => {
      await createFullGame(0)
      await createFullGame(1)

      const store = useHomeStore.getState()
      expect(store.games).toHaveLength(0)

      await store.loadGames()

      const updated = useHomeStore.getState()
      expect(updated.games).toHaveLength(2)
      expect(updated.games[0]).toHaveProperty('character')
      expect(updated.games[0].character?.name).toBe('TestChar0')
    })

    it('loads empty array when no games exist', async () => {
      const store = useHomeStore.getState()
      await store.loadGames()

      const updated = useHomeStore.getState()
      expect(updated.games).toEqual([])
      expect(updated.loading).toBe(false)
    })

    it('loads games without characters as well', async () => {
      // Create a game without a character (edge case)
      await createGame(seed(0))

      const store = useHomeStore.getState()
      await store.loadGames()

      const updated = useHomeStore.getState()
      expect(updated.games).toHaveLength(1)
      expect(updated.games[0].character).toBeUndefined()
    })
  })

  describe('deleteGame', () => {
    it('removes game and refreshes list', async () => {
      await createFullGame(0)
      await createFullGame(1)

      const store = useHomeStore.getState()
      await store.loadGames()
      expect(useHomeStore.getState().games).toHaveLength(2)

      // Delete the first game
      const firstId = useHomeStore.getState().games[0].id!
      await store.deleteGame(firstId)

      const updated = useHomeStore.getState()
      expect(updated.games).toHaveLength(1)
      expect(updated.games[0].id).not.toBe(firstId)
    })

    it('handles deleting non-existent game gracefully', async () => {
      const store = useHomeStore.getState()
      await expect(store.deleteGame(99999)).resolves.not.toThrow()
    })
  })

  describe('canCreateNewLife', () => {
    it('is true when fewer than MAX_SAVED_LIVES alive games', async () => {
      await createFullGame(0)
      await createFullGame(1)

      const store = useHomeStore.getState()
      await store.loadGames()

      expect(useHomeStore.getState().canCreateNewLife).toBe(true)
    })

    it('is false when MAX_SAVED_LIVES alive games exist', async () => {
      for (let i = 0; i < MAX_SAVED_LIVES; i++) {
        await createFullGame(i)
      }

      const store = useHomeStore.getState()
      await store.loadGames()

      expect(useHomeStore.getState().canCreateNewLife).toBe(false)
    })

    it('is true when some games are dead even if total games >= MAX_SAVED_LIVES', async () => {
      for (let i = 0; i < MAX_SAVED_LIVES; i++) {
        const { game } = await createFullGame(i)
        if (i === 0) {
          await updateGame(game.id!, { status: 'dead', causeOfDeath: 'accident' })
        }
      }

      const store = useHomeStore.getState()
      await store.loadGames()

      // 4 alive + 1 dead = can create new
      expect(useHomeStore.getState().canCreateNewLife).toBe(true)
    })
  })

  describe('loading state', () => {
    it('is true during loadGames and false after completion', async () => {
      let loadingPromise: Promise<void>
      const store = useHomeStore.getState()

      // Create a game first so we have something to load
      await createFullGame(0)

      // Track loading state synchronously
      const loadingDuringLoad = new Promise<boolean>((resolve) => {
        const unsubscribe = useHomeStore.subscribe((state) => {
          if (state.loading === true) {
            resolve(true)
            unsubscribe()
          }
        })
      })

      store.loadGames()

      // Should eventually be loading
      await expect(loadingDuringLoad).resolves.toBe(true)

      // Wait for load to complete
      await loadingDuringLoad

      // Wait a tick for the load to finish
      await new Promise((r) => setTimeout(r, 50))

      const final = useHomeStore.getState()
      expect(final.loading).toBe(false)
      expect(final.games.length).toBeGreaterThan(0)
    })

    it('is false initially', () => {
      expect(useHomeStore.getState().loading).toBe(false)
    })
  })

  describe('error state', () => {
    it('is null initially', () => {
      expect(useHomeStore.getState().error).toBeNull()
    })

    it('is null on successful load', async () => {
      await createFullGame(0)
      const store = useHomeStore.getState()
      await store.loadGames()
      expect(useHomeStore.getState().error).toBeNull()
    })
  })
})
