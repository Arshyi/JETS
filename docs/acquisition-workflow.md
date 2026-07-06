# JETS Acquisition Workflow

Version: 4.0

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
count, and personal notes.

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

- Recently captured
- Needs review
- Ready
- Archived
- Purchased
- Rejected

The current implementation stores saved acquisitions in browser local storage.
That is intentional for v4.0. It proves the workflow before adding another
database layer.

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

v4.0 does not include:

- Supabase acquisition persistence
- image upload or OCR
- live marketplace access
- browser extension packaging
- AI extraction
- marketplace APIs
- checkout
- automatic project slot population
- cross-device acquisition history

## Recommended Phase 4.1

Add persisted acquisition records after the manual workflow proves useful:

- `acquisition_records`
- `acquisition_corrections`
- `acquisition_notes`
- `acquisition_decisions`
- `acquisition_project_links`

Keep the same capture pipeline. Do not add scraping yet.
