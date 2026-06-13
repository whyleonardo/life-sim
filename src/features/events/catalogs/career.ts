// ============================================================
// Career Events — events that occur during young adult and
// adult phases.
// ============================================================

import type { EventDefinition } from '../types'

export const careerEvents: EventDefinition[] = [
  {
    id: 'career.promotion',
    phase: ['youngAdult', 'adult'],
    conditions: { ageMin: 20 },
    probability: 0.12,
    description: 'events.career.promotion',
    effects: { money: 300, happiness: 10 },
  },
  {
    id: 'career.lost_job',
    phase: ['youngAdult', 'adult'],
    conditions: { ageMin: 18 },
    probability: 0.06,
    description: 'events.career.lost_job',
    effects: { money: -200, happiness: -15 },
    choices: [
      {
        label: 'events.career.lost_job_choice_search',
        effects: { happiness: -5 },
      },
      {
        label: 'events.career.lost_job_choice_retrain',
        effects: { smarts: 8, money: -50 },
      },
    ],
  },
  {
    id: 'career.started_business',
    phase: ['youngAdult', 'adult'],
    conditions: { ageMin: 18, minMoney: 500, minSmarts: 40 },
    probability: 0.04,
    description: 'events.career.started_business',
    effects: { money: 1000, happiness: 15 },
    choices: [
      {
        label: 'events.career.started_business_choice_full',
        effects: { money: 2000, happiness: 10 },
      },
      {
        label: 'events.career.started_business_choice_side',
        effects: { money: 300, happiness: 5, smarts: 3 },
      },
    ],
  },
  {
    id: 'career.raise',
    phase: ['youngAdult', 'adult'],
    conditions: { ageMin: 22 },
    probability: 0.15,
    description: 'events.career.raise',
    effects: { money: 150, happiness: 8 },
  },
  {
    id: 'career.work_conflict',
    phase: ['youngAdult', 'adult'],
    conditions: { ageMin: 18 },
    probability: 0.08,
    description: 'events.career.work_conflict',
    effects: { happiness: -10 },
    choices: [
      {
        label: 'events.career.work_conflict_choice_resolve',
        effects: { happiness: 5, smarts: 2 },
      },
      {
        label: 'events.career.work_conflict_choice_ignore',
        effects: { happiness: -8 },
      },
    ],
  },
  {
    id: 'career.mentored_colleague',
    phase: ['adult'],
    conditions: { ageMin: 28, minSmarts: 50 },
    probability: 0.08,
    description: 'events.career.mentored_colleague',
    effects: { happiness: 10, smarts: 3 },
  },
  {
    id: 'career.won_award',
    phase: ['youngAdult', 'adult', 'senior'],
    conditions: { ageMin: 25, minSmarts: 50 },
    probability: 0.03,
    description: 'events.career.won_award',
    effects: { happiness: 20, money: 250 },
  },
]
