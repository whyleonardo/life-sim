# 0002 - IndexedDB with Dexie.js for Local Persistence

## Status

Accepted

## Context

LifeSim needs client-side persistence for game state (characters, events, relationships, careers). The alternatives were:

- **localStorage**: 5-10MB limit, synchronous (blocks main thread), no query support. Unsuitable for a life simulator with relational data.
- **IndexedDB via Dexie.js**: Asynchronous, virtually unlimited storage, supports complex queries, clean API (~15KB). Scales well if the project grows.
- **SQLite (wa-sqlite/sql.js)**: Powerful but adds ~1MB WASM payload, complex setup, overkill for MVP scope.

## Decision

Use **IndexedDB via Dexie.js** for all local persistence.

## Consequences

- No storage size concerns for multiple saved games
- Non-blocking I/O — game stays responsive during saves
- Dexie's query API supports the relational data model (Game → Character, LifeEvent, Relationship, Career)
- Easy to add Supabase sync layer later — Dexie can be paired with Supabase as the local cache
- No WASM overhead or SQLite complexity