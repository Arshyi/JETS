import { mockComponentInventory } from "@/data/mock-components";
import {
  componentCategoryLabels,
  type ComponentCategory,
  type ComponentInventoryItem
} from "@/types/component-inventory";
import type { BuildSlotId, WorkspaceHardwareSelection } from "@/types/solution-builder";

export const componentCategoriesBySlot: Record<BuildSlotId, ComponentCategory[]> = {
  "accessories": [],
  "additional-storage": ["storage"],
  "capture-card": ["pcie-adapter"],
  "chassis": ["chassis"],
  "cpu": ["cpu"],
  "cpu-cooler": ["cpu-cooler"],
  "egpu-dock": ["egpu-dock"],
  "external-psu": ["external-psu", "psu"],
  "fans": [],
  "gpu": ["gpu", "egpu-dock"],
  "laptop-ram-dimm-adapter": ["laptop-ram-dimm-adapter"],
  "motherboard": ["motherboard", "chassis"],
  "nic": ["pcie-adapter"],
  "operating-system": ["operating-system"],
  "other-adapter": ["pcie-adapter", "thunderbolt-adapter"],
  "pcie-adapter": ["pcie-adapter"],
  "psu": ["psu", "external-psu"],
  "ram": ["ram", "laptop-ram-dimm-adapter"],
  "rgb": [],
  "sound-card": ["pcie-adapter"],
  "storage": ["storage"],
  "thunderbolt-adapter": ["thunderbolt-adapter"],
  "wifi": ["pcie-adapter"]
};

export function getComponentById(componentId: string | null | undefined) {
  if (!componentId) {
    return null;
  }

  return (
    mockComponentInventory.find((component) => component.id === componentId) ?? null
  );
}

export function getAllowedComponentCategoriesForSlot(slotId: BuildSlotId) {
  return componentCategoriesBySlot[slotId] ?? [];
}

export function isComponentAllowedForSlot(
  component: ComponentInventoryItem,
  slotId: BuildSlotId
) {
  const allowedCategories = getAllowedComponentCategoriesForSlot(slotId);

  return (
    component.compatibleSlotIds.includes(slotId) ||
    allowedCategories.includes(component.category)
  );
}

export function getComponentsForSlot(slotId: BuildSlotId) {
  return mockComponentInventory
    .filter((component) => isComponentAllowedForSlot(component, slotId))
    .sort((left, right) => left.price - right.price || left.title.localeCompare(right.title));
}

export function getComponentCategoryLabel(category: ComponentCategory) {
  return componentCategoryLabels[category];
}

export function getComponentInventorySummary(slotId: BuildSlotId) {
  const categories = getAllowedComponentCategoriesForSlot(slotId);

  if (categories.length === 0) {
    return "No typed component inventory is mapped to this optional slot yet.";
  }

  return categories.map((category) => componentCategoryLabels[category]).join(", ");
}

export function toWorkspaceSelection(
  component: ComponentInventoryItem
): WorkspaceHardwareSelection {
  return {
    componentCategory: component.category,
    componentId: component.id,
    facts: component.facts,
    label: component.title,
    sourceListingId: component.sourceListingId
  };
}
