import type { ComponentCategory, ComponentInventoryItem } from "@/types/component-inventory";
import type { BuildSlotId, BuildWorkspaceEvaluation } from "@/types/solution-builder";

export const optimizationGoals = [
  "best-balanced",
  "minimize-cost",
  "maximize-performance",
  "maximize-reliability",
  "minimize-power-draw",
  "maximize-upgradeability",
  "engineering-student"
] as const;

export const optimizationDepths = [
  "standard",
  "enthusiast",
  "experimental"
] as const;

export const optimizationSuggestionActions = [
  "add",
  "keep",
  "remove",
  "replace",
  "reuse"
] as const;

export type OptimizationGoal = (typeof optimizationGoals)[number];
export type OptimizationDepth = (typeof optimizationDepths)[number];
export type OptimizationSuggestionAction =
  (typeof optimizationSuggestionActions)[number];

export type LockedSlotMap = Partial<Record<BuildSlotId, boolean>>;

export type OptimizationInput = {
  depth: OptimizationDepth;
  goal: OptimizationGoal;
  lockedSlots: BuildSlotId[];
  projectNotes: string[];
};

export type OptimizationMetrics = {
  compatibility: number;
  cost: number;
  performance: number;
  power: number;
  reliability: number;
  upgradeability: number;
};

export type OptimizationSuggestion = {
  action: OptimizationSuggestionAction;
  category?: ComponentCategory;
  compatibilityImpact: number;
  confidence: number;
  currentComponentId?: string;
  currentComponentTitle?: string;
  estimatedCostDelta: number;
  explanation: string;
  powerImpact: number;
  reason: string;
  reasoningPathIds?: string[];
  reliabilityImpact: number;
  scoreDelta: number;
  slotId: BuildSlotId;
  suggestedComponent?: ComponentInventoryItem;
  upgradeabilityImpact: number;
};

export type OptimizationCandidate = {
  evaluation: BuildWorkspaceEvaluation;
  metrics: OptimizationMetrics;
  score: number;
  suggestion: OptimizationSuggestion;
};

export type OptimizationResult = {
  baselineEvaluation: BuildWorkspaceEvaluation;
  baselineScore: number;
  depth: OptimizationDepth;
  explanations: string[];
  goal: OptimizationGoal;
  lockedSlots: BuildSlotId[];
  optimizedScore: number;
  pipeline: string[];
  reasoningPathIds: string[];
  suggestions: OptimizationSuggestion[];
};

export const optimizationGoalLabels: Record<OptimizationGoal, string> = {
  "best-balanced": "Best balanced",
  "engineering-student": "Engineering student",
  "maximize-performance": "Maximize performance",
  "maximize-reliability": "Maximize reliability",
  "maximize-upgradeability": "Maximize upgradeability",
  "minimize-cost": "Minimize cost",
  "minimize-power-draw": "Minimize power draw"
};

export const optimizationDepthLabels: Record<OptimizationDepth, string> = {
  enthusiast: "Enthusiast",
  experimental: "Experimental",
  standard: "Standard"
};
