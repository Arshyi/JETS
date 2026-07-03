# JETS

JETS (Just Enough Tech Solutions) is an AI-assisted hardware decision engine for used PCs, laptops, workstations, servers, and components.

Version 1.0 prepares JETS for a small private beta. It hardens setup guidance, onboarding, demo workflows, empty states, route metadata, feedback capture, and smoke-test documentation without adding AI, live scraping, checkout, or live marketplace ingestion.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
```

## Version Plan

- **0.1:** Foundation, static pages, theme, docs. Complete.
- **0.2:** Search UI, mock data, filters, rankings, compare flow. Complete.
- **0.3:** Supabase authentication, saved builds, favorites, history, settings. Complete.
- **0.4:** Dry-run ingestion foundation, source health, normalized listing schema. Complete.
- **0.5:** Deterministic decision engine and ranking explanations. Complete.
- **0.6:** Deterministic compatibility engine and upgrade checks. Complete.
- **0.7:** Build Generator recommendation workflow. Complete.
- **0.8:** Decision snapshots and recommendation review workflow. Complete.
- **0.9:** Decision audit foundation. Complete.
- **1.0:** Private beta hardening. Current.
- **1.1:** Beta QA instrumentation and release discipline. Recommended next.

## Version 0.2 Notes

- All listing data lives in `data/mock-listings.ts`.
- Hardware domain types live in `types/hardware.ts`.
- Search/filter/sort helpers live in `lib/hardware-search.ts`.
- The search experience is client-side and static.
- The compare page reads mock listing IDs from `/compare?ids=id-one,id-two`.

## Version 0.3 Notes

- Supabase config helpers live in `lib/supabase`.
- Auth pages live at `/login`, `/signup`, and `/account`.
- Persistence pages live at `/saved-builds`, `/favorites`, `/history`, and `/settings`.
- SQL migration lives in `supabase/migrations/202607020003_v0_3_auth_persistence.sql`.
- If Supabase environment variables are missing, the app still builds and shows setup messages.

## Version 0.4 Notes

- Mock source definitions live in `data/mock-ingestion.ts`.
- Ingestion domain types live in `types/ingestion.ts`.
- Adapter, normalization, freshness, and duplicate utilities live in `lib/ingestion`.
- Source health is available at `/sources`.
- Admin dry-run controls are available at `/admin/ingestion`.
- SQL migration lives in `supabase/migrations/202607020004_v0_4_ingestion_foundation.sql`.
- v0.4 does not make live requests to Dubizzle, Amazon.ae, Computer Plaza, or any marketplace.

## Version 0.5 Notes

- Decision engine types live in `types/decision.ts`.
- Use-case presets and score formulas live in `lib/decision-engine`.
- Search cards show decision score breakdowns and why-this-ranks explanations.
- Normalized ingestion samples can be scored without live scraping.
- Deterministic validation fixtures live in `data/decision-engine/validation-fixtures.ts`.
- Formula documentation lives in `docs/decision-engine.md`.
- v0.5 does not implement AI.

## Version 0.6 Notes

- Compatibility domain types live in `types/compatibility.ts`.
- Rule objects live in `lib/compatibility-engine/rules.ts`.
- Report generation lives in `lib/compatibility-engine/engine.ts`.
- Mock compatibility profiles live in `data/compatibility/profiles.ts`.
- Deterministic fixtures live in `data/compatibility/validation-fixtures.ts`.
- Compatibility UI lives in `components/compatibility`.
- The report page is available at `/compatibility`.
- Documentation lives in `docs/compatibility-engine.md`.
- v0.6 does not implement AI, live scraping, or checkout.

## Version 0.7 Notes

- Build generator types live in `types/build-generator.ts`.
- Generator config and recommendation logic live in `lib/build-generator`.
- The workflow page is available at `/build-generator`.
- Recommendation UI lives in `components/build-generator`.
- Generator validation fixtures live in `data/build-generator/validation-fixtures.ts`.
- Documentation lives in `docs/build-generator.md`.
- v0.7 reuses the existing decision engine, compatibility engine, search models, and mock listings.
- v0.7 does not implement AI, live scraping, or checkout.

## Version 0.8 Notes

- Build snapshot types live in `types/build-snapshots.ts`.
- Snapshot serialization and score-delta helpers live in `lib/build-snapshots`.
- Generator input validation lives in `lib/build-generator/validation.ts`.
- Snapshot persistence extends `lib/supabase/queries.ts` and `lib/supabase/persistence-actions.ts`.
- Snapshot pages are available at `/build-snapshots` and `/build-snapshots/compare`.
- The Build Generator can save the current run and restore a saved snapshot from `/build-generator?snapshot=<id>`.
- SQL migration lives in `supabase/migrations/202607030008_v0_8_build_snapshots.sql`.
- Documentation lives in `docs/build-snapshots.md`.
- v0.8 does not implement AI, live scraping, checkout, or local-only persistence.

## Version 0.9 Notes

- Decision audit domain constants live in `types/decision-audit.ts`.
- Audit formatting helpers live in `lib/decision-audit`.
- Audit events are persisted in `decision_audit_events`.
- Snapshot notes live on `build_snapshots.notes`; saved build notes use the existing `saved_builds.notes`.
- The activity page is available at `/activity`.
- Recent activity appears on `/account`.
- Per-snapshot activity appears on `/build-snapshots` and `/build-snapshots/compare`.
- SQL migration lives in `supabase/migrations/202607030009_v0_9_decision_audit.sql`.
- Documentation lives in `docs/decision-audit.md`.
- v0.9 does not implement AI, live scraping, checkout, or local-only persistence.

## Version 1.0 Notes

- Beta onboarding is available at `/beta`.
- Supabase setup checklist is available at `/beta/setup`.
- Demo data workflow is available at `/beta/demo-data`.
- Feedback placeholder is available at `/feedback`.
- Private beta documentation lives in `docs/private-beta.md`.
- Smoke-test guidance is included in `docs/private-beta.md`.
- Major routes now expose page-specific metadata titles and descriptions.
- Empty/setup states now point testers toward the relevant next action.
- v1.0 does not implement AI, live scraping, checkout, or production feedback submission.

## Supabase Environment

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JETS_ADMIN_EMAILS=
```

Then run the SQL migrations in Supabase before using persistence features. `SUPABASE_SERVICE_ROLE_KEY` is server-only and is used by the admin-gated dry-run action to persist ingestion logs. `JETS_ADMIN_EMAILS` is a comma-separated allowlist for `/admin/ingestion`.

## Compliance Boundary

JETS v0.4 through v1.0 use local mock adapters, deterministic local rules, and Supabase-backed user persistence only. Future live ingestion must respect robots.txt, marketplace terms, approved APIs or vendor feeds, conservative rate limits, and removal requests. See `docs/ingestion.md` for the current ingestion notes.
