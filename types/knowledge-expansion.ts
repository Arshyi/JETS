import type { ComponentCategory } from "@/types/component-inventory";
import type { EvidenceRecord, EvidenceVerificationStatus } from "@/types/evidence";
import type { PlatformEncyclopediaSectionId } from "@/types/platform-encyclopedia";
import type { PlatformAdapterId, PlatformKnowledgeId } from "@/types/platform-knowledge";
import type { ReasoningGraphEdgeType } from "@/types/reasoning-graph";

export const knowledgeExpansionSectionIds = [
  "firmware",
  "bios-revisions",
  "power-topology",
  "thermals",
  "memory-training",
  "pcie-bandwidth",
  "lane-sharing",
  "boot-behavior",
  "noise",
  "known-bugs",
  "replacement-parts",
  "known-repairs",
  "community-discoveries",
  "electrical-limitations"
] as const;

export type KnowledgeExpansionSectionId =
  (typeof knowledgeExpansionSectionIds)[number];

export type ComponentKnowledgeCategory =
  | ComponentCategory
  | "nic"
  | "hba"
  | "cooling"
  | "platform-adapter";

export type KnowledgeExpansionSubjectType = "platform" | "component";

export type KnowledgeExpansionFact = {
  confidence: "low" | "medium" | "high";
  details: string[];
  evidenceIds: Array<EvidenceRecord["id"]>;
  id: string;
  knowledgeQualityScore: number;
  platformSectionId?: PlatformEncyclopediaSectionId;
  sectionId: KnowledgeExpansionSectionId;
  subjectId: PlatformKnowledgeId | ComponentKnowledgeCategory;
  subjectType: KnowledgeExpansionSubjectType;
  summary: string;
  title: string;
  verification: EvidenceVerificationStatus;
};

export type ComponentKnowledgeEntry = {
  category: ComponentKnowledgeCategory;
  facts: KnowledgeExpansionFact[];
  id: string;
  relatedAdapterIds?: PlatformAdapterId[];
  relatedComponentCategories?: ComponentKnowledgeCategory[];
  summary: string;
  title: string;
};

export type KnowledgeRelationshipHint = {
  confidence: number;
  evidenceIds?: Array<EvidenceRecord["id"]>;
  fromId: string;
  reason: string;
  toId: string;
  type: Extract<
    ReasoningGraphEdgeType,
    | "works_better_with"
    | "usually_requires"
    | "commonly_upgraded_with"
    | "shares_failure_mode"
    | "shares_repair_path"
    | "thermal_conflict"
    | "power_conflict"
  >;
};

export type KnowledgeExpansionMetrics = {
  averageFactsPerPlatform: number;
  averageRelationshipsPerPlatform: number;
  componentFactCount: number;
  componentKnowledgeEntries: number;
  evidenceBackedFacts: number;
  evidenceCoveragePercent: number;
  graphEdgeCount: number;
  graphNodeCount: number;
  knowledgeQualityScore: number;
  platformFactCount: number;
  platformRelationshipCount: number;
  supportedPlatformCount: number;
  totalFactCount: number;
  verifiedFactCount: number;
  verificationPercent: number;
};
