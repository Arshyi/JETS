# JETS Build Snapshots

Version 0.8 persists Build Generator decisions as restorable snapshots.

Snapshots do not add AI, live scraping, checkout, or a second persistence system. They extend the existing Supabase-backed persistence layer from v0.3 and preserve deterministic v0.7 generator output.

## What A Snapshot Preserves

Each saved snapshot stores:

- budget
- country
- currency
- primary use case
- user preferences
- already-owned hardware
- generated recommendations
- decision scores
- compatibility scores
- platform health
- why-this-build explanations
- closest alternatives
- timestamp
- app version

The table also stores summary columns for list and compare screens:

- top listing id
- top listing title
- top overall score
- top decision score
- top compatibility score
- platform health
- status
- favorite flag

## User Workflow

Users can:

- save the current Build Generator result
- view prior saved snapshots
- compare two or three snapshots
- rename snapshots
- favorite snapshots
- delete snapshots
- restore a snapshot back into the Build Generator
- view created and updated timestamps
- view score changes against a comparison baseline
- mark a snapshot as Reviewing, Accepted, Rejected, Purchased, or Archived
- add decision notes
- view per-snapshot activity from the v0.9 audit trail

## Architecture

Snapshot domain types live in:

- `types/build-snapshots.ts`

Snapshot serialization and restore helpers live in:

- `lib/build-snapshots/snapshot.ts`

Strict generator input validation lives in:

- `lib/build-generator/validation.ts`

Supabase reads and writes continue to use:

- `lib/supabase/queries.ts`
- `lib/supabase/persistence-actions.ts`

UI lives in:

- `components/build-snapshots`
- `app/(workspace)/build-snapshots`
- `app/(workspace)/build-snapshots/compare`

Database migration:

- `supabase/migrations/202607030008_v0_8_build_snapshots.sql`

Version 0.9 extends snapshots with:

- `build_snapshots.notes`
- `decision_audit_events`
- per-snapshot activity on list and compare views

## Storage Design

The snapshot stores immutable JSON for historical fidelity. This is important because future scoring formulas may change. A saved v0.8 result should still explain what the app recommended at the time it was generated.

Summary columns are duplicated intentionally. They make snapshot lists and comparisons fast without needing to parse large JSON payloads for every sort, filter, or dashboard view.

## Boundaries

Version 0.8 does not:

- scrape marketplaces
- call AI models
- implement checkout
- create localStorage-only persistence
- replace saved builds, favorites, or history

## v1.0 Direction

The next layer should harden the current deterministic snapshot workflow for private beta users before adding AI or live marketplace ingestion.
