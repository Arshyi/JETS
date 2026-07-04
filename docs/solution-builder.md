# JETS Solution Builder

Version 2.0 was the first architectural redesign of JETS. Version 2.1 added persisted projects and component-aware slot inventory. Version 2.2 added the Optimization Engine Foundation. Version 2.3 adds Project Branching & Optimization Workspace.

The product center is no longer browsing listings. JETS is now organized around solving a hardware problem through two workflows:

- Build My Own: a slot-based project workspace for composing hardware like a CAD-style build.
- Let JETS Recommend: a recommendation workflow that synthesizes complete solution paths from budget, purpose, preferences, and owned hardware.

Existing inventory, compatibility, decision scoring, snapshots, audit, and source ingestion remain functional. They are now supporting services under the Solution Builder architecture. Optimization is the workflow layer that combines those services into suggested changes. Branching is the safety layer that lets users explore those changes without losing the original build.

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
- rename a project
- archive or restore a project
- delete a project
- save component selections into slots
- clear slots
- add project notes
- view project audit history

The app still handles missing Supabase environment variables gracefully.

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

## Shared Services

Both workflows should continue to reuse:

- Inventory as project slot support.
- Decision engine for deterministic scoring.
- Compatibility engine for hardware constraints.
- Build snapshots for saved decision state.
- Decision audit for decision history.
- Sources for ingestion health and future normalized listing updates.

No scoring or compatibility logic should be duplicated inside workflow components.

## v2.4 Recommendation

The next milestone should make branches easier to compare and selectively merge.

Build:

- branch diff viewer
- original vs optimized branch comparison
- slot-level before/after changes
- score snapshots before and after optimization
- merge-style apply into a selected branch
- rollback and branch audit events

Do not add AI or live scraping yet. The v2 product shape should become stable before adding probabilistic recommendations or live marketplace data.
