# Knowledge Expansion Framework

Phase 6.2 expands JETS by making the existing hardware knowledge stack deeper,
not wider.

This milestone does not add AI, scraping, OCR, browser automation, checkout, or
marketplace APIs.

## Goal

JETS should get better because it knows more verified workstation engineering
facts and relationships.

The architecture remains:

```text
Evidence
-> Platform Knowledge
-> Platform Encyclopedia
-> Hardware Reasoning Graph
-> Reasoning Paths
-> Strategy
-> Projects
-> Action Plans
-> Validation
```

Phase 6.2 adds a reusable data model for growing that knowledge without
rewriting product workflows.

## Expansion Model

Knowledge expansion facts live outside UI code. They can be added as structured
data for platforms or component families.

A fact stores:

- subject type
- subject ID
- section
- title
- summary
- details
- evidence IDs
- verification state
- confidence
- Knowledge Quality score

The initial section set covers:

- firmware
- BIOS revisions
- power topology
- thermals
- memory training
- PCIe bandwidth
- lane sharing
- boot behavior
- noise
- known bugs
- replacement parts
- known repairs
- community discoveries
- electrical limitations

## Platform Depth

Every supported workstation platform now receives a generated depth scaffold
across those sections.

The current supported workstation platforms are:

- Lenovo ThinkStation P520
- Lenovo ThinkStation P510
- Dell Precision T5810
- Dell Precision 5820
- Dell OptiPlex 7060 SFF
- HP Z440
- HP Z840
- Mac Pro 5,1

The point is not that every fact is final. The point is that every platform now
has a structured place for engineering facts that can be verified, improved, or
replaced later.

## Component Knowledge

Phase 6.2 also adds component-family knowledge entries for:

- CPU
- GPU
- RAM
- PSU
- Storage
- PCIe adapters
- NICs
- HBAs
- Cooling

These entries describe engineering behavior that is broader than one listing:
power connector risk, memory population, bootability, cooling validation,
adapter paths, NIC/HBA heat and lane usage, and PSU cable reality.

## Relationship Density

The Hardware Reasoning Graph now supports additional relationship types:

- `works_better_with`
- `usually_requires`
- `commonly_upgraded_with`
- `shares_failure_mode`
- `shares_repair_path`
- `thermal_conflict`
- `power_conflict`

These relationships make the graph less like a checklist and more like an
engineering map. They are still deterministic and curated.

## Knowledge Metrics

Validation now tracks:

- supported workstation platforms
- platform facts
- total facts
- average facts per platform
- platform relationships
- average relationships per platform
- evidence-backed facts
- evidence coverage
- verified facts
- verification coverage
- Knowledge Quality score
- graph nodes
- graph edges

These are better product-health metrics than raw commit count.

## Validation

Run:

```bash
npm run validate:hardware
npm run validate:graph
```

Hardware validation warns when knowledge density, relationship density, evidence
coverage, verification coverage, or Knowledge Quality falls below the configured
thresholds.

Graph validation requires every supported relationship type to appear and still
checks duplicate edges, orphan nodes, broken references, circular `requires`
paths, fixture paths, and display paths.

## Current Limitations

- Expansion facts are still curated demo data.
- Component-family knowledge is not yet evidence-rich.
- Some facts are pending review by design.
- There is no authoring UI for new facts.
- There is no graph persistence or moderation workflow for relationships.

Phase 6.2 deliberately avoids another dashboard. The value is that JETS has a
repeatable way to get smarter about workstation hardware.
