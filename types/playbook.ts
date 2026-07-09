import type { EvidenceRecord, EvidenceVerificationStatus } from "@/types/evidence";
import type { HardwareUseCase } from "@/types/hardware";
import type { PlatformKnowledgeId } from "@/types/platform-knowledge";
import type { BuildSlotId } from "@/types/solution-builder";
import type { HardwareStrategyTypeId } from "@/types/strategy";

export const playbookUseCaseIds = [
  "engineering",
  "gaming",
  "ai",
  "home-server",
  "budget",
  "repair",
  "general"
] as const;

export const playbookSectionIds = [
  "overview",
  "recommended-strategies",
  "upgrade-paths",
  "known-bottlenecks",
  "common-mistakes",
  "required-adapters",
  "pcie-considerations",
  "power-considerations",
  "cooling-notes",
  "firmware-bios-notes",
  "storage-guidance",
  "memory-guidance",
  "repair-guidance",
  "platform-lifespan",
  "ideal-workloads"
] as const;

export type PlaybookUseCaseId = (typeof playbookUseCaseIds)[number];
export type PlaybookSectionId = (typeof playbookSectionIds)[number];

export type PlaybookPlatformId =
  | PlatformKnowledgeId
  | "generic-mini-pc"
  | "generic-laptop";

export type PlaybookDifficulty = "Easy" | "Moderate" | "Advanced" | "Expert";
export type PlaybookConfidence = "Low" | "Medium" | "High";

export type HardwarePlaybookSection = {
  id: PlaybookSectionId;
  items: string[];
  summary: string;
  title: string;
};

export type HardwarePlaybookRecommendation = {
  completedWhenSlotIds?: BuildSlotId[];
  confidence: PlaybookConfidence;
  difficulty: PlaybookDifficulty;
  encyclopediaEntryIds?: string[];
  estimatedCostText: string;
  evidenceRecordIds: Array<EvidenceRecord["id"]>;
  id: string;
  knowledgeQualityScore: number;
  reasoningPathIds?: string[];
  slotHints: BuildSlotId[];
  strategyTypes: HardwareStrategyTypeId[];
  summary: string;
  title: string;
  verification: EvidenceVerificationStatus;
  warnings: string[];
};

export type HardwarePlaybook = {
  encyclopediaEntryIds?: string[];
  evidenceRecordIds: Array<EvidenceRecord["id"]>;
  idealWorkloads: HardwareUseCase[];
  id: string;
  knowledgeQualityScore: number;
  platformId: PlaybookPlatformId;
  platformName: string;
  recommendedStrategyTypes: HardwareStrategyTypeId[];
  recommendations: HardwarePlaybookRecommendation[];
  reasoningPathIds?: string[];
  sections: HardwarePlaybookSection[];
  summary: string;
  title: string;
  useCase: PlaybookUseCaseId;
  verification: EvidenceVerificationStatus;
};

export type PlaybookRecommendationProgress = {
  recommendation: HardwarePlaybookRecommendation;
  status: "completed" | "remaining";
};

export type PlaybookProjectProgress = {
  completedRecommendations: PlaybookRecommendationProgress[];
  remainingRecommendations: PlaybookRecommendationProgress[];
  warnings: string[];
};

export type PlaybookValidationResult = {
  assertions: Array<{
    actual: string | number | null;
    expected: string | number | null;
    message: string;
    passed: boolean;
  }>;
  passed: boolean;
  platformId: PlatformKnowledgeId;
  platformName: string;
  playbookCount: number;
};
