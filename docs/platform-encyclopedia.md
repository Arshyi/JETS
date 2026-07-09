# JETS Platform Encyclopedia

Phase 5.3 adds the Platform Encyclopedia.

This is not AI, live scraping, browser automation, marketplace APIs, OCR, or
checkout. It is a deterministic engineering knowledge layer built from curated
demo data and existing evidence links.

## Purpose

Platform Knowledge answers:

```text
What is this platform?
```

The Platform Encyclopedia answers:

```text
What should an experienced engineer know about this platform?
```

Playbooks answer:

```text
What should a builder do with that knowledge?
```

The Hardware Reasoning Graph answers:

```text
How do these facts relate across multiple hops?
```

That separation matters. A platform profile can summarize a ThinkStation P520.
The encyclopedia can describe memory topology, PCIe topology, power behavior,
storage paths, cooling zones, reliability issues, and workload fit. A playbook
can then turn those facts into project recommendations without duplicating the
engineering reference material.

## Architecture

Domain types live in:

- `types/platform-encyclopedia.ts`

Curated demo encyclopedia entries live in:

- `data/platform-encyclopedia.ts`

Lookup, summary, reference, and validation helpers live in:

- `lib/platform-encyclopedia.ts`

Reusable UI lives in:

- `components/platform-knowledge/platform-encyclopedia-summary.tsx`

The Platform Knowledge panel now shows encyclopedia coverage when a recognized
platform exists:

- diagrams
- fact count
- provenance quality
- memory, power, storage, and cooling topology
- upgrade paths
- reliability notes
- workload suitability

## Model

Each encyclopedia entry can include:

- overview
- platform revisions
- chipset
- CPU support
- memory topology
- PCIe topology
- storage topology
- power system
- cooling
- firmware and BIOS
- known limitations
- hidden capabilities
- repair notes
- common failures
- lifecycle
- community discoveries
- upgrade encyclopedia
- reliability profile
- workload profiles

The model is intentionally more detailed than `PlatformKnowledgeProfile`, but it
still does not become a free-form wiki. Facts are structured, typed, and linked
to evidence, verification state, Knowledge Quality, slots, adapters, playbooks,
and strategy types.

## Structured Diagrams

Phase 5.3 supports metadata-only engineering diagrams.

Current diagram types include:

- PCIe lane map
- memory channel layout
- drive bays
- power connectors
- expansion slots
- thermal zones

The current demo entries generate PCIe, memory, power, and thermal metadata for
recognized platforms. These diagrams are not images. They are structured nodes
and edges that future UI, validation, Action Plans, and AI review can cite.

## Upgrade Encyclopedia

Each platform encyclopedia records upgrade context such as:

- maximum RAM
- maximum storage
- known adapter paths
- PCIe bifurcation stance
- NVMe adapter support
- ECC compatibility
- GPU limitations
- power upgrade paths
- cooling upgrade paths

This keeps hidden upgrade paths in one reusable place. Playbooks and Action
Plans reference the encyclopedia instead of rewriting the same NVMe, PSU, GPU,
or cooling note in multiple engines.

## Reliability Knowledge

Reliability data includes:

- common failures
- failure frequency signals
- repair difficulty
- replacement availability
- typical service life
- firmware issues

The current curated data is representative. Before production hardware claims
become authoritative, entries should be promoted through evidence review and
moderation.

## Workload Profiles

The encyclopedia describes suitability for:

- engineering
- gaming
- AI
- rendering
- virtualization
- NAS
- home server
- office
- education

Suitability is qualitative, not fake precision. The intended language is
`poor`, `limited`, `acceptable`, `strong`, or `excellent`, with reasons and
caveats.

## Provenance

Every encyclopedia fact can link to:

- evidence records
- verification state
- Knowledge Quality
- related playbooks
- related strategies
- related adapter paths
- related builder slots

Future sources should feed Evidence first. The encyclopedia should not accept
unreviewed scraper, OCR, user-submitted, or AI-extracted claims directly.

## Integration

The current knowledge stack is:

```text
Evidence
-> Platform Knowledge
-> Platform Encyclopedia
-> Hardware Reasoning Graph
-> Hardware Playbooks
-> Strategy
-> Builder
-> Action Plans
-> Optimization
```

Platform Knowledge remains the summary layer.

Platform Encyclopedia becomes the durable engineering reference.

Playbooks reference encyclopedia sections when they turn platform knowledge into
builder guidance.

Strategy references encyclopedia sections when a recognized acquisition or
platform affects the recommended path.

Action Plans reference encyclopedia sections when project tasks are generated
from slot-specific platform knowledge.

## Validation

Run:

```bash
npm run validate:hardware
```

The hardware validation suite now warns if a supported platform is missing:

- memory topology
- power topology
- storage guidance
- upgrade paths
- reliability data
- workload profiles

The suite also tracks platform encyclopedia coverage in the generated validation
report.

## Knowledge Expansion

Phase 6.2 adds a Knowledge Expansion Framework on top of the encyclopedia.

The encyclopedia now receives structured expansion facts for every supported
platform across:

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

These facts live as data and are folded into `PlatformEncyclopediaEntry.facts`.
That keeps Platform Knowledge as the summary, Platform Encyclopedia as the
engineering reference, and the Reasoning Graph as the relationship layer.

Validation now reports fact density, relationship density, evidence coverage,
verification coverage, Knowledge Quality, graph nodes, and graph edges. See
`docs/knowledge-expansion.md`.

## Current Demo Platforms

Phase 5.3 creates encyclopedia entries for the existing supported Platform
Knowledge profiles:

- Lenovo ThinkStation P520
- Lenovo ThinkStation P510
- Dell Precision T5810
- Dell Precision 5820
- Dell OptiPlex 7060 SFF
- HP Z440
- HP Z840
- Mac Pro 5,1

## Current Boundaries

Phase 5.3 does not:

- verify new hardware claims from the internet
- ingest manuals automatically
- generate diagram images
- replace compatibility checks
- replace playbooks
- change project slots automatically
- use AI

The value is architectural: JETS now has one place for deep platform knowledge
that Playbooks, Strategy, Action Plans, Validation, and future AI-assisted review
can all cite.
