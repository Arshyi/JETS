import type {
  HardwareCondition,
  HardwareFormFactor,
  HardwareScores,
  HardwareUseCase
} from "@/types/hardware";
import type { FreshnessStatus, MarketplaceCurrency } from "@/types/ingestion";

export type DecisionScoreKey =
  | "performance"
  | "value"
  | "reliability"
  | "risk"
  | "freshness"
  | "upgradePotential"
  | "aesthetics"
  | "shippingPenalty"
  | "useCaseFit";

export type DecisionScoreWeights = Record<DecisionScoreKey, number>;

export type DecisionUseCasePreset = {
  budgetCeiling: number;
  idealFormFactors: HardwareFormFactor[];
  label: string;
  keywords: string[];
  maxShippingPenalty: number;
  minimumReliability: number;
  repairRiskTolerance: number;
  targetPerformance: number;
  useCase: HardwareUseCase;
  weights: DecisionScoreWeights;
};

export type DecisionCandidateInput = {
  condition: HardwareCondition;
  currency: MarketplaceCurrency;
  formFactor: HardwareFormFactor;
  freshness?: FreshnessStatus;
  id: string;
  location: string;
  price: number | null;
  providedScores?: Partial<HardwareScores>;
  recommendedUseCase: HardwareUseCase;
  recommendedUseCases: HardwareUseCase[];
  riskNotes: string[];
  sourceName?: string;
  specs: Record<string, string>;
  summary: string;
  tags: string[];
  title: string;
  weightClass?: string;
};

export type DecisionScoreBreakdown = Record<DecisionScoreKey, number> & {
  finalScore: number;
};

export type DecisionExplanation = {
  cautions: string[];
  positives: string[];
  summary: string;
};

export type DecisionEvaluation = {
  breakdown: DecisionScoreBreakdown;
  explanation: DecisionExplanation;
  preset: DecisionUseCasePreset;
  priceUsd: number | null;
  weightClass: string;
};
