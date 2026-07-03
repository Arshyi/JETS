# Project Branching

Version 2.3 adds Project Branching & Optimization Workspace.

The inspiration is Git, not a shopping cart. Hardware decisions are engineering experiments. Users should be able to branch an idea, try an optimization, and keep the original project intact.

## Workflow

The v2 workflow is now:

1. Build
2. Analyze
3. Optimize
4. Branch
5. Compare

Branches make optimization safe. JETS can propose unusual or aggressive changes without overwriting the user's working build.

## Data Model

A branch is a normal `build_projects` row with lineage metadata:

- `parent_project_id`
- `root_project_id`
- `branch_name`
- `branch_source`
- `branch_depth`
- `branch_notes`
- `source_optimization_run_id`
- `source_optimization_suggestion_ids`

This keeps projects, slots, notes, audit events, and optimization runs reusable. There is no parallel branch table that would need separate slot logic.

## Manual Branches

Manual branches copy:

- project metadata
- preferences
- owned hardware
- all current slot selections
- slot notes

The source project is unchanged.

## Optimized Branches

Optimized branches start the same way as manual branches, then apply selected optimizer suggestions into the child project.

Examples:

- Replace GPU on the branch only.
- Add PSU upgrade on the branch only.
- Preserve locked CPU and motherboard from the source project.
- Add notes for reuse or salvage suggestions that do not yet map to a concrete component.

The optimizer never edits the source project directly.

## Audit

Branch actions write project audit events:

- project branch created
- source project child branch created
- optimization branch applied

Future versions should connect this more deeply to the global decision audit timeline.

## Design Decisions

Branching is intentionally simple in v2.3:

- Branches are projects.
- Applying optimization creates a new project.
- No merge behavior exists yet.
- No branch deletion rules beyond existing project archive/delete behavior.
- No AI, live scraping, or checkout.

This keeps the architecture coherent while making JETS feel more like an engineering workspace.

## v2.4 Recommendation

Build branch comparison and merge preview next:

- side-by-side branch comparison
- slot-level diffs
- score deltas
- merge selected changes into a chosen branch
- rollback and branch audit events

This should come before adding live marketplace data because users need confidence in project history before JETS starts ingesting volatile external listings.
