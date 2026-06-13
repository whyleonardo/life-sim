# 0003 - Offline-First Architecture

## Status

Accepted

## Context

LifeSim is a single-player game that should work without internet. However, cross-device sync (play on phone, continue on tablet) is a desirable future feature. The architecture must support both realities.

## Decision

Design the app as **offline-first from day one**:

- **Dexie.js is the source of truth** for all game data
- All reads and writes go through Dexie — no network calls in MVP
- The data model is designed to be sync-friendly (unique IDs, no orphaned records, clear entity relationships)
- When Supabase is added in the future, it will sync Dexie's data to the cloud — the local layer remains authoritative

## Consequences

- Game works fully offline after first load (PWA with service worker)
- No network dependency in MVP — simpler architecture, faster development
- Data model must be clean and normalized from the start (preparing for sync)
- Future Supabase integration is additive: add auth + sync layer, don't rewrite storage