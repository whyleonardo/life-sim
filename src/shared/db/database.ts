import Dexie from 'dexie'

export class LifeSimDB extends Dexie {
  constructor() {
    super('LifeSimDB')
    this.version(1).stores({}) // Tables added in later slices
  }
}

export const db = new LifeSimDB()
