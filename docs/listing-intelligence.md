# JETS Listing Intelligence

Version: 3.3

Listing Intelligence turns an individual listing into an engineering object.

It does not fetch listings. It does not scrape. It does not use AI. It does not
use OCR. It does not call marketplace APIs.

It receives representative demo listings or manual listing snapshots and decides
whether each parsed fact is ready to influence JETS reasoning.

## Product Role

Marketplace Intelligence answers:

```text
Can JETS normalize this raw listing shape?
```

Listing Intelligence answers:

```text
Can JETS trust this specific listing enough to preview recommendations?
```

The intended pipeline is:

```text
Raw Listing
-> Listing Intelligence
-> Evidence
-> Platform Knowledge
-> Solution Intelligence
-> Optimization
-> Recommendation
```

Search and Inventory remain supporting surfaces. Listing Intelligence is a
review layer between raw marketplace input and trusted hardware reasoning.

## What Gets Persisted

The v3.3 migration creates:

- `normalized_marketplace_listings`
- `listing_parsed_fields`
- `listing_field_corrections`
- `listing_duplicate_candidates`
- `listing_review_events`

These tables preserve:

- marketplace and listing ID
- raw title and description
- price, currency, location, seller, condition, and image references
- normalized platform ID
- detected components
- evidence record IDs
- parsing confidence
- listing health
- listing status
- recommendation readiness
- parsed field review states
- human corrections
- duplicate signals
- review event history

## Review States

Listings use the shared moderation language:

- unverified
- pending review
- verified
- disputed
- deprecated
- superseded
- archived

Parsed fields can be:

- pending review
- accepted
- rejected
- corrected
- unknown

This distinction matters. A listing can be pending review while some fields are
already accepted and others are unknown.

## Parsed Field Review

Every important parsed field becomes reviewable:

- price
- location
- seller
- platform
- CPU
- GPU
- RAM
- storage
- operating system
- condition

Reviewers can:

- accept the parser value
- reject the parser value
- correct the parser value
- mark the field unknown

Unknown is a valid output. JETS should never invent hardware when the listing
does not support the claim.

## Correction Architecture

Corrections are not silent overwrites.

When a reviewer corrects a field:

1. `listing_parsed_fields` stores the corrected value and review state.
2. `listing_field_corrections` preserves before value, after value, reason, and reviewer.
3. `evidence_records` gets a moderator-verified correction claim.
4. `parsed_field_evidence_links` connects the listing field path to that evidence record.
5. `listing_review_events` records the audit event.

That means a typo such as:

```text
Parser: RTX 3070
Reviewer: RTX 3060 Ti
Reason: Seller title typo; description says 3060 Ti.
```

becomes evidence, not just mutable state.

## Listing Health

Listing Health is deterministic and intentionally simple.

It measures:

- information completeness
- photo quality
- parsing confidence
- evidence quality
- marketplace quality
- description quality
- missing fields
- unknown hardware

The score is not a final recommendation score. It is a trust signal that says
whether the listing is healthy enough to continue through the pipeline.

## Duplicate Detection

Duplicate detection is deterministic and reviewable.

Current signals include:

- same marketplace ID
- same description
- same seller
- same platform
- same CPU
- same GPU

Candidates are classified as:

- likely duplicate
- possible duplicate
- distinct

No automatic merge happens in v3.3.

## Recommendation Readiness

Every listing receives a Recommendation Readiness state:

- Ready
- Needs review
- Not ready

Reasons include:

- missing GPU
- missing CPU
- missing storage
- unknown platform
- low parser confidence
- conflicting or disputed evidence

Ready does not mean "buy this." It means the listing has enough reviewed shape
to preview how it might enter Platform Knowledge, Solution Intelligence, and
Optimization.

## Recommendation Preview

The listing detail view previews:

- potential score
- platform potential
- listing health
- solution intelligence claims
- upgrade opportunities
- adapter recommendations
- readiness reasons

This is not project creation. It is a pre-project review surface that helps JETS
decide whether the listing is worth using as an input.

## Future Ingestion Hooks

v3.3 prepares interfaces for future producers:

- scraper
- browser extension
- CSV import
- manual entry
- marketplace API
- OCR
- AI extraction

All future producers should write raw listing snapshots into Listing
Intelligence. None should write trusted knowledge or final recommendations
directly.

## RLS Model

The migration uses Supabase RLS:

- public users can read public reviewed listings
- signed-in users can submit pending manual listing snapshots
- signed-in users can read their own pending submissions
- moderators can update listing status and parsed field reviews
- corrections and review events preserve who changed what and why

Moderator actions require the app-level admin allowlist and service role key:

```text
JETS_ADMIN_EMAILS
SUPABASE_SERVICE_ROLE_KEY
```

## Current Boundaries

v3.3 does not implement:

- live scraping
- browser automation
- marketplace APIs
- OCR
- AI extraction
- checkout
- automatic recommendation creation
- automatic duplicate merging
- bulk import

The value of this milestone is the review contract. Once real producers arrive,
they can all feed the same normalized listing and evidence pipeline.

## Recommended v3.4

Build importer fixtures and seeding:

- deterministic fixture tests for each planned source family
- seeded demo listing import into Supabase
- bulk parsed-field evidence link generation
- importer validation errors
- source attribution and takedown notes
- duplicate review actions

Still do not add live scraping or AI until listing review, correction, and
evidence linking are stable.
