# JETS Marketplace Intelligence

Phase 3 begins the architecture that will eventually feed JETS with real-world
hardware data.

This milestone does not implement live scraping, marketplace APIs, checkout, AI,
OCR, image recognition, or browser automation. It defines the contracts those
future systems must feed.

## Product Rule

Marketplace listings are input, not the product.

The intended pipeline is:

```text
Raw Marketplace Data
-> Listing Intelligence
-> Evidence
-> Platform Knowledge
-> Strategy
-> Builder
-> Solution Intelligence
-> Optimization
-> Recommendation
```

The ingestion layer should know nothing about optimization.

The optimizer should know nothing about scraping.

## Architecture

Marketplace Intelligence lives in:

- `types/marketplace-intelligence.ts`
- `data/mock-marketplace-intelligence.ts`
- `lib/marketplace-intelligence/normalize.ts`
- `components/marketplace-intelligence/marketplace-intelligence-demo.tsx`

The current demo is rendered on `/sources` alongside the older dry-run source
health panel. That is intentional: source health remains operational plumbing;
Marketplace Intelligence is the normalization and reasoning-entry contract.

Version 3.1 adds Evidence as the trust boundary after normalization. Parsed
fields can carry evidence IDs, extraction method, and verification status when
future providers are connected.

Version 3.2 persists the review infrastructure behind that boundary. Parsed
marketplace facts can now be linked through `parsed_field_evidence_links` before
they are allowed to strengthen platform knowledge or recommendation reasoning.

Version 3.3 adds Listing Intelligence as the review layer for a specific
listing. Normalized listings can now be persisted, parsed fields can be reviewed
or corrected, duplicate candidates can be inspected, and recommendation
readiness can be previewed before any listing becomes project input.

Version 3.4 adds importer fixtures. Fixture rows are controlled raw listing
snapshots used to validate parser behavior, seed Listing Intelligence into
Supabase, generate parsed-field evidence, and record duplicate decisions without
building live ingestion.

Version 3.5 adds the Hardware Knowledge Validation Framework. Marketplace
normalization, platform detection, listing readiness, parsed-field evidence,
platform knowledge, solution intelligence, optimization, compatibility, and
builder validation now run against golden hardware scenarios.

Version 4.0 adds Manual Acquisition. Users can manually capture a listing from
any source and feed the same Marketplace Intelligence pipeline without scraping,
browser automation, APIs, OCR, or AI.

Phase 4.2 connects saved acquisitions into Solution Builder through reviewed
handoff. Phase 4.3 adds Strategy before that handoff so a captured listing can
become a project, feed a hybrid path, remain evidence only, or become a
walk-away decision.

## Source Adapters

Every future source should become an adapter that produces raw listing input.

Planned source families:

- Dubizzle
- Facebook Marketplace
- eBay
- Kijiji
- Craigslist
- Yahoo Auctions
- Mercari
- Amazon Renewed
- Newegg
- local computer stores
- CSV imports
- manual entry
- future APIs

Current adapters are demo definitions only. They document access mode,
compliance posture, and stage. They do not make network requests.

## Normalized Listing Model

The normalized model separates:

- marketplace metadata
- seller metadata
- hardware metadata
- price
- location
- condition
- description
- images
- platform detection
- detected components
- confidence
- health
- opportunities
- possible futures

Marketplace-specific fields stay inside `raw.marketplaceSpecific`. They should
not leak into Builder, Platform Knowledge, Solution Intelligence, Optimization,
or Recommendations.

## Parser Architecture

The deterministic parser supports:

- title parsing
- description parsing
- known model aliases
- platform aliases
- CPU aliases
- GPU aliases
- RAM parsing
- storage parsing
- operating system hints
- generation hints

Future parser hooks are represented but not implemented:

- OCR
- image recognition
- barcode lookup
- API-provided structured fields
- LLM extraction

Unknown fields remain unknown. JETS must never invent hardware data.

## Platform Detection

Platform detection maps listing text to known platform profiles.

Example:

```text
Dell Precision 5820 Xeon W 32GB P2000
-> Dell Precision 5820
-> confidence: high
```

Detected platform IDs connect into the existing Platform Knowledge Engine. If a
platform is not detected, the listing can still be normalized, but platform
opportunities stay low-confidence.

## Confidence Engine

Each parsed field carries:

- value
- confidence
- source
- optional evidence IDs
- optional extraction method
- optional verification status

Examples:

- GPU: RTX 3060, confidence high, source listing title
- RAM: 32 GB, confidence medium, source listing description
- OS: unknown, confidence low, source listing description

Overall listing confidence is derived from parsing confidence, platform
detection, and listing health.

Current confidence sources are deterministic demo signals. Future confidence may
come from official documentation, community reports, live scraping, AI
extraction, and manual moderation, but those sources must feed the same shape.

The Evidence Engine answers a different question from parser confidence. Parser
confidence says "the text looks like a GPU." Evidence says "where did this claim
come from, how was it extracted, and has it been verified?"

v3.2 persists that distinction:

- `evidence_records` stores the claim and provenance.
- `evidence_sources` stores source metadata and trust weight.
- `parsed_field_evidence_links` connects a normalized listing field path to a reviewable evidence record.
- `evidence_review_notes` records review actions and reasons.

v3.3 connects that evidence model to persisted listings:

- `normalized_marketplace_listings` stores the raw and normalized listing snapshot.
- `listing_parsed_fields` stores reviewable parser output by field path.
- `listing_field_corrections` records manual before/after corrections.
- `listing_duplicate_candidates` stores deterministic duplicate signals.
- `listing_review_events` records listing-level audit events.

v3.4 adds importer run logs:

- `importer_fixture_runs` stores dry-run/import summaries.
- `importer_fixture_run_items` stores per-fixture created, updated, skipped, or error results.

## Marketplace Health

Every normalized listing exposes:

- completeness
- missing information
- estimated reliability
- description quality
- photo count
- parsing confidence
- community knowledge availability

This lets JETS avoid treating a vague listing and a fully specified listing as
equally trustworthy.

## Marketplace Opportunity

After normalization, detected platforms connect to Platform Knowledge.

For example, a ThinkStation P520 listing can surface:

- PCIe NVMe adapter path
- ECC memory expansion
- RTX upgrade path
- 10Gb networking
- local AI suitability
- Platform Potential

Marketplace Intelligence does not decide the best build. It prepares normalized
evidence for Strategy, Builder, Solution Intelligence, and Optimization.

## Upgrade Preview

Every normalized listing can expose possible futures:

- Engineering Workstation
- Gaming PC
- Local AI
- Home Server
- General Purpose System

Each future path points into the layer that should reason about it:

- Platform Knowledge
- Solution Intelligence
- Optimization

## Layer Separation

Strict direction:

```text
Marketplace
-> Normalization
-> Evidence
-> Knowledge
-> Strategy
-> Builder
-> Reasoning
-> Optimization
-> Recommendation
```

Do not bypass layers.

Bad:

- scraper writes optimization decisions
- optimizer reads raw marketplace HTML
- platform knowledge stores source-specific marketplace fields
- UI treats raw listings as finished recommendations

Good:

- source adapter produces raw listing input
- importer fixture produces controlled raw listing input before live source access exists
- parser normalizes fields with confidence
- parser attaches evidence candidates when available
- platform detection links to platform knowledge
- evidence review decides whether parsed facts can strengthen trusted knowledge
- listing intelligence decides whether this specific listing is ready for recommendation preview
- strategy decides whether a listing deserves a project or should be deferred
- solution intelligence explains tradeoffs
- optimizer uses normalized, reasoned project data
- recommendation explains the final choice

## Demo Import

The demo data includes:

- Dell Precision
- ThinkStation
- OptiPlex
- Mac Pro
- Gaming PC
- Laptop
- Mini PC

The `/sources` demo shows:

```text
Raw Listing
-> Normalized Listing
-> Detected Platform
-> Knowledge
-> Recommendation Path
```

The `/admin/importer-fixtures` workspace shows:

```text
Fixture Row
-> Validation
-> Dry Run
-> Seed Listing
-> Parsed Field Evidence
-> Listing Review
```

The validation suite shows:

```text
Golden Scenario
-> Marketplace Normalization
-> Listing Intelligence
-> Evidence Linkage
-> Platform Knowledge
-> Solution Intelligence
-> Optimization
-> Validation Report
```

Run it with:

```bash
npm run validate:hardware
```

The `/acquire` workspace shows:

```text
Manual Listing
-> Raw Marketplace Shape
-> Normalized Listing
-> Parsed Fields
-> Evidence
-> Listing Intelligence
-> Recommendation Preview
-> Strategy
-> Project Handoff
```

Manual acquisition is not a separate marketplace system. It is one capture
method that produces the same raw listing contract as future fixtures, CSV,
browser extension payloads, APIs, OCR, or approved ingestion.

Phase 4.1 persists manual acquisition records after that normalization step.
The persisted record stores raw payload, normalized payload, analysis snapshot,
readiness, confidence, preview score, corrections, notes, decisions, compare
sets, and optional project links. This keeps acquisition as a user-owned review
workflow while Marketplace Intelligence remains the source-normalization layer.

Phase 4.3 reads saved acquisitions as strategy inputs. The Strategy Engine does
not scrape, parse, or mutate marketplace data. It compares hardware paths such
as used workstation, repair candidate, mini PC, laptop plus eGPU, hybrid, build
from scratch, upgrade existing machine, and wait for better value before the
user creates or updates a project.

## Future Work

Before live ingestion:

- prove persisted manual acquisition is useful with real users
- harden strategy-guided handoff from saved acquisitions into slot-level builder context
- add source-specific policy reviews
- add adapter and source fixture tests
- add source attribution and takedown workflow
- add conflict handling between sources
- add evidence links for platform claims
- add source-specific importer regression tests
- add duplicate merge preview

Only after those foundations should JETS consider marketplace APIs, OCR, image
recognition, LLM extraction, or carefully approved scraping. A browser extension
should start as user-initiated capture that feeds the same Listing Intelligence
and Evidence pipeline.
