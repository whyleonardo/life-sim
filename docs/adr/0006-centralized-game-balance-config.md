# 0006 - Centralized Game Balance Config

## Status

Accepted

## Context

LifeSim has many tuning values: stat decay rates, death probabilities, event probabilities, stat ranges, age multipliers, etc. If these values are scattered across the codebase, balancing the game requires hunting through multiple files and understanding implicit relationships.

## Decision

All game balance constants live in a **single module**: `shared/config/gameBalance.ts`. This includes:

- Stat ranges (initial generation ranges)
- Decay rates per stat per age bracket
- Death probability curves by age
- Event probability multipliers
- Phase transition ages
- Career progression rates
- Relationship closeness decay rates
- Maximum saved lives

The module exports typed constants. Game logic modules import from this single source of truth.

## Consequences

- Tuning the game requires editing one file
- No magic numbers scattered in logic code
- Easy to create difficulty presets (easy/medium/hard) by swapping config
- Tests can override specific values for deterministic testing
- Clear contract between game design and game logic