# JETS Evidence Engine

Version 3.1 adds the Evidence Engine foundation.

This is not live scraping, marketplace APIs, AI extraction, OCR, image
recognition, checkout, or moderation. It is the trust architecture future
providers must feed.

## Product Rule

Nothing inside JETS should simply say "trust me."

Every recommendation should answer:

- why?
- how do we know?
- where did this come from?
- has anyone verified it?
- is there conflicting evidence?

## Architecture

Evidence lives in:

- `types/evidence.ts`
- `data/evidence.ts`
- `lib/evidence-engine.ts`
- `components/evidence/evidence-panel.tsx`

Existing systems remain the core of JETS:

- Projects
- Builder
- Inventory
- Marketplace Intelligence
- Platform Knowledge
- Solution Intelligence
- Optimization
- Branching

The Evidence Engine does not replace them. It attaches provenance, confidence,
verification state, conflicts, and knowledge quality to the facts they use.

## Evidence Model

An evidence record can support any important fact:

- platform detected
- CPU detected
- GPU detected
- supports NVMe adapter
- RTX-class GPU physically fits
- maximum RAM
- PCIe lane layout
- ECC support
- bifurcation support
- power constraint
- community-discovered modification

Each record contains:

- source type
- confidence
- extraction method
- supporting text
- date added
- version
- verification status
- optional platform ID
- subject ID
- related evidence
- related community discoveries

The subject ID is the bridge. A platform knowledge card, constraint, upgrade
opportunity, adapter, parsed field, or reasoning finding can all point to the
same evidence contract.

## Source Types

Supported source categories:

- official documentation
- manufacturer specification
- service manual
- community discovery
- forum
- video
- benchmark
- moderator verified
- user submission
- manual research
- future AI extraction
- future OCR
- future scraper

Each source type has a trust weight. Official documentation, manufacturer specs,
service manuals, and moderator-verified claims start with higher trust. Future
AI, OCR, scraper, and user-submitted claims start lower until reviewed.

## Verification Status

Every evidence record supports:

- unverified
- pending review
- verified
- deprecated
- disputed
- superseded
- archived

The UI displays status beside confidence. This prevents JETS from treating a
verified service-manual claim and a future scraper candidate as equal.

## Provenance

Platform Knowledge now exposes evidence summaries and expandable Evidence
Panels.

Instead of only saying:

```text
Supports PCIe NVMe adapter
```

JETS can say:

```text
Evidence: community confirmations and curated platform fixture
Confidence: high
Verification: verified
Source type: community discovery / manual research
```

Every displayed platform knowledge card, constraint, upgrade opportunity, and
adapter recommendation can show its evidence state. Items without dedicated
records fall back to "pending review" instead of pretending to be verified.

## Conflict Model

JETS preserves conflicting evidence.

Example:

```text
Official demo specification:
P520 maximum RAM is 256 GB.

Community-style report:
Larger configurations may work after BIOS updates.
```

The Evidence Engine keeps both claims, marks the conflict, and explains current
handling. It does not overwrite official knowledge with a community claim, and
it does not delete community discoveries just because they are not verified yet.

## Community Discovery Architecture

Community discoveries are modeled separately from evidence records.

A discovery can describe:

- long GPU fit after removing a drive cage
- bootable NVMe adapter confirmation
- PSU modification requirement
- low-profile GPU trap
- firmware-dependent storage behavior

Moderation is not implemented yet. The current model records moderation state so
future review workflows have a place to land.

## Knowledge Timeline

Every platform can expose knowledge history:

```text
2017 - Platform profile established
2021 - NVMe adapter path confirmed
2024 - Efficient RTX path added
```

This is separate from project audit history. Project audit explains what a user
did. Knowledge history explains how JETS learned or changed a platform claim.

## Knowledge Quality Score

Knowledge Quality is independent from hardware quality or recommendation score.

It measures:

- documentation completeness
- evidence quality
- community validation
- official documentation coverage
- conflict level
- verification level

A platform can be excellent hardware but have weak knowledge quality. Another
platform can be old or slow but very well understood.

## Future Provider Rule

Future providers feed Evidence, not Knowledge directly.

Good:

```text
Manual entry -> Evidence -> review -> Platform Knowledge
Official manual -> Evidence -> review -> Platform Knowledge
CSV import -> Evidence -> review -> Marketplace Intelligence
AI extraction -> Evidence candidate -> moderation -> Knowledge
OCR -> Evidence candidate -> moderation -> Knowledge
Scraper -> Evidence candidate -> compliance review -> Knowledge
```

Bad:

- AI writes platform knowledge directly
- scraper writes recommendations directly
- user submissions mutate verified facts
- conflicting claims overwrite each other
- UI hides source and verification state

## Current Boundaries

v3.1 does not implement:

- live scraping
- marketplace APIs
- AI extraction
- OCR
- image recognition
- checkout
- moderation queues
- persisted evidence tables
- source documents
- user-submitted evidence

The current value is architectural. JETS now has a trust layer that can answer
"why do we believe this?" before the system starts ingesting noisier real-world
data.

## Recommended v3.2

Build persisted evidence review:

- SQL tables for evidence records
- SQL tables for conflicts
- SQL tables for community discoveries
- SQL tables for knowledge timeline
- RLS policies
- moderator review states
- evidence edit history
- parsed-field evidence links from normalized listings
- project and platform evidence audit views

Still do not add AI or live scraping until evidence persistence and review are
stable.
