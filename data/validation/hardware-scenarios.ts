import type { RawMarketplaceListing } from "@/types/marketplace-intelligence";
import type { HardwareValidationScenario } from "@/types/validation-framework";

const baseObservedAt = "2026-07-06T10:00:00.000Z";

function rawListing(
  listing: Omit<RawMarketplaceListing, "currency" | "imageCount" | "marketplaceSpecific" | "observedAt" | "sourceId" | "url"> &
    Partial<Pick<RawMarketplaceListing, "currency" | "imageCount" | "marketplaceSpecific" | "observedAt" | "sourceId" | "url">>
): RawMarketplaceListing {
  return {
    currency: listing.currency ?? "AED",
    imageCount: listing.imageCount ?? 5,
    marketplaceSpecific: listing.marketplaceSpecific ?? { fixture: "v3.5-validation" },
    observedAt: listing.observedAt ?? baseObservedAt,
    sourceId: listing.sourceId ?? "manual-entry",
    url: listing.url ?? null,
    ...listing
  };
}

export const hardwareValidationScenarios: HardwareValidationScenario[] = [
  {
    coverage: {
      builder: ["builder:platform-workstation", "builder:required-slots-present"],
      evidence: ["evidence:parsed-field-links", "evidence:platform-summary"],
      listing: ["listing:ready-workstation", "listing:adapter-preview"],
      marketplace: ["marketplace:platform-detection", "marketplace:normalization"],
      optimization: ["optimization:engineering-student"],
      platform: ["platform:thinkstation-p510", "platform:nvme-adapter"],
      solution: ["solution:platform-opportunities", "solution:bottlenecks"]
    },
    expected: {
      confidence: "high",
      constraintIds: ["p510-bios"],
      optimizationSuggestionSlots: ["storage", "gpu"],
      platformId: "thinkstation-p510",
      recommendationReadiness: "needs-review",
      solutionPath: "Engineering Workstation",
      whyThisWorksIds: ["platform-context", "budget-context"]
    },
    id: "thinkstation-p510",
    optimizationInput: {
      depth: "enthusiast",
      goal: "engineering-student",
      lockedSlots: ["chassis", "motherboard", "cpu"],
      projectNotes: ["Validate BIOS before buying upgrades."]
    },
    project: {
      budget: 760,
      lockedSlots: ["chassis", "motherboard", "cpu"],
      selections: {
        "chassis": "base-thinkstation-p520",
        "cpu": "cpu-ryzen-5-5600",
        "cpu-cooler": "cooler-peerless-assassin",
        "gpu": "gpu-rtx-3060ti-component",
        "motherboard": "base-thinkstation-p520",
        "operating-system": "os-linux",
        "psu": "psu-650w-gold",
        "ram": "ram-32gb-ddr4-desktop",
        "storage": "storage-1tb-nvme"
      },
      title: "ThinkStation P510 validation workstation"
    },
    rawListings: [
      rawListing({
        categoryLabel: "Workstation desktop",
        description:
          "Lenovo ThinkStation P510 Xeon E5 v4, 64GB ECC DDR4, Quadro P2000, 1TB SSD. Tested for CAD and engineering.",
        externalId: "validation-p510-01",
        locationText: "Dubai, UAE",
        priceText: "AED 1200",
        sellerDisplayName: "Validation surplus seller",
        sourceId: "manual-entry",
        title: "Lenovo ThinkStation P510 64GB ECC Workstation"
      })
    ],
    summary:
      "P510 should stay platform-detectable and continue surfacing the PCIe NVMe adapter path.",
    title: "ThinkStation P510"
  },
  {
    coverage: {
      builder: ["builder:gpu-physical-fit", "builder:power-headroom"],
      evidence: ["evidence:parsed-field-links"],
      listing: ["listing:sff-limitations"],
      marketplace: ["marketplace:platform-detection"],
      optimization: ["optimization:minimize-power-draw"],
      platform: ["platform:optiplex-7060", "platform:low-profile-constraint"],
      solution: ["solution:rejection-reasons", "solution:bottlenecks"]
    },
    expected: {
      confidence: "medium",
      constraintIds: ["7060-low-profile", "7060-proprietary-psu"],
      optimizationSuggestionSlots: ["storage"],
      platformId: "optiplex-7060",
      recommendationReadiness: "needs-review",
      solutionPath: "Home Server",
      validationIssueIds: ["gpu-length-exceeds-chassis", "gpu-height-exceeds-chassis"],
      whyThisWorksIds: ["platform-context"]
    },
    id: "optiplex-7060",
    optimizationInput: {
      depth: "standard",
      goal: "minimize-power-draw",
      lockedSlots: ["chassis", "motherboard"],
      projectNotes: ["Small form factor office conversion."]
    },
    project: {
      baseProjectId: "starter-engineering",
      budget: 420,
      lockedSlots: ["chassis", "motherboard"],
      selections: {
        "cpu-cooler": "cooler-low-profile-65mm",
        "psu": "psu-300w-oem-sff"
      },
      title: "OptiPlex 7060 SFF validation project"
    },
    rawListings: [
      rawListing({
        categoryLabel: "Office desktop",
        description:
          "Dell OptiPlex 7060 SFF i5 8500, 16GB RAM, 512GB SSD, Windows 11 Pro. Low-profile chassis.",
        externalId: "validation-optiplex-7060-01",
        imageCount: 4,
        locationText: "Sharjah, UAE",
        priceText: "AED 650",
        sellerDisplayName: "Office validation seller",
        sourceId: "facebook-marketplace",
        title: "Dell OptiPlex 7060 SFF i5 16GB SSD"
      })
    ],
    summary:
      "OptiPlex SFF should be useful for office or homelab paths while warning hard against full-height GPUs.",
    title: "OptiPlex 7060 SFF"
  },
  {
    coverage: {
      builder: ["builder:platform-workstation"],
      evidence: ["evidence:platform-summary"],
      listing: ["listing:ready-workstation"],
      marketplace: ["marketplace:platform-detection", "marketplace:future-paths"],
      platform: ["platform:precision-5820"],
      solution: ["solution:platform-opportunities"]
    },
    expected: {
      confidence: "high",
      constraintIds: ["5820-gpu-power"],
      platformId: "precision-5820",
      recommendationReadiness: "needs-review",
      solutionPath: "Engineering Workstation"
    },
    id: "precision-5820",
    rawListings: [
      rawListing({
        categoryLabel: "Workstation desktop",
        description:
          "Dell Precision 5820 tower workstation, Xeon W CPU, 64GB ECC memory, Quadro P2000, 1TB NVMe. Tested for CAD.",
        externalId: "validation-precision-5820-01",
        imageCount: 6,
        locationText: "Dubai, UAE",
        priceText: "AED 1850",
        sellerDisplayName: "Precision validation seller",
        sourceId: "local-computer-store",
        title: "Dell Precision 5820 Xeon W 64GB P2000"
      })
    ],
    summary:
      "Precision 5820 should remain a high-confidence workstation platform with native or strong storage paths.",
    title: "Precision 5820"
  },
  {
    coverage: {
      builder: ["builder:platform-workstation"],
      evidence: ["evidence:platform-summary"],
      listing: ["listing:review-workstation"],
      marketplace: ["marketplace:platform-detection"],
      platform: ["platform:hp-z440", "platform:nvme-adapter"],
      solution: ["solution:platform-opportunities"]
    },
    expected: {
      confidence: "high",
      constraintIds: ["z440-gpu-power"],
      platformId: "hp-z440",
      recommendationReadiness: "needs-review",
      solutionPath: "Engineering Workstation"
    },
    id: "hp-z440",
    rawListings: [
      rawListing({
        categoryLabel: "Workstation desktop",
        description:
          "HP Z440 Xeon E5 v4, 64GB ECC DDR4, Quadro P2000, 1TB SSD. Good render node candidate.",
        externalId: "validation-hp-z440-01",
        imageCount: 6,
        locationText: "Dubai, UAE",
        priceText: "AED 950",
        sellerDisplayName: "HP validation seller",
        sourceId: "csv-import",
        title: "HP Z440 Workstation 64GB ECC Quadro"
      })
    ],
    summary:
      "HP Z440 should keep its budget render-node and PCIe NVMe opportunity behavior.",
    title: "HP Z440"
  },
  {
    coverage: {
      builder: ["builder:complete-gaming-build"],
      evidence: ["evidence:parsed-field-links"],
      listing: ["listing:unknown-platform-review"],
      marketplace: ["marketplace:normalization"],
      optimization: ["optimization:maximize-performance"],
      solution: ["solution:gpu-bottleneck", "solution:use-case-gaming"]
    },
    expected: {
      confidence: "medium",
      platformId: null,
      recommendationReadiness: "needs-review",
      solutionPath: "Gaming PC",
      whyThisWorksIds: ["gpu-power-fit", "budget-context"]
    },
    id: "gaming-build",
    optimizationInput: {
      depth: "standard",
      goal: "maximize-performance",
      lockedSlots: [],
      projectNotes: ["User wants gaming value first."]
    },
    project: {
      budget: 760,
      selections: {
        "chassis": "case-fractal-focus-2",
        "cpu": "cpu-ryzen-5-5600",
        "cpu-cooler": "cooler-peerless-assassin",
        "gpu": "gpu-rtx-3060ti-component",
        "motherboard": "mb-b550-atx",
        "operating-system": "os-windows-11-pro",
        "psu": "psu-650w-gold",
        "ram": "ram-32gb-ddr4-desktop",
        "storage": "storage-1tb-nvme"
      },
      title: "Budget RTX gaming validation build"
    },
    rawListings: [
      rawListing({
        categoryLabel: "Gaming desktop",
        description:
          "Ryzen 5 gaming PC with RTX 3060 12GB, 16GB DDR4, 1TB NVMe, 650W PSU, Windows installed.",
        externalId: "validation-gaming-3060-01",
        imageCount: 5,
        locationText: "Dubai, UAE",
        priceText: "AED 2250",
        sellerDisplayName: "Gaming validation seller",
        sourceId: "dubizzle",
        title: "Ryzen 5 Gaming PC RTX 3060 12GB"
      })
    ],
    summary:
      "A normal gaming build should optimize as a complete project even when no curated platform profile exists.",
    title: "Gaming Build"
  },
  {
    coverage: {
      builder: ["builder:platform-workstation"],
      evidence: ["evidence:platform-summary"],
      listing: ["listing:adapter-preview"],
      marketplace: ["marketplace:platform-detection"],
      optimization: ["optimization:best-balanced", "optimization:experimental-depth"],
      platform: ["platform:thinkstation-p520", "platform:rtx-upgrade"],
      solution: ["solution:local-ai", "solution:platform-opportunities"]
    },
    expected: {
      confidence: "high",
      constraintIds: ["p520-psu-cables"],
      optimizationSuggestionSlots: ["gpu", "storage", "laptop-ram-dimm-adapter"],
      platformId: "thinkstation-p520",
      recommendationReadiness: "needs-review",
      solutionPath: "Engineering Workstation",
      whyThisWorksIds: ["platform-context", "gpu-power-fit"]
    },
    id: "ai-workstation",
    optimizationInput: {
      depth: "experimental",
      goal: "best-balanced",
      lockedSlots: ["chassis", "motherboard"],
      projectNotes: ["User owns laptop RAM and wants a local AI workstation."]
    },
    project: {
      budget: 980,
      lockedSlots: ["chassis", "motherboard"],
      selections: {
        "chassis": "base-thinkstation-p520",
        "cpu": "cpu-ryzen-5-5600",
        "cpu-cooler": "cooler-peerless-assassin",
        "gpu": "gpu-rtx-3060ti-component",
        "motherboard": "base-thinkstation-p520",
        "operating-system": "os-linux",
        "psu": "psu-650w-gold",
        "ram": "ram-32gb-ddr4-sodimm",
        "storage": "storage-1tb-nvme"
      },
      title: "ThinkStation AI validation project"
    },
    rawListings: [
      rawListing({
        categoryLabel: "Workstation desktop",
        description:
          "Lenovo P520 W-2135, 64GB ECC DDR4, Quadro P2000, 1TB NVMe. Candidate for RTX CUDA and local AI upgrades.",
        externalId: "validation-p520-ai-01",
        imageCount: 8,
        locationText: "Dubai, UAE",
        priceText: "AED 1450",
        sellerDisplayName: "AI validation seller",
        sourceId: "dubizzle",
        title: "Lenovo ThinkStation P520 AI Workstation Base"
      })
    ],
    summary:
      "P520 AI path should preserve platform opportunity, CUDA upgrade, and adapter-aware optimization behavior.",
    title: "AI Workstation"
  },
  {
    coverage: {
      builder: ["builder:starter-engineering", "builder:missing-cpu-cooler"],
      evidence: ["evidence:platform-summary"],
      listing: ["listing:ready-workstation"],
      marketplace: ["marketplace:platform-detection"],
      optimization: ["optimization:engineering-student"],
      platform: ["platform:thinkstation-p520"],
      solution: ["solution:rejection-reasons", "solution:decision-timeline"]
    },
    expected: {
      confidence: "high",
      constraintIds: ["p520-psu-cables"],
      optimizationSuggestionSlots: ["psu", "cpu-cooler"],
      platformId: "thinkstation-p520",
      recommendationReadiness: "needs-review",
      solutionPath: "Engineering Workstation",
      validationIssueIds: ["missing-cpu-cooler", "missing-power-path"],
      whyThisWorksIds: ["platform-context", "budget-context"]
    },
    id: "engineering-workstation",
    optimizationInput: {
      depth: "enthusiast",
      goal: "engineering-student",
      lockedSlots: ["chassis", "motherboard"],
      projectNotes: ["Starter project should expose missing cooler and power."]
    },
    project: {
      baseProjectId: "starter-engineering",
      budget: 850,
      selections: {},
      title: "Starter engineering validation workspace"
    },
    rawListings: [
      rawListing({
        categoryLabel: "Workstation desktop",
        description:
          "Lenovo ThinkStation P520 W-2135, 64GB ECC DDR4, Quadro P2000, 1TB NVMe. Good condition, tested.",
        externalId: "validation-p520-engineering-01",
        imageCount: 8,
        locationText: "Dubai, UAE",
        priceText: "AED 1450",
        sellerDisplayName: "Engineering validation seller",
        sourceId: "dubizzle",
        title: "Lenovo ThinkStation P520 W-2135 64GB ECC Workstation"
      })
    ],
    summary:
      "The starter builder workspace should stay intentionally incomplete and explain the next engineering decisions.",
    title: "Engineering Workstation"
  },
  {
    coverage: {
      builder: ["builder:budget-office", "builder:missing-gpu"],
      evidence: ["evidence:parsed-field-links"],
      listing: ["listing:office-readiness"],
      marketplace: ["marketplace:platform-detection"],
      optimization: ["optimization:minimize-cost"],
      platform: ["platform:optiplex-7060"],
      solution: ["solution:office", "solution:missing-gpu"]
    },
    expected: {
      confidence: "medium",
      constraintIds: ["7060-low-profile"],
      optimizationSuggestionSlots: ["storage", "operating-system"],
      platformId: "optiplex-7060",
      recommendationReadiness: "needs-review",
      solutionPath: "Home Server",
      validationIssueIds: ["missing-gpu"],
      whyThisWorksIds: ["platform-context"]
    },
    id: "budget-office-pc",
    optimizationInput: {
      depth: "standard",
      goal: "minimize-cost",
      lockedSlots: ["chassis", "motherboard", "cpu"],
      projectNotes: ["Office PC should reuse low-cost components."]
    },
    project: {
      budget: 360,
      lockedSlots: ["chassis", "motherboard", "cpu"],
      selections: {
        "chassis": "base-optiplex-7060-sff",
        "cpu": "cpu-i5-8500",
        "cpu-cooler": "cooler-low-profile-65mm",
        "motherboard": "mb-dell-q370-sff",
        "operating-system": "os-windows-11-pro",
        "psu": "psu-300w-oem-sff",
        "ram": "ram-32gb-ddr4-sodimm",
        "storage": "storage-1tb-nvme"
      },
      title: "Budget office validation PC"
    },
    rawListings: [
      rawListing({
        categoryLabel: "Office desktop",
        description:
          "Dell OptiPlex 7060 SFF i5 8500, 16GB RAM, 512GB SSD, Windows 11 Pro. No discrete graphics card.",
        externalId: "validation-office-7060-01",
        imageCount: 4,
        locationText: "Sharjah, UAE",
        priceText: "AED 650",
        sellerDisplayName: "Office validation seller",
        sourceId: "facebook-marketplace",
        title: "Dell OptiPlex 7060 SFF Office PC"
      })
    ],
    summary:
      "Budget office path should detect OptiPlex value but avoid pretending it is a complete gaming solution.",
    title: "Budget Office PC"
  },
  {
    coverage: {
      evidence: ["evidence:parsed-field-links"],
      listing: ["listing:not-ready-broken"],
      marketplace: ["marketplace:condition-broken"],
      solution: ["solution:risk-rejection"]
    },
    expected: {
      confidence: "low",
      importerErrorCodes: ["missing-price"],
      platformId: null,
      recommendationReadiness: "not-ready",
      solutionPath: "Repair-risk Listing Review"
    },
    id: "broken-listing",
    rawListings: [
      rawListing({
        categoryLabel: "Broken gaming desktop",
        description:
          "Alienware style gaming desktop, no boot, missing storage, possible motherboard fault. For parts only.",
        externalId: "validation-broken-01",
        imageCount: 2,
        locationText: "Dubai, UAE",
        priceText: "",
        sellerDisplayName: "Broken validation seller",
        sourceId: "manual-entry",
        title: "Broken Gaming PC for Parts"
      })
    ],
    summary:
      "Broken listings must stay out of recommendation-ready paths until price and fault facts are reviewed.",
    title: "Broken Listing"
  },
  {
    coverage: {
      evidence: ["evidence:parsed-field-links"],
      listing: ["listing:unknown-platform-review"],
      marketplace: ["marketplace:unknown-platform"],
      solution: ["solution:general-purpose-fallback"]
    },
    expected: {
      confidence: "low",
      platformId: null,
      recommendationReadiness: "not-ready",
      solutionPath: "General Purpose System"
    },
    id: "unknown-listing",
    rawListings: [
      rawListing({
        categoryLabel: "Desktop computer",
        description:
          "Custom desktop with generic six core CPU, 16GB RAM, generic graphics, and SSD. Seller does not list platform.",
        externalId: "validation-unknown-01",
        imageCount: 3,
        locationText: "Dubai, UAE",
        priceText: "AED 900",
        sellerDisplayName: "Unknown validation seller",
        sourceId: "manual-entry",
        title: "Custom Desktop PC Unknown Platform"
      })
    ],
    summary:
      "Unknown platform listings should normalize but remain review-oriented.",
    title: "Unknown Listing"
  },
  {
    coverage: {
      evidence: ["evidence:parsed-field-links"],
      listing: ["listing:low-confidence"],
      marketplace: ["marketplace:low-confidence-fields"],
      solution: ["solution:general-purpose-fallback"]
    },
    expected: {
      confidence: "low",
      importerErrorCodes: ["low-confidence-platform-detection"],
      platformId: null,
      recommendationReadiness: "not-ready",
      solutionPath: "General Purpose System"
    },
    id: "low-confidence-listing",
    rawListings: [
      rawListing({
        categoryLabel: "Computer",
        description: "Works. Fast. Good computer.",
        externalId: "validation-low-confidence-01",
        imageCount: 1,
        locationText: "Unknown",
        priceText: "AED 500",
        sellerDisplayName: "Low confidence validation seller",
        sourceId: "manual-entry",
        title: "Fast computer"
      })
    ],
    summary:
      "Thin listings should show confidence decay instead of being promoted as solved recommendations.",
    title: "Low Confidence Listing"
  },
  {
    coverage: {
      evidence: ["evidence:parsed-field-links"],
      listing: ["listing:duplicate-detection"],
      marketplace: ["marketplace:normalization"],
      platform: ["platform:thinkstation-p520"]
    },
    expected: {
      confidence: "high",
      importerErrorCodes: ["duplicate-external-id"],
      platformId: "thinkstation-p520",
      recommendationReadiness: "needs-review",
      solutionPath: "Engineering Workstation"
    },
    id: "duplicate-listing",
    rawListings: [
      rawListing({
        categoryLabel: "Workstation desktop",
        description:
          "Lenovo ThinkStation P520 W-2135, 64GB ECC DDR4, Quadro P2000, 1TB NVMe. Good condition, tested.",
        externalId: "validation-p520-duplicate-a",
        imageCount: 8,
        locationText: "Dubai, UAE",
        priceText: "AED 1450",
        sellerDisplayName: "Duplicate validation seller",
        sourceId: "dubizzle",
        title: "ThinkStation P520 duplicate fixture A"
      }),
      rawListing({
        categoryLabel: "Workstation desktop",
        description:
          "Lenovo ThinkStation P520 W-2135, 64GB ECC DDR4, Quadro P2000, 1TB NVMe. Good condition, tested.",
        externalId: "validation-p520-duplicate-b",
        imageCount: 8,
        locationText: "Dubai, UAE",
        priceText: "AED 1450",
        sellerDisplayName: "Duplicate validation seller",
        sourceId: "dubizzle",
        title: "ThinkStation P520 duplicate fixture B"
      })
    ],
    summary:
      "Duplicate-like listings should keep duplicate review signals alive without merging automatically.",
    title: "Duplicate Listing"
  }
];
