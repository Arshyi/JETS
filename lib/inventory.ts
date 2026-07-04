import {
  getAllowedComponentCategoriesForSlot,
  getComponentCategoryLabel
} from "@/lib/component-inventory";
import type {
  HardwareFilters,
  HardwareListing,
  HardwareSortKey
} from "@/types/hardware";
import type {
  ComponentCategory,
  ComponentInventoryItem
} from "@/types/component-inventory";
import type { BuildSlotId } from "@/types/solution-builder";

export const inventoryCategoryIds = [
  "complete-systems",
  "base-systems",
  "gpus",
  "cpus",
  "ram",
  "storage",
  "psus",
  "cooling",
  "adapters",
  "other-components"
] as const;

export type InventoryCategoryId = (typeof inventoryCategoryIds)[number];

export type InventorySection = {
  categoryId: InventoryCategoryId;
  components: ComponentInventoryItem[];
  listings: HardwareListing[];
};

export const inventoryCategoryLabels: Record<InventoryCategoryId, string> = {
  "adapters": "Adapters / eGPU / special paths",
  "base-systems": "Base systems / sleeper chassis",
  "complete-systems": "Complete systems",
  "cooling": "Cooling",
  "cpus": "CPUs",
  "gpus": "GPUs",
  "other-components": "Other components",
  "psus": "PSUs",
  "ram": "RAM",
  "storage": "Storage"
};

export const inventoryCategoryDescriptions: Record<InventoryCategoryId, string> = {
  "adapters":
    "eGPU docks, Thunderbolt paths, PCIe adapters, external PSUs, and unusual reuse paths.",
  "base-systems":
    "Workstation shells, office PC bases, sleeper chassis, and platforms that still need decisions.",
  "complete-systems":
    "PCs, laptops, and workstations that can be evaluated as whole candidate solutions.",
  "cooling": "CPU coolers and airflow parts for thermal validation.",
  "cpus": "Processors for project CPU slots and platform upgrade planning.",
  "gpus": "Graphics cards and compute accelerators for project GPU decisions.",
  "other-components":
    "Operating systems, accessories, repair-risk parts, and items not mapped to a core slot yet.",
  "psus": "Internal and external power supplies for wattage and connector checks.",
  "ram": "Desktop DIMMs, laptop SODIMMs, ECC memory, and adapter-assisted memory paths.",
  "storage": "SSD, HDD, NVMe, and boot/storage expansion candidates."
};

const componentCategoryMap: Record<ComponentCategory, InventoryCategoryId> = {
  "chassis": "base-systems",
  "cpu": "cpus",
  "cpu-cooler": "cooling",
  "egpu-dock": "adapters",
  "external-psu": "psus",
  "gpu": "gpus",
  "laptop-ram-dimm-adapter": "adapters",
  "motherboard": "base-systems",
  "operating-system": "other-components",
  "pcie-adapter": "adapters",
  "psu": "psus",
  "ram": "ram",
  "storage": "storage",
  "thunderbolt-adapter": "adapters"
};

function searchableComponentText(component: ComponentInventoryItem) {
  return [
    component.title,
    component.summary,
    component.location,
    component.category,
    getComponentCategoryLabel(component.category),
    ...component.tags,
    ...component.riskNotes
  ]
    .join(" ")
    .toLowerCase();
}

function listingText(listing: HardwareListing) {
  return [
    listing.title,
    listing.summary,
    listing.formFactor,
    listing.weightClass,
    ...listing.tags,
    ...listing.riskNotes,
    ...Object.values(listing.specs)
  ]
    .join(" ")
    .toLowerCase();
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term));
}

export function getInventoryCategoryForComponent(
  component: ComponentInventoryItem
): InventoryCategoryId {
  return componentCategoryMap[component.category];
}

export function getInventoryCategoryForListing(
  listing: HardwareListing
): InventoryCategoryId {
  const text = listingText(listing);

  if (
    listing.formFactor === "component" &&
    includesAny(text, ["gpu", "rtx", "radeon", "quadro"])
  ) {
    return "gpus";
  }

  if (includesAny(text, ["egpu", "adapter", "thunderbolt", "pcie riser"])) {
    return "adapters";
  }

  if (listing.formFactor === "component" && includesAny(text, ["ram", "ddr"])) {
    return "ram";
  }

  if (
    listing.formFactor === "component" &&
    includesAny(text, ["ssd", "hdd", "nvme", "storage"])
  ) {
    return "storage";
  }

  if (listing.formFactor === "component" && includesAny(text, ["psu", "power supply"])) {
    return "psus";
  }

  if (listing.formFactor === "component" && includesAny(text, ["cpu", "processor"])) {
    return "cpus";
  }

  if (listing.formFactor === "component") {
    return "other-components";
  }

  if (
    includesAny(text, [
      "base",
      "sleeper",
      "office pc",
      "optiplex",
      "render node",
      "chassis"
    ])
  ) {
    return "base-systems";
  }

  if (listing.condition === "broken" && includesAny(text, ["parts", "repair"])) {
    return "other-components";
  }

  return "complete-systems";
}

export function getInventoryCategoriesForSlot(slotId: BuildSlotId) {
  const categoryIds = getAllowedComponentCategoriesForSlot(slotId).map(
    (category) => componentCategoryMap[category]
  );

  return Array.from(new Set(categoryIds));
}

export function filterComponentsForInventory(
  components: ComponentInventoryItem[],
  filters: HardwareFilters
) {
  const query = filters.query.trim().toLowerCase();

  return components
    .filter((component) => {
      if (query && !searchableComponentText(component).includes(query)) {
        return false;
      }

      if (filters.minBudget !== null && component.price < filters.minBudget) {
        return false;
      }

      if (filters.maxBudget !== null && component.price > filters.maxBudget) {
        return false;
      }

      if (
        filters.useCase !== "all" &&
        !component.recommendedUseCases.includes(filters.useCase)
      ) {
        return false;
      }

      if (filters.condition !== "all" && component.condition !== filters.condition) {
        return false;
      }

      if (filters.location !== "all" && component.location !== filters.location) {
        return false;
      }

      return true;
    })
    .sort((left, right) => left.price - right.price || left.title.localeCompare(right.title));
}

export function getInventoryLocations(
  listings: HardwareListing[],
  components: ComponentInventoryItem[]
) {
  return Array.from(
    new Set([
      ...listings.map((listing) => listing.location),
      ...components.map((component) => component.location)
    ])
  ).sort();
}

export function getInventorySections(
  listings: HardwareListing[],
  components: ComponentInventoryItem[],
  categoryIds: InventoryCategoryId[] = [...inventoryCategoryIds]
) {
  return categoryIds
    .map((categoryId) => ({
      categoryId,
      components: components.filter(
        (component) => getInventoryCategoryForComponent(component) === categoryId
      ),
      listings: listings.filter(
        (listing) => getInventoryCategoryForListing(listing) === categoryId
      )
    }))
    .filter((section) => section.components.length + section.listings.length > 0);
}

export function getInventorySortDescription(sortKey: HardwareSortKey) {
  return `Legacy mock listings sort by ${sortKey.replaceAll("-", " ")} inside their category. Typed components stay grouped by slot category and price.`;
}
