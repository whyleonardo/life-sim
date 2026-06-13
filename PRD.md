# LifeSim — Product Requirements Document

## Problem Statement

I want to build a BitLife-style life simulator game as a React web app that works fully offline. There is no existing codebase — this is a greenfield project. The core problem is designing a turn-based life simulation with replayability (randomized events, stats, life phases) that runs entirely in the browser with local persistence, responsive mobile-first UI, and a retro game aesthetic.

## Solution

Build **LifeSim**, a turn-based life simulator as a PWA using Vite + React + TypeScript. The player creates a character with randomized stats, advances year by year making choices (proactive actions + reactive events), and experiences a full life from birth to death. The game is offline-first with IndexedDB persistence via Dexie.js, uses a seed-based PRNG for reproducible randomness, and features a retro pixel-art UI built with shadcn/ui + 8bitcn registry. All game balance constants are centralized for easy tuning.

## User Stories

### Core Loop
1. As a player, I want to start a new life with a randomly generated character, so that each playthrough feels different
2. As a player, I want to reroll my character if I don't like the initial stats, so that I have some control over my starting point
3. As a player, I want to customize my character's name and gender before starting, so that I feel connected to my character
4. As a player, I want to advance time one year at a time by pressing "Age +1", so that I control the pace of the game
5. As a player, I want to see my character's stats (health, happiness, smarts, looks, money) at the top of the screen, so that I always know my current state
6. As a player, I want to see my character's current age and life phase, so that I understand what stage of life I'm in

### Proactive Actions
7. As a player, I want to choose one proactive action per year (study, exercise, socialize, etc.), so that I can influence my character's development
8. As a player, I want the available actions to change based on my life phase, so that the choices feel age-appropriate
9. As a player, I want to be able to skip my proactive action for the year, so that I'm not forced into a choice

### Events
10. As a player, I want random life events to happen each year, so that the game feels unpredictable and realistic
11. As a player, I want events to be presented one at a time, so that I can focus on each decision
12. As a player, I want some events to offer choices with different consequences, so that I feel agency over my character's life
13. As a player, I want events to be filtered by my current life phase and stats, so that they feel contextually appropriate
14. As a player, I want events to have different probabilities, so that rare events feel special

### Life Phases
15. As a player, I want the first 5 years of life to play out automatically, so that I don't have to make decisions for a baby
16. As a player, I want school-age events (6-17) to include studying, friendships, and school-related situations, so that the experience feels like childhood
17. As a player, I want to choose between college and working at age 17-18, so that I can shape my career path
18. As a player, I want young adult events (18-25) to include career starts and relationships, so that this phase feels distinct
19. As a player, I want adult events (26-55) to include career progression and family situations, so that mid-life feels meaningful
20. As a player, I want senior events (56+) to include health challenges and retirement, so that late life feels realistic

### Education
21. As a player, I want my character to automatically progress through school (ages 6-17), so that I don't micromanage basic education
22. As a player, I want to choose whether to attend college or start working at age 17-18, so that I can pursue different career paths
23. As a player, I want college to cost money but boost my smarts, so that there's a trade-off
24. As a player, I want college to unlock better career options, so that the investment feels worthwhile

### Career
25. As a player, I want to see available jobs based on my education and smarts, so that career options feel realistic
26. As a player, I want to get promoted over time with a probability-based system, so that career progression feels organic
27. As a player, I want to be able to ask for a raise as a proactive action, so that I can actively advance my career
28. As a player, I want rare events to cause job loss, so that career stability isn't guaranteed
29. As a player, I want to be able to retire after age 60, so that I can enjoy late life on a pension

### Relationships
30. As a player, I want to have family members generated at birth, so that I start with a family context
31. As a player, I want to make friends through school and work events, so that relationships feel organic
32. As a player, I want to develop romantic relationships starting from adolescence, so that love feels age-appropriate
33. As a player, I want each relationship to have a closeness score (0-100), so that I can see how strong my connections are
34. As a player, I want closeness to decay naturally over time, so that relationships require maintenance
35. As a player, I want events to affect relationship closeness, so that life events impact my connections
36. As a player, I want relationships to end when closeness reaches 0, so that neglected connections fade away

### Health
37. As a player, I want my health to naturally decline as I age, so that aging feels realistic
38. As a player, I want random illness events that reduce my health, so that health isn't just a slow decline
39. As a player, I want to choose whether to treat illnesses (costs money, restores health) or ignore them (free, health stays low), so that there's a financial-health trade-off
40. As a player, I want positive lifestyle events (exercise, good diet) to improve my health, so that healthy choices matter
41. As a player, I want my character to die when health reaches 0, so that health has real consequences

### Death and Game Over
42. As a player, I want my character to die when health reaches 0, so that the game has real stakes
43. As a player, I want a probability of natural death that increases with age (starting at 60), so that no one lives forever
44. As a player, I want rare lethal events (accidents, severe illness) that can cause sudden death, so that life feels fragile
45. As a player, I want to see a life summary when my character dies, so that I can reflect on the life I lived
46. As a player, I want to see my final stats, career history, and key events at game over, so that the summary feels complete
47. As a player, I want to start a new life from the game over screen, so that I can play again immediately

### Multiple Lives
48. As a player, I want to see a list of my saved lives on the home screen, so that I can resume or review past lives
49. As a player, I want to have up to 5 saved lives, so that I can try different paths
50. As a player, I want to continue a saved life where I left off, so that I don't lose progress
51. As a player, I want to see which lives are still active and which have ended, so that I know the status of each life

### Persistence and PWA
52. As a player, I want my game to save automatically after each year, so that I never lose progress
53. As a player, I want the game to work fully offline, so that I can play anywhere
54. As a player, I want to install the game on my phone's home screen, so that it feels like a native app
55. As a player, I want the game to load fast and work without internet, so that it's always accessible

### Localization
56. As a player, I want the game to be in Portuguese, so that I can understand everything
57. As a developer, I want all text to use translation keys via i18next, so that adding new languages in the future is straightforward

## Implementation Decisions

### Module Architecture

The system is decomposed into the following deep modules (testable in isolation with simple interfaces):

**Game Engine** — Pure logic module that processes a turn. Takes a character state + action + events, returns the new character state. No side effects. This is the deepest module and the core of the game.

**Event System** — Data-driven event registry. Events are defined as data objects (not code). The system filters events by conditions (age, stats, phase, career) and selects N events per turn using probability-weighted random selection via the PRNG module.

**PRNG Module** — Thin wrapper around the `seedrandom` library. Takes a seed string, produces deterministic random numbers. Same seed + same year = same events. Enables reproducibility and debugging.

**Character Factory** — Creates new characters with randomized stats within configured ranges. Supports reroll (new seed). Allows customization of name and gender.

**Game Balance Config** — Single source of truth for all tuning constants: stat decay rates, probability thresholds, age multipliers, stat ranges, etc. Pure data module.

**Turn Orchestrator** — Coordinates the turn sequence: (1) proactive action → (2) event generation → (3) event resolution → (4) stat decay → (5) death/phase checks → (6) age increment → (7) persist. Orchestrates deep modules, does not contain business logic itself.

**Storage Layer** — Dexie.js schema and CRUD operations for Game, Character, LifeEvent, Relationship, Career entities. Thin integration layer.

**i18n Module** — i18next configuration with pt-BR locale. All user-facing strings use translation keys.

**UI Components** — shadcn/ui + 8bitcn registry components, Credenza for responsive modals/drawers, stat bars, event cards, action selectors.

**App Shell** — Vite config, PWA plugin, TanStack Router routes, providers (Zustand, Dexie, i18next).

### Data Model

```
Game: { id, createdAt, currentYear, seed }
Character: { id, gameId, name, gender, age, health, happiness, smarts, looks, money }
LifeEvent: { id, gameId, year, type, description, effects, choices[] }
Relationship: { id, gameId, name, type: "family"|"friend"|"partner", closeness }
Career: { id, gameId, title, salary, yearsWorked }
```

Stats are 0-100 (except money, which is an unbounded integer). All tuning values live in Game Balance Config.

### Event Definition Shape

Events are data-driven TS objects:

```ts
interface EventDefinition {
  id: string;
  phase: LifePhase[];
  conditions: { ageMin?: number; ageMax?: number; minSmarts?: number; hasJob?: boolean; ... };
  probability: number; // 0-1
  description: string; // i18n key
  effects: Partial<Stats>;
  choices?: { label: string; effects: Partial<Stats> }[];
}
```

Each game system (education, career, health, relationships) owns its own event catalog file. A central `EventRegistry` collects all catalogs and filters by conditions at turn time.

### Turn Sequence

1. Player selects 0-1 proactive action → effects applied
2. Event System generates N events for the year (filtered by conditions, selected by probability via PRNG)
3. Events presented one at a time; player resolves choices sequentially
4. Stat decay applied (age-based, configured in Game Balance Config)
5. Special checks: death (health=0, age-based probability, lethal events), phase transitions, career promotions
6. Character age incremented
7. Full state persisted to Dexie

### Life Phases

| Phase | Age | Player Control |
|---|---|---|
| Infancy | 0-5 | None — automatic events only |
| School | 6-17 | Proactive actions + event choices |
| Young Adult | 18-25 | College/work choice + full actions |
| Adult | 26-55 | Full actions + career/family events |
| Senior | 56+ | Retirement option + health focus |

### Death Rules

- Health = 0 → immediate death
- Age ≥ 60 → probability of natural death per year (starts at 2%, increases with age, configured in Game Balance Config)
- Lethal events → rare events with direct death chance
- No revive mechanic — death is permanent

### Character Creation

- Random generation: name, gender, stats (within configured ranges)
- Player can customize: name, gender
- Player can reroll (generates entirely new character with new seed)
- Country customization: post-MVP backlog item

### Storage

- IndexedDB via Dexie.js for all persistence
- Up to 5 saved lives (configurable in Game Balance Config)
- Offline-first architecture, prepared for future Supabase sync layer

### Routing

```
/              → My Lives (home, list of saved games)
/game/:id      → Active game (turn-by-turn gameplay)
/gameover/:id  → Life summary (death screen)
```

Sub-screens (Career, Relationships, Education details) are Credenzas within the game route, not separate routes.

### UI Layout

Three-section layout on the game screen:
1. **Top**: Character stats (health, happiness, smarts, looks bars) + money + age
2. **Middle**: Event area — cards presented one at a time with choices
3. **Bottom**: Proactive action selector + "Age +1" button + navigation to sub-screens

Sub-screens open as Credenzas (Dialog on desktop, Drawer on mobile).

Visual style: retro/pixel-art via 8bitcn registry components.

### Stack

- Vite + React + TypeScript
- Zustand (reactive state)
- Dexie.js (IndexedDB persistence)
- TanStack Router (type-safe routing)
- Tailwind CSS + shadcn/ui + 8bitcn registry (UI)
- Credenza (responsive modal/drawer)
- i18next (localization, pt-BR default)
- seedrandom (deterministic PRNG)
- Vitest (unit tests, simulation logic focus)
- Vite PWA plugin (installable offline app)

## Testing Decisions

### What Makes a Good Test

Tests should verify **external behavior**, not implementation details. A good test for the Game Engine gives it a character state and an action, and asserts the resulting state — without caring how the engine computed it. Tests should be resilient to refactors: if the test breaks when the implementation changes but the behavior didn't, the test is testing the wrong thing.

### Modules to Test

| Module | Test Focus |
|---|---|
| **Game Engine** | Turn processing: given character + action + events → correct new state. Decay calculations. Death checks. Phase transitions. |
| **Event System** | Event filtering by conditions (age, stats, phase). Probability-weighted selection determinism. Choice resolution. |
| **PRNG Module** | Same seed produces same sequence. Different seeds produce different sequences. |
| **Character Factory** | Stats within configured ranges. Reroll produces different character. Custom name/gender applied correctly. |
| **Game Balance Config** | All values are valid (stats in range, probabilities 0-1, decay rates positive). Serves as a schema contract test. |

### Modules NOT Tested in MVP

- Storage Layer (Dexie integration)
- UI Components (visual)
- App Shell (routing, PWA config)
- i18n Module (configuration)

### Prior Art

No prior tests exist — this is a greenfield project. The testing pattern to establish: pure function modules with deterministic inputs/outputs, tested via Vitest.

## Out of Scope

- **Children/offspring system** — Relationships are limited to family, friends, and partners. No children in MVP.
- **Country/region system** — Character creation does not include country selection. Post-MVP.
- **Achievements/trophies** — No achievement system in MVP.
- **Cloud sync** — Offline-only in MVP. Supabase sync is a future consideration; architecture is prepared but not implemented.
- **E2E tests** — Not in MVP. Added when requested.
- **Tutorial/onboarding** — No tutorial flow in MVP.
- **Sound/music** — No audio in MVP.
- **Animations** — No complex animations in MVP. Transitions only via CSS.
- **Dark mode** — Single theme in MVP (retro/pixel-art style).
- **Server-side rendering** — SPA only, no SSR.

## Further Notes

- All game balance values (stat decay rates, death probabilities, event probabilities, stat ranges) are centralized in `shared/config/gameBalance.ts` for easy tuning without touching game logic.
- The PRNG seed is stored per game, enabling future features like "share your seed" to replay identical lives.
- The i18n setup uses i18next with pt-BR as the default locale. All user-facing strings use translation keys from day one, even though only one language exists in MVP.
- The Credenza component pattern (Dialog on desktop, Drawer on mobile) ensures the game is playable on both desktop and mobile without separate layouts.
- The event system is designed to be extensible: adding new events requires only adding data objects to catalog files, with no changes to game logic.