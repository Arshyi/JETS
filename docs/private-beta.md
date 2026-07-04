# JETS Private Beta

Version 1.0 prepares the current deterministic JETS app for a small private beta.

This milestone does not add AI, live scraping, checkout, or production marketplace data. It hardens setup, onboarding, demo workflows, empty states, route metadata, and smoke-test guidance.

The post-auth beta path is now project-first: signup confirmation should send the tester into `/onboarding`, the account page acts as the signed-in beta dashboard, and `/beta/smoke-test` verifies that project persistence survives sign out and sign in.

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
3. Add `NEXT_PUBLIC_VERCEL_URL` only if using it as an explicit preview URL fallback.
4. Add `NEXT_PUBLIC_SUPABASE_URL` to `.env.local` or Vercel Project Settings.
5. Add `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local` or Vercel Project Settings.
6. Add `SUPABASE_SERVICE_ROLE_KEY` only if testing admin ingestion persistence.
7. Add `JETS_ADMIN_EMAILS` only if testing `/admin/ingestion`.
8. Configure Supabase Auth URL settings:
   - Site URL: production Vercel or custom-domain URL.
   - Local redirect allow-list: `http://localhost:3000/**`.
   - Production auth callback: `https://your-domain.com/auth/callback`.
   - Production redirect allow-list: `https://your-domain.com/**`.
   - Vercel preview redirect allow-list: `https://*-your-vercel-team.vercel.app/**`.
   - Email template: keep `{{ .ConfirmationURL }}` or use a custom `/auth/callback?token_hash={{ .TokenHash }}&type=email` link.
9. Apply migrations in order:
   - `202607020003_v0_3_auth_persistence.sql`
   - `202607020004_v0_4_ingestion_foundation.sql`
   - `202607030008_v0_8_build_snapshots.sql`
   - `202607030009_v0_9_decision_audit.sql`
   - `202607030011_v2_1_build_projects.sql`
   - `202607030012_v2_2_optimization_engine.sql`
   - `202607030013_v2_3_project_branching.sql`
   - `202607030014_production_schema_hardening.sql`
10. Run `npm run build`.
11. Run `npm run lint -- --max-warnings=0`.

The app also exposes this checklist at `/beta/setup`.

## Verified Auth Flow

Expected Supabase Auth behavior:

1. Tester opens `/signup`.
2. Signup sends Supabase a fully qualified `/auth/callback?next=/onboarding` redirect.
3. Supabase email confirmation uses either the default `{{ .ConfirmationURL }}` template or a custom token hash link pointing at `/auth/callback`.
4. `/auth/callback` exchanges a PKCE `code` or verifies `token_hash` links.
5. If a session is returned, the tester lands on `/onboarding` with an email-confirmed success message.
6. If Supabase confirms the email without returning a session, the tester lands on `/login` with a clear success message and then continues to `/onboarding`.
7. Expired, invalid, or malformed links route to `/login` with a clear error message.

## Demo Data Workflow

The demo workflow is intentionally user-created. JETS does not seed production user rows automatically.

Recommended flow:

1. Open `/onboarding`.
2. Create the first hardware project.
3. Open the project detail page and fill several hardware slots.
4. Run project optimization from the project page.
5. Sign out, sign back in, and confirm the project still appears on `/account`.
6. Open `/beta/smoke-test` and review the signed-in checklist.
7. Open `/search` only as supporting inventory, then save and favorite one item.
8. Open `/build-generator` and save at least two snapshots.
9. Open `/build-snapshots`, rename a snapshot, add notes, favorite it, and change its status.
10. Compare two snapshots.
11. Open `/activity` and confirm the audit trail.
12. Open `/sources` and confirm dry-run source health.
13. If admin env vars are configured, open `/admin/ingestion` and persist a mock dry run.

The app exposes this workflow at `/beta/demo-data`.

## Smoke-Test Checklist

Run this checklist before sharing a beta build:

- Homepage loads in light and dark mode.
- `/beta`, `/beta/setup`, `/beta/demo-data`, `/beta/smoke-test`, and `/feedback` load.
- Missing Supabase env vars show setup guidance instead of broken controls.
- Login and signup show setup guidance when Supabase is missing.
- Signup confirmation links use `/auth/callback` and show a success or clear error message.
- Confirmed users land on `/onboarding` or return through `/login` with a success message.
- The global header shows signed-in, signed-out, or auth setup state.
- `/account` shows project-first actions, persistence counts, recent activity, and sign out.
- `/onboarding` can create the first hardware project and open the project detail page.
- `/beta/smoke-test` reflects signed-in project, snapshot, research, and activity state.
- Search filters, sort, compare, save, and favorite controls remain usable.
- Saved builds show a project-first empty state before data exists.
- Favorites show a project-first empty state before data exists.
- History shows a project-first empty state before data exists.
- Build snapshots show a project-first empty state before data exists.
- Activity shows a project-first empty state before data exists.
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
