# JETS Acquisition Workflow

Version: 4.1

Phase 4 changes the development philosophy.

Earlier milestones built the engine. Acquisition uses the engine.

JETS should now help answer:

```text
I found hardware. Is it worth buying?
```

This version does not implement live scraping, AI, marketplace APIs, OCR,
browser automation, checkout, or a browser extension.

## Product Rule

Acquisition is the front door. Marketplace is only one possible source.

A user may discover hardware from:

- Dubizzle
- Facebook Marketplace
- eBay
- Craigslist
- Kijiji
- a local shop
- a recycler
- a friend
- school or office surplus

JETS should care less about where it came from and more about whether the
hardware is worth pursuing.

## Workflow

The new `/acquire` workspace follows this path:

```text
Paste listing
-> Preview
-> Normalize
-> Evidence
-> Platform Detection
-> Listing Intelligence
-> Recommendation Preview
-> Create Project
```

The workflow is intentionally manual first. The user provides title,
description, price, URL, location, condition, seller notes, placeholder image
count, and personal notes. In Phase 4.1, signed-in users persist the result to
Supabase; missing Supabase config or signed-out usage continues to fall back to
browser local storage so the workflow remains usable in demo environments.

## Manual Capture

The capture form supports:

- marketplace
- listing URL
- title
- description
- price
- currency
- location
- condition
- seller notes
- image placeholder count
- personal notes

Personal notes include:

- why I saved this
- negotiation ideas
- seller concerns
- meeting location
- repair notes
- missing accessories
- general notes

These notes are purchase-context data. They are not normalized hardware facts.

## Import Preview

Before saving, JETS shows:

- raw listing
- parsed fields
- detected platform
- confidence
- evidence
- missing information
- Recommendation Readiness
- recommendation preview score
- upgrade opportunities

The preview uses the existing Marketplace Intelligence and Listing Intelligence
pipeline. It does not create a separate acquisition parser.

## User Corrections

Before import, the user can correct:

- CPU
- GPU
- RAM
- platform
- price
- storage

Each correction becomes local user-submitted evidence in the preview. A
correction does not erase parser output; it sits beside it as a reviewable
claim.

This preserves the Evidence Engine rule:

```text
Corrections become evidence.
Evidence can later become trusted knowledge after review.
```

## Listing Decisions

After review, the user can choose:

- Analyze only
- Save Listing
- Create Build Project
- Ignore Listing
- Archive

Saved acquisition statuses are:

- Reviewing
- Ready
- Archived
- Purchased
- Rejected

Phase 4.1 persists saved acquisitions in Supabase when the user is signed in.
The local browser store remains a fallback only, not the preferred path.

## Supabase Persistence

The Phase 4.1 migration creates:

- `acquisition_records`
- `acquisition_corrections`
- `acquisition_notes`
- `acquisition_decisions`
- `acquisition_project_links`
- `acquisition_compare_sets`

`acquisition_records` stores the user-owned acquisition decision plus the raw
listing payload, normalized listing payload, analysis snapshot, status,
readiness, confidence, platform detection, preview score, and app version.

Corrections, notes, decisions, project links, and compare sets remain separate
tables because they evolve after the original capture. This keeps the raw
listing immutable enough for review while still allowing a user to add context,
change status, link the acquisition to a project, and compare purchase
candidates.

RLS is deliberately simple:

- users can read, insert, update, and delete only their own acquisition records
- users can read and create only child rows attached to their own acquisitions
- users can link an acquisition only to one of their own projects
- admin review, if needed later, should use service-role gated server actions
  rather than widening default user policies

## Compare Acquisitions

Acquisition comparison is purchase comparison, not build comparison.

The comparison view weighs saved listings side by side by:

- price
- detected platform
- readiness
- missing information
- personal note
- preview score

Once a listing becomes a project, Project Branching and Optimization handle
build-level comparison.

Phase 4.1 also lets a signed-in user save a compare set of two or three
acquisitions. Compare sets are purchase review artifacts, not final build
branches.

## Acquisition History

`/acquire/history` is the persisted acquisition dashboard. It supports filters
for:

- status
- marketplace
- source ID

`/acquire/history/[acquisitionId]` is the review detail page. It shows:

- raw listing
- normalized listing
- parser and correction evidence
- persisted corrections
- review notes
- recommendation preview
- decision history
- compare-set context
- project handoff links

## Project Transition

When a listing looks promising, the workspace offers project handoff links for:

- Engineering build
- Gaming build
- AI workstation
- Home server
- existing project reuse

Acquisition feeds Solution Builder. It does not replace it.

## Future Browser Extension Hook

The browser extension should not become another intelligence system.

It should package:

- page title
- listing title
- description
- price
- URL
- source
- optional notes

Then it should hand that payload to the same acquisition workflow.

The durable architecture is:

```text
Capture
-> Normalize
-> Verify
-> Reason
-> Recommend
```

Scrapers, APIs, OCR, AI, CSV imports, and browser extensions are future capture
methods only. They should not become separate reasoning pipelines.

## Current Limitations

Phase 4.1 does not include:

- image upload or OCR
- live marketplace access
- browser extension packaging
- AI extraction
- marketplace APIs
- checkout
- automatic project slot population
- automatic promotion of acquisition corrections into public platform knowledge
- moderator-facing acquisition review queues

Keep the same capture pipeline. Do not add scraping yet.
