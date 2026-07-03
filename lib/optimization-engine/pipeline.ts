import { buildWorkspaceSlotDefinitions } from "@/data/solution-builder";
import {
  getComponentById,
  getComponentsForSlot,
  toWorkspaceSelection
} from "@/lib/component-inventory";
import { createBuildWorkspaceModel } from "@/lib/solution-builder/workspace";
import type { ComponentInventoryItem } from "@/types/component-inventory";
import type {
  BuildSlotId,
  BuildWorkspaceEvaluation,
  BuildWorkspaceProject,
  BuildWorkspaceSlot
} from "@/types/solution-builder";
import type {
  OptimizationCandidate,
  OptimizationDepth,
  OptimizationGoal,
  OptimizationInput,
  OptimizationMetrics,
  OptimizationResult,
  OptimizationSuggestion
} from "@/types/optimization";

const requiredSlotIds = buildWorkspaceSlotDefinitions
  .filter((definition) => definition.requirement === "required")
  .map((definition) => definition.id);

const pipelineSteps = [
  "Candidate Solutions",
  "Compatibility Filter",
  "Decision Engine",
  "Optimization Pass",
  "Ranking",
  "Explainability"
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getSelectedComponent(slot: BuildWorkspaceSlot) {
  return getComponentById(slot.selectedHardware?.componentId);
}

function getComponentPower(component: ComponentInventoryItem | null) {
  if (!component) {
    return 0;
  }

  return (
    component.facts.boardPowerWatts ??
    component.facts.tdpWatts ??
    Math.max(0, Math.round((component.facts.wattage ?? 0) * 0.2))
  );
}

function getComponentPerformance(component: ComponentInventoryItem | null) {
  if (!component) {
    return 0;
  }

  const title = component.title.toLowerCase();
  const tagText = component.tags.join(" ").toLowerCase();
  let score = 42 + component.price / 6;

  if (component.category === "gpu") {
    score += 24;
  }

  if (component.category === "cpu") {
    score += 16;
  }

  if (component.category === "ram") {
    score += (component.facts.ramCapacityGb ?? 16) / 2;
  }

  if (component.category === "storage") {
    score += tagText.includes("nvme") ? 12 : 7;
  }

  if (title.includes("3060 ti") || title.includes("6700 xt")) {
    score += 10;
  }

  return clampScore(score);
}

function getComponentReliability(component: ComponentInventoryItem | null) {
  if (!component) {
    return 48;
  }

  const conditionScore = {
    broken: 12,
    excellent: 92,
    fair: 56,
    good: 78
  }[component.condition];
  const riskPenalty = Math.min(component.riskNotes.length * 4, 16);

  return clampScore(conditionScore - riskPenalty);
}

function getComponentUpgradeability(component: ComponentInventoryItem | null) {
  if (!component) {
    return 45;
  }

  const facts = component.facts;
  const expansionScore =
    (facts.ramSlotsTotal ?? 0) * 5 +
    (facts.m2SlotsTotal ?? 0) * 6 +
    (facts.sataPortsTotal ?? 0) * 2 +
    (facts.maxGpuLengthMm ?? 0) / 12 +
    (facts.wattage ?? 0) / 16;

  return clampScore(45 + expansionScore);
}

function getProjectComponentCost(project: BuildWorkspaceProject) {
  return project.slots.reduce((total, slot) => {
    return total + (getSelectedComponent(slot)?.price ?? 0);
  }, 0);
}

function getProjectComponentPower(project: BuildWorkspaceProject) {
  return project.slots.reduce((total, slot) => {
    return total + getComponentPower(getSelectedComponent(slot));
  }, 0);
}

function getMetricAverages(project: BuildWorkspaceProject) {
  const selectedComponents = project.slots
    .map((slot) => getSelectedComponent(slot))
    .filter((component): component is ComponentInventoryItem => Boolean(component));

  if (selectedComponents.length === 0) {
    return {
      performance: 30,
      reliability: 45,
      upgradeability: 45
    };
  }

  return {
    performance: clampScore(
      selectedComponents.reduce(
        (total, component) => total + getComponentPerformance(component),
        0
      ) / selectedComponents.length
    ),
    reliability: clampScore(
      selectedComponents.reduce(
        (total, component) => total + getComponentReliability(component),
        0
      ) / selectedComponents.length
    ),
    upgradeability: clampScore(
      selectedComponents.reduce(
        (total, component) => total + getComponentUpgradeability(component),
        0
      ) / selectedComponents.length
    )
  };
}

function scoreCost(project: BuildWorkspaceProject) {
  const cost = getProjectComponentCost(project);

  if (project.budget <= 0) {
    return clampScore(100 - cost / 20);
  }

  return cost <= project.budget
    ? clampScore(100 - (cost / project.budget) * 28)
    : clampScore(72 - ((cost - project.budget) / project.budget) * 120);
}

function scorePower(project: BuildWorkspaceProject) {
  return clampScore(100 - getProjectComponentPower(project) / 8);
}

function getMetrics(
  project: BuildWorkspaceProject,
  evaluation: BuildWorkspaceEvaluation
): OptimizationMetrics {
  const averages = getMetricAverages(project);

  return {
    compatibility: clampScore(
      evaluation.platformHealth -
        evaluation.blockingCount * 8 -
        evaluation.warningCount * 2
    ),
    cost: scoreCost(project),
    performance: averages.performance,
    power: scorePower(project),
    reliability: averages.reliability,
    upgradeability: clampScore(
      (averages.upgradeability + evaluation.upgradePathScore) / 2
    )
  };
}

function getWeightedScore(metrics: OptimizationMetrics, goal: OptimizationGoal) {
  const weights: Record<OptimizationGoal, OptimizationMetrics> = {
    "best-balanced": {
      compatibility: 0.24,
      cost: 0.14,
      performance: 0.18,
      power: 0.08,
      reliability: 0.18,
      upgradeability: 0.18
    },
    "engineering-student": {
      compatibility: 0.22,
      cost: 0.24,
      performance: 0.16,
      power: 0.08,
      reliability: 0.18,
      upgradeability: 0.12
    },
    "maximize-performance": {
      compatibility: 0.18,
      cost: 0.08,
      performance: 0.44,
      power: 0.04,
      reliability: 0.12,
      upgradeability: 0.14
    },
    "maximize-reliability": {
      compatibility: 0.24,
      cost: 0.08,
      performance: 0.12,
      power: 0.08,
      reliability: 0.36,
      upgradeability: 0.12
    },
    "maximize-upgradeability": {
      compatibility: 0.2,
      cost: 0.08,
      performance: 0.14,
      power: 0.06,
      reliability: 0.12,
      upgradeability: 0.4
    },
    "minimize-cost": {
      compatibility: 0.18,
      cost: 0.46,
      performance: 0.08,
      power: 0.1,
      reliability: 0.1,
      upgradeability: 0.08
    },
    "minimize-power-draw": {
      compatibility: 0.2,
      cost: 0.1,
      performance: 0.1,
      power: 0.4,
      reliability: 0.12,
      upgradeability: 0.08
    }
  };
  const weight = weights[goal];

  return clampScore(
    metrics.compatibility * weight.compatibility +
      metrics.cost * weight.cost +
      metrics.performance * weight.performance +
      metrics.power * weight.power +
      metrics.reliability * weight.reliability +
      metrics.upgradeability * weight.upgradeability
  );
}

function getAllowedDepth(component: ComponentInventoryItem, depth: OptimizationDepth) {
  const tagText = component.tags.join(" ").toLowerCase();
  const isAdapter =
    component.category.includes("adapter") ||
    component.category === "egpu-dock" ||
    component.category === "external-psu" ||
    component.category === "thunderbolt-adapter";
  const isEnterprise =
    tagText.includes("workstation") ||
    tagText.includes("enterprise") ||
    tagText.includes("base system");

  if (depth === "experimental") {
    return true;
  }

  if (depth === "enthusiast") {
    return !isAdapter || isEnterprise || component.category === "egpu-dock";
  }

  return (
    !isAdapter &&
    !isEnterprise &&
    component.condition !== "fair" &&
    component.condition !== "broken"
  );
}

function replaceSlotSelection(
  project: BuildWorkspaceProject,
  slotId: BuildSlotId,
  component: ComponentInventoryItem
): BuildWorkspaceProject {
  return {
    ...project,
    slots: project.slots.map((slot) =>
      slot.definitionId === slotId
        ? {
            ...slot,
            selectedHardware: toWorkspaceSelection(component)
          }
        : slot
    )
  };
}

function getAction(slot: BuildWorkspaceSlot) {
  return slot.selectedHardware ? "replace" : "add";
}

function getConfidence(
  candidateEvaluation: BuildWorkspaceEvaluation,
  depth: OptimizationDepth,
  scoreDelta: number
) {
  const depthPenalty = depth === "experimental" ? 12 : depth === "enthusiast" ? 6 : 0;

  return clampScore(
    82 +
      Math.max(0, scoreDelta) * 1.5 -
      candidateEvaluation.blockingCount * 12 -
      candidateEvaluation.warningCount * 2 -
      depthPenalty
  );
}

function getImprovementReason(
  goal: OptimizationGoal,
  slotId: BuildSlotId,
  currentTitle: string | undefined,
  nextTitle: string
) {
  const action = currentTitle
    ? `Replace ${currentTitle} with ${nextTitle}`
    : `Add ${nextTitle}`;

  if (goal === "minimize-cost") {
    return `${action} because it improves the cost-weighted solution score.`;
  }

  if (goal === "maximize-performance") {
    return `${action} because the optimizer found a stronger performance path for ${slotId}.`;
  }

  if (goal === "minimize-power-draw") {
    return `${action} because it improves the power-weighted solution score.`;
  }

  if (goal === "engineering-student") {
    return `${action} because it balances cost, reliability, and engineering usefulness.`;
  }

  return `${action} because it improves the deterministic optimization score.`;
}

function getCandidateSuggestions(
  project: BuildWorkspaceProject,
  input: OptimizationInput,
  baselineMetrics: OptimizationMetrics,
  baselineScore: number,
  baselineEvaluation: BuildWorkspaceEvaluation
): OptimizationCandidate[] {
  return project.slots.flatMap((slot) => {
    if (input.lockedSlots.includes(slot.definitionId)) {
      return [];
    }

    const currentComponent = getSelectedComponent(slot);

    return getComponentsForSlot(slot.definitionId)
      .filter((component) => component.id !== currentComponent?.id)
      .filter((component) => getAllowedDepth(component, input.depth))
      .map((component) => {
        const candidateProject = replaceSlotSelection(
          project,
          slot.definitionId,
          component
        );
        const candidateModel = createBuildWorkspaceModel(candidateProject);
        const metrics = getMetrics(candidateProject, candidateModel.evaluation);
        const score = getWeightedScore(metrics, input.goal);
        const scoreDelta = score - baselineScore;
        const currentPrice = currentComponent?.price ?? 0;
        const suggestion: OptimizationSuggestion = {
          action: getAction(slot),
          category: component.category,
          compatibilityImpact: metrics.compatibility - baselineMetrics.compatibility,
          confidence: getConfidence(
            candidateModel.evaluation,
            input.depth,
            scoreDelta
          ),
          currentComponentId: currentComponent?.id,
          currentComponentTitle: currentComponent?.title,
          estimatedCostDelta: component.price - currentPrice,
          explanation: getImprovementReason(
            input.goal,
            slot.definitionId,
            currentComponent?.title,
            component.title
          ),
          powerImpact: metrics.power - baselineMetrics.power,
          reason: getImprovementReason(
            input.goal,
            slot.definitionId,
            currentComponent?.title,
            component.title
          ),
          reliabilityImpact: metrics.reliability - baselineMetrics.reliability,
          scoreDelta,
          slotId: slot.definitionId,
          suggestedComponent: component,
          upgradeabilityImpact: metrics.upgradeability - baselineMetrics.upgradeability
        };

        return {
          evaluation: candidateModel.evaluation,
          metrics,
          score,
          suggestion
        };
      })
      .filter((candidate) => {
        if (input.depth === "experimental") {
          return candidate.score > baselineScore - 8;
        }

        return (
          candidate.evaluation.blockingCount <= baselineEvaluation.blockingCount &&
          candidate.score > baselineScore - 2
        );
      });
  });
}

function buildOwnedHardwareSuggestions(
  project: BuildWorkspaceProject,
  input: OptimizationInput,
  baselineScore: number
): OptimizationSuggestion[] {
  const noteText = input.projectNotes.join(" ").toLowerCase();
  const suggestions: OptimizationSuggestion[] = [];

  if (project.ownedItems.ssd && !input.lockedSlots.includes("storage")) {
    suggestions.push({
      action: "reuse",
      category: "storage",
      compatibilityImpact: 0,
      confidence: 90,
      estimatedCostDelta: -180,
      explanation: "Reuse the existing SSD before buying another storage device.",
      powerImpact: 2,
      reason: "The project marks an SSD as already owned, so reuse can reduce complete solution cost.",
      reliabilityImpact: 0,
      scoreDelta: Math.max(2, Math.round((100 - baselineScore) * 0.08)),
      slotId: "storage",
      upgradeabilityImpact: 0
    });
  }

  if (
    project.ownedItems.ram &&
    !input.lockedSlots.includes("ram") &&
    (noteText.includes("laptop") || input.depth === "experimental")
  ) {
    const adapter = getComponentById("adapter-sodimm-to-dimm-ddr4");

    suggestions.push({
      action: adapter ? "add" : "reuse",
      category: "laptop-ram-dimm-adapter",
      compatibilityImpact: adapter ? -2 : 0,
      confidence: input.depth === "experimental" ? 76 : 68,
      estimatedCostDelta: adapter ? adapter.price - 240 : -240,
      explanation: "Use a SODIMM adapter path before buying replacement desktop memory.",
      powerImpact: 1,
      reason: "The project owns RAM and notes or depth allow laptop-memory reuse as an optimization path.",
      reliabilityImpact: adapter ? -4 : 0,
      scoreDelta: input.depth === "experimental" ? 5 : 3,
      slotId: adapter ? "laptop-ram-dimm-adapter" : "ram",
      suggestedComponent: adapter ?? undefined,
      upgradeabilityImpact: 2
    });
  }

  if (
    input.depth === "experimental" &&
    (noteText.includes("broken") || noteText.includes("msi laptop"))
  ) {
    const egpuDock = getComponentById("egpu-razer-core-x");

    if (egpuDock && !input.lockedSlots.includes("egpu-dock")) {
      suggestions.push({
        action: "add",
        category: "egpu-dock",
        compatibilityImpact: -4,
        confidence: 72,
        estimatedCostDelta: egpuDock.price,
        explanation: "Explore a laptop salvage path with eGPU expansion and external display planning.",
        powerImpact: -6,
        reason: "Project notes mention a broken laptop, so experimental depth can evaluate harvest and eGPU paths.",
        reliabilityImpact: -6,
        scoreDelta: 4,
        slotId: "egpu-dock",
        suggestedComponent: egpuDock,
        upgradeabilityImpact: 8
      });
    }
  }

  return suggestions;
}

function dedupeSuggestions(suggestions: OptimizationSuggestion[]) {
  const seen = new Set<string>();

  return suggestions.filter((suggestion) => {
    const key = `${suggestion.slotId}:${suggestion.action}:${suggestion.suggestedComponent?.id ?? suggestion.reason}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function explainResult(result: {
  baselineScore: number;
  depth: OptimizationDepth;
  goal: OptimizationGoal;
  lockedSlots: BuildSlotId[];
  optimizedScore: number;
  suggestions: OptimizationSuggestion[];
}) {
  const explanations = [
    `Optimization goal: ${result.goal.replaceAll("-", " ")}.`,
    `Optimization depth: ${result.depth}.`,
    `${result.lockedSlots.length} locked slot${result.lockedSlots.length === 1 ? "" : "s"} were preserved.`
  ];

  if (result.suggestions.length > 0) {
    explanations.push(
      `Top suggestion improves the score by ${result.suggestions[0].scoreDelta} point${result.suggestions[0].scoreDelta === 1 ? "" : "s"}.`
    );
  }

  if (result.optimizedScore <= result.baselineScore) {
    explanations.push(
      "No deterministic swap clearly beats the current build under the selected constraints."
    );
  }

  return explanations;
}

export function optimizeBuildProject(
  project: BuildWorkspaceProject,
  input: OptimizationInput
): OptimizationResult {
  const baselineModel = createBuildWorkspaceModel(project);
  const baselineMetrics = getMetrics(project, baselineModel.evaluation);
  const baselineScore = getWeightedScore(baselineMetrics, input.goal);
  const candidateSuggestions = getCandidateSuggestions(
    project,
    input,
    baselineMetrics,
    baselineScore,
    baselineModel.evaluation
  );
  const ownedSuggestions = buildOwnedHardwareSuggestions(
    project,
    input,
    baselineScore
  );
  const rankedSuggestions = dedupeSuggestions([
    ...candidateSuggestions
      .map((candidate) => candidate.suggestion)
      .sort((left, right) => {
        return (
          right.scoreDelta - left.scoreDelta ||
          right.confidence - left.confidence ||
          left.estimatedCostDelta - right.estimatedCostDelta
        );
      }),
    ...ownedSuggestions
  ])
    .filter((suggestion) => suggestion.scoreDelta > 0 || input.depth === "experimental")
    .slice(0, input.depth === "standard" ? 5 : input.depth === "enthusiast" ? 7 : 9);
  const optimizedScore = clampScore(
    baselineScore +
      rankedSuggestions
        .slice(0, 3)
        .reduce((total, suggestion) => total + Math.max(0, suggestion.scoreDelta), 0)
  );

  return {
    baselineEvaluation: baselineModel.evaluation,
    baselineScore,
    depth: input.depth,
    explanations: explainResult({
      baselineScore,
      depth: input.depth,
      goal: input.goal,
      lockedSlots: input.lockedSlots,
      optimizedScore,
      suggestions: rankedSuggestions
    }),
    goal: input.goal,
    lockedSlots: input.lockedSlots,
    optimizedScore,
    pipeline: pipelineSteps,
    suggestions: rankedSuggestions
  };
}

export { requiredSlotIds as optimizationRequiredSlotIds };
