import type { BuildSlotId } from "@/types/solution-builder";

export const platformKnowledgeIds = [
  "thinkstation-p520",
  "thinkstation-p510",
  "precision-t5810",
  "precision-5820",
  "optiplex-7060",
  "hp-z440",
  "hp-z840",
  "mac-pro-5-1"
] as const;

export type PlatformKnowledgeId = (typeof platformKnowledgeIds)[number];

export type KnowledgeConfidence = "low" | "medium" | "high";
export type UpgradeDifficulty = "easy" | "moderate" | "advanced" | "experimental";
export type PlatformConstraintSeverity = "info" | "warning" | "hard-limit";
export type PlatformWorkloadImpact = "very-low" | "low" | "moderate" | "high";

export type PlatformKnowledgeCategory =
  | "hidden-opportunity"
  | "known-limitation"
  | "bios-quirk"
  | "community-discovery"
  | "reliability"
  | "noise"
  | "thermals"
  | "psu"
  | "cooling"
  | "gpu-clearance"
  | "ram"
  | "pcie"
  | "nvme"
  | "ecc"
  | "dual-cpu"
  | "local-ai"
  | "engineering";

export type PlatformAdapterId =
  | "pcie-nvme-adapter"
  | "pcie-wifi-card"
  | "usb-c-expansion-card"
  | "ten-gbe-nic"
  | "pcie-usb-controller"
  | "m2-to-pcie-adapter"
  | "mini-pcie-adapter"
  | "sas-hba";

export type PlatformPotentialScore = {
  communitySupport: number;
  engineeringFlexibility: number;
  expandability: number;
  hiddenValue: number;
  longevity: number;
  overall: number;
  upgradeCeiling: number;
};

export type PlatformSpecifications = {
  cpuSocket: string;
  dualCpuSupport: boolean;
  eccSupport: "none" | "udimm" | "rdimm" | "lrdimm";
  gpuClearanceMm: number;
  maxCpuGeneration: string;
  maxRamGb: number;
  nvmeSupport: "native" | "adapter" | "limited" | "none";
  pcieGeneration: number;
  psuNotes: string;
  ramType: string;
  sataPorts: number;
};

export type PlatformKnowledgeCard = {
  body: string;
  category: PlatformKnowledgeCategory;
  confidence: KnowledgeConfidence;
  id: string;
  title: string;
};

export type PlatformConstraint = {
  confidence: KnowledgeConfidence;
  description: string;
  id: string;
  mitigation?: string;
  severity: PlatformConstraintSeverity;
  title: string;
};

export type PlatformUpgradeImprovement = Partial<
  Record<"cuda" | "engineering" | "gaming" | "localLlm" | "networking" | "storage", string>
>;

export type PlatformUpgradeOpportunity = {
  adapterIds?: PlatformAdapterId[];
  confidence: KnowledgeConfidence;
  difficulty: UpgradeDifficulty;
  estimatedCostUsd: number;
  expectedBenefitRating: 1 | 2 | 3 | 4 | 5;
  id: string;
  improvements?: PlatformUpgradeImprovement;
  prerequisites?: string[];
  recommendedSlotIds?: BuildSlotId[];
  summary: string;
  title: string;
  type: "hidden-opportunity" | "high-impact-upgrade" | "community-mod" | "risk-managed-reuse";
};

export type PlatformPcieSlot = {
  electricalLanes: 1 | 2 | 4 | 8 | 16;
  generation: 2 | 3 | 4 | 5;
  id: string;
  notes: string;
  physicalSize: "x1" | "x4" | "x8" | "x16";
  priority: "primary-gpu" | "secondary-gpu" | "storage" | "networking" | "utility";
};

export type PlatformPcieBottleneck = {
  impact: PlatformWorkloadImpact;
  reason: string;
  workload: "gaming" | "cuda" | "local-ai" | "large-dataset-transfer" | "networking";
};

export type PlatformUpgradeTimelineStep = {
  description: string;
  id: string;
  title: string;
};

export type PlatformKnowledgeProfile = {
  aliases: string[];
  constraints: PlatformConstraint[];
  family: string;
  id: PlatformKnowledgeId;
  knowledgeCards: PlatformKnowledgeCard[];
  manufacturer: string;
  modelYears: string;
  name: string;
  pcieBottlenecks: PlatformPcieBottleneck[];
  pcieSlots: PlatformPcieSlot[];
  potential: PlatformPotentialScore;
  specifications: PlatformSpecifications;
  summary: string;
  timeline: PlatformUpgradeTimelineStep[];
  upgradeOpportunities: PlatformUpgradeOpportunity[];
};

export type AdapterIntelligenceProfile = {
  compatibilityConfidence: KnowledgeConfidence;
  costUsd: number;
  difficulty: UpgradeDifficulty;
  expectedPerformance: string;
  id: PlatformAdapterId;
  notes: string[];
  recommendedPlatformIds: PlatformKnowledgeId[];
  title: string;
  type:
    | "storage"
    | "networking"
    | "usb"
    | "gpu-path"
    | "memory-path"
    | "controller";
};

export type PlatformKnowledgeLink = {
  componentId?: string;
  confidence: KnowledgeConfidence;
  platformId: PlatformKnowledgeId;
  reason: string;
  sourceListingId?: string;
};

export type PlatformKnowledgeInsight = {
  adapterCount: number;
  constraintCount: number;
  matchedBy: "component" | "source-listing" | "alias" | "none";
  matchedLabel?: string;
  opportunityCount: number;
  pcieSummary: string;
  platformId: PlatformKnowledgeId;
  platformName: string;
  potentialScore: number;
  summary: string;
};
