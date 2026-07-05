import type { ComponentCategory } from "@/types/component-inventory";
import type { EvidenceRecord } from "@/types/evidence";
import type { BuildSlotId } from "@/types/solution-builder";

export const qualitativeRiskLevels = [
  "very-low",
  "low",
  "moderate",
  "high",
  "critical"
] as const;

export const solutionUseCaseIds = [
  "gaming",
  "engineering",
  "cad",
  "programming",
  "virtualization",
  "local-ai",
  "rendering",
  "home-server",
  "streaming",
  "office"
] as const;

export const advisorGoalIds = [
  "highest-fps",
  "lowest-cost",
  "quietest",
  "lowest-power",
  "most-upgradeable",
  "best-ai",
  "best-engineering",
  "best-value"
] as const;

export type QualitativeRiskLevel = (typeof qualitativeRiskLevels)[number];
export type SolutionUseCaseId = (typeof solutionUseCaseIds)[number];
export type AdvisorGoalId = (typeof advisorGoalIds)[number];
export type ConfidenceLevel = "low" | "medium" | "high";
export type ConfidenceSourceType =
  | "compatibility-rules"
  | "decision-engine"
  | "platform-knowledge"
  | "manual-curation"
  | "demo-fixture"
  | "future-official-docs"
  | "future-community-reports"
  | "future-live-scraping"
  | "future-ai-extraction"
  | "future-moderation";

export type ConfidenceSignal = {
  confidence: ConfidenceLevel;
  evidenceIds?: Array<EvidenceRecord["id"]>;
  reason: string;
  source: ConfidenceSourceType;
};

export type BuildReasoningFinding = {
  confidence: ConfidenceSignal;
  id: string;
  reason: string;
  relatedSlots: BuildSlotId[];
  status: "works" | "warning" | "rejected" | "opportunity";
  title: string;
};

export type BottleneckFinding = {
  confidence: ConfidenceSignal;
  level: QualitativeRiskLevel;
  reason: string;
  title: string;
};

export type BottleneckAnalysis = {
  cooling: BottleneckFinding;
  cpu: BottleneckFinding;
  gpu: BottleneckFinding;
  pcie: BottleneckFinding;
  psuHeadroom: BottleneckFinding;
  ram: BottleneckFinding;
  storage: BottleneckFinding;
  vram: BottleneckFinding;
};

export type UpgradeImpactMetric = {
  label: string;
  value: "lower" | "similar" | "better" | "much-better" | "worse" | "higher";
};

export type UpgradeImpactScenario = {
  confidence: ConfidenceSignal;
  current: string;
  estimatedCostUsd: number;
  id: string;
  metrics: {
    ai: UpgradeImpactMetric;
    cad: UpgradeImpactMetric;
    gaming: UpgradeImpactMetric;
    noise: UpgradeImpactMetric;
    powerDraw: UpgradeImpactMetric;
    rendering: UpgradeImpactMetric;
    value: UpgradeImpactMetric;
  };
  suggested: string;
  summary: string;
  tradeoffs: string[];
};

export type UseCaseReasoning = {
  confidence: ConfidenceSignal;
  fit: "poor" | "usable" | "good" | "excellent";
  id: SolutionUseCaseId;
  reasons: string[];
  title: string;
};

export type CostAllocationStatus =
  | "balanced"
  | "overspending"
  | "underinvestment"
  | "missing";

export type CostAllocation = {
  amount: number;
  category: ComponentCategory | "case" | "cooling" | "power" | "platform";
  percent: number;
  reason: string;
  slotId: BuildSlotId;
  status: CostAllocationStatus;
  title: string;
};

export type CostEfficiencyAnalysis = {
  allocations: CostAllocation[];
  summary: string;
  totalCost: number;
};

export type HiddenOpportunity = {
  confidence: ConfidenceSignal;
  estimatedSavingsUsd?: number;
  id: string;
  reason: string;
  title: string;
  type: "overspend" | "underinvestment" | "platform-opportunity" | "alternative-path";
};

export type OptimizationAdvisorRecommendation = {
  confidence: ConfidenceSignal;
  goalId: AdvisorGoalId;
  reasons: string[];
  recommendedAction: string;
  title: string;
  tradeoffs: string[];
};

export type DecisionTimelineEvent = {
  description: string;
  id: string;
  status: "completed" | "warning" | "opportunity" | "next";
  title: string;
};

export type BranchIntelligenceSignal = {
  confidence: ConfidenceSignal;
  dimension:
    | "cost"
    | "power"
    | "gaming"
    | "ai"
    | "longevity"
    | "upgrade-room";
  reason: string;
  title: string;
};

export type SolutionIntelligenceReport = {
  advisor: OptimizationAdvisorRecommendation[];
  bottlenecks: BottleneckAnalysis;
  branchIntelligence: BranchIntelligenceSignal[];
  confidence: ConfidenceSignal;
  costEfficiency: CostEfficiencyAnalysis;
  decisionTimeline: DecisionTimelineEvent[];
  hiddenOpportunities: HiddenOpportunity[];
  platformOpportunities: HiddenOpportunity[];
  rejectionReasons: BuildReasoningFinding[];
  summary: string;
  upgradeScenarios: UpgradeImpactScenario[];
  useCases: UseCaseReasoning[];
  whyThisWorks: BuildReasoningFinding[];
};
