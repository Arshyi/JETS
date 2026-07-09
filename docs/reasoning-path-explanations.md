# Reasoning Path Explanations

Phase 6.1 surfaces Hardware Reasoning Graph paths inside the normal JETS user
experience.

The graph remains deterministic and curated. This milestone does not add AI,
scraping, OCR, marketplace APIs, checkout, or browser automation.

## Purpose

Reasoning paths answer:

```text
Why does JETS believe this recommendation, warning, task, or strategy?
```

Instead of showing only scores, JETS can now display a relationship path such as:

```text
ThinkStation P510
-> PCIe slot
-> PCIe NVMe adapter
-> NVMe SSD
-> Engineering performance improvement
```

Each displayed path includes:

- node labels
- relationship labels
- confidence
- evidence links when edge evidence exists
- a plain-English explanation

## Architecture

The display layer uses the existing Hardware Reasoning Graph.

```text
Reasoning Graph
-> path traversal
-> path explanation helper
-> reusable "Why JETS thinks this" panel
-> product surfaces
```

The implementation intentionally avoids page-specific explanation logic. UI
components pass graph path IDs into a reusable reasoning panel, and that panel
asks the graph engine to resolve display labels, evidence IDs, confidence, and
plain-English text.

## UX Integrations

Reasoning paths now appear in:

- Strategy cards
- Optimization suggestions
- Acquisition recommendation previews
- Builder validation warnings
- Engineering Action Plan tasks
- Platform Knowledge panels

These surfaces are where users make decisions. The graph report remains useful
for validation, but the product should explain itself in context.

## Validation

`npm run validate:graph` now checks display-path quality in addition to the
Phase 6.0 graph checks.

Display validation fails if a path has:

- broken node references
- broken edge references
- circular display paths
- missing node labels
- missing relationship or reason text
- broken node-to-edge sequence

The generated graph report includes the number of validated display paths.

## Future AI Hooks

Future AI can help summarize a validated path in different reading levels, but
it should not invent graph relationships. AI output should cite reviewed
evidence, then deterministic graph edges can decide whether the explanation is
eligible for product display.

Future confidence sources can include:

- official documentation
- community reports
- live marketplace evidence
- AI extraction after review
- manual moderation

## Current Limitations

- Some graph edges are deterministic rules without direct evidence record links.
- Persisted optimization suggestion rows do not yet store per-suggestion graph
  path IDs, so the UI derives platform-level paths for persisted runs.
- Graph paths are curated static data, not database-backed relationship records.
- The panel does not yet let users report incorrect graph explanations.

Phase 6.1 is the explanation surface, not graph authoring or graph persistence.
