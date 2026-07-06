# JETS Solution Intelligence Engine

Version 2.6 adds the Solution Intelligence Engine.

This is not AI, live scraping, marketplace APIs, checkout, or a new data source.
It is a deterministic reasoning layer that combines the project model,
compatibility output, component inventory, platform knowledge, and budget context
into one complete-system explanation.

## Purpose

Users should not have to mentally combine:

- CPU
- GPU
- RAM
- PSU
- platform
- cooling
- budget
- use case

JETS should explain whether the system works, what limits it, which upgrades
matter, and which tradeoffs are worth making.

## Architecture

Domain types live in:

- `types/solution-intelligence.ts`

The deterministic reasoning engine lives in:

- `lib/solution-intelligence/engine.ts`

The project UI lives in:

- `components/solution-intelligence/solution-intelligence-panel.tsx`

The project detail page calls:

- `analyzeBuildSolution(model)`

The engine consumes the existing `BuildWorkspaceModel`. It does not duplicate
inventory, compatibility, platform knowledge, or optimization persistence.

Phase 3 Marketplace Intelligence can eventually feed this model through
normalized hardware evidence only. The reasoning engine should not read raw
marketplace fields, scraper output, marketplace HTML, or source-specific seller
metadata.

Version 3.1 adds Evidence as the trust layer under reasoning. Solution
Intelligence findings can reference evidence IDs through their confidence
signals, and the panel can show why the deterministic reasoning should be
trusted.

Version 3.2 adds persisted evidence review. Solution Intelligence claims can now
point users from an explanation to `/evidence/[recordId]` for provenance,
verification status, review notes, and conflicts.

## Reasoning Engine

The report includes:

- why this works
- why something is rejected
- bottleneck analysis
- upgrade impact scenarios
- use-case analysis
- cost efficiency
- hidden opportunity detection
- platform opportunity detection
- optimization advisor
- confidence signals
- decision timeline
- branch intelligence foundation

The engine prefers qualitative reasoning over fake precision.

Examples:

- CPU bottleneck: Low
- PCIe bottleneck: Moderate
- PSU headroom: Critical
- VRAM bottleneck: High

Every finding includes a reason and confidence signal.

## Bottleneck Analysis

The current deterministic bottlenecks are:

- CPU bottleneck
- GPU bottleneck
- RAM bottleneck
- PCIe bottleneck
- VRAM bottleneck
- storage bottleneck
- cooling bottleneck
- PSU headroom

Each bottleneck uses:

- Very Low
- Low
- Moderate
- High
- Critical

The goal is useful decision language, not benchmark theater.

## Upgrade Impact Simulator

The first simulator pass can compare the current build against representative
upgrade paths such as:

- current GPU to RTX 4070-class GPU
- current storage to PCIe NVMe adapter when platform knowledge supports it

The simulator reports qualitative impact for:

- Gaming
- CAD
- AI
- Rendering
- Power draw
- Noise
- Cost
- Value

Future versions should make these scenarios branch-aware and project-specific.

## Use-Case Analysis

The engine produces reasoning for:

- Gaming
- Engineering
- CAD
- Programming
- Virtualization
- Local AI
- Rendering
- Home Server
- Streaming
- Office

Each use case receives a fit level and explanation. This keeps JETS from saying
"good build" without explaining good for what.

## Cost Efficiency

The report includes "where money is going" by selected component cost.

Each allocation can be:

- Balanced
- Overspending
- Underinvestment
- Missing

This lets JETS identify patterns such as:

- GPU consuming too much of the budget
- PSU underinvestment
- RAM overspend for a general-use build

## Hidden Opportunity Detection

The engine detects early deterministic opportunities such as:

- excessive RAM for low-demand use cases
- workstation CPU choice for gaming when a consumer platform may be better
- power path underinvestment
- platform-specific NVMe adapter paths

These are not marketplace claims. They are reasoning outputs from the current
project and curated demo knowledge.

## Optimization Advisor

The advisor has modes:

- Highest FPS
- Lowest Cost
- Quietest
- Lowest Power
- Most Upgradeable
- Best AI
- Best Engineering
- Best Value

Each mode gives an action, reasons, tradeoffs, and confidence.

## Confidence Engine

Every recommendation includes:

- confidence level
- source
- reason
- optional evidence IDs

Current sources:

- compatibility rules
- decision engine
- platform knowledge
- manual curation
- demo fixture
- normalized marketplace evidence

Future source types are already represented:

- official documentation
- community reports
- live scraping
- AI extraction
- manual moderation

This is deliberate. AI should eventually feed a moderated confidence pipeline,
not bypass it.

Evidence is the durable trust record. Confidence is the reasoning signal shown
inside a report. Future work should connect the two so every recommendation can
expand into source, verification, conflicts, and review state.

## Decision History

The panel creates an Engineering Decision History from the current project state:

1. Started
2. Selected Platform
3. Added GPU
4. Detected active validation issue
5. Optimization review

This is not a replacement for persisted audit events. It is a reasoning timeline
for the current solution state. Future versions should merge persisted audit
history with generated reasoning history.

## Branch Intelligence

v2.6 starts branch intelligence as an explanation scaffold.

Branches should eventually compare:

- cost
- power
- gaming
- AI
- longevity
- upgrade room

The important shift is that branch comparison should explain why one branch wins,
not only show score deltas.

## Future AI Integration

Future AI can help with:

- extracting candidate platform facts
- summarizing community upgrade reports
- explaining branch differences in user language
- generating first-pass confidence notes
- grouping conflicting evidence

AI should not be the source of truth.

Durable recommendations should cite:

- deterministic rules
- platform knowledge records
- evidence records
- source documents
- confidence state
- moderation state
- user-visible reasoning

## Current Limitations

v2.6 is intentionally conservative:

- no live scraping
- no AI
- no persisted intelligence reports
- no persisted evidence review
- no actual branch diff engine yet
- no benchmark database
- no official hardware-source citations
- no user-editable confidence review workflow

The value is the new reasoning architecture. JETS can now explain complete
systems instead of only displaying hardware facts.
