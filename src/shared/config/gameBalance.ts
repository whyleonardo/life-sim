// ============================================================
// Game Balance Config — single source of truth for all tuning
// constants used by the life simulation game logic.
// All text labels are i18n keys, not hardcoded strings.
// ============================================================

// ── Life Phase Identifiers ──────────────────────────────────

/** Canonical life phases in order. */
export type LifePhase =
  | 'infancy'
  | 'school'
  | 'youngAdult'
  | 'adult'
  | 'senior'

/** Human-readable label for each phase (i18n key). */
export const LIFE_PHASES: Record<LifePhase, string> = {
  infancy: 'phases.infancy',
  school: 'phases.school',
  youngAdult: 'phases.youngAdult',
  adult: 'phases.adult',
  senior: 'phases.senior',
} as const

// ── Stat Ranges / Character Creation ────────────────────────

export const STAT_MIN = 0
export const STAT_MAX = 100

export const MONEY_START_MIN = 100
export const MONEY_START_MAX = 50_000

// ── Stat Decay Rates per Age Bracket ────────────────────────
// How many points each stat decays per year of that phase.
// Higher = faster decline.

export interface StatDecayRates {
  health: number
  happiness: number
  smarts: number
  looks: number
}

export const statDecayRates: Record<LifePhase, StatDecayRates> = {
  infancy: {
    health: 0.1,
    happiness: 0.2,
    smarts: 0.1,
    looks: 0.1,
  },
  school: {
    health: 0.3,
    happiness: 0.4,
    smarts: 0.2,
    looks: 0.3,
  },
  youngAdult: {
    health: 0.5,
    happiness: 0.6,
    smarts: 0.4,
    looks: 0.5,
  },
  adult: {
    health: 0.8,
    happiness: 0.7,
    smarts: 0.5,
    looks: 0.8,
  },
  senior: {
    health: 2.0,
    happiness: 1.0,
    smarts: 0.8,
    looks: 1.5,
  },
} as const

// ── Death Probability Curve ─────────────────────────────────
// Probability of dying at each age (annual probability).
// Starts at 2 % at age 60 and increases.

export const deathProbabilities: Record<number, number> = {
  0: 0.0001,
  1: 0.0001,
  2: 0.0001,
  3: 0.0001,
  4: 0.0001,
  5: 0.0001,
  6: 0.0001,
  7: 0.0001,
  8: 0.0001,
  9: 0.0001,
  10: 0.0001,
  11: 0.00015,
  12: 0.00015,
  13: 0.00015,
  14: 0.0002,
  15: 0.0003,
  16: 0.0004,
  17: 0.0005,
  18: 0.0006,
  19: 0.0008,
  20: 0.001,
  25: 0.0015,
  30: 0.002,
  35: 0.003,
  40: 0.005,
  45: 0.008,
  50: 0.012,
  55: 0.018,
  60: 0.02,
  61: 0.022,
  62: 0.024,
  63: 0.026,
  64: 0.028,
  65: 0.03,
  66: 0.033,
  67: 0.036,
  68: 0.039,
  69: 0.042,
  70: 0.045,
  71: 0.05,
  72: 0.055,
  73: 0.06,
  74: 0.065,
  75: 0.07,
  76: 0.078,
  77: 0.086,
  78: 0.094,
  79: 0.102,
  80: 0.11,
  81: 0.12,
  82: 0.13,
  83: 0.14,
  84: 0.15,
  85: 0.16,
  86: 0.175,
  87: 0.19,
  88: 0.205,
  89: 0.22,
  90: 0.24,
  91: 0.26,
  92: 0.28,
  93: 0.3,
  94: 0.33,
  95: 0.36,
  96: 0.4,
  97: 0.45,
  98: 0.5,
  99: 0.6,
  100: 0.7,
  101: 0.8,
  102: 0.9,
  103: 0.95,
  104: 0.98,
  105: 0.99,
  106: 0.995,
  107: 0.998,
  108: 0.999,
  109: 0.9995,
  110: 1.0,
} as const

// ── Event Probability Multipliers ───────────────────────────
// Applied to base event probabilities. 1 = no change, 0 = never.

export const eventMultipliers: Record<string, number> = {
  positiveLifeEvent: 0.3,
  negativeLifeEvent: 0.3,
  careerSuccess: 0.15,
  relationshipEvent: 0.15,
  randomAccident: 0.05,
  illness: 0.05,
  windfall: 0.02,
  tragedy: 0.02,
} as const

// ── Life Phase Transition Ages ──────────────────────────────
// The age at which a character enters each phase.

export const lifePhaseTransitionAges: Record<LifePhase, number> = {
  infancy: 0,
  school: 6,
  youngAdult: 18,
  adult: 26,
  senior: 56,
} as const

// ── Career Progression Rates ────────────────────────────────
// Base probability of advancing in a career per year.

export const careerProgressionRates: Record<string, number> = {
  entryLevel: 0.3,
  skilled: 0.25,
  professional: 0.2,
  executive: 0.1,
} as const

// ── Relationship Closeness Decay ────────────────────────────
// How much closeness decays per year without interaction.

export const relationshipDecayRates: Record<string, number> = {
  spouse: 0.05,
  child: 0.08,
  parent: 0.1,
  sibling: 0.15,
  friend: 0.2,
  acquaintance: 0.35,
} as const

// ── Maximum Saved Lives ────────────────────────────────────

export const MAX_SAVED_LIVES = 5

// ── Proactive Actions ──────────────────────────────────────
// Actions the player can take each life phase, with their
// stat effects (delta applied per action use).
// Labels and descriptions are i18n keys.

export interface StatEffects {
  health?: number
  happiness?: number
  smarts?: number
  looks?: number
  money?: number
}

export interface ProactiveAction {
  label: string
  description: string
  statEffects: StatEffects
}

export const proactiveActions: Record<LifePhase, readonly ProactiveAction[]> = {
  infancy: [
    {
      label: 'actions.infantry.play',
      description: 'actions.infantry.playDesc',
      statEffects: { happiness: 5, smarts: 2 },
    },
    {
      label: 'actions.infantry.eatWell',
      description: 'actions.infantry.eatWellDesc',
      statEffects: { health: 4 },
    },
    {
      label: 'actions.infantry.read',
      description: 'actions.infantry.readDesc',
      statEffects: { smarts: 3, happiness: 1 },
    },
  ],
  school: [
    {
      label: 'actions.school.study',
      description: 'actions.school.studyDesc',
      statEffects: { smarts: 6, happiness: -1 },
    },
    {
      label: 'actions.school.socialize',
      description: 'actions.school.socializeDesc',
      statEffects: { happiness: 4, looks: 1 },
    },
    {
      label: 'actions.school.sports',
      description: 'actions.school.sportsDesc',
      statEffects: { health: 4, happiness: 2 },
    },
    {
      label: 'actions.school.hobby',
      description: 'actions.school.hobbyDesc',
      statEffects: { happiness: 5, smarts: 1 },
    },
  ],
  youngAdult: [
    {
      label: 'actions.youngAdult.work',
      description: 'actions.youngAdult.workDesc',
      statEffects: { money: 200, happiness: -2 },
    },
    {
      label: 'actions.youngAdult.study',
      description: 'actions.youngAdult.studyDesc',
      statEffects: { smarts: 5, money: -50 },
    },
    {
      label: 'actions.youngAdult.socialize',
      description: 'actions.youngAdult.socializeDesc',
      statEffects: { happiness: 3 },
    },
    {
      label: 'actions.youngAdult.gym',
      description: 'actions.youngAdult.gymDesc',
      statEffects: { health: 3, looks: 2 },
    },
  ],
  adult: [
    {
      label: 'actions.adult.work',
      description: 'actions.adult.workDesc',
      statEffects: { money: 500, happiness: -3 },
    },
    {
      label: 'actions.adult.family',
      description: 'actions.adult.familyDesc',
      statEffects: { happiness: 5 },
    },
    {
      label: 'actions.adult.hobby',
      description: 'actions.adult.hobbyDesc',
      statEffects: { happiness: 4 },
    },
    {
      label: 'actions.adult.health',
      description: 'actions.adult.healthDesc',
      statEffects: { health: 3 },
    },
  ],
  senior: [
    {
      label: 'actions.senior.rest',
      description: 'actions.senior.restDesc',
      statEffects: { health: 2, happiness: 2 },
    },
    {
      label: 'actions.senior.hobby',
      description: 'actions.senior.hobbyDesc',
      statEffects: { happiness: 4, smarts: 1 },
    },
    {
      label: 'actions.senior.socialize',
      description: 'actions.senior.socializeDesc',
      statEffects: { happiness: 5 },
    },
    {
      label: 'actions.senior.walk',
      description: 'actions.senior.walkDesc',
      statEffects: { health: 2, happiness: 1 },
    },
  ],
} as const

// ── Helper: Get current life phase from age ────────────────

export function getLifePhase(age: number): LifePhase {
  if (age >= lifePhaseTransitionAges.senior) return 'senior'
  if (age >= lifePhaseTransitionAges.adult) return 'adult'
  if (age >= lifePhaseTransitionAges.youngAdult) return 'youngAdult'
  if (age >= lifePhaseTransitionAges.school) return 'school'
  return 'infancy'
}
