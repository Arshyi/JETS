# JETS Inventory

Inventory is a supporting service for Solution Builder projects.

It is not the primary product surface and it is not live marketplace scraping.
JETS currently uses mock/demo inventory so the project, compatibility,
optimization, snapshot, and audit workflows can be tested deterministically.

## Purpose

Inventory exists to provide candidates for:

- project slots
- generated solution paths
- optimization suggestions
- saved research
- future normalized marketplace ingestion

The key product rule is that unlike hardware should not compete in one flat
ranking list. A GPU, a laptop, a workstation base, and an eGPU dock are not the
same kind of answer.

## User-Facing Route

- `/inventory`: primary inventory route.
- `/search`: backward-compatible alias that renders the same Inventory UI.

The main navigation uses Inventory. Existing links to `/search` continue to
work so older saved URLs do not break.

## Categories

Inventory is grouped by:

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

Category grouping is handled in `lib/inventory.ts`.

## Slot-Driven Inventory

When Inventory opens with slot context, for example:

```text
/inventory?slot=gpu&projectId=<project-id>&returnTo=/solution-builder/projects/<project-id>
```

JETS shows only categories relevant to that slot. If project and slot context
exist, typed component cards include an `Add to project slot` action.

Examples:

- GPU slot: GPUs and appropriate eGPU paths.
- RAM slot: RAM and laptop RAM adapter paths.
- PSU slot: PSUs and external PSU paths.
- Chassis slot: cases, workstation bases, and base systems.

## Data Sources

Current inventory combines:

- `data/mock-components.ts`: typed component-aware demo inventory.
- `data/mock-listings.ts`: legacy mock listing candidates retained for compare,
  saved research, generator, and decision-engine coverage.

Future live ingestion should normalize marketplace data into this inventory
model only after compliance, quality, freshness, duplicate detection, and user
safety rules are ready.

## Product Boundary

Inventory should not:

- become the homepage
- imply live availability
- rank every hardware type together
- use `Save build` wording for standalone parts
- bypass Solution Builder project context

Inventory should:

- make mock/demo status clear
- support slot-driven filtering
- preserve category context
- reuse existing decision and compatibility services where useful
- remain safe to replace with normalized ingestion later
