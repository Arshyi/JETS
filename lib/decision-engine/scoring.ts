import { getUseCasePreset } from "@/lib/decision-engine/presets";
import type {
  DecisionCandidateInput,
  DecisionEvaluation,
  DecisionScoreBreakdown
} from "@/types/decision";
import type { HardwareCondition, HardwareUseCase } from "@/types/hardware";

const conditionReliability: Record<HardwareCondition, number> = {
  broken: 14,
  excellent: 94,
  fair: 58,
  good: 78
};

const freshnessScore = {
  aging: 72,
  fresh: 100,
  stale: 42
};

const usdPerAed = 0.27;

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getSearchableText(candidate: DecisionCandidateInput) {
  return [
    candidate.title,
    candidate.summary,
    candidate.location,
    candidate.sourceName,
    candidate.weightClass,
    ...candidate.tags,
    ...candidate.riskNotes,
    ...Object.values(candidate.specs)
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function includesAny(text: string, values: string[]) {
  return values.some((value) => text.includes(value));
}

export function normalizePriceToUsd(candidate: DecisionCandidateInput) {
  if (candidate.price === null) {
    return null;
  }

  return candidate.currency === "AED"
    ? Math.round(candidate.price * usdPerAed)
    : candidate.price;
}

function inferPerformanceFromSpecs(candidate: DecisionCandidateInput) {
  const text = getSearchableText(candidate);
  let score = 42;

  if (includesAny(text, ["rtx 4060", "rtx 3070", "rx 6700", "1080 ti"])) {
    score += 34;
  } else if (includesAny(text, ["rtx 3060 ti", "rtx 3060", "a2000"])) {
    score += 28;
  } else if (includesAny(text, ["quadro p2000", "gtx 1650", "p620"])) {
    score += 14;
  }

  if (includesAny(text, ["ryzen 9", "i7-11850", "i7-9700", "w-2135", "8700k"])) {
    score += 16;
  } else if (includesAny(text, ["ryzen 5", "i5-8500", "e5-1650"])) {
    score += 10;
  }

  if (includesAny(text, ["64 gb", "64gb"])) {
    score += 8;
  } else if (includesAny(text, ["32 gb", "32gb"])) {
    score += 5;
  }

  return clampScore(score);
}

function inferAestheticScore(candidate: DecisionCandidateInput) {
  const text = getSearchableText(candidate);
  let score = candidate.formFactor === "laptop" ? 76 : 62;

  if (includesAny(text, ["rog", "zephyrus", "thinkpad", "tiny", "founders"])) {
    score += 14;
  }

  if (includesAny(text, ["alienware", "water damage", "no boot", "for parts"])) {
    score -= 12;
  }

  if (candidate.condition === "excellent") {
    score += 8;
  }

  if (candidate.condition === "fair" || candidate.condition === "broken") {
    score -= 10;
  }

  return clampScore(score);
}

function inferUpgradeScore(candidate: DecisionCandidateInput) {
  const text = getSearchableText(candidate);
  let score = 44;

  if (candidate.formFactor === "workstation") {
    score += 34;
  }

  if (candidate.formFactor === "desktop") {
    score += 24;
  }

  if (candidate.formFactor === "component") {
    score += 16;
  }

  if (includesAny(text, ["tiny", "laptop", "macbook", "sff"])) {
    score -= 18;
  }

  if (includesAny(text, ["ecc", "nvme", "full tower", "mid tower", "p520", "z440"])) {
    score += 12;
  }

  return clampScore(score);
}

export function assignWeightClass(candidate: DecisionCandidateInput) {
  const text = getSearchableText(candidate);

  if (candidate.condition === "broken") {
    return candidate.formFactor === "laptop" ? "Parts laptop" : "Repair-risk hardware";
  }

  if (candidate.formFactor === "component") {
    if (includesAny(text, ["triple", "305 mm", "long"])) {
      return "Long triple-slot GPU";
    }

    return "Dual-slot component";
  }

  if (candidate.formFactor === "laptop") {
    if (includesAny(text, ["a2000", "workstation", "thinkpad p1"])) {
      return "Mobile workstation laptop";
    }

    return includesAny(text, ["gaming", "rog", "zephyrus"])
      ? "Portable gaming laptop"
      : "Portable laptop";
  }

  if (candidate.formFactor === "workstation") {
    return includesAny(text, ["tiny", "p330"])
      ? "Tiny workstation"
      : "Heavy workstation";
  }

  if (includesAny(text, ["sff", "small form factor"])) {
    return "Small form factor desktop";
  }

  if (includesAny(text, ["mini tower", "mt"])) {
    return "Mini tower";
  }

  return candidate.weightClass ?? "Mid tower";
}

// Performance score formula:
// use trusted mock performance when present; otherwise infer from visible CPU,
// GPU, memory, and platform tokens. This keeps the score deterministic while
// letting normalized ingestion rows participate before a real benchmark model.
export function scorePerformance(candidate: DecisionCandidateInput) {
  return clampScore(
    candidate.providedScores?.performance ?? inferPerformanceFromSpecs(candidate)
  );
}

// Value score formula:
// compare performance against effective USD price, then reward prices under the
// use-case budget ceiling and penalize missing prices. The formula intentionally
// favors "enough performance for less money" over raw speed.
export function scoreValue(
  candidate: DecisionCandidateInput,
  useCase: HardwareUseCase,
  performance: number
) {
  const preset = getUseCasePreset(useCase);
  const priceUsd = normalizePriceToUsd(candidate);

  if (priceUsd === null) {
    return 18;
  }

  const budgetFit = clampScore((1 - priceUsd / (preset.budgetCeiling * 1.4)) * 100);
  const performancePerDollar = clampScore(
    (performance / Math.max(priceUsd, 1)) * preset.budgetCeiling * 0.85
  );

  return clampScore(budgetFit * 0.55 + performancePerDollar * 0.45);
}

// Reliability score formula:
// combine condition baseline, trusted mock reliability where available, and
// conservative penalties for repair-risk language. Reliability is "will this
// probably work after purchase", separate from performance.
export function scoreReliability(candidate: DecisionCandidateInput) {
  const text = getSearchableText(candidate);
  const provided = candidate.providedScores?.reliability;
  const baseline = conditionReliability[candidate.condition];
  const blended = provided === undefined ? baseline : provided * 0.65 + baseline * 0.35;
  const riskPenalty = includesAny(text, ["no boot", "no display", "water damage"])
    ? 26
    : 0;

  return clampScore(blended - riskPenalty);
}

// Risk score formula:
// start from condition reliability, subtract one small penalty per explicit risk
// note, then subtract hard penalties for "for parts" failure patterns. Higher is
// safer; broken listings can still be inspected but should not rank casually.
export function scoreRisk(candidate: DecisionCandidateInput) {
  const text = getSearchableText(candidate);
  const notePenalty = Math.min(candidate.riskNotes.length * 5, 30);
  const failurePenalty = includesAny(text, [
    "broken",
    "for parts",
    "liquid",
    "no boot",
    "no display",
    "water damage"
  ])
    ? 34
    : 0;

  return clampScore(conditionReliability[candidate.condition] - notePenalty - failurePenalty);
}

// Freshness score formula:
// v0.4 normalized listings know freshness exactly; v0.2 mock listings do not, so
// they receive a neutral-current score. Fresh rows rank above aging and stale
// rows because stale marketplace data wastes user time.
export function scoreFreshness(candidate: DecisionCandidateInput) {
  return candidate.freshness ? freshnessScore[candidate.freshness] : 84;
}

// Upgrade score formula:
// use trusted mock upgrade scores when present; otherwise infer from form factor
// and expansion keywords. Workstations and towers gain points, tiny/laptop/SFF
// systems lose points because upgrades are physically constrained.
export function scoreUpgradePotential(candidate: DecisionCandidateInput) {
  return clampScore(
    candidate.providedScores?.upgradePotential ?? inferUpgradeScore(candidate)
  );
}

// Aesthetic score formula:
// use trusted mock aesthetic scores when present; otherwise infer from chassis,
// laptop, premium-brand, and condition language. This is intentionally low weight
// for work-focused presets and higher for gaming.
export function scoreAesthetics(candidate: DecisionCandidateInput) {
  return clampScore(candidate.providedScores?.aesthetic ?? inferAestheticScore(candidate));
}

// Shipping penalty formula:
// local pickup is low penalty, online shipping is moderate, heavy workstations
// and repair-risk items add penalty. This is subtracted in the final score
// rather than treated as a positive score.
export function scoreShippingPenalty(candidate: DecisionCandidateInput) {
  const text = getSearchableText(candidate);
  let penalty = includesAny(text, ["online shipping", "uae shipping"]) ? 14 : 4;

  if (candidate.formFactor === "workstation" || includesAny(text, ["heavy", "full tower"])) {
    penalty += 8;
  }

  if (candidate.condition === "broken") {
    penalty += 10;
  }

  if (candidate.formFactor === "component") {
    penalty -= 3;
  }

  return clampScore(penalty);
}

// Use-case fit formula:
// reward explicit recommended-use matches, ideal form factors, and preset
// keywords. This lets "homelab" prefer quiet surplus workstations while gaming
// prefers GPU-forward towers and components.
export function scoreUseCaseFit(
  candidate: DecisionCandidateInput,
  useCase: HardwareUseCase
) {
  const preset = getUseCasePreset(useCase);
  const text = getSearchableText(candidate);
  let score = candidate.recommendedUseCases.includes(useCase) ? 58 : 30;

  if (candidate.recommendedUseCase === useCase) {
    score += 18;
  }

  if (preset.idealFormFactors.includes(candidate.formFactor)) {
    score += 12;
  }

  score += preset.keywords.filter((keyword) => text.includes(keyword)).length * 4;

  return clampScore(score);
}

function buildExplanation(
  candidate: DecisionCandidateInput,
  breakdown: DecisionScoreBreakdown,
  useCase: HardwareUseCase,
  weightClass: string
) {
  const preset = getUseCasePreset(useCase);
  const positives: string[] = [];
  const cautions: string[] = [];

  if (breakdown.value >= 78) {
    positives.push("Strong value after balancing price against expected performance.");
  }

  if (breakdown.useCaseFit >= 78) {
    positives.push(`Clear fit for the ${preset.label} preset.`);
  }

  if (breakdown.upgradePotential >= 78) {
    positives.push("Upgrade path looks flexible for future parts changes.");
  }

  if (breakdown.reliability >= 82) {
    positives.push("Reliability signal is healthy for the listed condition.");
  }

  if (breakdown.shippingPenalty >= 20) {
    cautions.push("Shipping or pickup friction may reduce the practical value.");
  }

  if (breakdown.shippingPenalty > preset.maxShippingPenalty) {
    cautions.push("Shipping friction is above this preset's comfort range.");
  }

  if (breakdown.performance < preset.targetPerformance) {
    cautions.push("Performance is below the target for this use case.");
  }

  if (breakdown.reliability < preset.minimumReliability) {
    cautions.push("Reliability is below this preset's preferred floor.");
  }

  if (breakdown.risk < 55) {
    cautions.push("Risk score is low; verify seller claims before treating it as a deal.");
  }

  if (100 - breakdown.risk > preset.repairRiskTolerance * 3) {
    cautions.push("Repair-risk exposure is high for this preset.");
  }

  if (candidate.condition === "broken") {
    cautions.push("Broken or for-parts listings should be valued as repair inventory.");
  }

  if (candidate.freshness === "stale") {
    cautions.push("Freshness is stale, so availability needs confirmation.");
  }

  return {
    cautions: cautions.slice(0, 3),
    positives: positives.slice(0, 3),
    summary: `${weightClass} ranked ${breakdown.finalScore}/100 for ${preset.label}.`
  };
}

export function evaluateDecisionCandidate(
  candidate: DecisionCandidateInput,
  useCase: HardwareUseCase = candidate.recommendedUseCase
): DecisionEvaluation {
  const preset = getUseCasePreset(useCase);
  const performance = scorePerformance(candidate);
  const value = scoreValue(candidate, useCase, performance);
  const reliability = scoreReliability(candidate);
  const risk = scoreRisk(candidate);
  const freshness = scoreFreshness(candidate);
  const upgradePotential = scoreUpgradePotential(candidate);
  const aesthetics = scoreAesthetics(candidate);
  const shippingPenalty = scoreShippingPenalty(candidate);
  const useCaseFit = scoreUseCaseFit(candidate, useCase);
  const positiveTotal =
    performance * preset.weights.performance +
    value * preset.weights.value +
    reliability * preset.weights.reliability +
    risk * preset.weights.risk +
    freshness * preset.weights.freshness +
    upgradePotential * preset.weights.upgradePotential +
    aesthetics * preset.weights.aesthetics +
    useCaseFit * preset.weights.useCaseFit;
  const weightTotal =
    preset.weights.performance +
    preset.weights.value +
    preset.weights.reliability +
    preset.weights.risk +
    preset.weights.freshness +
    preset.weights.upgradePotential +
    preset.weights.aesthetics +
    preset.weights.useCaseFit;
  const finalScore = clampScore(
    positiveTotal / weightTotal - shippingPenalty * preset.weights.shippingPenalty
  );
  const breakdown = {
    aesthetics,
    finalScore,
    freshness,
    performance,
    reliability,
    risk,
    shippingPenalty,
    upgradePotential,
    useCaseFit,
    value
  };
  const weightClass = assignWeightClass(candidate);

  return {
    breakdown,
    explanation: buildExplanation(candidate, breakdown, useCase, weightClass),
    preset,
    priceUsd: normalizePriceToUsd(candidate),
    weightClass
  };
}
