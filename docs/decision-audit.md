# JETS Decision Audit Foundation

Version 0.9 creates a unified audit/activity model for user decisions.

The audit foundation does not add AI, live scraping, checkout, or a second persistence path. It records meaningful decision events across the existing Supabase-backed persistence surfaces.

## Why This Exists

Before v0.9, JETS had several useful but separate records:

- `saved_builds`: current saved listing decisions.
- `favorite_builds`: current favorite listings.
- `build_history`: early saved/favorited action history.
- `build_snapshots`: durable generator recommendation snapshots.
- snapshot status and favorite fields: current decision state.

The overlap is that each can represent a decision moment. A user may save a listing, favorite it, generate a snapshot, rename that snapshot, change its status to Accepted, add notes, restore it later, or delete it. Those actions need one timeline.

## Audit Model

The new table is:

- `decision_audit_events`

Each event stores:

- user id
- event type
- subject type
- subject id
- subject title
- summary
- optional note
- metadata
- before state
- after state
- app version
- timestamp

The table is append-only from the app’s perspective. Current state still belongs in the existing resource tables.

## Event Types

Version 0.9 records:

- snapshot created
- snapshot renamed
- snapshot favorited
- snapshot unfavorited
- snapshot status changed
- snapshot restored
- snapshot deleted
- snapshot note updated
- build saved
- build favorited
- build note updated
- history cleared

## Notes

Snapshot notes live on:

- `build_snapshots.notes`

Saved build notes continue to live on:

- `saved_builds.notes`

Each note update also writes an audit event. This keeps current notes easy to read while preserving the decision trail.

## UI Surfaces

Audit events appear in:

- `/activity`
- `/account`
- `/build-snapshots`
- `/build-snapshots/compare`

The reusable timeline component lives in:

- `components/decision-audit/audit-timeline.tsx`

## Architecture

Domain constants live in:

- `types/decision-audit.ts`

Formatting helpers live in:

- `lib/decision-audit/format.ts`

Supabase queries and server actions continue to live in:

- `lib/supabase/queries.ts`
- `lib/supabase/persistence-actions.ts`

Migration:

- `supabase/migrations/202607030009_v0_9_decision_audit.sql`

## Future AI Boundary

Future AI explanations should become audit events or event metadata. They should not replace deterministic explanations, and they should not mutate historical snapshots.

That keeps JETS explainable: the deterministic score is the source of truth, while later AI can summarize, annotate, or help users understand it.

## v1.0 Recommendation

The next milestone should be Private Beta Hardening.

JETS now has enough foundation to test with real users while still using mock listings and deterministic rules. Before AI or live scraping, v1.0 should focus on:

- Supabase migration rehearsal.
- Auth and persistence QA.
- Error handling.
- Responsive and accessibility review.
- Seeded beta data.
- Basic onboarding.
