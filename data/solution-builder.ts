import type {
  BuildWorkspaceProject,
  BuildWorkspaceSlot,
  BuildWorkspaceSlotDefinition,
  SolutionBuilderMode,
  SolutionBuilderServiceDependency,
  SolutionStrategyDefinition
} from "@/types/solution-builder";

export const solutionBuilderModes: SolutionBuilderMode[] = [
  {
    description:
      "Create a project, fill hardware slots, and let JETS continuously validate the build as a complete solution.",
    href: "/solution-builder/build-my-own",
    id: "build-my-own",
    title: "Build My Own"
  },
  {
    description:
      "Enter the problem, budget, preferences, and owned hardware so JETS can synthesize complete solution paths.",
    href: "/solution-builder/recommend",
    id: "let-jets-recommend",
    title: "Let JETS Recommend"
  }
];

export const solutionBuilderServiceDependencies: SolutionBuilderServiceDependency[] = [
  {
    href: "/search",
    name: "Search inventory",
    role: "Provides filtered inventory candidates for project slots and generated solution paths."
  },
  {
    href: "/compatibility",
    name: "Compatibility engine",
    role: "Evaluates physical, electrical, thermal, RAM, storage, BIOS, and platform constraints."
  },
  {
    href: "/build-generator",
    name: "Decision engine",
    role: "Scores value, performance, reliability, risk, upgrade potential, and use-case fit."
  },
  {
    href: "/build-snapshots",
    name: "Snapshots",
    role: "Preserves decisions, scores, explanations, alternatives, and restored generator inputs."
  },
  {
    href: "/activity",
    name: "Decision audit",
    role: "Records decision changes, notes, status changes, restores, saves, and favorites."
  },
  {
    href: "/sources",
    name: "Sources",
    role: "Keeps ingestion status, dry-run adapters, normalized listings, and freshness metadata reusable."
  }
];

export const buildWorkspaceSlotDefinitions: BuildWorkspaceSlotDefinition[] = [
  {
    description: "Case, workstation shell, laptop body, or other physical base.",
    id: "chassis",
    label: "Chassis",
    requirement: "required",
    searchIntent: { formFactor: "desktop", query: "tower chassis case", useCase: "general" }
  },
  {
    description: "Main logic board or platform board for the build.",
    id: "motherboard",
    label: "Motherboard",
    requirement: "required",
    searchIntent: { formFactor: "component", query: "motherboard", useCase: "general" }
  },
  {
    description: "Primary processor for the platform.",
    id: "cpu",
    label: "CPU",
    requirement: "required",
    searchIntent: { formFactor: "component", query: "cpu processor", useCase: "engineering" }
  },
  {
    description: "Air or liquid cooler matched to socket, thermals, and clearance.",
    id: "cpu-cooler",
    label: "CPU Cooler",
    requirement: "required",
    searchIntent: { formFactor: "component", query: "cpu cooler", useCase: "general" }
  },
  {
    description: "Memory modules matched to platform type, capacity, and slot limits.",
    id: "ram",
    label: "RAM",
    requirement: "required",
    searchIntent: { formFactor: "component", query: "ram memory ddr4", useCase: "engineering" }
  },
  {
    description: "Graphics card, integrated graphics path, or compute accelerator.",
    id: "gpu",
    label: "GPU",
    requirement: "required",
    searchIntent: { formFactor: "component", query: "gpu", useCase: "gaming" }
  },
  {
    description: "Power supply, power brick, or validated external power path.",
    id: "psu",
    label: "PSU",
    requirement: "required",
    searchIntent: { formFactor: "component", query: "psu power supply", useCase: "general" }
  },
  {
    description: "Primary boot drive and baseline local storage.",
    id: "storage",
    label: "Storage",
    requirement: "required",
    searchIntent: { formFactor: "component", query: "ssd nvme storage", useCase: "general" }
  },
  {
    description: "Operating system license or target OS plan.",
    id: "operating-system",
    label: "Operating System",
    requirement: "required",
    searchIntent: { formFactor: "component", query: "windows license linux", useCase: "general" }
  },
  {
    description: "Video capture card for streaming, lab, or production workflows.",
    id: "capture-card",
    label: "Capture Card",
    requirement: "optional",
    searchIntent: { formFactor: "component", query: "capture card", useCase: "general" }
  },
  {
    description: "Ethernet, fiber, or specialty networking card.",
    id: "nic",
    label: "NIC",
    requirement: "optional",
    searchIntent: { formFactor: "component", query: "network card nic", useCase: "homelab" }
  },
  {
    description: "Audio card for specialty input or output needs.",
    id: "sound-card",
    label: "Sound Card",
    requirement: "optional",
    searchIntent: { formFactor: "component", query: "sound card", useCase: "general" }
  },
  {
    description: "Wireless networking adapter.",
    id: "wifi",
    label: "WiFi",
    requirement: "optional",
    searchIntent: { formFactor: "component", query: "wifi adapter", useCase: "general" }
  },
  {
    description: "Extra SSD, HDD, NVMe, or removable storage beyond the boot path.",
    id: "additional-storage",
    label: "Additional Storage",
    requirement: "optional",
    searchIntent: { formFactor: "component", query: "ssd hdd nvme", useCase: "general" }
  },
  {
    description: "Case fans or airflow improvements.",
    id: "fans",
    label: "Fans",
    requirement: "optional",
    searchIntent: { formFactor: "component", query: "case fan airflow", useCase: "general" }
  },
  {
    description: "Lighting or visual accessories.",
    id: "rgb",
    label: "RGB",
    requirement: "optional",
    searchIntent: { formFactor: "component", query: "rgb lighting", useCase: "general" }
  },
  {
    description: "Cables, brackets, rails, antennas, screws, and small practical parts.",
    id: "accessories",
    label: "Accessories",
    requirement: "optional",
    searchIntent: { formFactor: "component", query: "pc accessories cables", useCase: "general" }
  },
  {
    description: "Adapter path for reusing laptop memory in a desktop-style solution.",
    id: "laptop-ram-dimm-adapter",
    label: "Laptop RAM + DIMM Adapter",
    requirement: "solution",
    searchIntent: { formFactor: "component", query: "laptop ram dimm adapter", useCase: "general" }
  },
  {
    description: "External GPU dock for laptop or small-system expansion paths.",
    id: "egpu-dock",
    label: "eGPU Dock",
    requirement: "solution",
    searchIntent: { formFactor: "component", query: "egpu dock thunderbolt", useCase: "ai" }
  },
  {
    description: "External power supply for adapter, dock, or specialty GPU paths.",
    id: "external-psu",
    label: "External PSU",
    requirement: "solution",
    searchIntent: { formFactor: "component", query: "external psu gpu", useCase: "general" }
  },
  {
    description: "Thunderbolt adapter for laptop, dock, or external PCIe workflows.",
    id: "thunderbolt-adapter",
    label: "Thunderbolt Adapter",
    requirement: "solution",
    searchIntent: { formFactor: "component", query: "thunderbolt adapter", useCase: "general" }
  },
  {
    description: "Riser, bifurcation, low-profile, or external PCIe adapter.",
    id: "pcie-adapter",
    label: "PCIe Adapter",
    requirement: "solution",
    searchIntent: { formFactor: "component", query: "pcie adapter riser", useCase: "homelab" }
  },
  {
    description: "Placeholder for future unusual hardware paths.",
    id: "other-adapter",
    label: "Other Hardware Adapter",
    requirement: "solution",
    searchIntent: { formFactor: "component", query: "hardware adapter", useCase: "general" }
  }
];

export const solutionStrategyDefinitions: SolutionStrategyDefinition[] = [
  {
    description: "Used enterprise tower or workstation base upgraded around reliability and expansion.",
    id: "enterprise-workstation",
    serviceDependencies: ["Search", "Decision Engine", "Compatibility Engine"],
    stage: "active",
    title: "Enterprise workstation",
    tradeoffs: ["Heavier shipping", "Practical chassis", "Strong upgrade path"]
  },
  {
    description: "Balanced desktop built from gaming towers, office conversions, or GPU upgrades.",
    id: "gaming-desktop",
    serviceDependencies: ["Search", "Decision Engine", "Compatibility Engine"],
    stage: "active",
    title: "Gaming desktop",
    tradeoffs: ["PSU checks matter", "GPU age risk", "High value when parts test cleanly"]
  },
  {
    description: "Portable complete system when mobility, low setup friction, or power efficiency wins.",
    id: "used-gaming-laptop",
    serviceDependencies: ["Search", "Decision Engine", "Snapshots"],
    stage: "active",
    title: "Used gaming laptop",
    tradeoffs: ["Lower upgradeability", "Battery and thermal checks", "Easy shipping"]
  },
  {
    description: "Laptop plus external GPU path for users who already own a compatible mobile platform.",
    id: "laptop-egpu",
    serviceDependencies: ["Search", "Compatibility Engine", "Decision Audit"],
    stage: "foundation",
    title: "Laptop + eGPU",
    tradeoffs: ["Adapter complexity", "Bandwidth limits", "Useful for owned laptop scenarios"]
  },
  {
    description: "Adapter-assisted solution for reusing laptop memory where the platform allows it.",
    id: "laptop-ram-adapter",
    serviceDependencies: ["Search", "Compatibility Engine"],
    stage: "foundation",
    title: "Laptop RAM + adapter",
    tradeoffs: ["Niche compatibility", "More validation required", "Can reduce sunk cost"]
  },
  {
    description: "Broken or incomplete workstation plus validated replacement parts.",
    id: "repair-risk-workstation",
    serviceDependencies: ["Sources", "Decision Engine", "Decision Audit"],
    stage: "foundation",
    title: "Repair-risk workstation",
    tradeoffs: ["Higher diagnosis difficulty", "Negotiation upside", "Requires clear risk notes"]
  },
  {
    description: "Registry slot for future strategies that do not fit normal PC shopping categories.",
    id: "future-solution-path",
    serviceDependencies: ["Snapshots", "Audit", "Sources"],
    stage: "planned",
    title: "Other solution strategy",
    tradeoffs: ["Parked until rules and data contracts are mature"]
  }
];

const starterSlots: BuildWorkspaceSlot[] = [
  {
    definitionId: "chassis",
    notes: "Small-form-factor chassis keeps cost low but constrains GPU height and airflow.",
    selectedHardware: {
      facts: {
        airflowRating: 42,
        maxCoolerHeightMm: 65,
        maxGpuLengthMm: 210,
        platformYear: 2018,
        supportsFullHeightGpu: false
      },
      label: "Dell OptiPlex 7060 SFF chassis",
      sourceListingId: "optiplex-7060-sff"
    }
  },
  {
    definitionId: "motherboard",
    selectedHardware: {
      facts: {
        biosGeneration: "A12",
        maxRamCapacityGb: 64,
        m2SlotsTotal: 1,
        pcieGeneration: 3,
        ramSlotsTotal: 2,
        sataPortsTotal: 2,
        supportedRamType: "DDR4"
      },
      label: "Dell Q370 SFF motherboard",
      sourceListingId: "optiplex-7060-sff"
    }
  },
  {
    definitionId: "cpu",
    selectedHardware: {
      facts: {
        requiredBiosGeneration: "A18",
        tdpWatts: 65
      },
      label: "Intel Core i5-8500",
      sourceListingId: "optiplex-7060-sff"
    }
  },
  { definitionId: "cpu-cooler" },
  {
    definitionId: "ram",
    selectedHardware: {
      facts: {
        ramCapacityGb: 32,
        ramSlotsUsed: 2,
        ramType: "DDR4"
      },
      label: "32 GB DDR4 SODIMM kit"
    }
  },
  {
    definitionId: "gpu",
    notes: "Chosen intentionally to prove the slot validation catches physical fit problems.",
    selectedHardware: {
      facts: {
        boardPowerWatts: 230,
        gpuLengthMm: 305,
        gpuSlotHeight: "full-height",
        requiredPcieGeneration: 4,
        requiredPowerConnectors: ["8-pin", "6-pin"]
      },
      label: "Radeon RX 6700 XT triple-fan GPU",
      sourceListingId: "gpu-rx-6700xt"
    }
  },
  { definitionId: "psu" },
  {
    definitionId: "storage",
    selectedHardware: {
      facts: {
        m2SlotsUsed: 1,
        sataPortsUsed: 1
      },
      label: "1 TB NVMe SSD"
    }
  },
  {
    definitionId: "operating-system",
    selectedHardware: {
      label: "Windows 11 Pro license check pending"
    }
  },
  { definitionId: "capture-card" },
  { definitionId: "nic" },
  { definitionId: "sound-card" },
  { definitionId: "wifi" },
  { definitionId: "additional-storage" },
  { definitionId: "fans" },
  { definitionId: "rgb" },
  { definitionId: "accessories" },
  { definitionId: "laptop-ram-dimm-adapter" },
  { definitionId: "egpu-dock" },
  { definitionId: "external-psu" },
  { definitionId: "thunderbolt-adapter" },
  { definitionId: "pcie-adapter" },
  { definitionId: "other-adapter" }
];

export const starterEngineeringWorkspaceProject: BuildWorkspaceProject = {
  budget: 850,
  country: "United States",
  currency: "USD",
  id: "engineering-workstation-foundation",
  ownedItems: {
    gpu: false,
    hdd: false,
    keyboard: true,
    monitor: false,
    mouse: true,
    psu: false,
    ram: true,
    speakers: false,
    ssd: true
  },
  preferences: {
    aestheticsPriority: false,
    lowestPricePriority: false,
    lowPowerUsage: false,
    preferDesktops: true,
    preferLaptops: false,
    preferWorkstations: true,
    quietOperation: true,
    reliabilityPriority: true,
    smallFormFactor: false,
    upgradeabilityPriority: true
  },
  purpose: "engineering",
  slots: starterSlots,
  title: "Engineering Workstation"
};
