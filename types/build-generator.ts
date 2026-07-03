import type { CompatibilityReport } from "@/types/compatibility";
import type { DecisionEvaluation } from "@/types/decision";
import type { HardwareFormFactor, HardwareListing, HardwareUseCase } from "@/types/hardware";

export const buildGeneratorCountries = [
  "United States",
  "United Arab Emirates",
  "Canada",
  "United Kingdom"
] as const;

export const buildGeneratorCurrencies = ["USD", "AED", "CAD", "GBP"] as const;

export const ownedItemKeys = [
  "monitor",
  "keyboard",
  "mouse",
  "speakers",
  "ssd",
  "hdd",
  "gpu",
  "ram",
  "psu"
] as const;

export const buildGeneratorPreferenceKeys = [
  "preferLaptops",
  "preferDesktops",
  "preferWorkstations",
  "smallFormFactor",
  "lowPowerUsage",
  "quietOperation",
  "upgradeabilityPriority",
  "reliabilityPriority",
  "aestheticsPriority",
  "lowestPricePriority"
] as const;

export const buildRecommendationCategoryIds = [
  "best-overall",
  "best-value",
  "highest-performance",
  "best-engineering",
  "best-ai",
  "best-gaming",
  "best-workstation",
  "sleeper-build"
] as const;

export type BuildGeneratorCountry = (typeof buildGeneratorCountries)[number];
export type BuildGeneratorCurrency = (typeof buildGeneratorCurrencies)[number];
export type OwnedItemKey = (typeof ownedItemKeys)[number];
export type BuildGeneratorPreferenceKey =
  (typeof buildGeneratorPreferenceKeys)[number];
export type BuildRecommendationCategoryId =
  (typeof buildRecommendationCategoryIds)[number];

export type BuildGeneratorPreferences = Record<BuildGeneratorPreferenceKey, boolean>;
export type OwnedItems = Record<OwnedItemKey, boolean>;

export type BuildGeneratorInput = {
  budget: number;
  country: BuildGeneratorCountry;
  currency: BuildGeneratorCurrency;
  ownedItems: OwnedItems;
  preferences: BuildGeneratorPreferences;
  primaryUseCase: HardwareUseCase;
};

export type BuildRecommendationCategory = {
  id: BuildRecommendationCategoryId;
  label: string;
  targetUseCase?: HardwareUseCase;
};

export type BuildRiskLevel = "Low" | "Medium" | "High";

export type BuildCandidateMetrics = {
  compatibilityScore: number;
  decisionScore: number;
  estimatedNegotiationPrice: number;
  estimatedRemainingLifetimeYears: number;
  estimatedShippingWeightLb: number;
  overallScore: number;
  platformHealth: number;
  reliability: number;
  riskLevel: BuildRiskLevel;
  setupCost: number;
  totalEstimatedCost: number;
  upgradeability: number;
};

export type BuildCandidate = {
  compatibilityReport: CompatibilityReport | null;
  decisionEvaluation: DecisionEvaluation;
  formFactor: HardwareFormFactor;
  listing: HardwareListing;
  metrics: BuildCandidateMetrics;
  preferenceScore: number;
  setupNotes: string[];
};

export type BuildAlternative = {
  explanation: string;
  listingId: string;
  metrics: BuildCandidateMetrics;
  title: string;
};

export type BuildRecommendation = {
  alternatives: BuildAlternative[];
  category: BuildRecommendationCategory;
  candidate: BuildCandidate;
  whyThisBuild: string[];
};

export type BuildGeneratorResult = {
  candidates: BuildCandidate[];
  input: BuildGeneratorInput;
  recommendations: BuildRecommendation[];
};
