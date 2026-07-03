import type { ComponentInventoryItem } from "@/types/component-inventory";

export const mockComponentInventory: ComponentInventoryItem[] = [
  {
    category: "chassis",
    compatibleSlotIds: ["chassis"],
    condition: "good",
    facts: {
      airflowRating: 72,
      maxCoolerHeightMm: 165,
      maxGpuLengthMm: 330,
      platformYear: 2022,
      supportsFullHeightGpu: true
    },
    id: "case-fractal-focus-2",
    location: "Phoenix, AZ",
    price: 65,
    recommendedUseCases: ["gaming", "engineering", "general"],
    riskNotes: ["Confirm all motherboard standoffs and front-panel cables are included."],
    summary: "Airflow-focused ATX tower with room for full-height GPUs and normal tower coolers.",
    tags: ["case", "atx", "airflow", "desktop"],
    title: "Fractal Focus 2 ATX Case"
  },
  {
    category: "chassis",
    compatibleSlotIds: ["chassis"],
    condition: "good",
    facts: {
      airflowRating: 61,
      maxCoolerHeightMm: 156,
      maxGpuLengthMm: 280,
      platformYear: 2020,
      supportsFullHeightGpu: true
    },
    id: "base-thinkstation-p520",
    location: "Dallas, TX",
    price: 210,
    recommendedUseCases: ["engineering", "cad", "ai", "homelab"],
    riskNotes: ["Verify front panel, fans, and proprietary cable condition."],
    sourceListingId: "thinkstation-p520-sleeper",
    summary: "Workstation base system that can anchor an enterprise sleeper build.",
    tags: ["workstation", "base system", "thinkstation", "sleeper"],
    title: "ThinkStation P520 Base Chassis"
  },
  {
    category: "chassis",
    compatibleSlotIds: ["chassis"],
    condition: "fair",
    facts: {
      airflowRating: 44,
      maxCoolerHeightMm: 68,
      maxGpuLengthMm: 210,
      platformYear: 2018,
      supportsFullHeightGpu: false
    },
    id: "base-optiplex-7060-sff",
    location: "Austin, TX",
    price: 95,
    recommendedUseCases: ["general", "homelab"],
    riskNotes: ["Low-profile GPU and proprietary PSU limits should be treated as hard constraints."],
    sourceListingId: "optiplex-7060-sff",
    summary: "Small office base system useful for compact general or homelab builds.",
    tags: ["sff", "office pc", "base system", "optiplex"],
    title: "Dell OptiPlex 7060 SFF Base"
  },
  {
    category: "motherboard",
    compatibleSlotIds: ["motherboard"],
    condition: "good",
    facts: {
      biosGeneration: "F18",
      maxRamCapacityGb: 128,
      m2SlotsTotal: 2,
      pcieGeneration: 4,
      ramSlotsTotal: 4,
      sataPortsTotal: 4,
      supportedRamType: "DDR4"
    },
    id: "mb-b550-atx",
    location: "Online shipping",
    price: 95,
    recommendedUseCases: ["gaming", "engineering", "general"],
    riskNotes: ["Ask for socket pin photos and BIOS version screenshot."],
    summary: "ATX AM4 board with PCIe Gen 4 GPU support and enough storage expansion.",
    tags: ["motherboard", "am4", "b550", "ddr4"],
    title: "B550 ATX AM4 Motherboard"
  },
  {
    category: "motherboard",
    compatibleSlotIds: ["motherboard"],
    condition: "good",
    facts: {
      biosGeneration: "A12",
      maxRamCapacityGb: 64,
      m2SlotsTotal: 1,
      pcieGeneration: 3,
      platformYear: 2018,
      ramSlotsTotal: 2,
      sataPortsTotal: 2,
      supportedRamType: "DDR4"
    },
    id: "mb-dell-q370-sff",
    location: "Austin, TX",
    price: 70,
    recommendedUseCases: ["general", "homelab"],
    riskNotes: ["BIOS and proprietary front-panel constraints need validation."],
    sourceListingId: "optiplex-7060-sff",
    summary: "OEM Q370 SFF board for compact office builds.",
    tags: ["motherboard", "q370", "sff", "oem"],
    title: "Dell Q370 SFF Motherboard"
  },
  {
    category: "cpu",
    compatibleSlotIds: ["cpu"],
    condition: "good",
    facts: {
      requiredBiosGeneration: "F10",
      tdpWatts: 65
    },
    id: "cpu-ryzen-5-5600",
    location: "Phoenix, AZ",
    price: 105,
    recommendedUseCases: ["gaming", "engineering", "general"],
    riskNotes: ["Confirm no bent pins and include stock cooler only if explicitly listed."],
    summary: "Efficient six-core AM4 CPU with strong used-market value.",
    tags: ["cpu", "am4", "ryzen", "six core"],
    title: "Ryzen 5 5600"
  },
  {
    category: "cpu",
    compatibleSlotIds: ["cpu"],
    condition: "good",
    facts: {
      requiredBiosGeneration: "A18",
      tdpWatts: 65
    },
    id: "cpu-i5-8500",
    location: "Austin, TX",
    price: 45,
    recommendedUseCases: ["general", "homelab"],
    riskNotes: ["Requires BIOS support on older OEM boards."],
    summary: "Six-core office platform CPU for low-cost general builds.",
    tags: ["cpu", "intel", "coffee lake", "office"],
    title: "Intel Core i5-8500"
  },
  {
    category: "cpu-cooler",
    compatibleSlotIds: ["cpu-cooler"],
    condition: "excellent",
    facts: {
      coolerHeightMm: 154
    },
    id: "cooler-peerless-assassin",
    location: "Online shipping",
    price: 38,
    recommendedUseCases: ["gaming", "engineering", "general"],
    riskNotes: ["Confirm mounting kit for the intended socket."],
    summary: "Dual-tower air cooler suitable for normal ATX airflow builds.",
    tags: ["cooler", "air", "tower", "am4"],
    title: "Thermalright Peerless Assassin Cooler"
  },
  {
    category: "cpu-cooler",
    compatibleSlotIds: ["cpu-cooler"],
    condition: "good",
    facts: {
      coolerHeightMm: 64
    },
    id: "cooler-low-profile-65mm",
    location: "Chicago, IL",
    price: 28,
    recommendedUseCases: ["general", "homelab"],
    riskNotes: ["Thermal headroom is limited for high-TDP CPUs."],
    summary: "Low-profile cooler for SFF office conversions.",
    tags: ["cooler", "low profile", "sff"],
    title: "65 mm Low-Profile CPU Cooler"
  },
  {
    category: "ram",
    compatibleSlotIds: ["ram"],
    condition: "good",
    facts: {
      ramCapacityGb: 32,
      ramSlotsUsed: 2,
      ramType: "DDR4"
    },
    id: "ram-32gb-ddr4-desktop",
    location: "Denver, CO",
    price: 55,
    recommendedUseCases: ["gaming", "engineering", "general", "homelab"],
    riskNotes: ["Ask for MemTest or BIOS detection screenshot."],
    summary: "Two desktop DIMMs for mainstream DDR4 platforms.",
    tags: ["ram", "ddr4", "desktop", "dimm"],
    title: "32 GB DDR4 Desktop RAM Kit"
  },
  {
    category: "ram",
    compatibleSlotIds: ["ram"],
    condition: "good",
    facts: {
      ramCapacityGb: 32,
      ramSlotsUsed: 2,
      ramType: "DDR4"
    },
    id: "ram-32gb-ddr4-sodimm",
    location: "Online shipping",
    price: 48,
    recommendedUseCases: ["general", "programming", "homelab"],
    riskNotes: ["Use directly in laptops or only with a validated adapter path."],
    summary: "Laptop SODIMM kit for mobile workstations or adapter-assisted projects.",
    tags: ["ram", "ddr4", "laptop", "sodimm"],
    title: "32 GB DDR4 Laptop SODIMM Kit"
  },
  {
    category: "gpu",
    compatibleSlotIds: ["gpu"],
    condition: "good",
    facts: {
      boardPowerWatts: 200,
      gpuLengthMm: 242,
      gpuSlotHeight: "full-height",
      requiredPcieGeneration: 3,
      requiredPowerConnectors: ["8-pin"]
    },
    id: "gpu-rtx-3060ti-component",
    location: "Portland, OR",
    price: 245,
    recommendedUseCases: ["gaming", "ai", "engineering"],
    riskNotes: ["Ask whether it was mined on and request fan behavior under load."],
    sourceListingId: "gpu-rtx-3060ti",
    summary: "Efficient CUDA-capable GPU for gaming, CAD viewport work, and experiments.",
    tags: ["gpu", "rtx", "cuda", "component"],
    title: "NVIDIA RTX 3060 Ti"
  },
  {
    category: "gpu",
    compatibleSlotIds: ["gpu"],
    condition: "fair",
    facts: {
      boardPowerWatts: 230,
      gpuLengthMm: 305,
      gpuSlotHeight: "full-height",
      requiredPcieGeneration: 4,
      requiredPowerConnectors: ["8-pin", "6-pin"]
    },
    id: "gpu-rx-6700xt-component",
    location: "San Diego, CA",
    price: 230,
    recommendedUseCases: ["gaming", "general"],
    riskNotes: ["Triple-fan cards need case length, slot width, and sag checks."],
    sourceListingId: "gpu-rx-6700xt",
    summary: "High-value raster gaming GPU with larger physical fit requirements.",
    tags: ["gpu", "radeon", "rx 6700 xt", "triple fan"],
    title: "Radeon RX 6700 XT Triple-Fan"
  },
  {
    category: "psu",
    compatibleSlotIds: ["psu"],
    condition: "good",
    facts: {
      psuConnectors: ["24-pin", "8-pin-cpu", "8-pin", "6-pin"],
      wattage: 650
    },
    id: "psu-650w-gold",
    location: "Online shipping",
    price: 70,
    recommendedUseCases: ["gaming", "engineering", "general"],
    riskNotes: ["Avoid unknown used PSUs without clear model and age."],
    summary: "Mainstream modular power supply with enough GPU connector coverage.",
    tags: ["psu", "650w", "gold", "atx"],
    title: "650 W 80+ Gold ATX PSU"
  },
  {
    category: "psu",
    compatibleSlotIds: ["psu"],
    condition: "good",
    facts: {
      psuConnectors: ["24-pin", "8-pin-cpu"],
      wattage: 300
    },
    id: "psu-300w-oem-sff",
    location: "Austin, TX",
    price: 32,
    recommendedUseCases: ["general", "homelab"],
    riskNotes: ["Not suitable for high-power GPUs without an external power path."],
    summary: "OEM SFF power supply for low-power office builds.",
    tags: ["psu", "sff", "oem", "low power"],
    title: "300 W OEM SFF PSU"
  },
  {
    category: "storage",
    compatibleSlotIds: ["storage", "additional-storage"],
    condition: "excellent",
    facts: {
      m2SlotsUsed: 1,
      sataPortsUsed: 0
    },
    id: "storage-1tb-nvme",
    location: "Online shipping",
    price: 58,
    recommendedUseCases: ["gaming", "engineering", "programming", "general"],
    riskNotes: ["Ask for SMART health if used."],
    summary: "Fast primary boot drive for most desktop and workstation projects.",
    tags: ["storage", "nvme", "ssd", "1tb"],
    title: "1 TB NVMe SSD"
  },
  {
    category: "storage",
    compatibleSlotIds: ["storage", "additional-storage"],
    condition: "good",
    facts: {
      m2SlotsUsed: 0,
      sataPortsUsed: 1
    },
    id: "storage-2tb-sata-ssd",
    location: "Seattle, WA",
    price: 82,
    recommendedUseCases: ["engineering", "general", "homelab"],
    riskNotes: ["Confirm SMART health and power-on hours."],
    summary: "Large SATA SSD for project files, game libraries, or scratch storage.",
    tags: ["storage", "sata", "ssd", "2tb"],
    title: "2 TB SATA SSD"
  },
  {
    category: "operating-system",
    compatibleSlotIds: ["operating-system"],
    condition: "excellent",
    facts: {},
    id: "os-windows-11-pro",
    location: "Digital",
    price: 35,
    recommendedUseCases: ["gaming", "cad", "engineering", "general"],
    riskNotes: ["Confirm licensing path and activation legitimacy."],
    summary: "Windows license placeholder for CAD, gaming, and common workstation software.",
    tags: ["os", "windows", "license"],
    title: "Windows 11 Pro License Plan"
  },
  {
    category: "operating-system",
    compatibleSlotIds: ["operating-system"],
    condition: "excellent",
    facts: {},
    id: "os-linux",
    location: "Digital",
    price: 0,
    recommendedUseCases: ["programming", "ai", "homelab", "engineering"],
    riskNotes: ["Confirm application compatibility before committing to Linux."],
    summary: "Linux install plan for programming, AI experiments, and homelab work.",
    tags: ["os", "linux", "ubuntu"],
    title: "Ubuntu Linux Install Plan"
  },
  {
    category: "egpu-dock",
    compatibleSlotIds: ["egpu-dock", "gpu"],
    condition: "good",
    facts: {
      requiredPowerConnectors: ["8-pin"],
      wattage: 550
    },
    id: "egpu-razer-core-x",
    location: "Los Angeles, CA",
    price: 180,
    recommendedUseCases: ["ai", "gaming", "engineering"],
    riskNotes: ["Requires a compatible Thunderbolt laptop and realistic bandwidth expectations."],
    summary: "External GPU dock for laptop-based solution paths.",
    tags: ["egpu", "dock", "thunderbolt", "adapter"],
    title: "Razer Core X eGPU Dock"
  },
  {
    category: "external-psu",
    compatibleSlotIds: ["external-psu", "psu"],
    condition: "good",
    facts: {
      psuConnectors: ["8-pin", "6-pin"],
      wattage: 500
    },
    id: "external-psu-500w-gpu",
    location: "Online shipping",
    price: 60,
    recommendedUseCases: ["ai", "gaming", "general"],
    riskNotes: ["External GPU power paths need careful enclosure and grounding review."],
    summary: "External PSU path for eGPU or adapter-based GPU projects.",
    tags: ["external psu", "gpu power", "adapter"],
    title: "500 W External GPU PSU"
  },
  {
    category: "thunderbolt-adapter",
    compatibleSlotIds: ["thunderbolt-adapter"],
    condition: "good",
    facts: {},
    id: "adapter-thunderbolt-4",
    location: "Online shipping",
    price: 45,
    recommendedUseCases: ["ai", "engineering", "general"],
    riskNotes: ["Host laptop must support the required Thunderbolt generation and firmware settings."],
    summary: "Thunderbolt adapter for dock and external PCIe workflows.",
    tags: ["thunderbolt", "adapter", "dock"],
    title: "Thunderbolt 4 Adapter"
  },
  {
    category: "pcie-adapter",
    compatibleSlotIds: ["pcie-adapter"],
    condition: "good",
    facts: {},
    id: "adapter-pcie-riser",
    location: "Online shipping",
    price: 30,
    recommendedUseCases: ["homelab", "ai", "engineering"],
    riskNotes: ["Risers can introduce signal stability and physical mounting risk."],
    summary: "PCIe riser or adapter path for unusual chassis and workstation layouts.",
    tags: ["pcie", "riser", "adapter"],
    title: "PCIe 4.0 Riser Adapter"
  },
  {
    category: "laptop-ram-dimm-adapter",
    compatibleSlotIds: ["laptop-ram-dimm-adapter", "ram"],
    condition: "fair",
    facts: {
      ramType: "DDR4"
    },
    id: "adapter-sodimm-to-dimm-ddr4",
    location: "Online shipping",
    price: 18,
    recommendedUseCases: ["general", "homelab"],
    riskNotes: ["Niche adapter path; validate board clearance, voltage, and memory support first."],
    summary: "Adapter path for reusing DDR4 laptop memory in a desktop-style project.",
    tags: ["ram adapter", "sodimm", "dimm", "ddr4"],
    title: "DDR4 SODIMM to DIMM Adapter"
  }
];
