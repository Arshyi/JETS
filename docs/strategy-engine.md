# JETS Strategy Engine

Phase 4.3 adds deterministic strategy reasoning.

This is not AI, live scraping, marketplace APIs, OCR, browser automation,
checkout, or a new marketplace source. It is a pre-project decision layer that
helps decide whether a hardware path deserves a Builder project at all.

## Product Question

Compatibility answers:

```text
Can this hardware work together?
```

Optimization answers:

```text
How do I improve this selected project?
```

Strategy answers:

```text
Should I even build this?
What is the smartest path?
Should I buy, upgrade, repair, build, or walk away?
```

That distinction matters. A listing can be compatible and still be a bad idea.
A project can be optimizable and still start from the wrong strategic path.

## Architecture

Strategy lives in:

- `types/strategy.ts`
- `lib/strategy-engine/engine.ts`
- `lib/strategy-engine/acquisitions.ts`
- `data/strategy-validation-fixtures.ts`
- `components/strategy/strategy-workspace.tsx`
- `app/(workspace)/strategy/page.tsx`
- `lib/supabase/strategy-actions.ts`

Phase 5.0 adds a Playbook dependency:

- `lib/playbook-engine/engine.ts`
- `data/playbooks.ts`

Strategy uses playbooks as evidence-backed support signals for recognized
acquisitions. It does not copy playbook rules into strategy scoring.

Persistence extends the existing project model through:

- `supabase/migrations/202607070002_v4_3_strategy_engine.sql`

The migration adds strategy provenance to `build_projects`:

- `strategy_id`
- `strategy_title`
- `strategy_snapshot`

This keeps strategy-created projects on the same persistence backbone as slots,
validation, optimization, branches, acquisition links, notes, and audit events.

## Inputs

The Strategy Engine consumes:

- budget
- country
- currency
- goals
- owned hardware
- saved acquisitions
- region
- risk tolerance
- noise preference
- power constraints
- portability
- repair willingness
- time horizon

Saved acquisitions are optional inputs. Strategy can decide that a saved listing:

- should become a project
- should feed a hybrid path
- should remain evidence only
- should be repaired first
- should be rejected
- should trigger a wait-for-better-value recommendation

## Strategy Types

The first deterministic strategies are:

- upgrade existing machine
- buy used workstation
- build from scratch
- laptop plus eGPU
- mini PC
- server conversion
- repair existing hardware
- wait for better value
- hybrid strategy

The list is intentionally broad. JETS should not only compare complete PCs. It
should reason about solution paths.

## Tradeoff Matrix

Each strategy receives a tradeoff matrix:

- cost
- performance
- upgradeability
- reliability
- power draw
- noise
- difficulty
- repairability
- platform potential
- future expansion
- confidence

For cost, power draw, noise, and difficulty, lower is better. For the remaining
metrics, higher is better.

The overall score blends upside with practical burden:

```text
positive upside:
confidence, future expansion, performance, platform potential,
reliability, repairability, upgradeability

practical burden:
cost, difficulty, noise, power draw
```

This keeps the engine from blindly choosing the most powerful path when the
user has a tight budget, quiet room, low risk tolerance, or strict power limit.

## Explanation Contract

Every strategy recommendation includes:

- why this strategy was chosen
- why alternatives ranked lower
- risks
- hidden opportunities
- expected lifespan
- confidence
- project seed, when creating a project is appropriate

Examples:

- An overpriced workstation can produce "wait for better value."
- A cheap broken workstation can produce "repair existing hardware" when repair
  willingness is high.
- A high-confidence workstation acquisition inside budget can produce "buy used
  workstation."
- A low-confidence generic listing can produce "walk away" instead of creating
  a misleading project.

## Project Integration

Strategies can create projects through `/strategy`.

When a project is created from a strategy:

- `build_projects.strategy_id` records the deterministic strategy type.
- `build_projects.strategy_title` records the user-facing strategy name.
- `build_projects.strategy_snapshot` preserves the full recommendation.
- `build_project_audit_events` records `strategy_project_created`.
- A project note captures the initial "why this strategy" explanation.

Project dashboard and project detail pages show the strategy source so the
Builder remembers why the project exists.

## Acquisition Integration

Acquisition detail pages now link to Strategy before handoff. That is a product
guardrail:

```text
Captured listing
-> Review evidence
-> Strategy decision
-> Project only if justified
```

This prevents every acquisition from automatically becoming project work.

Phase 5.0 also lets Strategy cite Hardware Playbooks. If a saved Precision,
ThinkStation, OptiPlex, HP Z-series, Mac Pro, mini PC, or laptop/eGPU path maps
to a known playbook, the strategy recommendation can explain which playbook
supports the path, which hidden opportunity matters, and which risks should
remain visible.

This keeps the decision flow layered:

```text
Platform Knowledge -> Playbook -> Strategy -> Builder
```

Platform Knowledge identifies the hardware. Playbooks describe experienced
builder moves. Strategy decides whether the path deserves a project.

## Validation

The hardware validation suite now includes strategy fixtures:

- budget too small
- overpriced workstation
- amazing deal
- bad platform
- excellent platform
- repair candidate

Run:

```bash
npm run validate:hardware
```

The suite fails if the deterministic strategy ranking drifts away from those
golden scenarios.

The suite also checks Hardware Playbook coverage so strategy guidance cannot
quietly lose the supporting playbook layer for a recognized platform.

## Future AI Hooks

Future AI could help with:

- summarizing tradeoffs in plainer language
- extracting strategy-relevant facts from evidence
- grouping acquisition risk patterns
- proposing missing strategy types

AI should not bypass the Strategy Engine. It should feed evidence, confidence,
and explanations that deterministic strategy rules can cite or review.

## Current Limitations

Phase 4.3 is conservative:

- no live marketplace data
- no AI
- no automatic acquisition rejection
- no persisted strategy comparison table
- no user-editable strategy weights
- no branch-level strategy diff
- no market trend timing model

The value is the new decision layer. JETS can now tell a user when the smartest
hardware move is not to start a project.
