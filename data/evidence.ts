import type {
  CommunityDiscovery,
  EvidenceRecord,
  EvidenceSourceTrust,
  KnowledgeConflict,
  KnowledgeTimelineEvent
} from "@/types/evidence";

export const evidenceSourceTrustWeights: EvidenceSourceTrust[] = [
  {
    description: "Primary source from the original vendor or standards body.",
    label: "Official documentation",
    sourceType: "official-documentation",
    trustWeight: 96
  },
  {
    description: "Structured manufacturer specification, datasheet, or product page.",
    label: "Manufacturer specification",
    sourceType: "manufacturer-specification",
    trustWeight: 92
  },
  {
    description: "Repair, service, or maintenance manual for the exact platform.",
    label: "Service manual",
    sourceType: "service-manual",
    trustWeight: 90
  },
  {
    description: "Repeated practical finding from builders or technicians.",
    label: "Community discovery",
    sourceType: "community-discovery",
    trustWeight: 72
  },
  {
    description: "Forum thread or community discussion that still needs review.",
    label: "Forum",
    sourceType: "forum",
    trustWeight: 58
  },
  {
    description: "Video demonstration; useful but hard to normalize without review.",
    label: "Video",
    sourceType: "video",
    trustWeight: 52
  },
  {
    description: "Benchmark result or comparison dataset.",
    label: "Benchmark",
    sourceType: "benchmark",
    trustWeight: 68
  },
  {
    description: "Claim checked by a future moderator workflow.",
    label: "Moderator verified",
    sourceType: "moderator-verified",
    trustWeight: 94
  },
  {
    description: "User-submitted claim that requires moderation before promotion.",
    label: "User submission",
    sourceType: "user-submission",
    trustWeight: 42
  },
  {
    description: "Manual seed data entered for deterministic demo architecture.",
    label: "Manual research",
    sourceType: "manual-research",
    trustWeight: 64
  },
  {
    description: "Future AI extraction candidate; must be reviewed before trust.",
    label: "Future AI extraction",
    sourceType: "future-ai-extraction",
    trustWeight: 30
  },
  {
    description: "Future OCR candidate; must be reviewed before trust.",
    label: "Future OCR",
    sourceType: "future-ocr",
    trustWeight: 28
  },
  {
    description: "Future scraper candidate; must preserve source and compliance state.",
    label: "Future scraper",
    sourceType: "future-scraper",
    trustWeight: 34
  }
];

export const evidenceRecords: EvidenceRecord[] = [
  {
    claim: "ThinkStation P520 is an LGA2066 workstation platform with high expansion potential.",
    confidence: "very-high",
    dateAdded: "2026-07-05",
    extractionMethod: "structured-spec-entry",
    id: "ev-p520-profile-spec",
    platformId: "thinkstation-p520",
    sourceDetail: "Representative official platform specification placeholder.",
    sourceTitle: "Lenovo ThinkStation P520 platform documentation",
    sourceType: "official-documentation",
    sourceUrl: null,
    subjectId: "thinkstation-p520",
    subjectType: "platform-profile",
    supportingText:
      "Demo evidence records the P520 as a workstation-class chassis with Xeon W, ECC memory, PCIe expansion, and upgrade room.",
    verificationStatus: "verified",
    version: "3.1.0"
  },
  {
    claim: "P520 systems can use PCIe NVMe adapter paths for fast storage.",
    confidence: "high",
    dateAdded: "2026-07-05",
    extractionMethod: "community-report",
    id: "ev-p520-nvme-community",
    platformId: "thinkstation-p520",
    relatedDiscoveryIds: ["disc-p520-nvme-adapter"],
    sourceDetail: "Representative community confirmations count: 12.",
    sourceTitle: "Community confirmations for P520 PCIe NVMe adapters",
    sourceType: "community-discovery",
    sourceUrl: null,
    subjectId: "p520-nvme-tip",
    subjectType: "platform-knowledge-card",
    supportingText:
      "Multiple demo confirmations agree that PCIe NVMe adapters are a practical storage upgrade path for P520-class systems.",
    verificationStatus: "verified",
    version: "3.1.0"
  },
  {
    claim: "A passive PCIe NVMe adapter is a low-cost high-impact P520 upgrade.",
    confidence: "high",
    dateAdded: "2026-07-05",
    extractionMethod: "manual-curation",
    id: "ev-p520-pcie-nvme-upgrade",
    platformId: "thinkstation-p520",
    relatedDiscoveryIds: ["disc-p520-nvme-adapter"],
    sourceTitle: "JETS curated platform opportunity fixture",
    sourceType: "manual-research",
    sourceUrl: null,
    subjectId: "p520-pcie-nvme",
    subjectType: "upgrade-opportunity",
    supportingText:
      "The opportunity is backed by platform PCIe availability and repeated community-style demo confirmations.",
    verificationStatus: "verified",
    version: "3.1.0"
  },
  {
    claim: "P520 can be upgraded with efficient modern RTX-class GPUs when power cables and clearance are verified.",
    confidence: "high",
    dateAdded: "2026-07-05",
    extractionMethod: "manual-curation",
    id: "ev-p520-rtx4070-upgrade",
    platformId: "thinkstation-p520",
    relatedDiscoveryIds: ["disc-p520-drive-cage-gpu"],
    sourceTitle: "JETS curated GPU upgrade fixture",
    sourceType: "manual-research",
    sourceUrl: null,
    subjectId: "p520-rtx4070",
    subjectType: "upgrade-opportunity",
    supportingText:
      "The recommendation is conditional: power cables, drive cage position, and front-to-back airflow must be checked first.",
    verificationStatus: "pending-review",
    version: "3.1.0"
  },
  {
    claim: "P520 official maximum memory is represented as 256 GB in the demo profile.",
    confidence: "very-high",
    dateAdded: "2026-07-05",
    extractionMethod: "structured-spec-entry",
    id: "ev-p520-ram-256-official",
    platformId: "thinkstation-p520",
    sourceTitle: "Lenovo ThinkStation P520 memory specification",
    sourceType: "manufacturer-specification",
    sourceUrl: null,
    subjectId: "thinkstation-p520:max-ram",
    subjectType: "platform-specification",
    supportingText:
      "The seeded platform specification records 256 GB as the official demo maximum RAM.",
    verificationStatus: "verified",
    version: "3.1.0"
  },
  {
    claim: "Some community reports claim larger memory configurations can work after BIOS updates.",
    confidence: "medium",
    dateAdded: "2026-07-05",
    extractionMethod: "community-report",
    id: "ev-p520-ram-512-community",
    platformId: "thinkstation-p520",
    relatedEvidenceIds: ["ev-p520-ram-256-official"],
    sourceTitle: "Community memory capacity reports",
    sourceType: "forum",
    sourceUrl: null,
    subjectId: "thinkstation-p520:max-ram",
    subjectType: "platform-specification",
    supportingText:
      "The claim is preserved as a conflict candidate. JETS should not overwrite the official value without review.",
    verificationStatus: "disputed",
    version: "3.1.0"
  },
  {
    claim: "OptiPlex 7060 SFF accepts low-profile expansion only.",
    confidence: "very-high",
    dateAdded: "2026-07-05",
    extractionMethod: "structured-spec-entry",
    id: "ev-7060-low-profile-service",
    platformId: "optiplex-7060",
    sourceTitle: "Dell OptiPlex 7060 SFF service documentation",
    sourceType: "service-manual",
    sourceUrl: null,
    subjectId: "7060-low-profile",
    subjectType: "platform-constraint",
    supportingText:
      "The SFF chassis is modeled as low-profile expansion only, making normal full-height GPUs incompatible.",
    verificationStatus: "verified",
    version: "3.1.0"
  },
  {
    claim: "OptiPlex 7060 SFF uses a proprietary low-wattage power path.",
    confidence: "high",
    dateAdded: "2026-07-05",
    extractionMethod: "structured-spec-entry",
    id: "ev-7060-proprietary-psu",
    platformId: "optiplex-7060",
    sourceTitle: "Dell OptiPlex 7060 power supply service notes",
    sourceType: "service-manual",
    sourceUrl: null,
    subjectId: "7060-proprietary-psu",
    subjectType: "platform-constraint",
    supportingText:
      "The demo evidence records the SFF PSU as proprietary and unsuitable for normal gaming GPU assumptions.",
    verificationStatus: "verified",
    version: "3.1.0"
  },
  {
    claim: "OptiPlex 7060 NVMe storage is the safest high-value upgrade path.",
    confidence: "high",
    dateAdded: "2026-07-05",
    extractionMethod: "manual-curation",
    id: "ev-7060-nvme-upgrade",
    platformId: "optiplex-7060",
    sourceTitle: "JETS curated office-PC upgrade fixture",
    sourceType: "manual-research",
    sourceUrl: null,
    subjectId: "7060-nvme",
    subjectType: "upgrade-opportunity",
    supportingText:
      "Storage upgrades avoid the low-profile GPU and proprietary PSU constraints that dominate the platform.",
    verificationStatus: "verified",
    version: "3.1.0"
  },
  {
    claim: "Mac Pro 5,1 can use PCIe NVMe, but boot support depends on firmware state.",
    confidence: "medium",
    dateAdded: "2026-07-05",
    extractionMethod: "community-report",
    id: "ev-macpro-nvme-firmware",
    platformId: "mac-pro-5-1",
    relatedDiscoveryIds: ["disc-macpro-nvme-boot"],
    sourceTitle: "Mac Pro 5,1 community NVMe boot reports",
    sourceType: "community-discovery",
    sourceUrl: null,
    subjectId: "macpro-nvme",
    subjectType: "upgrade-opportunity",
    supportingText:
      "The upgrade is useful but firmware-dependent, so the evidence remains verified only as a conditional path.",
    verificationStatus: "pending-review",
    version: "3.1.0"
  },
  {
    claim: "HP Z840 is a high-expansion dual-socket platform with strong storage controller paths.",
    confidence: "high",
    dateAdded: "2026-07-05",
    extractionMethod: "manual-curation",
    id: "ev-z840-sas-hba",
    platformId: "hp-z840",
    sourceTitle: "JETS curated Z840 storage expansion fixture",
    sourceType: "manual-research",
    sourceUrl: null,
    subjectId: "z840-sas",
    subjectType: "upgrade-opportunity",
    supportingText:
      "The large workstation chassis and multiple PCIe slots make SAS HBA expansion a practical lab/storage path.",
    verificationStatus: "verified",
    version: "3.1.0"
  },
  {
    claim: "Passive PCIe NVMe adapters are a recurring workstation upgrade path.",
    confidence: "high",
    dateAdded: "2026-07-05",
    extractionMethod: "manual-curation",
    id: "ev-adapter-pcie-nvme",
    sourceTitle: "JETS adapter intelligence fixture",
    sourceType: "manual-research",
    sourceUrl: null,
    subjectId: "pcie-nvme-adapter",
    subjectType: "adapter-intelligence",
    supportingText:
      "The adapter is represented as low-cost and broadly useful when the platform has an open PCIe slot and compatible boot path.",
    verificationStatus: "verified",
    version: "3.1.0"
  },
  {
    claim: "Solution Intelligence reports are deterministic outputs from compatibility, platform knowledge, component inventory, and project state.",
    confidence: "high",
    dateAdded: "2026-07-05",
    extractionMethod: "manual-curation",
    id: "ev-solution-intelligence-report",
    sourceTitle: "JETS deterministic reasoning architecture",
    sourceType: "manual-research",
    sourceUrl: null,
    subjectId: "solution-intelligence-report",
    subjectType: "solution-intelligence-finding",
    supportingText:
      "The reasoning layer explains current demo project state and should not be treated as sourced marketplace truth.",
    verificationStatus: "verified",
    version: "3.1.0"
  },
  {
    claim: "Marketplace platform detection is a deterministic parser output, not verified source truth.",
    confidence: "medium",
    dateAdded: "2026-07-05",
    extractionMethod: "deterministic-parser",
    id: "ev-marketplace-platform-detection",
    sourceTitle: "JETS Marketplace Intelligence deterministic parser",
    sourceType: "manual-research",
    sourceUrl: null,
    subjectId: "marketplace-platform-detection",
    subjectType: "marketplace-parsed-field",
    supportingText:
      "Parser evidence explains how the field was detected; future moderation must verify the listing against stronger sources.",
    verificationStatus: "pending-review",
    version: "3.1.0"
  }
];

export const knowledgeConflicts: KnowledgeConflict[] = [
  {
    claimId: "thinkstation-p520:max-ram",
    conflictingEvidenceIds: [
      "ev-p520-ram-256-official",
      "ev-p520-ram-512-community"
    ],
    currentHandling:
      "Display the official maximum as the active spec and preserve larger community reports as disputed evidence.",
    id: "conflict-p520-max-ram",
    platformId: "thinkstation-p520",
    status: "accepted-with-warning",
    summary:
      "Official demo spec says 256 GB maximum RAM; community-style evidence claims larger configurations may work after BIOS updates.",
    title: "P520 maximum RAM disagreement"
  }
];

export const communityDiscoveries: CommunityDiscovery[] = [
  {
    difficulty: "easy",
    evidenceIds: ["ev-p520-nvme-community", "ev-p520-pcie-nvme-upgrade"],
    id: "disc-p520-nvme-adapter",
    impact: "very-high",
    moderationStatus: "verified-demo",
    platformId: "thinkstation-p520",
    summary:
      "Install a passive PCIe NVMe adapter to add fast project or boot storage.",
    title: "P520 PCIe NVMe adapter path"
  },
  {
    difficulty: "moderate",
    evidenceIds: ["ev-p520-rtx4070-upgrade"],
    id: "disc-p520-drive-cage-gpu",
    impact: "high",
    moderationStatus: "seeded-demo",
    platformId: "thinkstation-p520",
    summary:
      "Long GPUs can be practical only after checking drive cage position, cables, and airflow.",
    title: "P520 long-GPU clearance depends on internal layout"
  },
  {
    difficulty: "easy",
    evidenceIds: ["ev-7060-low-profile-service"],
    id: "disc-7060-low-profile-gpu",
    impact: "medium",
    moderationStatus: "verified-demo",
    platformId: "optiplex-7060",
    summary:
      "Treat low-profile GPU selection as a hard platform rule, not a preference.",
    title: "OptiPlex SFF low-profile GPU rule"
  },
  {
    difficulty: "moderate",
    evidenceIds: ["ev-macpro-nvme-firmware"],
    id: "disc-macpro-nvme-boot",
    impact: "high",
    moderationStatus: "future-review-needed",
    platformId: "mac-pro-5-1",
    summary:
      "NVMe can be transformative, but boot behavior depends on firmware and OS path.",
    title: "Mac Pro 5,1 NVMe boot path"
  }
];

export const knowledgeTimelineEvents: KnowledgeTimelineEvent[] = [
  {
    dateLabel: "2017",
    description: "ThinkStation P520 platform generation enters the demo knowledge base.",
    evidenceIds: ["ev-p520-profile-spec"],
    id: "timeline-p520-platform",
    platformId: "thinkstation-p520",
    title: "P520 platform profile established",
    verificationStatus: "verified",
    version: "3.1.0"
  },
  {
    dateLabel: "2021",
    description: "Community-style evidence adds the PCIe NVMe adapter path.",
    evidenceIds: ["ev-p520-nvme-community"],
    id: "timeline-p520-nvme",
    platformId: "thinkstation-p520",
    title: "NVMe adapter path confirmed",
    verificationStatus: "verified",
    version: "3.1.0"
  },
  {
    dateLabel: "2024",
    description: "Modern RTX upgrade path is recorded as useful but conditional.",
    evidenceIds: ["ev-p520-rtx4070-upgrade"],
    id: "timeline-p520-rtx",
    platformId: "thinkstation-p520",
    title: "Efficient RTX path added",
    verificationStatus: "pending-review",
    version: "3.1.0"
  },
  {
    dateLabel: "2016",
    description: "P510 workstation base is represented as a lower-cost engineering platform.",
    evidenceIds: [],
    id: "timeline-p510-platform",
    platformId: "thinkstation-p510",
    title: "P510 platform profile seeded",
    verificationStatus: "pending-review",
    version: "3.1.0"
  },
  {
    dateLabel: "2014",
    description: "Precision T5810 is captured as an older ECC workstation path.",
    evidenceIds: [],
    id: "timeline-t5810-platform",
    platformId: "precision-t5810",
    title: "T5810 platform profile seeded",
    verificationStatus: "pending-review",
    version: "3.1.0"
  },
  {
    dateLabel: "2017",
    description: "Precision 5820 is represented as a newer high-confidence CAD platform.",
    evidenceIds: [],
    id: "timeline-5820-platform",
    platformId: "precision-5820",
    title: "Precision 5820 profile seeded",
    verificationStatus: "pending-review",
    version: "3.1.0"
  },
  {
    dateLabel: "2018",
    description: "OptiPlex 7060 SFF constraints are represented as hard fit and power rules.",
    evidenceIds: ["ev-7060-low-profile-service", "ev-7060-proprietary-psu"],
    id: "timeline-7060-constraints",
    platformId: "optiplex-7060",
    title: "SFF constraints documented",
    verificationStatus: "verified",
    version: "3.1.0"
  },
  {
    dateLabel: "2014",
    description: "HP Z440 is seeded as a budget workstation and render-node path.",
    evidenceIds: [],
    id: "timeline-z440-platform",
    platformId: "hp-z440",
    title: "Z440 profile seeded",
    verificationStatus: "pending-review",
    version: "3.1.0"
  },
  {
    dateLabel: "2014",
    description: "HP Z840 is seeded as an expansion-first dual-socket workstation.",
    evidenceIds: ["ev-z840-sas-hba"],
    id: "timeline-z840-platform",
    platformId: "hp-z840",
    title: "Z840 expansion path recorded",
    verificationStatus: "verified",
    version: "3.1.0"
  },
  {
    dateLabel: "2024",
    description: "Mac Pro 5,1 NVMe boot path is preserved as a conditional community discovery.",
    evidenceIds: ["ev-macpro-nvme-firmware"],
    id: "timeline-macpro-nvme",
    platformId: "mac-pro-5-1",
    title: "NVMe firmware caveat recorded",
    verificationStatus: "pending-review",
    version: "3.1.0"
  }
];
