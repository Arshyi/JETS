# JETS Action Plan Engine

Phase 5.1 adds Engineering Action Plans.

This is not AI, live scraping, OCR, browser automation, marketplace APIs, or
checkout. It is a deterministic workflow layer generated from the current
project, platform, playbook, strategy source, and Builder validation state.

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

Project integration lives in:

- `components/solution-builder/project-detail.tsx`

Validation integration lives in:

- `types/validation-framework.ts`
- `lib/validation-framework/engine.ts`
- `scripts/validate-hardware-knowledge.cjs`

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
- source playbook recommendation
- source strategy
- Builder validation issues it may resolve

Nothing is disconnected: each task can point back to the playbook, evidence,
strategy, platform, or validation issue that caused it to exist.

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

The UI prevents a task from appearing complete when prerequisites are not
complete. If stored local state says a task is complete but a dependency is not,
the engine normalizes it back to accepted.

## Project Workflow

Project detail pages now show an Engineering Action Plan after the Project
Playbook.

Users can:

- accept a task
- skip a task
- reject the recommendation
- mark a task complete
- undo completion

Phase 5.1 stores task choices in browser local storage per project. This keeps
the milestone focused on workflow shape before adding database persistence.

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

Completed tasks expose `resolvedValidationIssueIds`, so the UI can show which
validation signals have been addressed by engineering work. Core server-side
Builder validation still remains the source of truth until task persistence is
added.

## Validation

Run:

```bash
npm run validate:hardware
```

The validation suite now checks that Action Plans:

- generate tasks
- include dependency chains
- resolve dependency IDs
- link to evidence, playbooks, or validation issues
- expose Builder validation impact
- expose progress metrics
- support expected task statuses

## Current Limitations

Phase 5.1 does not persist task state to Supabase.

It also does not:

- mutate project slots automatically
- mark Builder validation issues resolved on the server
- create audit events for task status changes
- estimate exact real-world labor or cost
- use AI to generate tasks
- ingest live marketplace data

The value of this milestone is workflow shape: Playbook recommendations can now
become project-specific engineering tasks with dependencies, progress, evidence,
and validation impact.

## Phase 5.2 Direction

The natural next step is persisted Action Plans:

- Supabase tables for action plan tasks and task events
- project audit entries for task changes
- task state shared across devices
- server-side validation adjustments from accepted/completed tasks
- task-derived project maturity history
