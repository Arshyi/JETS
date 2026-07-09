import { platformKnowledgeProfiles } from "@/data/platform-knowledge";
import type { PlatformKnowledgeId, PlatformKnowledgeProfile } from "@/types/platform-knowledge";
import type {
  ComponentKnowledgeEntry,
  KnowledgeExpansionFact,
  KnowledgeExpansionSectionId,
  KnowledgeRelationshipHint
} from "@/types/knowledge-expansion";

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

type PlatformTemplate = {
  details: (profile: PlatformKnowledgeProfile) => string[];
  platformSectionId: KnowledgeExpansionFact["platformSectionId"];
  sectionId: KnowledgeExpansionSectionId;
  summary: (profile: PlatformKnowledgeProfile) => string;
  title: string;
};

function qualityForProfile(profile: PlatformKnowledgeProfile) {
  return Math.max(
    58,
    Math.round(
      (profile.potential.communitySupport +
        profile.potential.engineeringFlexibility +
        profile.potential.expandability +
        profile.potential.hiddenValue) /
        4
    )
  );
}

function evidenceForProfile(profile: PlatformKnowledgeProfile) {
  return platformEvidenceIds[profile.id] ?? [];
}

const platformTemplates: PlatformTemplate[] = [
  {
    details: (profile) => [
      `CPU support note: ${profile.specifications.maxCpuGeneration}.`,
      `Platform years: ${profile.modelYears}.`,
      "Record BIOS version before CPU, GPU, storage, or memory recommendations are treated as resolved."
    ],
    platformSectionId: "firmware-bios",
    sectionId: "firmware",
    summary: (profile) =>
      `${profile.name} firmware state controls CPU support, boot behavior, storage assumptions, and acquisition risk.`,
    title: "Firmware baseline"
  },
  {
    details: (profile) => [
      `Modeled CPU socket: ${profile.specifications.cpuSocket}.`,
      "CPU stepping, microcode, and OEM BIOS revision can change upgrade confidence.",
      "Treat seller screenshots and service-tag reports as evidence, not decoration."
    ],
    platformSectionId: "firmware-bios",
    sectionId: "bios-revisions",
    summary: () =>
      "BIOS revision should be captured as a first-class fact before upgrade planning.",
    title: "BIOS revision sensitivity"
  },
  {
    details: (profile) => [
      profile.specifications.psuNotes,
      `Dual CPU support: ${profile.specifications.dualCpuSupport ? "yes" : "no"}.`,
      "Connector evidence matters as much as advertised wattage."
    ],
    platformSectionId: "power-system",
    sectionId: "power-topology",
    summary: (profile) =>
      `${profile.name} power planning must model PSU family, connector availability, GPU cable evidence, and thermal load.`,
    title: "Power topology depth"
  },
  {
    details: (profile) => [
      `Platform Potential thermal context: ${profile.potential.overall}.`,
      "Missing shrouds, fan errors, blocked drive cages, or dusty intakes can invalidate otherwise compatible upgrades.",
      "Thermal inspection should happen before optimization accepts high-draw components."
    ],
    platformSectionId: "cooling",
    sectionId: "thermals",
    summary: (profile) =>
      `${profile.name} thermal behavior depends on the original workstation airflow path remaining intact.`,
    title: "Thermal behavior"
  },
  {
    details: (profile) => [
      `RAM type: ${profile.specifications.ramType}.`,
      `Maximum modeled RAM: ${profile.specifications.maxRamGb} GB.`,
      `ECC support: ${profile.specifications.eccSupport}.`
    ],
    platformSectionId: "memory-topology",
    sectionId: "memory-training",
    summary: () =>
      "Memory population, ECC mode, rank mix, and channel balance are knowledge facts, not just capacity numbers.",
    title: "Memory training and population"
  },
  {
    details: (profile) => [
      `PCIe generation: Gen${profile.specifications.pcieGeneration}.`,
      `Modeled PCIe slots: ${profile.pcieSlots.length}.`,
      "Electrical lane width and physical slot length should be modeled separately."
    ],
    platformSectionId: "pcie-topology",
    sectionId: "pcie-bandwidth",
    summary: (profile) =>
      `${profile.name} PCIe bandwidth should be reasoned from generation, electrical lanes, slot priority, and workload.`,
    title: "PCIe bandwidth"
  },
  {
    details: (profile) => [
      `${profile.pcieSlots.filter((slot) => slot.priority === "storage").length} storage-oriented PCIe slot(s) are modeled.`,
      `${profile.pcieSlots.filter((slot) => slot.priority === "primary-gpu").length} primary GPU slot(s) are modeled.`,
      "Storage, HBA, NIC, and GPU cards can compete for airflow and lane priority."
    ],
    platformSectionId: "pcie-topology",
    sectionId: "lane-sharing",
    summary: () =>
      "Lane sharing and slot priority determine whether an upgrade path is elegant or merely possible.",
    title: "Lane sharing"
  },
  {
    details: (profile) => [
      `NVMe support is modeled as ${profile.specifications.nvmeSupport}.`,
      "Bootability is stricter than storage recognition.",
      "A storage adapter can be excellent for scratch space even when boot support remains uncertain."
    ],
    platformSectionId: "storage-topology",
    sectionId: "boot-behavior",
    summary: (profile) =>
      `${profile.name} boot behavior must distinguish native boot, adapter boot, and non-boot storage usefulness.`,
    title: "Boot behavior"
  },
  {
    details: () => [
      "Fan curve, bearing wear, missing ducts, and PSU load can dominate the user experience.",
      "Noise should be treated as a strategy constraint for dorm, office, and home workspaces.",
      "Low-cost platforms can become bad recommendations when acoustic placement is ignored."
    ],
    platformSectionId: "cooling",
    sectionId: "noise",
    summary: (profile) =>
      `${profile.name} acoustic behavior depends on workload, fan health, airflow path, and PSU load.`,
    title: "Noise behavior"
  },
  {
    details: (profile) => [
      ...profile.constraints.slice(0, 2).map((constraint) => constraint.title),
      "A known bug stays pending until it has evidence and a mitigation path.",
      "JETS should prefer explicit uncertainty over fake confidence."
    ],
    platformSectionId: "known-limitations",
    sectionId: "known-bugs",
    summary: (profile) =>
      `${profile.name} known limitations should be cataloged with mitigations and verification state.`,
    title: "Known bugs and quirks"
  },
  {
    details: () => [
      "Caddies, shrouds, rails, proprietary cables, and fan modules change acquisition value.",
      "Replacement availability should affect strategy before slot selection.",
      "Missing small parts can turn a cheap workstation into a slow repair project."
    ],
    platformSectionId: "repair-notes",
    sectionId: "replacement-parts",
    summary: (profile) =>
      `${profile.name} replacement parts should be tracked beside specs because they affect execution risk.`,
    title: "Replacement parts"
  },
  {
    details: () => [
      "Common repairs should link to evidence, playbooks, and action-plan tasks.",
      "Repair willingness is a strategy input, not a hidden assumption.",
      "A repair path should preserve the original acquisition evidence."
    ],
    platformSectionId: "repair-notes",
    sectionId: "known-repairs",
    summary: (profile) =>
      `${profile.name} repair knowledge determines whether a listing is a project, parts donor, or walk-away decision.`,
    title: "Known repairs"
  },
  {
    details: (profile) => [
      `${profile.knowledgeCards.length} curated platform knowledge card(s) are modeled.`,
      `${profile.upgradeOpportunities.length} upgrade opportunity path(s) are modeled.`,
      "Community discoveries must remain evidence-linked until promoted by review."
    ],
    platformSectionId: "community-discoveries",
    sectionId: "community-discoveries",
    summary: (profile) =>
      `${profile.name} community discoveries can reveal upgrade paths that spec sheets miss.`,
    title: "Community discovery depth"
  },
  {
    details: (profile) => [
      `PSU note: ${profile.specifications.psuNotes}.`,
      `SATA ports: ${profile.specifications.sataPorts}.`,
      "Electrical limitations should block recommendations before aesthetics, convenience, or price wins."
    ],
    platformSectionId: "known-limitations",
    sectionId: "electrical-limitations",
    summary: (profile) =>
      `${profile.name} electrical limits include PSU rails, connectors, slot power, and platform-specific cable risk.`,
    title: "Electrical limitations"
  }
];

export const platformKnowledgeExpansionFacts: KnowledgeExpansionFact[] =
  platformKnowledgeProfiles.flatMap((profile) =>
    platformTemplates.map((template) => ({
      confidence: "high",
      details: template.details(profile),
      evidenceIds: evidenceForProfile(profile),
      id: `${profile.id}:knowledge-expansion:${template.sectionId}`,
      knowledgeQualityScore: qualityForProfile(profile),
      platformSectionId: template.platformSectionId,
      sectionId: template.sectionId,
      subjectId: profile.id,
      subjectType: "platform",
      summary: template.summary(profile),
      title: template.title,
      verification:
        template.sectionId === "known-bugs" ||
        template.sectionId === "community-discoveries"
          ? "pending-review"
          : "verified"
    }))
  );

function componentFact(
  category: ComponentKnowledgeEntry["category"],
  sectionId: KnowledgeExpansionSectionId,
  title: string,
  summary: string,
  details: string[]
): KnowledgeExpansionFact {
  return {
    confidence: "medium",
    details,
    evidenceIds: [],
    id: `component-knowledge:${category}:${sectionId}`,
    knowledgeQualityScore: 64,
    sectionId,
    subjectId: category,
    subjectType: "component",
    summary,
    title,
    verification: "pending-review"
  };
}

export const componentKnowledgeEntries: ComponentKnowledgeEntry[] = [
  {
    category: "cpu",
    facts: [
      componentFact("cpu", "bios-revisions", "CPU stepping", "CPU compatibility is gated by socket, BIOS, stepping, power, and cooling.", [
        "Do not treat socket match as complete compatibility.",
        "BIOS and thermal evidence should be captured before recommending workstation CPU swaps."
      ]),
      componentFact("cpu", "thermals", "CPU thermal envelope", "TDP class affects cooler choice, fan behavior, and sustained workstation loads.", [
        "Engineering and rendering workloads expose weak cooling faster than office use."
      ])
    ],
    id: "component-knowledge:cpu",
    summary: "CPU knowledge covers stepping, BIOS, power, and sustained load behavior.",
    title: "CPU Knowledge"
  },
  {
    category: "gpu",
    facts: [
      componentFact("gpu", "power-topology", "GPU power connectors", "GPU recommendations require board power, connector, PSU rail, and cable evidence.", [
        "Wattage alone is not enough.",
        "OEM workstations often need exact cable kit validation."
      ]),
      componentFact("gpu", "thermals", "GPU fit and airflow", "GPU length, slot width, height, and cooler style determine whether a card is actually useful.", [
        "Triple-fan cards can be value traps in compact or ducted chassis."
      ])
    ],
    id: "component-knowledge:gpu",
    summary: "GPU knowledge combines power, physical fit, cooling, VRAM, and workload fit.",
    title: "GPU Knowledge"
  },
  {
    category: "ram",
    facts: [
      componentFact("ram", "memory-training", "Memory population", "RAM capacity matters less than type, rank, channel balance, ECC mode, and slot availability.", [
        "Used ECC memory can be excellent when the platform actually supports it.",
        "Laptop SODIMM reuse needs an explicit adapter path."
      ])
    ],
    id: "component-knowledge:ram",
    summary: "RAM knowledge covers capacity, channels, ECC, rank mix, and adapter-assisted reuse.",
    title: "RAM Knowledge"
  },
  {
    category: "psu",
    facts: [
      componentFact("psu", "power-topology", "PSU real compatibility", "PSU compatibility includes form factor, rails, connectors, cable pinout, efficiency, and age.", [
        "OEM PSU families can block otherwise good GPU upgrades.",
        "Cable availability is an acquisition fact."
      ])
    ],
    id: "component-knowledge:psu",
    summary: "PSU knowledge models connectors, headroom, age, proprietary formats, and noise.",
    title: "PSU Knowledge"
  },
  {
    category: "storage",
    facts: [
      componentFact("storage", "boot-behavior", "Storage role separation", "Boot, active project, scratch, cache, and archive storage should be reasoned separately.", [
        "A PCIe NVMe adapter can be excellent even when boot support is uncertain.",
        "SATA SSDs can remain sensible for bulk or low-cost roles."
      ])
    ],
    id: "component-knowledge:storage",
    summary: "Storage knowledge distinguishes bootability, interface, endurance, and workload role.",
    title: "Storage Knowledge"
  },
  {
    category: "platform-adapter",
    facts: [
      componentFact("platform-adapter", "pcie-bandwidth", "Adapter path validation", "Adapters turn hidden platform potential into usable projects only after physical, power, firmware, and lane checks.", [
        "NVMe, NIC, HBA, and eGPU paths must cite platform topology."
      ])
    ],
    id: "component-knowledge:platform-adapter",
    relatedAdapterIds: ["pcie-nvme-adapter", "ten-gbe-nic", "sas-hba"],
    summary: "Adapter knowledge links unusual hardware paths to explicit platform constraints.",
    title: "PCIe Adapter Knowledge"
  },
  {
    category: "nic",
    facts: [
      componentFact("nic", "pcie-bandwidth", "NIC lane and cooling requirements", "NIC upgrades need PCIe lane availability, driver support, airflow, and intended network topology.", [
        "10GbE can make old workstations valuable as lab or NAS nodes.",
        "NIC heat can matter in crowded workstation expansion bays."
      ])
    ],
    id: "component-knowledge:nic",
    relatedAdapterIds: ["ten-gbe-nic"],
    summary: "NIC knowledge covers lanes, drivers, thermals, and homelab value.",
    title: "NIC Knowledge"
  },
  {
    category: "hba",
    facts: [
      componentFact("hba", "lane-sharing", "HBA expansion tradeoffs", "HBA cards can turn workstations into storage platforms but compete with GPU and NVMe expansion.", [
        "SAS HBA value depends on drive bays, cooling, and PCIe slot planning.",
        "Server conversion strategies should check noise and power first."
      ])
    ],
    id: "component-knowledge:hba",
    relatedAdapterIds: ["sas-hba"],
    summary: "HBA knowledge covers storage conversion, lane priority, heat, and repairability.",
    title: "HBA Knowledge"
  },
  {
    category: "cooling",
    facts: [
      componentFact("cooling", "thermals", "Cooling as validation", "Cooling is a validation layer, not only a component choice.", [
        "Fans, shrouds, ducts, paste, mounting pressure, and dust condition affect reliability.",
        "Stress testing should close the loop before a build is considered mature."
      ])
    ],
    id: "component-knowledge:cooling",
    summary: "Cooling knowledge connects physical airflow to reliability and action-plan tasks.",
    title: "Cooling Knowledge"
  }
];

export const knowledgeExpansionRelationshipHints: KnowledgeRelationshipHint[] = [
  {
    confidence: 84,
    fromId: "platform:thinkstation-p520",
    reason: "ThinkStation P520 has enough workstation expansion potential that efficient RTX-class GPUs are a stronger fit than very old workstation cards.",
    toId: "component:gpu-rtx-3060ti-component",
    type: "works_better_with"
  },
  {
    confidence: 82,
    fromId: "component:gpu-rx-6700xt-component",
    reason: "Higher-board-power GPUs usually require a known-good ATX-class PSU path and careful chassis airflow.",
    toId: "component:psu-650w-gold",
    type: "usually_requires"
  },
  {
    confidence: 86,
    fromId: "component:storage-1tb-nvme",
    reason: "NVMe storage is commonly upgraded with PCIe adapter paths on workstation platforms without native NVMe boot/storage support.",
    toId: "adapter:pcie-nvme-adapter",
    type: "commonly_upgraded_with"
  },
  {
    confidence: 76,
    fromId: "platform:hp-z840",
    reason: "Large dual-socket workstations and SAS HBA storage paths share fan, PSU, and drive-bay failure concerns.",
    toId: "adapter:sas-hba",
    type: "shares_failure_mode"
  },
  {
    confidence: 74,
    fromId: "platform:precision-t5810",
    reason: "Older single-socket workstation towers share repair paths around PSU cables, drive caddies, shrouds, and fan condition.",
    toId: "platform:thinkstation-p510",
    type: "shares_repair_path"
  },
  {
    confidence: 79,
    fromId: "component:gpu-rx-6700xt-component",
    reason: "Long triple-fan GPUs can conflict thermally with compact or ducted workstation chassis.",
    toId: "platform:optiplex-7060",
    type: "thermal_conflict"
  },
  {
    confidence: 88,
    fromId: "component:psu-300w-oem-sff",
    reason: "Low-wattage proprietary SFF power supplies conflict with normal full-height GPU upgrade paths.",
    toId: "component-category:gpu",
    type: "power_conflict"
  }
];

export function getKnowledgeExpansionFactsForPlatform(
  platformId: PlatformKnowledgeId
) {
  return platformKnowledgeExpansionFacts.filter(
    (fact) => fact.subjectId === platformId
  );
}
