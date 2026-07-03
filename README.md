# JETS

JETS (Just Enough Tech Solutions) is a Hardware Solution Builder for used PCs, laptops, workstations, servers, components, and adapter-based solution paths.

Version 2.3 adds Project Branching & Optimization Workspace. JETS now treats hardware ideas like engineering branches: preserve the original project, explore optimized variants, then compare.

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
- **1.0:** Private beta hardening. Complete.
- **2.0:** Solution Builder workflow redesign. Complete.
- **2.1:** Project persistence and component-aware slot inventory. Complete.
- **2.2:** Optimization Engine Foundation. Complete.
- **2.3:** Project Branching & Optimization Workspace. Current.
- **2.4:** Branch comparison, merge-style apply, and project history diffs. Recommended next.

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

## Version 2.0 Notes

- Solution Builder overview is available at `/solution-builder`.
- Build My Own is available at `/solution-builder/build-my-own`.
- Let JETS Recommend is available at `/solution-builder/recommend`.
- Solution Builder domain types live in `types/solution-builder.ts`.
- Slot definitions, solution strategies, and starter workspace data live in `data/solution-builder.ts`.
- Rule-based project validation and orchestration live in `lib/solution-builder`.
- Search now accepts slot-driven inventory query params and remains available at `/search`.
- Build Generator remains available at `/build-generator` as a supporting deterministic recommendation service.
- Documentation lives in `docs/solution-builder.md`.
- v2.0 does not implement AI, live scraping, checkout, or project persistence.

## Version 2.1 Notes

- Build project dashboard is available at `/solution-builder/projects`.
- Build project detail pages are available at `/solution-builder/projects/[projectId]`.
- Component inventory types live in `types/component-inventory.ts`.
- Mock component inventory lives in `data/mock-components.ts`.
- Slot filtering and component selection helpers live in `lib/component-inventory.ts`.
- Project persistence actions live in `lib/supabase/project-actions.ts`.
- Project queries extend `lib/supabase/queries.ts`.
- SQL migration lives in `supabase/migrations/202607030011_v2_1_build_projects.sql`.
- Documentation lives in `docs/component-inventory.md`.
- v2.1 does not implement AI, live scraping, checkout, or live marketplace inventory.

## Version 2.2 Notes

- Optimization domain types live in `types/optimization.ts`.
- The deterministic optimization pipeline lives in `lib/optimization-engine/pipeline.ts`.
- Optimization persistence actions live in `lib/supabase/optimization-actions.ts`.
- The project optimizer is available at `/solution-builder/projects/[projectId]/optimize`.
- SQL migration lives in `supabase/migrations/202607030012_v2_2_optimization_engine.sql`.
- Documentation lives in `docs/optimization-engine.md`.
- Optimizations honor locked slots and selected depth: standard, enthusiast, or experimental.
- v2.2 does not implement AI, live scraping, checkout, or automatic project mutation.

## Version 2.3 Notes

- Project branch metadata lives on `build_projects`.
- Branch actions live in `lib/supabase/branch-actions.ts`.
- Branch workspace UI lives in `components/solution-builder/project-branch-workspace.tsx`.
- Optimizer suggestions can create child project branches without mutating the source project.
- SQL migration lives in `supabase/migrations/202607030013_v2_3_project_branching.sql`.
- Documentation lives in `docs/project-branching.md`.
- v2.3 does not implement AI, live scraping, checkout, or automatic merge behavior.

## Environment Variables

Copy `.env.example` to `.env.local` and configure these values for local or Vercel deployment:

| Variable | Purpose | Required? | Public or secret | Example value | Used by |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical app origin for metadata and Supabase redirect planning. | Yes for production | Public | `https://jets.example.com` | `config/site.ts`, `lib/supabase/auth-redirect.ts`, `/beta/setup` |
| `NEXT_PUBLIC_VERCEL_URL` | Optional preview host fallback when `NEXT_PUBLIC_SITE_URL` is not set. | No | Public | `jets-git-main-your-team.vercel.app` | `config/site.ts`, `lib/supabase/auth-redirect.ts` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for auth and persistence clients. | Yes for Supabase features | Public | `https://your-project-ref.supabase.co` | `lib/supabase/config.ts`, Supabase clients, `/beta/setup` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for user-scoped auth and RLS-protected database access. | Yes for Supabase features | Public | `eyJ...` | `lib/supabase/config.ts`, Supabase clients, `/beta/setup` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for admin ingestion dry-run persistence. | Only for admin ingestion persistence | Secret | `eyJ...` | `lib/supabase/service-role.ts`, `/admin/ingestion`, `/beta/setup` |
| `JETS_ADMIN_EMAILS` | Comma-separated allowlist for admin ingestion access. | Only for admin ingestion access | Secret/server-only | `admin@example.com` | `lib/supabase/admin.ts`, `/admin/ingestion`, `/beta/setup` |

Then run the SQL migrations in Supabase before using persistence features. If Supabase variables are missing, static mock workflows still build and show setup guidance instead of failing.

Apply these Supabase migrations in order:

1. `202607020003_v0_3_auth_persistence.sql`
2. `202607020004_v0_4_ingestion_foundation.sql`
3. `202607030008_v0_8_build_snapshots.sql`
4. `202607030009_v0_9_decision_audit.sql`
5. `202607030011_v2_1_build_projects.sql`
6. `202607030012_v2_2_optimization_engine.sql`
7. `202607030013_v2_3_project_branching.sql`
8. `202607030014_production_schema_hardening.sql`

## Vercel Deployment

Use the default Vercel Next.js project settings:

```bash
npm install
npm run build
```

Configure these environment variables in Vercel Project Settings before promoting a beta deployment:

- `NEXT_PUBLIC_SITE_URL`: production origin for metadata and Supabase redirect planning.
- `NEXT_PUBLIC_VERCEL_URL`: optional preview origin fallback if explicitly configured.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anon key.
- `SUPABASE_SERVICE_ROLE_KEY`: optional server-only key for admin ingestion dry-run persistence.
- `JETS_ADMIN_EMAILS`: optional comma-separated allowlist for `/admin/ingestion`.

In Supabase Auth URL Configuration, set the Site URL to the production Vercel or custom-domain URL. Add redirect URL allow-list entries for local development, the production domain, and Vercel preview deployments, for example:

```text
http://localhost:3000/**
https://your-domain.com/auth/callback
https://your-domain.com/**
https://*-your-vercel-team.vercel.app/**
```

For the current production deployment, include `https://jets-lilac.vercel.app/auth/callback` and `https://jets-lilac.vercel.app/**`. Use exact production redirect paths where possible, and keep wildcard preview redirects limited to the Vercel team or project pattern. Redeploy after changing Vercel environment variables.

## Compliance Boundary

JETS v0.4 through v2.3 use local mock adapters, deterministic local rules, component-aware mock inventory, deterministic optimization, branch-safe project variants, and Supabase-backed user persistence only. Future live ingestion must respect robots.txt, marketplace terms, approved APIs or vendor feeds, conservative rate limits, and removal requests. See `docs/ingestion.md` for the current ingestion notes.
