import { evidenceRecords } from "@/data/evidence";
import { knowledgeExpansionRelationshipHints } from "@/data/knowledge-expansion";
import { mockComponentInventory } from "@/data/mock-components";
import {
  adapterIntelligenceProfiles,
  platformKnowledgeLinks,
  platformKnowledgeProfiles
} from "@/data/platform-knowledge";
import { platformEncyclopediaEntries } from "@/data/platform-encyclopedia";
import { hardwarePlaybooks } from "@/data/playbooks";
import { strategyTypeIds } from "@/types/strategy";
import type { ComponentCategory } from "@/types/component-inventory";
import type {
  ReasoningGraph,
  ReasoningGraphEdge,
  ReasoningGraphEdgeType,
  ReasoningGraphNode,
  ReasoningGraphNodeType
} from "@/types/reasoning-graph";

const componentCategoryNodeIds: Record<ComponentCategory, string> = {
  chassis: "component-category:chassis",
  cpu: "component-category:cpu",
  "cpu-cooler": "component-category:cpu-cooler",
  "egpu-dock": "component-category:egpu-dock",
  "external-psu": "component-category:external-psu",
  gpu: "component-category:gpu",
  "laptop-ram-dimm-adapter": "component-category:laptop-ram-dimm-adapter",
  motherboard: "component-category:motherboard",
  "operating-system": "component-category:operating-system",
  "pcie-adapter": "component-category:pcie-adapter",
  psu: "component-category:psu",
  ram: "component-category:ram",
  storage: "component-category:storage",
  "thunderbolt-adapter": "component-category:thunderbolt-adapter"
};

const workloadNodes = [
  "ai",
  "cad",
  "cuda",
  "engineering",
  "gaming",
  "general",
  "homelab",
  "large-dataset-transfer",
  "local-ai",
  "networking",
  "office",
  "programming"
];

const nodeTypeByComponentCategory: Record<ComponentCategory, ReasoningGraphNodeType> = {
  chassis: "case",
  cpu: "cpu",
  "cpu-cooler": "cooling",
  "egpu-dock": "adapter",
  "external-psu": "power-supply",
  gpu: "gpu",
  "laptop-ram-dimm-adapter": "adapter",
  motherboard: "component",
  "operating-system": "component",
  "pcie-adapter": "adapter",
  psu: "power-supply",
  ram: "ram",
  storage: "storage",
  "thunderbolt-adapter": "adapter"
};

function node(
  id: string,
  type: ReasoningGraphNodeType,
  label: string,
  summary: string,
  options: Omit<Partial<ReasoningGraphNode>, "id" | "label" | "summary" | "type"> = {}
): ReasoningGraphNode {
  return {
    id,
    label,
    summary,
    type,
    ...options
  };
}

function edge(
  from: string,
  to: string,
  type: ReasoningGraphEdgeType,
  reason: string,
  options: Partial<Pick<ReasoningGraphEdge, "confidence" | "evidenceIds" | "strength">> = {}
): ReasoningGraphEdge {
  return {
    confidence: options.confidence ?? 82,
    evidenceIds: options.evidenceIds,
    from,
    id: `${type}:${from}->${to}`,
    reason,
    strength: options.strength ?? 1,
    to,
    type
  };
}

function getProfileEvidenceIds() {
  const ids = new Set<string>();

  for (const profile of platformKnowledgeProfiles) {
    for (const item of [
      ...profile.constraints,
      ...profile.knowledgeCards,
      ...profile.timeline,
      ...profile.upgradeOpportunities
    ]) {
      for (const evidenceId of item.evidenceIds ?? []) {
        ids.add(evidenceId);
      }
    }
  }

  for (const adapter of adapterIntelligenceProfiles) {
    for (const evidenceId of adapter.evidenceIds ?? []) {
      ids.add(evidenceId);
    }
  }

  for (const playbook of hardwarePlaybooks) {
    for (const evidenceId of playbook.evidenceRecordIds) {
      ids.add(evidenceId);
    }

    for (const recommendation of playbook.recommendations) {
      for (const evidenceId of recommendation.evidenceRecordIds) {
        ids.add(evidenceId);
      }
    }
  }

  return ids;
}

function createBaseNodes(): ReasoningGraphNode[] {
  const categoryNodes = Object.entries(componentCategoryNodeIds).map(
    ([category, id]) =>
      node(
        id,
        "component",
        `${category.replaceAll("-", " ")} inventory`,
        "Component inventory category used by slot-aware graph reasoning.",
        { category: category as ComponentCategory }
      )
  );
  const usedEvidenceIds = getProfileEvidenceIds();

  return [
    node(
      "project:builder-workspace",
      "project",
      "Solution Builder project",
      "Slot-based project workspace that consumes graph reasoning."
    ),
    node(
      "acquisition:manual-capture",
      "acquisition",
      "Manual acquisition",
      "Manually captured listing input that can enter strategy, evidence, and project handoff."
    ),
    node(
      "action-plan:engineering-tasks",
      "action-plan",
      "Engineering Action Plan",
      "Dependency-aware task workflow generated from strategy, playbooks, validation, and graph context."
    ),
    node(
      "opportunity:platform-potential",
      "opportunity",
      "Platform Potential",
      "Long-term usefulness created by upgrade ceiling, hidden paths, repairability, and expansion."
    ),
    node(
      "opportunity:wait-for-value",
      "opportunity",
      "Wait for better value",
      "A valid outcome when cost, risk, or platform constraints make a listing unattractive."
    ),
    node(
      "storage:nvme-ssd",
      "storage",
      "NVMe SSD",
      "Fast storage endpoint used by PCIe adapter paths and storage upgrade reasoning."
    ),
    node(
      "pcie-card:add-in-expansion",
      "pcie-card",
      "PCIe add-in card",
      "Generic PCIe expansion endpoint used for adapter, storage, GPU, and networking paths."
    ),
    ...workloadNodes.map((workload) =>
      node(
        `workload:${workload}`,
        "workload",
        workload.replaceAll("-", " "),
        "Workload endpoint used by graph bottleneck and suitability reasoning."
      )
    ),
    ...categoryNodes,
    ...strategyTypeIds.map((strategyType) =>
      node(
        `strategy:${strategyType}`,
        "strategy",
        strategyType.replaceAll("-", " "),
        "Deterministic hardware strategy option.",
        { metadata: { strategyType } }
      )
    ),
    ...evidenceRecords
      .filter((record) => usedEvidenceIds.has(record.id))
      .map((record) =>
        node(
          `evidence:${record.id}`,
          "evidence",
          record.sourceTitle,
          record.claim,
          { sourceId: record.id }
        )
      )
  ];
}

function createPlatformNodes(): ReasoningGraphNode[] {
  return platformKnowledgeProfiles.flatMap((profile) => [
    node(`platform:${profile.id}`, "platform", profile.name, profile.summary, {
      platformId: profile.id,
      sourceId: profile.id,
      metadata: {
        cpuSocket: profile.specifications.cpuSocket,
        pcieGeneration: profile.specifications.pcieGeneration,
        platformPotential: profile.potential.overall,
        ramType: profile.specifications.ramType
      }
    }),
    ...profile.pcieSlots.map((slot) =>
      node(
        `pcie-slot:${profile.id}:${slot.id}`,
        "pcie-slot",
        `${profile.name} ${slot.priority.replaceAll("-", " ")} slot`,
        slot.notes,
        {
          platformId: profile.id,
          sourceId: slot.id,
          metadata: {
            electricalLanes: slot.electricalLanes,
            generation: slot.generation,
            physicalSize: slot.physicalSize,
            priority: slot.priority
          }
        }
      )
    ),
    ...profile.constraints.map((constraint) =>
      node(
        `constraint:${profile.id}:${constraint.id}`,
        "constraint",
        constraint.title,
        constraint.description,
        {
          platformId: profile.id,
          sourceId: constraint.id,
          metadata: {
            severity: constraint.severity
          }
        }
      )
    ),
    ...profile.upgradeOpportunities.map((opportunity) =>
      node(
        `opportunity:${profile.id}:${opportunity.id}`,
        "opportunity",
        opportunity.title,
        opportunity.summary,
        {
          platformId: profile.id,
          sourceId: opportunity.id,
          metadata: {
            difficulty: opportunity.difficulty,
            expectedBenefitRating: opportunity.expectedBenefitRating,
            type: opportunity.type
          }
        }
      )
    )
  ]);
}

function createAdapterNodes(): ReasoningGraphNode[] {
  return adapterIntelligenceProfiles.map((adapter) =>
    node(`adapter:${adapter.id}`, "adapter", adapter.title, adapter.expectedPerformance, {
      sourceId: adapter.id,
      metadata: {
        costUsd: adapter.costUsd,
        difficulty: adapter.difficulty,
        type: adapter.type
      }
    })
  );
}

function createComponentNodes(): ReasoningGraphNode[] {
  return mockComponentInventory.map((component) =>
    node(
      `component:${component.id}`,
      nodeTypeByComponentCategory[component.category],
      component.title,
      component.summary,
      {
        category: component.category,
        sourceId: component.id,
        metadata: {
          condition: component.condition,
          price: component.price,
          sourceListingId: component.sourceListingId ?? ""
        }
      }
    )
  );
}

function createPlaybookNodes(): ReasoningGraphNode[] {
  return hardwarePlaybooks.map((playbook) =>
    node(`playbook:${playbook.id}`, "playbook", playbook.title, playbook.summary, {
      platformId:
        platformKnowledgeProfiles.find((profile) => profile.id === playbook.platformId)
          ?.id,
      sourceId: playbook.id,
      metadata: {
        platformId: playbook.platformId,
        useCase: playbook.useCase
      }
    })
  );
}

function createPlatformEdges(): ReasoningGraphEdge[] {
  const chipsetByPlatform = new Map(
    platformEncyclopediaEntries.map((entry) => [
      entry.platformId,
      entry.chipset.summary
    ])
  );
  const edges: ReasoningGraphEdge[] = [];

  for (const profile of platformKnowledgeProfiles) {
    const platformNodeId = `platform:${profile.id}`;

    for (const slot of profile.pcieSlots) {
      const slotNodeId = `pcie-slot:${profile.id}:${slot.id}`;
      edges.push(
        edge(
          platformNodeId,
          slotNodeId,
          "supports",
          `${profile.name} exposes a documented PCIe slot path.`
        ),
        edge(
          slotNodeId,
          "pcie-card:add-in-expansion",
          "supports",
          "Documented PCIe slots can host add-in card paths when power, space, and firmware allow."
        )
      );

      if (slot.priority === "primary-gpu" && slot.electricalLanes < 16) {
        edges.push(
          edge(
            slotNodeId,
            "component-category:gpu",
            "bottlenecks",
            "Reduced electrical lanes can constrain some GPU workloads.",
            { confidence: 70, strength: 0.7 }
          )
        );
      }

      for (const adapter of adapterIntelligenceProfiles.filter((item) =>
        item.recommendedPlatformIds.includes(profile.id)
      )) {
        if (
          slot.priority === "storage" ||
          adapter.type !== "storage" ||
          slot.priority === "utility"
        ) {
          edges.push(
            edge(
              slotNodeId,
              `adapter:${adapter.id}`,
              "adapter_path",
              `${adapter.title} can use this platform's PCIe expansion path.`,
              { confidence: adapter.compatibilityConfidence === "high" ? 88 : 68 }
            )
          );
        }
      }
    }

    for (const bottleneck of profile.pcieBottlenecks) {
      edges.push(
        edge(
          platformNodeId,
          `workload:${bottleneck.workload}`,
          "bottlenecks",
          bottleneck.reason,
          {
            confidence: bottleneck.impact === "high" ? 82 : 68,
            strength:
              bottleneck.impact === "high"
                ? 0.9
                : bottleneck.impact === "moderate"
                  ? 0.65
                  : 0.35
          }
        )
      );
    }

    for (const constraint of profile.constraints) {
      const constraintNodeId = `constraint:${profile.id}:${constraint.id}`;
      edges.push(
        edge(
          platformNodeId,
          constraintNodeId,
          "blocks",
          constraint.mitigation ?? "Constraint must be handled before recommendation changes."
        )
      );

      const text = `${constraint.title} ${constraint.description}`.toLowerCase();

      if (text.includes("psu") || text.includes("power")) {
        edges.push(
          edge(
            constraintNodeId,
            "component-category:gpu",
            "higher_power",
            "Power constraints reduce the safe GPU upgrade envelope.",
            { confidence: 78 }
          )
        );
      }

      if (text.includes("gpu") || text.includes("profile")) {
        edges.push(
          edge(
            constraintNodeId,
            "strategy:buy-used-workstation",
            "blocks",
            "GPU or chassis limits can make this platform a poor workstation-buying path for some goals.",
            { confidence: 72 }
          )
        );
      }
    }

    for (const opportunity of profile.upgradeOpportunities) {
      const opportunityNodeId = `opportunity:${profile.id}:${opportunity.id}`;
      edges.push(
        edge(
          platformNodeId,
          opportunityNodeId,
          "upgrades",
          `The platform exposes the ${opportunity.title} opportunity.`,
          { confidence: opportunity.confidence === "high" ? 88 : 70 }
        )
      );
      edges.push(
        edge(
          opportunityNodeId,
          "opportunity:platform-potential",
          "improves",
          "Opportunity contributes to Platform Potential.",
          { strength: opportunity.expectedBenefitRating / 5 }
        )
      );

      for (const adapterId of opportunity.adapterIds ?? []) {
        edges.push(
          edge(
            opportunityNodeId,
            `adapter:${adapterId}`,
            "adapter_path",
            `${opportunity.title} depends on the ${adapterId.replaceAll("-", " ")} adapter path.`
          )
        );
      }
    }

    for (const item of [
      ...profile.constraints,
      ...profile.knowledgeCards,
      ...profile.timeline,
      ...profile.upgradeOpportunities
    ]) {
      for (const evidenceId of item.evidenceIds ?? []) {
        edges.push(
          edge(
            `evidence:${evidenceId}`,
            platformNodeId,
            "supports",
            "Evidence supports a platform knowledge claim.",
            { evidenceIds: [evidenceId], confidence: 82 }
          )
        );
      }
    }

    const encyclopediaEntry = platformEncyclopediaEntries.find(
      (entry) => entry.platformId === profile.id
    );

    for (const evidenceId of encyclopediaEntry?.provenance.evidenceIds ?? []) {
      edges.push(
        edge(
          `evidence:${evidenceId}`,
          platformNodeId,
          "supports",
          "Evidence supports the platform encyclopedia entry.",
          { evidenceIds: [evidenceId], confidence: 86 }
        )
      );
    }

    for (const playbook of hardwarePlaybooks.filter(
      (item) => item.platformId === profile.id
    )) {
      edges.push(
        edge(
          platformNodeId,
          `playbook:${playbook.id}`,
          "supports",
          "Platform knowledge supports a hardware playbook.",
          { evidenceIds: playbook.evidenceRecordIds }
        )
      );

      for (const strategyType of playbook.recommendedStrategyTypes) {
        edges.push(
          edge(
            `playbook:${playbook.id}`,
            `strategy:${strategyType}`,
            "supports",
            "Playbook guidance supports this strategy path.",
            { evidenceIds: playbook.evidenceRecordIds }
          )
        );
      }
    }
  }

  for (let index = 0; index < platformKnowledgeProfiles.length; index += 1) {
    const left = platformKnowledgeProfiles[index];

    for (const right of platformKnowledgeProfiles.slice(index + 1)) {
      if (left.specifications.cpuSocket === right.specifications.cpuSocket) {
        edges.push(
          edge(
            `platform:${left.id}`,
            `platform:${right.id}`,
            "same_socket",
            "Platforms share a CPU socket family, so some upgrade reasoning can be compared.",
            { confidence: 78 }
          )
        );
      }

      if (left.specifications.pcieGeneration === right.specifications.pcieGeneration) {
        edges.push(
          edge(
            `platform:${left.id}`,
            `platform:${right.id}`,
            "same_generation",
            "Platforms share a PCIe generation baseline.",
            { confidence: 82 }
          )
        );
      }

      if (chipsetByPlatform.get(left.id) === chipsetByPlatform.get(right.id)) {
        edges.push(
          edge(
            `platform:${left.id}`,
            `platform:${right.id}`,
            "same_chipset",
            "Platforms share the same modeled chipset family.",
            { confidence: 80 }
          )
        );
      }
    }
  }

  return edges;
}

function createAdapterEdges(): ReasoningGraphEdge[] {
  return adapterIntelligenceProfiles.flatMap((adapter) => {
    const adapterNodeId = `adapter:${adapter.id}`;
    const edges: ReasoningGraphEdge[] = [
      edge(
        adapterNodeId,
        "project:builder-workspace",
        "requires",
        "Adapter choices require project-level validation before they become a build decision.",
        { confidence: adapter.compatibilityConfidence === "high" ? 86 : 66 }
      )
    ];

    for (const evidenceId of adapter.evidenceIds ?? []) {
      edges.push(
        edge(
          `evidence:${evidenceId}`,
          adapterNodeId,
          "supports",
          "Evidence supports an adapter intelligence claim.",
          { evidenceIds: [evidenceId], confidence: 82 }
        )
      );
    }

    if (adapter.type === "storage") {
      edges.push(
        edge(
          adapterNodeId,
          "storage:nvme-ssd",
          "supports",
          "Storage adapters enable NVMe SSD solution paths."
        ),
        edge(
          "storage:nvme-ssd",
          "opportunity:platform-potential",
          "improves",
          "Fast storage can improve platform usefulness for engineering and general workloads.",
          { strength: 0.8 }
        )
      );
    }

    if (adapter.type === "networking") {
      edges.push(
        edge(
          adapterNodeId,
          "strategy:server-conversion",
          "improves",
          "Networking adapters can make workstation and server-conversion paths more useful."
        )
      );
    }

    if (adapter.type === "gpu-path" || adapter.type === "memory-path") {
      edges.push(
        edge(
          adapterNodeId,
          "strategy:hybrid-strategy",
          "improves",
          "Niche adapter paths are hybrid strategy candidates."
        )
      );
    }

    return edges;
  });
}

function createComponentEdges(): ReasoningGraphEdge[] {
  const gpuComponents = mockComponentInventory.filter((item) => item.category === "gpu");
  const edges = mockComponentInventory.flatMap((component) => {
    const componentNodeId = `component:${component.id}`;
    const categoryNodeId = componentCategoryNodeIds[component.category];
    const componentEdges = [
      edge(
        categoryNodeId,
        componentNodeId,
        "supports",
        "Slot-aware inventory category contains this component."
      )
    ];
    const link = platformKnowledgeLinks.find(
      (item) =>
        item.componentId === component.id ||
        (item.sourceListingId && item.sourceListingId === component.sourceListingId)
    );

    if (link) {
      componentEdges.push(
        edge(
          componentNodeId,
          `platform:${link.platformId}`,
          "shares_platform",
          link.reason,
          { confidence: link.confidence === "high" ? 88 : 68 }
        )
      );
    }

    if (component.category === "psu" && (component.facts.wattage ?? 0) < 400) {
      componentEdges.push(
        edge(
          componentNodeId,
          "component-category:gpu",
          "blocks",
          "Low-wattage PSU choices constrain GPU upgrade paths.",
          { confidence: 82 }
        )
      );
    }

    if (component.category === "ram" && component.tags.some((tag) => tag.includes("sodimm"))) {
      componentEdges.push(
        edge(
          componentNodeId,
          "component:adapter-sodimm-to-dimm-ddr4",
          "requires",
          "Laptop memory reuse in desktop-style projects requires the adapter path.",
          { confidence: 72 }
        )
      );
    }

    return componentEdges;
  });

  const rtx3060 = gpuComponents.find((item) => item.title.toLowerCase().includes("3060"));
  const radeon = gpuComponents.find((item) => item.title.toLowerCase().includes("6700"));

  if (rtx3060 && radeon) {
    edges.push(
      edge(
        `component:${rtx3060.id}`,
        `component:${radeon.id}`,
        "replaces",
        "Alternative used GPU path can replace a similarly priced card depending on workload.",
        { confidence: 70 }
      ),
      edge(
        `component:${radeon.id}`,
        `component:${rtx3060.id}`,
        "better_value",
        "Relative value depends on workload, driver stack, power, and local price.",
        { confidence: 66 }
      )
    );
  }

  const efficientPsu = mockComponentInventory.find((item) => item.id === "psu-650w-gold");
  const lowPowerPsu = mockComponentInventory.find((item) => item.id === "psu-300w-oem-sff");

  if (efficientPsu && lowPowerPsu) {
    edges.push(
      edge(
        `component:${efficientPsu.id}`,
        `component:${lowPowerPsu.id}`,
        "higher_power",
        "Higher wattage creates more GPU headroom but may not fit proprietary SFF systems."
      ),
      edge(
        `component:${lowPowerPsu.id}`,
        `component:${efficientPsu.id}`,
        "lower_noise",
        "Lower-power office PSU paths can be quieter when the workload stays modest.",
        { confidence: 62 }
      )
    );
  }

  return edges;
}

function createKnowledgeExpansionEdges(): ReasoningGraphEdge[] {
  return knowledgeExpansionRelationshipHints.map((hint) =>
    edge(hint.fromId, hint.toId, hint.type, hint.reason, {
      confidence: hint.confidence,
      evidenceIds: hint.evidenceIds,
      strength: hint.confidence / 100
    })
  );
}

function createPlaybookEdges(): ReasoningGraphEdge[] {
  return hardwarePlaybooks.flatMap((playbook) => [
    ...playbook.evidenceRecordIds.map((evidenceId) =>
      edge(
        `evidence:${evidenceId}`,
        `playbook:${playbook.id}`,
        "supports",
        "Evidence supports a hardware playbook.",
        { evidenceIds: [evidenceId], confidence: 82 }
      )
    ),
    ...playbook.recommendedStrategyTypes.map((strategyType) =>
      edge(
        `playbook:${playbook.id}`,
        `strategy:${strategyType}`,
        "supports",
        "Playbook guidance supports this deterministic strategy path.",
        { evidenceIds: playbook.evidenceRecordIds }
      )
    )
  ]);
}

function createWorkflowEdges(): ReasoningGraphEdge[] {
  return [
    edge(
      "acquisition:manual-capture",
      "project:builder-workspace",
      "supports",
      "Reviewed acquisitions can become project inputs after handoff."
    ),
    edge(
      "acquisition:manual-capture",
      "strategy:repair-existing-hardware",
      "repair_path",
      "A repair-risk listing can be a strategy input instead of automatically becoming a project.",
      { confidence: 76 }
    ),
    edge(
      "opportunity:wait-for-value",
      "strategy:wait-for-better-value",
      "better_value",
      "Waiting is a valid deterministic strategy when price, evidence, or risk is unfavorable."
    ),
    edge(
      "project:builder-workspace",
      "action-plan:engineering-tasks",
      "requires",
      "Project validation and selected strategy drive engineering tasks."
    ),
    edge(
      "action-plan:engineering-tasks",
      "project:builder-workspace",
      "improves",
      "Completed tasks can resolve project validation warnings."
    ),
    ...workloadNodes.map((workload) =>
      edge(
        "project:builder-workspace",
        `workload:${workload}`,
        "supports",
        "Projects can be evaluated against workload goals."
      )
    ),
    ...strategyTypeIds.map((strategyType) =>
      edge(
        `strategy:${strategyType}`,
        "project:builder-workspace",
        "supports",
        "Strategy can create or guide a project when the path is worth pursuing."
      )
    )
  ];
}

function dedupeNodes(nodes: ReasoningGraphNode[]) {
  return [...new Map(nodes.map((item) => [item.id, item])).values()];
}

function dedupeEdges(edges: ReasoningGraphEdge[]) {
  return [...new Map(edges.map((item) => [item.id, item])).values()];
}

export const reasoningGraph: ReasoningGraph = {
  edges: dedupeEdges([
    ...createPlatformEdges(),
    ...createAdapterEdges(),
    ...createComponentEdges(),
    ...createKnowledgeExpansionEdges(),
    ...createPlaybookEdges(),
    ...createWorkflowEdges()
  ]),
  nodes: dedupeNodes([
    ...createBaseNodes(),
    ...createPlatformNodes(),
    ...createAdapterNodes(),
    ...createComponentNodes(),
    ...createPlaybookNodes()
  ])
};

export function getReasoningGraphEdgeLabel(type: ReasoningGraphEdgeType) {
  return type.replaceAll("_", " ");
}

export function getReasoningGraphNodeLabel(id: string) {
  const node = reasoningGraph.nodes.find((item) => item.id === id);

  return node?.label ?? id.split(":").at(-1)?.replaceAll("-", " ") ?? id;
}

export function getOpportunityCategoryForPath(
  path: Pick<ReasoningGraphEdge, "type">[]
) {
  if (path.some((edgeItem) => edgeItem.type === "adapter_path")) return "use-adapter";
  if (path.some((edgeItem) => edgeItem.type === "commonly_upgraded_with")) return "use-adapter";
  if (path.some((edgeItem) => edgeItem.type === "repair_path")) return "repair-instead";
  if (path.some((edgeItem) => edgeItem.type === "shares_repair_path")) return "repair-instead";
  if (path.some((edgeItem) => edgeItem.type === "better_value")) return "wait";
  if (path.some((edgeItem) => edgeItem.type === "lower_noise")) return "reuse-owned";
  if (path.some((edgeItem) => edgeItem.type === "shares_platform")) return "buy-workstation";
  if (path.some((edgeItem) => edgeItem.type === "works_better_with")) return "buy-workstation";

  return "cheaper-equivalent";
}
