# Component Inventory

Version 2.1 adds component-aware slot inventory. Version 2.2 uses this inventory as optimizer search space.

Before this milestone, the old Search surface mixed whole PCs, laptops, GPUs, and other listings in one listing-shaped model. That was useful for ranking experiments, but it did not respect Build My Own slots.

The new component inventory layer lets JETS answer a more precise question:

Which inventory candidates are valid for this hardware slot?

## Files

- `types/component-inventory.ts`: component category and item contracts.
- `data/mock-components.ts`: local mock component inventory.
- `lib/component-inventory.ts`: slot-to-category filtering, lookup helpers, and workspace selection conversion.
- `components/solution-builder/slot-inventory-picker.tsx`: slot-scoped picker UI.
- `lib/inventory.ts`: category grouping and slot-relevant inventory classification.
- `components/inventory/inventory-experience.tsx`: Inventory shows category-grouped, slot-filtered component inventory.

## Categories

The v2.1 mock inventory includes:

- CPU
- motherboard
- chassis / case / base system
- CPU cooler
- RAM
- GPU
- PSU
- storage
- operating system
- eGPU dock
- external PSU
- Thunderbolt adapter
- PCIe adapter
- laptop RAM + DIMM adapter

## Slot Filtering

Slot filtering is centralized in `lib/component-inventory.ts`.

Examples:

- GPU slots accept GPU inventory and eGPU dock paths.
- RAM slots accept RAM inventory and laptop RAM adapter paths.
- PSU slots accept internal PSUs and external PSU options.
- Chassis slots accept case and base-system candidates.

UI components do not hardcode these rules.

## Persistence

Selected components are persisted in `build_project_slots` with:

- `slot_id`
- `component_id`
- `component_category`
- `component_snapshot`
- `notes`

The snapshot preserves the component facts used for validation at the time of selection. Current mock data can still be used as a fallback when a snapshot is missing.

## Validation

The Build Workspace validates:

- missing CPU
- missing motherboard or base system
- missing RAM
- missing storage
- missing PSU or power solution
- missing cooling solution
- incompatible component category in slot
- power headroom and connector risk
- physical GPU fit
- PCIe generation mismatch
- RAM type, capacity, and slot limits
- storage slot and port limits
- cooling and airflow risk
- BIOS generation and platform age

## Optimizer Use

The Optimization Engine consumes slot-filtered inventory instead of scanning raw listings directly. That keeps all suggestions component-aware:

- GPU optimizations come from GPU and eGPU-related candidates.
- RAM optimizations can include desktop RAM, laptop RAM, or adapter paths.
- PSU optimizations can include internal PSUs and external power paths.
- Storage optimizations can reuse owned drives or add mock inventory drives.

Components include `complexityTier` so the optimizer can separate standard, enthusiast, and experimental ideas.

## Branch Use

In v2.3, optimized branches copy the source project's component snapshots before applying selected optimizer suggestions. This preserves the original component facts while allowing the branch to test replacement parts or adapter paths.

## v2.4 Recommendation

The next layer should compare branch inventory changes:

- preserve before/after component snapshots
- compare original vs optimized component selections
- add conflict-resolution guidance for each warning before applying changes
- keep AI and live scraping deferred
