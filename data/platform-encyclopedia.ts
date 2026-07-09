import { platformKnowledgeProfiles } from "@/data/platform-knowledge";
import { getKnowledgeExpansionFactsForPlatform } from "@/data/knowledge-expansion";
import type { KnowledgeExpansionFact } from "@/types/knowledge-expansion";
import type {
  PlatformCoolingTopology,
  PlatformEncyclopediaEntry,
  PlatformEncyclopediaFact,
  PlatformEncyclopediaSectionId,
  PlatformEngineeringDiagram,
  PlatformLifecycleStage,
  PlatformMemoryTopology,
  PlatformPcieTopology,
  PlatformPowerTopology,
  PlatformReliabilityProfile,
  PlatformStorageTopology,
  PlatformUpgradeEncyclopedia,
  PlatformWorkloadProfile,
  PlatformWorkloadProfileId
} from "@/types/platform-encyclopedia";
import type {
  PlatformKnowledgeId,
  PlatformKnowledgeProfile
} from "@/types/platform-knowledge";

type PlatformEncyclopediaOverride = {
  airflowPattern: string;
  channelCount: number;
  chipset: string;
  connectorNotes: string[];
  driveBaySummary: string;
  lifecycleStage: PlatformLifecycleStage;
  lifecycleSummary: string;
  memorySlotCount: number;
  nominalWattageRange: string;
  powerUpgradePaths: string[];
  psuFamily: string;
  repairDifficulty: ReliabilityInput["repairDifficulty"];
  replacementAvailability: ReliabilityInput["replacementAvailability"];
  serviceLifeYears: string;
  thermalZones: string[];
  usefulRoles: string[];
  workloadBias: Partial<Record<PlatformWorkloadProfileId, number>>;
};

type ReliabilityInput = Pick<
  PlatformReliabilityProfile,
  "repairDifficulty" | "replacementAvailability" | "serviceLifeYears"
>;

const platformEvidenceIds: Record<PlatformKnowledgeId, string[]> = {
  "hp-z440": ["ev-z440-profile-spec", "ev-z440-nvme-playbook"],
  "hp-z840": ["ev-z840-profile-spec", "ev-z840-sas-hba"],
  "mac-pro-5-1": ["ev-macpro-profile-spec", "ev-macpro-nvme-firmware"],
  "optiplex-7060": [
    "ev-7060-low-profile-service",
    "ev-7060-proprietary-psu",
    "ev-7060-nvme-upgrade"
  ],
  "precision-5820": ["ev-5820-profile-spec", "ev-adapter-pcie-nvme"],
  "precision-t5810": ["ev-t5810-profile-spec", "ev-adapter-pcie-nvme"],
  "thinkstation-p510": ["ev-p510-profile-spec", "ev-p510-nvme-playbook"],
  "thinkstation-p520": [
    "ev-p520-profile-spec",
    "ev-p520-pcie-nvme-upgrade",
    "ev-p520-rtx4070-upgrade",
    "ev-p520-ram-256-official"
  ]
};

const encyclopediaOverrides: Record<PlatformKnowledgeId, PlatformEncyclopediaOverride> = {
  "hp-z440": {
    airflowPattern: "Front-to-back workstation airflow with shroud-dependent CPU and memory cooling.",
    channelCount: 4,
    chipset: "Intel C612 workstation platform",
    connectorNotes: ["Validate exact HP GPU power harness.", "Keep shroud and front intake path intact."],
    driveBaySummary: "Four SATA-oriented bays plus PCIe adapter storage paths.",
    lifecycleStage: "legacy",
    lifecycleSummary: "Still useful for budget CAD, render helper, and homelab work when bought cheaply.",
    memorySlotCount: 8,
    nominalWattageRange: "525-700 W class, configuration dependent",
    powerUpgradePaths: ["Prefer efficient GPUs.", "Validate HP-specific cable availability before buying GPU."],
    psuFamily: "HP workstation PSU",
    repairDifficulty: "moderate",
    replacementAvailability: "available",
    serviceLifeYears: "2-4 practical years for budget workstation roles.",
    thermalZones: ["front intake", "CPU shroud", "GPU bay", "rear exhaust"],
    usefulRoles: ["budget CAD", "render helper", "homelab"],
    workloadBias: { cad: 4, engineering: 4, homelab: 4, rendering: 3 }
  },
  "hp-z840": {
    airflowPattern: "Large dual-socket airflow path with separate CPU, memory, storage, and expansion zones.",
    channelCount: 8,
    chipset: "Intel C612 dual-socket workstation platform",
    connectorNotes: ["High wattage helps, but thermal spacing decides multi-GPU practicality."],
    driveBaySummary: "Large workstation storage layout that pairs well with SAS HBA expansion.",
    lifecycleStage: "legacy",
    lifecycleSummary: "Valuable when expansion, memory capacity, and lab roles beat noise and power concerns.",
    memorySlotCount: 16,
    nominalWattageRange: "850-1125 W class, configuration dependent",
    powerUpgradePaths: ["Use efficient add-in cards.", "Plan wall power and acoustic placement before conversion."],
    psuFamily: "High-wattage HP workstation PSU",
    repairDifficulty: "advanced",
    replacementAvailability: "available",
    serviceLifeYears: "2-5 years for lab, storage, and render-helper roles.",
    thermalZones: ["CPU zone A", "CPU zone B", "memory banks", "expansion slots", "storage bay"],
    usefulRoles: ["homelab", "storage", "virtualization", "render helper"],
    workloadBias: { ai: 3, engineering: 4, homelab: 5, nas: 5, rendering: 4, virtualization: 5 }
  },
  "mac-pro-5-1": {
    airflowPattern: "Compartmentalized tower airflow with firmware-sensitive GPU and storage upgrade paths.",
    channelCount: 3,
    chipset: "Intel 5520/ICH10R class platform",
    connectorNotes: ["GPU power routing must be planned around board connectors and auxiliary cables."],
    driveBaySummary: "Native SATA bays plus PCIe NVMe adapter paths when firmware supports boot.",
    lifecycleStage: "enthusiast",
    lifecycleSummary: "Best when community knowledge, repair interest, or legacy macOS needs justify the age.",
    memorySlotCount: 8,
    nominalWattageRange: "900 W class internal PSU, practical GPU routing constrained",
    powerUpgradePaths: ["Use firmware-aware GPU plans.", "Avoid pretending Gen2 PCIe behaves like modern workstations."],
    psuFamily: "Apple tower PSU",
    repairDifficulty: "advanced",
    replacementAvailability: "specialist",
    serviceLifeYears: "1-3 practical years unless the platform itself is the project.",
    thermalZones: ["CPU tray", "PCIe bay", "drive bay", "rear exhaust"],
    usefulRoles: ["repair learning", "legacy workflows", "enthusiast project"],
    workloadBias: { education: 3, general: 2, homelab: 3, programming: 3 }
  },
  "optiplex-7060": {
    airflowPattern: "Compact SFF airflow with low-profile expansion and limited PSU thermal headroom.",
    channelCount: 2,
    chipset: "Intel Q370 office platform",
    connectorNotes: ["Proprietary PSU and SFF board limit GPU and power upgrade paths."],
    driveBaySummary: "Small office storage layout with native NVMe plus limited SATA expansion.",
    lifecycleStage: "mature",
    lifecycleSummary: "Strong office, school, and lightweight homelab value when not forced into gaming.",
    memorySlotCount: 4,
    nominalWattageRange: "180-260 W proprietary SFF PSU class",
    powerUpgradePaths: ["Stay low power.", "Choose another base system for normal gaming GPUs."],
    psuFamily: "Dell proprietary SFF PSU",
    repairDifficulty: "moderate",
    replacementAvailability: "plentiful",
    serviceLifeYears: "3-5 years for office, education, programming, and light server roles.",
    thermalZones: ["CPU blower", "low-profile PCIe slot", "storage bay", "rear exhaust"],
    usefulRoles: ["office", "education", "programming", "light homelab"],
    workloadBias: { education: 5, general: 4, homelab: 3, office: 5, programming: 4 }
  },
  "precision-5820": {
    airflowPattern: "Modern single-socket workstation airflow with stronger GPU and storage headroom than older towers.",
    channelCount: 4,
    chipset: "Intel C422 workstation platform",
    connectorNotes: ["GPU cable kits vary; validate exact PSU/cable configuration."],
    driveBaySummary: "Native NVMe support plus SATA bays and PCIe expansion paths.",
    lifecycleStage: "mature",
    lifecycleSummary: "One of the stronger used workstation bases for CAD, engineering, and AI experiments.",
    memorySlotCount: 8,
    nominalWattageRange: "425-950 W class, configuration dependent",
    powerUpgradePaths: ["Prefer official Dell GPU cable kits.", "Leave thermal spacing for modern RTX cards."],
    psuFamily: "Dell Precision workstation PSU",
    repairDifficulty: "moderate",
    replacementAvailability: "available",
    serviceLifeYears: "3-6 years for serious workstation reuse.",
    thermalZones: ["front intake", "CPU duct", "GPU bay", "storage bay", "rear exhaust"],
    usefulRoles: ["CAD", "engineering", "AI experiments", "rendering"],
    workloadBias: { ai: 4, cad: 5, engineering: 5, rendering: 4, virtualization: 4 }
  },
  "precision-t5810": {
    airflowPattern: "Older Dell tower airflow with practical GPU and adapter paths if PSU cables are known.",
    channelCount: 4,
    chipset: "Intel C612 workstation platform",
    connectorNotes: ["PSU wattage and Dell GPU cable kit vary by unit."],
    driveBaySummary: "SATA-heavy layout improved by PCIe NVMe adapter storage.",
    lifecycleStage: "legacy",
    lifecycleSummary: "Useful as a budget workstation when the acquisition price is genuinely low.",
    memorySlotCount: 8,
    nominalWattageRange: "425-685 W class, configuration dependent",
    powerUpgradePaths: ["Validate cable kit first.", "Prefer midrange efficient GPUs."],
    psuFamily: "Dell Precision workstation PSU",
    repairDifficulty: "moderate",
    replacementAvailability: "available",
    serviceLifeYears: "2-4 years for budget CAD, programming, and lab helper roles.",
    thermalZones: ["front intake", "CPU duct", "GPU bay", "storage bay"],
    usefulRoles: ["budget CAD", "programming", "render helper", "homelab"],
    workloadBias: { cad: 3, engineering: 4, homelab: 4, programming: 4 }
  },
  "thinkstation-p510": {
    airflowPattern: "Single-socket workstation airflow with meaningful PCIe expansion and BIOS-dependent CPU path.",
    channelCount: 4,
    chipset: "Intel C612 workstation platform",
    connectorNotes: ["Verify exact Lenovo PSU connectors before GPU selection."],
    driveBaySummary: "SATA bays plus high-value PCIe NVMe adapter path.",
    lifecycleStage: "legacy",
    lifecycleSummary: "Good budget engineering base when priced low and upgraded conservatively.",
    memorySlotCount: 8,
    nominalWattageRange: "490-650 W class, configuration dependent",
    powerUpgradePaths: ["Use efficient GPUs.", "Avoid high-wattage cards without cable evidence."],
    psuFamily: "Lenovo ThinkStation PSU",
    repairDifficulty: "moderate",
    replacementAvailability: "available",
    serviceLifeYears: "2-4 years for engineering, CAD, programming, and lab roles.",
    thermalZones: ["front intake", "CPU duct", "GPU bay", "storage bay"],
    usefulRoles: ["engineering", "CAD", "programming", "homelab"],
    workloadBias: { cad: 4, engineering: 4, homelab: 3, programming: 4 }
  },
  "thinkstation-p520": {
    airflowPattern: "Modernized single-socket workstation airflow with strong GPU, ECC, and PCIe expansion potential.",
    channelCount: 4,
    chipset: "Intel C422 workstation platform",
    connectorNotes: ["GPU cable and drive cage layout should be verified before large GPU upgrades."],
    driveBaySummary: "SATA bays plus high-value PCIe NVMe adapter paths for scratch and boot storage.",
    lifecycleStage: "mature",
    lifecycleSummary: "Excellent used workstation base when power, airflow, and storage adapter paths are documented.",
    memorySlotCount: 8,
    nominalWattageRange: "490-900 W class, configuration dependent",
    powerUpgradePaths: ["Use efficient modern RTX cards.", "Validate cable kit and shroud clearance."],
    psuFamily: "Lenovo ThinkStation PSU",
    repairDifficulty: "moderate",
    replacementAvailability: "available",
    serviceLifeYears: "3-6 years for engineering, CAD, AI experiments, and workstation reuse.",
    thermalZones: ["front intake", "CPU duct", "GPU bay", "drive cage", "rear exhaust"],
    usefulRoles: ["engineering", "CAD", "AI experiments", "sleeper workstation"],
    workloadBias: { ai: 4, cad: 5, engineering: 5, rendering: 4, virtualization: 4 }
  }
};

const workloadTitles: Record<PlatformWorkloadProfileId, string> = {
  ai: "Local AI",
  cad: "CAD",
  education: "Education",
  engineering: "Engineering",
  gaming: "Gaming",
  general: "General use",
  "home-server": "Home server",
  homelab: "Homelab",
  nas: "NAS",
  office: "Office",
  programming: "Programming",
  rendering: "Rendering",
  virtualization: "Virtualization"
};

function clampScore(value: number) {
  return Math.max(1, Math.min(5, Math.round(value)));
}

function suitabilityFromScore(score: number): PlatformWorkloadProfile["suitability"] {
  if (score >= 5) return "excellent";
  if (score >= 4) return "strong";
  if (score >= 3) return "acceptable";
  if (score >= 2) return "limited";
  return "poor";
}

function getBaseQuality(profile: PlatformKnowledgeProfile) {
  return Math.max(
    55,
    Math.round(
      (profile.potential.communitySupport +
        profile.potential.engineeringFlexibility +
        profile.potential.hiddenValue) /
        3
    )
  );
}

function getEvidenceIds(profile: PlatformKnowledgeProfile) {
  return platformEvidenceIds[profile.id];
}

function fact(
  profile: PlatformKnowledgeProfile,
  sectionId: PlatformEncyclopediaSectionId,
  suffix: string,
  title: string,
  summary: string,
  details: string[],
  options: Partial<PlatformEncyclopediaFact> = {}
): PlatformEncyclopediaFact {
  return {
    confidence: options.confidence ?? "high",
    details,
    evidenceIds: options.evidenceIds ?? getEvidenceIds(profile),
    id: `${profile.id}:${suffix}`,
    knowledgeQualityScore:
      options.knowledgeQualityScore ?? getBaseQuality(profile),
    relatedAdapterIds: options.relatedAdapterIds,
    relatedPlaybookIds: options.relatedPlaybookIds,
    relatedSlotIds: options.relatedSlotIds,
    relatedStrategyTypes: options.relatedStrategyTypes,
    sectionId,
    summary,
    title,
    verification: options.verification ?? "verified"
  };
}

function expansionFactToEncyclopediaFact(
  expansionFact: KnowledgeExpansionFact
): PlatformEncyclopediaFact {
  return {
    confidence: expansionFact.confidence,
    details: expansionFact.details,
    evidenceIds: expansionFact.evidenceIds,
    id: expansionFact.id,
    knowledgeQualityScore: expansionFact.knowledgeQualityScore,
    sectionId: expansionFact.platformSectionId ?? "overview",
    summary: expansionFact.summary,
    title: expansionFact.title,
    verification: expansionFact.verification
  };
}

function createMemoryTopology(
  profile: PlatformKnowledgeProfile,
  override: PlatformEncyclopediaOverride
): PlatformMemoryTopology {
  return {
    channelCount: override.channelCount,
    maxRamGb: profile.specifications.maxRamGb,
    notes: [
      `${profile.specifications.ramType} support is the baseline memory assumption.`,
      profile.specifications.eccSupport === "none"
        ? "ECC is not part of the normal platform value."
        : `ECC support: ${profile.specifications.eccSupport}.`,
      "Populate channels deliberately before interpreting performance issues as CPU bottlenecks."
    ],
    populationGuidance: [
      "Prefer matched capacity and speed groups.",
      "Document installed module type before buying used memory.",
      "Keep spare slot availability visible in the Builder before optimizing."
    ],
    ramType: profile.specifications.ramType,
    slotCount: override.memorySlotCount
  };
}

function createPcieTopology(
  profile: PlatformKnowledgeProfile
): PlatformPcieTopology {
  return {
    notes: [
      `Platform PCIe baseline is Gen${profile.specifications.pcieGeneration}.`,
      "Treat physical slot size and electrical lane count separately.",
      "Reserve the best GPU slot before assigning storage, networking, or adapter cards."
    ],
    pcieGeneration: profile.specifications.pcieGeneration,
    slotGuidance: profile.pcieSlots.map((slot) =>
      fact(
        profile,
        "pcie-topology",
        `pcie-${slot.id}`,
        `${slot.priority.replaceAll("-", " ")} slot`,
        slot.notes,
        [
          `Physical slot: ${slot.physicalSize}.`,
          `Electrical lanes: x${slot.electricalLanes}.`,
          `Generation: Gen${slot.generation}.`
        ],
        {
          relatedSlotIds:
            slot.priority === "primary-gpu"
              ? ["gpu"]
              : ["pcie-adapter", "additional-storage"],
          verification: "pending-review"
        }
      )
    )
  };
}

function createStorageTopology(
  profile: PlatformKnowledgeProfile,
  override: PlatformEncyclopediaOverride
): PlatformStorageTopology {
  const nativeNvme = profile.specifications.nvmeSupport === "native";
  const storageFact = fact(
    profile,
    "storage-topology",
    "storage-guidance",
    "Storage guidance",
    nativeNvme
      ? "Use native NVMe first, then SATA for bulk storage."
      : "Use PCIe NVMe adapter paths for fast storage when appropriate.",
    [
      `SATA ports: ${profile.specifications.sataPorts}.`,
      `NVMe support: ${profile.specifications.nvmeSupport}.`,
      override.driveBaySummary
    ],
    {
      relatedAdapterIds: nativeNvme ? undefined : ["pcie-nvme-adapter"],
      relatedSlotIds: nativeNvme ? ["storage"] : ["storage", "pcie-adapter"]
    }
  );

  return {
    driveBaySummary: override.driveBaySummary,
    nativeNvme,
    notes: [
      "Separate boot, active project, scratch, and bulk storage roles.",
      "Storage upgrades should not consume the only clean GPU airflow path."
    ],
    sataPorts: profile.specifications.sataPorts,
    storageGuidance: [storageFact]
  };
}

function createPowerTopology(
  profile: PlatformKnowledgeProfile,
  override: PlatformEncyclopediaOverride
): PlatformPowerTopology {
  return {
    connectorNotes: override.connectorNotes,
    nominalWattageRange: override.nominalWattageRange,
    powerGuidance: [
      fact(
        profile,
        "power-system",
        "power-verification",
        "Power verification",
        profile.specifications.psuNotes,
        [
          override.psuFamily,
          ...override.connectorNotes,
          "Do not treat wattage alone as connector, cable, or thermal proof."
        ],
        {
          relatedSlotIds: ["psu", "gpu"],
          relatedStrategyTypes: ["buy-used-workstation", "hybrid-strategy"]
        }
      )
    ],
    psuFamily: override.psuFamily,
    upgradePaths: override.powerUpgradePaths
  };
}

function createCoolingTopology(
  profile: PlatformKnowledgeProfile,
  override: PlatformEncyclopediaOverride
): PlatformCoolingTopology {
  return {
    airflowPattern: override.airflowPattern,
    coolingGuidance: [
      fact(
        profile,
        "cooling",
        "thermal-guidance",
        "Thermal guidance",
        override.airflowPattern,
        [
          "Inspect the thermal path before installing higher-draw hardware.",
          "Do not remove ducts, shrouds, or drive cages without understanding airflow consequences.",
          "Stress testing is part of the build, not an afterthought."
        ],
        {
          relatedSlotIds: ["fans", "cpu-cooler", "gpu"],
          relatedStrategyTypes: ["hybrid-strategy", "buy-used-workstation"]
        }
      )
    ],
    thermalZones: override.thermalZones,
    upgradePaths: [
      "Clean intake and exhaust paths.",
      "Replace failed or noisy fans before tuning performance.",
      "Leave spacing for hot add-in cards."
    ]
  };
}

function createReliability(
  profile: PlatformKnowledgeProfile,
  override: PlatformEncyclopediaOverride
): PlatformReliabilityProfile {
  const commonFailures = [
    fact(
      profile,
      "common-failures",
      "common-failure-power-cooling",
      "Power and cooling wear",
      "Used enterprise systems should be checked for PSU, fan, and airflow wear before upgrades.",
      [
        "Fan noise, fan errors, missing shrouds, and unusual PSU behavior are acquisition signals.",
        "A clean stress test matters more than seller cosmetic language."
      ],
      { confidence: "medium", verification: "pending-review" }
    ),
    ...profile.constraints.map((constraint) =>
      fact(
        profile,
        "known-limitations",
        `constraint-${constraint.id}`,
        constraint.title,
        constraint.description,
        [constraint.mitigation ?? "No mitigation documented yet."],
        {
          confidence: constraint.confidence,
          evidenceIds: constraint.evidenceIds ?? getEvidenceIds(profile),
          verification: "pending-review"
        }
      )
    )
  ];

  return {
    commonFailures,
    firmwareIssues: [
      fact(
        profile,
        "firmware-bios",
        "firmware-check",
        "Firmware check",
        "BIOS and firmware state should be recorded before CPU, storage, or GPU assumptions are treated as safe.",
        [
          `Maximum CPU generation note: ${profile.specifications.maxCpuGeneration}.`,
          "Capture BIOS version in project notes when buying used hardware."
        ],
        {
          relatedSlotIds: ["motherboard", "cpu", "storage"],
          verification: "pending-review"
        }
      )
    ],
    repairDifficulty: override.repairDifficulty,
    replacementAvailability: override.replacementAvailability,
    serviceLifeYears: override.serviceLifeYears
  };
}

function createWorkloadProfiles(
  profile: PlatformKnowledgeProfile,
  override: PlatformEncyclopediaOverride
): PlatformWorkloadProfile[] {
  const workloadIds: PlatformWorkloadProfileId[] = [
    "engineering",
    "gaming",
    "ai",
    "rendering",
    "virtualization",
    "nas",
    "home-server",
    "office",
    "education"
  ];

  return workloadIds.map((id) => {
    const score = clampScore(override.workloadBias[id] ?? 2);
    const suitability = suitabilityFromScore(score);

    return {
      caveats:
        score >= 4
          ? ["Validate exact PSU, cooling, storage, and installed configuration."]
          : ["Use only when constraints are acceptable or owned hardware changes the economics."],
      id,
      reasons: [
        `${profile.name} has Platform Potential ${profile.potential.overall}.`,
        `${profile.specifications.ramType}, ${profile.specifications.nvmeSupport} NVMe support, and Gen${profile.specifications.pcieGeneration} PCIe shape this workload.`
      ],
      suitability,
      title: workloadTitles[id]
    };
  });
}

function createUpgradeEncyclopedia(
  profile: PlatformKnowledgeProfile,
  storage: PlatformStorageTopology,
  power: PlatformPowerTopology,
  cooling: PlatformCoolingTopology
): PlatformUpgradeEncyclopedia {
  return {
    adapterPaths: profile.upgradeOpportunities
      .filter((opportunity) => opportunity.adapterIds?.length)
      .map((opportunity) =>
        fact(
          profile,
          "upgrade-encyclopedia",
          `adapter-${opportunity.id}`,
          opportunity.title,
          opportunity.summary,
          [
            `Difficulty: ${opportunity.difficulty}.`,
            `Estimated cost: $${opportunity.estimatedCostUsd}.`,
            ...(opportunity.prerequisites ?? [])
          ],
          {
            confidence: opportunity.confidence,
            evidenceIds: opportunity.evidenceIds ?? getEvidenceIds(profile),
            relatedAdapterIds: opportunity.adapterIds,
            relatedSlotIds: opportunity.recommendedSlotIds,
            verification: "pending-review"
          }
        )
      ),
    coolingUpgradePaths: cooling.coolingGuidance,
    eccCompatibility: fact(
      profile,
      "upgrade-encyclopedia",
      "ecc-compatibility",
      "ECC compatibility",
      `ECC support is modeled as ${profile.specifications.eccSupport}.`,
      [
        profile.specifications.eccSupport === "none"
          ? "Do not value this platform as an ECC workstation."
          : "Confirm exact memory type before buying used modules."
      ],
      { relatedSlotIds: ["ram"] }
    ),
    gpuLimitations: profile.constraints
      .filter((constraint) =>
        `${constraint.title} ${constraint.description}`.toLowerCase().includes("gpu")
      )
      .map((constraint) =>
        fact(
          profile,
          "upgrade-encyclopedia",
          `gpu-${constraint.id}`,
          constraint.title,
          constraint.description,
          [constraint.mitigation ?? "GPU path needs exact-unit validation."],
          { confidence: constraint.confidence, relatedSlotIds: ["gpu", "psu"] }
        )
      ),
    maxRam: fact(
      profile,
      "upgrade-encyclopedia",
      "max-ram",
      "Maximum RAM",
      `${profile.name} is modeled with a ${profile.specifications.maxRamGb} GB RAM ceiling.`,
      [
        `RAM type: ${profile.specifications.ramType}.`,
        "Community claims above the modeled ceiling require evidence review before promotion."
      ],
      { relatedSlotIds: ["ram"] }
    ),
    maxStorage: storage.storageGuidance[0],
    nvmeAdapterSupport: fact(
      profile,
      "upgrade-encyclopedia",
      "nvme-adapter-support",
      "NVMe adapter support",
      `NVMe support is modeled as ${profile.specifications.nvmeSupport}.`,
      [
        profile.specifications.nvmeSupport === "native"
          ? "Use native NVMe first before spending PCIe slots."
          : "PCIe NVMe adapters are a candidate path when boot and slot planning are acceptable."
      ],
      {
        relatedAdapterIds:
          profile.specifications.nvmeSupport === "native"
            ? undefined
            : ["pcie-nvme-adapter"],
        relatedSlotIds: ["storage", "pcie-adapter"]
      }
    ),
    pcieBifurcation: fact(
      profile,
      "upgrade-encyclopedia",
      "pcie-bifurcation",
      "PCIe bifurcation",
      "Bifurcation is treated as unknown until exact motherboard, BIOS, and adapter evidence exists.",
      [
        "Do not assume multi-NVMe carrier cards work as intended without BIOS evidence.",
        "Single-drive passive adapters remain the conservative path."
      ],
      { confidence: "medium", verification: "pending-review" }
    ),
    powerUpgradePaths: power.powerGuidance
  };
}

function createDiagrams(
  profile: PlatformKnowledgeProfile,
  memory: PlatformMemoryTopology,
  power: PlatformPowerTopology,
  cooling: PlatformCoolingTopology
): PlatformEngineeringDiagram[] {
  return [
    {
      description: "Metadata-only PCIe lane and role map for Builder reasoning.",
      edges: profile.pcieSlots.map((slot) => ({
        from: "chipset",
        label: `Gen${slot.generation} x${slot.electricalLanes}`,
        to: slot.id
      })),
      id: `${profile.id}:diagram-pcie`,
      nodes: [
        { id: "cpu", label: "CPU", metadata: { socket: profile.specifications.cpuSocket }, role: "compute" },
        { id: "chipset", label: "Chipset", metadata: { pcieGeneration: profile.specifications.pcieGeneration }, role: "io-hub" },
        ...profile.pcieSlots.map((slot) => ({
          id: slot.id,
          label: slot.priority.replaceAll("-", " "),
          metadata: {
            electricalLanes: slot.electricalLanes,
            generation: slot.generation,
            physicalSize: slot.physicalSize
          },
          role: "pcie-slot"
        }))
      ],
      title: "PCIe lane map",
      type: "pcie-lane-map"
    },
    {
      description: "Memory channel and population metadata for upgrade planning.",
      edges: [],
      id: `${profile.id}:diagram-memory`,
      nodes: [
        {
          id: "memory-controller",
          label: "Memory controller",
          metadata: { channelCount: memory.channelCount, maxRamGb: memory.maxRamGb },
          role: "memory-controller"
        },
        {
          id: "memory-slots",
          label: "DIMM slots",
          metadata: { ramType: memory.ramType, slotCount: memory.slotCount },
          role: "memory-slots"
        }
      ],
      title: "Memory channel layout",
      type: "memory-channel-layout"
    },
    {
      description: "Power connector and PSU planning metadata.",
      edges: [],
      id: `${profile.id}:diagram-power`,
      nodes: [
        {
          id: "psu",
          label: power.psuFamily,
          metadata: { wattageRange: power.nominalWattageRange },
          role: "psu"
        },
        {
          id: "gpu-power",
          label: "GPU power path",
          metadata: { notes: power.connectorNotes.join(" ") },
          role: "connector-path"
        }
      ],
      title: "Power connectors",
      type: "power-connectors"
    },
    {
      description: "Thermal zones used by Action Plans and validation hints.",
      edges: [],
      id: `${profile.id}:diagram-thermal`,
      nodes: cooling.thermalZones.map((zone) => ({
        id: zone.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        label: zone,
        metadata: { airflowPattern: cooling.airflowPattern },
        role: "thermal-zone"
      })),
      title: "Thermal zones",
      type: "thermal-zones"
    }
  ];
}

function createEntry(profile: PlatformKnowledgeProfile): PlatformEncyclopediaEntry {
  const override = encyclopediaOverrides[profile.id];
  const memoryTopology = createMemoryTopology(profile, override);
  const pcieTopology = createPcieTopology(profile);
  const storageTopology = createStorageTopology(profile, override);
  const powerSystem = createPowerTopology(profile, override);
  const cooling = createCoolingTopology(profile, override);
  const reliability = createReliability(profile, override);
  const upgradeEncyclopedia = createUpgradeEncyclopedia(
    profile,
    storageTopology,
    powerSystem,
    cooling
  );
  const overview = fact(
    profile,
    "overview",
    "overview",
    `${profile.name} overview`,
    profile.summary,
    [
      `Family: ${profile.family}.`,
      `Model years: ${profile.modelYears}.`,
      `Platform Potential: ${profile.potential.overall}.`
    ]
  );
  const chipset = fact(
    profile,
    "chipset",
    "chipset",
    "Chipset",
    override.chipset,
    [
      `CPU socket: ${profile.specifications.cpuSocket}.`,
      `PCIe generation: Gen${profile.specifications.pcieGeneration}.`
    ]
  );
  const cpuSupport = fact(
    profile,
    "cpu-support",
    "cpu-support",
    "CPU support",
    profile.specifications.maxCpuGeneration,
    [
      profile.specifications.dualCpuSupport
        ? "Dual CPU configuration is supported or represented by the platform."
        : "Single CPU configuration is the modeled baseline.",
      "Exact CPU upgrades still require BIOS and thermal review."
    ],
    { relatedSlotIds: ["cpu", "motherboard"] }
  );
  const firmwareBios = reliability.firmwareIssues;
  const hiddenCapabilities = profile.upgradeOpportunities.map((opportunity) =>
    fact(
      profile,
      "hidden-capabilities",
      `hidden-${opportunity.id}`,
      opportunity.title,
      opportunity.summary,
      [
        `Expected benefit rating: ${opportunity.expectedBenefitRating}/5.`,
        `Difficulty: ${opportunity.difficulty}.`
      ],
      {
        confidence: opportunity.confidence,
        evidenceIds: opportunity.evidenceIds ?? getEvidenceIds(profile),
        relatedAdapterIds: opportunity.adapterIds,
        relatedSlotIds: opportunity.recommendedSlotIds,
        verification: "pending-review"
      }
    )
  );
  const repairNotes = [
    fact(
      profile,
      "repair-notes",
      "repair-notes",
      "Repair notes",
      "Treat used platform condition as an engineering input, not seller decoration.",
      [
        `Replacement availability: ${override.replacementAvailability}.`,
        `Repair difficulty: ${override.repairDifficulty}.`,
        "Record missing shrouds, caddies, cables, fans, and firmware state before project handoff."
      ],
      { relatedStrategyTypes: ["repair-existing-hardware", "hybrid-strategy"] }
    )
  ];
  const communityDiscoveries = profile.knowledgeCards
    .filter((card) => card.category === "community-discovery")
    .map((card) =>
      fact(
        profile,
        "community-discoveries",
        `community-${card.id}`,
        card.title,
        card.body,
        ["Community discoveries remain evidence-linked and reviewable."],
        {
          confidence: card.confidence,
          evidenceIds: card.evidenceIds ?? getEvidenceIds(profile),
          verification: "pending-review"
        }
      )
    );
  const expansionFacts = getKnowledgeExpansionFactsForPlatform(profile.id).map(
    expansionFactToEncyclopediaFact
  );
  const facts = [
    overview,
    chipset,
    cpuSupport,
    ...pcieTopology.slotGuidance,
    ...storageTopology.storageGuidance,
    ...powerSystem.powerGuidance,
    ...cooling.coolingGuidance,
    ...firmwareBios,
    ...reliability.commonFailures,
    ...hiddenCapabilities,
    ...repairNotes,
    ...communityDiscoveries,
    ...upgradeEncyclopedia.adapterPaths,
    upgradeEncyclopedia.eccCompatibility,
    upgradeEncyclopedia.maxRam,
    upgradeEncyclopedia.maxStorage,
    upgradeEncyclopedia.nvmeAdapterSupport,
    upgradeEncyclopedia.pcieBifurcation,
    ...upgradeEncyclopedia.gpuLimitations,
    ...expansionFacts
  ];

  return {
    chipset,
    communityDiscoveries,
    cooling,
    cpuSupport,
    diagrams: createDiagrams(profile, memoryTopology, powerSystem, cooling),
    facts,
    firmwareBios,
    hiddenCapabilities,
    id: `encyclopedia-${profile.id}`,
    knownLimitations: reliability.commonFailures.filter(
      (item) => item.sectionId === "known-limitations"
    ),
    lifecycle: {
      stage: override.lifecycleStage,
      summary: override.lifecycleSummary,
      usefulRoles: override.usefulRoles
    },
    memoryTopology,
    overview,
    pcieTopology,
    platformId: profile.id,
    powerSystem,
    provenance: {
      evidenceIds: getEvidenceIds(profile),
      knowledgeQualityScore: getBaseQuality(profile),
      verification: "verified"
    },
    reliability,
    repairNotes,
    revisions: [
      {
        biosNotes: [
          "Record BIOS version before upgrade planning.",
          "Treat CPU and boot storage paths as firmware-sensitive until verified."
        ],
        id: `${profile.id}:base-revision`,
        label: `${profile.modelYears} platform generation`,
        notes: [`Representative model-years range: ${profile.modelYears}.`]
      }
    ],
    storageTopology,
    title: `${profile.name} Encyclopedia`,
    upgradeEncyclopedia,
    workloadProfiles: createWorkloadProfiles(profile, override)
  };
}

export const platformEncyclopediaEntries: PlatformEncyclopediaEntry[] =
  platformKnowledgeProfiles.map(createEntry);
