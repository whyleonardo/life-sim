// ============================================================
// General Events — events applicable across all life phases.
// ============================================================

import type { EventDefinition } from '../types'

export const generalEvents: EventDefinition[] = [
  {
    id: 'general.found_money',
    phase: ['infancy', 'school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.12,
    description: 'events.general.found_money',
    effects: { money: 50, happiness: 5 },
  },
  {
    id: 'general.got_sick',
    phase: ['infancy', 'school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.15,
    description: 'events.general.got_sick',
    effects: { health: -10, happiness: -5 },
    choices: [
      {
        label: 'events.general.got_sick_choice_rest',
        effects: { health: 5, happiness: -2 },
      },
      {
        label: 'events.general.got_sick_choice_medicine',
        effects: { health: 10, money: -30 },
      },
    ],
  },
  {
    id: 'general.lucky_day',
    phase: ['infancy', 'school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.10,
    description: 'events.general.lucky_day',
    effects: { happiness: 15 },
  },
  {
    id: 'general.new_friend',
    phase: ['infancy', 'school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.12,
    description: 'events.general.new_friend',
    effects: { happiness: 10 },
  },
  {
    id: 'general.lost_item',
    phase: ['infancy', 'school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.08,
    description: 'events.general.lost_item',
    effects: { happiness: -8, money: -20 },
  },
  {
    id: 'general.won_prize',
    phase: ['infancy', 'school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.05,
    description: 'events.general.won_prize',
    effects: { happiness: 15, money: 100 },
  },
  {
    id: 'general.accident',
    phase: ['infancy', 'school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.06,
    description: 'events.general.accident',
    effects: { health: -15, happiness: -10 },
  },
  {
    id: 'general.good_news',
    phase: ['infancy', 'school', 'youngAdult', 'adult', 'senior'],
    conditions: {},
    probability: 0.10,
    description: 'events.general.good_news',
    effects: { happiness: 12 },
  },
  {
    id: 'general.felt_inspired',
    phase: ['school', 'youngAdult', 'adult', 'senior'],
    conditions: { minSmarts: 30 },
    probability: 0.08,
    description: 'events.general.felt_inspired',
    effects: { smarts: 5, happiness: 8 },
  },
]
