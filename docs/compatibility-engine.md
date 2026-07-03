# JETS Compatibility Engine

Version 0.6 adds deterministic compatibility checks. It does not use AI, live scraping, checkout, or hidden marketplace data.

The engine evaluates typed hardware profiles through reusable rule objects. UI components render reports only; compatibility decisions live in `lib/compatibility-engine/rules.ts`.

## Files

- `types/compatibility.ts`: component, rule, result, report, and suggestion types.
- `data/compatibility/profiles.ts`: mock compatibility profiles for current listings.
- `data/compatibility/validation-fixtures.ts`: deterministic fixtures for expected compatibility outcomes.
- `lib/compatibility-engine/rules.ts`: reusable compatibility rule objects.
- `lib/compatibility-engine/engine.ts`: report generation and summary scoring.
- `lib/compatibility-engine/suggestions.ts`: upgrade suggestion mapping.
- `components/compatibility`: report, badge, health, result, fixture, and suggestion UI.
- `/compatibility`: compatibility report page.

## Status Model

Every rule result returns:

- Status: `Compatible`, `Compatible with Warning`, or `Incompatible`.
- Confidence: 0-100%.
- Reason: human-readable explanation.
- Optional score: 0-100 when the rule produces a quantitative signal.

## Rule Categories

- CPU to motherboard socket and generation compatibility.
- GPU to motherboard PCIe compatibility.
- GPU length to chassis clearance.
- GPU height and slot thickness to chassis clearance.
- PSU wattage headroom.
- PSU connector availability.
- RAM type compatibility.
- RAM capacity limits.
- RAM slot availability.
- Storage interface compatibility.
- M.2 slot availability.
- SATA port availability.
- CPU cooler clearance.
- Case airflow estimate.
- Thermal risk estimate.
- Upgrade path score.
- BIOS generation risk.
- Platform age score.

## Report Summary

The report combines all rule results into:

- overall compatibility status
- average confidence
- compatible, warning, and incompatible counts
- platform health score
- platform age score
- thermal risk label
- upgrade path score
- upgrade suggestions

## Deterministic Fixtures

The v0.6 fixtures cover:

- valid gaming PC
- invalid GPU fit
- insufficient PSU
- unsupported RAM
- full storage ports
- workstation upgrade
- laptop plus eGPU example

These fixtures are meant to catch obvious regressions before the engine is connected to richer data.

## Boundaries

- No AI.
- No live scraping.
- No checkout.
- No automatic purchase recommendation.
- No claim that a listing is actually available.
- No compatibility checks inside UI components.

## v0.9 Direction

The compatibility engine now feeds restorable v0.8 Build Generator snapshots. The next durable layer should add a shared decision audit model so compatibility changes, status updates, and notes can be traced over time.
