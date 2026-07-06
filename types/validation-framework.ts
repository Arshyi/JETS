import type { ImporterValidationErrorCode } from "@/types/importer-fixtures";
import type { ListingReadinessStatus } from "@/types/listing-intelligence";
import type {
  MarketplaceNormalizedListing,
  RawMarketplaceListing
} from "@/types/marketplace-intelligence";
import type { OptimizationInput } from "@/types/optimization";
import type { PlatformKnowledgeId } from "@/types/platform-knowledge";
import type {
  BuildSlotId,
  BuildWorkspaceProject
} from "@/types/solution-builder";
import type { ConfidenceLevel } from "@/types/solution-intelligence";

export const validationScenarioIds = [
  "thinkstation-p510",
  "optiplex-7060",
  "precision-5820",
  "hp-z440",
  "gaming-build",
  "ai-workstation",
  "engineering-workstation",
  "budget-office-pc",
  "broken-listing",
  "unknown-listing",
  "low-confidence-listing",
  "duplicate-listing"
] as const;

export type ValidationScenarioId = (typeof validationScenarioIds)[number];

export type ValidationCoverageArea =
  | "marketplace"
  | "listing"
  | "evidence"
  | "platform"
  | "solution"
  | "optimization"
  | "compatibility"
  | "builder";

export type ValidationCoverageMarkers = Partial<
  Record<ValidationCoverageArea, string[]>
>;

export type ValidationProjectSpec = {
  baseProjectId?: "starter-engineering";
  budget: number;
  lockedSlots?: BuildSlotId[];
  notes?: string[];
  selections: Partial<Record<BuildSlotId, string>>;
  title: string;
};

export type HardwareScenarioExpectedOutput = {
  confidence: ConfidenceLevel;
  constraintIds?: string[];
  importerErrorCodes?: ImporterValidationErrorCode[];
  optimizationSuggestionSlots?: BuildSlotId[];
  platformId: PlatformKnowledgeId | null;
  recommendationReadiness: ListingReadinessStatus;
  solutionPath: string;
  validationIssueIds?: string[];
  whyThisWorksIds?: string[];
};

export type HardwareValidationScenario = {
  coverage: ValidationCoverageMarkers;
  expected: HardwareScenarioExpectedOutput;
  id: ValidationScenarioId;
  optimizationInput?: OptimizationInput;
  project?: ValidationProjectSpec;
  rawListings: RawMarketplaceListing[];
  summary: string;
  title: string;
};

export type ValidationAssertion = {
  actual: string | number | null;
  expected: string | number | null;
  message: string;
  passed: boolean;
};

export type ValidationScenarioResult = {
  assertions: ValidationAssertion[];
  coverage: ValidationCoverageMarkers;
  normalized: MarketplaceNormalizedListing;
  observed: {
    confidence: ConfidenceLevel;
    duplicateCandidateCount: number;
    platformId: PlatformKnowledgeId | null;
    readiness: ListingReadinessStatus;
    solutionPath: string | null;
  };
  passed: boolean;
  project?: BuildWorkspaceProject;
  scenario: HardwareValidationScenario;
};

export type PlatformKnowledgeValidationResult = {
  evidenceCount: number;
  issues: string[];
  passed: boolean;
  platformId: PlatformKnowledgeId;
  platformName: string;
  qualityScore: number;
};

export type RuleCoverageResult = {
  covered: string[];
  percent: number;
  total: number;
  uncovered: string[];
};

export type HardwareValidationSuiteResult = {
  compatibilityFixtureFailures: string[];
  generatedAt: string;
  overallPassRate: number;
  passed: boolean;
  platformKnowledge: PlatformKnowledgeValidationResult[];
  ruleCoverage: Record<ValidationCoverageArea, RuleCoverageResult>;
  scenarioResults: ValidationScenarioResult[];
  summary: {
    failedScenarios: number;
    passedScenarios: number;
    platformWarnings: number;
    scenarios: number;
  };
};
