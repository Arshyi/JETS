import type {
  CompatibilityProfile,
  CompatibilityResult,
  CompatibilitySeverity,
  CompatibilityStatus,
  GpuSpec,
  MemorySpec,
  StorageInterface
} from "@/types/compatibility";

export function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function createResult(
  ruleId: string,
  category: string,
  status: CompatibilityStatus,
  confidence: number,
  reason: string,
  score?: number
): CompatibilityResult {
  return {
    category,
    confidence: clampPercent(confidence),
    reason,
    ruleId,
    score: score === undefined ? undefined : clampPercent(score),
    status
  };
}

export function compareStatusPriority(status: CompatibilityStatus) {
  return {
    Compatible: 0,
    "Compatible with Warning": 1,
    Incompatible: 2
  }[status];
}

export function getTargetGpu(profile: CompatibilityProfile): GpuSpec | null {
  return profile.upgradePlan?.gpu ?? profile.gpu;
}

export function getTargetMemory(profile: CompatibilityProfile): MemorySpec {
  return profile.upgradePlan?.memory ?? {
    ...profile.memory,
    capacityGb: profile.memory.capacityGb + (profile.upgradePlan?.additionalRamGb ?? 0)
  };
}

export function getRequestedM2Drives(profile: CompatibilityProfile) {
  return profile.storage.drives.filter((drive) =>
    drive.interface.startsWith("m2")
  ).length + (profile.upgradePlan?.additionalM2Drives ?? 0);
}

export function getRequestedSataDrives(profile: CompatibilityProfile) {
  return profile.storage.drives.filter((drive) =>
    drive.interface.startsWith("sata")
  ).length + (profile.upgradePlan?.additionalSataDrives ?? 0);
}

export function getRequestedStorageInterfaces(profile: CompatibilityProfile) {
  const upgradeDrives = profile.upgradePlan?.storage?.drives ?? [];

  return [...profile.storage.drives, ...upgradeDrives].map((drive) => drive.interface);
}

export function getPowerLoadWatts(profile: CompatibilityProfile) {
  const targetGpu = getTargetGpu(profile);
  const driveWatts = profile.storage.drives.length * 8;
  const upgradeStorageWatts =
    (profile.upgradePlan?.additionalM2Drives ?? 0) * 6 +
    (profile.upgradePlan?.additionalSataDrives ?? 0) * 8;
  const boardAndFanAllowance = 55;

  return (
    profile.cpu.tdpWatts +
    (targetGpu?.powerWatts ?? 0) +
    driveWatts +
    upgradeStorageWatts +
    boardAndFanAllowance
  );
}

export function countConnectors(
  connectors: Partial<Record<string, number>>,
  connector: string
) {
  return connectors[connector] ?? 0;
}

export function hasStorageInterface(
  supportedInterfaces: StorageInterface[],
  requestedInterface: StorageInterface
) {
  return supportedInterfaces.includes(requestedInterface);
}

export function thermalRiskFromScore(score: number): CompatibilitySeverity {
  if (score >= 72) {
    return "low";
  }

  if (score >= 44) {
    return "medium";
  }

  return "high";
}
