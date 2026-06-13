// ============================================================
// Health Events — events affecting character health, some of
// which can be lethal.
// ============================================================

import type { EventDefinition } from '../types'

export const healthEvents: EventDefinition[] = [
  {
    id: 'health.cold',
    phase: ['infancy', 'school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.15,
    description: 'events.health.cold',
    effects: { health: -8, happiness: -5 },
    choices: [
      {
        label: 'events.health.cold_choice_rest',
        effects: { health: 5, happiness: -2 },
      },
      {
        label: 'events.health.cold_choice_medicine',
        effects: { health: 8, money: -20 },
      },
    ],
  },
  {
    id: 'health.recovered',
    phase: ['infancy', 'school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.10,
    description: 'events.health.recovered',
    effects: { health: 15, happiness: 10 },
  },
  {
    id: 'health.injured',
    phase: ['school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.06,
    description: 'events.health.injured',
    effects: { health: -20, happiness: -10 },
    choices: [
      {
        label: 'events.health.injured_choice_treatment',
        effects: { health: 10, money: -100 },
      },
      {
        label: 'events.health.injured_choice_home_remedy',
        effects: { health: 3 },
      },
    ],
    lethal: true,
    deathProbability: 0.02,
  },
  {
    id: 'health.exercising',
    phase: ['school', 'youngAdult', 'adult', 'senior'],
    conditions: { minHealth: 20 },
    probability: 0.10,
    description: 'events.health.exercising',
    effects: { health: 8, happiness: 5 },
  },
  {
    id: 'health.food_poisoning',
    phase: ['school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.06,
    description: 'events.health.food_poisoning',
    effects: { health: -12, happiness: -8 },
    choices: [
      {
        label: 'events.health.food_poisoning_choice_rest',
        effects: { health: 4 },
      },
      {
        label: 'events.health.food_poisoning_choice_doctor',
        effects: { health: 12, money: -80 },
      },
    ],
  },
  {
    id: 'health.checkup',
    phase: ['adult', 'senior'],
    conditions: { ageMin: 30 },
    probability: 0.08,
    description: 'events.health.checkup',
    effects: { health: 5 },
  },
  {
    id: 'health.health_scare',
    phase: ['adult', 'senior'],
    conditions: { ageMin: 35 },
    probability: 0.04,
    description: 'events.health.health_scare',
    effects: { health: -15, happiness: -12 },
    choices: [
      {
        label: 'events.health.health_scare_choice_lifestyle',
        effects: { health: 5, happiness: 3 },
      },
      {
        label: 'events.health.health_scare_choice_ignore',
        effects: { health: -5, happiness: -5 },
      },
    ],
    lethal: true,
    deathProbability: 0.05,
  },
]
