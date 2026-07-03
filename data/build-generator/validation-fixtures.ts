import { defaultBuildGeneratorInput } from "@/lib/build-generator/config";
import { generateBuildRecommendations } from "@/lib/build-generator/engine";
import type { BuildGeneratorInput } from "@/types/build-generator";

export type BuildGeneratorValidationFixture = {
  expectedMinimumRecommendations: number;
  input: BuildGeneratorInput;
  name: string;
  reason: string;
};

export const buildGeneratorValidationFixtures: BuildGeneratorValidationFixture[] = [
  {
    expectedMinimumRecommendations: 8,
    input: defaultBuildGeneratorInput,
    name: "default gaming workflow",
    reason:
      "The default workflow should produce every required recommendation category from complete mock systems."
  },
  {
    expectedMinimumRecommendations: 8,
    input: {
      ...defaultBuildGeneratorInput,
      budget: 1200,
      preferences: {
        ...defaultBuildGeneratorInput.preferences,
        preferWorkstations: true,
        reliabilityPriority: true,
        upgradeabilityPriority: true
      },
      primaryUseCase: "engineering"
    },
    name: "engineering workstation workflow",
    reason:
      "Engineering preferences should still produce all categories while favoring workstation reliability and expansion."
  },
  {
    expectedMinimumRecommendations: 8,
    input: {
      ...defaultBuildGeneratorInput,
      budget: 500,
      ownedItems: {
        ...defaultBuildGeneratorInput.ownedItems,
        monitor: true,
        keyboard: true,
        mouse: true
      },
      preferences: {
        ...defaultBuildGeneratorInput.preferences,
        lowestPricePriority: true,
        smallFormFactor: true
      },
      primaryUseCase: "programming"
    },
    name: "budget programming workflow",
    reason:
      "Owned peripherals and low-price priority should keep the generator useful for a low-budget programming setup."
  }
];

export function getBuildGeneratorValidationResults() {
  return buildGeneratorValidationFixtures.map((fixture) => {
    const result = generateBuildRecommendations(fixture.input);

    return {
      ...fixture,
      passed: result.recommendations.length >= fixture.expectedMinimumRecommendations,
      recommendationCount: result.recommendations.length
    };
  });
}
