import { platformEncyclopediaEntries } from "@/data/platform-encyclopedia";
import { platformEncyclopediaSectionIds } from "@/types/platform-encyclopedia";
import type {
  PlatformEncyclopediaEntry,
  PlatformEncyclopediaReference,
  PlatformEncyclopediaSectionId
} from "@/types/platform-encyclopedia";
import type { PlatformKnowledgeId } from "@/types/platform-knowledge";
import type { BuildSlotId } from "@/types/solution-builder";
import type { HardwareStrategyTypeId } from "@/types/strategy";

const slotSectionMap: Partial<
  Record<BuildSlotId, PlatformEncyclopediaSectionId[]>
> = {
  "additional-storage": ["storage-topology", "upgrade-encyclopedia"],
  "cpu": ["cpu-support", "firmware-bios"],
  "cpu-cooler": ["cooling"],
  "egpu-dock": ["pcie-topology", "power-system"],
  "external-psu": ["power-system"],
  "fans": ["cooling"],
  "gpu": ["pcie-topology", "power-system", "cooling"],
  "laptop-ram-dimm-adapter": ["memory-topology", "hidden-capabilities"],
  "motherboard": ["chipset", "firmware-bios"],
  "pcie-adapter": ["pcie-topology", "upgrade-encyclopedia"],
  "psu": ["power-system"],
  "ram": ["memory-topology", "upgrade-encyclopedia"],
  "storage": ["storage-topology", "upgrade-encyclopedia"],
  "thunderbolt-adapter": ["pcie-topology", "power-system"]
};

const strategySectionMap: Partial<
  Record<HardwareStrategyTypeId, PlatformEncyclopediaSectionId[]>
> = {
  "buy-used-workstation": [
    "overview",
    "upgrade-encyclopedia",
    "reliability",
    "workload-profiles"
  ],
  "hybrid-strategy": [
    "hidden-capabilities",
    "upgrade-encyclopedia",
    "known-limitations"
  ],
  "laptop-egpu": ["pcie-topology", "power-system", "known-limitations"],
  "mini-pc": ["power-system", "cooling", "known-limitations"],
  "repair-existing-hardware": ["repair-notes", "common-failures", "reliability"],
  "server-conversion": ["power-system", "cooling", "storage-topology"],
  "upgrade-existing-machine": ["upgrade-encyclopedia", "known-limitations"],
  "wait-for-better-value": ["reliability", "lifecycle"]
};

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function getReference(
  entry: PlatformEncyclopediaEntry,
  sectionId: PlatformEncyclopediaSectionId,
  reason: string
): PlatformEncyclopediaReference {
  return {
    entryId: `${entry.platformId}:${sectionId}`,
    platformId: entry.platformId,
    reason,
    sectionId
  };
}

export function getPlatformEncyclopediaById(
  platformId: PlatformKnowledgeId | null | undefined
) {
  if (!platformId) {
    return null;
  }

  return (
    platformEncyclopediaEntries.find((entry) => entry.platformId === platformId) ??
    null
  );
}

export function getPlatformEncyclopediaSummary(
  entry: PlatformEncyclopediaEntry | null
) {
  if (!entry) {
    return null;
  }

  return {
    diagramCount: entry.diagrams.length,
    factCount: entry.facts.length,
    reliabilitySignalCount:
      entry.reliability.commonFailures.length +
      entry.reliability.firmwareIssues.length,
    sectionCount: platformEncyclopediaSectionIds.length,
    upgradePathCount:
      entry.upgradeEncyclopedia.adapterPaths.length +
      entry.upgradeEncyclopedia.powerUpgradePaths.length +
      entry.upgradeEncyclopedia.coolingUpgradePaths.length,
    workloadProfileCount: entry.workloadProfiles.length
  };
}

export function getEncyclopediaReferencesForPlatform(
  platformId: PlatformKnowledgeId | null | undefined,
  sectionIds: PlatformEncyclopediaSectionId[],
  reason: string
) {
  const entry = getPlatformEncyclopediaById(platformId);

  if (!entry) {
    return [];
  }

  return unique(sectionIds).map((sectionId) =>
    getReference(entry, sectionId, reason)
  );
}

export function getEncyclopediaReferencesForSlots(
  platformId: PlatformKnowledgeId | null | undefined,
  slotIds: BuildSlotId[],
  reason: string
) {
  const sectionIds = unique(
    slotIds.flatMap((slotId) => slotSectionMap[slotId] ?? [])
  );

  return getEncyclopediaReferencesForPlatform(platformId, sectionIds, reason);
}

export function getEncyclopediaReferencesForStrategy(
  platformId: PlatformKnowledgeId | null | undefined,
  strategyType: HardwareStrategyTypeId,
  reason = "Strategy references platform encyclopedia knowledge."
) {
  return getEncyclopediaReferencesForPlatform(
    platformId,
    strategySectionMap[strategyType] ?? ["overview", "known-limitations"],
    reason
  );
}

export function validatePlatformEncyclopediaCoverage(
  platformId: PlatformKnowledgeId,
  platformName: string
) {
  const entry = getPlatformEncyclopediaById(platformId);
  const missing: string[] = [];

  if (!entry) {
    return {
      factCount: 0,
      missing: ["Missing platform encyclopedia entry"],
      platformId,
      platformName,
      sectionCount: 0
    };
  }

  if (entry.memoryTopology.notes.length === 0) missing.push("Memory topology");
  if (entry.powerSystem.powerGuidance.length === 0) missing.push("Power topology");
  if (entry.storageTopology.storageGuidance.length === 0) {
    missing.push("Storage guidance");
  }
  if (
    entry.upgradeEncyclopedia.adapterPaths.length === 0 &&
    entry.upgradeEncyclopedia.powerUpgradePaths.length === 0 &&
    entry.upgradeEncyclopedia.coolingUpgradePaths.length === 0
  ) {
    missing.push("Upgrade paths");
  }
  if (entry.reliability.commonFailures.length === 0) {
    missing.push("Reliability data");
  }
  if (entry.workloadProfiles.length === 0) missing.push("Workload profile");

  return {
    factCount: entry.facts.length,
    missing,
    platformId,
    platformName,
    sectionCount: platformEncyclopediaSectionIds.length
  };
}
