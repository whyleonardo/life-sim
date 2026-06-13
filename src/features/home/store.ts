import { create } from 'zustand'
import {
  listGames,
  deleteGame as deleteGameFromStorage,
  getCharacterByGameId,
} from '@/shared/db/storage'
import { MAX_SAVED_LIVES } from '@/shared/config/gameBalance'
import type { Game, Character } from '@/shared/types'

export interface HomeState {
  games: Array<Game & { character?: Character }>
  loading: boolean
  error: string | null
  canCreateNewLife: boolean

  // Actions
  loadGames: () => Promise<void>
  deleteGame: (id: number) => Promise<void>
}

export const useHomeStore = create<HomeState>((set, get) => ({
  games: [],
  loading: false,
  error: null,
  canCreateNewLife: true,

  loadGames: async () => {
    set({ loading: true, error: null })
    try {
      const games = await listGames()
      const gamesWithCharacters = await Promise.all(
        games.map(async (game) => {
          const character = game.id
            ? await getCharacterByGameId(game.id)
            : undefined
          return { ...game, character }
        }),
      )

      const aliveCount = gamesWithCharacters.filter(
        (g) => g.status === 'alive',
      ).length

      set({
        games: gamesWithCharacters,
        loading: false,
        canCreateNewLife: aliveCount < MAX_SAVED_LIVES,
      })
    } catch (error) {
      set({
        error: (error as Error).message,
        loading: false,
      })
    }
  },

  deleteGame: async (id: number) => {
    try {
      await deleteGameFromStorage(id)
      await get().loadGames()
    } catch (error) {
      set({ error: (error as Error).message })
    }
  },
}))
