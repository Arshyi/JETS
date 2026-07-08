import type { EvidenceRecord, EvidenceVerificationStatus } from "@/types/evidence";
import type { HardwareUseCase } from "@/types/hardware";
import type {
  KnowledgeConfidence,
  PlatformAdapterId,
  PlatformKnowledgeId
} from "@/types/platform-knowledge";
import type { BuildSlotId } from "@/types/solution-builder";
import type { HardwareStrategyTypeId } from "@/types/strategy";

export const platformEncyclopediaSectionIds = [
  "overview",
  "platform-revisions",
  "chipset",
  "cpu-support",
  "memory-topology",
  "pcie-topology",
  "storage-topology",
  "power-system",
  "cooling",
  "firmware-bios",
  "known-limitations",
  "hidden-capabilities",
  "repair-notes",
  "common-failures",
  "lifecycle",
  "community-discoveries",
  "upgrade-encyclopedia",
  "reliability",
  "workload-profiles"
] as const;

export const platformDiagramTypeIds = [
  "pcie-lane-map",
  "memory-channel-layout",
  "drive-bays",
  "power-connectors",
  "expansion-slots",
  "thermal-zones"
] as const;

export type PlatformEncyclopediaSectionId =
  (typeof platformEncyclopediaSectionIds)[number];
export type PlatformDiagramTypeId = (typeof platformDiagramTypeIds)[number];
export type PlatformLifecycleStage = "active" | "mature" | "legacy" | "enthusiast";
export type PlatformFailureFrequency = "rare" | "occasional" | "common";
export type PlatformRepairDifficulty = "easy" | "moderate" | "advanced" | "expert";
export type PlatformReplacementAvailability =
  | "plentiful"
  | "available"
  | "scarce"
  | "specialist";
export type PlatformWorkloadSuitability =
  | "poor"
  | "limited"
  | "acceptable"
  | "strong"
  | "excellent";
export type PlatformWorkloadProfileId =
  | HardwareUseCase
  | "rendering"
  | "virtualization"
  | "nas"
  | "home-server"
  | "office"
  | "education";

export type PlatformEncyclopediaReference = {
  entryId: string;
  platformId: PlatformKnowledgeId;
  reason: string;
  sectionId: PlatformEncyclopediaSectionId;
};

export type PlatformEncyclopediaFact = {
  confidence: KnowledgeConfidence;
  details: string[];
  evidenceIds: Array<EvidenceRecord["id"]>;
  id: string;
  knowledgeQualityScore: number;
  relatedAdapterIds?: PlatformAdapterId[];
  relatedPlaybookIds?: string[];
  relatedSlotIds?: BuildSlotId[];
  relatedStrategyTypes?: HardwareStrategyTypeId[];
  sectionId: PlatformEncyclopediaSectionId;
  summary: string;
  title: string;
  verification: EvidenceVerificationStatus;
};

export type PlatformEngineeringDiagramNode = {
  id: string;
  label: string;
  metadata: Record<string, string | number | boolean>;
  role: string;
};

export type PlatformEngineeringDiagramEdge = {
  from: string;
  label: string;
  to: string;
};

export type PlatformEngineeringDiagram = {
  description: string;
  edges: PlatformEngineeringDiagramEdge[];
  id: string;
  nodes: PlatformEngineeringDiagramNode[];
  title: string;
  type: PlatformDiagramTypeId;
};

export type PlatformRevision = {
  biosNotes: string[];
  id: string;
  label: string;
  notes: string[];
};

export type PlatformMemoryTopology = {
  channelCount: number;
  maxRamGb: number;
  notes: string[];
  populationGuidance: string[];
  ramType: string;
  slotCount: number;
};

export type PlatformPcieTopology = {
  notes: string[];
  pcieGeneration: number;
  slotGuidance: PlatformEncyclopediaFact[];
};

export type PlatformStorageTopology = {
  driveBaySummary: string;
  nativeNvme: boolean;
  notes: string[];
  sataPorts: number;
  storageGuidance: PlatformEncyclopediaFact[];
};

export type PlatformPowerTopology = {
  connectorNotes: string[];
  nominalWattageRange: string;
  powerGuidance: PlatformEncyclopediaFact[];
  psuFamily: string;
  upgradePaths: string[];
};

export type PlatformCoolingTopology = {
  airflowPattern: string;
  coolingGuidance: PlatformEncyclopediaFact[];
  thermalZones: string[];
  upgradePaths: string[];
};

export type PlatformReliabilityProfile = {
  commonFailures: PlatformEncyclopediaFact[];
  firmwareIssues: PlatformEncyclopediaFact[];
  repairDifficulty: PlatformRepairDifficulty;
  replacementAvailability: PlatformReplacementAvailability;
  serviceLifeYears: string;
};

export type PlatformWorkloadProfile = {
  caveats: string[];
  id: PlatformWorkloadProfileId;
  reasons: string[];
  suitability: PlatformWorkloadSuitability;
  title: string;
};

export type PlatformUpgradeEncyclopedia = {
  adapterPaths: PlatformEncyclopediaFact[];
  coolingUpgradePaths: PlatformEncyclopediaFact[];
  eccCompatibility: PlatformEncyclopediaFact;
  gpuLimitations: PlatformEncyclopediaFact[];
  maxRam: PlatformEncyclopediaFact;
  maxStorage: PlatformEncyclopediaFact;
  nvmeAdapterSupport: PlatformEncyclopediaFact;
  pcieBifurcation: PlatformEncyclopediaFact;
  powerUpgradePaths: PlatformEncyclopediaFact[];
};

export type PlatformEncyclopediaEntry = {
  chipset: PlatformEncyclopediaFact;
  communityDiscoveries: PlatformEncyclopediaFact[];
  cooling: PlatformCoolingTopology;
  cpuSupport: PlatformEncyclopediaFact;
  diagrams: PlatformEngineeringDiagram[];
  facts: PlatformEncyclopediaFact[];
  firmwareBios: PlatformEncyclopediaFact[];
  hiddenCapabilities: PlatformEncyclopediaFact[];
  id: string;
  knownLimitations: PlatformEncyclopediaFact[];
  lifecycle: {
    stage: PlatformLifecycleStage;
    summary: string;
    usefulRoles: string[];
  };
  memoryTopology: PlatformMemoryTopology;
  overview: PlatformEncyclopediaFact;
  pcieTopology: PlatformPcieTopology;
  platformId: PlatformKnowledgeId;
  powerSystem: PlatformPowerTopology;
  provenance: {
    evidenceIds: Array<EvidenceRecord["id"]>;
    knowledgeQualityScore: number;
    verification: EvidenceVerificationStatus;
  };
  reliability: PlatformReliabilityProfile;
  repairNotes: PlatformEncyclopediaFact[];
  revisions: PlatformRevision[];
  storageTopology: PlatformStorageTopology;
  title: string;
  upgradeEncyclopedia: PlatformUpgradeEncyclopedia;
  workloadProfiles: PlatformWorkloadProfile[];
};

export type PlatformEncyclopediaCoverage = {
  missing: string[];
  platformId: PlatformKnowledgeId;
  platformName: string;
  sectionCount: number;
};
