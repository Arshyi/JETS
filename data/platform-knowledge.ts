import type {
  AdapterIntelligenceProfile,
  PlatformKnowledgeLink,
  PlatformKnowledgeProfile
} from "@/types/platform-knowledge";

export const adapterIntelligenceProfiles: AdapterIntelligenceProfile[] = [
  {
    compatibilityConfidence: "high",
    costUsd: 12,
    difficulty: "easy",
    expectedPerformance:
      "Near-native NVMe feel for boot and project storage when installed in an open PCIe Gen3 x4 or better slot.",
    id: "pcie-nvme-adapter",
    notes: [
      "Passive adapters are usually enough when the platform BIOS can boot from PCIe storage.",
      "Older platforms may need bootloader workarounds even when the drive is visible to the OS."
    ],
    recommendedPlatformIds: [
      "thinkstation-p520",
      "thinkstation-p510",
      "precision-t5810",
      "precision-5820",
      "hp-z440",
      "hp-z840",
      "mac-pro-5-1"
    ],
    title: "PCIe NVMe adapter",
    type: "storage"
  },
  {
    compatibilityConfidence: "high",
    costUsd: 28,
    difficulty: "easy",
    expectedPerformance:
      "Modern Wi-Fi and Bluetooth without replacing the base platform.",
    id: "pcie-wifi-card",
    notes: [
      "Best for towers with open x1 or x4 slots.",
      "Antenna placement matters more than raw card model for reliability."
    ],
    recommendedPlatformIds: [
      "thinkstation-p520",
      "thinkstation-p510",
      "precision-t5810",
      "precision-5820",
      "hp-z440",
      "optiplex-7060"
    ],
    title: "PCIe Wi-Fi card",
    type: "networking"
  },
  {
    compatibilityConfidence: "medium",
    costUsd: 35,
    difficulty: "moderate",
    expectedPerformance:
      "Adds front or rear USB-C capability, but bandwidth depends on PCIe slot and controller quality.",
    id: "usb-c-expansion-card",
    notes: [
      "Some cards need SATA or PCIe auxiliary power for full power delivery.",
      "This solves ports, not Thunderbolt capability."
    ],
    recommendedPlatformIds: [
      "thinkstation-p520",
      "precision-5820",
      "hp-z440",
      "hp-z840",
      "mac-pro-5-1"
    ],
    title: "USB-C expansion card",
    type: "usb"
  },
  {
    compatibilityConfidence: "high",
    costUsd: 45,
    difficulty: "moderate",
    expectedPerformance:
      "Excellent homelab and NAS uplift when the platform has airflow over the controller.",
    id: "ten-gbe-nic",
    notes: [
      "Server NICs can run hot in quiet workstations.",
      "Driver support should be checked before buying older cards."
    ],
    recommendedPlatformIds: [
      "thinkstation-p520",
      "precision-t5810",
      "precision-5820",
      "hp-z440",
      "hp-z840",
      "mac-pro-5-1"
    ],
    title: "10Gb Ethernet card",
    type: "networking"
  },
  {
    compatibilityConfidence: "high",
    costUsd: 22,
    difficulty: "easy",
    expectedPerformance:
      "Useful for adding stable USB 3 ports to older towers or separating devices from flaky front-panel ports.",
    id: "pcie-usb-controller",
    notes: [
      "Controller chipset quality matters for audio interfaces and capture devices.",
      "Prefer cards with clear driver support."
    ],
    recommendedPlatformIds: [
      "precision-t5810",
      "hp-z440",
      "hp-z840",
      "mac-pro-5-1"
    ],
    title: "PCIe USB controller",
    type: "usb"
  },
  {
    compatibilityConfidence: "medium",
    costUsd: 18,
    difficulty: "moderate",
    expectedPerformance:
      "Can repurpose M.2 slots for specialty PCIe devices, usually with physical mounting tradeoffs.",
    id: "m2-to-pcie-adapter",
    notes: [
      "Signal stability and mounting are the real risks.",
      "Best treated as an experimental path until tested."
    ],
    recommendedPlatformIds: ["optiplex-7060", "precision-5820"],
    title: "M.2 to PCIe adapter",
    type: "gpu-path"
  },
  {
    compatibilityConfidence: "low",
    costUsd: 16,
    difficulty: "experimental",
    expectedPerformance:
      "Niche adapter path for laptops, tiny systems, and salvage experiments.",
    id: "mini-pcie-adapter",
    notes: [
      "Useful for proof-of-concept projects, not polished beginner builds.",
      "Requires careful power and enclosure planning."
    ],
    recommendedPlatformIds: ["optiplex-7060"],
    title: "Mini PCIe adapter",
    type: "gpu-path"
  },
  {
    compatibilityConfidence: "high",
    costUsd: 38,
    difficulty: "moderate",
    expectedPerformance:
      "Adds reliable multi-drive expansion for NAS, render cache, and workstation storage pools.",
    id: "sas-hba",
    notes: [
      "Firmware mode matters: IT mode is preferred for ZFS and direct disk access.",
      "Controller cooling should be planned in quiet cases."
    ],
    recommendedPlatformIds: [
      "thinkstation-p520",
      "precision-t5810",
      "precision-5820",
      "hp-z440",
      "hp-z840"
    ],
    title: "SAS HBA",
    type: "controller"
  }
];

export const platformKnowledgeLinks: PlatformKnowledgeLink[] = [
  {
    componentId: "base-thinkstation-p520",
    confidence: "high",
    platformId: "thinkstation-p520",
    reason: "Typed base-system component represents a ThinkStation P520 chassis."
  },
  {
    confidence: "high",
    platformId: "thinkstation-p520",
    reason: "Legacy mock listing is the P520 sleeper base.",
    sourceListingId: "thinkstation-p520-sleeper"
  },
  {
    componentId: "base-optiplex-7060-sff",
    confidence: "high",
    platformId: "optiplex-7060",
    reason: "Typed base-system component represents the OptiPlex 7060 SFF platform."
  },
  {
    componentId: "mb-dell-q370-sff",
    confidence: "medium",
    platformId: "optiplex-7060",
    reason: "Q370 SFF motherboard usually belongs to the OptiPlex 7060-class platform."
  },
  {
    confidence: "high",
    platformId: "optiplex-7060",
    reason: "Legacy mock listing is the OptiPlex 7060 SFF office PC.",
    sourceListingId: "optiplex-7060-sff"
  },
  {
    confidence: "high",
    platformId: "hp-z440",
    reason: "Legacy mock listing is an HP Z440 render node.",
    sourceListingId: "hp-z440-render-node"
  }
];

export const platformKnowledgeProfiles: PlatformKnowledgeProfile[] = [
  {
    aliases: ["thinkstation p520", "p520", "lenovo p520"],
    constraints: [
      {
        confidence: "high",
        description:
          "The stock power supply and front-panel wiring should be verified before planning high-power GPUs.",
        id: "p520-psu-cables",
        mitigation: "Prefer cards with modest power draw or validate adapter cables before purchase.",
        severity: "warning",
        title: "Power cabling needs validation"
      },
      {
        confidence: "high",
        description:
          "Long GPUs usually fit, but drive cages and airflow shrouds can become the real physical constraint.",
        id: "p520-gpu-length",
        mitigation: "Measure the exact chassis and preserve front-to-back airflow.",
        severity: "info",
        title: "GPU length depends on internal layout"
      }
    ],
    family: "ThinkStation P-series",
    id: "thinkstation-p520",
    knowledgeCards: [
      {
        body:
          "The P520 is a strong sleeper base because its workstation chassis can accept meaningful GPU, memory, and storage upgrades without looking like a gaming tower.",
        category: "hidden-opportunity",
        confidence: "high",
        id: "p520-sleeper",
        title: "Enterprise sleeper value"
      },
      {
        body:
          "Community builders often use inexpensive PCIe NVMe adapters to add fast scratch storage while keeping SATA bays for bulk drives.",
        category: "community-discovery",
        confidence: "high",
        id: "p520-nvme-tip",
        title: "PCIe NVMe adapter path"
      },
      {
        body:
          "Noise is usually acceptable at workstation loads, but blower GPUs and blocked intake paths can make the platform feel much older than it is.",
        category: "noise",
        confidence: "medium",
        id: "p520-noise",
        title: "Airflow matters more than case size"
      }
    ],
    manufacturer: "Lenovo",
    modelYears: "2017-2021",
    name: "Lenovo ThinkStation P520",
    pcieBottlenecks: [
      {
        impact: "low",
        reason:
          "A modern GPU in the primary slot has enough Gen3 bandwidth for most gaming and CAD viewport work.",
        workload: "gaming"
      },
      {
        impact: "very-low",
        reason:
          "CUDA workloads usually care more about GPU memory and compute than PCIe bandwidth once data is resident.",
        workload: "cuda"
      },
      {
        impact: "moderate",
        reason:
          "Large model or dataset transfers can notice Gen3 limits when storage and GPU traffic share lanes.",
        workload: "large-dataset-transfer"
      }
    ],
    pcieSlots: [
      {
        electricalLanes: 16,
        generation: 3,
        id: "p520-slot-1",
        notes: "Best slot for the primary GPU.",
        physicalSize: "x16",
        priority: "primary-gpu"
      },
      {
        electricalLanes: 8,
        generation: 3,
        id: "p520-slot-2",
        notes: "Good for networking, storage, or a lower-priority accelerator.",
        physicalSize: "x16",
        priority: "storage"
      }
    ],
    potential: {
      communitySupport: 88,
      engineeringFlexibility: 96,
      expandability: 94,
      hiddenValue: 95,
      longevity: 92,
      overall: 96,
      upgradeCeiling: 96
    },
    specifications: {
      cpuSocket: "LGA2066",
      dualCpuSupport: false,
      eccSupport: "rdimm",
      gpuClearanceMm: 280,
      maxCpuGeneration: "Xeon W 2100/2200 class",
      maxRamGb: 256,
      nvmeSupport: "adapter",
      pcieGeneration: 3,
      psuNotes: "Workstation PSU, verify GPU connectors per exact unit.",
      ramType: "DDR4 ECC RDIMM",
      sataPorts: 6
    },
    summary:
      "A high-potential workstation base for engineering, CAD, AI experiments, and sleeper builds when power cabling and airflow are checked.",
    timeline: [
      {
        description: "Confirm PSU, fans, BIOS, and front-panel condition before buying upgrades.",
        id: "p520-stock",
        title: "Stock system audit"
      },
      {
        description: "Add fast scratch or boot storage with a PCIe NVMe adapter.",
        id: "p520-nvme",
        title: "NVMe adapter"
      },
      {
        description: "Move to 64 GB or more ECC memory for CAD, VMs, and local AI prep.",
        id: "p520-memory",
        title: "ECC memory upgrade"
      },
      {
        description: "Install a power-appropriate RTX card after checking length and connectors.",
        id: "p520-gpu",
        title: "GPU upgrade"
      },
      {
        description: "Add 10Gb networking or SAS storage when the build becomes a workstation/server hybrid.",
        id: "p520-network",
        title: "10Gb or SAS expansion"
      }
    ],
    upgradeOpportunities: [
      {
        adapterIds: ["pcie-nvme-adapter"],
        confidence: "high",
        difficulty: "easy",
        estimatedCostUsd: 12,
        expectedBenefitRating: 5,
        id: "p520-pcie-nvme",
        improvements: { engineering: "+18%", storage: "+70%" },
        recommendedSlotIds: ["pcie-adapter", "storage"],
        summary:
          "Use an inexpensive passive PCIe adapter to add high-speed NVMe storage for CAD scratch, build caches, or datasets.",
        title: "Add PCIe NVMe storage",
        type: "hidden-opportunity"
      },
      {
        confidence: "medium",
        difficulty: "moderate",
        estimatedCostUsd: 380,
        expectedBenefitRating: 5,
        id: "p520-rtx4070",
        improvements: { cuda: "+53%", gaming: "+41%", localLlm: "+34%" },
        prerequisites: ["Validate GPU power cable availability", "Measure drive cage clearance"],
        recommendedSlotIds: ["gpu", "psu"],
        summary:
          "A newer efficient RTX card can turn the base into a strong CAD, CUDA, and local AI machine without extreme PSU demands.",
        title: "Move from RTX 3060 class to RTX 4070 class",
        type: "high-impact-upgrade"
      }
    ]
  },
  {
    aliases: ["thinkstation p510", "p510", "lenovo p510"],
    constraints: [
      {
        confidence: "medium",
        description:
          "BIOS and CPU stepping can affect upgrade choices more than the socket alone suggests.",
        id: "p510-bios",
        mitigation: "Check the installed BIOS and CPU support list before buying a replacement Xeon.",
        severity: "warning",
        title: "BIOS generation risk"
      }
    ],
    family: "ThinkStation P-series",
    id: "thinkstation-p510",
    knowledgeCards: [
      {
        body:
          "The P510 can be a quiet engineering workstation when paired with ECC memory and a moderate-power GPU.",
        category: "engineering",
        confidence: "high",
        id: "p510-engineering",
        title: "Low-drama engineering base"
      },
      {
        body:
          "PCIe storage expansion is often a better first upgrade than chasing the highest CPU option.",
        category: "nvme",
        confidence: "medium",
        id: "p510-storage-first",
        title: "Storage-first upgrade path"
      }
    ],
    manufacturer: "Lenovo",
    modelYears: "2016-2018",
    name: "Lenovo ThinkStation P510",
    pcieBottlenecks: [
      {
        impact: "low",
        reason: "PCIe Gen3 is enough for midrange GPUs and workstation viewport tasks.",
        workload: "gaming"
      }
    ],
    pcieSlots: [
      {
        electricalLanes: 16,
        generation: 3,
        id: "p510-slot-1",
        notes: "Primary GPU slot.",
        physicalSize: "x16",
        priority: "primary-gpu"
      },
      {
        electricalLanes: 4,
        generation: 3,
        id: "p510-slot-2",
        notes: "Good candidate for NVMe or networking.",
        physicalSize: "x16",
        priority: "storage"
      }
    ],
    potential: {
      communitySupport: 80,
      engineeringFlexibility: 90,
      expandability: 88,
      hiddenValue: 86,
      longevity: 82,
      overall: 88,
      upgradeCeiling: 86
    },
    specifications: {
      cpuSocket: "LGA2011-3",
      dualCpuSupport: false,
      eccSupport: "rdimm",
      gpuClearanceMm: 280,
      maxCpuGeneration: "Xeon E5 v4 class",
      maxRamGb: 256,
      nvmeSupport: "adapter",
      pcieGeneration: 3,
      psuNotes: "Workstation PSU, verify exact GPU connectors.",
      ramType: "DDR4 ECC RDIMM",
      sataPorts: 6
    },
    summary:
      "Older but still useful workstation base for CAD, programming, and homelab workloads when priced low.",
    timeline: [
      {
        description: "Verify BIOS, fan behavior, and installed CPU generation.",
        id: "p510-audit",
        title: "Stock audit"
      },
      {
        description: "Add NVMe storage through PCIe before spending on niche CPUs.",
        id: "p510-storage",
        title: "NVMe adapter"
      },
      {
        description: "Increase ECC memory for engineering and virtual machines.",
        id: "p510-ram",
        title: "Memory expansion"
      },
      {
        description: "Install a moderate-power GPU that matches PSU connectors.",
        id: "p510-gpu",
        title: "GPU upgrade"
      }
    ],
    upgradeOpportunities: [
      {
        adapterIds: ["pcie-nvme-adapter"],
        confidence: "medium",
        difficulty: "easy",
        estimatedCostUsd: 12,
        expectedBenefitRating: 5,
        id: "p510-nvme",
        improvements: { storage: "+65%" },
        recommendedSlotIds: ["storage", "pcie-adapter"],
        summary:
          "A cheap NVMe adapter usually changes the feel of the platform more than a small CPU bump.",
        title: "Add NVMe via PCIe",
        type: "hidden-opportunity"
      }
    ]
  },
  {
    aliases: ["precision t5810", "dell t5810", "t5810"],
    constraints: [
      {
        confidence: "high",
        description:
          "Dell workstation PSUs and GPU power cables vary by configuration.",
        id: "t5810-psu",
        mitigation: "Validate wattage, 8-pin availability, and cable part numbers.",
        severity: "warning",
        title: "Configuration-specific PSU"
      }
    ],
    family: "Dell Precision",
    id: "precision-t5810",
    knowledgeCards: [
      {
        body:
          "The T5810 is often undervalued because listings describe it as old office equipment, but the chassis can still make a useful engineering workstation.",
        category: "hidden-opportunity",
        confidence: "high",
        id: "t5810-hidden-value",
        title: "Undervalued workstation base"
      },
      {
        body:
          "Many builders use these as quiet render nodes or lab machines after adding SSD storage and more ECC memory.",
        category: "community-discovery",
        confidence: "medium",
        id: "t5810-render-node",
        title: "Budget render node path"
      }
    ],
    manufacturer: "Dell",
    modelYears: "2014-2017",
    name: "Dell Precision T5810",
    pcieBottlenecks: [
      {
        impact: "low",
        reason: "Gen3 x16 is enough for midrange GPUs.",
        workload: "gaming"
      },
      {
        impact: "moderate",
        reason: "Multiple PCIe storage and networking cards can compete for older platform bandwidth.",
        workload: "large-dataset-transfer"
      }
    ],
    pcieSlots: [
      {
        electricalLanes: 16,
        generation: 3,
        id: "t5810-slot-1",
        notes: "Primary GPU slot.",
        physicalSize: "x16",
        priority: "primary-gpu"
      },
      {
        electricalLanes: 4,
        generation: 3,
        id: "t5810-slot-2",
        notes: "Useful for NVMe, USB, or network expansion.",
        physicalSize: "x16",
        priority: "storage"
      }
    ],
    potential: {
      communitySupport: 83,
      engineeringFlexibility: 88,
      expandability: 87,
      hiddenValue: 90,
      longevity: 78,
      overall: 86,
      upgradeCeiling: 84
    },
    specifications: {
      cpuSocket: "LGA2011-3",
      dualCpuSupport: false,
      eccSupport: "rdimm",
      gpuClearanceMm: 270,
      maxCpuGeneration: "Xeon E5 v4 class",
      maxRamGb: 256,
      nvmeSupport: "adapter",
      pcieGeneration: 3,
      psuNotes: "Dell workstation PSU with configuration-specific GPU cables.",
      ramType: "DDR4 ECC RDIMM",
      sataPorts: 4
    },
    summary:
      "A practical older Dell workstation platform with good ECC and PCIe expansion value when bought cheaply.",
    timeline: [
      {
        description: "Confirm PSU wattage, BIOS, and GPU power cables.",
        id: "t5810-audit",
        title: "Stock audit"
      },
      {
        description: "Add SSD or PCIe NVMe storage.",
        id: "t5810-storage",
        title: "Storage upgrade"
      },
      {
        description: "Add ECC RAM for engineering or lab workloads.",
        id: "t5810-ram",
        title: "Memory upgrade"
      },
      {
        description: "Add efficient GPU after cable validation.",
        id: "t5810-gpu",
        title: "GPU upgrade"
      }
    ],
    upgradeOpportunities: [
      {
        adapterIds: ["ten-gbe-nic"],
        confidence: "medium",
        difficulty: "moderate",
        estimatedCostUsd: 45,
        expectedBenefitRating: 4,
        id: "t5810-10gbe",
        improvements: { networking: "+80%", engineering: "+12%" },
        recommendedSlotIds: ["nic"],
        summary:
          "Add a used 10Gb NIC for lab, NAS, or large project asset movement.",
        title: "Add 10Gb networking",
        type: "community-mod"
      }
    ]
  },
  {
    aliases: ["precision 5820", "dell 5820", "t5820"],
    constraints: [
      {
        confidence: "medium",
        description:
          "High-end GPU plans need careful PSU and airflow configuration checks.",
        id: "5820-gpu-power",
        mitigation: "Favor efficient GPUs or confirm the exact PSU and cable kit.",
        severity: "warning",
        title: "GPU power path varies"
      }
    ],
    family: "Dell Precision",
    id: "precision-5820",
    knowledgeCards: [
      {
        body:
          "The 5820 is one of the cleaner used workstation paths for a long-life engineering build because it is newer than many E5-era towers.",
        category: "engineering",
        confidence: "high",
        id: "5820-long-life",
        title: "Modern used workstation sweet spot"
      },
      {
        body:
          "Storage and GPU upgrades usually matter more than chasing the most expensive Xeon W SKU.",
        category: "hidden-opportunity",
        confidence: "medium",
        id: "5820-balanced",
        title: "Balanced upgrade path"
      }
    ],
    manufacturer: "Dell",
    modelYears: "2017-2022",
    name: "Dell Precision 5820",
    pcieBottlenecks: [
      {
        impact: "very-low",
        reason: "Primary Gen3 x16 is rarely the limiting factor for a single GPU.",
        workload: "cuda"
      },
      {
        impact: "low",
        reason: "A second storage or NIC card is generally practical if slot spacing is handled.",
        workload: "networking"
      }
    ],
    pcieSlots: [
      {
        electricalLanes: 16,
        generation: 3,
        id: "5820-slot-1",
        notes: "Primary GPU slot.",
        physicalSize: "x16",
        priority: "primary-gpu"
      },
      {
        electricalLanes: 8,
        generation: 3,
        id: "5820-slot-2",
        notes: "Good for storage, networking, or secondary accelerator.",
        physicalSize: "x16",
        priority: "storage"
      }
    ],
    potential: {
      communitySupport: 86,
      engineeringFlexibility: 96,
      expandability: 94,
      hiddenValue: 88,
      longevity: 94,
      overall: 94,
      upgradeCeiling: 94
    },
    specifications: {
      cpuSocket: "LGA2066",
      dualCpuSupport: false,
      eccSupport: "rdimm",
      gpuClearanceMm: 300,
      maxCpuGeneration: "Xeon W 2100/2200 class",
      maxRamGb: 256,
      nvmeSupport: "native",
      pcieGeneration: 3,
      psuNotes: "Dell workstation PSU; exact GPU cable support depends on configuration.",
      ramType: "DDR4 ECC RDIMM",
      sataPorts: 6
    },
    summary:
      "A high-confidence workstation platform for CAD, engineering, and local AI when priced below newer consumer workstations.",
    timeline: [
      {
        description: "Validate PSU, BIOS, and installed CPU/RAM configuration.",
        id: "5820-audit",
        title: "Stock audit"
      },
      {
        description: "Add or expand NVMe storage for active projects.",
        id: "5820-nvme",
        title: "NVMe storage"
      },
      {
        description: "Install a modern efficient GPU for CAD, CUDA, or local AI.",
        id: "5820-gpu",
        title: "GPU upgrade"
      },
      {
        description: "Add 10Gb networking or SAS storage if the project becomes lab-oriented.",
        id: "5820-expansion",
        title: "Expansion cards"
      }
    ],
    upgradeOpportunities: [
      {
        confidence: "high",
        difficulty: "moderate",
        estimatedCostUsd: 380,
        expectedBenefitRating: 5,
        id: "5820-efficient-rtx",
        improvements: { cuda: "+58%", engineering: "+28%", localLlm: "+36%" },
        prerequisites: ["Check power cable kit", "Leave adjacent slot airflow"],
        recommendedSlotIds: ["gpu", "psu"],
        summary:
          "The platform is strong enough to justify an efficient modern RTX upgrade for CAD, CUDA, and local model work.",
        title: "Efficient RTX workstation upgrade",
        type: "high-impact-upgrade"
      }
    ]
  },
  {
    aliases: ["optiplex 7060", "7060 sff", "dell 7060"],
    constraints: [
      {
        confidence: "high",
        description:
          "The SFF chassis cannot accept normal full-height, long GPUs.",
        id: "7060-low-profile",
        mitigation: "Use low-profile GPUs or treat eGPU/external paths as experimental.",
        severity: "hard-limit",
        title: "Low-profile expansion only"
      },
      {
        confidence: "high",
        description:
          "The PSU is proprietary and low wattage compared with gaming towers.",
        id: "7060-proprietary-psu",
        mitigation: "Keep upgrades low power or use a different base system.",
        severity: "hard-limit",
        title: "Proprietary PSU"
      },
      {
        confidence: "medium",
        description:
          "No front USB-C on common configurations.",
        id: "7060-usbc",
        mitigation: "Use rear PCIe USB-C expansion only if a compatible slot is available.",
        severity: "info",
        title: "Limited modern front I/O"
      }
    ],
    family: "Dell OptiPlex",
    id: "optiplex-7060",
    knowledgeCards: [
      {
        body:
          "This is a good office, school, or homelab platform, but a poor gaming base unless the user understands low-profile GPU limits.",
        category: "known-limitation",
        confidence: "high",
        id: "7060-not-gaming",
        title: "Not a normal gaming chassis"
      },
      {
        body:
          "The best upgrades are usually SSD, RAM, Wi-Fi, and low-power networking rather than high-end graphics.",
        category: "hidden-opportunity",
        confidence: "high",
        id: "7060-practical",
        title: "Practical upgrade target"
      }
    ],
    manufacturer: "Dell",
    modelYears: "2018-2020",
    name: "Dell OptiPlex 7060 SFF",
    pcieBottlenecks: [
      {
        impact: "moderate",
        reason:
          "Physical slot height and power are bigger limits than PCIe bandwidth for GPUs.",
        workload: "gaming"
      },
      {
        impact: "high",
        reason:
          "External or adapter GPU paths introduce bandwidth, power, and enclosure complexity.",
        workload: "local-ai"
      }
    ],
    pcieSlots: [
      {
        electricalLanes: 16,
        generation: 3,
        id: "7060-slot-1",
        notes: "Low-profile physical constraints dominate.",
        physicalSize: "x16",
        priority: "primary-gpu"
      },
      {
        electricalLanes: 1,
        generation: 3,
        id: "7060-slot-2",
        notes: "Useful for Wi-Fi, USB, or small NICs.",
        physicalSize: "x1",
        priority: "utility"
      }
    ],
    potential: {
      communitySupport: 76,
      engineeringFlexibility: 52,
      expandability: 48,
      hiddenValue: 70,
      longevity: 76,
      overall: 64,
      upgradeCeiling: 42
    },
    specifications: {
      cpuSocket: "LGA1151",
      dualCpuSupport: false,
      eccSupport: "none",
      gpuClearanceMm: 210,
      maxCpuGeneration: "Intel 8th/9th gen class, BIOS dependent",
      maxRamGb: 64,
      nvmeSupport: "native",
      pcieGeneration: 3,
      psuNotes: "Proprietary low-wattage SFF PSU.",
      ramType: "DDR4 UDIMM",
      sataPorts: 2
    },
    summary:
      "A compact general-use and homelab platform with strong value, but hard GPU and PSU constraints.",
    timeline: [
      {
        description: "Confirm BIOS version, PSU wattage, and included storage caddy.",
        id: "7060-audit",
        title: "Stock audit"
      },
      {
        description: "Add NVMe SSD for the biggest everyday responsiveness uplift.",
        id: "7060-ssd",
        title: "NVMe storage"
      },
      {
        description: "Move to 32 GB or 64 GB RAM for office, programming, or lab use.",
        id: "7060-ram",
        title: "Memory upgrade"
      },
      {
        description: "Add Wi-Fi, USB-C, or low-profile networking only if the slot plan is clean.",
        id: "7060-expansion",
        title: "Low-profile expansion"
      }
    ],
    upgradeOpportunities: [
      {
        confidence: "high",
        difficulty: "easy",
        estimatedCostUsd: 45,
        expectedBenefitRating: 5,
        id: "7060-nvme",
        improvements: { storage: "+60%" },
        recommendedSlotIds: ["storage"],
        summary:
          "NVMe storage is usually the best first upgrade and avoids the physical GPU trap.",
        title: "Install NVMe boot drive",
        type: "hidden-opportunity"
      },
      {
        adapterIds: ["pcie-wifi-card"],
        confidence: "medium",
        difficulty: "easy",
        estimatedCostUsd: 28,
        expectedBenefitRating: 3,
        id: "7060-wifi",
        improvements: { networking: "+45%" },
        recommendedSlotIds: ["wifi"],
        summary:
          "A low-profile Wi-Fi or networking card can make the machine more useful without stressing power.",
        title: "Add low-profile networking",
        type: "community-mod"
      }
    ]
  },
  {
    aliases: ["hp z440", "z440"],
    constraints: [
      {
        confidence: "high",
        description:
          "GPU upgrades depend on PSU wattage, cable availability, and shroud layout.",
        id: "z440-gpu-power",
        mitigation: "Check the exact PSU and internal cable set before buying a GPU.",
        severity: "warning",
        title: "GPU power and fit must be checked"
      }
    ],
    family: "HP Z workstation",
    id: "hp-z440",
    knowledgeCards: [
      {
        body:
          "The Z440 is often a budget sweet spot for render nodes because ECC memory and Xeon CPUs are cheap on the used market.",
        category: "hidden-opportunity",
        confidence: "high",
        id: "z440-render",
        title: "Budget render-node value"
      },
      {
        body:
          "Fan curves and shrouds matter. Removing airflow guides can make temperatures worse even if the case looks more open.",
        category: "thermals",
        confidence: "medium",
        id: "z440-shroud",
        title: "Keep airflow intentional"
      }
    ],
    manufacturer: "HP",
    modelYears: "2014-2018",
    name: "HP Z440",
    pcieBottlenecks: [
      {
        impact: "low",
        reason: "Primary Gen3 x16 is sufficient for practical GPU upgrades.",
        workload: "cuda"
      }
    ],
    pcieSlots: [
      {
        electricalLanes: 16,
        generation: 3,
        id: "z440-slot-1",
        notes: "Primary GPU slot.",
        physicalSize: "x16",
        priority: "primary-gpu"
      },
      {
        electricalLanes: 4,
        generation: 3,
        id: "z440-slot-2",
        notes: "Good for NVMe or 10Gb networking.",
        physicalSize: "x16",
        priority: "storage"
      }
    ],
    potential: {
      communitySupport: 86,
      engineeringFlexibility: 84,
      expandability: 84,
      hiddenValue: 91,
      longevity: 78,
      overall: 84,
      upgradeCeiling: 82
    },
    specifications: {
      cpuSocket: "LGA2011-3",
      dualCpuSupport: false,
      eccSupport: "rdimm",
      gpuClearanceMm: 270,
      maxCpuGeneration: "Xeon E5 v4 class",
      maxRamGb: 128,
      nvmeSupport: "adapter",
      pcieGeneration: 3,
      psuNotes: "HP workstation PSU, check GPU auxiliary power.",
      ramType: "DDR4 ECC RDIMM",
      sataPorts: 4
    },
    summary:
      "A strong low-cost workstation base for CAD, render, and homelab projects if GPU power and airflow are validated.",
    timeline: [
      {
        description: "Confirm PSU wattage, BIOS, and cooling shroud condition.",
        id: "z440-audit",
        title: "Stock audit"
      },
      {
        description: "Add NVMe storage via PCIe for boot or scratch use.",
        id: "z440-nvme",
        title: "NVMe adapter"
      },
      {
        description: "Add ECC memory for render, CAD, or VM workloads.",
        id: "z440-memory",
        title: "ECC memory"
      },
      {
        description: "Add a GPU that matches power cables and airflow.",
        id: "z440-gpu",
        title: "GPU upgrade"
      }
    ],
    upgradeOpportunities: [
      {
        adapterIds: ["pcie-nvme-adapter"],
        confidence: "high",
        difficulty: "easy",
        estimatedCostUsd: 12,
        expectedBenefitRating: 5,
        id: "z440-nvme",
        improvements: { engineering: "+15%", storage: "+68%" },
        recommendedSlotIds: ["storage", "pcie-adapter"],
        summary:
          "A PCIe NVMe adapter gives a large responsiveness improvement on a cheap platform.",
        title: "Add PCIe NVMe storage",
        type: "hidden-opportunity"
      }
    ]
  },
  {
    aliases: ["hp z840", "z840"],
    constraints: [
      {
        confidence: "high",
        description:
          "Dual-CPU configurations increase power, noise, and cooling complexity.",
        id: "z840-dual-cpu-thermals",
        mitigation: "Use dual CPUs only when the workload truly benefits.",
        severity: "warning",
        title: "Dual CPU thermal load"
      }
    ],
    family: "HP Z workstation",
    id: "hp-z840",
    knowledgeCards: [
      {
        body:
          "The Z840 is interesting when the user needs many memory channels, PCIe slots, or cheap cores, not when they need a quiet desk PC.",
        category: "engineering",
        confidence: "high",
        id: "z840-lanes",
        title: "Expansion-first platform"
      },
      {
        body:
          "It can become a serious local lab box, but shipping weight, power draw, and noise should be part of the decision.",
        category: "noise",
        confidence: "high",
        id: "z840-practical",
        title: "Powerful but not subtle"
      }
    ],
    manufacturer: "HP",
    modelYears: "2014-2018",
    name: "HP Z840",
    pcieBottlenecks: [
      {
        impact: "low",
        reason: "Slot availability is usually excellent; thermal spacing is the practical issue.",
        workload: "cuda"
      },
      {
        impact: "very-low",
        reason: "Multiple expansion slots make high-speed networking and storage practical.",
        workload: "networking"
      }
    ],
    pcieSlots: [
      {
        electricalLanes: 16,
        generation: 3,
        id: "z840-slot-1",
        notes: "Primary GPU slot.",
        physicalSize: "x16",
        priority: "primary-gpu"
      },
      {
        electricalLanes: 16,
        generation: 3,
        id: "z840-slot-2",
        notes: "Secondary GPU or accelerator slot, thermal spacing required.",
        physicalSize: "x16",
        priority: "secondary-gpu"
      },
      {
        electricalLanes: 8,
        generation: 3,
        id: "z840-slot-3",
        notes: "Storage or networking expansion.",
        physicalSize: "x16",
        priority: "networking"
      }
    ],
    potential: {
      communitySupport: 82,
      engineeringFlexibility: 96,
      expandability: 98,
      hiddenValue: 84,
      longevity: 76,
      overall: 90,
      upgradeCeiling: 96
    },
    specifications: {
      cpuSocket: "Dual LGA2011-3",
      dualCpuSupport: true,
      eccSupport: "rdimm",
      gpuClearanceMm: 300,
      maxCpuGeneration: "Dual Xeon E5 v4 class",
      maxRamGb: 1024,
      nvmeSupport: "adapter",
      pcieGeneration: 3,
      psuNotes: "High-wattage workstation PSU, but exact GPU cables still matter.",
      ramType: "DDR4 ECC RDIMM/LRDIMM",
      sataPorts: 8
    },
    summary:
      "A large, expandable dual-socket workstation for lab, render, and storage-heavy builds when power and noise are acceptable.",
    timeline: [
      {
        description: "Inspect CPU configuration, fans, and shipping damage risk.",
        id: "z840-audit",
        title: "Stock audit"
      },
      {
        description: "Populate memory deliberately across CPU channels.",
        id: "z840-ram",
        title: "Memory population"
      },
      {
        description: "Add NVMe or SAS expansion for lab storage.",
        id: "z840-storage",
        title: "Storage expansion"
      },
      {
        description: "Add GPU or accelerator only after airflow review.",
        id: "z840-gpu",
        title: "Accelerator upgrade"
      }
    ],
    upgradeOpportunities: [
      {
        adapterIds: ["sas-hba"],
        confidence: "high",
        difficulty: "moderate",
        estimatedCostUsd: 38,
        expectedBenefitRating: 4,
        id: "z840-sas",
        improvements: { storage: "+72%", engineering: "+16%" },
        recommendedSlotIds: ["additional-storage", "pcie-adapter"],
        summary:
          "A SAS HBA turns the platform into a serious storage or lab base.",
        title: "Add SAS HBA storage expansion",
        type: "community-mod"
      }
    ]
  },
  {
    aliases: ["mac pro 5,1", "macpro5,1", "cheese grater mac pro"],
    constraints: [
      {
        confidence: "high",
        description:
          "PCIe Gen2 bandwidth and macOS support boundaries must be respected.",
        id: "macpro-gen2",
        mitigation: "Use workload-appropriate GPUs and avoid fake precision around bandwidth.",
        severity: "warning",
        title: "PCIe Gen2 platform"
      },
      {
        confidence: "medium",
        description:
          "Modern OS and GPU paths can require boot ROM, metal GPU, or community patching decisions.",
        id: "macpro-firmware",
        mitigation: "Treat firmware state as a required purchase question.",
        severity: "warning",
        title: "Firmware and OS path matters"
      }
    ],
    family: "Mac Pro",
    id: "mac-pro-5-1",
    knowledgeCards: [
      {
        body:
          "Enthusiasts value the chassis, memory capacity, and upgrade culture, but the platform is no longer a simple recommendation for beginners.",
        category: "community-discovery",
        confidence: "high",
        id: "macpro-culture",
        title: "Community knowledge is the product"
      },
      {
        body:
          "NVMe boot, modern GPUs, and CPU tray upgrades are possible, but each path has firmware and OS caveats.",
        category: "bios-quirk",
        confidence: "medium",
        id: "macpro-firmware-path",
        title: "Firmware state changes everything"
      }
    ],
    manufacturer: "Apple",
    modelYears: "2010-2012",
    name: "Mac Pro 5,1",
    pcieBottlenecks: [
      {
        impact: "moderate",
        reason:
          "PCIe Gen2 can constrain modern GPUs and fast storage more than newer workstations.",
        workload: "gaming"
      },
      {
        impact: "high",
        reason:
          "Local AI workloads can be held back by old CPUs, power choices, and Gen2 transfers.",
        workload: "local-ai"
      }
    ],
    pcieSlots: [
      {
        electricalLanes: 16,
        generation: 2,
        id: "macpro-slot-1",
        notes: "Primary GPU slot, but Gen2 bandwidth.",
        physicalSize: "x16",
        priority: "primary-gpu"
      },
      {
        electricalLanes: 4,
        generation: 2,
        id: "macpro-slot-2",
        notes: "Often used for NVMe adapter cards.",
        physicalSize: "x16",
        priority: "storage"
      }
    ],
    potential: {
      communitySupport: 96,
      engineeringFlexibility: 68,
      expandability: 78,
      hiddenValue: 72,
      longevity: 54,
      overall: 74,
      upgradeCeiling: 70
    },
    specifications: {
      cpuSocket: "LGA1366",
      dualCpuSupport: true,
      eccSupport: "rdimm",
      gpuClearanceMm: 310,
      maxCpuGeneration: "Westmere Xeon",
      maxRamGb: 128,
      nvmeSupport: "adapter",
      pcieGeneration: 2,
      psuNotes: "Strong internal PSU, but GPU power routing must be planned.",
      ramType: "DDR3 ECC RDIMM",
      sataPorts: 4
    },
    summary:
      "A community-rich upgrade platform with real charm and serious caveats; better for enthusiasts than beginner buyers.",
    timeline: [
      {
        description: "Confirm boot ROM, CPU tray, GPU, and OS target.",
        id: "macpro-audit",
        title: "Firmware and hardware audit"
      },
      {
        description: "Add bootable PCIe NVMe only when firmware path is known.",
        id: "macpro-nvme",
        title: "NVMe adapter"
      },
      {
        description: "Choose a supported GPU path for the intended OS.",
        id: "macpro-gpu",
        title: "GPU path"
      },
      {
        description: "Add networking or USB expansion if the machine stays in service.",
        id: "macpro-expansion",
        title: "Modern I/O cards"
      }
    ],
    upgradeOpportunities: [
      {
        adapterIds: ["pcie-nvme-adapter"],
        confidence: "medium",
        difficulty: "moderate",
        estimatedCostUsd: 18,
        expectedBenefitRating: 4,
        id: "macpro-nvme",
        improvements: { storage: "+64%" },
        prerequisites: ["Verify boot ROM support"],
        recommendedSlotIds: ["storage", "pcie-adapter"],
        summary:
          "PCIe NVMe can make the platform feel dramatically faster, but firmware state decides whether it is beginner-friendly.",
        title: "Bootable PCIe NVMe path",
        type: "community-mod"
      }
    ]
  }
];
