# JETS Evidence Engine

Version 3.1 added the Evidence Engine foundation. Version 3.2 moves that
architecture into database-backed review infrastructure.

This is not live scraping, marketplace APIs, AI extraction, OCR, image
recognition, checkout, or automated moderation. It is the persistence and review
foundation future providers must feed.

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
- `lib/supabase/evidence-queries.ts`
- `lib/supabase/evidence-actions.ts`
- `components/evidence/evidence-review-ui.tsx`
- `supabase/migrations/202607060001_v3_2_evidence_review.sql`

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

## Persisted Review Schema

v3.2 adds these Supabase tables:

- `evidence_sources`
- `evidence_records`
- `evidence_conflicts`
- `evidence_timeline_events`
- `evidence_review_notes`
- `parsed_field_evidence_links`

The schema records:

- who submitted evidence
- who reviewed evidence
- what changed
- when it changed
- why it changed
- source type
- confidence
- extraction method
- supporting text
- verification status
- parsed field links
- conflict state
- platform timeline events

The static demo evidence still exists as a fallback. Persisted rows take
priority, and demo rows remain visible until equivalent database rows exist.

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

## RLS And Review Rules

The v3.2 migration adds RLS policies:

- anyone can read public reviewed evidence
- signed-in users can submit pending evidence records and sources
- signed-in users can read their own pending submissions
- moderators can update sources, records, conflicts, timeline events, and parsed-field links
- review notes preserve the audit trail

Supabase RLS can recognize moderators through JWT metadata roles:

```text
app_metadata.role = admin | moderator
user_metadata.role = admin | moderator
app_metadata.roles contains admin | moderator
```

The app also supports the existing server-side `JETS_ADMIN_EMAILS` allowlist.
When that allowlist is used, moderation writes require
`SUPABASE_SERVICE_ROLE_KEY` and are gated by server actions.

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

Evidence review UI now lives at:

- `/evidence`
- `/evidence/review`
- `/evidence/conflicts`
- `/evidence/[recordId]`
- `/evidence/platforms/[platformId]`

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

v3.2 does not implement:

- live scraping
- marketplace APIs
- AI extraction
- OCR
- image recognition
- checkout
- automated moderation
- source document storage
- bulk evidence import
- persisted normalized marketplace listings
- automatic promotion of evidence into platform knowledge

The current value is review infrastructure. JETS can now persist, inspect, and
moderate evidence records before the system starts ingesting noisier real-world
data.

## Recommended v3.3

Build evidence-backed normalized listing persistence:

- persisted normalized marketplace listing candidates
- adapter fixture tests
- parsed-field evidence link generation
- evidence seeding workflow for demo records
- source attribution and correction workflow
- conflict review for listing facts
- removal/takedown workflow
- moderation queue for parsed marketplace facts

Still do not add AI or live scraping until evidence-backed listing persistence
and review are stable.
