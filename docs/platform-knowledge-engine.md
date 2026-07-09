# JETS Platform Knowledge Engine

Version 2.5 adds the Platform Knowledge Engine foundation.

This is not live scraping, AI extraction, marketplace APIs, checkout, or an
enterprise feature. It is the architecture future ingestion and AI-assisted
moderation can populate later.

## Purpose

JETS should understand hardware platforms, not just inventory records.

A listing can say "ThinkStation P520." The knowledge layer should explain why
that matters:

- hidden upgrade paths
- known limitations
- BIOS quirks
- community-discovered modifications
- PCIe layout and bottlenecks
- adapter-assisted upgrade paths
- RAM, PSU, cooling, and GPU-clearance realities
- local AI and engineering suitability
- platform potential

## Architecture

The domain model lives in:

- `types/platform-knowledge.ts`

The curated demo registry lives in:

- `data/platform-knowledge.ts`

The lookup and summary utilities live in:

- `lib/platform-knowledge.ts`

The deeper Platform Encyclopedia model lives in:

- `types/platform-encyclopedia.ts`
- `data/platform-encyclopedia.ts`
- `lib/platform-encyclopedia.ts`

The Hardware Reasoning Graph model lives in:

- `types/reasoning-graph.ts`
- `data/reasoning-graph.ts`
- `lib/reasoning-graph/engine.ts`

The UI layer lives in:

- `components/platform-knowledge/platform-knowledge-panel.tsx`
- `components/platform-knowledge/platform-knowledge-summary.tsx`
- `components/platform-knowledge/platform-encyclopedia-summary.tsx`
- `components/platform-knowledge/upgrade-opportunity-card.tsx`
- `components/platform-knowledge/adapter-intelligence-card.tsx`

The Solution Builder model now exposes:

- `BuildWorkspaceModel.platformInsight`

That keeps platform knowledge reusable by Projects, Inventory, Optimization,
future branch comparison, future recommendation synthesis, and future ingestion.

Phase 3 Marketplace Intelligence may detect that a raw listing maps to one of
these platform profiles. That detection should link to platform knowledge; it
should not copy marketplace-specific fields into the platform registry.

Version 3.1 adds the Evidence Engine around this layer. Platform Knowledge can
now show provenance, confidence, verification status, conflicting claims,
community discoveries, Knowledge Quality, and knowledge history without changing
the underlying platform model.

Version 3.2 persists evidence review state. Platform records can now link to
database-backed evidence records, review notes, conflicts, and timeline events
through the `/evidence` workspace.

Version 3.5 adds platform knowledge validation. Every platform profile is now
checked by the hardware validation suite for constraints, opportunities,
timeline, adapter paths, community knowledge cards, Platform Potential,
evidence coverage, and Knowledge Quality warnings.

Phase 5.0 adds Hardware Playbooks above this layer. Platform Knowledge still
answers what a platform is; Playbooks answer what an experienced builder should
do with it, which mistakes to avoid, which adapters matter, and which strategy
paths the platform supports.

Phase 5.3 adds the Platform Encyclopedia below Playbooks and beside Platform
Knowledge summaries. Platform Knowledge remains the fast summary of what a
platform is. The Encyclopedia stores deeper engineering reference material such
as memory topology, PCIe topology, storage guidance, power layout, cooling
zones, firmware notes, reliability, workload suitability, and upgrade limits.

Phase 6.0 adds the Hardware Reasoning Graph. Platform Knowledge now exposes
graph edge and path counts for recognized platforms, while the graph owns
relationships such as supports, blocks, improves, bottlenecks, better value,
repair paths, and adapter paths.

## Separation Of Concerns

Specifications are stable-ish facts:

- CPU socket
- RAM type and maximum RAM
- PCIe generation
- SATA ports
- GPU clearance
- ECC support
- dual CPU support
- NVMe support
- PSU notes

Platform knowledge is practical interpretation:

- where the platform is unusually good
- where it is misleading
- which upgrades are common
- which upgrades are risky
- what buyers should verify

Community discoveries are experience notes:

- PCIe NVMe adapter boot paths
- optical cage removal
- airflow shroud behavior
- firmware caveats
- low-profile expansion tricks

Upgrade opportunities are actionable paths:

- hidden opportunities
- high-impact upgrades
- community modifications
- risk-managed reuse paths

Platform Encyclopedia entries are deeper engineering references:

- memory topology
- PCIe topology
- storage topology
- power topology
- cooling topology
- reliability patterns
- workload suitability
- structured diagram metadata
- upgrade encyclopedia facts

Playbooks should reference encyclopedia sections when they need this context.
They should not copy long-lived platform facts into recommendation prose unless
the prose is explaining a specific action.

Adapter intelligence is its own registry:

- PCIe NVMe adapter
- PCIe Wi-Fi card
- USB-C expansion card
- 10Gb Ethernet card
- PCIe USB controller
- M.2 to PCIe adapter
- Mini PCIe adapter
- SAS HBA

Inventory items do not own all this knowledge. They can link to a platform
profile through `platformKnowledgeLinks`, `sourceListingId`, component ID, or
alias matching. This prevents the inventory model from becoming a giant
handwritten encyclopedia.

## Hardware Playbooks

Playbooks are intentionally separate from Platform Knowledge.

For example, a platform profile can say that a workstation supports ECC memory,
PCIe expansion, and an adapter-based NVMe path. A playbook can turn that into a
plan:

1. Audit BIOS, PSU, and chassis condition.
2. Add PCIe NVMe storage.
3. Move to a sensible ECC RAM target.
4. Choose a GPU only after power and clearance are verified.
5. Avoid common mistakes like treating an SFF office chassis as a full GPU base.

This keeps specifications, evidence, and practical builder judgment reusable
without mixing them into one large model.

The Phase 5.3 hierarchy is:

```text
Platform Knowledge: summary and platform potential
Platform Encyclopedia: detailed engineering reference
Hardware Reasoning Graph: relationships and multi-hop paths
Hardware Playbooks: experienced-builder guidance
Engineering Action Plans: project-specific task workflow
```

## Platform Potential

Platform Potential is separate from the decision score.

It measures:

- upgrade ceiling
- longevity
- expandability
- engineering flexibility
- community support
- hidden value

The score helps distinguish a cheap complete system from a base platform with
unusual future usefulness. For example, a workstation base can have a higher
platform potential than a faster but closed-off consumer tower.

## Evidence And Provenance

Every important platform claim should eventually point to evidence.

Evidence can support:

- specifications
- constraints
- knowledge cards
- upgrade opportunities
- adapter intelligence
- PCIe reasoning
- community discoveries

The current demo includes representative evidence records and fallback pending
review states. If a knowledge item does not have dedicated evidence yet, the UI
shows that it is pending review instead of pretending it is verified.

Evidence includes:

- source type
- confidence
- extraction method
- supporting text
- date added
- version
- verification status

Knowledge Quality is separate from Platform Potential. Platform Potential asks
"how useful is this hardware?" Knowledge Quality asks "how well supported is our
knowledge about it?"

## Conflict Handling

Conflicting evidence is preserved.

For example, a manufacturer spec may record one maximum RAM value while
community reports claim a larger BIOS-dependent configuration works. JETS should
show both, mark the conflict, and explain the active handling rule. It should
not silently overwrite the official value or discard the community discovery.

## PCIe Intelligence

The engine models PCIe qualitatively:

- generation
- physical slot size
- electrical lane count
- slot priority
- expected bottlenecks by workload

It intentionally avoids fake precision. A GPU at Gen3 x8 might have a low gaming
penalty, very low CUDA penalty once data is resident, and moderate penalty for
large dataset transfers. JETS should explain the tradeoff rather than pretend to
know exact benchmark deltas for every configuration.

## Upgrade Timelines

Each platform can expose a progression:

1. Stock system audit
2. Storage upgrade
3. Memory upgrade
4. GPU or accelerator upgrade
5. Networking or storage expansion
6. Final solution role

The timeline turns scattered upgrade ideas into an engineering plan.

## Current Demo Profiles

The v2.5 registry includes representative demo knowledge for:

- Lenovo ThinkStation P520
- Lenovo ThinkStation P510
- Dell Precision T5810
- Dell Precision 5820
- Dell OptiPlex 7060 SFF
- HP Z440
- HP Z840
- Mac Pro 5,1

This data is intentionally representative, not authoritative. Before live use,
knowledge records need sourcing, review, confidence history, and correction
workflow.

## Validation

Run:

```bash
npm run validate:hardware
```

The validation framework checks that known scenarios still resolve to expected
platform IDs and platform constraints. For example, ThinkStation P510 should
continue surfacing the PCIe NVMe adapter opportunity, while OptiPlex 7060 SFF
should continue warning about low-profile expansion and proprietary PSU limits.

Phase 5.0 also checks that every supported platform profile has at least one
Hardware Playbook with required sections and evidence-linked recommendations.
Phase 5.3 also checks that every supported platform profile has encyclopedia
coverage for memory topology, power topology, storage guidance, upgrade paths,
reliability data, and workload profiles.
Phase 6.0 adds graph validation for orphan nodes, duplicate edges, broken
references, circular `requires` dependencies, missing node types, missing edge
types, and deterministic fixture paths.

Incomplete platform evidence is reported as a warning, not hidden. This is
intentional: Platform Potential answers how useful the hardware can be, while
Knowledge Quality answers how well JETS has proven its claims.

## Future Scraping And AI Hooks

Future ingestion should populate the same model instead of creating another
system.

Potential sources:

- official platform manuals
- vendor spec sheets
- BIOS release notes
- service manuals
- forum threads
- build logs
- technician notes
- normalized marketplace listings

Marketplace Intelligence is the normalization boundary for marketplace-derived
signals. It should provide parsed hardware fields, platform detection,
confidence, and evidence references before any platform record is updated.

Future AI assistance could extract candidate knowledge, but should not publish
it directly. Future AI, OCR, scraper, CSV, API, and user-submitted claims should
create evidence candidates first. The durable record should include:

- source URL or document reference
- extraction timestamp
- confidence
- reviewer state
- conflicting claims
- moderation notes
- user-visible explanation

## Current Boundaries

v2.5 does not:

- scrape live websites
- call marketplace APIs
- use AI extraction
- verify community claims automatically
- mutate optimizer decisions automatically
- replace compatibility validation

The current value is architectural: JETS now has a summary layer and a deeper
encyclopedia layer for the kind of hardware knowledge that makes unusual
solution paths possible.
