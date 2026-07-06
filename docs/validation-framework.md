# JETS Hardware Knowledge Validation Framework

Version: 3.5

The Hardware Knowledge Validation Framework turns the deterministic engines in
JETS into regression-testable systems before real marketplace data arrives.

It does not implement AI, live scraping, marketplace APIs, OCR, browser
automation, checkout, or production ingestion.

## Purpose

JETS now has enough architecture:

```text
Projects
-> Solution Builder
-> Inventory
-> Marketplace Intelligence
-> Listing Intelligence
-> Evidence
-> Platform Knowledge
-> Solution Intelligence
-> Optimization
-> Branching
```

The next risk is not missing infrastructure. The next risk is untested
reasoning drift.

The validation framework answers:

```text
If a known hardware scenario enters JETS, do the same deterministic engines
still detect, normalize, explain, optimize, and warn in the expected way?
```

## Validation Philosophy

Validation is not a replacement for real users or real listings. It is a guard
rail that lets JETS change rules intentionally.

Golden scenarios should cover:

- known workstation platforms
- office bases
- gaming systems
- AI and engineering workstations
- broken listings
- unknown listings
- low-confidence listings
- duplicate listings
- adapter and hidden-opportunity paths
- incomplete projects
- optimization behavior

If a rule changes, the validation suite should fail until the golden output is
updated deliberately.

## Architecture

Types live in:

- `types/validation-framework.ts`

Scenario packs live in:

- `data/validation/hardware-scenarios.ts`

The regression engine and report renderers live in:

- `lib/validation-framework/engine.ts`

The Node runner lives in:

- `scripts/register-ts.cjs`
- `scripts/validate-hardware-knowledge.cjs`

Generated reports are written to:

- `docs/generated/hardware-validation-report.md`
- `docs/generated/hardware-validation-report.html`

Run the suite with:

```bash
npm run validate:hardware
```

## Scenario Library

The v3.5 pack covers:

- ThinkStation P510
- OptiPlex 7060
- Precision 5820
- HP Z440
- Gaming build
- AI workstation
- Engineering workstation
- Budget office PC
- Broken listing
- Unknown listing
- Low confidence listing
- Duplicate listing

Each scenario defines:

- raw marketplace listing input
- optional project slot selections
- optional optimization input
- expected platform
- expected constraints
- expected recommendation readiness
- expected confidence
- expected solution path
- expected builder issues
- expected solution intelligence findings
- expected importer validation coverage

## Regression Engine

The runner exercises the real deterministic systems:

- Marketplace normalization
- platform detection
- Listing Intelligence
- parsed-field evidence linkage
- duplicate candidate detection
- Platform Knowledge lookup
- Knowledge Quality scoring
- Solution Builder evaluation
- Solution Intelligence
- Optimization
- Compatibility fixtures
- importer validation error coverage

This is intentionally not a mock of the engines. The point is to catch
regressions in the actual code paths the app uses.

## Golden Outputs

Golden outputs are stored inside each scenario. They currently validate:

- platform ID
- marketplace confidence level
- recommendation readiness
- solution path
- modeled platform constraint IDs
- expected builder issue IDs
- expected solution intelligence finding IDs
- expected importer validation error codes
- evidence linkage for parsed fields
- duplicate candidate behavior

The suite should fail when a golden output changes unexpectedly. If the rule
change is intentional, update the scenario expectation in the same change.

## Rule Coverage

The report tracks coverage across:

- Marketplace rules
- Listing rules
- Evidence rules
- Platform rules
- Solution Intelligence rules
- Optimization rules
- Compatibility rules
- Builder rules

Coverage is not yet exhaustive. It is meant to make blind spots visible instead
of pretending the current suite proves everything.

## Confidence Regression

Confidence levels are part of the golden output.

Examples:

- a known ThinkStation should remain high-confidence platform detection
- an unknown listing should stay low-confidence
- a broken listing should remain not-ready
- a thin listing should not become recommendation-ready by accident

This protects JETS from accidentally becoming overconfident as parser aliases
and opportunity rules grow.

## Platform Knowledge Validation

Every platform profile is checked for:

- constraints
- upgrade opportunities
- timeline
- adapter paths
- community knowledge cards
- platform potential
- evidence records
- Knowledge Quality

Incomplete platform knowledge is reported as a warning. Warnings do not fail the
suite yet because several demo profiles intentionally need more evidence.

## Human-Readable Reports

The suite writes both Markdown and HTML reports.

The report includes:

- overall pass/fail
- scenario pass rate
- platform warnings
- compatibility fixture failures
- scenario table
- rule coverage
- platform knowledge validation
- failure details

The generated report is designed for engineering review before changing parser
rules, optimization weights, platform data, or evidence behavior.

## Current Results

The first v3.5 suite passes all 12 hardware scenarios and all compatibility
fixtures.

It reports platform knowledge warnings for profiles with incomplete evidence
coverage. Those warnings are useful: they show where JETS needs sourcing before
real-world decisions become high stakes.

## Boundaries

v3.5 does not implement:

- live scraping
- browser automation
- marketplace APIs
- AI extraction
- OCR
- checkout
- source credentials
- automated marketplace capture
- production benchmark databases

## v4.0 Acquisition Follow-Up

v4.0 builds user-initiated manual capture before scraping.

The next useful milestone should let a user capture or paste a listing into
JETS and run it through the validated pipeline:

```text
User-provided listing
-> Marketplace normalization
-> Listing Intelligence
-> Evidence candidates
-> Platform Knowledge
-> Solution Intelligence
-> Optimization
```

A browser extension can come later in the same direction, but the first version
can be a manual capture page: title, description, price, URL, source, and notes.

That keeps JETS legally and architecturally conservative while moving closer to
real use.

## Recommended v4.1

Persist acquisition records and project links after the manual capture workflow
is tested by real users. Keep scraping, AI, OCR, and marketplace APIs deferred.
