# 0005 - Seed-Based PRNG for Deterministic Randomness

## Status

Accepted

## Context

LifeSim relies heavily on randomness (stat generation, event selection, probability rolls). Pure `Math.random()` causes problems:

- Different results on every playthrough with the same inputs — impossible to reproduce bugs
- No way to share or replay a specific life
- Testing randomness is hard without determinism

## Decision

Use **seedrandom** as the PRNG library. Each `Game` entity receives a seed on creation. All random rolls during the game use this seed combined with the current year, producing deterministic results.

- Same seed + same year = same events and outcomes
- Different seeds = different lives
- Seeds can be shared for future "share your life" features

## Consequences

- Reproducible game sessions — essential for debugging
- Testable randomness — tests can assert specific outcomes given a known seed
- Future feature: share seeds to replay identical lives
- Minimal overhead (~3KB for seedrandom)