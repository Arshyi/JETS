import { buildWorkspaceSlotDefinitions } from "@/data/solution-builder";
import {
  getAllowedComponentCategoriesForSlot,
  getComponentCategoryLabel
} from "@/lib/component-inventory";
import type {
  BuildSlotId,
  BuildSlotStatus,
  BuildValidationAreaId,
  BuildValidationAreaSummary,
  BuildValidationIssue,
  BuildWorkspaceEvaluation,
  BuildWorkspaceProject,
  HardwareSelectionFacts,
  WorkspaceHardwareSelection
} from "@/types/solution-builder";

type RuleContext = {
  getFacts: (slotId: BuildSlotId) => HardwareSelectionFacts;
  getSelection: (slotId: BuildSlotId) => WorkspaceHardwareSelection | undefined;
  hasSelection: (slotId: BuildSlotId) => boolean;
  project: BuildWorkspaceProject;
};

type RuleDefinition = {
  area: BuildValidationAreaId;
  evaluate: (context: RuleContext) => BuildValidationIssue[];
  id: string;
  label: string;
};

const areaLabels: Record<BuildValidationAreaId, string> = {
  "cooling": "Cooling",
  "display": "Display",
  "essential-parts": "Build completion",
  "pcie": "PCIe",
  "physical-fit": "Physical fit",
  "platform-health": "Platform health",
  "power": "Power",
  "ram": "RAM",
  "storage": "Storage",
  "upgrade-path": "Upgrade path"
};

const definitionsById = new Map(
  buildWorkspaceSlotDefinitions.map((definition) => [definition.id, definition])
);

const requiredSlotIds = buildWorkspaceSlotDefinitions
  .filter((definition) => definition.requirement === "required")
  .map((definition) => definition.id);

const missingRequiredSlotTitles: Partial<Record<BuildSlotId, string>> = {
  "cpu": "Missing CPU",
  "cpu-cooler": "Missing cooling solution",
  "motherboard": "Missing motherboard or base system",
  "psu": "Missing PSU or power solution",
  "ram": "Missing RAM",
  "storage": "Missing storage"
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getBiosNumber(value: string | undefined) {
  const match = value?.match(/\d+/);

  return match ? Number(match[0]) : null;
}

function hasAllConnectors(
  available: string[] | undefined,
  required: string[] | undefined
) {
  if (!required?.length) {
    return true;
  }

  if (!available?.length) {
    return false;
  }

  return required.every((connector) => available.includes(connector));
}

function createIssue(
  issue: Omit<BuildValidationIssue, "confidence">
): BuildValidationIssue {
  return {
    confidence: issue.severity === "info" ? 80 : 95,
    ...issue
  };
}

const buildWorkspaceRules: RuleDefinition[] = [
  {
    area: "essential-parts",
    evaluate: ({ hasSelection }) =>
      requiredSlotIds
        .filter((slotId) => !hasSelection(slotId))
        .map((slotId) => {
          const definition = definitionsById.get(slotId);

          return createIssue({
            area: "essential-parts",
            id: `missing-${slotId}`,
            reason: "Required solution slots must be filled before the build can be treated as complete.",
            severity: "blocking",
            slotId,
            title:
              missingRequiredSlotTitles[slotId] ??
              `Missing ${definition?.label ?? slotId}`
          });
        }),
    id: "required-slots-present",
    label: "Required slots present"
  },
  {
    area: "essential-parts",
    evaluate: ({ getSelection, project }) =>
      project.slots.flatMap((slot) => {
        const selection = getSelection(slot.definitionId);

        if (!selection?.componentCategory) {
          return [];
        }

        const allowedCategories = getAllowedComponentCategoriesForSlot(
          slot.definitionId
        );

        if (
          allowedCategories.length === 0 ||
          allowedCategories.includes(selection.componentCategory)
        ) {
          return [];
        }

        const definition = definitionsById.get(slot.definitionId);

        return [
          createIssue({
            area: "essential-parts",
            id: `incompatible-category-${slot.definitionId}`,
            reason: `${getComponentCategoryLabel(selection.componentCategory)} inventory cannot satisfy the ${definition?.label ?? slot.definitionId} slot.`,
            severity: "blocking",
            slotId: slot.definitionId,
            title: "Incompatible component category in slot"
          })
        ];
      }),
    id: "component-category-fits-slot",
    label: "Component category fits slot"
  },
  {
    area: "physical-fit",
    evaluate: ({ getFacts }) => {
      const chassis = getFacts("chassis");
      const gpu = getFacts("gpu");
      const issues: BuildValidationIssue[] = [];

      if (
        typeof chassis.maxGpuLengthMm === "number" &&
        typeof gpu.gpuLengthMm === "number" &&
        gpu.gpuLengthMm > chassis.maxGpuLengthMm
      ) {
        issues.push(
          createIssue({
            area: "physical-fit",
            id: "gpu-length-exceeds-chassis",
            reason: `GPU length is ${gpu.gpuLengthMm} mm, but the chassis allowance is ${chassis.maxGpuLengthMm} mm.`,
            severity: "blocking",
            slotId: "gpu",
            title: "GPU is too long for the selected chassis"
          })
        );
      }

      if (
        chassis.supportsFullHeightGpu === false &&
        gpu.gpuSlotHeight === "full-height"
      ) {
        issues.push(
          createIssue({
            area: "physical-fit",
            id: "gpu-height-exceeds-chassis",
            reason: "The selected chassis expects low-profile expansion cards, but the GPU is full-height.",
            severity: "blocking",
            slotId: "gpu",
            title: "GPU exceeds available expansion slot height"
          })
        );
      }

      return issues;
    },
    id: "gpu-physical-fit",
    label: "GPU physical fit"
  },
  {
    area: "power",
    evaluate: ({ getFacts, hasSelection }) => {
      if (!hasSelection("psu")) {
        return [
          createIssue({
            area: "power",
            id: "missing-power-path",
            reason: "The build cannot validate wattage headroom or GPU connectors until a PSU or external power path is selected.",
            severity: "blocking",
            slotId: "psu",
            title: "Missing PSU"
          })
        ];
      }

      const cpu = getFacts("cpu");
      const gpu = getFacts("gpu");
      const psu = getFacts("psu");
      const estimatedLoad =
        (cpu.tdpWatts ?? 0) + (gpu.boardPowerWatts ?? 0) + 120;
      const headroom =
        typeof psu.wattage === "number" ? psu.wattage - estimatedLoad : null;
      const issues: BuildValidationIssue[] = [];

      if (headroom !== null && headroom < 100) {
        issues.push(
          createIssue({
            area: "power",
            id: "psu-headroom-low",
            reason: `Estimated system load leaves ${headroom} W of PSU headroom.`,
            severity: headroom < 0 ? "blocking" : "warning",
            slotId: "psu",
            title: "PSU wattage headroom is low"
          })
        );
      }

      if (!hasAllConnectors(psu.psuConnectors, gpu.requiredPowerConnectors)) {
        issues.push(
          createIssue({
            area: "power",
            id: "missing-gpu-power-connectors",
            reason: "The selected GPU requires connectors that are not present on the selected power path.",
            severity: "blocking",
            slotId: "psu",
            title: "Missing GPU power connectors"
          })
        );
      }

      return issues;
    },
    id: "power-headroom-and-connectors",
    label: "Power headroom and connectors"
  },
  {
    area: "pcie",
    evaluate: ({ getFacts }) => {
      const gpu = getFacts("gpu");
      const motherboard = getFacts("motherboard");

      if (
        typeof motherboard.pcieGeneration === "number" &&
        typeof gpu.requiredPcieGeneration === "number" &&
        motherboard.pcieGeneration < gpu.requiredPcieGeneration
      ) {
        return [
          createIssue({
            area: "pcie",
            id: "pcie-generation-downgrade",
            reason: `The motherboard exposes PCIe Gen ${motherboard.pcieGeneration}, while the selected GPU targets Gen ${gpu.requiredPcieGeneration}.`,
            severity: "warning",
            slotId: "gpu",
            title: "GPU will run on an older PCIe generation"
          })
        ];
      }

      return [];
    },
    id: "pcie-generation-fit",
    label: "PCIe generation fit"
  },
  {
    area: "ram",
    evaluate: ({ getFacts }) => {
      const motherboard = getFacts("motherboard");
      const ram = getFacts("ram");
      const issues: BuildValidationIssue[] = [];

      if (
        motherboard.supportedRamType &&
        ram.ramType &&
        motherboard.supportedRamType !== ram.ramType
      ) {
        issues.push(
          createIssue({
            area: "ram",
            id: "unsupported-ram-type",
            reason: `Motherboard expects ${motherboard.supportedRamType}, but selected memory is ${ram.ramType}.`,
            severity: "blocking",
            slotId: "ram",
            title: "Unsupported RAM type"
          })
        );
      }

      if (
        typeof motherboard.maxRamCapacityGb === "number" &&
        typeof ram.ramCapacityGb === "number" &&
        ram.ramCapacityGb > motherboard.maxRamCapacityGb
      ) {
        issues.push(
          createIssue({
            area: "ram",
            id: "ram-capacity-exceeds-platform",
            reason: `Selected memory is ${ram.ramCapacityGb} GB, above the ${motherboard.maxRamCapacityGb} GB platform limit.`,
            severity: "blocking",
            slotId: "ram",
            title: "RAM capacity exceeds platform limit"
          })
        );
      }

      if (
        typeof motherboard.ramSlotsTotal === "number" &&
        typeof ram.ramSlotsUsed === "number" &&
        ram.ramSlotsUsed > motherboard.ramSlotsTotal
      ) {
        issues.push(
          createIssue({
            area: "ram",
            id: "ram-slots-exceeded",
            reason: `Selected memory uses ${ram.ramSlotsUsed} slots, but the platform has ${motherboard.ramSlotsTotal}.`,
            severity: "blocking",
            slotId: "ram",
            title: "RAM slot count exceeded"
          })
        );
      }

      return issues;
    },
    id: "ram-platform-fit",
    label: "RAM platform fit"
  },
  {
    area: "storage",
    evaluate: ({ getFacts }) => {
      const motherboard = getFacts("motherboard");
      const storage = getFacts("storage");
      const issues: BuildValidationIssue[] = [];

      if (
        typeof motherboard.m2SlotsTotal === "number" &&
        typeof storage.m2SlotsUsed === "number" &&
        storage.m2SlotsUsed > motherboard.m2SlotsTotal
      ) {
        issues.push(
          createIssue({
            area: "storage",
            id: "m2-slots-exceeded",
            reason: `Selected storage uses ${storage.m2SlotsUsed} M.2 slots, but the platform has ${motherboard.m2SlotsTotal}.`,
            severity: "blocking",
            slotId: "storage",
            title: "M.2 slot count exceeded"
          })
        );
      }

      if (
        typeof motherboard.sataPortsTotal === "number" &&
        typeof storage.sataPortsUsed === "number" &&
        storage.sataPortsUsed > motherboard.sataPortsTotal
      ) {
        issues.push(
          createIssue({
            area: "storage",
            id: "sata-ports-exceeded",
            reason: `Selected storage uses ${storage.sataPortsUsed} SATA ports, but the platform has ${motherboard.sataPortsTotal}.`,
            severity: "blocking",
            slotId: "storage",
            title: "SATA port count exceeded"
          })
        );
      }

      return issues;
    },
    id: "storage-interface-fit",
    label: "Storage interface fit"
  },
  {
    area: "cooling",
    evaluate: ({ getFacts, hasSelection }) => {
      if (!hasSelection("cpu-cooler")) {
        return [
          createIssue({
            area: "cooling",
            id: "missing-cpu-cooler",
            reason: "Thermal risk cannot be validated until the cooler is selected.",
            severity: "blocking",
            slotId: "cpu-cooler",
            title: "Missing CPU cooler"
          })
        ];
      }

      const chassis = getFacts("chassis");
      const cooler = getFacts("cpu-cooler");
      const gpu = getFacts("gpu");
      const issues: BuildValidationIssue[] = [];

      if (
        typeof chassis.maxCoolerHeightMm === "number" &&
        typeof cooler.coolerHeightMm === "number" &&
        cooler.coolerHeightMm > chassis.maxCoolerHeightMm
      ) {
        issues.push(
          createIssue({
            area: "cooling",
            id: "cooler-clearance-exceeded",
            reason: `Cooler height is ${cooler.coolerHeightMm} mm, above the ${chassis.maxCoolerHeightMm} mm chassis limit.`,
            severity: "blocking",
            slotId: "cpu-cooler",
            title: "CPU cooler clearance exceeded"
          })
        );
      }

      if ((chassis.airflowRating ?? 100) < 55 && (gpu.boardPowerWatts ?? 0) > 200) {
        issues.push(
          createIssue({
            area: "cooling",
            id: "thermal-risk-high",
            reason: "A low-airflow chassis paired with a high-power GPU raises thermal risk.",
            severity: "warning",
            slotId: "chassis",
            title: "Thermal risk is elevated"
          })
        );
      }

      return issues;
    },
    id: "cooling-and-airflow",
    label: "Cooling and airflow"
  },
  {
    area: "platform-health",
    evaluate: ({ getFacts }) => {
      const motherboard = getFacts("motherboard");
      const cpu = getFacts("cpu");
      const currentBios = getBiosNumber(motherboard.biosGeneration);
      const requiredBios = getBiosNumber(cpu.requiredBiosGeneration);
      const issues: BuildValidationIssue[] = [];

      if (
        currentBios !== null &&
        requiredBios !== null &&
        currentBios < requiredBios
      ) {
        issues.push(
          createIssue({
            area: "platform-health",
            id: "bios-generation-risk",
            reason: `Current BIOS ${motherboard.biosGeneration} is below the required ${cpu.requiredBiosGeneration}.`,
            severity: "warning",
            slotId: "motherboard",
            title: "Motherboard BIOS update required"
          })
        );
      }

      if ((motherboard.platformYear ?? 2026) < 2018) {
        issues.push(
          createIssue({
            area: "platform-health",
            id: "platform-age-risk",
            reason: "The selected platform is old enough that firmware, driver, and replacement-part risk should be reviewed.",
            severity: "warning",
            slotId: "motherboard",
            title: "Platform age risk"
          })
        );
      }

      return issues;
    },
    id: "bios-and-platform-age",
    label: "BIOS and platform age"
  },
  {
    area: "upgrade-path",
    evaluate: ({ getFacts }) => {
      const motherboard = getFacts("motherboard");
      const ram = getFacts("ram");
      const storage = getFacts("storage");
      const ramIsFull =
        typeof motherboard.ramSlotsTotal === "number" &&
        typeof ram.ramSlotsUsed === "number" &&
        ram.ramSlotsUsed >= motherboard.ramSlotsTotal;
      const m2IsFull =
        typeof motherboard.m2SlotsTotal === "number" &&
        typeof storage.m2SlotsUsed === "number" &&
        storage.m2SlotsUsed >= motherboard.m2SlotsTotal;

      if (ramIsFull && m2IsFull) {
        return [
          createIssue({
            area: "upgrade-path",
            id: "expansion-headroom-limited",
            reason: "The current memory and M.2 plan consumes the obvious upgrade slots.",
            severity: "warning",
            slotId: "motherboard",
            title: "Upgrade headroom is limited"
          })
        ];
      }

      return [];
    },
    id: "slot-headroom",
    label: "Slot headroom"
  },
  {
    area: "display",
    evaluate: ({ project }) => {
      if (project.ownedItems.monitor) {
        return [];
      }

      return [
        createIssue({
          area: "display",
          id: "display-not-owned",
          reason: "The project does not mark a monitor as already owned, so complete solution cost should include display planning.",
          severity: "info",
          title: "Display path not included"
        })
      ];
    },
    id: "display-availability",
    label: "Display availability"
  }
];

function getFactsForSlot(project: BuildWorkspaceProject, slotId: BuildSlotId) {
  return (
    project.slots.find((slot) => slot.definitionId === slotId)?.selectedHardware
      ?.facts ?? {}
  );
}

function getSelectionForSlot(project: BuildWorkspaceProject, slotId: BuildSlotId) {
  return project.slots.find((slot) => slot.definitionId === slotId)?.selectedHardware;
}

function getSlotStatus(
  slotId: BuildSlotId,
  hasSelection: boolean,
  issues: BuildValidationIssue[]
): BuildSlotStatus {
  if (!hasSelection) {
    return "missing";
  }

  const slotHasIssue = issues.some(
    (issue) => issue.slotId === slotId && issue.severity !== "info"
  );

  return slotHasIssue ? "warning" : "compatible";
}

function getAreaStatus(issues: BuildValidationIssue[]): BuildSlotStatus {
  if (issues.some((issue) => issue.severity === "blocking")) {
    return "missing";
  }

  if (issues.some((issue) => issue.severity === "warning")) {
    return "warning";
  }

  return "compatible";
}

function getCompletionPercent(project: BuildWorkspaceProject) {
  const completedRequired = requiredSlotIds.filter((slotId) =>
    project.slots.some(
      (slot) => slot.definitionId === slotId && Boolean(slot.selectedHardware)
    )
  ).length;

  return Math.round((completedRequired / requiredSlotIds.length) * 100);
}

export function evaluateBuildWorkspace(
  project: BuildWorkspaceProject,
  inventoryCounts: Partial<Record<BuildSlotId, number>>
): BuildWorkspaceEvaluation {
  const context: RuleContext = {
    getFacts: (slotId) => getFactsForSlot(project, slotId),
    getSelection: (slotId) => getSelectionForSlot(project, slotId),
    hasSelection: (slotId) =>
      project.slots.some(
        (slot) => slot.definitionId === slotId && Boolean(slot.selectedHardware)
      ),
    project
  };
  const issues = buildWorkspaceRules.flatMap((rule) => rule.evaluate(context));
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  const blockingCount = issues.filter((issue) => issue.severity === "blocking").length;
  const infoCount = issues.filter((issue) => issue.severity === "info").length;
  const platformHealth = clampScore(
    100 - blockingCount * 15 - warningCount * 7 - infoCount * 2
  );
  const upgradePathIssueCount = issues.filter(
    (issue) => issue.area === "upgrade-path"
  ).length;
  const upgradePathScore = clampScore(
    82 - upgradePathIssueCount * 18 - blockingCount * 4
  );

  const slots = project.slots.map((slot) => {
    const definition = definitionsById.get(slot.definitionId);
    const slotIssues = issues.filter((issue) => issue.slotId === slot.definitionId);

    if (!definition) {
      throw new Error(`Unknown build workspace slot: ${slot.definitionId}`);
    }

    return {
      ...slot,
      definition,
      inventoryMatches: inventoryCounts[slot.definitionId] ?? 0,
      issues: slotIssues,
      searchHref: "",
      status: getSlotStatus(
        slot.definitionId,
        Boolean(slot.selectedHardware),
        slotIssues
      )
    };
  });

  const areaSummaries: BuildValidationAreaSummary[] = Object.entries(areaLabels).map(
    ([area, label]) => {
      const areaIssues = issues.filter(
        (issue) => issue.area === (area as BuildValidationAreaId)
      );

      return {
        area: area as BuildValidationAreaId,
        issueCount: areaIssues.length,
        label,
        status: getAreaStatus(areaIssues)
      };
    }
  );

  return {
    areaSummaries,
    blockingCount,
    completionPercent: getCompletionPercent(project),
    issues,
    overallStatus:
      blockingCount > 0 ? "Blocked" : warningCount > 0 ? "Needs review" : "Ready",
    platformHealth,
    slots,
    upgradePathScore,
    warningCount
  };
}
