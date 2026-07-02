import {
  clampPercent,
  countConnectors,
  createResult,
  getPowerLoadWatts,
  getRequestedM2Drives,
  getRequestedSataDrives,
  getRequestedStorageInterfaces,
  getTargetGpu,
  getTargetMemory,
  hasStorageInterface,
  thermalRiskFromScore
} from "@/lib/compatibility-engine/helpers";
import type {
  CompatibilityProfile,
  CompatibilityResult,
  CompatibilityRule,
  PowerConnector
} from "@/types/compatibility";

const ruleCategories = {
  bios: "BIOS generation risk",
  caseAirflow: "Case airflow estimate",
  coolerClearance: "CPU cooler clearance",
  cpuMotherboard: "CPU ↔ motherboard compatibility",
  gpuHeight: "GPU height/thickness ↔ chassis",
  gpuLength: "GPU length ↔ chassis compatibility",
  gpuMotherboard: "GPU ↔ motherboard PCIe compatibility",
  m2Slots: "M.2 slot availability",
  platformAge: "Platform age score",
  psuConnectors: "PSU connector availability",
  psuWattage: "PSU wattage headroom",
  ramCapacity: "RAM capacity limits",
  ramSlots: "RAM slot availability",
  ramType: "RAM type compatibility",
  sataPorts: "SATA port availability",
  storageInterface: "Storage interface compatibility",
  thermalRisk: "Thermal risk estimate",
  upgradePath: "Upgrade path score"
} as const;

function noDiscreteGpuResult(ruleId: string, category: string): CompatibilityResult {
  return createResult(
    ruleId,
    category,
    "Compatible with Warning",
    86,
    "No discrete GPU is installed or planned, so GPU-specific checks only verify that no conflict is currently present.",
    70
  );
}

function getBestPcieSlot(profile: CompatibilityProfile) {
  return [...profile.motherboard.pcieSlots].sort((left, right) => {
    if (right.lanes !== left.lanes) {
      return right.lanes - left.lanes;
    }

    return right.version - left.version;
  })[0];
}

function supportsExternalGpu(profile: CompatibilityProfile) {
  const dock = profile.upgradePlan?.externalGpuDock;

  return Boolean(
    dock && profile.motherboard.externalGpuInterfaces?.includes(dock.interface)
  );
}

function getThermalScore(profile: CompatibilityProfile) {
  const load = getPowerLoadWatts(profile);
  const airflowScore = profile.chassis.airflowRating * 16;
  const coolerScore =
    profile.cooler.tdpRatingWatts >= profile.cpu.tdpWatts ? 16 : -10;
  const compactPenalty =
    profile.formFactor === "laptop" || profile.chassis.maxGpuSlotWidth <= 1 ? 18 : 0;

  return clampPercent(airflowScore + coolerScore + 28 - load / 18 - compactPenalty);
}

function getPlatformAgeScore(profile: CompatibilityProfile) {
  const age = new Date().getFullYear() - profile.motherboard.platformYear;

  return clampPercent(100 - age * 8);
}

function getUpgradePathScore(profile: CompatibilityProfile) {
  const openRamSlots = profile.motherboard.ramSlots - profile.motherboard.occupiedRamSlots;
  const openM2Slots = profile.motherboard.m2Slots - profile.motherboard.occupiedM2Slots;
  const openSataPorts = profile.motherboard.sataPorts - profile.motherboard.occupiedSataPorts;
  const targetGpu = getTargetGpu(profile);
  const gpuRoomScore =
    targetGpu && profile.chassis.maxGpuLengthMm >= targetGpu.lengthMm ? 18 : 4;
  const score =
    openRamSlots * 11 +
    openM2Slots * 13 +
    openSataPorts * 5 +
    gpuRoomScore +
    profile.chassis.airflowRating * 8 +
    (profile.motherboard.maxRamGb >= 128 ? 12 : 4);

  return clampPercent(score);
}

export const compatibilityRules: CompatibilityRule[] = [
  {
    category: ruleCategories.cpuMotherboard,
    evaluate(profile) {
      const socketMatches = profile.cpu.socket === profile.motherboard.socket;
      const generationSupported = profile.motherboard.supportedCpuGenerations.includes(
        profile.cpu.generation
      );
      const status =
        socketMatches && generationSupported
          ? "Compatible"
          : socketMatches
            ? "Compatible with Warning"
            : "Incompatible";
      const reason = socketMatches
        ? generationSupported
          ? `${profile.cpu.model} uses ${profile.cpu.socket}, which matches ${profile.motherboard.model}.`
          : `${profile.cpu.model} matches the socket, but ${profile.motherboard.model} may need BIOS support for ${profile.cpu.generation}.`
        : `${profile.cpu.model} uses ${profile.cpu.socket}, but ${profile.motherboard.model} requires ${profile.motherboard.socket}.`;

      return createResult("cpu-motherboard", ruleCategories.cpuMotherboard, status, 98, reason);
    },
    id: "cpu-motherboard"
  },
  {
    category: ruleCategories.gpuMotherboard,
    evaluate(profile) {
      const gpu = getTargetGpu(profile);

      if (!gpu) {
        return noDiscreteGpuResult("gpu-motherboard-pcie", ruleCategories.gpuMotherboard);
      }

      const bestSlot = getBestPcieSlot(profile);
      const hasPcieSlot = Boolean(bestSlot && bestSlot.lanes >= 4);
      const externalGpu = supportsExternalGpu(profile);
      const status =
        hasPcieSlot && bestSlot.lanes >= 16
          ? "Compatible"
          : externalGpu
            ? "Compatible with Warning"
            : hasPcieSlot
              ? "Compatible with Warning"
              : "Incompatible";
      const reason = bestSlot
        ? `${gpu.model} can use PCIe ${bestSlot.version}.0 x${bestSlot.lanes}; performance warning applies below x16.`
        : externalGpu
          ? `${gpu.model} can be routed through the planned external GPU dock, but bandwidth is lower than desktop PCIe.`
          : `${profile.motherboard.model} has no suitable PCIe slot for ${gpu.model}.`;

      return createResult("gpu-motherboard-pcie", ruleCategories.gpuMotherboard, status, 94, reason);
    },
    id: "gpu-motherboard-pcie"
  },
  {
    category: ruleCategories.gpuLength,
    evaluate(profile) {
      const gpu = getTargetGpu(profile);

      if (!gpu) {
        return noDiscreteGpuResult("gpu-length-chassis", ruleCategories.gpuLength);
      }

      const dock = profile.upgradePlan?.externalGpuDock;
      const maxLength = dock?.maxGpuLengthMm ?? profile.chassis.maxGpuLengthMm;
      const status = gpu.lengthMm <= maxLength ? "Compatible" : "Incompatible";
      const reason =
        gpu.lengthMm <= maxLength
          ? `${gpu.model} is ${gpu.lengthMm}mm long and fits the ${maxLength}mm GPU clearance.`
          : `${gpu.model} is ${gpu.lengthMm}mm long, exceeding the ${maxLength}mm GPU clearance.`;

      return createResult("gpu-length-chassis", ruleCategories.gpuLength, status, 100, reason);
    },
    id: "gpu-length-chassis"
  },
  {
    category: ruleCategories.gpuHeight,
    evaluate(profile) {
      const gpu = getTargetGpu(profile);

      if (!gpu) {
        return noDiscreteGpuResult("gpu-height-thickness", ruleCategories.gpuHeight);
      }

      const dock = profile.upgradePlan?.externalGpuDock;
      const maxSlotWidth = dock?.maxGpuSlotWidth ?? profile.chassis.maxGpuSlotWidth;
      const heightFits =
        dock || profile.chassis.maxGpuHeight === "full-height" || gpu.height === "low-profile";
      const thicknessFits = gpu.slotWidth <= maxSlotWidth;
      const status =
        heightFits && thicknessFits
          ? "Compatible"
          : heightFits || thicknessFits
            ? "Compatible with Warning"
            : "Incompatible";
      const reason =
        heightFits && thicknessFits
          ? `${gpu.model} fits the available slot height and ${maxSlotWidth}-slot thickness limit.`
          : `${gpu.model} exceeds available expansion slot height or thickness in ${profile.chassis.model}.`;

      return createResult("gpu-height-thickness", ruleCategories.gpuHeight, status, 100, reason);
    },
    id: "gpu-height-thickness"
  },
  {
    category: ruleCategories.psuWattage,
    evaluate(profile) {
      const externalDock = profile.upgradePlan?.externalGpuDock;
      const dockGpu = profile.upgradePlan?.gpu;

      if (externalDock && dockGpu) {
        const dockHeadroom = externalDock.maxPowerWatts - dockGpu.powerWatts;
        const status =
          dockHeadroom >= 120
            ? "Compatible"
            : dockHeadroom >= 60
              ? "Compatible with Warning"
              : "Incompatible";
        const reason = `The external GPU dock provides ${externalDock.maxPowerWatts}W for ${dockGpu.model}, leaving ${dockHeadroom}W dock-side headroom.`;

        return createResult("psu-wattage-headroom", ruleCategories.psuWattage, status, 88, reason, dockHeadroom);
      }

      const load = getPowerLoadWatts(profile);
      const headroom = profile.psu.wattage - load;
      const targetGpu = getTargetGpu(profile);
      const recommended = targetGpu?.recommendedPsuWatts ?? load + 120;
      const status =
        profile.psu.wattage >= recommended && headroom >= 140
          ? "Compatible"
          : headroom >= 70
            ? "Compatible with Warning"
            : "Incompatible";
      const reason = `${profile.psu.model} provides ${profile.psu.wattage}W. Estimated load is ${load}W, leaving ${headroom}W headroom.`;

      return createResult("psu-wattage-headroom", ruleCategories.psuWattage, status, 92, reason, headroom);
    },
    id: "psu-wattage-headroom"
  },
  {
    category: ruleCategories.psuConnectors,
    evaluate(profile) {
      const gpu = getTargetGpu(profile);

      if (!gpu) {
        return createResult(
          "psu-connectors",
          ruleCategories.psuConnectors,
          "Compatible",
          96,
          "No discrete GPU power connector is required.",
          100
        );
      }

      const dockConnectors = profile.upgradePlan?.externalGpuDock?.powerConnectors;
      const available = dockConnectors ?? profile.psu.availableConnectors;
      const missing = (Object.entries(gpu.powerConnectors) as Array<[PowerConnector, number]>)
        .filter(([connector, needed]) => countConnectors(available, connector) < needed)
        .map(([connector, needed]) => `${needed}x ${connector}`);
      const status = missing.length === 0 ? "Compatible" : "Incompatible";
      const reason =
        missing.length === 0
          ? `${profile.psu.model} has the connectors required by ${gpu.model}.`
          : `${gpu.model} needs ${missing.join(", ")} that are not available.`;

      return createResult("psu-connectors", ruleCategories.psuConnectors, status, 98, reason);
    },
    id: "psu-connectors"
  },
  {
    category: ruleCategories.ramType,
    evaluate(profile) {
      const targetMemory = getTargetMemory(profile);
      const status =
        targetMemory.type === profile.motherboard.ramType ? "Compatible" : "Incompatible";
      const reason =
        targetMemory.type === profile.motherboard.ramType
          ? `${targetMemory.type} memory matches ${profile.motherboard.model}.`
          : `${profile.motherboard.model} requires ${profile.motherboard.ramType}, not ${targetMemory.type}.`;

      return createResult("ram-type", ruleCategories.ramType, status, 100, reason);
    },
    id: "ram-type"
  },
  {
    category: ruleCategories.ramCapacity,
    evaluate(profile) {
      const targetMemory = getTargetMemory(profile);
      const status =
        targetMemory.capacityGb <= profile.motherboard.maxRamGb
          ? "Compatible"
          : "Incompatible";
      const reason =
        targetMemory.capacityGb <= profile.motherboard.maxRamGb
          ? `${targetMemory.capacityGb}GB RAM is within the ${profile.motherboard.maxRamGb}GB platform limit.`
          : `${targetMemory.capacityGb}GB RAM exceeds the ${profile.motherboard.maxRamGb}GB platform limit.`;

      return createResult("ram-capacity", ruleCategories.ramCapacity, status, 98, reason);
    },
    id: "ram-capacity"
  },
  {
    category: ruleCategories.ramSlots,
    evaluate(profile) {
      const targetMemory = getTargetMemory(profile);
      const status =
        targetMemory.sticks <= profile.motherboard.ramSlots
          ? profile.motherboard.occupiedRamSlots < profile.motherboard.ramSlots ||
            targetMemory.capacityGb === profile.memory.capacityGb
            ? "Compatible"
            : "Compatible with Warning"
          : "Incompatible";
      const reason = `${profile.motherboard.model} has ${profile.motherboard.ramSlots} RAM slots with ${profile.motherboard.occupiedRamSlots} currently occupied; target kit uses ${targetMemory.sticks} sticks.`;

      return createResult("ram-slots", ruleCategories.ramSlots, status, 94, reason);
    },
    id: "ram-slots"
  },
  {
    category: ruleCategories.storageInterface,
    evaluate(profile) {
      const unsupported = getRequestedStorageInterfaces(profile).filter(
        (storageInterface) =>
          !hasStorageInterface(profile.motherboard.supportedStorageInterfaces, storageInterface)
      );
      const status = unsupported.length === 0 ? "Compatible" : "Incompatible";
      const reason =
        unsupported.length === 0
          ? `${profile.motherboard.model} supports all requested storage interfaces.`
          : `${profile.motherboard.model} does not support ${unsupported.join(", ")}.`;

      return createResult("storage-interface", ruleCategories.storageInterface, status, 96, reason);
    },
    id: "storage-interface"
  },
  {
    category: ruleCategories.m2Slots,
    evaluate(profile) {
      const requested = getRequestedM2Drives(profile);
      const available = profile.motherboard.m2Slots;
      const status =
        requested <= available
          ? requested === available
            ? "Compatible with Warning"
            : "Compatible"
          : "Incompatible";
      const reason = `${profile.motherboard.model} has ${available} M.2 slot${available === 1 ? "" : "s"} and the build requests ${requested}.`;

      return createResult("m2-slots", ruleCategories.m2Slots, status, 98, reason);
    },
    id: "m2-slots"
  },
  {
    category: ruleCategories.sataPorts,
    evaluate(profile) {
      const requested = getRequestedSataDrives(profile);
      const available = profile.motherboard.sataPorts;
      const status =
        requested <= available
          ? requested === available
            ? "Compatible with Warning"
            : "Compatible"
          : "Incompatible";
      const reason = `${profile.motherboard.model} has ${available} SATA ports and the build requests ${requested}.`;

      return createResult("sata-ports", ruleCategories.sataPorts, status, 98, reason);
    },
    id: "sata-ports"
  },
  {
    category: ruleCategories.coolerClearance,
    evaluate(profile) {
      const heightFits = profile.cooler.heightMm <= profile.chassis.maxCoolerHeightMm;
      const thermalFits = profile.cooler.tdpRatingWatts >= profile.cpu.tdpWatts;
      const status =
        heightFits && thermalFits
          ? "Compatible"
          : heightFits || thermalFits
            ? "Compatible with Warning"
            : "Incompatible";
      const reason = `${profile.cooler.model} is ${profile.cooler.heightMm}mm tall with a ${profile.cooler.tdpRatingWatts}W rating; ${profile.chassis.model} allows ${profile.chassis.maxCoolerHeightMm}mm.`;

      return createResult("cpu-cooler-clearance", ruleCategories.coolerClearance, status, 96, reason);
    },
    id: "cpu-cooler-clearance"
  },
  {
    category: ruleCategories.caseAirflow,
    evaluate(profile) {
      const load = getPowerLoadWatts(profile);
      const score = clampPercent(profile.chassis.airflowRating * 20 - load / 24 + 24);
      const status =
        score >= 70
          ? "Compatible"
          : score >= 42
            ? "Compatible with Warning"
            : "Incompatible";
      const reason = `${profile.chassis.model} airflow rating is ${profile.chassis.airflowRating}/5 against an estimated ${load}W load.`;

      return createResult("case-airflow", ruleCategories.caseAirflow, status, 82, reason, score);
    },
    id: "case-airflow"
  },
  {
    category: ruleCategories.thermalRisk,
    evaluate(profile) {
      const score = getThermalScore(profile);
      const risk = thermalRiskFromScore(score);
      const status =
        risk === "low"
          ? "Compatible"
          : risk === "medium"
            ? "Compatible with Warning"
            : "Incompatible";
      const reason = `Thermal model estimates ${risk} risk from CPU/GPU load, cooler rating, chassis airflow, and form factor.`;

      return createResult("thermal-risk", ruleCategories.thermalRisk, status, 80, reason, score);
    },
    id: "thermal-risk"
  },
  {
    category: ruleCategories.upgradePath,
    evaluate(profile) {
      const score = getUpgradePathScore(profile);
      const status =
        score >= 70
          ? "Compatible"
          : score >= 40
            ? "Compatible with Warning"
            : "Incompatible";
      const reason = `Upgrade path score is ${score}/100 from open RAM slots, storage expansion, GPU room, airflow, and RAM ceiling.`;

      return createResult("upgrade-path", ruleCategories.upgradePath, status, 86, reason, score);
    },
    id: "upgrade-path"
  },
  {
    category: ruleCategories.bios,
    evaluate(profile) {
      const cpuGenerationIndex = profile.motherboard.supportedCpuGenerations.indexOf(
        profile.cpu.generation
      );
      const isNewestGeneration =
        cpuGenerationIndex === profile.motherboard.supportedCpuGenerations.length - 1;
      const status = isNewestGeneration ? "Compatible with Warning" : "Compatible";
      const reason = isNewestGeneration
        ? `${profile.cpu.generation} is the newest supported generation on ${profile.motherboard.model}; verify BIOS ${profile.motherboard.biosGeneration}.`
        : `${profile.motherboard.biosGeneration} is appropriate for ${profile.cpu.generation}.`;

      return createResult("bios-generation-risk", ruleCategories.bios, status, 84, reason);
    },
    id: "bios-generation-risk"
  },
  {
    category: ruleCategories.platformAge,
    evaluate(profile) {
      const score = getPlatformAgeScore(profile);
      const status =
        score >= 70
          ? "Compatible"
          : score >= 36
            ? "Compatible with Warning"
            : "Incompatible";
      const age = new Date().getFullYear() - profile.motherboard.platformYear;
      const reason = `${profile.motherboard.model} platform age is about ${age} year${age === 1 ? "" : "s"}, producing a ${score}/100 platform age score.`;

      return createResult("platform-age", ruleCategories.platformAge, status, 88, reason, score);
    },
    id: "platform-age"
  }
];

export const compatibilityRuleCategories = ruleCategories;
