import type {
  CompatibilityReport,
  CompatibilityResult,
  CompatibilitySeverity,
  UpgradeSuggestion
} from "@/types/compatibility";

const ruleSuggestions: Record<
  string,
  {
    priority: CompatibilitySeverity;
    title: string;
  }
> = {
  "case-airflow": {
    priority: "medium",
    title: "Improve case airflow"
  },
  "cpu-cooler-clearance": {
    priority: "high",
    title: "Choose a cooler that fits and matches CPU heat"
  },
  "gpu-height-thickness": {
    priority: "high",
    title: "Use a lower-profile or thinner GPU"
  },
  "gpu-length-chassis": {
    priority: "high",
    title: "Choose a shorter GPU or larger chassis"
  },
  "gpu-motherboard-pcie": {
    priority: "medium",
    title: "Check PCIe slot bandwidth and clearance"
  },
  "m2-slots": {
    priority: "medium",
    title: "Free an M.2 slot or switch to SATA storage"
  },
  "psu-connectors": {
    priority: "high",
    title: "Use a PSU with the required GPU power connectors"
  },
  "psu-wattage-headroom": {
    priority: "high",
    title: "Increase PSU wattage headroom"
  },
  "ram-capacity": {
    priority: "high",
    title: "Stay within the motherboard memory limit"
  },
  "ram-slots": {
    priority: "medium",
    title: "Use higher-capacity DIMMs or free RAM slots"
  },
  "ram-type": {
    priority: "high",
    title: "Use the supported RAM generation"
  },
  "sata-ports": {
    priority: "medium",
    title: "Add fewer SATA drives or use an expansion controller"
  },
  "storage-interface": {
    priority: "high",
    title: "Match storage drives to supported interfaces"
  },
  "thermal-risk": {
    priority: "high",
    title: "Lower thermal load before upgrading"
  },
  "upgrade-path": {
    priority: "low",
    title: "Prefer a platform with more expansion room"
  }
};

function resultNeedsSuggestion(result: CompatibilityResult) {
  return result.status !== "Compatible";
}

export function buildUpgradeSuggestions(
  report: Pick<CompatibilityReport, "results">
): UpgradeSuggestion[] {
  return report.results
    .filter(resultNeedsSuggestion)
    .map((result) => {
      const template = ruleSuggestions[result.ruleId] ?? {
        priority: "medium" as const,
        title: `Review ${result.category}`
      };

      return {
        priority: template.priority,
        reason: result.reason,
        title: template.title
      };
    })
    .slice(0, 6);
}
