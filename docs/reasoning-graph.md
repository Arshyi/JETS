# JETS Hardware Reasoning Graph

Phase 6.0 adds the Hardware Reasoning Graph.

This milestone does not add another workflow. It upgrades how existing JETS
engines reason about hardware relationships.

It is not AI, scraping, marketplace APIs, OCR, browser automation, or checkout.

## Philosophy

Hardware engineering is a graph, not a list.

Earlier JETS milestones stored facts:

```text
ThinkStation P510 has PCIe Gen3.
P510 can use a PCIe NVMe adapter.
NVMe improves storage responsiveness.
Engineering workloads benefit from fast project storage.
```

The graph stores the relationships:

```text
ThinkStation P510
-> supports
PCIe slot
-> adapter_path
PCIe NVMe adapter
-> supports
NVMe SSD
-> improves
Platform Potential
```

That is the core product direction. JETS should show users paths they would not
normally consider.

## Node Types

The graph supports nodes for:

- platforms
- CPUs
- GPUs
- RAM
- storage
- power supplies
- adapters
- PCIe cards
- PCIe slots
- cooling
- cases
- strategies
- playbooks
- projects
- acquisitions
- action plans
- evidence
- opportunities
- constraints
- workloads
- components

Current graph data is deterministic and derived from existing curated JETS data:

- Platform Knowledge
- Platform Encyclopedia
- adapter intelligence
- component inventory
- hardware playbooks
- strategy types
- evidence records

## Edge Types

The graph supports deterministic relationships:

- supports
- blocks
- improves
- requires
- replaces
- bottlenecks
- upgrades
- shares_platform
- same_socket
- same_chipset
- same_generation
- higher_power
- lower_noise
- better_value
- repair_path
- adapter_path

These relationships are intentionally plain. They are not hidden embeddings or
AI guesses. They are inspectable engineering claims.

## Multi-Hop Reasoning

Multi-hop paths let JETS explain why a recommendation exists without collapsing
everything into one score.

Example:

```text
ThinkStation P510
-> supports
PCIe slot
-> adapter_path
PCIe NVMe adapter
-> supports
NVMe SSD
-> improves
Platform Potential
```

This is different from saying:

```text
P510 has high Platform Potential.
```

The path is the explanation.

## Opportunity Graph

Opportunity discovery can identify paths such as:

- use adapter
- repair instead
- reuse owned hardware
- buy workstation
- wait for value
- cheaper equivalent
- walk away

The first implementation exposes deterministic opportunities through graph
traversal from platform nodes.

## Constraint Graph

Constraint propagation uses blocking and bottleneck edges.

Example:

```text
OptiPlex 7060 SFF
-> blocks
Proprietary PSU constraint
-> higher_power
GPU category
```

The graph does not replace Builder validation. It gives validation, strategy,
optimization, playbooks, and action plans one shared place to ask relationship
questions.

## Integration

The current integration is deliberately light:

- Platform Knowledge summaries expose graph edge and path counts.
- Playbooks carry graph path IDs beside evidence and encyclopedia references.
- Strategy recommendations carry graph path IDs when platform or strategy
  relationships support the decision.
- Action Plan tasks carry graph path IDs when tasks are generated from graph-
  backed platform or slot context.
- Optimization results carry graph path IDs for recognized platform projects.
- Hardware validation includes graph validation status.

The graph does not create a new dashboard or user workflow.

## Validation

Run:

```bash
npm run validate:graph
```

The validator checks:

- orphan nodes
- circular `requires` dependencies
- missing relationship types
- missing node types
- duplicate edges
- broken references
- deterministic fixture paths
- display paths with broken node references
- display paths with broken edge references
- circular display paths
- missing node or relationship labels

The command writes:

- `docs/generated/reasoning-graph-report.md`
- `docs/generated/reasoning-graph-report.html`

Hardware validation also includes the graph result:

```bash
npm run validate:hardware
```

## Current Limitations

Phase 6.0 is a foundation:

- graph data is curated and deterministic
- edge weights are simple relationship strengths
- traversal is depth-limited
- opportunities are qualitative
- no graph persistence tables exist yet
- no graph editor exists
- no marketplace data writes to the graph
- no AI writes to the graph

Future AI, OCR, scraping, user submissions, and marketplace APIs should become
possible graph contributors only after evidence review. They should not become
the graph itself.

## Reasoning Path Explanations

Phase 6.1 makes graph explanations user-visible in the places where they matter
most:

- Strategy cards
- Optimization suggestions
- Acquisition recommendations
- Project validation warnings
- Action Plan tasks
- Platform Knowledge panels

The product question should be:

```text
What path did JETS find that I would not have found myself?
```

See `docs/reasoning-path-explanations.md` for the display contract.
