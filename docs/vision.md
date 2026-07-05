# JETS Vision

JETS means Just Enough Tech Solutions.

The product is a Hardware Solution Builder for used PCs, laptops, workstations, servers, components, and adapter-based solution paths. It is not an e-commerce store. It should help people solve a hardware problem by weighing price, performance, reliability, compatibility, upgrade path, seller risk, repairability, difficulty, owned hardware, and practical constraints.

## Product Shape

JETS has two primary workflows.

Build My Own is a slot-based workspace. Users create a project, fill hardware slots, and continuously validate completion, compatibility, power, physical fit, thermals, platform health, display needs, and upgrade path.

Let JETS Recommend is a solution synthesis workflow. Users provide budget, country, purpose, preferences, and already-owned hardware. JETS searches possible solution strategies and explains complete recommendations, not just listings.

Inventory is supporting infrastructure. Compatibility, decision scoring, platform knowledge, snapshots, audit, and sources are reusable services used by both workflows.

Inventory must not look like a flat marketplace where GPUs, laptops, sleeper bases, adapters, and full systems compete as equivalent products. It should stay category grouped and slot aware. `/inventory` is the user-facing surface; `/search` remains only as a backward-compatible alias.

JETS currently uses mock/demo inventory. Live ingestion and scraping are planned but not active.

Optimization is the differentiator. The long-term workflow should become Build -> Analyze -> Optimize -> Branch -> Compare, where JETS searches solution paths people would not normally consider while still explaining every tradeoff.

Platform knowledge is the moat. JETS should know the quirks, hidden upgrade paths, adapter tricks, PCIe tradeoffs, and community discoveries that make one used platform much more useful than another similarly priced machine.

Solution intelligence is the product becoming active. JETS should combine CPU, GPU, RAM, PSU, platform, cooling, budget, and use-case context into a complete-system explanation so users do not do that reasoning manually.

Marketplace intelligence is the Phase 3 feeder layer. Marketplace listings are not the product; they are raw input that must become normalized hardware with confidence, platform detection, health, opportunities, and future solution paths before Builder, Knowledge, Intelligence, Optimization, or Recommendation layers use it.

Evidence is the trust layer. Every important conclusion should be able to answer why JETS believes it, where the claim came from, how it was extracted, whether it has been verified, and whether conflicting evidence exists.

The near-term user journey should feel continuous:

Home -> Goal -> Create Project -> Builder -> Slot Inventory -> Validation -> Optimization -> Branch -> Compare -> Finished Solution.

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

- Current.
- Add a reusable Evidence model for source type, confidence, extraction method, supporting text, date added, version, and verification status.
- Support source categories including official documentation, manufacturer specs, service manuals, community discoveries, forums, videos, benchmarks, moderator verification, user submissions, manual research, future AI extraction, future OCR, and future scraper output.
- Add verification states for unverified, pending review, verified, deprecated, disputed, superseded, and archived.
- Attach provenance and Evidence Panels to Platform Knowledge, adapter intelligence, Marketplace Intelligence parser output, and Solution Intelligence reasoning.
- Preserve conflicting evidence instead of overwriting it.
- Add community discovery and knowledge timeline architecture without implementing moderation yet.
- Add Knowledge Quality as a score separate from hardware quality and recommendation score.
- Do not implement live scraping, marketplace APIs, OCR, image recognition, AI extraction, checkout, moderation queues, or persisted evidence tables.

### Version 3.2 - Persisted Evidence Review and Moderation Foundation

- Recommended next.
- Persist evidence records, conflicts, community discoveries, and knowledge timeline events.
- Add moderation and reviewer states before allowing user-submitted or extracted claims to influence recommendations.
- Add evidence audit views for platforms, parsed fields, and project recommendations.
- Add parsed-field evidence links from normalized marketplace listings.
- Add adapter fixture tests so each future source can be validated before it is connected.
- Add source attribution and removal/takedown workflow before any live ingestion is considered.
- Keep live scraping, AI extraction, OCR, image recognition, and marketplace APIs deferred until evidence review is stable.

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
- Normalized listing moderation workflow
- Parsed-field evidence links
- User correction workflow for marketplace facts
- Source-specific compliance review templates
- Evidence persistence tables
- Conflict review queue
- Moderator verification workflow
- Knowledge Quality history

## Product Principles

- Maintainability beats cleverness.
- Every milestone should leave the codebase easier to extend.
- Recommendations should explain their reasoning.
- Marketplace data should be handled carefully and transparently.
- Evidence should feed knowledge; future AI, OCR, scraping, and community input should never write trusted knowledge directly.
- Users should stay in control of decisions, saved data, and preferences.
- Scraping, AI, and authentication should enter only when the surrounding product is ready for them.
