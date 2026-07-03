# JETS Solution Builder

Version 2.0 is the first architectural redesign of JETS.

The product center is no longer browsing listings. JETS is now organized around solving a hardware problem through two workflows:

- Build My Own: a slot-based project workspace for composing hardware like a CAD-style build.
- Let JETS Recommend: a recommendation workflow that synthesizes complete solution paths from budget, purpose, preferences, and owned hardware.

Existing search, compatibility, decision scoring, snapshots, audit, and source ingestion remain functional. They are now supporting services under the Solution Builder architecture.

## Architecture Review

The v1 architecture had strong foundations:

- Search had typed local listings, filters, sorting, compare selection, save, and favorite flows.
- The decision engine exposed deterministic scores and explanations.
- The compatibility engine used reusable rule modules.
- Build Generator reused scoring and compatibility rather than duplicating them.
- Snapshots and audit gave decisions durable history.
- Supabase configuration degraded gracefully when environment variables were missing.

The main architectural gap was product shape. Users still entered through search or a generator, which made JETS feel like a listing browser with scoring attached. The long-term product needs projects, slots, validation, solution strategies, and comparison between a user's own build and JETS-generated alternatives.

## Technical Debt Identified

- Mock inventory is listing-oriented, not component-oriented. It can represent a complete workstation or GPU listing, but not yet a normalized CPU, motherboard, PSU, cooler, adapter, or OS candidate.
- Saved builds and snapshots predate slot-based projects. They preserve decisions, but they do not yet persist a user's custom project structure.
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
- `workspace.ts` composes slot definitions, inventory search counts, deterministic recommendations, and Compare Against JETS preview data.

New routes:

- `/solution-builder`
- `/solution-builder/build-my-own`
- `/solution-builder/recommend`

Search now accepts slot-driven inventory intent through URL query params such as:

```text
/search?slot=gpu&query=gpu&formFactor=component&useCase=gaming
```

This keeps search reusable without making it the primary product surface.

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

- Search as inventory.
- Decision engine for deterministic scoring.
- Compatibility engine for hardware constraints.
- Build snapshots for saved decision state.
- Decision audit for decision history.
- Sources for ingestion health and future normalized listing updates.

No scoring or compatibility logic should be duplicated inside workflow components.

## v2.1 Recommendation

The next milestone should be Project Persistence and Component-Aware Inventory.

Build:

- Supabase tables for `build_projects` and `build_project_slots`.
- Create, rename, archive, and restore project flows.
- Slot add/remove actions.
- Component-aware mock inventory for CPU, motherboard, PSU, cooler, RAM, storage, adapters, and operating system.
- Compare saved user projects against generated JETS solutions with preserved explanations.

Do not add AI or live scraping yet. The v2 product shape should become stable before adding probabilistic recommendations or live marketplace data.
