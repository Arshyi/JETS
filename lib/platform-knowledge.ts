import {
  adapterIntelligenceProfiles,
  platformKnowledgeLinks,
  platformKnowledgeProfiles
} from "@/data/platform-knowledge";
import type { ComponentInventoryItem } from "@/types/component-inventory";
import type {
  BuildWorkspaceProject,
  WorkspaceHardwareSelection
} from "@/types/solution-builder";
import type {
  AdapterIntelligenceProfile,
  PlatformKnowledgeId,
  PlatformKnowledgeInsight,
  PlatformKnowledgeProfile
} from "@/types/platform-knowledge";

function normalizeText(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function getProfileByAlias(label: string) {
  const normalizedLabel = normalizeText(label);

  if (!normalizedLabel) {
    return null;
  }

  return (
    platformKnowledgeProfiles.find((profile) =>
      profile.aliases.some((alias) => normalizedLabel.includes(normalizeText(alias)))
    ) ?? null
  );
}

function getPcieSummary(profile: PlatformKnowledgeProfile) {
  const primarySlot = profile.pcieSlots.find(
    (slot) => slot.priority === "primary-gpu"
  );

  if (!primarySlot) {
    return `PCIe Gen${profile.specifications.pcieGeneration} layout documented.`;
  }

  return `Primary GPU path: Gen${primarySlot.generation} ${primarySlot.physicalSize} physical, x${primarySlot.electricalLanes} electrical.`;
}

export function getPlatformKnowledgeById(
  platformId: PlatformKnowledgeId | null | undefined
) {
  if (!platformId) {
    return null;
  }

  return (
    platformKnowledgeProfiles.find((profile) => profile.id === platformId) ?? null
  );
}

export function getRecommendedAdaptersForPlatform(
  platformId: PlatformKnowledgeId
): AdapterIntelligenceProfile[] {
  return adapterIntelligenceProfiles.filter((adapter) =>
    adapter.recommendedPlatformIds.includes(platformId)
  );
}

export function getPlatformKnowledgeForComponent(
  component: Pick<
    ComponentInventoryItem,
    "id" | "sourceListingId" | "summary" | "tags" | "title"
  >
) {
  const directLink = platformKnowledgeLinks.find((link) => {
    if (link.componentId && link.componentId === component.id) {
      return true;
    }

    return Boolean(
      link.sourceListingId &&
        component.sourceListingId &&
        link.sourceListingId === component.sourceListingId
    );
  });

  if (directLink) {
    return {
      matchedBy: directLink.componentId ? "component" : "source-listing",
      profile: getPlatformKnowledgeById(directLink.platformId)
    } as const;
  }

  const profile = getProfileByAlias(
    [component.title, component.summary, ...component.tags].join(" ")
  );

  return {
    matchedBy: profile ? "alias" : "none",
    profile
  } as const;
}

export function getPlatformKnowledgeForSelection(
  selection: WorkspaceHardwareSelection | undefined
) {
  if (!selection) {
    return { matchedBy: "none", profile: null } as const;
  }

  const directLink = platformKnowledgeLinks.find((link) => {
    if (link.componentId && link.componentId === selection.componentId) {
      return true;
    }

    return Boolean(
      link.sourceListingId &&
        selection.sourceListingId &&
        link.sourceListingId === selection.sourceListingId
    );
  });

  if (directLink) {
    return {
      matchedBy: directLink.componentId ? "component" : "source-listing",
      profile: getPlatformKnowledgeById(directLink.platformId)
    } as const;
  }

  const profile = getProfileByAlias(selection.label);

  return {
    matchedBy: profile ? "alias" : "none",
    profile
  } as const;
}

export function getPlatformKnowledgeForProject(project: BuildWorkspaceProject) {
  const prioritySlots = [
    "chassis",
    "motherboard",
    "pcie-adapter",
    "storage",
    "gpu"
  ];
  const sortedSlots = [...project.slots].sort((left, right) => {
    const leftIndex = prioritySlots.indexOf(left.definitionId);
    const rightIndex = prioritySlots.indexOf(right.definitionId);

    return (
      (leftIndex === -1 ? 99 : leftIndex) -
      (rightIndex === -1 ? 99 : rightIndex)
    );
  });

  for (const slot of sortedSlots) {
    const result = getPlatformKnowledgeForSelection(slot.selectedHardware);

    if (result.profile) {
      return {
        matchedBy: result.matchedBy,
        matchedLabel: slot.selectedHardware?.label,
        profile: result.profile
      };
    }
  }

  return {
    matchedBy: "none" as const,
    matchedLabel: undefined,
    profile: null
  };
}

export function getPlatformKnowledgeInsightForProfile(
  profile: PlatformKnowledgeProfile,
  matchedBy: PlatformKnowledgeInsight["matchedBy"] = "none",
  matchedLabel?: string
): PlatformKnowledgeInsight {
  return {
    adapterCount: getRecommendedAdaptersForPlatform(profile.id).length,
    constraintCount: profile.constraints.length,
    matchedBy,
    matchedLabel,
    opportunityCount: profile.upgradeOpportunities.length,
    pcieSummary: getPcieSummary(profile),
    platformId: profile.id,
    platformName: profile.name,
    potentialScore: profile.potential.overall,
    summary: profile.summary
  };
}

export function getPlatformKnowledgeInsightForProject(
  project: BuildWorkspaceProject
) {
  const result = getPlatformKnowledgeForProject(project);

  if (!result.profile) {
    return null;
  }

  return getPlatformKnowledgeInsightForProfile(
    result.profile,
    result.matchedBy,
    result.matchedLabel
  );
}
