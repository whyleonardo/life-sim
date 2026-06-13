// ============================================================
// Shared Types — data model entities for the life simulation.
// ============================================================

import type { StatEffects } from '../config/gameBalance'

export interface Game {
  id?: number
  createdAt: number // timestamp
  currentYear: number
  seed: string
  status: 'alive' | 'dead'
  causeOfDeath?: string
}

export interface Character {
  id?: number
  gameId: number // foreign key to Game
  name: string
  gender: 'male' | 'female'
  age: number
  health: number
  happiness: number
  smarts: number
  looks: number
  money: number
}

export interface EventChoice {
  label: string // i18n key
  effects: Partial<StatEffects>
}

export interface LifeEvent {
  id?: number
  gameId: number
  year: number
  type: string // event type identifier
  description: string // i18n key
  effects: Partial<StatEffects>
  choices?: EventChoice[]
}

export interface Relationship {
  id?: number
  gameId: number
  name: string
  type: 'family' | 'friend' | 'partner'
  closeness: number // 0-100
}

export interface Career {
  id?: number
  gameId: number
  title: string // i18n key
  salary: number
  yearsWorked: number
}
