import type { HardwareFormFactor, HardwareUseCase } from "@/types/hardware";

export type CompatibilityStatus =
  | "Compatible"
  | "Compatible with Warning"
  | "Incompatible";

export type CompatibilitySeverity = "low" | "medium" | "high";

export type PowerConnector = "6-pin" | "8-pin" | "12vhpwr" | "sata-power";

export type RamType = "DDR3" | "DDR4" | "DDR5" | "LPDDR4X" | "LPDDR5";

export type StorageInterface = "m2-nvme" | "m2-sata" | "sata-2.5" | "sata-3.5";

export type ExpansionSlotHeight = "low-profile" | "full-height";

export type CpuSpec = {
  generation: string;
  model: string;
  socket: string;
  tdpWatts: number;
  year: number;
};

export type MotherboardSpec = {
  biosGeneration: string;
  chipset: string;
  externalGpuInterfaces?: Array<"thunderbolt-3" | "thunderbolt-4" | "oculink">;
  formFactor: string;
  m2Slots: number;
  maxRamGb: number;
  model: string;
  occupiedM2Slots: number;
  occupiedRamSlots: number;
  occupiedSataPorts: number;
  pcieSlots: Array<{
    height: ExpansionSlotHeight;
    lanes: number;
    version: number;
  }>;
  platformYear: number;
  ramSlots: number;
  ramType: RamType;
  sataPorts: number;
  socket: string;
  supportedCpuGenerations: string[];
  supportedStorageInterfaces: StorageInterface[];
};

export type GpuSpec = {
  height: ExpansionSlotHeight;
  lengthMm: number;
  model: string;
  pcieVersion: number;
  powerConnectors: Partial<Record<PowerConnector, number>>;
  powerWatts: number;
  recommendedPsuWatts: number;
  slotWidth: number;
};

export type ChassisSpec = {
  airflowRating: 1 | 2 | 3 | 4 | 5;
  formFactor: HardwareFormFactor;
  maxCoolerHeightMm: number;
  maxGpuHeight: ExpansionSlotHeight;
  maxGpuLengthMm: number;
  maxGpuSlotWidth: number;
  model: string;
};

export type PsuSpec = {
  availableConnectors: Partial<Record<PowerConnector, number>>;
  model: string;
  wattage: number;
};

export type MemorySpec = {
  capacityGb: number;
  sticks: number;
  type: RamType;
};

export type StorageSpec = {
  drives: Array<{
    interface: StorageInterface;
    label: string;
  }>;
};

export type CoolerSpec = {
  heightMm: number;
  model: string;
  tdpRatingWatts: number;
};

export type ExternalGpuDockSpec = {
  interface: "thunderbolt-3" | "thunderbolt-4" | "oculink";
  maxGpuLengthMm: number;
  maxGpuSlotWidth: number;
  maxPowerWatts: number;
  powerConnectors: Partial<Record<PowerConnector, number>>;
};

export type UpgradePlan = {
  additionalM2Drives: number;
  additionalRamGb: number;
  additionalSataDrives: number;
  cpu?: CpuSpec;
  externalGpuDock?: ExternalGpuDockSpec;
  gpu?: GpuSpec;
  memory?: MemorySpec;
  storage?: StorageSpec;
};

export type CompatibilityProfile = {
  chassis: ChassisSpec;
  cooler: CoolerSpec;
  cpu: CpuSpec;
  formFactor: HardwareFormFactor;
  gpu: GpuSpec | null;
  id: string;
  memory: MemorySpec;
  motherboard: MotherboardSpec;
  primaryUseCase: HardwareUseCase;
  psu: PsuSpec;
  storage: StorageSpec;
  title: string;
  upgradePlan?: UpgradePlan;
};

export type CompatibilityResult = {
  category: string;
  confidence: number;
  reason: string;
  ruleId: string;
  score?: number;
  status: CompatibilityStatus;
};

export type CompatibilityRule = {
  category: string;
  evaluate: (profile: CompatibilityProfile) => CompatibilityResult;
  id: string;
};

export type UpgradeSuggestion = {
  priority: CompatibilitySeverity;
  reason: string;
  title: string;
};

export type CompatibilitySummary = {
  confidence: number;
  compatibleCount: number;
  incompatibleCount: number;
  platformAgeScore: number;
  platformHealthScore: number;
  status: CompatibilityStatus;
  thermalRisk: CompatibilitySeverity;
  upgradePathScore: number;
  warningCount: number;
};

export type CompatibilityReport = {
  profile: CompatibilityProfile;
  results: CompatibilityResult[];
  suggestions: UpgradeSuggestion[];
  summary: CompatibilitySummary;
};
