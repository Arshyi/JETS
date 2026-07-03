import type {
  BuildGeneratorCountry,
  BuildGeneratorCurrency,
  BuildGeneratorPreferences,
  OwnedItems
} from "@/types/build-generator";
import type { ComponentCategory } from "@/types/component-inventory";
import type {
  HardwareCondition,
  HardwareFormFactor,
  HardwareUseCase
} from "@/types/hardware";

export const buildSlotIds = [
  "chassis",
  "motherboard",
  "cpu",
  "cpu-cooler",
  "ram",
  "gpu",
  "psu",
  "storage",
  "operating-system",
  "capture-card",
  "nic",
  "sound-card",
  "wifi",
  "additional-storage",
  "fans",
  "rgb",
  "accessories",
  "laptop-ram-dimm-adapter",
  "egpu-dock",
  "external-psu",
  "thunderbolt-adapter",
  "pcie-adapter",
  "other-adapter"
] as const;

export const buildValidationAreaIds = [
  "essential-parts",
  "power",
  "physical-fit",
  "pcie",
  "ram",
  "storage",
  "cooling",
  "upgrade-path",
  "platform-health",
  "display"
] as const;

export const solutionStrategyIds = [
  "enterprise-workstation",
  "gaming-desktop",
  "used-gaming-laptop",
  "laptop-egpu",
  "laptop-ram-adapter",
  "repair-risk-workstation",
  "future-solution-path"
] as const;

export const buildProjectBranchSources = [
  "manual",
  "optimization",
  "import"
] as const;

export type BuildSlotId = (typeof buildSlotIds)[number];
export type BuildSlotRequirement = "required" | "optional" | "solution";
export type BuildSlotStatus = "compatible" | "warning" | "missing";
export type BuildValidationAreaId = (typeof buildValidationAreaIds)[number];
export type BuildValidationSeverity = "info" | "warning" | "blocking";
export type BuildProjectStatus = "active" | "archived";
export type BuildProjectBranchSource = (typeof buildProjectBranchSources)[number];
export type SolutionStrategyId = (typeof solutionStrategyIds)[number];
export type SolutionStrategyStage = "active" | "foundation" | "planned";

export type BuildSlotSearchIntent = {
  condition?: HardwareCondition | "all";
  formFactor?: HardwareFormFactor | "all";
  query: string;
  useCase?: HardwareUseCase | "all";
};

export type HardwareSelectionFacts = Partial<{
  airflowRating: number;
  biosGeneration: string;
  boardPowerWatts: number;
  coolerHeightMm: number;
  gpuLengthMm: number;
  gpuSlotHeight: "low-profile" | "full-height";
  maxCoolerHeightMm: number;
  maxGpuLengthMm: number;
  maxRamCapacityGb: number;
  m2SlotsTotal: number;
  m2SlotsUsed: number;
  pcieGeneration: number;
  platformYear: number;
  psuConnectors: string[];
  ramCapacityGb: number;
  ramSlotsTotal: number;
  ramSlotsUsed: number;
  ramType: string;
  requiredBiosGeneration: string;
  requiredPcieGeneration: number;
  requiredPowerConnectors: string[];
  sataPortsTotal: number;
  sataPortsUsed: number;
  supportsFullHeightGpu: boolean;
  supportedRamType: string;
  tdpWatts: number;
  wattage: number;
}>;

export type WorkspaceHardwareSelection = {
  componentCategory?: ComponentCategory;
  componentId?: string;
  facts?: HardwareSelectionFacts;
  label: string;
  sourceListingId?: string;
};

export type BuildWorkspaceSlotDefinition = {
  description: string;
  id: BuildSlotId;
  label: string;
  requirement: BuildSlotRequirement;
  searchIntent: BuildSlotSearchIntent;
};

export type BuildWorkspaceSlot = {
  definitionId: BuildSlotId;
  notes?: string;
  selectedHardware?: WorkspaceHardwareSelection;
};

export type BuildWorkspaceProject = {
  branchDepth?: number;
  branchName?: string;
  branchNotes?: string;
  branchSource?: BuildProjectBranchSource;
  budget: number;
  country: BuildGeneratorCountry;
  createdAt?: string;
  currency: BuildGeneratorCurrency;
  id: string;
  ownedItems: OwnedItems;
  parentProjectId?: string | null;
  preferences: BuildGeneratorPreferences;
  purpose: HardwareUseCase;
  rootProjectId?: string | null;
  slots: BuildWorkspaceSlot[];
  status?: BuildProjectStatus;
  title: string;
  updatedAt?: string;
};

export type BuildValidationIssue = {
  area: BuildValidationAreaId;
  confidence: number;
  id: string;
  reason: string;
  severity: BuildValidationSeverity;
  slotId?: BuildSlotId;
  title: string;
};

export type BuildValidationAreaSummary = {
  area: BuildValidationAreaId;
  issueCount: number;
  label: string;
  status: BuildSlotStatus;
};

export type EvaluatedBuildWorkspaceSlot = BuildWorkspaceSlot & {
  definition: BuildWorkspaceSlotDefinition;
  inventoryMatches: number;
  issues: BuildValidationIssue[];
  searchHref: string;
  status: BuildSlotStatus;
};

export type BuildWorkspaceEvaluation = {
  areaSummaries: BuildValidationAreaSummary[];
  blockingCount: number;
  completionPercent: number;
  issues: BuildValidationIssue[];
  overallStatus: "Ready" | "Needs review" | "Blocked";
  platformHealth: number;
  slots: EvaluatedBuildWorkspaceSlot[];
  upgradePathScore: number;
  warningCount: number;
};

export type SolutionStrategyDefinition = {
  description: string;
  id: SolutionStrategyId;
  serviceDependencies: string[];
  stage: SolutionStrategyStage;
  title: string;
  tradeoffs: string[];
};

export type SolutionBuilderServiceDependency = {
  href: string;
  name: string;
  role: string;
};

export type CompareAgainstJetsPreview = {
  explanations: string[];
  jetsSolution: {
    href: string;
    score: number;
    title: string;
  };
  yourBuild: {
    score: number;
    title: string;
  };
};

export type BuildWorkspaceModel = {
  comparePreview: CompareAgainstJetsPreview;
  evaluation: BuildWorkspaceEvaluation;
  project: BuildWorkspaceProject;
  services: SolutionBuilderServiceDependency[];
  strategies: SolutionStrategyDefinition[];
};

export type SolutionBuilderMode = {
  description: string;
  href: string;
  id: "build-my-own" | "let-jets-recommend";
  title: string;
};
