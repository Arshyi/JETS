# JETS Solution Builder

Version 2.0 was the first architectural redesign of JETS. Version 2.1 added persisted projects and component-aware slot inventory. Version 2.2 added the Optimization Engine Foundation. Version 2.3 added Project Branching & Optimization Workspace. Version 2.4 connected these layers into one continuous workflow. Version 2.5 added the Platform Knowledge Engine. Version 2.6 added the Solution Intelligence Engine. Phase 3 begins Marketplace Intelligence, the feeder architecture that will eventually supply normalized real-world hardware data without redesigning the builder.

The product center is no longer browsing listings. JETS is now organized around solving a hardware problem through two workflows:

- Build My Own: a slot-based project workspace for composing hardware like a CAD-style build.
- Let JETS Recommend: a recommendation workflow that synthesizes complete solution paths from budget, purpose, preferences, and owned hardware.

Existing inventory, compatibility, platform knowledge, solution intelligence, decision scoring, snapshots, audit, and source ingestion remain functional. They are now supporting services under the Solution Builder architecture. Optimization is the workflow layer that combines those services into suggested changes. Branching is the safety layer that lets users explore those changes without losing the original build.

Marketplace Intelligence is below those systems. It turns raw marketplace input into normalized hardware evidence, detected platforms, parsed components, confidence, listing health, opportunities, and possible futures. It does not score complete builds or mutate projects.

The intended journey is:

1. Home asks what the user is trying to build.
2. Goal-first project wizard creates the project.
3. Builder opens as the project home.
4. Slot-by-slot Inventory selection fills components.
5. Validation summarizes missing and risky areas.
6. Platform knowledge explains quirks, constraints, and hidden paths.
7. Playbooks explain what experienced builders do with the platform.
8. Action Plans turn playbook guidance into dependency-aware tasks.
9. Solution intelligence reasons across CPU, GPU, RAM, PSU, platform, cooling, budget, and use case.
10. Optimization analyzes unlocked slots.
11. Branching preserves alternatives.
12. Compare and Finish review the solution.

Future marketplace data should enter the journey only after it has moved through:

```text
Raw Marketplace Data
-> Normalized Hardware
-> Evidence
-> Platform Knowledge
-> Playbooks
-> Action Plans
-> Solution Intelligence
-> Optimization
-> Recommendation
```

## Architecture Review

The v1 architecture had strong foundations:

- Search had typed local listings, filters, sorting, compare selection, save, and favorite flows. It is now reframed as Inventory.
- The decision engine exposed deterministic scores and explanations.
- The compatibility engine used reusable rule modules.
- Build Generator reused scoring and compatibility rather than duplicating them.
- Snapshots and audit gave decisions durable history.
- Supabase configuration degraded gracefully when environment variables were missing.

The main architectural gap was product shape. Users still entered through a flat listing surface or a generator, which made JETS feel like a listing browser with scoring attached. The long-term product needs projects, slots, validation, solution strategies, and comparison between a user's own build and JETS-generated alternatives.

## Technical Debt Addressed in v2.1

- Mock inventory now has a component-aware layer for CPUs, motherboards, chassis, coolers, RAM, GPUs, PSUs, storage, operating systems, and adapter paths.
- Saved builds and snapshots still exist, but Build My Own now has project persistence for project rows, slot selections, notes, and project audit events.
- The Build Generator currently ranks complete listing candidates. v2.0 wraps it as recommendation infrastructure, but future versions need strategy-level composition.
- Compatibility fixtures are mature for known profiles, but build workspace validation needs richer component facts as inventory becomes more granular.

## v2.0 Foundation

New domain contracts live in `types/solution-builder.ts`.

New data registries live in `data/solution-builder.ts`:

- workflow modes
- reusable service dependencies
- required, optional, and special solution slot definitions
- solution strategy definitions
- starter Engineering Workstation project

New rule and orchestration modules live in `lib/solution-builder`:

- `rules.ts` evaluates missing required slots, physical fit, PCIe, power, RAM, storage, cooling, upgrade path, platform health, and display planning.
- `workspace.ts` composes slot definitions, inventory counts, deterministic recommendations, and Compare Against JETS preview data.

New routes:

- `/solution-builder`
- `/solution-builder/build-my-own`
- `/solution-builder/recommend`
- `/solution-builder/projects`
- `/solution-builder/projects/[projectId]`

Inventory now accepts slot-driven intent through URL query params such as:

```text
/inventory?slot=gpu&query=gpu&formFactor=component&useCase=gaming
```

`/search` remains as a backward-compatible alias, but the user-facing product label is Inventory. This keeps inventory reusable without making it the primary product surface.

## v2.1 Persistence

Project persistence lives in:

- `build_projects`
- `build_project_slots`
- `build_project_notes`
- `build_project_audit_events`

Server actions live in `lib/supabase/project-actions.ts`.

Users can:

- create a project
- create a project from a goal template
- rename a project
- archive or restore a project
- delete a project
- save component selections into slots
- clear slots
- add project notes
- view project audit history

The app still handles missing Supabase environment variables gracefully.

## Phase 4.2 Acquisition Handoff

Saved acquisitions can now become builder input without bypassing user review.

The handoff flow reuses normal project tables:

- `build_projects`
- `build_project_slots`
- `build_project_audit_events`
- `acquisition_project_links`

An acquisition can be used to:

- create a new project
- add reviewed slots to an existing project
- create a branch from an existing project
- link the source listing as evidence only

The slot mapper proposes candidate slots from deterministic acquisition facts:

- platform -> chassis/base system and motherboard
- CPU -> CPU
- GPU -> GPU
- RAM -> RAM
- storage -> storage
- PSU/power text -> PSU
- cooler/fan text -> cooling
- OS/license text -> operating system
- adapter text -> eGPU, Thunderbolt, PCIe, laptop RAM adapter, or external PSU paths

Each mapping carries confidence, source text, and a reason. The user accepts,
rejects, or corrects each proposed slot before JETS writes anything to the
project.

Accepted mappings become acquisition-derived `build_project_slots` rows with
component snapshots that include source evidence metadata. Project detail pages
show linked acquisitions and acquisition-derived slots alongside validation,
platform knowledge, solution intelligence, optimization, and audit history.

## Phase 4.3 Strategy Source

Strategy now sits before project creation. A project can be created from a
deterministic strategy recommendation at `/strategy`, and that provenance is
stored directly on `build_projects`:

- `strategy_id`
- `strategy_title`
- `strategy_snapshot`

Project dashboard and project detail pages show this strategy source. Builder
still owns slot selection, validation, platform knowledge, solution
intelligence, optimization, branching, and acquisition-derived evidence. Strategy
only answers whether the path is worth pursuing before Builder work begins.

## Goal-First Wizard

The Create Project flow starts at `/solution-builder/projects/new`.

Supported goals:

- Gaming PC
- AI workstation
- CAD / Engineering workstation
- Home server
- Office PC
- Upgrade existing computer
- Custom project

Goal templates live in `data/project-goals.ts`. They set the project title,
purpose, budget default, preference preset, owned-hardware assumptions, first
suggested slot, scoring preset, and optimization intent. Project creation still
uses the existing Supabase `build_projects`, `build_project_notes`, and
`build_project_audit_events` tables.

## v2.1 Component Inventory

Component inventory lives in:

- `types/component-inventory.ts`
- `data/mock-components.ts`
- `lib/component-inventory.ts`

Build My Own slots now filter typed inventory by slot:

- GPU slots show GPU and eGPU-related paths.
- RAM slots show RAM and laptop RAM adapter paths.
- PSU slots show internal and external power options.
- Chassis slots show cases and base systems.

Inventory is available at `/inventory`. When opened from a slot, it shows only relevant categories for that slot and can add typed components directly to the project slot when project context exists.

## Inventory Reframe

Inventory is grouped by hardware category instead of one universal ranking list:

- Complete systems
- Base systems / sleeper chassis
- GPUs
- CPUs
- RAM
- Storage
- PSUs
- Cooling
- Adapters / eGPU / special paths
- Other components

This prevents a GPU, laptop, base workstation, adapter path, and complete PC from looking like equivalent products. JETS currently uses mock/demo inventory only; live ingestion and scraping are planned but not active.

## v2.5 Platform Knowledge

Platform knowledge lives in:

- `types/platform-knowledge.ts`
- `data/platform-knowledge.ts`
- `lib/platform-knowledge.ts`
- `components/platform-knowledge`

The knowledge layer is separate from component inventory. Inventory can link to a
platform profile through component IDs, source listing IDs, and aliases, but the
platform record owns the deeper interpretation:

- specifications
- hidden upgrade opportunities
- known limitations
- BIOS quirks
- community-discovered upgrades
- reliability, noise, thermal, PSU, and cooling notes
- GPU clearance
- RAM population advice
- PCIe lane layout and bottlenecks
- NVMe, ECC, and dual-CPU support
- local AI and engineering suitability
- adapter recommendations
- upgrade timeline
- Platform Potential score

The shared `BuildWorkspaceModel` now exposes `platformInsight`. Project
dashboards, project detail pages, inventory cards, optimization, and future
branch comparison can read the same platform context without duplicating lookup
logic.

v2.5 data is curated representative demo knowledge. Future scraping or AI
extraction should populate the same registry shape only after sourcing,
moderation, conflict handling, and correction workflows exist.

## v2.6 Solution Intelligence

Solution intelligence lives in:

- `types/solution-intelligence.ts`
- `lib/solution-intelligence/engine.ts`
- `components/solution-intelligence/solution-intelligence-panel.tsx`

The reasoning engine consumes the shared `BuildWorkspaceModel`; it does not
replace compatibility, optimization, inventory, or platform knowledge.

The generated report includes:

- why this works
- why something was rejected
- CPU, GPU, RAM, PCIe, VRAM, storage, cooling, and PSU bottlenecks
- upgrade impact simulations
- use-case reasoning for gaming, engineering, CAD, programming, virtualization, local AI, rendering, home server, streaming, and office work
- cost efficiency and budget allocation

## Phase 5.1 Engineering Action Plans

Action Plans live in:

- `types/action-plan.ts`
- `lib/action-plan-engine/engine.ts`
- `components/action-plans/action-plan-panel.tsx`

The project detail page now generates an Action Plan from:

- current `BuildWorkspaceModel`
- relevant Hardware Playbooks
- strategy source
- selected project slots
- Builder validation issues

Action Plans translate guidance into engineering tasks:

- install adapter
- replace PSU
- upgrade RAM
- install GPU
- flash BIOS
- update firmware
- replace storage
- replace cooling
- cable management
- thermal inspection
- power verification
- stress testing

Users can accept, skip, reject, complete, and undo tasks. Dependencies prevent a
task from being marked complete before prerequisites are complete. Progress
tracks completion, remaining cost, remaining time, platform improvement,
Knowledge coverage, project maturity, and validation signals addressed by
completed tasks.

Phase 5.1 task choices are stored locally in the browser. Supabase-backed task
persistence and server-side validation adjustments are deferred.
- hidden opportunity detection
- platform opportunity detection from the Platform Knowledge Engine
- optimization advisor modes
- confidence source and reason
- engineering decision history
- branch intelligence signals

The report is deterministic and qualitative. It uses levels such as Very Low,
Low, Moderate, High, and Critical instead of pretending to know exact benchmark
deltas.

## v2.2 Optimization

Optimization lives in:

- `types/optimization.ts`
- `lib/optimization-engine/pipeline.ts`
- `lib/supabase/optimization-actions.ts`
- `/solution-builder/projects/[projectId]/optimize`

The pipeline is deliberately service-shaped:

1. Candidate Solutions
2. Compatibility Filter
3. Decision Engine
4. Optimization Pass
5. Ranking
6. Explainability

Users can lock project slots before running an optimization. Locked slots stay fixed, and the engine only proposes changes for unlocked slots.

Optimization goals:

- best balanced
- minimize cost
- maximize performance
- maximize reliability
- minimize power draw
- maximize upgradeability
- engineering student

Optimization depths:

- standard: obvious swaps and missing required parts
- enthusiast: workstation, enterprise, and adapter-aware paths
- experimental: salvage, eGPU, laptop RAM adapter, and unusual solution paths

Suggestions are persisted as optimization runs. v2.2 does not automatically mutate the project.

## v2.3 Branching

Project branching lives in:

- `build_projects` branch metadata columns
- `lib/supabase/branch-actions.ts`
- `components/solution-builder/project-branch-workspace.tsx`

A branch is still a build project. It gets:

- `parent_project_id`
- `root_project_id`
- `branch_name`
- `branch_source`
- `branch_depth`
- optional optimization source metadata

Manual branches copy the current project and all selected slots.

Optimized branches copy the current project, then apply selected optimizer suggestions into the child project. The source project remains unchanged.

This makes the workflow:

1. Build
2. Analyze
3. Optimize
4. Branch
5. Compare

## Workflow Model

Build My Own projects are made of hardware slots:

- Required: chassis, motherboard, CPU, CPU cooler, RAM, GPU, PSU, storage, operating system.
- Optional: capture card, NIC, sound card, WiFi, additional storage, fans, RGB, accessories.
- Special solution slots: laptop RAM adapter, eGPU dock, external PSU, Thunderbolt adapter, PCIe adapter, other hardware adapters.

Each slot resolves to one of:

- Compatible
- Warning
- Missing

The workspace summary reports completion, platform health, upgrade path, and current validation warnings.

Project pages now share a progress spine:

- Project
- Components
- Validate
- Optimize
- Compare
- Finish

The project dashboard summarizes score, completion, missing slots, validation,
optimization status, branch count, last activity, and the recommended next
action.

## Shared Services

Both workflows should continue to reuse:

- Inventory as project slot support.
- Marketplace Intelligence for normalized listing input, source confidence, platform detection, and opportunity previews.
- Evidence Engine for provenance, verification status, conflicts, community discoveries, and Knowledge Quality.
- Platform knowledge for hidden upgrade paths, platform quirks, PCIe reasoning, and adapter recommendations.
- Solution intelligence for complete-system explanations, bottlenecks, use-case fit, cost efficiency, and confidence.
- Decision engine for deterministic scoring.
- Compatibility engine for hardware constraints.
- Build snapshots for saved decision state.
- Decision audit for decision history.
- Sources for ingestion health and future normalized listing updates.

No scoring or compatibility logic should be duplicated inside workflow components.

## Phase 3 Marketplace Intelligence

Marketplace Intelligence lives in:

- `types/marketplace-intelligence.ts`
- `data/mock-marketplace-intelligence.ts`
- `lib/marketplace-intelligence/normalize.ts`
- `components/marketplace-intelligence/marketplace-intelligence-demo.tsx`

The layer supports future adapters for marketplaces, store feeds, CSV imports,
manual entry, browser extension capture, and APIs. Current adapters are
definitions only. They do not make network requests.

The normalized listing model separates marketplace metadata, seller metadata,
hardware metadata, price, location, condition, description, images, platform
detection, detected components, confidence, listing health, opportunities, and
possible futures. Marketplace-specific raw fields stay isolated from Builder,
Platform Knowledge, Solution Intelligence, Optimization, and Recommendation.

The parser is deterministic. Unknown fields remain unknown. Every parsed field
has a confidence and source, so future OCR, image recognition, LLM extraction,
or official API data can feed the same contracts without changing the Builder.

## Phase 3 Evidence Engine

Evidence lives in:

- `types/evidence.ts`
- `data/evidence.ts`
- `lib/evidence-engine.ts`
- `components/evidence/evidence-panel.tsx`

The Evidence Engine is the trust layer between normalized input and trusted
knowledge. It attaches source type, confidence, extraction method, supporting
text, date added, version, verification status, conflicts, community
discoveries, knowledge timeline, and Knowledge Quality to important facts.

v3.2 persists evidence review through Supabase tables, RLS policies, review
notes, parsed-field evidence links, and `/evidence` review routes.

Future AI, OCR, scraper, CSV, API, and user-submitted claims should become
evidence candidates. They should not mutate Platform Knowledge, Solution
Intelligence, Optimization, or Recommendations directly.

## v3.3 Recommendation

The next milestone should make normalized marketplace listings durable and
evidence-backed before adding live sources, AI extraction, or scraping.

Build:

- normalized listing persistence
- raw source references and source attribution
- parsed-field evidence link generation
- adapter fixture tests
- seeded evidence import workflow
- moderation and correction workflow
- conflict handling when sources disagree
- source-specific compliance reviews
- removal/takedown workflow
- project slot suggestions from reviewed normalized listings

Do not add AI or live scraping yet. Phase 3 needs trusted normalized evidence
before probabilistic extraction or scheduled marketplace ingestion.
