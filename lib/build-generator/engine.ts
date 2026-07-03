import { mockCompatibilityProfiles } from "@/data/compatibility/profiles";
import { mockHardwareListings } from "@/data/mock-listings";
import {
  buildRecommendationCategories,
  convertCurrencyToUsd,
  countryShippingWeightMultiplier,
  ownedItemSetupCostsUsd
} from "@/lib/build-generator/config";
import { evaluateCompatibility } from "@/lib/compatibility-engine/engine";
import { evaluateHardwareListing } from "@/lib/decision-engine/ranking";
import type {
  BuildCandidate,
  BuildCandidateMetrics,
  BuildGeneratorInput,
  BuildGeneratorResult,
  BuildRecommendation,
  BuildRecommendationCategory,
  BuildRiskLevel
} from "@/types/build-generator";
import type { CompatibilityReport } from "@/types/compatibility";
import type { HardwareListing, HardwareUseCase } from "@/types/hardware";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getCompatibilityScore(report: CompatibilityReport | null) {
  if (!report) {
    return 45;
  }

  return clampScore(
    report.summary.platformHealthScore -
      report.summary.incompatibleCount * 12 -
      report.summary.warningCount * 3
  );
}

function getRiskLevel(
  listing: HardwareListing,
  riskScore: number,
  report: CompatibilityReport | null
): BuildRiskLevel {
  if (
    listing.condition === "broken" ||
    riskScore < 45 ||
    (report?.summary.incompatibleCount ?? 0) >= 2
  ) {
    return "High";
  }

  if (riskScore < 68 || (report?.summary.warningCount ?? 0) >= 5) {
    return "Medium";
  }

  return "Low";
}

function getEstimatedShippingWeightLb(
  listing: HardwareListing,
  input: BuildGeneratorInput
) {
  const text = `${listing.weightClass} ${listing.title}`.toLowerCase();
  let weight = 18;

  if (listing.formFactor === "laptop") {
    weight = 6;
  } else if (listing.formFactor === "component") {
    weight = text.includes("triple") ? 5 : 3;
  } else if (text.includes("tiny")) {
    weight = 5;
  } else if (text.includes("sff") || text.includes("small form factor")) {
    weight = 12;
  } else if (text.includes("heavy workstation")) {
    weight = 42;
  } else if (text.includes("full tower")) {
    weight = 32;
  } else if (text.includes("workstation")) {
    weight = 34;
  }

  return Math.round(weight * countryShippingWeightMultiplier[input.country]);
}

function getSetupCost(input: BuildGeneratorInput) {
  return Object.entries(input.ownedItems).reduce((total, [item, owned]) => {
    return owned ? total : total + ownedItemSetupCostsUsd[item as keyof typeof ownedItemSetupCostsUsd];
  }, 0);
}

function getSetupNotes(input: BuildGeneratorInput) {
  const missing = Object.entries(input.ownedItems)
    .filter(([, owned]) => !owned)
    .map(([item]) => item);

  if (missing.length === 0) {
    return ["Existing peripherals and spare parts reduce the full setup cost."];
  }

  return [
    `${missing.length} setup item${missing.length === 1 ? "" : "s"} not marked owned.`,
    "Budget includes a small deterministic allowance for missing monitor, input, and audio basics."
  ];
}

function getPreferenceScore(
  listing: HardwareListing,
  input: BuildGeneratorInput,
  report: CompatibilityReport | null
) {
  const preferences = input.preferences;
  let score = 0;
  const text = `${listing.title} ${listing.weightClass} ${listing.summary}`.toLowerCase();

  if (preferences.preferLaptops && listing.formFactor === "laptop") {
    score += 12;
  }

  if (preferences.preferDesktops && listing.formFactor === "desktop") {
    score += 10;
  }

  if (preferences.preferWorkstations && listing.formFactor === "workstation") {
    score += 12;
  }

  if (preferences.smallFormFactor && (text.includes("sff") || text.includes("tiny") || listing.formFactor === "laptop")) {
    score += 10;
  }

  if (preferences.lowPowerUsage && (listing.formFactor === "laptop" || text.includes("tiny") || text.includes("sff"))) {
    score += 8;
  }

  if (preferences.quietOperation && (listing.formFactor === "workstation" || text.includes("thinkpad") || text.includes("tiny"))) {
    score += 6;
  }

  if (preferences.upgradeabilityPriority) {
    score += Math.round((report?.summary.upgradePathScore ?? listing.scores.upgradePotential) / 14);
  }

  if (preferences.reliabilityPriority) {
    score += Math.round(listing.scores.reliability / 16);
  }

  if (preferences.aestheticsPriority) {
    score += Math.round(listing.scores.aesthetic / 16);
  }

  if (preferences.lowestPricePriority && listing.predictedNegotiatedPrice <= convertCurrencyToUsd(input.budget, input.currency) * 0.7) {
    score += 10;
  }

  return clampScore(score);
}

function getRemainingLifetimeYears(
  listing: HardwareListing,
  report: CompatibilityReport | null
) {
  const health = report?.summary.platformHealthScore ?? 60;
  const reliability = listing.scores.reliability;
  const conditionPenalty = listing.condition === "broken" ? 2.5 : listing.condition === "fair" ? 1 : 0;

  return Math.max(
    0.5,
    Math.round((1.2 + health / 28 + reliability / 45 - conditionPenalty) * 10) / 10
  );
}

function getOverallScore(
  listing: HardwareListing,
  metrics: Omit<BuildCandidateMetrics, "overallScore" | "riskLevel">,
  input: BuildGeneratorInput,
  preferenceScore: number
) {
  const budgetUsd = convertCurrencyToUsd(input.budget, input.currency);
  const budgetScore =
    metrics.totalEstimatedCost <= budgetUsd
      ? 100
      : clampScore(100 - ((metrics.totalEstimatedCost - budgetUsd) / Math.max(budgetUsd, 1)) * 130);
  const ownedComponentBoost =
    Number(input.ownedItems.gpu) * 2 +
    Number(input.ownedItems.ram) * 2 +
    Number(input.ownedItems.ssd) * 1 +
    Number(input.ownedItems.psu) * 1;
  const completenessPenalty = listing.formFactor === "component" ? 24 : 0;

  return clampScore(
    metrics.decisionScore * 0.34 +
      metrics.compatibilityScore * 0.22 +
      metrics.reliability * 0.14 +
      metrics.upgradeability * 0.12 +
      budgetScore * 0.12 +
      preferenceScore * 0.06 +
      ownedComponentBoost -
      completenessPenalty
  );
}

function createCandidate(
  listing: HardwareListing,
  input: BuildGeneratorInput,
  useCase: HardwareUseCase = input.primaryUseCase
): BuildCandidate {
  const decisionEvaluation = evaluateHardwareListing(listing, useCase);
  const compatibilityProfile = mockCompatibilityProfiles[listing.id];
  const compatibilityReport = compatibilityProfile
    ? evaluateCompatibility(compatibilityProfile)
    : null;
  const compatibilityScore = getCompatibilityScore(compatibilityReport);
  const setupCost = getSetupCost(input);
  const estimatedNegotiationPrice = listing.predictedNegotiatedPrice;
  const totalEstimatedCost = estimatedNegotiationPrice + setupCost;
  const preferenceScore = getPreferenceScore(listing, input, compatibilityReport);
  const partialMetrics = {
    compatibilityScore,
    decisionScore: decisionEvaluation.breakdown.finalScore,
    estimatedNegotiationPrice,
    estimatedRemainingLifetimeYears: getRemainingLifetimeYears(listing, compatibilityReport),
    estimatedShippingWeightLb: getEstimatedShippingWeightLb(listing, input),
    platformHealth: compatibilityReport?.summary.platformHealthScore ?? 50,
    reliability: decisionEvaluation.breakdown.reliability,
    setupCost,
    totalEstimatedCost,
    upgradeability:
      compatibilityReport?.summary.upgradePathScore ??
      decisionEvaluation.breakdown.upgradePotential
  };
  const overallScore = getOverallScore(listing, partialMetrics, input, preferenceScore);
  const metrics = {
    ...partialMetrics,
    overallScore,
    riskLevel: getRiskLevel(
      listing,
      decisionEvaluation.breakdown.risk,
      compatibilityReport
    )
  };

  return {
    compatibilityReport,
    decisionEvaluation,
    formFactor: listing.formFactor,
    listing,
    metrics,
    preferenceScore,
    setupNotes: getSetupNotes(input)
  };
}

function isCompleteSolution(listing: HardwareListing) {
  return listing.formFactor !== "component";
}

function getCategoryScore(
  candidate: BuildCandidate,
  category: BuildRecommendationCategory,
  input: BuildGeneratorInput
) {
  const listing = candidate.listing;

  if (category.id === "best-value") {
    return (
      candidate.decisionEvaluation.breakdown.value * 0.5 +
      candidate.metrics.overallScore * 0.3 +
      (100 - Math.min(candidate.metrics.totalEstimatedCost / Math.max(convertCurrencyToUsd(input.budget, input.currency), 1), 1.5) * 45)
    );
  }

  if (category.id === "highest-performance") {
    return candidate.decisionEvaluation.breakdown.performance * 0.72 + candidate.metrics.compatibilityScore * 0.28;
  }

  if (category.id === "best-workstation") {
    return (
      candidate.metrics.overallScore +
      (listing.formFactor === "workstation" ? 18 : 0) +
      candidate.metrics.upgradeability * 0.18
    );
  }

  if (category.id === "sleeper-build") {
    return listing.scores.sleeper * 0.62 + candidate.metrics.upgradeability * 0.25 + candidate.metrics.overallScore * 0.13;
  }

  if (category.targetUseCase) {
    const targetDecision = evaluateHardwareListing(listing, category.targetUseCase);

    return (
      targetDecision.breakdown.finalScore * 0.62 +
      candidate.metrics.compatibilityScore * 0.22 +
      candidate.metrics.reliability * 0.16
    );
  }

  return candidate.metrics.overallScore;
}

function explainAlternative(winner: BuildCandidate, alternative: BuildCandidate) {
  const reasons: string[] = [];

  if (alternative.metrics.overallScore < winner.metrics.overallScore) {
    reasons.push(`${winner.metrics.overallScore - alternative.metrics.overallScore} points lower overall`);
  }

  if (alternative.metrics.compatibilityScore < winner.metrics.compatibilityScore) {
    reasons.push("weaker compatibility score");
  }

  if (alternative.metrics.reliability < winner.metrics.reliability) {
    reasons.push("lower reliability");
  }

  if (alternative.metrics.totalEstimatedCost > winner.metrics.totalEstimatedCost) {
    reasons.push("higher complete setup cost");
  }

  return reasons.length > 0
    ? reasons.join(", ")
    : "close result, but category scoring favored the selected build";
}

function buildWhyThisBuild(
  candidate: BuildCandidate,
  category: BuildRecommendationCategory,
  input: BuildGeneratorInput
) {
  const reasons: string[] = [];
  const budgetUsd = convertCurrencyToUsd(input.budget, input.currency);

  if (candidate.metrics.totalEstimatedCost <= budgetUsd) {
    reasons.push("Fits budget after estimated negotiation and setup allowance.");
  }

  if (category.targetUseCase && candidate.listing.recommendedUseCases.includes(category.targetUseCase)) {
    reasons.push(`Strong ${category.targetUseCase} fit from the decision engine.`);
  }

  if (candidate.metrics.reliability >= 78) {
    reasons.push("Reliable platform signal for the listed condition.");
  }

  if (candidate.metrics.upgradeability >= 70) {
    reasons.push("Excellent upgrade path from compatibility rules.");
  }

  if (candidate.compatibilityReport?.suggestions.some((suggestion) => suggestion.title.toLowerCase().includes("gpu")) === false) {
    reasons.push("Compatible with the current GPU path and future GPU planning assumptions.");
  }

  if (candidate.listing.scores.aesthetic < 65) {
    reasons.push("Lower aesthetics score due to practical chassis design.");
  }

  if (candidate.metrics.riskLevel === "Low") {
    reasons.push("Low deterministic risk level for this recommendation.");
  }

  if (candidate.setupNotes.length > 0) {
    reasons.push(candidate.setupNotes[0]);
  }

  return reasons.slice(0, 6);
}

function createRecommendation(
  category: BuildRecommendationCategory,
  candidates: BuildCandidate[],
  input: BuildGeneratorInput
): BuildRecommendation {
  const ranked = [...candidates].sort(
    (left, right) =>
      getCategoryScore(right, category, input) - getCategoryScore(left, category, input)
  );
  const winner = ranked[0] ?? candidates[0];
  const alternatives = ranked.slice(1, 4).map((alternative) => ({
    explanation: explainAlternative(winner, alternative),
    listingId: alternative.listing.id,
    metrics: alternative.metrics,
    title: alternative.listing.title
  }));

  return {
    alternatives,
    candidate: winner,
    category,
    whyThisBuild: buildWhyThisBuild(winner, category, input)
  };
}

export function generateBuildRecommendations(
  input: BuildGeneratorInput
): BuildGeneratorResult {
  const completeListings = mockHardwareListings.filter(isCompleteSolution);
  const candidates = completeListings.map((listing) => createCandidate(listing, input));
  const recommendations = buildRecommendationCategories.map((category) =>
    createRecommendation(category, candidates, input)
  );

  return {
    candidates,
    input,
    recommendations
  };
}
