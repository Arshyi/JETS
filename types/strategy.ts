import type {
  BuildGeneratorCountry,
  BuildGeneratorCurrency,
  OwnedItems
} from "@/types/build-generator";
import type { HardwareUseCase } from "@/types/hardware";

export const strategyTypeIds = [
  "upgrade-existing-machine",
  "buy-used-workstation",
  "build-from-scratch",
  "laptop-egpu",
  "mini-pc",
  "server-conversion",
  "repair-existing-hardware",
  "wait-for-better-value",
  "hybrid-strategy"
] as const;

export const strategyRiskToleranceIds = ["low", "medium", "high"] as const;
export const strategyNoisePreferenceIds = [
  "quiet",
  "balanced",
  "performance"
] as const;
export const strategyPowerConstraintIds = ["strict", "moderate", "none"] as const;
export const strategyPortabilityIds = [
  "required",
  "nice-to-have",
  "not-needed"
] as const;
export const strategyRepairWillingnessIds = [
  "none",
  "minor",
  "moderate",
  "major"
] as const;
export const strategyTimeHorizonIds = ["short", "medium", "long"] as const;

export type HardwareStrategyTypeId = (typeof strategyTypeIds)[number];
export type StrategyRiskTolerance = (typeof strategyRiskToleranceIds)[number];
export type StrategyNoisePreference = (typeof strategyNoisePreferenceIds)[number];
export type StrategyPowerConstraint = (typeof strategyPowerConstraintIds)[number];
export type StrategyPortability = (typeof strategyPortabilityIds)[number];
export type StrategyRepairWillingness =
  (typeof strategyRepairWillingnessIds)[number];
export type StrategyTimeHorizon = (typeof strategyTimeHorizonIds)[number];

export type StrategyAcquisitionInput = {
  acquisitionId?: string;
  condition: string;
  confidence: "low" | "medium" | "high";
  currency: BuildGeneratorCurrency;
  detectedPlatformId: string | null;
  detectedPlatformName: string | null;
  priceAmount: number | null;
  readiness: string;
  recommendationPreviewScore: number;
  status?: string;
  title: string;
};

export type StrategyInput = {
  acquisitions: StrategyAcquisitionInput[];
  budget: number;
  country: BuildGeneratorCountry;
  currency: BuildGeneratorCurrency;
  goals: HardwareUseCase[];
  noisePreference: StrategyNoisePreference;
  ownedHardware: OwnedItems;
  portability: StrategyPortability;
  powerConstraint: StrategyPowerConstraint;
  region: string;
  repairWillingness: StrategyRepairWillingness;
  riskTolerance: StrategyRiskTolerance;
  timeHorizon: StrategyTimeHorizon;
};

export type StrategyTradeoffMatrix = {
  confidence: number;
  cost: number;
  difficulty: number;
  futureExpansion: number;
  noise: number;
  performance: number;
  platformPotential: number;
  powerDraw: number;
  reliability: number;
  repairability: number;
  upgradeability: number;
};

export type StrategyTradeoffKey = keyof StrategyTradeoffMatrix;

export type StrategyTradeoffDefinition = {
  description: string;
  direction: "higher-better" | "lower-better";
  label: string;
};

export const strategyTradeoffDefinitions: Record<
  StrategyTradeoffKey,
  StrategyTradeoffDefinition
> = {
  confidence: {
    description: "How strongly the deterministic rules support this path.",
    direction: "higher-better",
    label: "Confidence"
  },
  cost: {
    description: "Estimated cost burden. Lower is better.",
    direction: "lower-better",
    label: "Cost"
  },
  difficulty: {
    description: "Setup and validation difficulty. Lower is better.",
    direction: "lower-better",
    label: "Difficulty"
  },
  futureExpansion: {
    description: "How much future hardware growth the path leaves open.",
    direction: "higher-better",
    label: "Future expansion"
  },
  noise: {
    description: "Expected acoustic burden. Lower is better.",
    direction: "lower-better",
    label: "Noise"
  },
  performance: {
    description: "Expected task performance before optimization.",
    direction: "higher-better",
    label: "Performance"
  },
  platformPotential: {
    description: "How much the platform can benefit from known JETS opportunities.",
    direction: "higher-better",
    label: "Platform potential"
  },
  powerDraw: {
    description: "Estimated power burden. Lower is better.",
    direction: "lower-better",
    label: "Power draw"
  },
  reliability: {
    description: "Expected day-to-day stability and supportability.",
    direction: "higher-better",
    label: "Reliability"
  },
  repairability: {
    description: "How practical repairs and part swaps are.",
    direction: "higher-better",
    label: "Repairability"
  },
  upgradeability: {
    description: "How well the path accepts better parts later.",
    direction: "higher-better",
    label: "Upgradeability"
  }
};

export type StrategyProjectSeed = {
  branchNotes: string;
  budget: number;
  country: BuildGeneratorCountry;
  currency: BuildGeneratorCurrency;
  ownedHardware: OwnedItems;
  purpose: HardwareUseCase;
  title: string;
};

export type HardwareStrategyRecommendation = {
  confidence: number;
  encyclopediaEntryIds: string[];
  expectedLifespanYears: number;
  hiddenOpportunities: string[];
  id: string;
  overallScore: number;
  projectSeed: StrategyProjectSeed | null;
  rank: number;
  risks: string[];
  shouldCreateProject: boolean;
  sourceAcquisitionIds: string[];
  summary: string;
  title: string;
  tradeoffs: StrategyTradeoffMatrix;
  type: HardwareStrategyTypeId;
  whyAlternativesRankedLower: string[];
  whyChosen: string[];
};

export type StrategyComparisonHighlight = {
  bestStrategyId: string;
  explanation: string;
  label: string;
};

export type StrategyEngineResult = {
  comparison: StrategyComparisonHighlight[];
  input: StrategyInput;
  recommendations: HardwareStrategyRecommendation[];
};

export type StrategyValidationFixture = {
  expectedTopStrategy: HardwareStrategyTypeId;
  expectedTopThree?: HardwareStrategyTypeId[];
  id: string;
  input: StrategyInput;
  title: string;
};
