# Optimization Engine

Version 2.2 turns JETS from a comparison tool into an optimization workflow.

The user flow becomes:

1. Build
2. Analyze
3. Optimize
4. Branch
5. Compare

Comparison still matters, but it is now a view over a deeper capability: searching possible hardware solution changes while respecting locked components, compatibility constraints, budget pressure, and practical tradeoffs.

## Scope

v2.2 is deterministic and local-first. v2.3 adds branch-safe application of selected suggestions.

It does not implement:

- AI
- live scraping
- checkout
- automatic project mutation

The optimizer works from the current Build My Own project, typed mock component inventory, persisted project notes, and deterministic scoring rules.

## Strategy Boundary

Phase 4.3 adds Strategy before Optimization.

Strategy decides whether the user should start from a used workstation, upgrade
an existing machine, build from scratch, repair a candidate, use laptop plus
eGPU, choose a mini PC, convert a server, combine a hybrid path, or wait for
better value.

Optimization only runs after a project exists. It improves selected slots while
respecting locks, validation, compatibility, budget pressure, and tradeoffs.
Comparison is a view over optimized project branches; Strategy comparison is a
pre-project decision view.

## Files

- `types/optimization.ts`: goals, depths, suggestion contracts, metrics, and result types.
- `lib/optimization-engine/pipeline.ts`: deterministic optimizer pipeline.
- `lib/reasoning-graph/engine.ts`: graph path context for recognized platform projects.
- `lib/supabase/optimization-actions.ts`: server action for persisted optimization runs.
- `components/optimization/optimization-experience.tsx`: Optimize My Build UI.
- `supabase/migrations/202607030012_v2_2_optimization_engine.sql`: optimization run and suggestion tables.

## Pipeline

The engine is structured like a search algorithm:

1. Candidate Solutions
2. Compatibility Filter
3. Decision Engine
4. Optimization Pass
5. Ranking
6. Explainability

This keeps the code ready for larger search spaces later. Future versions can expand candidate generation without changing the UI contract.

## Locked Slots

Users can lock components before optimization.

Examples:

- Lock CPU and motherboard, optimize GPU, RAM, PSU, and storage.
- Lock chassis, optimize only parts that physically fit.
- Lock owned storage and ask JETS to minimize total cost.

Locked slots are passed into the optimizer as `lockedSlots`. Suggestions are only generated for unlocked slots.

## Goals

The current deterministic goals are:

- best balanced
- minimize cost
- maximize performance
- maximize reliability
- minimize power draw
- maximize upgradeability
- engineering student

Each goal uses the same underlying metrics but weights them differently.

## Depth

Optimization depth controls how strange JETS is allowed to get.

- Standard: obvious replacements, missing required slots, and conventional upgrades.
- Enthusiast: enterprise hardware, workstations, adapter-aware paths, and higher complexity.
- Experimental: salvage, laptop RAM adapters, eGPU paths, external power, and unusual combinations.

This prevents beginner users from seeing confusing ideas while preserving the product's long-term niche discovery potential.

## Persisted Data

Optimization runs preserve:

- project id
- goal
- depth
- locked slots
- baseline score
- optimized score
- input project snapshot
- app version
- summary

Suggestions preserve:

- slot id
- action
- current component
- suggested component snapshot
- score delta
- cost delta
- confidence
- compatibility impact
- reliability impact
- upgradeability impact
- power impact
- reason

## Design Decisions

The optimizer reuses existing services:

- Build Projects provide the current slot state.
- Component Inventory provides valid slot candidates.
- Workspace validation provides completion and warning context.
- Decision-style scoring provides deterministic tradeoff metrics.
- Hardware Reasoning Graph provides relationship paths that explain why a platform has opportunities or constraints.
- Project audit records optimization runs.

The UI does not duplicate scoring. It submits optimization inputs and renders persisted runs.

## Branch Application

Selected suggestions can create an optimized branch. The branch:

- copies the source project
- copies current slot selections
- applies selected optimizer suggestions
- stores parent/root lineage
- stores source optimization run and suggestion IDs
- records audit events

This behaves more like Git branching than direct editing.

## v2.4 Recommendation

v2.4 should add branch comparison and merge preview:

- branch diff viewer
- slot-level before/after change summaries
- original vs optimized score deltas
- merge-style apply into a chosen branch
- rollback and branch audit events

That layer should still avoid AI and live scraping.
