import 'fake-indexeddb/auto'
import { describe, it, expect, expectTypeOf, beforeEach } from 'vitest'
import { db } from './database'
import {
  createGame,
  getGame,
  updateGame,
  deleteGame,
  listGames,
  createCharacter,
  getCharacterByGameId,
  updateCharacter,
  createLifeEvent,
  getLifeEventsByGameId,
  updateLifeEvent,
  createRelationship,
  getRelationshipsByGameId,
  updateRelationship,
  deleteRelationship,
  createCareer,
  getCareersByGameId,
  updateCareer,
} from './storage'
import { MAX_SAVED_LIVES } from '../config/gameBalance'
import type { StatEffects } from '../config/gameBalance'
import type { Game, Character, LifeEvent, Relationship, Career, EventChoice } from '../types'

// ── Helpers ───────────────────────────────────────────────

function seed(i = 0): string {
  return `test-seed-${i}`
}

async function createAliveGame(i = 0) {
  return createGame(seed(i))
}

async function createFullGame(i = 0) {
  const game = await createAliveGame(i)
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

// ── Reset database before each test ──────────────────────

beforeEach(async () => {
  await db.games.clear()
  await db.characters.clear()
  await db.lifeEvents.clear()
  await db.relationships.clear()
  await db.careers.clear()
})

// ════════════════════════════════════════════════════════════
// 1. Shared Types
// ════════════════════════════════════════════════════════════

describe('Shared Types', () => {
  it('Game interface has correct fields and types', () => {
    const game: Game = {
      createdAt: 1000,
      currentYear: 2024,
      seed: 'abc',
      status: 'alive',
    }
    expect(game).not.toHaveProperty('id')
    expect(game).toHaveProperty('createdAt', 1000)
    expect(game).toHaveProperty('currentYear', 2024)
    expect(game).toHaveProperty('seed', 'abc')
    expect(game).toHaveProperty('status', 'alive')
    expect(game).not.toHaveProperty('causeOfDeath')

    const dead: Game = {
      createdAt: 2000,
      currentYear: 2025,
      seed: 'def',
      status: 'dead',
      causeOfDeath: 'old age',
    }
    expect(dead.status).toBe('dead')
    expect(dead.causeOfDeath).toBe('old age')
  })

  it('Character interface has correct fields and types', () => {
    const char: Character = {
      gameId: 1,
      name: 'Alice',
      gender: 'female',
      age: 30,
      health: 90,
      happiness: 80,
      smarts: 70,
      looks: 85,
      money: 10000,
    }
    expect(char.gameId).toBe(1)
    expect(char.name).toBe('Alice')
    expect(char.gender).toBe('female')
    expect(char.age).toBe(30)
    expect(char.health).toBe(90)
    expect(char.happiness).toBe(80)
    expect(char.smarts).toBe(70)
    expect(char.looks).toBe(85)
    expect(char.money).toBe(10000)
    expect(char).not.toHaveProperty('id')
  })

  it('Character gender accepts male or female', () => {
    const male: Character = {
      gameId: 1, name: 'Bob', gender: 'male',
      age: 20, health: 50, happiness: 50, smarts: 50, looks: 50, money: 0,
    }
    const female: Character = {
      gameId: 2, name: 'Carol', gender: 'female',
      age: 20, health: 50, happiness: 50, smarts: 50, looks: 50, money: 0,
    }
    expect(male.gender).toBe('male')
    expect(female.gender).toBe('female')
  })

  it('LifeEvent interface has correct fields and types', () => {
    const effects: StatEffects = { health: 5, happiness: -2 }
    const event: LifeEvent = {
      gameId: 1,
      year: 2024,
      type: 'birthday',
      description: 'events.happyBirthday',
      effects,
      choices: [
        { label: 'choices.celebrate', effects: { happiness: 3 } },
        { label: 'choices.ignore', effects: { happiness: -1 } },
      ],
    }
    expect(event.gameId).toBe(1)
    expect(event.year).toBe(2024)
    expect(event.type).toBe('birthday')
    expect(event.description).toBe('events.happyBirthday')
    expect(event.effects).toEqual(effects)
    expect(event.choices).toHaveLength(2)
    expect(event.choices![0].label).toBe('choices.celebrate')
    expect(event.choices![0].effects).toEqual({ happiness: 3 })
    expect(event).not.toHaveProperty('id')
  })

  it('LifeEvent choices are optional', () => {
    const event: LifeEvent = {
      gameId: 1,
      year: 2024,
      type: 'silent',
      description: 'events.silent',
      effects: {},
    }
    expect(event.choices).toBeUndefined()
  })

  it('Relationship interface has correct fields and types', () => {
    const rel: Relationship = {
      gameId: 1,
      name: 'Mom',
      type: 'family',
      closeness: 85,
    }
    expect(rel.gameId).toBe(1)
    expect(rel.name).toBe('Mom')
    expect(rel.type).toBe('family')
    expect(rel.closeness).toBe(85)
    expect(rel).not.toHaveProperty('id')

    const friend: Relationship = { gameId: 1, name: 'Pal', type: 'friend', closeness: 50 }
    const partner: Relationship = { gameId: 1, name: 'Love', type: 'partner', closeness: 95 }
    expect(friend.type).toBe('friend')
    expect(partner.type).toBe('partner')
  })

  it('Career interface has correct fields and types', () => {
    const career: Career = {
      gameId: 1,
      title: 'careers.doctor',
      salary: 200000,
      yearsWorked: 5,
    }
    expect(career.gameId).toBe(1)
    expect(career.title).toBe('careers.doctor')
    expect(career.salary).toBe(200000)
    expect(career.yearsWorked).toBe(5)
    expect(career).not.toHaveProperty('id')
  })

  it('StatEffects is reused from gameBalance (has health, happiness, smarts, looks, money)', () => {
    const effects: StatEffects = { health: 1, happiness: 2, smarts: 3, looks: 4, money: 5 }
    const partial: Partial<StatEffects> = { health: 10 }
    expect(effects.health).toBe(1)
    expect(partial.health).toBe(10)
    // All keys are optional
    const empty: StatEffects = {}
    expect(Object.keys(empty)).toHaveLength(0)
  })
})

// ════════════════════════════════════════════════════════════
// 2. Dexie Database Schema
// ════════════════════════════════════════════════════════════

describe('Dexie Database Schema', () => {
  it('has all 5 tables', () => {
    expect(db.tables.map(t => t.name).sort()).toEqual([
      'careers',
      'characters',
      'games',
      'lifeEvents',
      'relationships',
    ])
  })

  it('games table has index on status', () => {
    const table = db.table('games')
    const indexes = table.schema.indexes.map(i => i.name)
    expect(indexes).toContain('status')
  })

  it('characters table has index on gameId', () => {
    const table = db.table('characters')
    const indexes = table.schema.indexes.map(i => i.name)
    expect(indexes).toContain('gameId')
  })

  it('lifeEvents table has index on gameId', () => {
    const table = db.table('lifeEvents')
    const indexes = table.schema.indexes.map(i => i.name)
    expect(indexes).toContain('gameId')
  })

  it('relationships table has indexes on gameId and type', () => {
    const table = db.table('relationships')
    const indexes = table.schema.indexes.map(i => i.name)
    expect(indexes).toContain('gameId')
    expect(indexes).toContain('type')
  })

  it('careers table has index on gameId', () => {
    const table = db.table('careers')
    const indexes = table.schema.indexes.map(i => i.name)
    expect(indexes).toContain('gameId')
  })
})

// ════════════════════════════════════════════════════════════
// 3. Game CRUD
// ════════════════════════════════════════════════════════════

describe('Game CRUD', () => {
  describe('createGame', () => {
    it('creates a game and returns it with auto-incremented id', async () => {
      const game = await createGame('test-seed')
      expect(game).toHaveProperty('id')
      expect(typeof game.id).toBe('number')
      expect(game.seed).toBe('test-seed')
      expect(game.status).toBe('alive')
      expect(game.createdAt).toBeGreaterThan(0)
      expect(game.currentYear).toBeGreaterThan(0)
    })

    it('assigns sequential ids', async () => {
      const g1 = await createGame('a')
      const g2 = await createGame('b')
      expect(g2.id).toBe(g1.id! + 1)
    })

    it('throws when MAX_SAVED_LIVES (5) alive games exist', async () => {
      for (let i = 0; i < MAX_SAVED_LIVES; i++) {
        await createGame(`seed-${i}`)
      }
      await expect(createGame('seed-too-many')).rejects.toThrow()
      const allGames = await db.games.toArray()
      expect(allGames).toHaveLength(MAX_SAVED_LIVES)
    })

    it('allows creating beyond MAX_SAVED_LIVES when at least one game is dead', async () => {
      for (let i = 0; i < MAX_SAVED_LIVES; i++) {
        const g = await createGame(`seed-${i}`)
        if (i === 0) {
          await updateGame(g.id!, { status: 'dead' })
        }
      }
      const sixth = await createGame('seed-extra')
      expect(sixth.id).toBeDefined()
      const all = await listGames()
      expect(all).toHaveLength(MAX_SAVED_LIVES + 1)
    })
  })

  describe('getGame', () => {
    it('returns a game by id', async () => {
      const created = await createGame('find-me')
      const found = await getGame(created.id!)
      expect(found).toBeDefined()
      expect(found!.id).toBe(created.id)
      expect(found!.seed).toBe('find-me')
    })

    it('returns undefined for non-existent id', async () => {
      const result = await getGame(99999)
      expect(result).toBeUndefined()
    })
  })

  describe('updateGame', () => {
    it('updates a game', async () => {
      const game = await createGame('updatable')
      await updateGame(game.id!, { status: 'dead', causeOfDeath: 'accident' })
      const updated = await getGame(game.id!)
      expect(updated!.status).toBe('dead')
      expect(updated!.causeOfDeath).toBe('accident')
    })

    it('preserves unchanged fields', async () => {
      const game = await createGame('partial')
      await updateGame(game.id!, { status: 'dead' })
      const updated = await getGame(game.id!)
      expect(updated!.seed).toBe('partial')
      expect(updated!.status).toBe('dead')
    })
  })

  describe('deleteGame', () => {
    it('deletes a game', async () => {
      const game = await createGame('delete-me')
      await deleteGame(game.id!)
      const found = await getGame(game.id!)
      expect(found).toBeUndefined()
    })

    it('cascade deletes all related entities', async () => {
      const { game, character } = await createFullGame(0)
      const event1 = await createLifeEvent({
        gameId: game.id!, year: 2024, type: 'test',
        description: 'desc', effects: {},
      })
      const rel1 = await createRelationship({
        gameId: game.id!, name: 'Buddy', type: 'friend', closeness: 50,
      })
      const career1 = await createCareer({
        gameId: game.id!, title: 'test', salary: 100, yearsWorked: 1,
      })

      await deleteGame(game.id!)

      // Game should be gone
      expect(await getGame(game.id!)).toBeUndefined()
      // All related entities should be gone
      expect(await getCharacterByGameId(game.id!)).toBeUndefined()
      expect(await getLifeEventsByGameId(game.id!)).toHaveLength(0)
      expect(await getRelationshipsByGameId(game.id!)).toHaveLength(0)
      expect(await getCareersByGameId(game.id!)).toHaveLength(0)
    })

    it('cascade deletes only entities for the deleted game', async () => {
      const { game: g1 } = await createFullGame(1)
      const { game: g2 } = await createFullGame(2)

      await deleteGame(g1.id!)

      // g2 entities should survive
      expect(await getCharacterByGameId(g2.id!)).toBeDefined()
      expect(await getGame(g2.id!)).toBeDefined()
    })
  })

  describe('listGames', () => {
    it('returns all games when no status filter', async () => {
      await createAliveGame(1)
      await createAliveGame(2)
      const games = await listGames()
      expect(games).toHaveLength(2)
    })

    it('filters games by alive status', async () => {
      const g1 = await createAliveGame(1)
      const g2 = await createAliveGame(2)
      await updateGame(g2.id!, { status: 'dead' })

      const alive = await listGames('alive')
      expect(alive).toHaveLength(1)
      expect(alive[0].id).toBe(g1.id)
    })

    it('filters games by dead status', async () => {
      const g1 = await createAliveGame(1)
      const g2 = await createAliveGame(2)
      await updateGame(g2.id!, { status: 'dead' })

      const dead = await listGames('dead')
      expect(dead).toHaveLength(1)
      expect(dead[0].id).toBe(g2.id)
    })

    it('returns empty array when no games match filter', async () => {
      const result = await listGames('dead')
      expect(result).toEqual([])
    })
  })
})

// ════════════════════════════════════════════════════════════
// 4. Character CRUD
// ════════════════════════════════════════════════════════════

describe('Character CRUD', () => {
  it('creates a character and returns it with auto-incremented id', async () => {
    const game = await createAliveGame()
    const char = await createCharacter({
      gameId: game.id!,
      name: 'Alice',
      gender: 'female',
      age: 25,
      health: 90,
      happiness: 80,
      smarts: 70,
      looks: 85,
      money: 5000,
    })
    expect(char).toHaveProperty('id')
    expect(typeof char.id).toBe('number')
    expect(char.gameId).toBe(game.id)
    expect(char.name).toBe('Alice')
  })

  it('gets character by gameId', async () => {
    const game = await createAliveGame()
    await createCharacter({
      gameId: game.id!, name: 'Bob', gender: 'male',
      age: 30, health: 50, happiness: 50, smarts: 50, looks: 50, money: 0,
    })
    const found = await getCharacterByGameId(game.id!)
    expect(found).toBeDefined()
    expect(found!.name).toBe('Bob')
  })

  it('returns undefined for gameId without a character', async () => {
    const result = await getCharacterByGameId(99999)
    expect(result).toBeUndefined()
  })

  it('updates a character', async () => {
    const game = await createAliveGame()
    const char = await createCharacter({
      gameId: game.id!, name: 'Charlie', gender: 'male',
      age: 20, health: 50, happiness: 50, smarts: 50, looks: 50, money: 0,
    })
    await updateCharacter(char.id!, { age: 35, money: 10000, health: 70 })
    const updated = await getCharacterByGameId(game.id!)
    expect(updated!.age).toBe(35)
    expect(updated!.money).toBe(10000)
    expect(updated!.health).toBe(70)
    // Unchanged fields preserved
    expect(updated!.name).toBe('Charlie')
  })
})

// ════════════════════════════════════════════════════════════
// 5. LifeEvent CRUD
// ════════════════════════════════════════════════════════════

describe('LifeEvent CRUD', () => {
  it('creates a life event and returns it with auto-incremented id', async () => {
    const game = await createAliveGame()
    const event = await createLifeEvent({
      gameId: game.id!,
      year: 2024,
      type: 'windfall',
      description: 'events.wonLottery',
      effects: { money: 100000, happiness: 20 },
    })
    expect(event).toHaveProperty('id')
    expect(typeof event.id).toBe('number')
    expect(event.type).toBe('windfall')
    expect(event.effects.money).toBe(100000)
  })

  it('creates a life event with choices', async () => {
    const game = await createAliveGame()
    const event = await createLifeEvent({
      gameId: game.id!,
      year: 2024,
      type: 'choice',
      description: 'events.makeChoice',
      effects: {},
      choices: [
        { label: 'choices.a', effects: { happiness: 5 } },
        { label: 'choices.b', effects: { happiness: -3 } },
      ],
    })
    expect(event.choices).toHaveLength(2)
    expect(event.choices![0].label).toBe('choices.a')
  })

  it('gets life events by gameId', async () => {
    const game = await createAliveGame()
    await createLifeEvent({
      gameId: game.id!, year: 2024, type: 'a',
      description: 'desc', effects: {},
    })
    await createLifeEvent({
      gameId: game.id!, year: 2025, type: 'b',
      description: 'desc2', effects: {},
    })
    const events = await getLifeEventsByGameId(game.id!)
    expect(events).toHaveLength(2)
  })

  it('returns empty array for gameId with no events', async () => {
    const result = await getLifeEventsByGameId(99999)
    expect(result).toEqual([])
  })

  it('updates a life event', async () => {
    const game = await createAliveGame()
    const event = await createLifeEvent({
      gameId: game.id!, year: 2024, type: 'original',
      description: 'desc', effects: { health: 1 },
    })
    await updateLifeEvent(event.id!, { type: 'updated', effects: { health: 10 } })
    const events = await getLifeEventsByGameId(game.id!)
    expect(events).toHaveLength(1)
    expect(events[0].type).toBe('updated')
    expect(events[0].effects.health).toBe(10)
  })

  it('only returns events for the requested gameId', async () => {
    const g1 = await createAliveGame(1)
    const g2 = await createAliveGame(2)
    await createLifeEvent({
      gameId: g1.id!, year: 2024, type: 'g1-event',
      description: 'desc', effects: {},
    })
    await createLifeEvent({
      gameId: g2.id!, year: 2024, type: 'g2-event',
      description: 'desc', effects: {},
    })
    const g1Events = await getLifeEventsByGameId(g1.id!)
    expect(g1Events).toHaveLength(1)
    expect(g1Events[0].type).toBe('g1-event')
  })
})

// ════════════════════════════════════════════════════════════
// 6. Relationship CRUD
// ════════════════════════════════════════════════════════════

describe('Relationship CRUD', () => {
  it('creates a relationship and returns it with auto-incremented id', async () => {
    const game = await createAliveGame()
    const rel = await createRelationship({
      gameId: game.id!,
      name: 'Mom',
      type: 'family',
      closeness: 90,
    })
    expect(rel).toHaveProperty('id')
    expect(typeof rel.id).toBe('number')
    expect(rel.name).toBe('Mom')
    expect(rel.type).toBe('family')
    expect(rel.closeness).toBe(90)
  })

  it('gets relationships by gameId', async () => {
    const game = await createAliveGame()
    await createRelationship({
      gameId: game.id!, name: 'Dad', type: 'family', closeness: 80,
    })
    await createRelationship({
      gameId: game.id!, name: 'Friend1', type: 'friend', closeness: 60,
    })
    const rels = await getRelationshipsByGameId(game.id!)
    expect(rels).toHaveLength(2)
  })

  it('returns empty array for gameId with no relationships', async () => {
    const result = await getRelationshipsByGameId(99999)
    expect(result).toEqual([])
  })

  it('updates a relationship', async () => {
    const game = await createAliveGame()
    const rel = await createRelationship({
      gameId: game.id!, name: 'Buddy', type: 'friend', closeness: 50,
    })
    await updateRelationship(rel.id!, { closeness: 75 })
    const rels = await getRelationshipsByGameId(game.id!)
    expect(rels[0].closeness).toBe(75)
    expect(rels[0].name).toBe('Buddy')
  })

  it('deletes a relationship', async () => {
    const game = await createAliveGame()
    const rel = await createRelationship({
      gameId: game.id!, name: 'Temp', type: 'friend', closeness: 30,
    })
    await deleteRelationship(rel.id!)
    const rels = await getRelationshipsByGameId(game.id!)
    expect(rels).toHaveLength(0)
  })

  it('only returns relationships for the requested gameId', async () => {
    const g1 = await createAliveGame(1)
    const g2 = await createAliveGame(2)
    await createRelationship({
      gameId: g1.id!, name: 'R1', type: 'family', closeness: 50,
    })
    await createRelationship({
      gameId: g2.id!, name: 'R2', type: 'friend', closeness: 50,
    })
    const g1Rels = await getRelationshipsByGameId(g1.id!)
    expect(g1Rels).toHaveLength(1)
    expect(g1Rels[0].name).toBe('R1')
  })
})

// ════════════════════════════════════════════════════════════
// 7. Career CRUD
// ════════════════════════════════════════════════════════════

describe('Career CRUD', () => {
  it('creates a career and returns it with auto-incremented id', async () => {
    const game = await createAliveGame()
    const career = await createCareer({
      gameId: game.id!,
      title: 'careers.engineer',
      salary: 80000,
      yearsWorked: 3,
    })
    expect(career).toHaveProperty('id')
    expect(typeof career.id).toBe('number')
    expect(career.title).toBe('careers.engineer')
    expect(career.salary).toBe(80000)
    expect(career.yearsWorked).toBe(3)
  })

  it('gets careers by gameId', async () => {
    const game = await createAliveGame()
    await createCareer({
      gameId: game.id!, title: 'careers.job1', salary: 30000, yearsWorked: 2,
    })
    await createCareer({
      gameId: game.id!, title: 'careers.job2', salary: 50000, yearsWorked: 1,
    })
    const careers = await getCareersByGameId(game.id!)
    expect(careers).toHaveLength(2)
  })

  it('returns empty array for gameId with no careers', async () => {
    const result = await getCareersByGameId(99999)
    expect(result).toEqual([])
  })

  it('updates a career', async () => {
    const game = await createAliveGame()
    const career = await createCareer({
      gameId: game.id!, title: 'careers.dev', salary: 60000, yearsWorked: 1,
    })
    await updateCareer(career.id!, { salary: 70000, yearsWorked: 2 })
    const careers = await getCareersByGameId(game.id!)
    expect(careers[0].salary).toBe(70000)
    expect(careers[0].yearsWorked).toBe(2)
  })

  it('only returns careers for the requested gameId', async () => {
    const g1 = await createAliveGame(1)
    const g2 = await createAliveGame(2)
    await createCareer({
      gameId: g1.id!, title: 'careers.c1', salary: 100, yearsWorked: 1,
    })
    await createCareer({
      gameId: g2.id!, title: 'careers.c2', salary: 200, yearsWorked: 2,
    })
    const g1Careers = await getCareersByGameId(g1.id!)
    expect(g1Careers).toHaveLength(1)
    expect(g1Careers[0].title).toBe('careers.c1')
  })
})

// ════════════════════════════════════════════════════════════
// 8. Async Behavior
// ════════════════════════════════════════════════════════════

describe('Async Behavior', () => {
  it('createGame returns a Promise', () => {
    const result = createGame('promise-test')
    expect(result).toBeInstanceOf(Promise)
  })

  it('getGame returns a Promise', () => {
    const result = getGame(1)
    expect(result).toBeInstanceOf(Promise)
  })

  it('listGames returns a Promise', () => {
    const result = listGames()
    expect(result).toBeInstanceOf(Promise)
  })

  it('createCharacter returns a Promise', async () => {
    const game = await createAliveGame()
    const result = createCharacter({
      gameId: game.id!, name: 'T', gender: 'male',
      age: 1, health: 50, happiness: 50, smarts: 50, looks: 50, money: 0,
    })
    expect(result).toBeInstanceOf(Promise)
  })

  it('deleteGame returns a Promise', () => {
    const result = deleteGame(1)
    expect(result).toBeInstanceOf(Promise)
  })
})

// ════════════════════════════════════════════════════════════
// 9. Edge Cases
// ════════════════════════════════════════════════════════════

describe('Edge Cases', () => {
  it('multiple games can have independent data', async () => {
    const { game: g1 } = await createFullGame(1)
    const { game: g2, character: c2 } = await createFullGame(2)

    const g1Char = await getCharacterByGameId(g1.id!)
    const g2Char = await getCharacterByGameId(g2.id!)
    expect(g1Char!.name).toBe('TestChar1')
    expect(g2Char!.name).toBe('TestChar2')
    expect(g1Char!.id).not.toBe(g2Char!.id)
  })

  it('updating a non-existent entity does not throw', async () => {
    // These should silently handle non-existent entities
    await expect(updateGame(99999, { status: 'dead' })).resolves.not.toThrow()
    await expect(updateCharacter(99999, { age: 50 })).resolves.not.toThrow()
    await expect(updateLifeEvent(99999, { type: 'x' })).resolves.not.toThrow()
    await expect(updateRelationship(99999, { closeness: 0 })).resolves.not.toThrow()
    await expect(updateCareer(99999, { salary: 0 })).resolves.not.toThrow()
  })

  it('deleting a non-existent entity does not throw', async () => {
    await expect(deleteGame(99999)).resolves.not.toThrow()
    await expect(deleteRelationship(99999)).resolves.not.toThrow()
  })
})

