// ============================================================
// Education Events — events that occur during the school phase.
// ============================================================

import type { EventDefinition } from '../types'

export const educationEvents: EventDefinition[] = [
  {
    id: 'education.passed_test',
    phase: ['school'],
    conditions: { minSmarts: 30 },
    probability: 0.30,
    description: 'events.education.passed_test',
    effects: { smarts: 8, happiness: 5 },
  },
  {
    id: 'education.failed_class',
    phase: ['school'],
    conditions: {},
    probability: 0.12,
    description: 'events.education.failed_class',
    effects: { smarts: -5, happiness: -10 },
    choices: [
      {
        label: 'events.education.failed_class_choice_study',
        effects: { smarts: 5, happiness: -3 },
      },
      {
        label: 'events.education.failed_class_choice_ignore',
        effects: { happiness: -5 },
      },
    ],
  },
  {
    id: 'education.school_friend',
    phase: ['school'],
    conditions: {},
    probability: 0.20,
    description: 'events.education.school_friend',
    effects: { happiness: 10 },
  },
  {
    id: 'education.scholarship',
    phase: ['school'],
    conditions: { minSmarts: 60 },
    probability: 0.05,
    description: 'events.education.scholarship',
    effects: { money: 200, smarts: 5, happiness: 15 },
    choices: [
      {
        label: 'events.education.scholarship_choice_accept',
        effects: { money: 200, smarts: 5, happiness: 10 },
      },
      {
        label: 'events.education.scholarship_choice_decline',
        effects: { happiness: 5, smarts: 3 },
      },
    ],
  },
  {
    id: 'education.trouble',
    phase: ['school'],
    conditions: {},
    probability: 0.08,
    description: 'events.education.trouble',
    effects: { happiness: -10, smarts: -3 },
    choices: [
      {
        label: 'events.education.trouble_choice_apologize',
        effects: { happiness: 3 },
      },
      {
        label: 'events.education.trouble_choice_defend',
        effects: { smarts: 2, happiness: -5 },
      },
    ],
  },
  {
    id: 'education.joined_club',
    phase: ['school'],
    conditions: {},
    probability: 0.15,
    description: 'events.education.joined_club',
    effects: { happiness: 8, smarts: 3 },
  },
  {
    id: 'education.great_teacher',
    phase: ['school'],
    conditions: {},
    probability: 0.10,
    description: 'events.education.great_teacher',
    effects: { smarts: 10, happiness: 5 },
  },
]
