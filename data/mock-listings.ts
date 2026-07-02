import type { HardwareListing } from "@/types/hardware";

export const mockHardwareListings: HardwareListing[] = [
  {
    id: "gaming-r5-rtx3060",
    title: "Ryzen 5 Gaming Tower with RTX 3060",
    summary:
      "Balanced 1080p and light 1440p gaming tower with modern platform basics and a clean upgrade path.",
    price: 620,
    predictedNegotiatedPrice: 560,
    formFactor: "desktop",
    condition: "good",
    location: "Phoenix, AZ",
    recommendedUseCase: "gaming",
    recommendedUseCases: ["gaming", "general"],
    weightClass: "Mid tower",
    scores: {
      performance: 78,
      value: 88,
      reliability: 82,
      aesthetic: 74,
      upgradePotential: 84,
      sleeper: 62
    },
    riskNotes: [
      "Confirm PSU brand and wattage before buying.",
      "Ask for a current GPU stress test screenshot."
    ],
    specs: {
      CPU: "Ryzen 5 5600",
      GPU: "RTX 3060 12 GB",
      Memory: "16 GB DDR4",
      Storage: "1 TB NVMe"
    },
    tags: ["gaming pc", "rtx 3060", "ryzen", "mid tower"]
  },
  {
    id: "gaming-i7-1080ti",
    title: "i7 Tower with GTX 1080 Ti",
    summary:
      "Older high-end gaming build that still has useful raster performance if thermals check out.",
    price: 480,
    predictedNegotiatedPrice: 425,
    formFactor: "desktop",
    condition: "fair",
    location: "Denver, CO",
    recommendedUseCase: "gaming",
    recommendedUseCases: ["gaming", "general"],
    weightClass: "Full tower",
    scores: {
      performance: 72,
      value: 82,
      reliability: 64,
      aesthetic: 58,
      upgradePotential: 61,
      sleeper: 67
    },
    riskNotes: [
      "GTX 1080 Ti age increases fan and thermal pad risk.",
      "Platform has limited future CPU upgrade room."
    ],
    specs: {
      CPU: "Core i7-8700K",
      GPU: "GTX 1080 Ti 11 GB",
      Memory: "32 GB DDR4",
      Storage: "512 GB SSD + 2 TB HDD"
    },
    tags: ["gaming pc", "1080 ti", "older flagship", "fair condition"]
  },
  {
    id: "thinkstation-p520-sleeper",
    title: "Lenovo ThinkStation P520 Sleeper Base",
    summary:
      "Quiet workstation chassis with ECC memory and enough room to become a serious GPU sleeper.",
    price: 390,
    predictedNegotiatedPrice: 335,
    formFactor: "workstation",
    condition: "good",
    location: "Dallas, TX",
    recommendedUseCase: "engineering",
    recommendedUseCases: ["engineering", "cad", "ai", "general", "homelab"],
    weightClass: "Heavy workstation",
    scores: {
      performance: 70,
      value: 91,
      reliability: 86,
      aesthetic: 69,
      upgradePotential: 93,
      sleeper: 96
    },
    riskNotes: [
      "Verify BIOS is not locked by an enterprise asset policy.",
      "Check GPU power connectors before planning an upgrade."
    ],
    specs: {
      CPU: "Xeon W-2135",
      GPU: "Quadro P2000",
      Memory: "64 GB ECC DDR4",
      Storage: "1 TB NVMe"
    },
    tags: ["thinkstation", "sleeper build", "workstation", "ecc"]
  },
  {
    id: "thinkstation-p330-tiny",
    title: "ThinkStation P330 Tiny CAD Box",
    summary:
      "Compact workstation candidate for light CAD, office engineering work, and lab desk setups.",
    price: 310,
    predictedNegotiatedPrice: 275,
    formFactor: "workstation",
    condition: "excellent",
    location: "Chicago, IL",
    recommendedUseCase: "cad",
    recommendedUseCases: ["cad", "engineering", "general", "homelab"],
    weightClass: "Tiny workstation",
    scores: {
      performance: 58,
      value: 79,
      reliability: 90,
      aesthetic: 83,
      upgradePotential: 49,
      sleeper: 72
    },
    riskNotes: [
      "Tiny chassis limits GPU and storage expansion.",
      "Confirm included power brick wattage."
    ],
    specs: {
      CPU: "Core i7-9700T",
      GPU: "Quadro P620",
      Memory: "32 GB DDR4",
      Storage: "512 GB NVMe"
    },
    tags: ["thinkstation", "tiny", "cad", "small workstation"]
  },
  {
    id: "hp-z440-render-node",
    title: "HP Z440 Budget Render Node",
    summary:
      "Low-cost workstation platform for experiments, render queue duty, or a careful GPU upgrade.",
    price: 260,
    predictedNegotiatedPrice: 220,
    formFactor: "workstation",
    condition: "fair",
    location: "Seattle, WA",
    recommendedUseCase: "engineering",
    recommendedUseCases: ["engineering", "cad", "general", "homelab"],
    weightClass: "Heavy workstation",
    scores: {
      performance: 55,
      value: 84,
      reliability: 72,
      aesthetic: 52,
      upgradePotential: 77,
      sleeper: 88
    },
    riskNotes: [
      "Older DDR4 ECC platform may need BIOS updates.",
      "Check front USB ports and workstation fan noise."
    ],
    specs: {
      CPU: "Xeon E5-1650 v4",
      GPU: "Quadro M2000",
      Memory: "48 GB ECC DDR4",
      Storage: "512 GB SATA SSD"
    },
    tags: ["hp z440", "sleeper build", "render", "workstation"]
  },
  {
    id: "optiplex-7060-sff",
    title: "Dell OptiPlex 7060 SFF Office PC",
    summary:
      "Dependable small office desktop with enough CPU for general productivity and light lab use.",
    price: 185,
    predictedNegotiatedPrice: 155,
    formFactor: "desktop",
    condition: "good",
    location: "Austin, TX",
    recommendedUseCase: "general",
    recommendedUseCases: ["general", "engineering", "homelab"],
    weightClass: "Small form factor",
    scores: {
      performance: 46,
      value: 76,
      reliability: 88,
      aesthetic: 71,
      upgradePotential: 45,
      sleeper: 54
    },
    riskNotes: [
      "SFF chassis limits GPU choices.",
      "Confirm Windows license and SSD health."
    ],
    specs: {
      CPU: "Core i5-8500",
      GPU: "Intel UHD 630",
      Memory: "16 GB DDR4",
      Storage: "512 GB SSD"
    },
    tags: ["optiplex", "office pc", "sff", "general"]
  },
  {
    id: "optiplex-9020-mt-1650",
    title: "OptiPlex 9020 MT with GTX 1650",
    summary:
      "Classic budget gaming conversion with a modest GPU and enough room to keep repairs simple.",
    price: 240,
    predictedNegotiatedPrice: 205,
    formFactor: "desktop",
    condition: "fair",
    location: "Las Vegas, NV",
    recommendedUseCase: "gaming",
    recommendedUseCases: ["gaming", "general", "homelab"],
    weightClass: "Mini tower",
    scores: {
      performance: 49,
      value: 73,
      reliability: 63,
      aesthetic: 47,
      upgradePotential: 56,
      sleeper: 81
    },
    riskNotes: [
      "Old Haswell platform is near the end of practical upgrades.",
      "Inspect PSU adapter quality if the stock PSU was modified."
    ],
    specs: {
      CPU: "Core i7-4790",
      GPU: "GTX 1650 4 GB",
      Memory: "16 GB DDR3",
      Storage: "480 GB SSD"
    },
    tags: ["optiplex", "budget gaming", "sleeper", "mini tower"]
  },
  {
    id: "thinkpad-p1-gen4",
    title: "ThinkPad P1 Gen 4 Mobile Workstation",
    summary:
      "Premium mobile workstation for CAD review, engineering travel, and general power-user work.",
    price: 920,
    predictedNegotiatedPrice: 830,
    formFactor: "laptop",
    condition: "good",
    location: "Online shipping",
    recommendedUseCase: "cad",
    recommendedUseCases: ["cad", "engineering", "general"],
    weightClass: "Thin workstation laptop",
    scores: {
      performance: 76,
      value: 72,
      reliability: 78,
      aesthetic: 86,
      upgradePotential: 51,
      sleeper: 43
    },
    riskNotes: [
      "Ask for battery cycle count and charger details.",
      "Confirm display resolution and GPU variant."
    ],
    specs: {
      CPU: "Core i7-11850H",
      GPU: "RTX A2000 Laptop",
      Memory: "32 GB DDR4",
      Storage: "1 TB NVMe"
    },
    tags: ["thinkpad", "mobile workstation", "cad", "laptop"]
  },
  {
    id: "rog-g14-rtx4060",
    title: "ASUS ROG Zephyrus G14 RTX 4060",
    summary:
      "Portable gaming laptop with strong performance per pound and modern efficiency.",
    price: 850,
    predictedNegotiatedPrice: 775,
    formFactor: "laptop",
    condition: "excellent",
    location: "Los Angeles, CA",
    recommendedUseCase: "gaming",
    recommendedUseCases: ["gaming", "ai", "general"],
    weightClass: "Portable gaming laptop",
    scores: {
      performance: 81,
      value: 77,
      reliability: 74,
      aesthetic: 91,
      upgradePotential: 44,
      sleeper: 38
    },
    riskNotes: [
      "Gaming laptops need thermal and battery checks.",
      "Confirm original charger and no liquid exposure."
    ],
    specs: {
      CPU: "Ryzen 9 7940HS",
      GPU: "RTX 4060 Laptop",
      Memory: "16 GB DDR5",
      Storage: "1 TB NVMe"
    },
    tags: ["gaming laptop", "rtx 4060", "portable", "ai"]
  },
  {
    id: "gpu-rtx-3060ti",
    title: "NVIDIA RTX 3060 Ti Founders Edition",
    summary:
      "Strong used GPU option for 1440p gaming, CUDA experiments, and workstation upgrades.",
    price: 245,
    predictedNegotiatedPrice: 220,
    formFactor: "component",
    condition: "good",
    location: "Portland, OR",
    recommendedUseCase: "gaming",
    recommendedUseCases: ["gaming", "ai", "engineering"],
    weightClass: "Dual-slot GPU",
    scores: {
      performance: 74,
      value: 86,
      reliability: 76,
      aesthetic: 82,
      upgradePotential: 71,
      sleeper: 66
    },
    riskNotes: [
      "Ask whether the card was mined on.",
      "Request a video showing fan behavior under load."
    ],
    specs: {
      GPU: "RTX 3060 Ti 8 GB",
      Power: "200 W board power",
      Outputs: "3x DisplayPort, 1x HDMI",
      Length: "242 mm"
    },
    tags: ["gpu", "rtx 3060 ti", "cuda", "component"]
  },
  {
    id: "gpu-rx-6700xt",
    title: "Radeon RX 6700 XT Triple-Fan GPU",
    summary:
      "High-value raster gaming GPU if the cooler and memory temperatures are healthy.",
    price: 230,
    predictedNegotiatedPrice: 205,
    formFactor: "component",
    condition: "fair",
    location: "San Diego, CA",
    recommendedUseCase: "gaming",
    recommendedUseCases: ["gaming", "general"],
    weightClass: "Long triple-slot GPU",
    scores: {
      performance: 75,
      value: 89,
      reliability: 68,
      aesthetic: 77,
      upgradePotential: 68,
      sleeper: 59
    },
    riskNotes: [
      "Triple-fan cards can sag in office PC conversions.",
      "Confirm no hotspot throttling after a benchmark run."
    ],
    specs: {
      GPU: "RX 6700 XT 12 GB",
      Power: "230 W board power",
      Outputs: "DisplayPort + HDMI",
      Length: "305 mm"
    },
    tags: ["gpu", "rx 6700 xt", "component", "value"]
  },
  {
    id: "broken-alienware-aurora",
    title: "Alienware Aurora R10 No Boot",
    summary:
      "Repair-risk gaming tower that could be useful for parts, but only with a large discount.",
    price: 360,
    predictedNegotiatedPrice: 240,
    formFactor: "desktop",
    condition: "broken",
    location: "Orlando, FL",
    recommendedUseCase: "gaming",
    recommendedUseCases: ["gaming", "general"],
    weightClass: "Repair-risk desktop",
    scores: {
      performance: 66,
      value: 43,
      reliability: 22,
      aesthetic: 68,
      upgradePotential: 39,
      sleeper: 31
    },
    riskNotes: [
      "No-boot systems can hide motherboard, PSU, or GPU failure.",
      "Only consider if the GPU and CPU can be independently verified."
    ],
    specs: {
      CPU: "Ryzen 7 5800",
      GPU: "RTX 3070 listed, unverified",
      Memory: "16 GB DDR4",
      Storage: "Unknown"
    },
    tags: ["broken", "for parts", "repair risk", "alienware"]
  },
  {
    id: "broken-macbook-pro-board",
    title: "MacBook Pro 16 Water Damage Parts Unit",
    summary:
      "Laptop parts listing with high uncertainty and value mostly in screen, chassis, and salvage parts.",
    price: 420,
    predictedNegotiatedPrice: 275,
    formFactor: "laptop",
    condition: "broken",
    location: "Online shipping",
    recommendedUseCase: "general",
    recommendedUseCases: ["general"],
    weightClass: "Parts laptop",
    scores: {
      performance: 41,
      value: 28,
      reliability: 12,
      aesthetic: 72,
      upgradePotential: 18,
      sleeper: 9
    },
    riskNotes: [
      "Water damage can make every board-level part suspect.",
      "Not a good candidate unless buying specifically for parts."
    ],
    specs: {
      CPU: "Apple M1 Pro",
      GPU: "Integrated",
      Memory: "Unknown",
      Storage: "Removed"
    },
    tags: ["broken", "for parts", "repair risk", "laptop"]
  }
];
