import type {
  BuildGeneratorInput,
  BuildRecommendationCategoryId,
  BuildRiskLevel
} from "@/types/build-generator";

export const buildSnapshotStatuses = [
  "reviewing",
  "accepted",
  "rejected",
  "purchased",
  "archived"
] as const;

export type BuildSnapshotStatus = (typeof buildSnapshotStatuses)[number];

export const buildSnapshotStatusLabels: Record<BuildSnapshotStatus, string> = {
  accepted: "Accepted",
  archived: "Archived",
  purchased: "Purchased",
  rejected: "Rejected",
  reviewing: "Reviewing"
};

export type BuildSnapshotAlternative = {
  compatibilityScore: number;
  decisionScore: number;
  explanation: string;
  listingId: string;
  overallScore: number;
  title: string;
};

export type BuildSnapshotRecommendation = {
  categoryId: BuildRecommendationCategoryId;
  categoryLabel: string;
  compatibilityScore: number;
  decisionScore: number;
  estimatedNegotiationPrice: number;
  estimatedRemainingLifetimeYears: number;
  estimatedShippingWeightLb: number;
  listingId: string;
  overallScore: number;
  platformHealth: number;
  reliability: number;
  riskLevel: BuildRiskLevel;
  title: string;
  upgradeability: number;
  whyThisBuild: string[];
  alternatives: BuildSnapshotAlternative[];
};

export type BuildDecisionSnapshot = {
  appVersion: string;
  candidatesCount: number;
  createdAt: string;
  input: BuildGeneratorInput;
  recommendations: BuildSnapshotRecommendation[];
  summary: {
    averageCompatibilityScore: number;
    averageOverallScore: number;
    scoreSpread: number;
    topRecommendation: BuildSnapshotRecommendation | null;
  };
};

export type SnapshotScoreDelta = {
  compatibilityScore: number;
  decisionScore: number;
  overallScore: number;
  platformHealth: number;
};
