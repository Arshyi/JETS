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

Version 3.4 adds importer fixture run logs:

- `importer_fixture_runs`
- `importer_fixture_run_items`

Those tables preserve dry-run and seed-import summaries before any live source
connectors exist.

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

## Importer Fixture Seeding

v3.4 adds an admin-only fixture importer at `/admin/importer-fixtures`.

The importer can:

- validate fixture rows
- dry-run fixture results
- seed demo/manual listings into Supabase
- create or update Listing Intelligence records
- create parsed fields
- create or link evidence for every parsed field
- create duplicate candidates
- record importer run summaries

Fixture validation catches:

- missing title
- missing price
- unsupported marketplace
- invalid currency
- low-confidence platform detection
- duplicate external ID

This is still not live ingestion. Fixtures are local representative rows.

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

v3.4 does not implement:

- live scraping
- browser automation
- marketplace APIs
- OCR
- AI extraction
- checkout
- automatic recommendation creation
- automatic duplicate merging
- bulk import

The value of v3.3 was the review contract. The value of v3.4 is controlled
seeding into that contract. Once real producers arrive, they should behave like
fixture producers first.

## v3.5 Validation Framework

v3.5 adds a Hardware Knowledge Validation Framework around Listing
Intelligence and the surrounding deterministic engines.

The validation suite verifies that known listing scenarios still produce the
expected:

- platform detection
- parsed fields
- evidence linkage
- duplicate candidates
- Recommendation Readiness
- confidence levels
- solution paths

Run:

```bash
npm run validate:hardware
```

That validation work set up the next product move: user-initiated manual
capture before live scraping. Captured listings should enter Listing
Intelligence as reviewable records before they influence projects or
recommendations.

## v4.0 Manual Acquisition

v4.0 adds `/acquire`, a manual workflow for evaluating hardware the user found
outside JETS.

Acquisition uses Listing Intelligence this way:

```text
User-provided listing facts
-> Raw listing contract
-> Normalized fields
-> Parsed-field evidence
-> Recommendation Readiness
-> Save, reject, archive, purchase, or create project
```

The user can correct CPU, GPU, RAM, platform, price, and storage before saving.
Those corrections are represented as user-submitted evidence in the acquisition
preview. They do not silently replace parser output.

The current acquisition records are browser-local. Persisted acquisition tables
should come after the manual workflow proves useful.
