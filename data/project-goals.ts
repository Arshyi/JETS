import {
  defaultBuildGeneratorPreferences,
  defaultOwnedItems
} from "@/lib/build-generator/config";
import type {
  BuildGeneratorPreferences,
  OwnedItems
} from "@/types/build-generator";
import type { HardwareUseCase } from "@/types/hardware";
import type { BuildSlotId } from "@/types/solution-builder";

export const projectGoalIds = [
  "gaming-pc",
  "ai-workstation",
  "cad-engineering-workstation",
  "home-server",
  "office-pc",
  "upgrade-existing-computer",
  "custom-project"
] as const;

export type ProjectGoalId = (typeof projectGoalIds)[number];

export type ProjectGoalTemplate = {
  defaultBudget: number;
  defaultTitle: string;
  description: string;
  firstSlotId: BuildSlotId;
  id: ProjectGoalId;
  optimizeFor: string;
  ownedItems?: Partial<OwnedItems>;
  preferences: Partial<BuildGeneratorPreferences>;
  purpose: HardwareUseCase;
  scoringPreset: string;
  templateSummary: string;
  title: string;
};

export const projectGoalTemplates: ProjectGoalTemplate[] = [
  {
    defaultBudget: 850,
    defaultTitle: "Gaming PC",
    description: "Balanced desktop performance, GPU value, upgrade room, and practical risk.",
    firstSlotId: "gpu",
    id: "gaming-pc",
    optimizeFor: "gaming performance per dollar, GPU fit, PSU headroom, and upgrade path",
    preferences: {
      aestheticsPriority: true,
      preferDesktops: true,
      upgradeabilityPriority: true
    },
    purpose: "gaming",
    scoringPreset: "Gaming value",
    templateSummary:
      "JETS will prioritize a desktop path with a strong GPU, reliable power, and enough platform room for future upgrades.",
    title: "Gaming PC"
  },
  {
    defaultBudget: 1400,
    defaultTitle: "AI Workstation",
    description: "CUDA or accelerator-oriented workstation with memory, thermals, and power checks.",
    firstSlotId: "gpu",
    id: "ai-workstation",
    optimizeFor: "GPU compute value, VRAM path, power stability, thermals, and reliability",
    preferences: {
      preferWorkstations: true,
      reliabilityPriority: true,
      upgradeabilityPriority: true
    },
    purpose: "ai",
    scoringPreset: "AI workstation",
    templateSummary:
      "JETS will favor workstation bases, high-reliability power, and GPU upgrade paths over aesthetics.",
    title: "AI Workstation"
  },
  {
    defaultBudget: 1100,
    defaultTitle: "CAD / Engineering Workstation",
    description: "Reliable workstation path for CAD, engineering software, and long project life.",
    firstSlotId: "chassis",
    id: "cad-engineering-workstation",
    optimizeFor: "platform stability, workstation reliability, ECC paths, and upgradeability",
    preferences: {
      preferWorkstations: true,
      quietOperation: true,
      reliabilityPriority: true,
      upgradeabilityPriority: true
    },
    purpose: "engineering",
    scoringPreset: "Engineering reliability",
    templateSummary:
      "JETS will bias toward dependable workstation platforms and flag BIOS, cooling, and expansion risks early.",
    title: "CAD / Engineering Workstation"
  },
  {
    defaultBudget: 650,
    defaultTitle: "Home Server",
    description: "Quiet, reliable homelab or storage server with low power and expansion awareness.",
    firstSlotId: "chassis",
    id: "home-server",
    optimizeFor: "storage expansion, reliability, idle power, noise, and network flexibility",
    preferences: {
      lowPowerUsage: true,
      quietOperation: true,
      reliabilityPriority: true,
      smallFormFactor: true
    },
    purpose: "homelab",
    scoringPreset: "Homelab reliability",
    templateSummary:
      "JETS will prioritize dependable base systems, storage slots, network options, and low operating friction.",
    title: "Home Server"
  },
  {
    defaultBudget: 450,
    defaultTitle: "Office PC",
    description: "Practical office or school machine with low cost, low noise, and easy support.",
    firstSlotId: "chassis",
    id: "office-pc",
    optimizeFor: "lowest practical cost, reliability, SSD storage, low power, and simple maintenance",
    preferences: {
      lowestPricePriority: true,
      lowPowerUsage: true,
      reliabilityPriority: true,
      smallFormFactor: true
    },
    purpose: "general",
    scoringPreset: "Office value",
    templateSummary:
      "JETS will favor compact, reliable base systems and avoid risky upgrades unless they clearly help.",
    title: "Office PC"
  },
  {
    defaultBudget: 500,
    defaultTitle: "Upgrade Existing Computer",
    description: "Improve a machine you already own while locking parts that should stay.",
    firstSlotId: "gpu",
    id: "upgrade-existing-computer",
    optimizeFor: "reuse of owned hardware, compatibility, targeted upgrades, and avoided waste",
    ownedItems: {
      keyboard: true,
      monitor: true,
      mouse: true
    },
    preferences: {
      lowestPricePriority: true,
      upgradeabilityPriority: true
    },
    purpose: "general",
    scoringPreset: "Targeted upgrade",
    templateSummary:
      "JETS will assume some peripherals are already owned and will look for the highest-impact unlocked parts first.",
    title: "Upgrade Existing Machine"
  },
  {
    defaultBudget: 850,
    defaultTitle: "Custom Hardware Project",
    description: "Start from the full slot model and tune the project yourself.",
    firstSlotId: "chassis",
    id: "custom-project",
    optimizeFor: "balanced value, compatibility, reliability, and upgrade path",
    preferences: {
      reliabilityPriority: true,
      upgradeabilityPriority: true
    },
    purpose: "engineering",
    scoringPreset: "Balanced",
    templateSummary:
      "JETS will use the full project workspace without hiding advanced slots or unusual adapter paths.",
    title: "Custom Project"
  }
];

export function getProjectGoalTemplate(goalId: string | null | undefined) {
  return (
    projectGoalTemplates.find((template) => template.id === goalId) ??
    projectGoalTemplates[projectGoalTemplates.length - 1]
  );
}

export function getGoalPreferences(template: ProjectGoalTemplate) {
  return {
    ...defaultBuildGeneratorPreferences,
    ...template.preferences
  };
}

export function getGoalOwnedItems(template: ProjectGoalTemplate) {
  return {
    ...defaultOwnedItems,
    ...template.ownedItems
  };
}
