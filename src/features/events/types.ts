// ============================================================
// Event Types — type definitions for the data-driven event
// system.
// All text labels are i18n keys, not hardcoded strings.
// ============================================================

import type { LifePhase, StatEffects } from '@/shared/config/gameBalance'
import type { EventChoice } from '@/shared/types'

export type { EventChoice }

/**
 * Conditions that a character must meet for an event to be eligible.
 * All fields are optional; only specified fields are checked.
 */
export interface EventCondition {
  ageMin?: number
  ageMax?: number
  minSmarts?: number
  minHealth?: number
  minHappiness?: number
  minLooks?: number
  minMoney?: number
  hasJob?: boolean
  phase?: LifePhase[]
}

/**
 * A single event definition in the data-driven event system.
 */
export interface EventDefinition {
  id: string
  phase: LifePhase[]
  conditions: EventCondition
  probability: number // 0-1
  description: string // i18n key
  effects: Partial<StatEffects>
  choices?: EventChoice[]
  lethal?: boolean // if true, can cause death
  deathProbability?: number // 0-1, only if lethal
}
