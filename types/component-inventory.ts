import type { BuildSlotId, HardwareSelectionFacts } from "@/types/solution-builder";
import type { HardwareCondition, HardwareUseCase } from "@/types/hardware";

export const componentCategories = [
  "cpu",
  "motherboard",
  "chassis",
  "cpu-cooler",
  "ram",
  "gpu",
  "psu",
  "storage",
  "operating-system",
  "egpu-dock",
  "external-psu",
  "thunderbolt-adapter",
  "pcie-adapter",
  "laptop-ram-dimm-adapter"
] as const;

export type ComponentCategory = (typeof componentCategories)[number];

export type ComponentInventoryItem = {
  category: ComponentCategory;
  compatibleSlotIds: BuildSlotId[];
  condition: HardwareCondition;
  facts: HardwareSelectionFacts;
  id: string;
  location: string;
  price: number;
  recommendedUseCases: HardwareUseCase[];
  riskNotes: string[];
  sourceListingId?: string;
  summary: string;
  tags: string[];
  title: string;
};

export const componentCategoryLabels: Record<ComponentCategory, string> = {
  "chassis": "Chassis / base system",
  "cpu": "CPU",
  "cpu-cooler": "CPU cooler",
  "egpu-dock": "eGPU dock",
  "external-psu": "External PSU",
  "gpu": "GPU",
  "laptop-ram-dimm-adapter": "Laptop RAM + DIMM adapter",
  "motherboard": "Motherboard",
  "operating-system": "Operating system",
  "pcie-adapter": "PCIe adapter",
  "psu": "PSU",
  "ram": "RAM",
  "storage": "Storage",
  "thunderbolt-adapter": "Thunderbolt adapter"
};
