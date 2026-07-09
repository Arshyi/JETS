# JETS Vision

JETS means Just Enough Tech Solutions.

The product is a Hardware Solution Builder and Acquisition Advisor for used PCs, laptops, workstations, servers, components, and adapter-based solution paths. It is not an e-commerce store. It should help people solve a hardware problem by weighing price, performance, reliability, compatibility, upgrade path, seller risk, repairability, difficulty, owned hardware, and practical constraints.

## Product Shape

JETS has two primary workflows.

Build My Own is a slot-based workspace. Users create a project, fill hardware slots, and continuously validate completion, compatibility, power, physical fit, thermals, platform health, display needs, and upgrade path.

Let JETS Recommend is a solution synthesis workflow. Users provide budget, country, purpose, preferences, and already-owned hardware. JETS searches possible solution strategies and explains complete recommendations, not just listings.

Inventory is supporting infrastructure. Compatibility, decision scoring, platform knowledge, snapshots, audit, and sources are reusable services used by both workflows.

Inventory must not look like a flat marketplace where GPUs, laptops, sleeper bases, adapters, and full systems compete as equivalent products. It should stay category grouped and slot aware. `/inventory` is the user-facing surface; `/search` remains only as a backward-compatible alias.

JETS currently uses mock/demo inventory. Live ingestion and scraping are planned but not active.

Acquisition is the Phase 4 front door. Users should be able to capture hardware they found in the real world, manually enter listing facts, review what JETS can infer, correct missing fields as evidence, compare purchase candidates, and then create a project only when the hardware is worth pursuing.

Strategy is the decision gate before Builder. It should answer whether the user should buy a used workstation, upgrade an existing machine, build from scratch, repair a candidate, use a laptop plus eGPU path, choose a mini PC, convert a server, use a hybrid path, or wait for better value. Not every acquisition deserves a project.

Optimization is the differentiator. The long-term workflow should become Build -> Analyze -> Optimize -> Branch -> Compare, where JETS searches solution paths people would not normally consider while still explaining every tradeoff.

Platform knowledge is the moat. JETS should know the quirks, hidden upgrade paths, adapter tricks, PCIe tradeoffs, and community discoveries that make one used platform much more useful than another similarly priced machine.

The Platform Encyclopedia is the deep reference layer under Platform Knowledge. Platform Knowledge should summarize a platform; the encyclopedia should store topology, upgrade limits, reliability, workload suitability, structured diagram metadata, and evidence-linked engineering facts.

Hardware playbooks turn that knowledge into builder judgment. Platform Knowledge answers what a machine is; Playbooks answer what an experienced builder should do with it, which mistakes to avoid, which adapters unlock value, and which strategies the platform can support.

Action Plans turn playbooks into workflow. They should translate platform-specific guidance into dependency-aware engineering tasks with evidence, estimated time, estimated cost, validation impact, and progress tracking.

Solution intelligence is the product becoming active. JETS should combine CPU, GPU, RAM, PSU, platform, cooling, budget, and use-case context into a complete-system explanation so users do not do that reasoning manually.

Marketplace intelligence is the Phase 3 feeder layer. Marketplace listings are not the product; they are raw input that must become normalized hardware with confidence, platform detection, health, opportunities, and future solution paths before Builder, Knowledge, Intelligence, Optimization, or Recommendation layers use it.

Evidence is the trust layer. Every important conclusion should be able to answer why JETS believes it, where the claim came from, how it was extracted, whether it has been verified, and whether conflicting evidence exists.

The Hardware Reasoning Graph is the intelligence layer. It should store the relationships between platforms, slots, adapters, components, strategies, playbooks, projects, acquisitions, action plans, and evidence. JETS should increasingly explain multi-hop paths users would not normally find themselves.

Listing Intelligence is the bridge between raw marketplace input and trusted evidence. JETS should understand an individual listing as an engineering object: raw text, parsed fields, human corrections, duplicate risk, health, recommendation readiness, and future ingestion hooks.

Validation is the quality layer. Before real marketplace data arrives, every deterministic engine should be regression-testable against golden hardware scenarios so JETS does not become overconfident or drift away from known hardware truths.

The near-term acquisition journey should feel continuous:

Home -> Acquire Hardware -> Paste Listing -> Preview -> Normalize -> Evidence -> Platform Detection -> Listing Intelligence -> Playbook -> Recommendation Preview -> Save Acquisition -> Review History -> Strategy -> Use in Project -> Builder Validation.

The project journey remains:

Goal -> Create Project -> Builder -> Slot Inventory -> Validation -> Playbook -> Action Plan -> Optimization -> Branch -> Compare -> Finished Solution.

Inventory should usually appear from inside a builder slot, not as a place users manually browse first.

## Current Rule

Do not build ideas the moment they appear.

Capture them here, then choose the right milestone later. This keeps the product ambitious without derailing the current version.

## Milestones

### Version 0.1 - Foundation

- Complete.
- Built the application shell.
- Added responsive static pages.
- Added light and dark mode.
- Added placeholder product surfaces.
- Avoided scraping, authentication, databases, and AI.

### Version 0.2 - Search UI With Dummy Data

- Complete.
- Built search and filter UI.
- Added local typed mock listing data.
- Added ranking cards with value, performance, reliability, aesthetic, upgrade, sleeper, and risk signals.
- Added compare selection for up to three listings through URL query params.
- Kept all data static.
- Did not scrape marketplaces.

### Inventory Reframe

- Current product-consolidation patch.
- Rename the user-facing Search surface to Inventory.
- Group inventory by complete systems, base systems, GPUs, CPUs, RAM, storage, PSUs, cooling, adapters, and other components.
- Make slot-opened inventory show only relevant categories.
- Add project-slot actions when inventory has project and slot context.
- Preserve `/search` only as a compatibility alias.
- Do not add AI, live scraping, or checkout.

### Workflow Consolidation

- Current product-flow patch.
- Redesign Home around "What are you trying to build today?"
- Add the goal-first project wizard.
- Make Builder the home of every project.
- Add project dashboard summaries with score, completion, missing slots, validation, optimization, branches, last activity, and next action.
- Add workflow progress: Project, Components, Validate, Optimize, Compare, Finish.
- Keep Inventory as contextual slot support.

### Version 0.3 - Supabase Accounts

- Complete.
- Added Supabase authentication.
- Added saved builds.
- Added favorites.
- Added build history with a clear action.
- Added user settings persistence.
- Added setup states when environment variables are missing.
- Do not scrape marketplaces.

### Version 0.4 - Ingestion Foundation

- Complete.
- Added source adapter architecture.
- Added dry-run mock adapters for Dubizzle, Amazon.ae, Computer Plaza, and Manual Upload.
- Added normalized listing schema.
- Added ingestion run logs.
- Added source health/status page.
- Added admin-only ingestion dry-run page.
- Added duplicate detection and listing freshness flags.
- Added compliance notes and rate-limit documentation.
- Do not implement live scraping.

### Version 0.5 - Decision Engine

- Complete.
- Added deterministic scoring and ranking logic.
- Added formula comments and documentation.
- Added why-this-ranks explanations.
- Added score breakdown UI.
- Added use-case presets for gaming, CAD, engineering, AI, general, and homelab.
- Added validation fixtures.
- Do not implement AI.

### Version 0.6 - Compatibility Engine

- Complete.
- Added CPU and motherboard compatibility checks.
- Added GPU PCIe, length, height, and thickness checks.
- Added PSU wattage and connector checks.
- Added RAM type, capacity, and slot checks.
- Added storage interface, M.2, and SATA checks.
- Added cooler clearance, airflow, and thermal risk checks.
- Added BIOS generation risk and platform age scoring.
- Added compatibility report page, badges, platform health, and upgrade suggestions.
- Do not implement AI, live scraping, or checkout.

### Version 0.7 - Build Generator

- Complete.
- Created the first complete end-user workflow.
- Let users choose budget, country, currency, primary use case, preferences, and already-owned hardware.
- Generated Best Overall, Best Value, Highest Performance, Best Engineering, Best AI, Best Gaming, Best Workstation, and Sleeper Build recommendations.
- Explained why each build ranks.
- Showed closest alternatives.
- Reused the decision engine and compatibility engine.
- Do not implement AI, live scraping, or checkout.

### Version 0.8 - Decision Snapshots

- Complete.
- Persist Build Generator decision snapshots.
- Preserve budget, country, currency, preferences, owned hardware, generator outputs, decision scores, compatibility scores, platform health, explanations, alternatives, timestamps, and app version.
- Let users view, compare, rename, favorite, delete, restore, and mark snapshots.
- Add score-change comparison between saved generator runs.
- Continue using Supabase-backed persistence instead of local-only storage.
- Do not implement AI, live scraping, or checkout.

### Version 0.9 - Decision Audit Foundation

- Complete.
- Introduce a shared activity model for saved builds, favorites, history, snapshots, status changes, notes, and future explanations.
- Add snapshot and saved-build notes.
- Add activity timeline page.
- Show recent activity on account.
- Show per-snapshot activity on snapshot and compare views.
- Keep this foundation deterministic before adding AI assistance.

### Version 1.0 - Private Beta Hardening

- Complete.
- Rehearse Supabase migrations and seed data.
- Harden auth, persistence, and error handling.
- Review responsive behavior and accessibility.
- Add product onboarding for the existing deterministic workflow.
- Do not add AI or live scraping until the beta workflow is stable.

### Version 2.0 - Solution Builder Redesign

- Complete.
- Recenter JETS around solving a hardware problem rather than browsing listings.
- Add Solution Builder overview.
- Add Build My Own slot workspace foundation.
- Add Let JETS Recommend as the primary recommendation mode.
- Reposition Inventory as shared project support.
- Keep decision, compatibility, snapshots, audit, and sources reusable.
- Do not add AI, live scraping, checkout, or project persistence yet.

### Version 2.1 - Project Persistence and Slot Inventory

- Complete.
- Add Supabase-backed build projects and project slots.
- Add create, rename, archive, restore, and delete project actions.
- Add component-aware mock inventory for CPUs, motherboards, PSUs, coolers, RAM, storage, adapters, and operating systems.
- Let users add inventory items into slots.
- Compare saved user projects against generated JETS solutions.
- Continue to defer AI and live scraping until the v2 workflow is stable.

### Version 2.2 - Optimization Engine Foundation

- Complete.
- Treat comparison as a view over optimization, not as the core capability.
- Add deterministic candidate generation, compatibility filtering, decision scoring, optimization passes, ranking, and explanations.
- Let users lock components so JETS only changes unlocked slots.
- Add optimization goals for cost, performance, reliability, power draw, upgradeability, engineering-student use, and balanced builds.
- Add optimization depth controls: standard, enthusiast, and experimental.
- Persist optimization runs and suggestions.
- Continue to defer AI and live scraping until deterministic project workflows are stable.

### Version 2.3 - Project Branching and Optimization Workspace

- Complete.
- Treat branches like Git for hardware ideas.
- Let users create manual project branches.
- Let optimizer suggestions create child branches without mutating the original.
- Preserve parent/root lineage, branch names, branch source, selected optimization run, and selected suggestions.
- Show branch workspace on project detail.
- Keep merge/apply behavior deferred until branches are easy to inspect.

### Post-Auth Beta Hardening

- Current beta-readiness patch.
- Keep the first authenticated experience centered on projects, not listing browsing.
- Send signup and email confirmation into onboarding where users create the first hardware project.
- Make `/account` a control panel for continuing projects, checking persistence, smoke testing, and signing out.
- Add signed-in smoke testing so beta testers can verify auth, project persistence, snapshots, activity, and sign out/sign in recovery.
- Keep Inventory and saved research as supporting infrastructure.
- Do not add AI, live scraping, or checkout during auth hardening.

### Version 2.4 - Project-First Workflow Consolidation

- Complete.
- Make Home ask what the user is trying to build.
- Add the goal-first project wizard.
- Make Builder the home of every project.
- Show project dashboard summaries and next actions.
- Keep Inventory as a contextual picker instead of the main marketplace.

### Version 2.5 - Platform Knowledge Engine

- Complete.
- Add structured platform profiles for workstations, office bases, and enthusiast platforms.
- Separate specifications, platform knowledge, community discoveries, upgrade opportunities, adapter intelligence, and PCIe reasoning.
- Add Platform Potential as a score separate from the decision score.
- Surface platform knowledge inside projects and inventory.
- Keep all knowledge curated/demo only until sourcing, moderation, and correction workflows exist.

### Version 2.6 - Solution Intelligence Engine

- Complete.
- Add a deterministic reasoning layer above compatibility, decision scoring, and platform knowledge.
- Explain why builds work and why parts are rejected.
- Add CPU, GPU, RAM, PCIe, VRAM, storage, cooling, and PSU bottleneck analysis.
- Add upgrade impact simulation, use-case analysis, cost efficiency, hidden opportunities, optimization advisor modes, confidence signals, decision history, and branch intelligence scaffolding.
- Do not add AI, live scraping, marketplace APIs, or checkout.

### Version 3.0 - Marketplace Intelligence Layer

- Complete.
- Create adapter definitions for future sources including Dubizzle, Facebook Marketplace, eBay, Kijiji, Craigslist, Yahoo Auctions, Mercari, Amazon Renewed, Newegg, local stores, CSV imports, manual entry, and future APIs.
- Normalize raw marketplace listings into marketplace metadata, seller metadata, hardware metadata, price, location, condition, description, images, platform detection, detected components, confidence, listing health, opportunities, and possible futures.
- Add deterministic platform detection and parser confidence while leaving unknown fields unknown.
- Connect normalized listings into Platform Knowledge without coupling marketplace-specific fields into Builder, Solution Intelligence, or Optimization.
- Show a demo pipeline from Raw Listing to Normalized Listing to Detected Platform to Knowledge to Recommendation Path.
- Do not implement live scraping, website automation, marketplace APIs, OCR, image recognition, AI extraction, checkout, or listing persistence.

### Version 3.1 - Evidence Engine and Knowledge Provenance

- Complete.
- Add a reusable Evidence model for source type, confidence, extraction method, supporting text, date added, version, and verification status.
- Support source categories including official documentation, manufacturer specs, service manuals, community discoveries, forums, videos, benchmarks, moderator verification, user submissions, manual research, future AI extraction, future OCR, and future scraper output.
- Add verification states for unverified, pending review, verified, deprecated, disputed, superseded, and archived.
- Attach provenance and Evidence Panels to Platform Knowledge, adapter intelligence, Marketplace Intelligence parser output, and Solution Intelligence reasoning.
- Preserve conflicting evidence instead of overwriting it.
- Add community discovery and knowledge timeline architecture without implementing moderation yet.
- Add Knowledge Quality as a score separate from hardware quality and recommendation score.
- Do not implement live scraping, marketplace APIs, OCR, image recognition, AI extraction, checkout, moderation queues, or persisted evidence tables.

### Version 3.2 - Persisted Evidence Review

- Complete.
- Persist evidence records, conflicts, community discoveries, and knowledge timeline events.
- Add SQL tables for evidence records, evidence sources, conflicts, timeline events, review notes, and parsed-field evidence links.
- Add RLS policies so public verified evidence can be read, signed-in users can submit pending evidence, and moderators can update verification state.
- Add Evidence Review UI for dashboard, pending queue, detail view, conflict view, and platform evidence history.
- Add audit trail fields for who submitted, who reviewed, what changed, when, and why.
- Keep live scraping, AI extraction, OCR, image recognition, checkout, and marketplace APIs deferred.

### Version 3.3 - Listing Intelligence and Human Review

- Complete.
- Persist normalized marketplace listing candidates, parsed fields, human corrections, duplicate candidates, and review events.
- Treat every listing as an engineering object before it can influence recommendation previews.
- Add parsed-field review actions: accept, reject, correct, and mark unknown.
- Make corrections create evidence records and parsed-field evidence links.
- Add Listing Health, duplicate detection, and Recommendation Readiness.
- Add review routes for listing dashboard, pending fields, duplicate candidates, and one-listing review workspace.
- Keep live scraping, browser automation, AI extraction, OCR, marketplace APIs, and checkout deferred.

### Version 3.4 - Importer Fixture and Listing Seeding Layer

- Complete.
- Add deterministic importer fixture system with fixture source type, validation, parsing, import result, and error reporting.
- Add admin-only dry-run and seed-import action for representative demo/manual listings.
- Persist importer fixture run summaries and item-level results.
- Generate or link evidence records and parsed-field evidence links for every parsed field.
- Add duplicate review actions: mark duplicate, mark distinct, and merge-candidate-later placeholder.
- Validate missing title, missing price, unsupported marketplace, invalid currency, low-confidence platform detection, and duplicate external ID.
- Keep live scraping, browser automation, marketplace APIs, AI extraction, OCR, and checkout deferred.

### Version 3.5 - Hardware Knowledge Validation Framework

- Complete.
- Add golden hardware scenario packs for ThinkStation P510, OptiPlex 7060, Precision 5820, HP Z440, gaming build, AI workstation, engineering workstation, budget office PC, broken listing, unknown listing, low-confidence listing, and duplicate listing.
- Run Marketplace Intelligence, Listing Intelligence, Evidence linkage, Platform Knowledge, Solution Intelligence, Optimization, Compatibility, and Builder validation through one repeatable suite.
- Generate Markdown and HTML validation reports.
- Track rule coverage and confidence regression.
- Warn when platform knowledge is incomplete instead of hiding evidence gaps.
- Keep live scraping, browser automation, marketplace APIs, AI extraction, OCR, and checkout deferred.

### Version 4.0 - Manual Acquisition Workflow

- Complete.
- Add `/acquire` as the first-class manual listing capture workspace.
- Let users enter marketplace, URL, title, description, price, currency, location, condition, seller notes, placeholder image count, and personal notes.
- Show raw listing, parsed fields, detected platform, confidence, evidence, missing information, Recommendation Readiness, and recommendation preview before saving.
- Let users correct CPU, GPU, RAM, platform, price, and storage; corrections become user-submitted evidence.
- Add decisions: Analyze only, Save Listing, Create Build Project, Ignore Listing, Archive, Purchased, and Rejected.
- Compare saved acquisitions as purchase candidates before they become build projects.
- Offer project handoff paths for Engineering, Gaming, AI Workstation, Home Server, and existing projects.
- Store acquisitions locally for v4.0 while preserving a clean path toward Supabase persistence.
- Keep live scraping, browser automation, marketplace APIs, AI extraction, OCR, and checkout deferred.

### Version 4.1 - Persisted Acquisition Records

- Complete.
- Persist acquisition records, corrections, personal notes, decisions, comparison state, and project links in Supabase.
- Add acquisition history at `/acquire/history`.
- Add cross-device access for saved purchase candidates.
- Keep local storage as a graceful fallback when Supabase is missing or the visitor is signed out.
- Keep browser extension and live ingestion deferred until persisted manual acquisition is stable.

### Version 4.2 - Acquisition to Project Handoff

- Complete.
- Classify saved acquisitions as base systems, full systems, components, adapter paths, parts donors, or review-later records.
- Map parsed acquisition facts into candidate project slots with confidence and source evidence.
- Let the user accept, reject, correct, or leave proposed slots empty before applying anything.
- Support new project creation, existing project insertion, acquisition branches, and evidence-only linking.
- Show linked acquisitions and acquisition-derived slots on project detail pages.
- Keep live ingestion, AI extraction, OCR, checkout, image uploads, and unreviewed slot population deferred.

### Version 4.3 - Strategy Engine

- Complete.
- Add deterministic strategy reasoning before project creation.
- Compare upgrade existing machine, buy used workstation, build from scratch, laptop plus eGPU, mini PC, server conversion, repair existing hardware, wait for better value, and hybrid strategy paths.
- Show tradeoff matrices for cost, performance, upgradeability, reliability, power draw, noise, difficulty, repairability, platform potential, future expansion, and confidence.
- Let strategies create projects while preserving `strategy_id`, `strategy_title`, and `strategy_snapshot`.
- Let saved acquisitions influence strategy without forcing every acquisition into Builder.
- Add validation fixtures for budget-too-small, overpriced-workstation, amazing-deal, bad-platform, excellent-platform, and repair-candidate cases.
- Keep live scraping, AI extraction, OCR, checkout, image uploads, and automated acquisition-to-project creation deferred.

### Phase 5.0 - Hardware Playbook Engine

- Complete.
- Add curated Hardware Playbooks for ThinkStation, Precision, OptiPlex, HP Z-series, Mac Pro, mini PC, and laptop/eGPU paths.
- Capture Overview, recommended strategies, upgrade paths, known bottlenecks, common mistakes, adapters, PCIe, power, cooling, firmware, storage, memory, repair, lifespan, and ideal workloads.
- Link every playbook recommendation to evidence, verification state, confidence, and Knowledge Quality.
- Surface relevant playbooks on Project detail pages with completed and remaining recommendations.
- Surface relevant playbooks on Acquisition detail pages before project handoff.
- Let Strategy reference playbooks instead of duplicating platform-specific advice.
- Validate that every supported platform profile has at least one playbook.
- Keep live scraping, AI extraction, OCR, checkout, image uploads, and automatic project mutation deferred.

### Phase 5.1 - Engineering Action Plans

- Complete.
- Generate deterministic Action Plans from platform, playbook, strategy, current project, and Builder validation state.
- Add engineering task types for adapter install, PSU replacement, RAM upgrade, GPU install, BIOS/firmware, storage, cooling, cable management, thermal inspection, power verification, and stress testing.
- Track task metadata for title, description, time, cost, difficulty, dependencies, evidence, verification, priority, and risk.
- Let project users accept, skip, reject, complete, and undo tasks locally.
- Enforce dependency chains so a task cannot be treated as complete before prerequisites are complete.
- Track overall completion, remaining cost/time, platform improvement, Knowledge coverage, project maturity, and validation impact.
- Keep Supabase task persistence, AI, live scraping, OCR, checkout, and automatic project mutation deferred.

### Phase 5.2 - Persisted Engineering Action Plans

- Complete.
- Persist Action Plan tasks, progress, comments, dependencies, and audit events in Supabase.
- Keep task records scoped to the owning project user through RLS.
- Add server actions for accepting, completing, reopening, skipping, rejecting, note updates, and optional task ordering.
- Persist completion, remaining cost, remaining time, project maturity, Knowledge coverage, and validation progress.
- Let completed persisted tasks resolve linked Builder validation issues in the displayed project validation layer.
- Keep AI, live scraping, OCR, checkout, admin task moderation, image uploads, and automatic hardware mutation deferred.

### Phase 5.3 - Platform Encyclopedia

- Complete.
- Add a reusable Platform Encyclopedia model below Playbooks and above Platform Knowledge summaries.
- Store platform revisions, chipset, CPU support, memory topology, PCIe topology, storage topology, power, cooling, firmware, limitations, hidden capabilities, repair notes, common failures, lifecycle, community discoveries, upgrade paths, reliability, and workload profiles.
- Support metadata-only engineering diagrams for PCIe lanes, memory channels, drive bays, power connectors, expansion slots, and thermal zones.
- Make Playbooks, Strategy, and Action Plans reference encyclopedia sections instead of duplicating engineering knowledge.
- Extend hardware validation so supported platforms warn when topology, upgrade, reliability, or workload coverage is missing.
- Keep AI, live scraping, OCR, checkout, automatic knowledge ingestion, and automatic hardware mutation deferred.

### Phase 6.0 - Hardware Reasoning Graph

- Stop adding workflows and model the relationships JETS already implies.
- Add a reusable graph model for platforms, CPUs, GPUs, RAM, storage, power supplies, adapters, PCIe cards, cooling, cases, strategies, playbooks, projects, acquisitions, action plans, evidence, opportunities, constraints, workloads, and components.
- Support deterministic edges such as supports, blocks, improves, requires, replaces, bottlenecks, upgrades, same_socket, same_generation, better_value, repair_path, and adapter_path.
- Add multi-hop traversal so recommendations can expose reasoning paths instead of only scores.
- Add opportunity and constraint graph discovery for adapter paths, repair paths, wait decisions, GPU limits, PSU constraints, and platform potential.
- Make Platform Knowledge, Playbooks, Strategy, Action Plans, Optimization, and Validation query graph context.
- Add graph validation for orphan nodes, circular requires edges, duplicate edges, broken references, missing node types, missing edge types, and fixture paths.
- Keep AI, live scraping, OCR, checkout, graph persistence, graph editing, and automatic marketplace graph writes deferred.

### Phase 6.1 - Reasoning Path Explanations

- Surface Hardware Reasoning Graph paths in the places where users make decisions.
- Add reusable "Why JETS thinks this" panels for Strategy, Optimization, Acquisition, Builder warnings, Action Plans, and Platform Knowledge.
- Show node labels, relationship labels, confidence, evidence links, and plain-English reasoning.
- Extend graph validation to reject broken display paths, circular display paths, missing labels, and broken node-to-edge sequences.
- Keep AI, scraping, OCR, marketplace APIs, checkout, browser automation, graph persistence, and graph editing deferred.

### Phase 6.2 - Knowledge Expansion Framework

- Current.
- Make JETS deeper instead of wider.
- Add a reusable Knowledge Expansion model for hundreds of engineering facts without changing UI architecture.
- Expand supported workstation platforms with structured facts for firmware, BIOS revisions, power topology, thermals, memory training, PCIe bandwidth, lane sharing, boot behavior, noise, known bugs, replacement parts, known repairs, community discoveries, and electrical limits.
- Add component-family knowledge for CPUs, GPUs, RAM, PSUs, storage, PCIe adapters, NICs, HBAs, and cooling.
- Increase graph relationship density with works_better_with, usually_requires, commonly_upgraded_with, shares_failure_mode, shares_repair_path, thermal_conflict, and power_conflict.
- Track knowledge-health metrics: supported workstation platforms, verified engineering facts, evidence-backed relationships, validated reasoning paths, upgrade paths, playbooks, graph nodes, graph edges, Knowledge Quality, and validation pass rate.
- Keep AI, scraping, OCR, marketplace APIs, checkout, browser automation, graph persistence, and graph editing deferred.

## Idea Parking Lot

Ideas below are valuable, but they are not current milestone scope.

- eGPU solutions
- Sleeper builds
- Shipping estimator
- Technician recommendations
- Negotiation prediction
- Seller reliability signals
- Local pickup radius scoring
- Power cost estimates
- Upgrade path forecasting
- Homelab bundle recommendations
- Small business workstation recommendations
- Creator laptop value analysis
- Parts compatibility checker
- GPU fit and PSU headroom checks
- Repairability and replacement part availability
- Warranty and return policy comparison
- Market price trend tracking
- Listing scam and risk heuristics
- Optimization branches and project version history
- Branch diff viewer
- Merge preview for hardware slot changes
- Platform knowledge sourcing and moderation
- Community-discovered upgrade evidence tracking
- Persisted solution intelligence reports
- Branch intelligence score deltas
- Marketplace adapter fixture tests
- Hardware validation scenario packs
- Golden output regression reports
- Manual listing capture
- Browser extension for user-initiated capture
- Acquisition records and purchase comparison
- Acquisition-to-project handoff history
- Normalized listing moderation workflow
- Parsed-field evidence links
- User correction workflow for marketplace facts
- Source-specific compliance review templates
- Evidence persistence tables
- Conflict review queue
- Moderator verification workflow
- Knowledge Quality history
- Strategy timing and walk-away reasoning
- Hardware playbook authoring workflow
- Playbook moderation and evidence promotion
- User-submitted playbook notes
- Playbook-driven acquisition watchlists
- Technician handoff reports
- Before/after validation exports
- Action Plan task template authoring
- Platform encyclopedia authoring workflow
- Platform topology diagrams from reviewed manuals
- Encyclopedia fact moderation and promotion
- Graph relationship authoring and moderation
- Graph-backed opportunity discovery for acquisitions

## Product Principles

- Maintainability beats cleverness.
- Every milestone should leave the codebase easier to extend.
- Recommendations should explain their reasoning.
- Marketplace data should be handled carefully and transparently.
- Evidence should feed knowledge; future AI, OCR, scraping, and community input should never write trusted knowledge directly.
- Users should stay in control of decisions, saved data, and preferences.
- Scraping, AI, and authentication should enter only when the surrounding product is ready for them.
