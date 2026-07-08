import type { EvidenceRecord, EvidenceVerificationStatus } from "@/types/evidence";
import type { PlatformKnowledgeId } from "@/types/platform-knowledge";
import type {
  HardwarePlaybook,
  HardwarePlaybookRecommendation,
  PlaybookPlatformId
} from "@/types/playbook";
import type { BuildSlotId } from "@/types/solution-builder";
import type { HardwareStrategyTypeId } from "@/types/strategy";

export const engineeringActionTaskTypes = [
  "install-adapter",
  "replace-psu",
  "upgrade-ram",
  "install-gpu",
  "flash-bios",
  "update-firmware",
  "replace-storage",
  "replace-cooling",
  "cable-management",
  "thermal-inspection",
  "power-verification",
  "stress-testing"
] as const;

export const engineeringActionTaskStatuses = [
  "recommended",
  "accepted",
  "skipped",
  "rejected",
  "completed"
] as const;

export type EngineeringActionTaskType = (typeof engineeringActionTaskTypes)[number];
export type EngineeringActionTaskStatus =
  (typeof engineeringActionTaskStatuses)[number];
export type EngineeringActionDifficulty = "Easy" | "Moderate" | "Advanced" | "Expert";
export type EngineeringActionPriority = "low" | "medium" | "high" | "critical";
export type EngineeringActionRisk = "low" | "medium" | "high" | "critical";

export type EngineeringActionTask = {
  dependencyTaskIds: string[];
  description: string;
  difficulty: EngineeringActionDifficulty;
  estimatedCostUsd: number;
  estimatedTimeMinutes: number;
  evidenceRecordIds: Array<EvidenceRecord["id"]>;
  id: string;
  isOptional: boolean;
  priority: EngineeringActionPriority;
  recommendation: {
    playbookId: HardwarePlaybook["id"];
    playbookRecommendationId: HardwarePlaybookRecommendation["id"];
    title: string;
  } | null;
  resolvesValidationIssueIds: string[];
  risk: EngineeringActionRisk;
  slotIds: BuildSlotId[];
  sortOrder: number;
  source: {
    platformId: PlaybookPlatformId | PlatformKnowledgeId | null;
    platformName: string | null;
    strategyId: HardwareStrategyTypeId | string | null;
    strategyTitle: string | null;
  };
  title: string;
  type: EngineeringActionTaskType;
  verification: EvidenceVerificationStatus;
};

export type EngineeringActionPlanProgress = {
  acceptedTasks: number;
  blockedTasks: number;
  completedTasks: number;
  estimatedRemainingCostUsd: number;
  estimatedRemainingTimeMinutes: number;
  knowledgeCoveragePercent: number;
  overallCompletionPercent: number;
  platformImprovementPercent: number;
  projectMaturityPercent: number;
  rejectedTasks: number;
  resolvedValidationIssueIds: string[];
  skippedTasks: number;
  totalTasks: number;
  validationProgressPercent: number;
};

export type EngineeringActionPlan = {
  generatedFrom: {
    builderValidationIssueCount: number;
    playbookIds: Array<HardwarePlaybook["id"]>;
    projectCompletionPercent: number;
    strategyId: HardwareStrategyTypeId | string | null;
  };
  id: string;
  platformId: PlaybookPlatformId | PlatformKnowledgeId | null;
  platformName: string | null;
  progress: EngineeringActionPlanProgress;
  projectId: string;
  projectTitle: string;
  tasks: EngineeringActionTask[];
};

export type EngineeringActionTaskState = {
  status: EngineeringActionTaskStatus;
  updatedAt?: string;
};

export type EngineeringActionPlanState = Record<
  EngineeringActionTask["id"],
  EngineeringActionTaskState
>;

export type ActionPlanValidationResult = {
  assertions: Array<{
    actual: string | number | null;
    expected: string | number | null;
    message: string;
    passed: boolean;
  }>;
  fixtureId: string;
  passed: boolean;
  taskCount: number;
  title: string;
};
