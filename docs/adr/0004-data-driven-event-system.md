# 0004 - Data-Driven Event System

## Status

Accepted

## Context

LifeSim's gameplay revolves around random events that happen each year (turn). Events need to be filtered by character conditions (age, stats, life phase, career) and selected by probability. Some events offer choices with different outcomes.

The two approaches were:

- **Events as code**: Each event is a function or class with logic embedded. Flexible but hard to balance, test, and extend.
- **Events as data**: Each event is a plain object with conditions, probability, effects, and choices. The game engine processes them generically. Adding events requires no code changes — only data.

## Decision

Use **events as data**. Each event is a TypeScript object (defined in catalog files per system) with:

```ts
interface EventDefinition {
  id: string;
  phase: LifePhase[];
  conditions: Record<string, unknown>; // ageMin, ageMax, minSmarts, hasJob, etc.
  probability: number; // 0-1
  description: string; // i18n key
  effects: Partial<Stats>;
  choices?: { label: string; effects: Partial<Stats> }[];
}
```

A central `EventRegistry` collects all catalogs and filters by conditions at turn time.

## Consequences

- Adding new events requires only adding data objects — no engine changes
- Game balance is tunable by editing probability/effect values
- Events can be loaded from external JSON in the future (modding, expansions)
- The game engine stays small and generic — it processes any event that matches conditions
- Each game system (education, career, health, relationships) owns its own event catalog file