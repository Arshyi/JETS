import { getComponentById } from "@/lib/component-inventory";
import { getPlatformKnowledgeById } from "@/lib/platform-knowledge";
import type { ComponentInventoryItem } from "@/types/component-inventory";
import type {
  BuildSlotId,
  BuildValidationIssue,
  BuildWorkspaceModel,
  BuildWorkspaceSlot,
  WorkspaceHardwareSelection
} from "@/types/solution-builder";
import type {
  AdvisorGoalId,
  BottleneckAnalysis,
  BottleneckFinding,
  BuildReasoningFinding,
  ConfidenceSignal,
  CostAllocation,
  DecisionTimelineEvent,
  HiddenOpportunity,
  OptimizationAdvisorRecommendation,
  QualitativeRiskLevel,
  SolutionIntelligenceReport,
  SolutionUseCaseId,
  UpgradeImpactScenario,
  UseCaseReasoning
} from "@/types/solution-intelligence";

const useCaseTitles: Record<SolutionUseCaseId, string> = {
  cad: "CAD",
  engineering: "Engineering",
  gaming: "Gaming",
  "home-server": "Home Server",
  "local-ai": "Local AI",
  office: "Office",
  programming: "Programming",
  rendering: "Rendering",
  streaming: "Streaming",
  virtualization: "Virtualization"
};

const advisorTitles: Record<AdvisorGoalId, string> = {
  "best-ai": "Best AI",
  "best-engineering": "Best Engineering",
  "best-value": "Best Value",
  "highest-fps": "Highest FPS",
  "lowest-cost": "Lowest Cost",
  "lowest-power": "Lowest Power",
  "most-upgradeable": "Most Upgradeable",
  quietest: "Quietest"
};

function confidence(
  source: ConfidenceSignal["source"],
  confidenceValue: ConfidenceSignal["confidence"],
  reason: string
): ConfidenceSignal {
  return {
    confidence: confidenceValue,
    reason,
    source
  };
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getSlot(projectSlots: BuildWorkspaceSlot[], slotId: BuildSlotId) {
  return projectSlots.find((slot) => slot.definitionId === slotId);
}

function getSlotComponent(
  projectSlots: BuildWorkspaceSlot[],
  slotId: BuildSlotId
) {
  return getComponentById(getSlot(projectSlots, slotId)?.selectedHardware?.componentId);
}

function getSelectionLabel(
  projectSlots: BuildWorkspaceSlot[],
  slotId: BuildSlotId,
  fallback: string
) {
  return getSlot(projectSlots, slotId)?.selectedHardware?.label ?? fallback;
}

function getSelectionFacts(selection: WorkspaceHardwareSelection | undefined) {
  return selection?.facts ?? {};
}

function getSelectedComponents(projectSlots: BuildWorkspaceSlot[]) {
  return projectSlots
    .map((slot) => ({
      component: getComponentById(slot.selectedHardware?.componentId),
      selection: slot.selectedHardware,
      slotId: slot.definitionId
    }))
    .filter(
      (entry): entry is {
        component: ComponentInventoryItem;
        selection: WorkspaceHardwareSelection | undefined;
        slotId: BuildSlotId;
      } => Boolean(entry.component)
    );
}

function getCpuTier(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("i5-8500") || normalized.includes("xeon e5")) {
    return "older-midrange";
  }

  if (normalized.includes("ryzen 5 5600") || normalized.includes("xeon w")) {
    return "modern-midrange";
  }

  if (normalized.includes("i7") || normalized.includes("ryzen 7")) {
    return "strong";
  }

  return "unknown";
}

function getGpuTier(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("4070") || normalized.includes("3090") || normalized.includes("7900")) {
    return "high";
  }

  if (
    normalized.includes("3060 ti") ||
    normalized.includes("6700 xt") ||
    normalized.includes("1080 ti")
  ) {
    return "mid-high";
  }

  if (normalized.includes("3060") || normalized.includes("1650")) {
    return "mid";
  }

  return "unknown";
}

function getGpuVramEstimate(label: string) {
  const normalized = label.toLowerCase();

  if (normalized.includes("3090")) {
    return 24;
  }

  if (normalized.includes("4070") || normalized.includes("3060")) {
    return normalized.includes("ti") ? 8 : 12;
  }

  if (normalized.includes("6700 xt")) {
    return 12;
  }

  if (normalized.includes("1650")) {
    return 4;
  }

  return 8;
}

function getEstimatedPowerDraw(projectSlots: BuildWorkspaceSlot[]) {
  const cpu = getSlot(projectSlots, "cpu")?.selectedHardware;
  const gpu = getSlot(projectSlots, "gpu")?.selectedHardware;
  const cpuWatts = getSelectionFacts(cpu).tdpWatts ?? 65;
  const gpuWatts = getSelectionFacts(gpu).boardPowerWatts ?? 0;

  return cpuWatts + gpuWatts + 90;
}

function getPsuWattage(projectSlots: BuildWorkspaceSlot[]) {
  const psu = getSlot(projectSlots, "psu")?.selectedHardware;

  return getSelectionFacts(psu).wattage ?? 0;
}

function getRisk(
  level: QualitativeRiskLevel,
  title: string,
  reason: string,
  source: ConfidenceSignal["source"] = "compatibility-rules",
  confidenceValue: ConfidenceSignal["confidence"] = "medium"
): BottleneckFinding {
  return {
    confidence: confidence(source, confidenceValue, reason),
    level,
    reason,
    title
  };
}

function getCpuBottleneck(projectSlots: BuildWorkspaceSlot[]): BottleneckFinding {
  const cpuLabel = getSelectionLabel(projectSlots, "cpu", "No CPU selected");
  const gpuLabel = getSelectionLabel(projectSlots, "gpu", "No GPU selected");
  const cpuTier = getCpuTier(cpuLabel);
  const gpuTier = getGpuTier(gpuLabel);

  if (cpuLabel === "No CPU selected") {
    return getRisk("critical", "CPU bottleneck", "No CPU is selected.");
  }

  if (gpuTier === "high" && cpuTier === "older-midrange") {
    return getRisk(
      "high",
      "CPU bottleneck",
      `${cpuLabel} may hold back ${gpuLabel} in high-FPS gaming and interactive workloads.`
    );
  }

  if (gpuTier === "mid-high" && cpuTier === "older-midrange") {
    return getRisk(
      "moderate",
      "CPU bottleneck",
      `${cpuLabel} is workable, but some gaming and CAD interactions can become CPU-limited.`
    );
  }

  return getRisk(
    "low",
    "CPU bottleneck",
    `${cpuLabel} is a reasonable pairing for the current GPU class.`,
    "compatibility-rules",
    "high"
  );
}

function getGpuBottleneck(projectSlots: BuildWorkspaceSlot[]): BottleneckFinding {
  const gpuLabel = getSelectionLabel(projectSlots, "gpu", "No GPU selected");
  const gpuTier = getGpuTier(gpuLabel);

  if (gpuLabel === "No GPU selected") {
    return getRisk("critical", "GPU bottleneck", "No GPU or graphics path is selected.");
  }

  if (gpuTier === "mid" || gpuTier === "unknown") {
    return getRisk(
      "moderate",
      "GPU bottleneck",
      `${gpuLabel} is usable, but may limit gaming, rendering, CAD viewport, or local AI ambitions.`
    );
  }

  return getRisk(
    "low",
    "GPU bottleneck",
    `${gpuLabel} is strong enough for the current deterministic project target.`,
    "decision-engine",
    "medium"
  );
}

function getRamBottleneck(projectSlots: BuildWorkspaceSlot[]): BottleneckFinding {
  const ram = getSlot(projectSlots, "ram")?.selectedHardware;
  const capacity = getSelectionFacts(ram).ramCapacityGb ?? 0;

  if (!ram) {
    return getRisk("critical", "RAM bottleneck", "No RAM is selected.");
  }

  if (capacity < 16) {
    return getRisk("high", "RAM bottleneck", "Less than 16 GB limits modern multitasking.");
  }

  if (capacity < 32) {
    return getRisk(
      "moderate",
      "RAM bottleneck",
      "16 GB is usable, but engineering, CAD, virtualization, and local AI have little headroom."
    );
  }

  return getRisk(
    capacity >= 64 ? "very-low" : "low",
    "RAM bottleneck",
    `${capacity} GB gives healthy memory headroom for the current build.`,
    "compatibility-rules",
    "high"
  );
}

function getPcieBottleneck(model: BuildWorkspaceModel): BottleneckFinding {
  const platformProfile = getPlatformKnowledgeById(model.platformInsight?.platformId);
  const generation =
    platformProfile?.specifications.pcieGeneration ??
    getSelectionFacts(getSlot(model.project.slots, "motherboard")?.selectedHardware)
      .pcieGeneration ??
    0;

  if (!generation) {
    return getRisk(
      "moderate",
      "PCIe bottleneck",
      "PCIe generation is unknown, so bandwidth assumptions should stay conservative."
    );
  }

  if (generation <= 2) {
    return getRisk(
      "high",
      "PCIe bottleneck",
      "PCIe Gen2 can affect modern GPU, NVMe, and large transfer workloads.",
      "platform-knowledge",
      "high"
    );
  }

  if (generation === 3) {
    return getRisk(
      "low",
      "PCIe bottleneck",
      "PCIe Gen3 is sufficient for most single-GPU gaming, CAD, and CUDA workloads, with some transfer caveats.",
      "platform-knowledge",
      "high"
    );
  }

  return getRisk(
    "very-low",
    "PCIe bottleneck",
    "PCIe Gen4 or newer leaves strong bandwidth headroom for the current demo workload.",
    "platform-knowledge",
    "medium"
  );
}

function getVramBottleneck(projectSlots: BuildWorkspaceSlot[]): BottleneckFinding {
  const gpuLabel = getSelectionLabel(projectSlots, "gpu", "No GPU selected");
  const vram = getGpuVramEstimate(gpuLabel);

  if (gpuLabel === "No GPU selected") {
    return getRisk("critical", "VRAM bottleneck", "No GPU is selected.");
  }

  if (vram < 8) {
    return getRisk("high", "VRAM bottleneck", `${gpuLabel} likely has limited VRAM.`);
  }

  if (vram < 12) {
    return getRisk(
      "moderate",
      "VRAM bottleneck",
      `${gpuLabel} is fine for many tasks, but local AI and large scenes may want more VRAM.`
    );
  }

  return getRisk(
    "low",
    "VRAM bottleneck",
    `${gpuLabel} has enough estimated VRAM for a broad demo workload.`,
    "decision-engine",
    "medium"
  );
}

function getStorageBottleneck(projectSlots: BuildWorkspaceSlot[]): BottleneckFinding {
  const storageLabel = getSelectionLabel(projectSlots, "storage", "No storage selected");
  const normalized = storageLabel.toLowerCase();

  if (storageLabel === "No storage selected") {
    return getRisk("critical", "Storage bottleneck", "No storage is selected.");
  }

  if (!normalized.includes("nvme")) {
    return getRisk(
      "moderate",
      "Storage bottleneck",
      `${storageLabel} is workable, but NVMe would improve boot, project load, and scratch workflows.`
    );
  }

  return getRisk(
    "very-low",
    "Storage bottleneck",
    `${storageLabel} gives the build a fast primary storage path.`,
    "compatibility-rules",
    "high"
  );
}

function getCoolingBottleneck(projectSlots: BuildWorkspaceSlot[]): BottleneckFinding {
  const cooler = getSlot(projectSlots, "cpu-cooler")?.selectedHardware;
  const chassisFacts = getSelectionFacts(getSlot(projectSlots, "chassis")?.selectedHardware);
  const airflow = chassisFacts.airflowRating ?? 50;

  if (!cooler) {
    return getRisk("high", "Cooling bottleneck", "No CPU cooler is selected.");
  }

  if (airflow < 50) {
    return getRisk(
      "moderate",
      "Cooling bottleneck",
      "The selected chassis has limited airflow, so quiet or high-power builds need extra care."
    );
  }

  return getRisk(
    "low",
    "Cooling bottleneck",
    "Cooling appears reasonable for the current deterministic component mix.",
    "compatibility-rules",
    "medium"
  );
}

function getPsuHeadroom(projectSlots: BuildWorkspaceSlot[]): BottleneckFinding {
  const psuWatts = getPsuWattage(projectSlots);
  const estimatedDraw = getEstimatedPowerDraw(projectSlots);

  if (!psuWatts) {
    return getRisk("critical", "PSU headroom", "No PSU or power path is selected.");
  }

  if (psuWatts < estimatedDraw * 1.15) {
    return getRisk(
      "high",
      "PSU headroom",
      `Estimated draw leaves little PSU headroom for transient GPU load and future upgrades.`
    );
  }

  if (psuWatts < estimatedDraw * 1.35) {
    return getRisk(
      "moderate",
      "PSU headroom",
      "PSU headroom is usable, but not generous for a future GPU jump."
    );
  }

  return getRisk(
    "low",
    "PSU headroom",
    "Power headroom looks practical for the current component class.",
    "compatibility-rules",
    "medium"
  );
}

function getBottlenecks(model: BuildWorkspaceModel): BottleneckAnalysis {
  const slots = model.project.slots;

  return {
    cooling: getCoolingBottleneck(slots),
    cpu: getCpuBottleneck(slots),
    gpu: getGpuBottleneck(slots),
    pcie: getPcieBottleneck(model),
    psuHeadroom: getPsuHeadroom(slots),
    ram: getRamBottleneck(slots),
    storage: getStorageBottleneck(slots),
    vram: getVramBottleneck(slots)
  };
}

function issueToFinding(issue: BuildValidationIssue): BuildReasoningFinding {
  return {
    confidence: confidence(
      "compatibility-rules",
      issue.confidence >= 90 ? "high" : "medium",
      issue.reason
    ),
    id: issue.id,
    reason: issue.reason,
    relatedSlots: issue.slotId ? [issue.slotId] : [],
    status: issue.severity === "blocking" ? "rejected" : "warning",
    title: issue.title
  };
}

function getWhyThisWorks(model: BuildWorkspaceModel): BuildReasoningFinding[] {
  const slots = model.project.slots;
  const findings: BuildReasoningFinding[] = [];
  const gpuLabel = getSelectionLabel(slots, "gpu", "No GPU selected");
  const psuWatts = getPsuWattage(slots);
  const platform = model.platformInsight;

  if (gpuLabel !== "No GPU selected" && psuWatts > 0) {
    findings.push({
      confidence: confidence(
        "compatibility-rules",
        "medium",
        "Power and GPU facts are available in the current slot model."
      ),
      id: "gpu-power-fit",
      reason: `${gpuLabel} can be evaluated against the selected power path instead of being judged alone.`,
      relatedSlots: ["gpu", "psu"],
      status: "works",
      title: "GPU and PSU are reasoned together"
    });
  }

  if (platform) {
    findings.push({
      confidence: confidence(
        "platform-knowledge",
        "high",
        "Supported by the curated platform knowledge registry."
      ),
      id: "platform-context",
      reason: `${platform.platformName} adds platform constraints, adapter paths, and upgrade ceiling to the decision.`,
      relatedSlots: ["chassis", "motherboard"],
      status: "works",
      title: "Platform knowledge is active"
    });
  }

  if (model.evaluation.completionPercent > 0) {
    findings.push({
      confidence: confidence(
        "decision-engine",
        "medium",
        "Uses the current completed slots and deterministic validation output."
      ),
      id: "budget-context",
      reason: `The current build can be checked against a ${model.project.currency} ${model.project.budget} budget instead of comparing isolated parts.`,
      relatedSlots: ["chassis", "cpu", "gpu", "ram", "storage", "psu"],
      status: "works",
      title: "Budget is evaluated as a complete system"
    });
  }

  return findings;
}

function getRejectionReasons(model: BuildWorkspaceModel) {
  return model.evaluation.issues
    .filter((issue) => issue.severity !== "info")
    .slice(0, 6)
    .map(issueToFinding);
}

function getCostAllocations(model: BuildWorkspaceModel): CostAllocation[] {
  const selected = getSelectedComponents(model.project.slots);
  const total = selected.reduce((sum, entry) => sum + entry.component.price, 0);

  return selected.map((entry) => {
    const percent = total > 0 ? clampPercent((entry.component.price / total) * 100) : 0;
    let status: CostAllocation["status"] = "balanced";
    let reason = "Spend is reasonable for the selected component mix.";

    if (entry.slotId === "gpu" && percent > 52) {
      status = "overspending";
      reason = "The GPU is consuming most of the build budget.";
    }

    if (entry.slotId === "psu" && percent < 5 && getSlotComponent(model.project.slots, "gpu")) {
      status = "underinvestment";
      reason = "Power is a small share of the budget despite a selected GPU.";
    }

    if (entry.slotId === "ram" && percent > 22 && model.project.purpose === "general") {
      status = "overspending";
      reason = "General-use builds rarely benefit from this much RAM spend.";
    }

    return {
      amount: entry.component.price,
      category:
        entry.component.category === "psu"
          ? "power"
          : entry.component.category === "chassis"
            ? "case"
            : entry.component.category === "cpu-cooler"
              ? "cooling"
              : entry.component.category,
      percent,
      reason,
      slotId: entry.slotId,
      status,
      title: entry.component.title
    };
  });
}

function getHiddenOpportunities(model: BuildWorkspaceModel): HiddenOpportunity[] {
  const slots = model.project.slots;
  const ramFacts = getSelectionFacts(getSlot(slots, "ram")?.selectedHardware);
  const ramCapacity = ramFacts.ramCapacityGb ?? 0;
  const cpuLabel = getSelectionLabel(slots, "cpu", "");
  const opportunities: HiddenOpportunity[] = [];

  if (ramCapacity >= 128 && ["general", "gaming"].includes(model.project.purpose)) {
    opportunities.push({
      confidence: confidence(
        "decision-engine",
        "high",
        "Use-case demand is low relative to selected memory capacity."
      ),
      estimatedSavingsUsd: 140,
      id: "ram-overspend",
      reason:
        "64 GB would likely provide nearly identical value for this use case while freeing budget for GPU, storage, or PSU quality.",
      title: "Potential RAM overspend",
      type: "overspend"
    });
  }

  if (cpuLabel.toLowerCase().includes("xeon") && model.project.purpose === "gaming") {
    opportunities.push({
      confidence: confidence(
        "decision-engine",
        "medium",
        "Gaming usually rewards higher per-core performance and platform efficiency."
      ),
      estimatedSavingsUsd: 80,
      id: "gaming-cpu-alternative",
      reason:
        "A Ryzen or newer Core platform may deliver higher FPS, lower power, and lower platform cost.",
      title: "Consider consumer CPU alternative",
      type: "alternative-path"
    });
  }

  if (getPsuHeadroom(slots).level === "high") {
    opportunities.push({
      confidence: confidence(
        "compatibility-rules",
        "medium",
        "PSU headroom is constrained by selected power facts."
      ),
      id: "psu-underinvestment",
      reason:
        "Improving the PSU path can unlock future GPU upgrades and reduce reliability risk.",
      title: "Power path underinvestment",
      type: "underinvestment"
    });
  }

  return opportunities;
}

function getPlatformOpportunities(model: BuildWorkspaceModel): HiddenOpportunity[] {
  const profile = getPlatformKnowledgeById(model.platformInsight?.platformId);

  if (!profile) {
    return [];
  }

  return profile.upgradeOpportunities.slice(0, 3).map((opportunity) => ({
    confidence: confidence(
      "platform-knowledge",
      opportunity.confidence,
      "Comes from the curated platform knowledge registry."
    ),
    estimatedSavingsUsd:
      opportunity.type === "hidden-opportunity" ? opportunity.estimatedCostUsd : undefined,
    id: `platform-${opportunity.id}`,
    reason: `${opportunity.summary} Difficulty: ${opportunity.difficulty}. Cost: $${opportunity.estimatedCostUsd}.`,
    title: opportunity.title,
    type: "platform-opportunity"
  }));
}

function getUpgradeScenarios(model: BuildWorkspaceModel): UpgradeImpactScenario[] {
  const slots = model.project.slots;
  const gpuLabel = getSelectionLabel(slots, "gpu", "No GPU selected");
  const scenarios: UpgradeImpactScenario[] = [];

  if (!gpuLabel.toLowerCase().includes("4070")) {
    scenarios.push({
      confidence: confidence(
        "decision-engine",
        "medium",
        "Estimated from component class, power facts, and platform constraints."
      ),
      current: gpuLabel,
      estimatedCostUsd: 380,
      id: "gpu-rtx4070-class",
      metrics: {
        ai: { label: "AI", value: "much-better" },
        cad: { label: "CAD", value: "better" },
        gaming: { label: "Gaming", value: "much-better" },
        noise: { label: "Noise", value: "similar" },
        powerDraw: { label: "Power draw", value: "higher" },
        rendering: { label: "Rendering", value: "better" },
        value: { label: "Value", value: "better" }
      },
      suggested: "RTX 4070 class GPU",
      summary:
        "A modern efficient GPU improves gaming, CUDA, CAD viewport work, and local AI while keeping power demands easier than older flagship cards.",
      tradeoffs: [
        "Higher upfront cost",
        "Requires PSU connector and clearance checks",
        "May expose CPU limits on older platforms"
      ]
    });
  }

  const profile = getPlatformKnowledgeById(model.platformInsight?.platformId);
  const nvmeOpportunity = profile?.upgradeOpportunities.find((opportunity) =>
    opportunity.adapterIds?.includes("pcie-nvme-adapter")
  );

  if (nvmeOpportunity) {
    scenarios.push({
      confidence: confidence(
        "platform-knowledge",
        nvmeOpportunity.confidence,
        "Supported by platform opportunity data."
      ),
      current: getSelectionLabel(slots, "storage", "Current storage path"),
      estimatedCostUsd: nvmeOpportunity.estimatedCostUsd,
      id: "platform-nvme-adapter",
      metrics: {
        ai: { label: "AI", value: "better" },
        cad: { label: "CAD", value: "better" },
        gaming: { label: "Gaming", value: "similar" },
        noise: { label: "Noise", value: "similar" },
        powerDraw: { label: "Power draw", value: "similar" },
        rendering: { label: "Rendering", value: "better" },
        value: { label: "Value", value: "much-better" }
      },
      suggested: "PCIe NVMe adapter",
      summary:
        "The platform knowledge layer identifies a low-cost storage improvement path.",
      tradeoffs: [
        "Consumes a PCIe slot",
        "Boot support can depend on BIOS or firmware",
        "Does not improve GPU-bound tasks directly"
      ]
    });
  }

  return scenarios;
}

function getUseCaseReasoning(model: BuildWorkspaceModel): UseCaseReasoning[] {
  const bottlenecks = getBottlenecks(model);
  const platform = model.platformInsight;
  const ramLevel = bottlenecks.ram.level;
  const gpuLevel = bottlenecks.gpu.level;
  const psuLevel = bottlenecks.psuHeadroom.level;

  const base: Array<{
    id: SolutionUseCaseId;
    reasons: string[];
  }> = [
    {
      id: "gaming",
      reasons: [
        gpuLevel === "low" ? "GPU class is suitable." : "GPU choice may limit FPS.",
        bottlenecks.cpu.level === "low"
          ? "CPU pairing is reasonable."
          : "CPU pairing should be reviewed."
      ]
    },
    {
      id: "engineering",
      reasons: [
        platform ? `${platform.platformName} has known platform context.` : "Platform knowledge is not active yet.",
        ramLevel === "very-low" || ramLevel === "low"
          ? "Memory headroom is suitable."
          : "Memory could limit larger projects."
      ]
    },
    {
      id: "cad",
      reasons: [
        gpuLevel === "low" ? "Viewport GPU path is reasonable." : "GPU may constrain viewport work.",
        bottlenecks.storage.level === "very-low"
          ? "Fast storage supports project load times."
          : "Storage path could slow project workflows."
      ]
    },
    {
      id: "programming",
      reasons: [
        "Programming is less GPU-sensitive than gaming or AI.",
        bottlenecks.storage.level === "very-low"
          ? "Fast storage helps builds and dependency caches."
          : "Storage upgrade would improve day-to-day responsiveness."
      ]
    },
    {
      id: "virtualization",
      reasons: [
        ramLevel === "very-low" ? "Memory is strong for VMs." : "VM density depends on RAM expansion.",
        platform ? "Platform potential helps judge expansion room." : "Platform expansion is not yet known."
      ]
    },
    {
      id: "local-ai",
      reasons: [
        bottlenecks.vram.level === "low" ? "VRAM estimate is acceptable." : "VRAM is the likely AI limit.",
        psuLevel === "low" ? "Power headroom is practical." : "GPU upgrades need power review."
      ]
    },
    {
      id: "rendering",
      reasons: [
        "Rendering value depends on whether the workload is CPU or GPU accelerated.",
        gpuLevel === "low" ? "GPU rendering has a reasonable path." : "GPU rendering may be constrained."
      ]
    },
    {
      id: "home-server",
      reasons: [
        platform ? "Platform knowledge exposes storage and networking expansion." : "Storage expansion is unclear.",
        psuLevel === "low" || psuLevel === "moderate"
          ? "Power path can be managed."
          : "Power path needs review."
      ]
    },
    {
      id: "streaming",
      reasons: [
        "Streaming depends on GPU encoder support and CPU headroom.",
        gpuLevel === "low" ? "GPU path is promising." : "GPU or encoder support needs review."
      ]
    },
    {
      id: "office",
      reasons: [
        "Office work values reliability, SSD responsiveness, and low noise over peak GPU.",
        bottlenecks.storage.level === "very-low"
          ? "Storage is more than enough."
          : "SSD/NVMe should be prioritized."
      ]
    }
  ];

  return base.map((entry) => {
    const severeCount = Object.values(bottlenecks).filter((finding) =>
      ["high", "critical"].includes(finding.level)
    ).length;
    const fit =
      severeCount >= 3
        ? "poor"
        : severeCount === 2
          ? "usable"
          : severeCount === 1
            ? "good"
            : "excellent";

    return {
      confidence: confidence(
        "decision-engine",
        "medium",
        "Use-case analysis combines deterministic bottlenecks and platform context."
      ),
      fit,
      id: entry.id,
      reasons: entry.reasons,
      title: useCaseTitles[entry.id]
    };
  });
}

function getAdvisor(model: BuildWorkspaceModel): OptimizationAdvisorRecommendation[] {
  const bottlenecks = getBottlenecks(model);
  const platform = model.platformInsight;

  return (Object.keys(advisorTitles) as AdvisorGoalId[]).map((goalId) => {
    const title = advisorTitles[goalId];
    const commonConfidence = confidence(
      "decision-engine",
      "medium",
      "Advisor uses the deterministic v2.6 reasoning report, not AI."
    );

    const recommendations: Record<AdvisorGoalId, string> = {
      "best-ai":
        bottlenecks.vram.level === "low"
          ? "Keep the GPU path and improve storage or memory next."
          : "Prioritize a higher-VRAM GPU before other upgrades.",
      "best-engineering": platform
        ? `Use ${platform.platformName} as the anchor and improve storage, memory, and GPU in that order.`
        : "Select a known workstation or base platform before optimizing engineering use.",
      "best-value": "Fix blocking validation issues before buying higher-performance parts.",
      "highest-fps":
        bottlenecks.cpu.level === "high"
          ? "Upgrade CPU/platform before chasing a larger GPU."
          : "GPU upgrade produces the clearest FPS path.",
      "lowest-cost": "Reuse owned hardware and avoid upgrades that do not fix bottlenecks.",
      "lowest-power": "Favor efficient midrange GPU and avoid dual-CPU or oversized workstation paths.",
      "most-upgradeable": platform
        ? "Keep the high-potential platform and reserve PCIe slots for storage/network expansion."
        : "Choose a platform with documented PCIe, RAM, PSU, and cooling headroom.",
      quietest: "Reduce thermal load first: efficient GPU, adequate PSU, and airflow before more fans."
    };

    return {
      confidence: commonConfidence,
      goalId,
      reasons: [
        bottlenecks.psuHeadroom.reason,
        platform
          ? `Platform Potential is ${platform.potentialScore}.`
          : "No platform profile is active yet."
      ],
      recommendedAction: recommendations[goalId],
      title,
      tradeoffs:
        goalId === "lowest-cost"
          ? ["May leave performance on the table", "Requires patience and reuse discipline"]
          : ["May increase cost", "Must preserve compatibility and validation"]
    };
  });
}

function getDecisionTimeline(model: BuildWorkspaceModel): DecisionTimelineEvent[] {
  const events: DecisionTimelineEvent[] = [
    {
      description: "Project exists and has a budget, purpose, and slot model.",
      id: "started",
      status: "completed",
      title: "Started"
    }
  ];
  const platform = model.platformInsight;
  const gpu = getSlot(model.project.slots, "gpu")?.selectedHardware;

  if (platform) {
    events.push({
      description: `${platform.platformName} selected as the platform context.`,
      id: "selected-platform",
      status: "completed",
      title: "Selected Platform"
    });
  }

  if (gpu) {
    events.push({
      description: `${gpu.label} selected for graphics or compute.`,
      id: "added-gpu",
      status: "completed",
      title: "Added GPU"
    });
  }

  for (const issue of model.evaluation.issues.filter((item) => item.severity !== "info").slice(0, 3)) {
    events.push({
      description: issue.reason,
      id: `issue-${issue.id}`,
      status: issue.severity === "blocking" ? "warning" : "opportunity",
      title: issue.title
    });
  }

  events.push({
    description: "Run optimization or branch comparison to resolve the next highest-impact tradeoff.",
    id: "next-optimization",
    status: "next",
    title: "Optimization review"
  });

  return events;
}

function getBranchIntelligence(model: BuildWorkspaceModel) {
  const platform = model.platformInsight;
  const baseConfidence = confidence(
    "manual-curation",
    "medium",
    "Branch intelligence is currently a deterministic explanation scaffold."
  );

  return [
    {
      confidence: baseConfidence,
      dimension: "cost" as const,
      reason: "Future branch comparison should explain total cost, savings, and where each branch moves the budget.",
      title: "Cost comparison"
    },
    {
      confidence: baseConfidence,
      dimension: "power" as const,
      reason: "Power and PSU headroom should be compared before recommending larger GPUs.",
      title: "Power comparison"
    },
    {
      confidence: confidence(
        "platform-knowledge",
        platform ? "high" : "medium",
        platform
          ? "Platform potential is available for branch comparison."
          : "A platform profile would strengthen branch comparison."
      ),
      dimension: "upgrade-room" as const,
      reason: platform
        ? `${platform.platformName} has Platform Potential ${platform.potentialScore}.`
        : "Branches need platform context to compare upgrade room.",
      title: "Upgrade room comparison"
    }
  ];
}

export function analyzeBuildSolution(
  model: BuildWorkspaceModel
): SolutionIntelligenceReport {
  const bottlenecks = getBottlenecks(model);
  const costAllocations = getCostAllocations(model);
  const platform = model.platformInsight;
  const criticalCount = Object.values(bottlenecks).filter(
    (finding) => finding.level === "critical"
  ).length;
  const highCount = Object.values(bottlenecks).filter(
    (finding) => finding.level === "high"
  ).length;

  return {
    advisor: getAdvisor(model),
    bottlenecks,
    branchIntelligence: getBranchIntelligence(model),
    confidence: confidence(
      platform ? "platform-knowledge" : "decision-engine",
      platform ? "high" : "medium",
      platform
        ? "Supported by compatibility rules, decision heuristics, and platform knowledge."
        : "Supported by compatibility rules and decision heuristics; platform knowledge is not active yet."
    ),
    costEfficiency: {
      allocations: costAllocations,
      summary:
        costAllocations.length > 0
          ? "JETS can see where the selected component budget is concentrated."
          : "No priced typed components are selected yet.",
      totalCost: costAllocations.reduce((sum, allocation) => sum + allocation.amount, 0)
    },
    decisionTimeline: getDecisionTimeline(model),
    hiddenOpportunities: getHiddenOpportunities(model),
    platformOpportunities: getPlatformOpportunities(model),
    rejectionReasons: getRejectionReasons(model),
    summary:
      criticalCount > 0
        ? "This build still has missing or blocking decisions before it can be treated as a finished solution."
        : highCount > 0
          ? "This build is promising, but one or more interactions need attention before optimization."
          : "This build has a coherent reasoning path under the current deterministic rules.",
    upgradeScenarios: getUpgradeScenarios(model),
    useCases: getUseCaseReasoning(model),
    whyThisWorks: getWhyThisWorks(model)
  };
}
