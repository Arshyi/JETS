import { appVersion } from "@/lib/app-version";
import { generateBuildRecommendations } from "@/lib/build-generator/engine";
import { useCaseLabels } from "@/types/hardware";
import type {
  BuildGeneratorCurrency,
  BuildGeneratorInput
} from "@/types/build-generator";
import type {
  BuildDecisionSnapshot,
  BuildSnapshotRecommendation,
  BuildSnapshotStatus,
  SnapshotScoreDelta
} from "@/types/build-snapshots";
import { buildSnapshotStatuses } from "@/types/build-snapshots";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

function toSnapshotRecommendation(
  recommendation: ReturnType<typeof generateBuildRecommendations>["recommendations"][number]
): BuildSnapshotRecommendation {
  const { candidate } = recommendation;
  const metrics = candidate.metrics;

  return {
    alternatives: recommendation.alternatives.map((alternative) => ({
      compatibilityScore: alternative.metrics.compatibilityScore,
      decisionScore: alternative.metrics.decisionScore,
      explanation: alternative.explanation,
      listingId: alternative.listingId,
      overallScore: alternative.metrics.overallScore,
      title: alternative.title
    })),
    categoryId: recommendation.category.id,
    categoryLabel: recommendation.category.label,
    compatibilityScore: metrics.compatibilityScore,
    decisionScore: metrics.decisionScore,
    estimatedNegotiationPrice: metrics.estimatedNegotiationPrice,
    estimatedRemainingLifetimeYears: metrics.estimatedRemainingLifetimeYears,
    estimatedShippingWeightLb: metrics.estimatedShippingWeightLb,
    listingId: candidate.listing.id,
    overallScore: metrics.overallScore,
    platformHealth: metrics.platformHealth,
    reliability: metrics.reliability,
    riskLevel: metrics.riskLevel,
    title: candidate.listing.title,
    upgradeability: metrics.upgradeability,
    whyThisBuild: recommendation.whyThisBuild
  };
}

export function getDefaultBuildSnapshotTitle(input: BuildGeneratorInput) {
  return `${useCaseLabels[input.primaryUseCase]} plan - ${input.budget} ${input.currency}`;
}

export function createBuildDecisionSnapshot(
  input: BuildGeneratorInput,
  createdAt = new Date().toISOString()
): BuildDecisionSnapshot {
  const result = generateBuildRecommendations(input);
  const recommendations = result.recommendations.map(toSnapshotRecommendation);
  const overallScores = recommendations.map((recommendation) => recommendation.overallScore);
  const compatibilityScores = recommendations.map(
    (recommendation) => recommendation.compatibilityScore
  );
  const topRecommendation =
    recommendations.find((recommendation) => recommendation.categoryId === "best-overall") ??
    recommendations[0] ??
    null;

  return {
    appVersion,
    candidatesCount: result.candidates.length,
    createdAt,
    input,
    recommendations,
    summary: {
      averageCompatibilityScore: average(compatibilityScores),
      averageOverallScore: average(overallScores),
      scoreSpread:
        overallScores.length > 0
          ? Math.max(...overallScores) - Math.min(...overallScores)
          : 0,
      topRecommendation
    }
  };
}

export function isBuildSnapshotStatus(value: string): value is BuildSnapshotStatus {
  return buildSnapshotStatuses.includes(value as BuildSnapshotStatus);
}

export function readBuildSnapshot(value: unknown): BuildDecisionSnapshot | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.appVersion !== "string" ||
    typeof value.createdAt !== "string" ||
    !isRecord(value.input) ||
    !Array.isArray(value.recommendations) ||
    !isRecord(value.summary)
  ) {
    return null;
  }

  return value as BuildDecisionSnapshot;
}

export function getSnapshotCurrency(snapshot: BuildDecisionSnapshot): BuildGeneratorCurrency {
  return snapshot.input.currency;
}

export function getSnapshotScoreDelta(
  current: BuildSnapshotRecommendation,
  baseline: BuildSnapshotRecommendation
): SnapshotScoreDelta {
  return {
    compatibilityScore: current.compatibilityScore - baseline.compatibilityScore,
    decisionScore: current.decisionScore - baseline.decisionScore,
    overallScore: current.overallScore - baseline.overallScore,
    platformHealth: current.platformHealth - baseline.platformHealth
  };
}
