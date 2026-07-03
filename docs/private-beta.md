# JETS Private Beta

Version 1.0 prepares the current deterministic JETS app for a small private beta.

This milestone does not add AI, live scraping, checkout, or production marketplace data. It hardens setup, onboarding, demo workflows, empty states, route metadata, and smoke-test guidance.

## Beta Scope

Beta testers should validate:

- local mock search
- deterministic ranking
- compare flow
- Build Generator
- saved build snapshots
- decision audit timeline
- Supabase auth and persistence
- dry-run source health
- admin ingestion dry-run persistence, when configured

Beta testers should not expect:

- live marketplace scraping
- AI recommendations
- checkout
- real seller contact workflows
- production inventory

## Setup Checklist

Before a beta session:

1. Run `npm install`.
2. Add `NEXT_PUBLIC_SITE_URL` to `.env.local` for local deploy rehearsal, or to Vercel Project Settings for deployed beta builds.
3. Add `NEXT_PUBLIC_SUPABASE_URL` to `.env.local` or Vercel Project Settings.
4. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` or Vercel Project Settings.
5. Add `SUPABASE_SERVICE_ROLE_KEY` only if testing admin ingestion persistence.
6. Add `JETS_ADMIN_EMAILS` only if testing `/admin/ingestion`.
7. Configure Supabase Auth URL settings:
   - Site URL: production Vercel or custom-domain URL.
   - Local redirect allow-list: `http://localhost:3000/**`.
   - Production redirect allow-list: `https://your-domain.com/**`.
   - Vercel preview redirect allow-list: `https://*-your-vercel-team.vercel.app/**`.
8. Apply migrations in order:
   - `202607020003_v0_3_auth_persistence.sql`
   - `202607020004_v0_4_ingestion_foundation.sql`
   - `202607030008_v0_8_build_snapshots.sql`
   - `202607030009_v0_9_decision_audit.sql`
9. Run `npm run build`.
10. Run `npm run lint -- --max-warnings=0`.

The app also exposes this checklist at `/beta/setup`.

## Demo Data Workflow

The demo workflow is intentionally user-created. JETS does not seed production user rows automatically.

Recommended flow:

1. Open `/search`.
2. Save one build.
3. Favorite one build.
4. Open `/saved-builds` and add notes.
5. Open `/build-generator`.
6. Save at least two snapshots.
7. Open `/build-snapshots`.
8. Rename a snapshot, add notes, favorite it, and change its status.
9. Compare two snapshots.
10. Open `/activity` and confirm the audit trail.
11. Open `/sources` and confirm dry-run source health.
12. If admin env vars are configured, open `/admin/ingestion` and persist a mock dry run.

The app exposes this workflow at `/beta/demo-data`.

## Smoke-Test Checklist

Run this checklist before sharing a beta build:

- Homepage loads in light and dark mode.
- `/beta`, `/beta/setup`, `/beta/demo-data`, and `/feedback` load.
- Missing Supabase env vars show setup guidance instead of broken controls.
- Login and signup show setup guidance when Supabase is missing.
- Search filters, sort, compare, save, and favorite controls remain usable.
- Saved builds show an empty state before data exists.
- Favorites show an empty state before data exists.
- History shows an empty state before data exists.
- Build snapshots show an empty state before data exists.
- Activity shows an empty state before data exists.
- Sources page shows local dry-run data without live requests.
- Admin ingestion handles signed-out, unauthorized, missing service role, and empty run-log states.
- Vercel production and preview deployments show the expected metadata origin.
- Supabase Site URL and redirect URL allow-list entries match the beta deployment URLs.
- Build Generator saves a snapshot when signed in.
- Snapshot restore returns inputs to the Build Generator.
- Snapshot rename, notes, favorite, status, restore, compare, and delete actions record audit events.
- `npm run build` passes.
- `npm run lint -- --max-warnings=0` passes.
- `git diff --check` passes before commit.

## Feedback

`/feedback` is a static placeholder. It exists to guide beta conversations without adding a production support backend too early.

Capture:

- tested workflow
- expected behavior
- actual behavior
- recovery path
- accessibility or mobile issues
- setup confusion

## v1.1 Recommendation

After v1.0, the next milestone should be beta QA instrumentation and release discipline:

- add a minimal issue template
- add manual QA run records
- add migration rehearsal notes
- add accessibility checks
- add lightweight analytics or event inspection only if privacy boundaries are clear

AI and live scraping should still wait until the private beta workflow is stable.
