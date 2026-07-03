import {
  buildWorkspaceSlotDefinitions,
  solutionBuilderServiceDependencies,
  solutionStrategyDefinitions,
  starterEngineeringWorkspaceProject
} from "@/data/solution-builder";
import { mockHardwareListings } from "@/data/mock-listings";
import { generateBuildRecommendations } from "@/lib/build-generator/engine";
import {
  defaultHardwareFilters,
  searchHardwareListings
} from "@/lib/hardware-search";
import { evaluateBuildWorkspace } from "@/lib/solution-builder/rules";
import type { BuildGeneratorInput } from "@/types/build-generator";
import type { HardwareFilters } from "@/types/hardware";
import type {
  BuildSlotId,
  BuildSlotSearchIntent,
  BuildWorkspaceModel,
  BuildWorkspaceProject,
  BuildWorkspaceSlotDefinition,
  CompareAgainstJetsPreview
} from "@/types/solution-builder";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toBuildGeneratorInput(project: BuildWorkspaceProject): BuildGeneratorInput {
  return {
    budget: project.budget,
    country: project.country,
    currency: project.currency,
    ownedItems: project.ownedItems,
    preferences: project.preferences,
    primaryUseCase: project.purpose
  };
}

function filtersFromSearchIntent(intent: BuildSlotSearchIntent): HardwareFilters {
  return {
    ...defaultHardwareFilters,
    condition: intent.condition ?? "all",
    formFactor: intent.formFactor ?? "all",
    query: intent.query,
    useCase: intent.useCase ?? "all"
  };
}

export function getSlotDefinition(slotId: string | undefined) {
  if (!slotId) {
    return null;
  }

  return (
    buildWorkspaceSlotDefinitions.find((definition) => definition.id === slotId) ??
    null
  );
}

export function getSlotSearchHref(definition: BuildWorkspaceSlotDefinition) {
  const params = new URLSearchParams({
    query: definition.searchIntent.query,
    slot: definition.id
  });

  if (definition.searchIntent.formFactor) {
    params.set("formFactor", definition.searchIntent.formFactor);
  }

  if (definition.searchIntent.useCase) {
    params.set("useCase", definition.searchIntent.useCase);
  }

  if (definition.searchIntent.condition) {
    params.set("condition", definition.searchIntent.condition);
  }

  return `/search?${params.toString()}`;
}

export function getSlotInventoryContext(slotId: string | undefined) {
  const definition = getSlotDefinition(slotId);

  if (!definition) {
    return null;
  }

  return {
    description: `${definition.label} candidates from the shared inventory service. These results remain mock data until live ingestion is intentionally added.`,
    slotId: definition.id,
    title: `${definition.label} Inventory`
  };
}

function getInventoryMatchCount(definition: BuildWorkspaceSlotDefinition) {
  return searchHardwareListings(
    mockHardwareListings,
    filtersFromSearchIntent(definition.searchIntent),
    "best-value"
  ).length;
}

function getInventoryCounts() {
  return Object.fromEntries(
    buildWorkspaceSlotDefinitions.map((definition) => [
      definition.id,
      getInventoryMatchCount(definition)
    ])
  ) as Partial<Record<BuildSlotId, number>>;
}

function getYourBuildScore(
  completionPercent: number,
  platformHealth: number,
  upgradePathScore: number,
  blockingCount: number
 ) {
  return clampScore(
    completionPercent * 0.42 +
      platformHealth * 0.36 +
      upgradePathScore * 0.22 -
      blockingCount * 4
  );
}

function getComparePreview(
  project: BuildWorkspaceProject,
  model: Pick<
    ReturnType<typeof evaluateBuildWorkspace>,
    "blockingCount" | "completionPercent" | "issues" | "platformHealth" | "upgradePathScore"
  >
): CompareAgainstJetsPreview {
  const generatorInput = toBuildGeneratorInput(project);
  const generatorResult = generateBuildRecommendations(generatorInput);
  const bestOverall =
    generatorResult.recommendations.find(
      (recommendation) => recommendation.category.id === "best-overall"
    ) ?? generatorResult.recommendations[0];
  const yourBuildScore = getYourBuildScore(
    model.completionPercent,
    model.platformHealth,
    model.upgradePathScore,
    model.blockingCount
  );
  const issueTitles = model.issues
    .filter((issue) => issue.severity !== "info")
    .slice(0, 3)
    .map((issue) => issue.title.toLowerCase());

  return {
    explanations: [
      issueTitles.length
        ? `Your build is held back by ${issueTitles.join(", ")}.`
        : "Your build has no blocking compatibility issues in the current rule set.",
      `${bestOverall.candidate.listing.title} ranks as a complete JETS solution because the existing generator can score the full listing, setup cost, compatibility report, and alternatives together.`,
      "This comparison is intentionally deterministic so future AI explanations can cite stable rule and score inputs instead of inventing new reasoning."
    ],
    jetsSolution: {
      href: "/solution-builder/recommend",
      score: bestOverall.candidate.metrics.overallScore,
      title: bestOverall.candidate.listing.title
    },
    yourBuild: {
      score: yourBuildScore,
      title: project.title
    }
  };
}

export function getBuildWorkspaceModel(): BuildWorkspaceModel {
  const project = starterEngineeringWorkspaceProject;
  const inventoryCounts = getInventoryCounts();
  const evaluation = evaluateBuildWorkspace(project, inventoryCounts);
  const slots = evaluation.slots.map((slot) => ({
    ...slot,
    searchHref: getSlotSearchHref(slot.definition)
  }));
  const completeEvaluation = {
    ...evaluation,
    slots
  };

  return {
    comparePreview: getComparePreview(project, completeEvaluation),
    evaluation: completeEvaluation,
    project,
    services: solutionBuilderServiceDependencies,
    strategies: solutionStrategyDefinitions
  };
}
