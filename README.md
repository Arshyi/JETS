# JETS

JETS (Just Enough Tech Solutions) is a Hardware Solution Builder for used PCs, laptops, workstations, servers, components, and adapter-based solution paths.

JETS is now acquisition-centered and project-backed. The practical experience is: capture a hardware listing manually, normalize it, review evidence and missing information, decide whether it is worth pursuing, then create or reuse a project for build-level validation and optimization. Phase 4 uses the existing engine instead of adding another subsystem.

## Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run validate:hardware
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
- **2.3:** Project Branching & Optimization Workspace. Complete.
- **2.4:** Project-first workflow consolidation. Complete.
- **2.5:** Platform Knowledge Engine. Complete.
- **2.6:** Solution Intelligence Engine. Complete.
- **3.0:** Marketplace Intelligence Layer. Complete.
- **3.1:** Evidence Engine and knowledge provenance. Complete.
- **3.2:** Persisted evidence review, conflicts, and moderation workflow. Complete.
- **3.3:** Listing Intelligence and human review. Complete.
- **3.4:** Importer fixtures and listing seeding. Complete.
- **3.5:** Hardware Knowledge Validation Framework. Complete.
- **4.0:** Manual Acquisition Workflow. Current.
- **4.1:** Persisted acquisition records and project links. Recommended next.

## Primary Workflow

1. A user finds hardware and captures the listing manually at `/acquire`.
2. JETS normalizes the raw listing into parsed fields, platform detection, confidence, evidence, missing information, and Recommendation Readiness.
3. The user can correct CPU, GPU, RAM, platform, price, and storage before saving; corrections are treated as evidence.
4. The user decides whether to analyze only, save, archive, reject, mark purchased, compare acquisitions, or create a project.
5. Promising acquisitions become Solution Builder projects.
6. Builder, Inventory, Validation, Platform Knowledge, Solution Intelligence, Optimization, Branching, and Compare handle the build-level decision.

Marketplace Intelligence sits below the workflow as input plumbing:

```text
Raw Marketplace Data -> Listing Intelligence -> Evidence -> Platform Knowledge -> Solution Intelligence -> Optimization -> Recommendation
```

Ingestion and parsing do not make recommendations. Optimization and reasoning do not know how a listing was captured. Evidence records explain why JETS trusts a parsed field, knowledge item, or recommendation.

See `docs/user-workflow.md` for the journey diagram and UX rules.

## Version 0.2 Notes

- All listing data lives in `data/mock-listings.ts`.
- Hardware domain types live in `types/hardware.ts`.
- Inventory/search filter and sort helpers live in `lib/hardware-search.ts` and `lib/inventory.ts`.
- The inventory experience is client-side, category grouped, and static.
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
- Inventory listing cards show decision score breakdowns and why-this-ranks explanations within their category.
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
- Inventory now accepts slot-driven query params at `/inventory`; `/search` remains a backward-compatible alias.
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

## Version 2.5 Notes

- Platform knowledge types live in `types/platform-knowledge.ts`.
- Curated demo platform profiles and adapter intelligence live in `data/platform-knowledge.ts`.
- Platform lookup and project summary utilities live in `lib/platform-knowledge.ts`.
- The Solution Builder model exposes `platformInsight` so projects, inventory, optimization, and future branch comparison can reuse the same platform context.
- Platform knowledge UI lives in `components/platform-knowledge`.
- Project detail pages now show platform potential, constraints, PCIe reasoning, upgrade opportunities, adapter recommendations, and upgrade timelines for recognized bases.
- Inventory and selected component cards show platform knowledge summaries when an item maps to a known platform.
- Documentation lives in `docs/platform-knowledge-engine.md`.
- v2.5 does not implement AI, live scraping, marketplace APIs, checkout, or automatic knowledge verification.

## Version 2.6 Notes

- Solution intelligence types live in `types/solution-intelligence.ts`.
- The deterministic reasoning engine lives in `lib/solution-intelligence/engine.ts`.
- The project reasoning UI lives in `components/solution-intelligence/solution-intelligence-panel.tsx`.
- Project detail pages now explain why the build works, why parts are rejected, bottlenecks, upgrade simulations, use-case fit, cost allocation, hidden opportunities, advisor recommendations, confidence, decision history, and branch-intelligence signals.
- Solution intelligence reuses the existing Builder model, compatibility results, component inventory, and Platform Knowledge Engine.
- Documentation lives in `docs/solution-intelligence-engine.md`.
- v2.6 does not implement AI, live scraping, marketplace APIs, checkout, benchmark databases, or persisted intelligence reports.

## Version 3.0 Notes

- Marketplace Intelligence types live in `types/marketplace-intelligence.ts`.
- Representative source adapter definitions and raw marketplace fixtures live in `data/mock-marketplace-intelligence.ts`.
- Deterministic normalization, platform detection, parser confidence, listing health, opportunity preview, and future-path generation live in `lib/marketplace-intelligence/normalize.ts`.
- The `/sources` page now shows the Phase 3 pipeline demo beside the older dry-run source health tooling.
- Demo imports cover Dell Precision, ThinkStation, OptiPlex, Mac Pro, gaming PC, laptop, and mini PC examples.
- Documentation lives in `docs/marketplace-intelligence.md`.
- v3.0 does not implement live scraping, website automation, marketplace APIs, checkout, AI extraction, OCR, image recognition, or listing persistence.

## Version 3.1 Notes

- Evidence domain types live in `types/evidence.ts`.
- Representative source trust, evidence records, conflicts, community discoveries, and knowledge history live in `data/evidence.ts`.
- Evidence query and Knowledge Quality scoring utilities live in `lib/evidence-engine.ts`.
- Reusable Evidence Panel UI lives in `components/evidence/evidence-panel.tsx`.
- Platform Knowledge, adapter intelligence, Marketplace Intelligence parser output, and Solution Intelligence reasoning now expose provenance, confidence, verification state, and conflict awareness where appropriate.
- Documentation lives in `docs/evidence-engine.md`.
- v3.1 does not implement live scraping, marketplace APIs, AI extraction, OCR, image recognition, checkout, moderation queues, or persisted evidence tables.

## Version 3.2 Notes

- SQL migration lives in `supabase/migrations/202607060001_v3_2_evidence_review.sql`.
- Evidence review database tables include `evidence_records`, `evidence_sources`, `evidence_conflicts`, `evidence_timeline_events`, `evidence_review_notes`, and `parsed_field_evidence_links`.
- Evidence review queries live in `lib/supabase/evidence-queries.ts`.
- Evidence submission and moderation actions live in `lib/supabase/evidence-actions.ts`.
- Evidence dashboard routes are available at `/evidence`, `/evidence/review`, `/evidence/conflicts`, `/evidence/[recordId]`, and `/evidence/platforms/[platformId]`.
- Signed-in users can submit pending evidence records. Admin-allowed reviewers can update verification state when `SUPABASE_SERVICE_ROLE_KEY` is configured.
- v3.2 does not implement live scraping, marketplace APIs, AI extraction, OCR, image recognition, checkout, or automated source ingestion.

## Version 3.3 Notes

- SQL migration lives in `supabase/migrations/202607060002_v3_3_listing_intelligence.sql`.
- Listing Intelligence tables include `normalized_marketplace_listings`, `listing_parsed_fields`, `listing_field_corrections`, `listing_duplicate_candidates`, and `listing_review_events`.
- Deterministic listing intelligence utilities live in `lib/listing-intelligence/engine.ts`.
- Listing review queries and actions live in `lib/supabase/listing-intelligence-queries.ts` and `lib/supabase/listing-intelligence-actions.ts`.
- Listing review routes are available at `/listing-intelligence`, `/listing-intelligence/review`, `/listing-intelligence/duplicates`, and `/listing-intelligence/[listingId]`.
- Parsed fields can be accepted, rejected, corrected, or marked unknown. Corrections create evidence records and parsed-field evidence links.
- v3.3 does not implement live scraping, browser automation, marketplace APIs, AI extraction, OCR, checkout, or automatic recommendation creation.

## Version 3.4 Notes

- SQL migration lives in `supabase/migrations/202607060003_v3_4_importer_fixtures.sql`.
- Importer fixture types live in `types/importer-fixtures.ts`.
- Fixture sets live in `data/importer-fixtures.ts`.
- Deterministic validation and parsing live in `lib/importer-fixtures/engine.ts`.
- Admin fixture queries and actions live in `lib/supabase/importer-fixture-queries.ts` and `lib/supabase/importer-fixture-actions.ts`.
- Admin UI route is `/admin/importer-fixtures`.
- Fixture validation covers missing title, missing price, unsupported marketplace, invalid currency, low-confidence platform detection, and duplicate external ID.
- Seed imports create/update Listing Intelligence records, parsed fields, evidence records, parsed-field evidence links, duplicate candidates, and importer run logs.
- v3.4 does not implement live scraping, browser automation, marketplace APIs, AI extraction, OCR, checkout, or automatic project creation.

## Version 3.5 Notes

- Hardware validation types live in `types/validation-framework.ts`.
- Golden hardware scenarios live in `data/validation/hardware-scenarios.ts`.
- The validation engine and report renderers live in `lib/validation-framework/engine.ts`.
- The validation command is `npm run validate:hardware`.
- Reports are generated at `docs/generated/hardware-validation-report.md` and `docs/generated/hardware-validation-report.html`.
- The suite exercises Marketplace Intelligence, Listing Intelligence, Evidence linkage, Platform Knowledge, Solution Intelligence, Optimization, Compatibility fixtures, and Builder validation.
- The first scenario pack covers ThinkStation P510, OptiPlex 7060, Precision 5820, HP Z440, gaming build, AI workstation, engineering workstation, budget office PC, broken listing, unknown listing, low-confidence listing, and duplicate listing.
- Documentation lives in `docs/validation-framework.md`.
- v3.5 does not implement AI, live scraping, browser automation, marketplace APIs, OCR, checkout, or production ingestion.

## Version 4.0 Notes

- Manual acquisition workspace is available at `/acquire`.
- Acquisition types live in `types/acquisition.ts`.
- Capture-to-preview orchestration lives in `lib/acquisition/workflow.ts`.
- Acquisition UI lives in `components/acquisition/acquisition-workspace.tsx`.
- Users can enter marketplace, listing URL, title, description, price, currency, location, condition, seller notes, placeholder image count, and personal notes.
- Preview runs the existing Marketplace Intelligence, Listing Intelligence, Evidence, Platform Knowledge, and Recommendation Preview path.
- Users can correct CPU, GPU, RAM, platform, price, and storage before saving. Corrections appear as user-submitted evidence instead of overwriting parser output.
- Saved acquisitions are stored in browser local storage for v4.0 and can be compared side by side as purchase candidates.
- Project handoff links create Engineering, Gaming, AI Workstation, Home Server, or reused project paths.
- Documentation lives in `docs/acquisition-workflow.md`.
- v4.0 does not implement AI, live scraping, browser automation, marketplace APIs, OCR, checkout, Supabase acquisition persistence, or automatic project slot population.

## Post-Auth Beta Hardening Notes

- Signup now defaults to the signed-in onboarding flow at `/onboarding`.
- `/auth/callback` supports Supabase PKCE `code` links and `token_hash` email confirmation links.
- Successful confirmation redirects include `authStatus=success&authMessage=email-confirmed` so the app can show a clear success state.
- The global header shows whether the visitor is signed in, signed out, or missing Supabase setup.
- `/account` is now a beta control panel for continuing projects, running smoke tests, checking persistence counts, and signing out.
- `/beta/smoke-test` is the signed-in checklist for account creation, first project creation, persistence, snapshots, activity, and session recovery.
- Empty saved-build, favorite, history, snapshot, and activity states point testers toward Solution Builder before falling back to Inventory.

## Inventory Model

- Inventory is the supporting surface for Solution Builder projects, not the main marketplace.
- Inventory should feel like a hardware picker launched from a project slot.
- `/inventory` groups mock/demo items by hardware category so GPUs, laptops, base systems, adapters, and full systems do not appear as one universal ranking list.
- `/search` remains available as an alias for old links, but user-facing navigation now says Inventory.
- Slot-driven URLs such as `/inventory?slot=gpu&projectId=<id>` show only relevant categories and allow typed components to be added to the project slot.
- JETS still uses local mock/demo inventory only. Live ingestion and scraping are planned but not active.
- Inventory documentation lives in `docs/inventory.md`.

## Environment Variables

Copy `.env.example` to `.env.local` and configure these values for local or Vercel deployment:

| Variable | Purpose | Required? | Public or secret | Example value | Used by |
| --- | --- | --- | --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Canonical app origin for metadata and Supabase redirect planning. | Yes for production | Public | `https://jets.example.com` | `config/site.ts`, `lib/supabase/auth-redirect.ts`, `/beta/setup` |
| `NEXT_PUBLIC_VERCEL_URL` | Optional preview host fallback when `NEXT_PUBLIC_SITE_URL` is not set. | No | Public | `jets-git-main-your-team.vercel.app` | `config/site.ts`, `lib/supabase/auth-redirect.ts` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL for auth and persistence clients. | Yes for Supabase features | Public | `https://your-project-ref.supabase.co` | `lib/supabase/config.ts`, Supabase clients, `/beta/setup` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key for user-scoped auth and RLS-protected database access. | Yes for Supabase features | Public | `eyJ...` | `lib/supabase/config.ts`, Supabase clients, `/beta/setup` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key for admin ingestion dry-run persistence, evidence moderation, listing field review, and importer fixture seeding. | Only for admin ingestion/evidence/listing/importer moderation | Secret | `eyJ...` | `lib/supabase/service-role.ts`, `/admin/ingestion`, `/admin/importer-fixtures`, `/evidence/review`, `/listing-intelligence/review`, `/beta/setup` |
| `JETS_ADMIN_EMAILS` | Comma-separated allowlist for admin ingestion, evidence review, listing review, and importer fixture access. | Only for admin ingestion/evidence/listing/importer moderation | Secret/server-only | `admin@example.com` | `lib/supabase/admin.ts`, `/admin/ingestion`, `/admin/importer-fixtures`, `/evidence/review`, `/listing-intelligence/review`, `/beta/setup` |

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
9. `202607060001_v3_2_evidence_review.sql`
10. `202607060002_v3_3_listing_intelligence.sql`
11. `202607060003_v3_4_importer_fixtures.sql`

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
- `SUPABASE_SERVICE_ROLE_KEY`: optional server-only key for admin ingestion dry-run persistence, evidence moderation, listing field review, and importer fixture seeding.
- `JETS_ADMIN_EMAILS`: optional comma-separated allowlist for `/admin/ingestion`, `/admin/importer-fixtures`, `/evidence/review`, and `/listing-intelligence/review`.

In Supabase Auth URL Configuration, set the Site URL to the production Vercel or custom-domain URL. Add redirect URL allow-list entries for local development, the production domain, and Vercel preview deployments, for example:

```text
http://localhost:3000/**
https://your-domain.com/auth/callback
https://your-domain.com/**
https://*-your-vercel-team.vercel.app/**
```

For the current production deployment, include `https://jets-lilac.vercel.app/auth/callback` and `https://jets-lilac.vercel.app/**`. Use exact production redirect paths where possible, and keep wildcard preview redirects limited to the Vercel team or project pattern. Redeploy after changing Vercel environment variables.

For Supabase Email confirmation, the default template using `{{ .ConfirmationURL }}` is supported. If you customize the email template for SSR confirmation, point it to `/auth/callback` with `token_hash={{ .TokenHash }}` and `type=email` or `type=signup`; the route also supports the PKCE `code` callback generated by Supabase. After confirmation, new users should land on `/onboarding` when Supabase returns a session, or on `/login` with a clear success message when they must sign in again.

## Compliance Boundary

JETS v0.4 through v4.0 use local mock adapters, deterministic local rules, component-aware mock inventory, curated demo platform knowledge, deterministic solution intelligence, deterministic optimization, branch-safe project variants, demo marketplace normalization, demo evidence records, deterministic importer fixtures, validation scenarios, manual acquisition capture, and Supabase-backed user persistence/review infrastructure only. Future live ingestion must respect robots.txt, marketplace terms, approved APIs or vendor feeds, conservative rate limits, sourcing, moderation, correction workflows, and removal requests. Future AI, OCR, scraper, CSV, API, browser-extension, and user-submitted data should feed Listing Intelligence and Evidence first, not Knowledge or Recommendations directly. See `docs/ingestion.md`, `docs/marketplace-intelligence.md`, `docs/evidence-engine.md`, `docs/listing-intelligence.md`, `docs/importer-fixtures.md`, `docs/validation-framework.md`, `docs/acquisition-workflow.md`, `docs/platform-knowledge-engine.md`, and `docs/solution-intelligence-engine.md` for the current ingestion and knowledge notes.
