# JETS Action Plan Engine

Phase 5.1 added Engineering Action Plans. Phase 5.2 persists them as a
durable, auditable, cross-device project workflow.

This is not AI, live scraping, OCR, browser automation, marketplace APIs, or
checkout. It is a deterministic workflow layer generated from the current
project, platform, playbook, strategy source, and Builder validation state.
Phase 5.3 also lets tasks carry Platform Encyclopedia references so engineering
work remains connected to topology, upgrade, reliability, and workload facts.

## Purpose

A Playbook explains:

```text
What should an experienced builder do with this platform?
```

An Action Plan guides:

```text
Which engineering tasks should this project do next?
What must happen first?
What evidence supports the task?
How much work remains?
```

This turns platform knowledge into a project workflow without asking the user to
mentally translate recommendations into steps.

## Architecture

Domain types live in:

- `types/action-plan.ts`

The deterministic engine lives in:

- `lib/action-plan-engine/engine.ts`

The project UI lives in:

- `components/action-plans/action-plan-panel.tsx`

Supabase persistence lives in:

- `lib/supabase/action-plan-actions.ts`
- `supabase/migrations/202607080001_v5_2_persisted_action_plans.sql`

Persistence adapters live in:

- `lib/action-plan-engine/persistence.ts`
- `lib/action-plan-engine/validation.ts`

Project integration lives in:

- `components/solution-builder/project-detail.tsx`

Validation integration lives in:

- `types/validation-framework.ts`
- `lib/validation-framework/engine.ts`
- `scripts/validate-hardware-knowledge.cjs`

## Persistence Schema

Phase 5.2 creates:

- `action_plan_tasks`: generated task definitions plus user workflow status,
  notes, timestamps, ordering, and source snapshots.
- `action_plan_progress`: per-project completion, remaining cost/time, maturity,
  Knowledge coverage, and validation progress snapshots.
- `action_plan_comments`: user notes attached to task records.
- `action_plan_audit_events`: every accepted, completed, skipped, reopened,
  rejected, notes-updated, reorder, and plan-save transition.
- `action_plan_dependencies`: durable prerequisite links between task rows.

RLS keeps every row scoped to the owning `build_projects.user_id`. There is no
moderator or service-role task workflow in Phase 5.2.

## Inputs

An Action Plan is generated from:

- current `BuildWorkspaceModel`
- relevant Hardware Playbooks
- current strategy ID and strategy title
- Builder validation issues
- platform insight
- selected project slots

The pipeline is:

```text
Platform Knowledge
-> Platform Encyclopedia
-> Playbook
-> Strategy
-> Project
-> Builder Validation
-> Action Plan
```

## Task Types

The first deterministic task types are:

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

The list is intentionally engineering-focused. It describes actual work, not
abstract product recommendations.

## Task Metadata

Every task includes:

- title
- description
- estimated time
- estimated cost
- difficulty
- priority
- risk
- dependency task IDs
- evidence record IDs
- verification state
- related slots
- source platform
- source encyclopedia sections
- source playbook recommendation
- source strategy
- Builder validation issues it may resolve

Nothing is disconnected: each task can point back to the playbook, encyclopedia,
evidence, strategy, platform, or validation issue that caused it to exist.

## Dependency Model

Tasks can depend on other tasks.

Examples:

```text
Flash BIOS
-> Upgrade RAM
-> Stress testing
```

```text
Power verification
-> Install GPU
-> Thermal inspection
-> Stress testing
```

The UI and server actions prevent a task from appearing complete when
prerequisites are not complete. If persisted state says a task is complete but a
dependency is not, the engine normalizes it back to accepted.

## Project Workflow

Project detail pages now show an Engineering Action Plan after the Project
Playbook.

Users can:

- save the generated plan to the project
- accept a task
- skip a task
- reject the recommendation
- mark a task complete
- reopen a completed task
- update task notes
- reorder optional tasks

Phase 5.2 stores task choices in Supabase and writes audit events for every
transition. The first task action syncs the generated plan definition; users can
also save the plan explicitly before making a decision.

## Progress Tracking

The Action Plan calculates:

- overall completion
- estimated remaining cost
- estimated remaining time
- platform improvement
- Knowledge coverage
- project maturity
- accepted, blocked, skipped, rejected, and completed task counts
- resolved Builder validation issue IDs
- validation progress percent

Project maturity blends Builder completion with task completion and validation
impact. It is not a hardware score. It is a workflow-readiness signal.

## Builder Validation Integration

Action Plans consume Builder validation issues and create tasks that target
specific warnings when possible.

Examples:

- a power warning can create a power verification task
- a storage warning can create a replace-storage task
- a cooling or physical-fit warning can create a thermal inspection task
- a PCIe warning can create an adapter task

Completed persisted tasks expose `resolvedValidationIssueIds`. Project detail
pages use those IDs to adjust the displayed Builder validation state, so a task
such as "Install PCIe NVMe adapter" can remove the corresponding "No NVMe"
warning after it is completed.

Core compatibility rules still generate the original issue set. Phase 5.2 adds a
workflow-resolution layer on top; it does not mutate hardware slots or pretend a
physical change happened without the user completing the task.

## Validation

Run:

```bash
npm run validate:hardware
```

The validation suite now checks that Action Plans:

- generate tasks
- include dependency chains
- resolve dependency IDs
- link to evidence, playbooks, encyclopedia references, or validation issues
- expose Builder validation impact
- expose progress metrics
- support expected task statuses

## Current Limitations

Phase 5.2 does not:

- mutate project slots automatically
- install or verify hardware outside the user's confirmation
- add admin/service-role review flows for action plans
- estimate exact real-world labor or cost
- use AI to generate tasks
- ingest live marketplace data

The value of this milestone is durable workflow state: Playbook recommendations
can now become project-specific engineering tasks with dependencies, progress,
evidence, audit history, and validation impact across devices.

## Phase 5.3 Direction

The natural next step is richer execution workflow:

- action plan dashboard and history views across all projects
- task templates for platform-specific service procedures
- before/after validation reports for completed task groups
- exportable technician checklist
- merge accepted task outcomes into project branches when the user approves
