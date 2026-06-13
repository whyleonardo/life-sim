import { create } from 'zustand'

interface GameState {
  // Will be populated in later slices
}

export const useGameStore = create<GameState>(() => ({}))
