import Dexie, { type EntityTable } from 'dexie'
import type { Game, Character, LifeEvent, Relationship, Career } from '@/shared/types'

export class LifeSimDB extends Dexie {
  games!: EntityTable<Game, 'id'>
  characters!: EntityTable<Character, 'id'>
  lifeEvents!: EntityTable<LifeEvent, 'id'>
  relationships!: EntityTable<Relationship, 'id'>
  careers!: EntityTable<Career, 'id'>

  constructor() {
    super('LifeSimDB')
    this.version(1).stores({})
    this.version(2).stores({
      games: '++id, status',
      characters: '++id, gameId',
      lifeEvents: '++id, gameId',
      relationships: '++id, gameId, type',
      careers: '++id, gameId',
    })
  }
}

export const db = new LifeSimDB()
