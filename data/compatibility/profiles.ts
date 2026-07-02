import { evaluateCompatibility } from "@/lib/compatibility-engine/engine";
import type {
  ChassisSpec,
  CompatibilityProfile,
  CoolerSpec,
  CpuSpec,
  GpuSpec,
  MemorySpec,
  MotherboardSpec,
  PsuSpec,
  StorageSpec
} from "@/types/compatibility";

const cpus = {
  i5_8500: { generation: "Coffee Lake", model: "Core i5-8500", socket: "LGA1151", tdpWatts: 65, year: 2018 },
  i7_4790: { generation: "Haswell", model: "Core i7-4790", socket: "LGA1150", tdpWatts: 84, year: 2014 },
  i7_8700k: { generation: "Coffee Lake", model: "Core i7-8700K", socket: "LGA1151", tdpWatts: 95, year: 2017 },
  i7_9700t: { generation: "Coffee Lake Refresh", model: "Core i7-9700T", socket: "LGA1151", tdpWatts: 35, year: 2019 },
  i7_11850h: { generation: "Tiger Lake", model: "Core i7-11850H", socket: "BGA1787", tdpWatts: 45, year: 2021 },
  m1Pro: { generation: "Apple Silicon", model: "Apple M1 Pro", socket: "Apple SoC", tdpWatts: 35, year: 2021 },
  ryzen5600: { generation: "Zen 3", model: "Ryzen 5 5600", socket: "AM4", tdpWatts: 65, year: 2022 },
  ryzen5800: { generation: "Zen 3", model: "Ryzen 7 5800", socket: "AM4", tdpWatts: 65, year: 2021 },
  ryzen7940hs: { generation: "Zen 4 Mobile", model: "Ryzen 9 7940HS", socket: "FP8", tdpWatts: 45, year: 2023 },
  xeonE5_1650v4: { generation: "Broadwell-EP", model: "Xeon E5-1650 v4", socket: "LGA2011-3", tdpWatts: 140, year: 2016 },
  xeonW2135: { generation: "Skylake-W", model: "Xeon W-2135", socket: "LGA2066", tdpWatts: 140, year: 2017 }
} satisfies Record<string, CpuSpec>;

const gpus = {
  gtx1080ti: {
    height: "full-height",
    lengthMm: 267,
    model: "GTX 1080 Ti",
    pcieVersion: 3,
    powerConnectors: { "8-pin": 1, "6-pin": 1 },
    powerWatts: 250,
    recommendedPsuWatts: 600,
    slotWidth: 2
  },
  gtx1650LowProfile: {
    height: "low-profile",
    lengthMm: 170,
    model: "GTX 1650 Low Profile",
    pcieVersion: 3,
    powerConnectors: {},
    powerWatts: 75,
    recommendedPsuWatts: 300,
    slotWidth: 1
  },
  quadroM2000: {
    height: "full-height",
    lengthMm: 168,
    model: "Quadro M2000",
    pcieVersion: 3,
    powerConnectors: {},
    powerWatts: 75,
    recommendedPsuWatts: 300,
    slotWidth: 1
  },
  quadroP2000: {
    height: "full-height",
    lengthMm: 200,
    model: "Quadro P2000",
    pcieVersion: 3,
    powerConnectors: {},
    powerWatts: 75,
    recommendedPsuWatts: 300,
    slotWidth: 1
  },
  quadroP620: {
    height: "low-profile",
    lengthMm: 145,
    model: "Quadro P620",
    pcieVersion: 3,
    powerConnectors: {},
    powerWatts: 40,
    recommendedPsuWatts: 250,
    slotWidth: 1
  },
  rtx3060: {
    height: "full-height",
    lengthMm: 242,
    model: "RTX 3060 12 GB",
    pcieVersion: 4,
    powerConnectors: { "8-pin": 1 },
    powerWatts: 170,
    recommendedPsuWatts: 550,
    slotWidth: 2
  },
  rtx3060ti: {
    height: "full-height",
    lengthMm: 242,
    model: "RTX 3060 Ti",
    pcieVersion: 4,
    powerConnectors: { "8-pin": 1 },
    powerWatts: 200,
    recommendedPsuWatts: 600,
    slotWidth: 2
  },
  rtx3070: {
    height: "full-height",
    lengthMm: 267,
    model: "RTX 3070",
    pcieVersion: 4,
    powerConnectors: { "8-pin": 1 },
    powerWatts: 220,
    recommendedPsuWatts: 650,
    slotWidth: 2
  },
  rtx4060Laptop: {
    height: "full-height",
    lengthMm: 0,
    model: "RTX 4060 Laptop",
    pcieVersion: 4,
    powerConnectors: {},
    powerWatts: 115,
    recommendedPsuWatts: 0,
    slotWidth: 0
  },
  rtxA2000Laptop: {
    height: "full-height",
    lengthMm: 0,
    model: "RTX A2000 Laptop",
    pcieVersion: 4,
    powerConnectors: {},
    powerWatts: 65,
    recommendedPsuWatts: 0,
    slotWidth: 0
  },
  rx6700xt: {
    height: "full-height",
    lengthMm: 305,
    model: "Radeon RX 6700 XT",
    pcieVersion: 4,
    powerConnectors: { "8-pin": 1, "6-pin": 1 },
    powerWatts: 230,
    recommendedPsuWatts: 650,
    slotWidth: 3
  }
} satisfies Record<string, GpuSpec>;

const motherboards = {
  alienwareAm4: motherboard("Alienware AM4 board", "AM4", "B550 OEM", ["Zen 2", "Zen 3"], "DDR4", 128, 4, 2, 4, 2021, 4, "A25"),
  am4B550: motherboard("B550 ATX", "AM4", "B550", ["Zen 2", "Zen 3"], "DDR4", 128, 4, 2, 6, 2021, 4, "P2.40"),
  appleM1: motherboard("Apple M1 Pro logic board", "Apple SoC", "Apple Silicon", ["Apple Silicon"], "LPDDR5", 64, 0, 0, 0, 2021, 4, "macOS firmware"),
  dell7060: motherboard("Dell Q370 SFF", "LGA1151", "Q370", ["Coffee Lake", "Coffee Lake Refresh"], "DDR4", 64, 4, 1, 3, 2018, 3, "1.28.0", "low-profile"),
  haswellDell: motherboard("Dell Q87 MT", "LGA1150", "Q87", ["Haswell"], "DDR3", 32, 4, 1, 4, 2014, 3, "A25"),
  hpZ440: motherboard("HP Z440 C612", "LGA2011-3", "C612", ["Haswell-EP", "Broadwell-EP"], "DDR4", 128, 8, 1, 6, 2016, 3, "2.61"),
  laptopTigerLake: motherboard("ThinkPad P1 Gen 4 board", "BGA1787", "WM590", ["Tiger Lake"], "DDR4", 64, 2, 2, 0, 2021, 4, "1.32"),
  laptopZen4: motherboard("ROG G14 2023 board", "FP8", "AMD FP8", ["Zen 4 Mobile"], "DDR5", 32, 2, 2, 0, 2023, 4, "GA402XV.313"),
  p330Tiny: motherboard("ThinkStation P330 Tiny board", "LGA1151", "Q370 Tiny", ["Coffee Lake", "Coffee Lake Refresh"], "DDR4", 64, 2, 2, 0, 2019, 3, "M1VKT75A", "low-profile"),
  p520: motherboard("Lenovo P520 C422", "LGA2066", "C422", ["Skylake-W"], "DDR4", 256, 8, 2, 6, 2017, 3, "S03KT64A")
} satisfies Record<string, MotherboardSpec>;

const chassis = {
  alienware: chassisSpec("Alienware Aurora R10 chassis", "desktop", 267, "full-height", 2.5, 120, 2),
  fullTower: chassisSpec("Full tower", "desktop", 330, "full-height", 3, 170, 4),
  gpuOnly: chassisSpec("Open component bench", "component", 360, "full-height", 3, 160, 5),
  laptop: chassisSpec("Laptop chassis", "laptop", 0, "full-height", 0, 0, 3),
  midTower: chassisSpec("Mesh mid tower", "desktop", 320, "full-height", 2.5, 165, 4),
  miniTower: chassisSpec("Dell mini tower", "desktop", 220, "full-height", 2, 95, 2),
  p330Tiny: chassisSpec("ThinkStation Tiny chassis", "workstation", 150, "low-profile", 1, 45, 2),
  sff: chassisSpec("Dell OptiPlex SFF chassis", "desktop", 180, "low-profile", 1, 65, 2),
  workstation: chassisSpec("Lenovo workstation tower", "workstation", 320, "full-height", 2.5, 160, 3),
  z440: chassisSpec("HP Z440 tower", "workstation", 280, "full-height", 2, 155, 3)
} satisfies Record<string, ChassisSpec>;

const psus = {
  alienware550: psu("Alienware 550W OEM", 550, { "8-pin": 1 }),
  componentBench650: psu("650W bench PSU", 650, { "8-pin": 2, "6-pin": 2 }),
  laptopBrick: psu("Laptop power system", 180, {}),
  macbookBoard: psu("MacBook integrated power system", 140, {}),
  optiplex200: psu("Dell 200W SFF PSU", 200, {}),
  optiplex290: psu("Dell 290W MT PSU", 290, {}),
  tower650: psu("650W Bronze PSU", 650, { "8-pin": 2, "6-pin": 1 }),
  workstation490: psu("490W workstation PSU", 490, { "8-pin": 1 }),
  workstation685: psu("685W workstation PSU", 685, { "8-pin": 2, "6-pin": 1 }),
  z440525: psu("525W HP workstation PSU", 525, { "6-pin": 1 })
} satisfies Record<string, PsuSpec>;

export const mockCompatibilityProfiles: Record<string, CompatibilityProfile> = {
  "broken-alienware-aurora": profile("broken-alienware-aurora", "Alienware Aurora R10 No Boot", cpus.ryzen5800, motherboards.alienwareAm4, gpus.rtx3070, chassis.alienware, psus.alienware550, memory("DDR4", 16, 2), storage("NVMe unknown", "m2-nvme"), cooler("Alienware 120mm liquid cooler", 65, 125), "gaming"),
  "broken-macbook-pro-board": profile("broken-macbook-pro-board", "MacBook Pro 16 Water Damage Parts Unit", cpus.m1Pro, motherboards.appleM1, null, chassis.laptop, psus.macbookBoard, memory("LPDDR5", 16, 0), storage("Removed storage", "m2-nvme"), cooler("Apple vapor chamber", 0, 80), "general"),
  "gaming-i7-1080ti": profile("gaming-i7-1080ti", "i7 Tower with GTX 1080 Ti", cpus.i7_8700k, motherboards.dell7060, gpus.gtx1080ti, chassis.fullTower, psus.tower650, memory("DDR4", 32, 4), storage("512GB SSD", "sata-2.5"), cooler("120mm tower cooler", 150, 150), "gaming"),
  "gaming-r5-rtx3060": profile("gaming-r5-rtx3060", "Ryzen 5 Gaming Tower with RTX 3060", cpus.ryzen5600, motherboards.am4B550, gpus.rtx3060, chassis.midTower, psus.tower650, memory("DDR4", 16, 2), storage("1TB NVMe", "m2-nvme"), cooler("AMD Wraith tower", 120, 95), "gaming"),
  "gpu-rtx-3060ti": componentProfile("gpu-rtx-3060ti", "NVIDIA RTX 3060 Ti Founders Edition", gpus.rtx3060ti),
  "gpu-rx-6700xt": componentProfile("gpu-rx-6700xt", "Radeon RX 6700 XT Triple-Fan GPU", gpus.rx6700xt),
  "hp-z440-render-node": profile("hp-z440-render-node", "HP Z440 Budget Render Node", cpus.xeonE5_1650v4, motherboards.hpZ440, gpus.quadroM2000, chassis.z440, psus.z440525, memory("DDR4", 48, 6), storage("512GB SATA SSD", "sata-2.5"), cooler("HP workstation cooler", 120, 150), "engineering"),
  "optiplex-7060-sff": profile("optiplex-7060-sff", "Dell OptiPlex 7060 SFF Office PC", cpus.i5_8500, motherboards.dell7060, null, chassis.sff, psus.optiplex200, memory("DDR4", 16, 2), storage("512GB SSD", "sata-2.5"), cooler("Dell SFF blower", 45, 65), "general", { additionalM2Drives: 0, additionalRamGb: 16, additionalSataDrives: 1, gpu: gpus.gtx1650LowProfile }),
  "optiplex-9020-mt-1650": profile("optiplex-9020-mt-1650", "OptiPlex 9020 MT with GTX 1650", cpus.i7_4790, motherboards.haswellDell, gpus.gtx1650LowProfile, chassis.miniTower, psus.optiplex290, memory("DDR3", 16, 4), storage("480GB SSD", "sata-2.5"), cooler("Dell tower cooler", 80, 95), "gaming"),
  "rog-g14-rtx4060": profile("rog-g14-rtx4060", "ASUS ROG Zephyrus G14 RTX 4060", cpus.ryzen7940hs, motherboards.laptopZen4, gpus.rtx4060Laptop, chassis.laptop, psus.laptopBrick, memory("DDR5", 16, 2), storage("1TB NVMe", "m2-nvme"), cooler("Laptop vapor chamber", 0, 125), "gaming"),
  "thinkpad-p1-gen4": profile("thinkpad-p1-gen4", "ThinkPad P1 Gen 4 Mobile Workstation", cpus.i7_11850h, motherboards.laptopTigerLake, gpus.rtxA2000Laptop, chassis.laptop, psus.laptopBrick, memory("DDR4", 32, 2), storage("1TB NVMe", "m2-nvme"), cooler("ThinkPad dual fan cooler", 0, 95), "cad"),
  "thinkstation-p330-tiny": profile("thinkstation-p330-tiny", "ThinkStation P330 Tiny CAD Box", cpus.i7_9700t, motherboards.p330Tiny, gpus.quadroP620, chassis.p330Tiny, psus.laptopBrick, memory("DDR4", 32, 2), storage("512GB NVMe", "m2-nvme"), cooler("Tiny blower cooler", 40, 65), "cad"),
  "thinkstation-p520-sleeper": profile("thinkstation-p520-sleeper", "Lenovo ThinkStation P520 Sleeper Base", cpus.xeonW2135, motherboards.p520, gpus.quadroP2000, chassis.workstation, psus.workstation685, memory("DDR4", 64, 4), storage("1TB NVMe", "m2-nvme"), cooler("Lenovo workstation tower cooler", 140, 180), "engineering", { additionalM2Drives: 1, additionalRamGb: 64, additionalSataDrives: 1, gpu: gpus.rtx3070 })
};

export function getCompatibilityProfileForListingId(listingId: string) {
  return mockCompatibilityProfiles[listingId] ?? null;
}

export function getCompatibilityReportForListingId(listingId: string) {
  const compatibilityProfile = getCompatibilityProfileForListingId(listingId);

  return compatibilityProfile ? evaluateCompatibility(compatibilityProfile) : null;
}

function motherboard(
  model: string,
  socket: string,
  chipset: string,
  supportedCpuGenerations: string[],
  ramType: MotherboardSpec["ramType"],
  maxRamGb: number,
  ramSlots: number,
  m2Slots: number,
  sataPorts: number,
  platformYear: number,
  pcieVersion: number,
  biosGeneration: string,
  pcieHeight: MotherboardSpec["pcieSlots"][number]["height"] = "full-height"
): MotherboardSpec {
  return {
    biosGeneration,
    chipset,
    formFactor: pcieHeight === "low-profile" ? "SFF" : "ATX",
    m2Slots,
    maxRamGb,
    model,
    occupiedM2Slots: 1,
    occupiedRamSlots: Math.min(2, ramSlots),
    occupiedSataPorts: 1,
    pcieSlots: [{ height: pcieHeight, lanes: 16, version: pcieVersion }],
    platformYear,
    ramSlots,
    ramType,
    sataPorts,
    socket,
    supportedCpuGenerations,
    supportedStorageInterfaces: ["m2-nvme", "sata-2.5", "sata-3.5"]
  };
}

function chassisSpec(
  model: string,
  formFactor: ChassisSpec["formFactor"],
  maxGpuLengthMm: number,
  maxGpuHeight: ChassisSpec["maxGpuHeight"],
  maxGpuSlotWidth: number,
  maxCoolerHeightMm: number,
  airflowRating: ChassisSpec["airflowRating"]
): ChassisSpec {
  return {
    airflowRating,
    formFactor,
    maxCoolerHeightMm,
    maxGpuHeight,
    maxGpuLengthMm,
    maxGpuSlotWidth,
    model
  };
}

function psu(
  model: string,
  wattage: number,
  availableConnectors: PsuSpec["availableConnectors"]
): PsuSpec {
  return { availableConnectors, model, wattage };
}

function memory(type: MemorySpec["type"], capacityGb: number, sticks: number): MemorySpec {
  return { capacityGb, sticks, type };
}

function storage(label: string, storageInterface: StorageSpec["drives"][number]["interface"]): StorageSpec {
  return {
    drives: [{ interface: storageInterface, label }]
  };
}

function cooler(model: string, heightMm: number, tdpRatingWatts: number): CoolerSpec {
  return { heightMm, model, tdpRatingWatts };
}

function profile(
  id: string,
  title: string,
  cpu: CpuSpec,
  motherboardSpec: MotherboardSpec,
  gpu: GpuSpec | null,
  chassisDefinition: ChassisSpec,
  psuSpec: PsuSpec,
  memorySpec: MemorySpec,
  storageSpec: StorageSpec,
  coolerSpec: CoolerSpec,
  primaryUseCase: CompatibilityProfile["primaryUseCase"],
  upgradePlan?: CompatibilityProfile["upgradePlan"]
): CompatibilityProfile {
  return {
    chassis: chassisDefinition,
    cooler: coolerSpec,
    cpu,
    formFactor: chassisDefinition.formFactor,
    gpu,
    id,
    memory: memorySpec,
    motherboard: motherboardSpec,
    primaryUseCase,
    psu: psuSpec,
    storage: storageSpec,
    title,
    upgradePlan
  };
}

function componentProfile(
  id: string,
  title: string,
  gpu: GpuSpec
): CompatibilityProfile {
  return profile(
    id,
    title,
    cpus.ryzen5600,
    motherboards.am4B550,
    gpu,
    chassis.gpuOnly,
    psus.componentBench650,
    memory("DDR4", 16, 2),
    storage("Compatibility bench NVMe", "m2-nvme"),
    cooler("Compatibility bench cooler", 150, 125),
    "gaming"
  );
}
