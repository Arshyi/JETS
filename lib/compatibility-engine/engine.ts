import {
  compareStatusPriority,
  thermalRiskFromScore
} from "@/lib/compatibility-engine/helpers";
import { compatibilityRules } from "@/lib/compatibility-engine/rules";
import { buildUpgradeSuggestions } from "@/lib/compatibility-engine/suggestions";
import type {
  CompatibilityProfile,
  CompatibilityReport,
  CompatibilityResult,
  CompatibilityStatus
} from "@/types/compatibility";

function average(values: number[]) {
  return values.length === 0
    ? 0
    : Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function getOverallStatus(results: CompatibilityResult[]): CompatibilityStatus {
  return results
    .map((result) => result.status)
    .sort((left, right) => compareStatusPriority(right) - compareStatusPriority(left))[0];
}

function getRuleScore(results: CompatibilityResult[], ruleId: string, fallback: number) {
  return results.find((result) => result.ruleId === ruleId)?.score ?? fallback;
}

function getPlatformHealthScore(results: CompatibilityResult[]) {
  const platformAge = getRuleScore(results, "platform-age", 70);
  const biosConfidence = getRuleScore(results, "bios-generation-risk", 78);
  const thermalScore = getRuleScore(results, "thermal-risk", 68);
  const upgradePath = getRuleScore(results, "upgrade-path", 62);
  const incompatiblePenalty =
    results.filter((result) => result.status === "Incompatible").length * 14;
  const warningPenalty =
    results.filter((result) => result.status === "Compatible with Warning").length * 4;

  return Math.max(
    0,
    Math.min(
      100,
      Math.round(
        platformAge * 0.25 +
          biosConfidence * 0.15 +
          thermalScore * 0.3 +
          upgradePath * 0.3 -
          incompatiblePenalty -
          warningPenalty
      )
    )
  );
}

export function evaluateCompatibility(
  profile: CompatibilityProfile
): CompatibilityReport {
  const results = compatibilityRules.map((rule) => rule.evaluate(profile));
  const summary = {
    compatibleCount: results.filter((result) => result.status === "Compatible").length,
    confidence: average(results.map((result) => result.confidence)),
    incompatibleCount: results.filter((result) => result.status === "Incompatible").length,
    platformAgeScore: getRuleScore(results, "platform-age", 70),
    platformHealthScore: getPlatformHealthScore(results),
    status: getOverallStatus(results),
    thermalRisk: thermalRiskFromScore(getRuleScore(results, "thermal-risk", 68)),
    upgradePathScore: getRuleScore(results, "upgrade-path", 62),
    warningCount: results.filter(
      (result) => result.status === "Compatible with Warning"
    ).length
  };
  const reportWithoutSuggestions = {
    profile,
    results,
    suggestions: [],
    summary
  };

  return {
    ...reportWithoutSuggestions,
    suggestions: buildUpgradeSuggestions(reportWithoutSuggestions)
  };
}
