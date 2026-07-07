import {
  playbookSectionIds,
  type HardwarePlaybook,
  type HardwarePlaybookRecommendation,
  type PlaybookSectionId
} from "@/types/playbook";

type SectionOverride = {
  items: string[];
  summary: string;
};

type PlaybookInput = Omit<HardwarePlaybook, "knowledgeQualityScore" | "sections"> & {
  sectionOverrides: Partial<Record<PlaybookSectionId, SectionOverride>>;
};

type RecommendationInput = Omit<
  HardwarePlaybookRecommendation,
  "knowledgeQualityScore"
>;

const sectionTitles: Record<PlaybookSectionId, string> = {
  "common-mistakes": "Common mistakes",
  "cooling-notes": "Cooling notes",
  "firmware-bios-notes": "Firmware and BIOS notes",
  "ideal-workloads": "Ideal workloads",
  "known-bottlenecks": "Known bottlenecks",
  "memory-guidance": "Memory guidance",
  overview: "Overview",
  "pcie-considerations": "PCIe considerations",
  "platform-lifespan": "Platform lifespan",
  "power-considerations": "Power considerations",
  "recommended-strategies": "Recommended strategies",
  "repair-guidance": "Repair guidance",
  "required-adapters": "Required adapters",
  "storage-guidance": "Storage guidance",
  "upgrade-paths": "Upgrade paths"
};

function recommendation(input: RecommendationInput): HardwarePlaybookRecommendation {
  return {
    ...input,
    knowledgeQualityScore: 0
  };
}

function createSections(
  platformName: string,
  overrides: Partial<Record<PlaybookSectionId, SectionOverride>>
) {
  return playbookSectionIds.map((id) => {
    const override = overrides[id];

    return {
      id,
      items:
        override?.items ??
        [
          `Review the exact ${platformName} unit before treating this guidance as final.`,
          "Use project validation for physical fit, power, cooling, and slot-level checks."
        ],
      summary:
        override?.summary ??
        "No special playbook rule is asserted yet beyond standard builder validation.",
      title: sectionTitles[id]
    };
  });
}

function playbook(input: PlaybookInput): HardwarePlaybook {
  return {
    ...input,
    knowledgeQualityScore: 0,
    sections: createSections(input.platformName, input.sectionOverrides)
  };
}

const workstationCommon = {
  "common-mistakes": {
    items: [
      "Buying only a SATA SSD and missing the cheaper PCIe NVMe adapter path.",
      "Assuming every workstation PSU has modern GPU connectors.",
      "Ignoring airflow shrouds, drive cages, and cable paths before picking a GPU."
    ],
    summary:
      "The expensive mistakes are usually not CPU mistakes; they are storage, power, airflow, and connector assumptions."
  },
  "required-adapters": {
    items: [
      "PCIe NVMe adapter for fast boot or project storage when native M.2 is absent.",
      "GPU power cable or vendor-specific PSU harness when the exact unit needs it.",
      "Optional 10GbE or USB-C expansion card only after the primary build is stable."
    ],
    summary:
      "Adapters are useful when they solve a specific slot or I/O problem without becoming the main risk."
  },
  "storage-guidance": {
    items: [
      "Use NVMe for OS, active project files, scratch, and model data.",
      "Keep SATA bays for bulk storage, backups, or cold project archives.",
      "Do not spend the GPU budget on exotic storage unless the workload is storage-bound."
    ],
    summary:
      "Workstation value often improves fastest when slow boot or project storage is fixed first."
  }
} satisfies Partial<Record<PlaybookSectionId, SectionOverride>>;

export const hardwarePlaybooks: HardwarePlaybook[] = [
  playbook({
    evidenceRecordIds: [
      "ev-p510-profile-spec",
      "ev-p510-nvme-playbook",
      "ev-adapter-pcie-nvme"
    ],
    idealWorkloads: ["engineering", "cad", "programming"],
    id: "thinkstation-p510-engineering",
    platformId: "thinkstation-p510",
    platformName: "Lenovo ThinkStation P510",
    recommendedStrategyTypes: ["buy-used-workstation", "hybrid-strategy"],
    recommendations: [
      recommendation({
        completedWhenSlotIds: ["storage", "ram", "gpu"],
        confidence: "High",
        difficulty: "Easy",
        estimatedCostText: "Approx. 650 AED with used RTX A4000-class GPU pricing excluded.",
        evidenceRecordIds: [
          "ev-p510-profile-spec",
          "ev-p510-nvme-playbook",
          "ev-adapter-pcie-nvme"
        ],
        id: "p510-budget-engineering-upgrade",
        slotHints: ["storage", "ram", "gpu", "pcie-adapter"],
        strategyTypes: ["buy-used-workstation", "hybrid-strategy"],
        summary:
          "Add PCIe NVMe storage, move to 64 GB ECC, and choose a workstation GPU only after power and clearance are verified.",
        title: "Best budget engineering upgrade",
        verification: "verified",
        warnings: ["Check BIOS generation before assuming every Xeon v4 upgrade is painless."]
      }),
      recommendation({
        completedWhenSlotIds: ["psu", "gpu", "fans"],
        confidence: "Medium",
        difficulty: "Moderate",
        estimatedCostText: "Variable; depends on GPU and power-cable availability.",
        evidenceRecordIds: ["ev-p510-profile-spec"],
        id: "p510-local-ai-path",
        slotHints: ["gpu", "psu", "fans"],
        strategyTypes: ["buy-used-workstation", "hybrid-strategy"],
        summary:
          "Use the chassis as an AI base only when the GPU power path, airflow, and memory target are validated first.",
        title: "Local AI playbook",
        verification: "pending-review",
        warnings: ["RTX 3090-class cards require strict PSU, cable, and cooling review."]
      })
    ],
    sectionOverrides: {
      ...workstationCommon,
      "firmware-bios-notes": {
        items: [
          "Confirm BIOS generation before CPU upgrades.",
          "Treat NVMe boot support as a unit-specific check.",
          "Keep firmware notes attached as project evidence."
        ],
        summary:
          "The P510 is useful, but firmware state can decide whether a clean upgrade becomes tedious."
      },
      "ideal-workloads": {
        items: ["CAD", "engineering coursework", "programming", "moderate local AI experiments"],
        summary:
          "Best as a budget engineering workstation, not as a quiet small gaming PC."
      },
      "known-bottlenecks": {
        items: [
          "Older Xeon single-thread speed can limit high-FPS gaming.",
          "GPU power cabling can be more limiting than PCIe bandwidth.",
          "SATA-only storage wastes platform potential."
        ],
        summary:
          "The platform wants storage and GPU planning more than blind CPU chasing."
      },
      overview: {
        items: [
          "Strong budget workstation base with ECC memory and useful PCIe expansion.",
          "Best upgraded step-by-step so each power, storage, and GPU decision remains reversible."
        ],
        summary:
          "A practical engineering sleeper when storage and GPU upgrades are planned carefully."
      },
      "pcie-considerations": {
        items: [
          "Reserve the primary x16 slot for GPU.",
          "Use secondary PCIe lanes for NVMe or networking.",
          "Plan lane allocation before adding both GPU and storage adapters."
        ],
        summary: "PCIe lanes are the hidden budget: spend them deliberately."
      },
      "platform-lifespan": {
        items: ["2-4 useful years for engineering and CAD when upgraded modestly."],
        summary: "Long enough for budget productivity, shorter for cutting-edge AI or gaming."
      },
      "power-considerations": {
        items: [
          "Verify PSU wattage and GPU connectors on the exact chassis.",
          "Prefer efficient GPUs before planning high-wattage cards.",
          "External adapters should not be used to hide unsafe power margins."
        ],
        summary: "Power validation should happen before buying the GPU."
      },
      "recommended-strategies": {
        items: [
          "Buy used workstation as a base.",
          "Hybrid strategy when owned SSD, RAM, or GPU can reduce spend.",
          "Walk away when seller cannot confirm PSU, BIOS, or chassis condition."
        ],
        summary: "The P510 is a base-system strategy, not a random parts basket."
      },
      "upgrade-paths": {
        items: [
          "PCIe NVMe adapter plus fast SSD.",
          "64 GB ECC as the first RAM target.",
          "RTX A-series or efficient RTX GPU after PSU review."
        ],
        summary: "Upgrade storage and RAM first, then GPU with power evidence."
      }
    },
    summary:
      "Use the P510 as a budget engineering sleeper: NVMe adapter, ECC memory, measured GPU path, and conservative power planning.",
    title: "P510 Engineering Workstation Playbook",
    useCase: "engineering",
    verification: "verified"
  }),
  playbook({
    evidenceRecordIds: [
      "ev-p510-profile-spec",
      "ev-p510-nvme-playbook",
      "ev-adapter-pcie-nvme"
    ],
    idealWorkloads: ["gaming", "general"],
    id: "thinkstation-p510-gaming-conversion",
    platformId: "thinkstation-p510",
    platformName: "Lenovo ThinkStation P510",
    recommendedStrategyTypes: ["hybrid-strategy", "buy-used-workstation"],
    recommendations: [
      recommendation({
        completedWhenSlotIds: ["gpu", "storage", "psu", "fans"],
        confidence: "Medium",
        difficulty: "Moderate",
        estimatedCostText: "Moderate; GPU, power cable, and fan condition decide value.",
        evidenceRecordIds: ["ev-p510-profile-spec", "ev-p510-nvme-playbook"],
        id: "p510-gaming-conversion",
        slotHints: ["gpu", "storage", "psu", "fans"],
        strategyTypes: ["hybrid-strategy", "buy-used-workstation"],
        summary:
          "Use a consumer GPU and fast NVMe only after checking airflow, PSU connectors, and whether the CPU target fits the game expectation.",
        title: "Gaming conversion",
        verification: "pending-review",
        warnings: [
          "Older Xeon single-thread performance can limit high-refresh gaming.",
          "Do not buy a GPU before PSU connectors and case airflow are verified."
        ]
      })
    ],
    sectionOverrides: {
      ...workstationCommon,
      "common-mistakes": {
        items: [
          "Treating the P510 as a normal gaming tower.",
          "Buying the GPU first and discovering power-cable or airflow limits later.",
          "Using SATA-only storage and leaving the easiest responsiveness upgrade unused."
        ],
        summary:
          "Gaming conversions fail when workstation physical constraints are ignored."
      },
      "cooling-notes": {
        items: [
          "Keep front-to-back airflow clear.",
          "Avoid hot blower cards unless noise is acceptable.",
          "Confirm fan behavior under sustained gaming load."
        ],
        summary: "Airflow and noise are the practical gaming constraints."
      },
      "ideal-workloads": {
        items: ["budget 1080p gaming", "general desktop", "student workstation plus gaming"],
        summary:
          "Best for mixed-use gaming when expectations are realistic and the platform price is low."
      },
      overview: {
        items: [
          "The P510 can become a gaming-capable sleeper, but it is not automatically a gaming PC.",
          "Use gaming conversion only when the acquisition price leaves room for GPU, storage, and power checks."
        ],
        summary: "A conditional sleeper path for users who accept workstation caveats."
      },
      "pcie-considerations": {
        items: [
          "Reserve primary x16 for the GPU.",
          "Use secondary PCIe for NVMe only if it does not block GPU airflow.",
          "Do not assume lane layout is the bottleneck before checking CPU and GPU balance."
        ],
        summary: "PCIe is usually acceptable; physical layout and airflow matter more."
      },
      "power-considerations": {
        items: [
          "Check PSU wattage and GPU connectors.",
          "Prefer efficient midrange GPUs over high-wattage cards.",
          "Avoid sketchy adapter chains."
        ],
        summary: "Power confidence determines whether the gaming path is sensible."
      },
      "recommended-strategies": {
        items: [
          "Hybrid strategy when the user already owns display, storage, RAM, or GPU.",
          "Buy used workstation only when the base is cheap enough.",
          "Wait when the seller prices the P510 like a completed gaming PC."
        ],
        summary: "Gaming conversion is a niche strategy, not the default P510 path."
      },
      "upgrade-paths": {
        items: [
          "Fast NVMe via PCIe adapter.",
          "Efficient consumer GPU after power review.",
          "Fan and airflow cleanup before chasing higher wattage."
        ],
        summary: "Make the platform responsive and cool before pushing GPU power."
      }
    },
    summary:
      "Convert a P510 for gaming only when price, airflow, power, and CPU expectations line up.",
    title: "P510 Gaming Conversion Playbook",
    useCase: "gaming",
    verification: "pending-review"
  }),
  playbook({
    evidenceRecordIds: ["ev-p520-profile-spec", "ev-p520-pcie-nvme-upgrade"],
    idealWorkloads: ["engineering", "ai", "cad"],
    id: "thinkstation-p520-ai-engineering",
    platformId: "thinkstation-p520",
    platformName: "Lenovo ThinkStation P520",
    recommendedStrategyTypes: ["buy-used-workstation", "hybrid-strategy"],
    recommendations: [
      recommendation({
        completedWhenSlotIds: ["gpu", "psu", "storage"],
        confidence: "High",
        difficulty: "Moderate",
        estimatedCostText: "Depends on GPU; storage adapter path is low-cost.",
        evidenceRecordIds: ["ev-p520-profile-spec", "ev-p520-rtx4070-upgrade"],
        id: "p520-efficient-rtx-path",
        slotHints: ["gpu", "psu", "storage", "pcie-adapter"],
        strategyTypes: ["buy-used-workstation", "hybrid-strategy"],
        summary:
          "Pair fast PCIe storage with an efficient RTX-class GPU after checking power cables and drive-cage clearance.",
        title: "Efficient RTX engineering path",
        verification: "pending-review",
        warnings: ["Drive cages and shrouds can decide real GPU fit."]
      }),
      recommendation({
        completedWhenSlotIds: ["ram", "storage"],
        confidence: "High",
        difficulty: "Easy",
        estimatedCostText: "Low to moderate depending on RAM capacity.",
        evidenceRecordIds: ["ev-p520-ram-256-official", "ev-p520-pcie-nvme-upgrade"],
        id: "p520-memory-storage-base",
        slotHints: ["ram", "storage", "pcie-adapter"],
        strategyTypes: ["upgrade-existing-machine", "buy-used-workstation"],
        summary:
          "Treat RAM and NVMe as the base upgrade before chasing a larger GPU.",
        title: "Memory and scratch-storage base",
        verification: "verified",
        warnings: ["Disputed larger RAM claims should not override the official demo maximum."]
      })
    ],
    sectionOverrides: {
      ...workstationCommon,
      "ideal-workloads": {
        items: ["CAD", "engineering", "local AI with planned GPU power", "rendering"],
        summary: "The P520 has the expansion profile JETS wants for serious workstation reuse."
      },
      "known-bottlenecks": {
        items: [
          "PCIe Gen3 is normally fine, but large dataset transfer can expose limits.",
          "Power cables and physical airflow are the first GPU risks."
        ],
        summary: "Bandwidth is less risky than power and airflow on most P520 paths."
      },
      overview: {
        items: [
          "High-potential workstation platform with strong expansion and ECC memory support.",
          "Excellent candidate for engineering and AI experiments when GPU power is validated."
        ],
        summary: "A stronger long-term workstation base than most budget office PCs."
      },
      "platform-lifespan": {
        items: ["3-5 useful years for engineering when paired with modern storage and GPU."],
        summary: "Still attractive as a serious used workstation platform."
      }
    },
    summary:
      "Use the P520 for serious engineering, CAD, and local AI paths where expansion headroom matters.",
    title: "P520 AI and Engineering Playbook",
    useCase: "ai",
    verification: "verified"
  }),
  playbook({
    evidenceRecordIds: ["ev-t5810-profile-spec", "ev-adapter-pcie-nvme"],
    idealWorkloads: ["engineering", "cad", "homelab"],
    id: "precision-t5810-budget-workstation",
    platformId: "precision-t5810",
    platformName: "Dell Precision T5810",
    recommendedStrategyTypes: ["buy-used-workstation", "hybrid-strategy"],
    recommendations: [
      recommendation({
        completedWhenSlotIds: ["storage", "ram"],
        confidence: "Medium",
        difficulty: "Easy",
        estimatedCostText: "Low-cost adapter plus RAM depending on starting config.",
        evidenceRecordIds: ["ev-t5810-profile-spec", "ev-adapter-pcie-nvme"],
        id: "t5810-storage-ram-first",
        slotHints: ["storage", "ram", "pcie-adapter"],
        strategyTypes: ["buy-used-workstation", "upgrade-existing-machine"],
        summary:
          "Start with NVMe and ECC RAM before considering louder GPU-heavy paths.",
        title: "Storage and RAM first",
        verification: "verified",
        warnings: ["Exact PSU and GPU cable kit can vary by unit."]
      })
    ],
    sectionOverrides: {
      ...workstationCommon,
      "ideal-workloads": {
        items: ["budget CAD", "programming", "render helper", "homelab node"],
        summary: "Best as a value workstation where expectations stay realistic."
      },
      overview: {
        items: [
          "Older Precision tower with useful workstation traits.",
          "Worth buying when price is low and the PSU/cable situation is clear."
        ],
        summary: "A budget workstation play, not the highest-ceiling platform."
      }
    },
    summary:
      "Use the T5810 when the acquisition price is low enough to justify older platform limits.",
    title: "Precision T5810 Budget Workstation Playbook",
    useCase: "budget",
    verification: "pending-review"
  }),
  playbook({
    evidenceRecordIds: ["ev-5820-profile-spec", "ev-adapter-pcie-nvme"],
    idealWorkloads: ["engineering", "cad", "ai"],
    id: "precision-5820-engineering",
    platformId: "precision-5820",
    platformName: "Dell Precision 5820",
    recommendedStrategyTypes: ["buy-used-workstation", "hybrid-strategy"],
    recommendations: [
      recommendation({
        completedWhenSlotIds: ["gpu", "psu", "storage"],
        confidence: "High",
        difficulty: "Moderate",
        estimatedCostText: "Moderate; depends on GPU and PSU configuration.",
        evidenceRecordIds: ["ev-5820-profile-spec", "ev-adapter-pcie-nvme"],
        id: "5820-balanced-engineering",
        slotHints: ["gpu", "psu", "storage", "ram"],
        strategyTypes: ["buy-used-workstation", "hybrid-strategy"],
        summary:
          "Use a balanced GPU, NVMe storage, and ECC RAM target instead of overbuilding one part.",
        title: "Balanced engineering workstation",
        verification: "verified",
        warnings: ["GPU power cable availability still needs exact-unit review."]
      })
    ],
    sectionOverrides: {
      ...workstationCommon,
      "ideal-workloads": {
        items: ["CAD", "engineering", "AI experiments", "rendering"],
        summary: "Strong long-life workstation candidate when priced below a clean scratch build."
      },
      overview: {
        items: [
          "Newer workstation base with better long-term headroom than the T5810/P510 class.",
          "Strong candidate for engineering when GPU, RAM, and NVMe are balanced."
        ],
        summary: "A high-quality used workstation path with fewer age penalties."
      }
    },
    summary:
      "Use the Precision 5820 as a durable engineering base when the price leaves room for GPU and storage.",
    title: "Precision 5820 Engineering Playbook",
    useCase: "engineering",
    verification: "verified"
  }),
  playbook({
    evidenceRecordIds: [
      "ev-7060-low-profile-service",
      "ev-7060-proprietary-psu",
      "ev-7060-nvme-upgrade"
    ],
    idealWorkloads: ["general", "programming", "homelab"],
    id: "optiplex-7060-office-homelab",
    platformId: "optiplex-7060",
    platformName: "Dell OptiPlex 7060 SFF",
    recommendedStrategyTypes: ["mini-pc", "upgrade-existing-machine"],
    recommendations: [
      recommendation({
        completedWhenSlotIds: ["storage", "ram"],
        confidence: "High",
        difficulty: "Easy",
        estimatedCostText: "Low; NVMe and RAM upgrades are the sensible spend.",
        evidenceRecordIds: ["ev-7060-nvme-upgrade", "ev-7060-low-profile-service"],
        id: "7060-office-upgrade",
        slotHints: ["storage", "ram"],
        strategyTypes: ["mini-pc", "upgrade-existing-machine"],
        summary:
          "Keep this as a quiet office, programming, or light homelab box with NVMe and reasonable RAM.",
        title: "Office and homelab upgrade",
        verification: "verified",
        warnings: ["Do not treat a low-profile SFF chassis as a normal gaming GPU base."]
      })
    ],
    sectionOverrides: {
      "common-mistakes": {
        items: [
          "Buying a full-height GPU for an SFF chassis.",
          "Assuming the proprietary PSU can support gaming-card power.",
          "Overinvesting in RAM for office workloads."
        ],
        summary: "The OptiPlex is useful when the user accepts its physical limits."
      },
      "ideal-workloads": {
        items: ["office", "programming", "home server", "light virtualization"],
        summary: "Best for efficient everyday work, not GPU-heavy builds."
      },
      "known-bottlenecks": {
        items: [
          "Low-profile expansion only.",
          "Proprietary low-wattage power path.",
          "Thermal headroom is limited under sustained add-in-card load."
        ],
        summary: "The chassis and PSU are the hard boundaries."
      },
      overview: {
        items: [
          "Efficient small-form-factor office platform.",
          "Strong value when upgraded lightly and not forced into gaming duty."
        ],
        summary: "A disciplined low-power project, not a sleeper GPU tower."
      },
      "recommended-strategies": {
        items: ["Mini PC style reuse", "Upgrade existing machine", "Wait if seller prices it like a gaming PC"],
        summary: "Keep the strategy modest and practical."
      },
      "upgrade-paths": {
        items: ["NVMe SSD", "RAM to a sensible target", "Low-profile NIC or Wi-Fi if needed"],
        summary: "Upgrade responsiveness and I/O, not gaming ambition."
      }
    },
    summary:
      "Use the OptiPlex 7060 SFF for efficient office, programming, and homelab paths with strict GPU expectations.",
    title: "OptiPlex 7060 Office and Homelab Playbook",
    useCase: "home-server",
    verification: "verified"
  }),
  playbook({
    evidenceRecordIds: ["ev-z440-profile-spec", "ev-z440-nvme-playbook"],
    idealWorkloads: ["engineering", "cad", "homelab"],
    id: "hp-z440-budget-engineering",
    platformId: "hp-z440",
    platformName: "HP Z440",
    recommendedStrategyTypes: ["buy-used-workstation", "hybrid-strategy"],
    recommendations: [
      recommendation({
        completedWhenSlotIds: ["storage", "ram", "gpu"],
        confidence: "Medium",
        difficulty: "Moderate",
        estimatedCostText: "Low to moderate; GPU power path is the main variable.",
        evidenceRecordIds: ["ev-z440-profile-spec", "ev-z440-nvme-playbook"],
        id: "z440-budget-cad",
        slotHints: ["storage", "ram", "gpu", "pcie-adapter"],
        strategyTypes: ["buy-used-workstation", "hybrid-strategy"],
        summary:
          "Use NVMe and ECC memory first, then pick an efficient GPU that respects power and airflow.",
        title: "Budget CAD workstation",
        verification: "pending-review",
        warnings: ["Check proprietary PSU cabling and airflow shroud before GPU purchase."]
      })
    ],
    sectionOverrides: {
      ...workstationCommon,
      overview: {
        items: [
          "Budget HP workstation with useful expansion if priced correctly.",
          "Best when a seller includes enough RAM or a clean chassis."
        ],
        summary: "A practical workstation reuse path with power-cable caveats."
      },
      "power-considerations": {
        items: [
          "Validate exact PSU wattage and connectors.",
          "Avoid high-watt GPUs without documented cable support."
        ],
        summary: "Power planning decides whether the Z440 remains cheap."
      }
    },
    summary:
      "Use the Z440 as a low-cost CAD and engineering platform only when PSU and airflow risks are visible.",
    title: "HP Z440 Budget Engineering Playbook",
    useCase: "engineering",
    verification: "pending-review"
  }),
  playbook({
    evidenceRecordIds: ["ev-z840-profile-spec", "ev-z840-sas-hba"],
    idealWorkloads: ["homelab", "ai", "engineering"],
    id: "hp-z840-home-server-ai",
    platformId: "hp-z840",
    platformName: "HP Z840",
    recommendedStrategyTypes: ["server-conversion", "hybrid-strategy"],
    recommendations: [
      recommendation({
        completedWhenSlotIds: ["storage", "nic", "fans"],
        confidence: "High",
        difficulty: "Advanced",
        estimatedCostText: "Moderate; depends on storage controller and drives.",
        evidenceRecordIds: ["ev-z840-sas-hba"],
        id: "z840-lab-storage",
        slotHints: ["storage", "additional-storage", "nic", "fans"],
        strategyTypes: ["server-conversion", "hybrid-strategy"],
        summary:
          "Use SAS HBA, networking, and airflow planning to turn the chassis into a storage or virtualization lab.",
        title: "Homelab storage and virtualization path",
        verification: "verified",
        warnings: ["Noise and power draw can make this a poor bedroom or dorm system."]
      })
    ],
    sectionOverrides: {
      "cooling-notes": {
        items: ["Keep airflow over storage controllers.", "Plan noise before committing to a living-space setup."],
        summary: "Cooling is practical, but acoustic burden is a real strategy tradeoff."
      },
      "ideal-workloads": {
        items: ["homelab", "virtualization", "storage", "render helper", "experimental AI"],
        summary: "Best where expansion matters more than low power."
      },
      overview: {
        items: [
          "Large dual-socket workstation platform with high expansion potential.",
          "Strong for lab and storage conversion when power/noise are acceptable."
        ],
        summary: "A capability platform that should not be mistaken for a quiet desktop."
      },
      "power-considerations": {
        items: ["Budget for high idle draw.", "Use efficient add-in cards where possible."],
        summary: "Power draw is part of the acquisition cost."
      }
    },
    summary:
      "Use the Z840 for lab, storage, and expansion-heavy paths where noise and power are acceptable.",
    title: "HP Z840 Homelab and AI Playbook",
    useCase: "home-server",
    verification: "verified"
  }),
  playbook({
    evidenceRecordIds: ["ev-macpro-profile-spec", "ev-macpro-nvme-firmware"],
    idealWorkloads: ["programming", "general", "homelab"],
    id: "mac-pro-5-1-repair",
    platformId: "mac-pro-5-1",
    platformName: "Mac Pro 5,1",
    recommendedStrategyTypes: ["repair-existing-hardware", "hybrid-strategy"],
    recommendations: [
      recommendation({
        completedWhenSlotIds: ["storage", "gpu"],
        confidence: "Medium",
        difficulty: "Advanced",
        estimatedCostText: "Variable; firmware and GPU choice dominate.",
        evidenceRecordIds: ["ev-macpro-profile-spec", "ev-macpro-nvme-firmware"],
        id: "macpro-firmware-aware-upgrade",
        slotHints: ["storage", "gpu", "pcie-adapter"],
        strategyTypes: ["repair-existing-hardware", "hybrid-strategy"],
        summary:
          "Treat NVMe and GPU upgrades as firmware-aware repair paths, not beginner plug-and-play upgrades.",
        title: "Firmware-aware modernization",
        verification: "pending-review",
        warnings: ["Firmware state can decide whether NVMe boot and GPU compatibility are practical."]
      })
    ],
    sectionOverrides: {
      "common-mistakes": {
        items: [
          "Ignoring firmware state before buying NVMe or GPU parts.",
          "Overpaying for nostalgia when a newer workstation is cheaper.",
          "Assuming every modern GPU path is simple."
        ],
        summary: "The Mac Pro can be rewarding, but sentiment can distort value."
      },
      "firmware-bios-notes": {
        items: ["Confirm firmware version.", "Document boot support before storage purchase."],
        summary: "Firmware is the central constraint."
      },
      "ideal-workloads": {
        items: ["repair learning", "light workstation use", "legacy macOS workflows", "collector projects"],
        summary: "Best when the user values the platform itself."
      },
      overview: {
        items: [
          "Classic tower platform with community upgrade culture.",
          "Useful as a repair or specialty path, not the default value choice."
        ],
        summary: "A repair-minded playbook with firmware as the gate."
      }
    },
    summary:
      "Use the Mac Pro 5,1 only when firmware, parts availability, and emotional value are explicit project inputs.",
    title: "Mac Pro 5,1 Repair and Modernization Playbook",
    useCase: "repair",
    verification: "pending-review"
  }),
  playbook({
    evidenceRecordIds: ["ev-generic-mini-pc-playbook"],
    idealWorkloads: ["general", "programming", "homelab"],
    id: "generic-mini-pc-general",
    platformId: "generic-mini-pc",
    platformName: "Generic Mini PC",
    recommendedStrategyTypes: ["mini-pc", "wait-for-better-value"],
    recommendations: [
      recommendation({
        completedWhenSlotIds: ["storage", "ram"],
        confidence: "Medium",
        difficulty: "Easy",
        estimatedCostText: "Low; prioritize RAM and SSD configuration at purchase.",
        evidenceRecordIds: ["ev-generic-mini-pc-playbook"],
        id: "mini-pc-right-size",
        slotHints: ["storage", "ram"],
        strategyTypes: ["mini-pc"],
        summary:
          "Buy the mini PC with enough RAM and storage from the start because GPU and PSU paths are usually closed.",
        title: "Right-size before purchase",
        verification: "pending-review",
        warnings: ["Avoid mini PCs for sustained GPU, CAD, or AI workloads unless requirements are tiny."]
      })
    ],
    sectionOverrides: {
      "common-mistakes": {
        items: ["Buying for gaming potential.", "Ignoring soldered RAM.", "Assuming laptop-like thermals are enough for sustained loads."],
        summary: "Mini PCs punish upgrade assumptions."
      },
      "ideal-workloads": {
        items: ["office", "programming", "light homelab", "media server"],
        summary: "Best when low power and small size are more important than expansion."
      },
      overview: {
        items: [
          "Compact efficient path for general work.",
          "Should be selected as a strategy, not forced into workstation roles."
        ],
        summary: "A low-power solution path with deliberately limited upgrade ambition."
      }
    },
    summary:
      "Use mini PCs when quiet, small, and efficient matters more than GPU, PSU, or platform expansion.",
    title: "Mini PC General Purpose Playbook",
    useCase: "general",
    verification: "pending-review"
  }),
  playbook({
    evidenceRecordIds: ["ev-generic-laptop-playbook"],
    idealWorkloads: ["programming", "general", "gaming"],
    id: "generic-laptop-egpu",
    platformId: "generic-laptop",
    platformName: "Generic Laptop",
    recommendedStrategyTypes: ["laptop-egpu", "repair-existing-hardware"],
    recommendations: [
      recommendation({
        completedWhenSlotIds: ["egpu-dock", "external-psu", "thunderbolt-adapter"],
        confidence: "Medium",
        difficulty: "Advanced",
        estimatedCostText: "Moderate; dock, PSU, and monitor path decide value.",
        evidenceRecordIds: ["ev-generic-laptop-playbook"],
        id: "laptop-egpu-path",
        slotHints: ["egpu-dock", "external-psu", "thunderbolt-adapter", "gpu"],
        strategyTypes: ["laptop-egpu", "hybrid-strategy"],
        summary:
          "Use eGPU only when the laptop has a validated external PCIe path, suitable power, and external display plan.",
        title: "Laptop plus eGPU path",
        verification: "pending-review",
        warnings: ["Bandwidth and dock compatibility can erase the apparent bargain."]
      }),
      recommendation({
        completedWhenSlotIds: ["laptop-ram-dimm-adapter"],
        confidence: "Low",
        difficulty: "Expert",
        estimatedCostText: "Low parts cost, high validation burden.",
        evidenceRecordIds: ["ev-generic-laptop-playbook"],
        id: "laptop-ram-adapter-salvage",
        slotHints: ["laptop-ram-dimm-adapter", "ram"],
        strategyTypes: ["repair-existing-hardware", "hybrid-strategy"],
        summary:
          "Reuse laptop RAM through an adapter only as an experimental salvage path with explicit risk tolerance.",
        title: "Laptop RAM adapter salvage",
        verification: "unverified",
        warnings: ["Treat as experimental until the exact adapter and platform are verified."]
      })
    ],
    sectionOverrides: {
      "common-mistakes": {
        items: [
          "Treating eGPU as desktop-equivalent performance.",
          "Forgetting external monitor, dock, PSU, and cable costs.",
          "Using adapter paths without a fallback plan."
        ],
        summary: "Laptop paths are system paths, not single-part upgrades."
      },
      "ideal-workloads": {
        items: ["portable programming", "student setup", "light gaming with eGPU caveats", "salvage experiments"],
        summary: "Best when portability or already-owned laptop hardware matters."
      },
      overview: {
        items: [
          "Laptop paths can be brilliant when owned hardware lowers the real cost.",
          "They need stricter confidence labels than tower workstations."
        ],
        summary: "A niche path for portability, salvage, and experimental adapters."
      }
    },
    summary:
      "Use laptops and eGPU paths only when portability or owned hardware justifies the compatibility burden.",
    title: "Laptop, eGPU, and Salvage Playbook",
    useCase: "repair",
    verification: "pending-review"
  })
];
