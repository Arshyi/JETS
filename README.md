# JETS

JETS (Just Enough Tech Solutions) is a Hardware Solution Builder for used PCs, laptops, workstations, servers, components, and adapter-based solution paths.

JETS is now acquisition-centered, strategy-aware, and project-backed. The practical experience is: capture a hardware listing manually, normalize it, review evidence and missing information, decide whether it is worth pursuing, compare hardware strategies, then create or reuse a project for build-level validation and optimization. Phase 4 uses the existing engine instead of adding another subsystem.

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
- **4.0:** Manual Acquisition Workflow. Complete.
- **4.1:** Persisted acquisition records and project links. Complete.
- **4.2:** Acquisition to Project Handoff. Complete.
- **4.3:** Strategy Engine. Complete.
- **5.0:** Hardware Playbook Engine. Complete.
- **5.1:** Engineering Action Plans. Complete.
- **5.2:** Persisted Engineering Action Plans. Complete.
- **5.3:** Platform Encyclopedia. Complete.
- **6.0:** Hardware Reasoning Graph. Current.

## Primary Workflow

1. A user finds hardware and captures the listing manually at `/acquire`.
2. JETS normalizes the raw listing into parsed fields, platform detection, confidence, evidence, missing information, and Recommendation Readiness.
3. The user can correct CPU, GPU, RAM, platform, price, and storage before saving; corrections are treated as evidence.
4. The user decides whether to analyze only, save, archive, reject, mark purchased, compare acquisitions, analyze strategy, or use the acquisition in a project.
5. Strategy compares build, buy, upgrade, repair, laptop/eGPU, mini PC, server conversion, hybrid, and wait-for-better-value paths before a project is created.
6. Promising acquisitions are classified, mapped to candidate slots, reviewed by the user, then applied to a new project, existing project, branch, or evidence-only link.
7. Builder, Inventory, Validation, Platform Knowledge, Solution Intelligence, Optimization, Branching, and Compare handle the build-level decision.

Marketplace Intelligence sits below the workflow as input plumbing:

```text
Raw Marketplace Data -> Listing Intelligence -> Evidence -> Hardware Reasoning Graph -> Platform Knowledge -> Platform Encyclopedia -> Playbooks -> Strategy -> Builder -> Action Plans -> Solution Intelligence -> Optimization -> Recommendation
```

Ingestion and parsing do not make recommendations. Optimization and reasoning do not know how a listing was captured. Evidence records explain why JETS trusts a parsed field, knowledge item, or recommendation.
The Hardware Reasoning Graph stores the relationships between these facts so
JETS can explain multi-hop paths instead of only showing lists of facts.

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

## Phase 4.1 Notes

- Acquisition persistence migration lives in `supabase/migrations/202607060004_v4_1_acquisition_persistence.sql`.
- `/acquire` now prefers Supabase-backed persistence for signed-in users and keeps browser local storage as a graceful fallback when Supabase is missing or the visitor is signed out.
- `/acquire/history` lists saved acquisitions with status, marketplace, and source filters.
- `/acquire/history/[acquisitionId]` shows raw listing payload, normalized listing payload, evidence, corrections, notes, recommendation preview, decision history, compare-set membership, and project handoff links.
- Server actions live in `lib/supabase/acquisition-actions.ts`; read models live in `lib/supabase/acquisition-queries.ts`.
- Persistence mapping lives in `lib/acquisition/persistence.ts` so capture UI, history, and detail pages share the same row contract.
- Saved acquisition statuses are Reviewing, Ready, Archived, Purchased, and Rejected.
- Phase 4.1 still does not implement AI, live scraping, browser automation, marketplace APIs, OCR, checkout, image uploads, or automatic project slot population.

## Phase 4.2 Notes

- Handoff schema migration lives in `supabase/migrations/202607070001_v4_2_acquisition_project_handoff.sql`.
- Handoff classification and slot mapping logic lives in `lib/acquisition/handoff.ts`.
- Handoff server actions live in `lib/supabase/acquisition-handoff-actions.ts`.
- Acquisition detail pages now show a Use in Project workflow with classification, proposed slot mappings, confidence, per-slot accept/reject, correction labels, project selector, create-project fields, and branch creation.
- Handoff supports creating a new project, adding to an existing project, creating a project branch, or linking the acquisition as evidence only.
- Accepted slots are written to `build_project_slots` as acquisition-derived component snapshots. The original acquisition record is preserved.
- Project audit events record acquisition linked, slot proposed, slot accepted, slot rejected, and handoff completed.
- Project detail pages show linked acquisitions, source listing evidence, and acquisition-derived slots.
- Phase 4.2 still does not implement AI, live scraping, browser automation, marketplace APIs, OCR, checkout, image uploads, or automatic slot population without user review.

## Phase 4.3 Notes

- Strategy schema migration lives in `supabase/migrations/202607070002_v4_3_strategy_engine.sql`.
- Strategy domain types live in `types/strategy.ts`.
- The deterministic strategy engine lives in `lib/strategy-engine/engine.ts`.
- Saved acquisition inputs are mapped through `lib/strategy-engine/acquisitions.ts`.
- Strategy project creation lives in `lib/supabase/strategy-actions.ts`.
- The Strategy workspace is available at `/strategy`.
- Strategy compares upgrade, used workstation, build-from-scratch, laptop/eGPU, mini PC, server conversion, repair, wait, and hybrid paths before creating a project.
- Strategy-created projects preserve `strategy_id`, `strategy_title`, and `strategy_snapshot` on `build_projects`.
- Project dashboard and project detail pages show the strategy source.
- Hardware validation now includes deterministic strategy fixtures for budget-too-small, overpriced workstation, amazing deal, bad platform, excellent platform, and repair-candidate scenarios.
- Documentation lives in `docs/strategy-engine.md`.
- Phase 4.3 still does not implement AI, live scraping, browser automation, marketplace APIs, OCR, checkout, image uploads, or automatic project creation from acquisitions.

## Phase 5.0 Notes

- Hardware Playbook types live in `types/playbook.ts`.
- Curated demo playbooks live in `data/playbooks.ts`.
- The deterministic playbook lookup, project progress, strategy signals, and validation helpers live in `lib/playbook-engine/engine.ts`.
- Reusable Playbook UI lives in `components/playbooks/playbook-panel.tsx`.
- Project detail pages show a Project Playbook with completed recommendations, remaining recommendations, warnings, evidence links, and Knowledge Quality.
- Acquisition detail pages show an Acquisition Playbook before project handoff so buyers understand platform-specific strategies and mistakes before committing.
- Strategy can cite playbooks for recognized acquisitions instead of duplicating platform guidance.
- Hardware validation now checks every supported platform has a playbook and that playbook recommendations resolve to evidence.
- Documentation lives in `docs/playbook-engine.md`.
- Phase 5.0 still does not implement AI, live scraping, browser automation, marketplace APIs, OCR, checkout, image uploads, or automatic project mutation.

## Phase 5.1 Notes

- Engineering Action Plan types live in `types/action-plan.ts`.
- The deterministic Action Plan engine lives in `lib/action-plan-engine/engine.ts`.
- Project task workflow UI lives in `components/action-plans/action-plan-panel.tsx`.
- Project detail pages now generate an Action Plan from the current platform, playbooks, strategy source, project state, and Builder validation issues.
- Tasks support install adapter, replace PSU, upgrade RAM, install GPU, flash BIOS, update firmware, replace storage, replace cooling, cable management, thermal inspection, power verification, and stress testing.
- Users can accept, skip, reject, complete, and undo tasks locally per project.
- Action Plans track completion, estimated remaining cost/time, platform improvement, Knowledge coverage, project maturity, dependencies, and validation impact.
- Hardware validation now includes deterministic Action Plan fixtures and coverage.
- Documentation lives in `docs/action-plan-engine.md`.
- Phase 5.1 still does not implement AI, live scraping, browser automation, marketplace APIs, OCR, checkout, image uploads, Supabase task persistence, or automatic project mutation.

## Phase 5.2 Notes

- Action Plan persistence migration lives in `supabase/migrations/202607080001_v5_2_persisted_action_plans.sql`.
- Persisted tables cover action plan tasks, progress snapshots, comments, audit events, and task dependencies.
- Server actions live in `lib/supabase/action-plan-actions.ts` for accept, complete, reopen, skip, reject, notes, optional task ordering, and first-time plan save.
- Project detail pages load persisted Action Plan rows through `lib/supabase/queries.ts`.
- Completed persisted tasks can resolve linked Builder validation issue IDs in the displayed project validation state.
- Supabase RLS keeps action plans scoped to the owning project user. Admin/service-role review remains future-only.
- Phase 5.2 still does not implement AI, live scraping, browser automation, marketplace APIs, OCR, checkout, image uploads, or automatic project slot mutation.

## Phase 5.3 Notes

- Platform Encyclopedia types live in `types/platform-encyclopedia.ts`.
- Curated demo encyclopedia entries live in `data/platform-encyclopedia.ts`.
- Lookup, reference, summary, and coverage helpers live in `lib/platform-encyclopedia.ts`.
- Platform Knowledge remains the summary layer; Platform Encyclopedia is the deeper engineering reference for topology, upgrade paths, reliability, workload fit, and structured diagram metadata.
- Project Platform Knowledge panels now show encyclopedia coverage, topology notes, upgrade context, reliability notes, and workload suitability for recognized platforms.
- Hardware Playbooks, Strategy recommendations, and Action Plan tasks now reference encyclopedia sections instead of duplicating engineering knowledge.
- Hardware validation warns when supported platforms are missing memory topology, power topology, storage guidance, upgrade paths, reliability data, or workload profiles.
- Documentation lives in `docs/platform-encyclopedia.md`.
- Phase 5.3 still does not implement AI, live scraping, browser automation, marketplace APIs, OCR, checkout, image uploads, or automatic knowledge ingestion.

## Phase 6.0 Notes

- Reasoning graph types live in `types/reasoning-graph.ts`.
- Deterministic graph data lives in `data/reasoning-graph.ts`.
- Traversal, opportunity discovery, constraint discovery, explanation paths, and validation live in `lib/reasoning-graph/engine.ts`.
- Graph validation runs with `npm run validate:graph` and writes reports to `docs/generated/reasoning-graph-report.md` and `docs/generated/reasoning-graph-report.html`.
- Platform Knowledge, Playbooks, Strategy, Action Plans, Optimization, and Hardware Validation now query graph path context instead of duplicating relationships.
- Supported node types include platforms, components, adapters, PCIe slots/cards, strategies, playbooks, projects, acquisitions, action plans, evidence, opportunities, constraints, and workloads.
- Supported edge types include supports, blocks, improves, requires, replaces, bottlenecks, upgrades, shares_platform, same_socket, same_chipset, same_generation, higher_power, lower_noise, better_value, repair_path, and adapter_path.
- Documentation lives in `docs/reasoning-graph.md`.
- Phase 6.0 still does not implement AI, live scraping, browser automation, marketplace APIs, OCR, checkout, image uploads, graph persistence, or graph authoring.

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
12. `202607060004_v4_1_acquisition_persistence.sql`
13. `202607070001_v4_2_acquisition_project_handoff.sql`
14. `202607070002_v4_3_strategy_engine.sql`
15. `202607080001_v5_2_persisted_action_plans.sql`

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

## Reasoning Path Explanations

Phase 6.1 makes Hardware Reasoning Graph paths visible inside the decision
experience. Strategy cards, optimization suggestions, acquisition previews,
Builder warnings, Action Plan tasks, and Platform Knowledge panels can now show
expandable "Why JETS thinks this" explanations with node labels, relationship
labels, confidence, evidence links, and plain-English reasoning.

The graph validator now checks display paths for broken references, circular
paths, missing labels, and broken node-to-edge sequences. See
`docs/reasoning-path-explanations.md` and `docs/reasoning-graph.md`.

## Compliance Boundary

JETS v0.4 through Phase 6.1 use local mock adapters, deterministic local rules, component-aware mock inventory, curated demo platform knowledge, curated platform encyclopedia entries, curated graph relationships, graph-backed reasoning path explanations, curated hardware playbooks, deterministic persisted action plans, deterministic solution intelligence, deterministic optimization, deterministic strategy reasoning, branch-safe project variants, demo marketplace normalization, demo evidence records, deterministic importer fixtures, validation scenarios, manual acquisition capture, reviewed acquisition-to-project handoff, and Supabase-backed user persistence/review infrastructure only. Future live ingestion must respect robots.txt, marketplace terms, approved APIs or vendor feeds, conservative rate limits, sourcing, moderation, correction workflows, and removal requests. Future AI, OCR, scraper, CSV, API, browser-extension, and user-submitted data should feed Listing Intelligence and Evidence first, not Knowledge, Encyclopedia, Graph, Playbooks, Action Plans, or Recommendations directly. See `docs/ingestion.md`, `docs/marketplace-intelligence.md`, `docs/evidence-engine.md`, `docs/listing-intelligence.md`, `docs/importer-fixtures.md`, `docs/validation-framework.md`, `docs/acquisition-workflow.md`, `docs/platform-knowledge-engine.md`, `docs/platform-encyclopedia.md`, `docs/reasoning-graph.md`, `docs/reasoning-path-explanations.md`, `docs/playbook-engine.md`, `docs/action-plan-engine.md`, `docs/solution-intelligence-engine.md`, and `docs/strategy-engine.md` for the current ingestion and knowledge notes.
