# JETS Hardware Playbook Engine

Phase 5.0 adds the Hardware Playbook Engine.

This is not AI, live scraping, OCR, browser automation, marketplace APIs, or
checkout. It is curated deterministic knowledge that compresses practical
builder experience into reusable playbooks.

## Purpose

Platform Knowledge answers:

```text
What is this machine?
```

Playbooks answer:

```text
What should an experienced builder do with this machine?
What mistakes should the buyer avoid?
Which upgrade paths are worth considering?
```

That distinction matters. A ThinkStation P510 profile can describe sockets,
RAM, PCIe, and constraints. A P510 playbook can say to prioritize PCIe NVMe,
64 GB ECC, power-validated GPU selection, BIOS review, and adapter planning
before pretending it is a generic gaming tower.

## Architecture

Domain types live in:

- `types/playbook.ts`

Curated demo playbooks live in:

- `data/playbooks.ts`

The engine lives in:

- `lib/playbook-engine/engine.ts`

The reusable UI lives in:

- `components/playbooks/playbook-panel.tsx`

Validation is integrated into:

- `types/validation-framework.ts`
- `lib/validation-framework/engine.ts`
- `scripts/validate-hardware-knowledge.cjs`

Phase 5.1 adds Action Plans above Playbooks:

- `types/action-plan.ts`
- `lib/action-plan-engine/engine.ts`
- `components/action-plans/action-plan-panel.tsx`

## Playbook Model

Each playbook includes:

- platform ID and platform name
- use case, such as engineering, gaming, AI, home server, budget, repair, or general
- overview
- recommended strategies
- upgrade paths
- known bottlenecks
- common mistakes
- required adapters
- PCIe considerations
- power considerations
- cooling notes
- firmware and BIOS notes
- storage guidance
- memory guidance
- repair guidance
- platform lifespan
- ideal workloads
- recommendations with slot hints
- evidence IDs
- verification state
- Knowledge Quality score

Recommendations are slot-aware. They can point at GPU, storage, RAM, PSU,
cooling, PCIe adapters, eGPU docks, laptop RAM adapters, or other builder slots.

## Current Demo Playbooks

Phase 5.0 includes deterministic playbooks for:

- Lenovo ThinkStation P510
- Lenovo ThinkStation P520
- Dell Precision T5810
- Dell Precision 5820
- Dell OptiPlex 7060 SFF
- HP Z440
- HP Z840
- Mac Pro 5,1
- generic mini PC paths
- generic laptop, eGPU, and salvage paths

Every supported Platform Knowledge profile has at least one playbook.

## Integration Points

Project detail pages show the Project Playbook. JETS compares selected slots
against playbook recommendations and separates completed recommendations from
remaining recommendations and warnings.

Phase 5.1 turns those recommendations into project-specific Engineering Action
Plans. The Action Plan layer reads playbook recommendations, strategy source,
current project slots, and Builder validation issues, then generates tasks with
dependencies, cost/time estimates, evidence links, verification state, and
validation impact.

Acquisition detail pages show the Acquisition Playbook before handoff. This
keeps a saved listing from becoming a project before the buyer understands the
platform strategy, likely adapters, common mistakes, and evidence state.

Strategy Engine recommendations can cite playbooks for recognized acquisitions.
Strategy does not duplicate the playbook knowledge. It uses playbooks as
supporting signals for why a used workstation, repair path, mini PC, or hybrid
path is sensible.

Hardware validation now fails when a supported platform lacks a playbook or a
playbook recommendation points at missing evidence.

## Confidence

Each playbook recommendation exposes:

- confidence
- verification state
- linked evidence record count
- Knowledge Quality score
- warnings

Playbook confidence is not the same as performance score. It expresses how
strongly JETS trusts the builder guidance and whether the source evidence is
verified, pending review, disputed, or unverified.

## Why This Layer Exists

Without playbooks, JETS can understand a platform and still leave the user to
mentally assemble the real build plan.

With playbooks, the app can say:

- this platform is worth upgrading this way
- this platform should not be forced into that use case
- this adapter is the hidden opportunity
- this PSU or BIOS detail is the trap
- this listing deserves strategy review before project creation

This is the first Phase 5 knowledge layer: practical engineering judgment that
Builder, Acquisition, Strategy, Optimization, and future AI can all cite.

Action Plans are the workflow layer above this knowledge. A playbook can say
"use a PCIe NVMe adapter"; an Action Plan can create "install adapter",
"replace storage", "verify power", and "stress test" tasks in the right order.

## Future AI Hooks

Future AI should not invent playbooks directly into production truth.

It can help propose:

- candidate playbook sections from manuals or build logs
- plain-language summaries of verified playbooks
- possible common mistakes from reviewed acquisition history
- evidence gaps that human reviewers should fill

Those proposals should enter evidence review before becoming trusted playbook
recommendations.

## Limitations

Phase 5.0 playbooks are curated demo data.

They do not:

- make live marketplace claims
- prove exact fit for every unit
- replace Builder validation
- replace acquisition evidence review
- automatically mutate projects
- use AI-generated sourcing

They give JETS a reusable place to store experienced-builder guidance while the
rest of the app remains deterministic.

Phase 5.1 task state is local to the browser. Persisted task history, shared
multi-device plans, and server-side validation adjustments are intentionally
deferred until the workflow is proven.
