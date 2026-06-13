// ============================================================
// Relationship Events — events affecting social connections
// and happiness.
// ============================================================

import type { EventDefinition } from '../types'

export const relationshipEvents: EventDefinition[] = [
  {
    id: 'rel.new_friend',
    phase: ['infancy', 'school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.12,
    description: 'events.relationships.new_friend',
    effects: { happiness: 10 },
  },
  {
    id: 'rel.fight',
    phase: ['school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.10,
    description: 'events.relationships.fight',
    effects: { happiness: -10 },
    choices: [
      {
        label: 'events.relationships.fight_choice_apologize',
        effects: { happiness: 5 },
      },
      {
        label: 'events.relationships.fight_choice_walk_away',
        effects: { happiness: -3 },
      },
    ],
  },
  {
    id: 'rel.fell_in_love',
    phase: ['youngAdult', 'adult', 'senior'],
    conditions: { ageMin: 14 },
    probability: 0.06,
    description: 'events.relationships.fell_in_love',
    effects: { happiness: 20 },
  },
  {
    id: 'rel.lost_touch',
    phase: ['youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.08,
    description: 'events.relationships.lost_touch',
    effects: { happiness: -8 },
  },
  {
    id: 'rel.reconnected',
    phase: ['youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.06,
    description: 'events.relationships.reconnected',
    effects: { happiness: 12 },
  },
  {
    id: 'rel.helped_stranger',
    phase: ['school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.08,
    description: 'events.relationships.helped_stranger',
    effects: { happiness: 8 },
    choices: [
      {
        label: 'events.relationships.helped_stranger_choice_generous',
        effects: { happiness: 12, money: -20 },
      },
      {
        label: 'events.relationships.helped_stranger_choice_modest',
        effects: { happiness: 5 },
      },
    ],
  },
  {
    id: 'rel.family_argument',
    phase: ['school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.08,
    description: 'events.relationships.family_argument',
    effects: { happiness: -12 },
    choices: [
      {
        label: 'events.relationships.family_argument_choice_make_up',
        effects: { happiness: 8 },
      },
      {
        label: 'events.relationships.family_argument_choice_stand_firm',
        effects: { happiness: -5 },
      },
    ],
  },
]
