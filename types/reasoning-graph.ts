import type { ComponentCategory } from "@/types/component-inventory";
import type { EvidenceRecord } from "@/types/evidence";
import type { PlatformAdapterId, PlatformKnowledgeId } from "@/types/platform-knowledge";
import type { BuildSlotId } from "@/types/solution-builder";
import type { HardwareStrategyTypeId } from "@/types/strategy";

export const reasoningGraphNodeTypes = [
  "platform",
  "cpu",
  "gpu",
  "ram",
  "storage",
  "power-supply",
  "adapter",
  "pcie-card",
  "pcie-slot",
  "cooling",
  "case",
  "strategy",
  "playbook",
  "project",
  "acquisition",
  "action-plan",
  "evidence",
  "opportunity",
  "constraint",
  "workload",
  "component"
] as const;

export const reasoningGraphEdgeTypes = [
  "supports",
  "blocks",
  "improves",
  "requires",
  "replaces",
  "bottlenecks",
  "upgrades",
  "shares_platform",
  "same_socket",
  "same_chipset",
  "same_generation",
  "higher_power",
  "lower_noise",
  "better_value",
  "repair_path",
  "adapter_path"
] as const;

export type ReasoningGraphNodeType = (typeof reasoningGraphNodeTypes)[number];
export type ReasoningGraphEdgeType = (typeof reasoningGraphEdgeTypes)[number];

export type ReasoningGraphNode = {
  category?: ComponentCategory;
  id: string;
  label: string;
  metadata?: Record<string, string | number | boolean | string[]>;
  platformId?: PlatformKnowledgeId;
  sourceId?: string;
  summary: string;
  type: ReasoningGraphNodeType;
};

export type ReasoningGraphEdge = {
  confidence: number;
  evidenceIds?: Array<EvidenceRecord["id"]>;
  from: ReasoningGraphNode["id"];
  id: string;
  reason: string;
  strength: number;
  to: ReasoningGraphNode["id"];
  type: ReasoningGraphEdgeType;
};

export type ReasoningGraph = {
  edges: ReasoningGraphEdge[];
  nodes: ReasoningGraphNode[];
};

export type ReasoningGraphPath = {
  edgeIds: Array<ReasoningGraphEdge["id"]>;
  id: string;
  nodeIds: Array<ReasoningGraphNode["id"]>;
  scoreDelta?: number;
  summary: string;
  title: string;
};

export type ReasoningGraphOpportunity = {
  category:
    | "cheaper-equivalent"
    | "repair-instead"
    | "reuse-owned"
    | "use-adapter"
    | "buy-workstation"
    | "wait"
    | "walk-away";
  confidence: number;
  explanationPath: ReasoningGraphPath;
  id: string;
  title: string;
};

export type ReasoningGraphConstraint = {
  confidence: number;
  explanationPath: ReasoningGraphPath;
  id: string;
  severity: "info" | "warning" | "blocking";
  title: string;
};

export type ReasoningGraphValidationIssue = {
  id: string;
  message: string;
  severity: "warning" | "error";
};

export type ReasoningGraphValidationResult = {
  duplicateEdgeCount: number;
  edgeCount: number;
  issues: ReasoningGraphValidationIssue[];
  nodeCount: number;
  orphanNodeCount: number;
  passed: boolean;
  pathFixtureCount: number;
};

export type ReasoningGraphReferenceContext = {
  adapterId?: PlatformAdapterId;
  platformId?: PlatformKnowledgeId | null;
  slotIds?: BuildSlotId[];
  strategyType?: HardwareStrategyTypeId;
};
