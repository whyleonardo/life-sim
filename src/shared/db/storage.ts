// ============================================================
// Storage Layer — thin CRUD integration over Dexie / IndexedDB.
// No business logic, only data persistence.
// ============================================================

import { db } from './database'
import { MAX_SAVED_LIVES } from '@/shared/config/gameBalance'
import type { Game, Character, LifeEvent, Relationship, Career } from '@/shared/types'

// ── Game Operations ──────────────────────────────────────

export async function createGame(seed: string): Promise<Game> {
  const aliveCount = await db.games.where('status').equals('alive').count()
  if (aliveCount >= MAX_SAVED_LIVES) {
    throw new Error(
      `Cannot create new game: maximum of ${MAX_SAVED_LIVES} alive games reached`,
    )
  }

  const id = await db.games.add({
    createdAt: Date.now(),
    currentYear: new Date().getFullYear(),
    seed,
    status: 'alive',
  })

  const game = await db.games.get(id)
  return game!
}

export async function getGame(id: number): Promise<Game | undefined> {
  return db.games.get(id)
}

export async function updateGame(
  id: number,
  changes: Partial<Game>,
): Promise<void> {
  await db.games.update(id, changes)
}

export async function deleteGame(id: number): Promise<void> {
  // Cascade delete all related entities
  await db.characters.where('gameId').equals(id).delete()
  await db.lifeEvents.where('gameId').equals(id).delete()
  await db.relationships.where('gameId').equals(id).delete()
  await db.careers.where('gameId').equals(id).delete()
  await db.games.delete(id)
}

export async function listGames(
  status?: 'alive' | 'dead',
): Promise<Game[]> {
  if (status) {
    return db.games.where('status').equals(status).toArray()
  }
  return db.games.toArray()
}

// ── Character Operations ─────────────────────────────────

export async function createCharacter(
  character: Omit<Character, 'id'>,
): Promise<Character> {
  const id = await db.characters.add(character as Character)
  const result = await db.characters.get(id)
  return result!
}

export async function getCharacterByGameId(
  gameId: number,
): Promise<Character | undefined> {
  return db.characters.where('gameId').equals(gameId).first()
}

export async function updateCharacter(
  id: number,
  changes: Partial<Character>,
): Promise<void> {
  await db.characters.update(id, changes)
}

// ── LifeEvent Operations ─────────────────────────────────

export async function createLifeEvent(
  event: Omit<LifeEvent, 'id'>,
): Promise<LifeEvent> {
  const id = await db.lifeEvents.add(event as LifeEvent)
  const result = await db.lifeEvents.get(id)
  return result!
}

export async function getLifeEventsByGameId(
  gameId: number,
): Promise<LifeEvent[]> {
  return db.lifeEvents.where('gameId').equals(gameId).toArray()
}

export async function updateLifeEvent(
  id: number,
  changes: Partial<LifeEvent>,
): Promise<void> {
  await db.lifeEvents.update(id, changes)
}

// ── Relationship Operations ──────────────────────────────

export async function createRelationship(
  rel: Omit<Relationship, 'id'>,
): Promise<Relationship> {
  const id = await db.relationships.add(rel as Relationship)
  const result = await db.relationships.get(id)
  return result!
}

export async function getRelationshipsByGameId(
  gameId: number,
): Promise<Relationship[]> {
  return db.relationships.where('gameId').equals(gameId).toArray()
}

export async function updateRelationship(
  id: number,
  changes: Partial<Relationship>,
): Promise<void> {
  await db.relationships.update(id, changes)
}

export async function deleteRelationship(id: number): Promise<void> {
  await db.relationships.delete(id)
}

// ── Career Operations ────────────────────────────────────

export async function createCareer(
  career: Omit<Career, 'id'>,
): Promise<Career> {
  const id = await db.careers.add(career as Career)
  const result = await db.careers.get(id)
  return result!
}

export async function getCareersByGameId(
  gameId: number,
): Promise<Career[]> {
  return db.careers.where('gameId').equals(gameId).toArray()
}

export async function updateCareer(
  id: number,
  changes: Partial<Career>,
): Promise<void> {
  await db.careers.update(id, changes)
}
