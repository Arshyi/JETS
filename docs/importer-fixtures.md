# JETS Importer Fixtures

Version: 3.4

Importer Fixtures turn Listing Intelligence into a controlled ingestion testbed.

They do not implement live scraping, browser automation, marketplace APIs, AI,
OCR, or checkout.

Fixtures are representative raw listing snapshots that let JETS test validation,
normalization, evidence creation, duplicate handling, and Listing Intelligence
review without touching real marketplace systems.

## Purpose

The fixture pipeline answers:

```text
If a raw listing arrives later, can JETS safely validate, normalize, seed,
evidence-link, and review it?
```

The intended flow is:

```text
Fixture row
-> Validation
-> Deterministic parser
-> Listing Intelligence record
-> Parsed field evidence
-> Duplicate candidates
-> Admin review workspace
```

## Fixture Source Types

Fixtures use explicit source types:

- `demo-marketplace-fixture`
- `manual-seed-fixture`
- `validation-error-fixture`

The source type describes how the test row entered JETS. It is not a live
marketplace connector.

## Fixture Sets

Current fixture sets live in `data/importer-fixtures.ts`:

- `core-demo-listings`
- `validation-error-listings`

The core set uses representative demo marketplace listings. The validation set
intentionally includes bad rows so the admin UI can show error reporting.

## Validation

The fixture engine validates:

- missing title
- missing price
- unsupported marketplace
- invalid currency
- low-confidence platform detection
- duplicate external ID

Rows with validation errors are not seeded.

## Dry-Run Mode

Dry-run mode:

- validates fixtures
- parses valid rows
- compares listing keys against existing Supabase rows when service role is available
- records an importer fixture run
- records item-level results
- does not create or update Listing Intelligence records
- does not create evidence records

Dry-run exists so admins can see what would happen before seeding.

## Import Mode

Import mode:

- validates fixtures
- skips invalid rows
- creates or updates `normalized_marketplace_listings`
- upserts `listing_parsed_fields`
- creates or links `evidence_records`
- upserts `parsed_field_evidence_links`
- upserts duplicate candidates
- records `listing_review_events`
- records importer run summaries and item results

The admin UI lives at `/admin/importer-fixtures`.

## Import Run Tables

The v3.4 migration adds:

- `importer_fixture_runs`
- `importer_fixture_run_items`

Run summaries include:

- fixture count
- created count
- updated count
- skipped count
- error count
- mode
- fixture set
- app version
- admin user

Run items include:

- fixture key
- marketplace
- external ID
- listing key
- normalized listing ID
- result status
- validation error codes
- message

## Evidence Generation

Every parsed field creates or links evidence.

For each parsed field:

1. JETS builds a stable subject ID:

```text
<listing-key>:<field-path>
```

2. JETS looks for an existing `evidence_records` row for that subject.
3. If none exists, JETS creates a pending evidence record.
4. JETS links the evidence through `parsed_field_evidence_links`.
5. JETS stores the field-specific evidence ID on `listing_parsed_fields`.
6. JETS stores the listing-level aggregate evidence IDs on `normalized_marketplace_listings`.

Evidence includes:

- source title
- source type
- source URL when present
- confidence
- extraction method
- supporting text
- platform ID when detected
- fixture metadata

Current extraction method is `deterministic-parser`.

## Duplicate Review

Duplicate candidates can be reviewed from `/listing-intelligence/duplicates`.

Actions:

- mark duplicate
- mark distinct
- merge candidate later

The merge action is a placeholder. It records intent and audit history but does
not merge records.

Duplicate decisions update `listing_duplicate_candidates` and create
`listing_review_events`.

## Admin Requirements

Importer fixture actions require:

- Supabase configured
- v3.2, v3.3, and v3.4 migrations applied
- `SUPABASE_SERVICE_ROLE_KEY`
- admin email in `JETS_ADMIN_EMAILS`

Without those, the UI still shows local dry-run previews, but actions remain
disabled.

## Boundaries

v3.4 does not implement:

- live scraping
- browser automation
- marketplace APIs
- AI extraction
- OCR
- checkout
- real source credentials
- automatic project creation
- automatic duplicate merging

## v3.5 Validation Framework

v3.5 promotes importer fixtures into a broader Hardware Knowledge Validation
Framework. The validation suite checks importer validation error coverage
alongside Marketplace Intelligence, Listing Intelligence, Evidence, Platform
Knowledge, Solution Intelligence, Optimization, Compatibility, and Builder
behavior.

Run:

```bash
npm run validate:hardware
```

## Recommended v3.6

Add user-initiated manual capture before live scraping:

- manual capture form for title, description, price, source, URL, and notes
- fixture-backed validation before saving captured rows
- Listing Intelligence review for every captured listing
- source attribution and user-submitted evidence
- duplicate review before project use
- optional browser extension foundation later

Live ingestion should wait until fixture coverage proves the review pipeline is
stable.
