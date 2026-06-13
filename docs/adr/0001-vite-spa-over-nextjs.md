# 0001 - Vite SPA over Next.js

## Status

Accepted

## Context

LifeSim is a turn-based life simulator game that runs entirely in the browser. We need a React framework for the project. The main alternatives were:

- **Vite + React (SPA)**: Lightweight, fast dev server, no SSR overhead, perfect for offline-first apps
- **Next.js**: Full framework with SSR, routing, API routes, and server components

The user initially considered Next.js because of concerns about cross-device sync without a custom server.

## Decision

Use **Vite + React as a single-page application**. No Next.js.

Cross-device sync is orthogonal to the frontend framework — it requires a data layer (e.g., Supabase), not a server-rendered app. Next.js adds complexity (SSR, server components, API routes) that provides no benefit for an offline-first game. When sync is needed in the future, Supabase will be added as a BaaS layer without requiring a framework change.

## Consequences

- Simpler build and deployment (static files only)
- No SSR, no server components — not needed for a game
- PWA works naturally with Vite PWA plugin
- Future sync via Supabase is additive, not a rewrite
- If a landing page or blog is needed later, it would be a separate app