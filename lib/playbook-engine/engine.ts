import { evidenceRecords } from "@/data/evidence";
import { hardwarePlaybooks } from "@/data/playbooks";
import { platformKnowledgeProfiles } from "@/data/platform-knowledge";
import {
  getEvidenceSummaryForPlatform,
  getKnowledgeQualityForPlatform
} from "@/lib/evidence-engine";
import {
  getEncyclopediaReferencesForPlatform,
  getEncyclopediaReferencesForSlots
} from "@/lib/platform-encyclopedia";
import type {
  HardwarePlaybook,
  HardwarePlaybookRecommendation,
  PlaybookProjectProgress,
  PlaybookUseCaseId,
  PlaybookValidationResult
} from "@/types/playbook";
import { playbookSectionIds } from "@/types/playbook";
import { platformKnowledgeIds } from "@/types/platform-knowledge";
import type { PlatformKnowledgeId } from "@/types/platform-knowledge";
import type { BuildSlotId, BuildWorkspaceModel } from "@/types/solution-builder";
import type {
  HardwareStrategyTypeId,
  StrategyAcquisitionInput
} from "@/types/strategy";

type PlaybookStrategySignal = {
  hiddenOpportunities: string[];
  reasons: string[];
  risks: string[];
};

function normalizeText(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function getProfileForPlaybook(playbook: HardwarePlaybook) {
  return platformKnowledgeProfiles.find((profile) => profile.id === playbook.platformId);
}

function getProfileByPlatformInput(value: string | null | undefined) {
  const normalized = normalizeText(value);

  if (!normalized) {
    return null;
  }

  return (
    platformKnowledgeProfiles.find((profile) => profile.id === value) ??
    platformKnowledgeProfiles.find((profile) => {
      const profileNames = [profile.name, profile.id, ...profile.aliases].map(normalizeText);

      return profileNames.some(
        (name) => normalized.includes(name) || name.includes(normalized)
      );
    }) ??
    null
  );
}

function getGenericPlatformId(value: string | null | undefined) {
  const normalized = normalizeText(value);

  if (normalized.includes("mini pc") || normalized.includes("nuc")) {
    return "generic-mini-pc";
  }

  if (
    normalized.includes("laptop") ||
    normalized.includes("notebook") ||
    normalized.includes("egpu")
  ) {
    return "generic-laptop";
  }

  return null;
}

function getKnowledgeScore(playbook: HardwarePlaybook) {
  const profile = getProfileForPlaybook(playbook);

  if (!profile) {
    return playbook.verification === "verified" ? 65 : 52;
  }

  return getKnowledgeQualityForPlatform(profile).overall;
}

function isPlatformKnowledgeId(value: string): value is PlatformKnowledgeId {
  return platformKnowledgeIds.includes(value as PlatformKnowledgeId);
}

function getPlaybookEncyclopediaEntryIds(playbook: HardwarePlaybook) {
  if (!isPlatformKnowledgeId(playbook.platformId)) {
    return playbook.encyclopediaEntryIds ?? [];
  }

  return (
    playbook.encyclopediaEntryIds ??
    getEncyclopediaReferencesForPlatform(
      playbook.platformId,
      [
        "overview",
        "upgrade-encyclopedia",
        "known-limitations",
        "workload-profiles"
      ],
      "Playbook references platform encyclopedia sections."
    ).map((reference) => reference.entryId)
  );
}

function getHydratedRecommendation(
  recommendation: HardwarePlaybookRecommendation,
  knowledgeQualityScore: number,
  platformId: HardwarePlaybook["platformId"]
): HardwarePlaybookRecommendation {
  const encyclopediaEntryIds =
    recommendation.encyclopediaEntryIds ??
    (isPlatformKnowledgeId(platformId)
      ? getEncyclopediaReferencesForSlots(
          platformId,
          recommendation.slotHints,
          "Playbook recommendation references slot-relevant encyclopedia sections."
        ).map((reference) => reference.entryId)
      : []);

  return {
    ...recommendation,
    encyclopediaEntryIds,
    knowledgeQualityScore
  };
}

function hydratePlaybook(playbook: HardwarePlaybook): HardwarePlaybook {
  const knowledgeQualityScore = getKnowledgeScore(playbook);

  return {
    ...playbook,
    encyclopediaEntryIds: getPlaybookEncyclopediaEntryIds(playbook),
    knowledgeQualityScore,
    recommendations: playbook.recommendations.map((recommendation) =>
      getHydratedRecommendation(
        recommendation,
        knowledgeQualityScore,
        playbook.platformId
      )
    )
  };
}

function sortByPreferredUseCase(
  playbooks: HardwarePlaybook[],
  preferredUseCases: PlaybookUseCaseId[]
) {
  return [...playbooks].sort((left, right) => {
    const leftIndex = preferredUseCases.indexOf(left.useCase);
    const rightIndex = preferredUseCases.indexOf(right.useCase);

    return (
      (leftIndex === -1 ? 99 : leftIndex) -
        (rightIndex === -1 ? 99 : rightIndex) ||
      right.knowledgeQualityScore - left.knowledgeQualityScore
    );
  });
}

function getPreferredUseCasesForProject(model: BuildWorkspaceModel): PlaybookUseCaseId[] {
  switch (model.project.purpose) {
    case "ai":
      return ["ai", "engineering", "budget", "general"];
    case "cad":
    case "engineering":
      return ["engineering", "budget", "ai", "general"];
    case "gaming":
      return ["gaming", "budget", "general"];
    case "homelab":
      return ["home-server", "budget", "repair", "general"];
    case "programming":
      return ["general", "budget", "engineering"];
    case "general":
    default:
      return ["general", "budget", "repair"];
  }
}

function getSelectedSlotIds(model: BuildWorkspaceModel) {
  return new Set(
    model.project.slots
      .filter((slot) => slot.selectedHardware)
      .map((slot) => slot.definitionId)
  );
}

function hasCompletedRecommendation(
  recommendation: HardwarePlaybookRecommendation,
  selectedSlotIds: Set<BuildSlotId>
) {
  const requiredSlots = recommendation.completedWhenSlotIds ?? recommendation.slotHints;

  return (
    requiredSlots.length > 0 &&
    requiredSlots.every((slotId) => selectedSlotIds.has(slotId))
  );
}

function createAssertion(
  message: string,
  passed: boolean,
  expected: string | number | null,
  actual: string | number | null
) {
  return {
    actual,
    expected,
    message,
    passed
  };
}

export function findPlatformKnowledgeProfile(value: string | null | undefined) {
  return getProfileByPlatformInput(value);
}

export function getPlaybooksForPlatform(value: string | null | undefined) {
  const profile = getProfileByPlatformInput(value);
  const genericPlatformId = getGenericPlatformId(value);
  const platformId = profile?.id ?? genericPlatformId;

  if (!platformId) {
    return [];
  }

  return hardwarePlaybooks
    .filter((playbook) => playbook.platformId === platformId)
    .map(hydratePlaybook);
}

export function getPlaybooksForProject(model: BuildWorkspaceModel) {
  const playbooks = getPlaybooksForPlatform(
    model.platformInsight?.platformId ?? model.platformInsight?.platformName
  );

  return sortByPreferredUseCase(playbooks, getPreferredUseCasesForProject(model));
}

export function getPlaybookProjectProgress(
  playbooks: HardwarePlaybook[],
  model: BuildWorkspaceModel
): PlaybookProjectProgress {
  const selectedSlotIds = getSelectedSlotIds(model);
  const recommendations = playbooks.flatMap((playbook) => playbook.recommendations);
  const completedRecommendations = recommendations
    .filter((recommendation) =>
      hasCompletedRecommendation(recommendation, selectedSlotIds)
    )
    .map((recommendation) => ({
      recommendation,
      status: "completed" as const
    }));
  const remainingRecommendations = recommendations
    .filter(
      (recommendation) =>
        !hasCompletedRecommendation(recommendation, selectedSlotIds)
    )
    .map((recommendation) => ({
      recommendation,
      status: "remaining" as const
    }));
  const playbookWarnings = recommendations.flatMap(
    (recommendation) => recommendation.warnings
  );
  const validationWarnings = model.evaluation.issues
    .filter((issue) =>
      recommendations.some(
        (recommendation) =>
          issue.slotId && recommendation.slotHints.includes(issue.slotId)
      )
    )
    .map((issue) => `${issue.title}: ${issue.reason}`);

  return {
    completedRecommendations,
    remainingRecommendations,
    warnings: unique([...playbookWarnings, ...validationWarnings])
  };
}

export function getPlaybookStrategySignalsForAcquisition(
  acquisition: StrategyAcquisitionInput | null,
  strategyType: HardwareStrategyTypeId
): PlaybookStrategySignal {
  if (!acquisition) {
    return {
      hiddenOpportunities: [],
      reasons: [],
      risks: []
    };
  }

  const playbooks = getPlaybooksForPlatform(
    acquisition.detectedPlatformId ?? acquisition.detectedPlatformName
  );
  const matchingPlaybooks = playbooks.filter((playbook) =>
    playbook.recommendedStrategyTypes.includes(strategyType)
  );
  const matchingRecommendations = matchingPlaybooks.flatMap((playbook) =>
    playbook.recommendations.filter((recommendation) =>
      recommendation.strategyTypes.includes(strategyType)
    )
  );

  return {
    hiddenOpportunities: matchingRecommendations
      .slice(0, 2)
      .map(
        (recommendation) =>
          `${recommendation.title}: ${recommendation.summary}`
      ),
    reasons: matchingPlaybooks
      .slice(0, 2)
      .map(
        (playbook) =>
          `Playbook match: ${playbook.title} supports this strategy for ${playbook.platformName}.`
      ),
    risks: unique(
      matchingRecommendations.flatMap((recommendation) => recommendation.warnings)
    ).slice(0, 3)
  };
}

export function getEvidenceSummaryForPlaybook(playbook: HardwarePlaybook) {
  const profile = getProfileForPlaybook(playbook);

  if (!profile) {
    return null;
  }

  return getEvidenceSummaryForPlatform(profile.id);
}

export function getSupportedPlatformPlaybookCoverage() {
  return platformKnowledgeProfiles.map((profile) => ({
    platform: profile,
    playbooks: getPlaybooksForPlatform(profile.id)
  }));
}

export function validateHardwarePlaybooks(): PlaybookValidationResult[] {
  const evidenceIds = new Set(evidenceRecords.map((record) => record.id));

  return getSupportedPlatformPlaybookCoverage().map(({ platform, playbooks }) => {
    const allRecommendations = playbooks.flatMap(
      (playbook) => playbook.recommendations
    );
    const allEvidenceIds = playbooks.flatMap((playbook) => [
      ...playbook.evidenceRecordIds,
      ...playbook.recommendations.flatMap(
        (recommendation) => recommendation.evidenceRecordIds
      )
    ]);
    const requiredSectionIds = new Set(playbookSectionIds);
    const missingSectionIds = playbooks.flatMap((playbook) => {
      const modeledSectionIds = new Set(playbook.sections.map((section) => section.id));

      return [...requiredSectionIds].filter(
        (sectionId) => !modeledSectionIds.has(sectionId)
      );
    });
    const missingEvidenceIds = allEvidenceIds.filter((id) => !evidenceIds.has(id));
    const assertions = [
      createAssertion(
        "Supported platform has at least one hardware playbook.",
        playbooks.length > 0,
        1,
        playbooks.length
      ),
      createAssertion(
        "Every playbook has all required playbook sections.",
        missingSectionIds.length === 0,
        0,
        missingSectionIds.length
      ),
      createAssertion(
        "Every playbook has at least one recommendation.",
        playbooks.every((playbook) => playbook.recommendations.length > 0),
        playbooks.length,
        playbooks.filter((playbook) => playbook.recommendations.length > 0).length
      ),
      createAssertion(
        "Every playbook recommendation links to evidence.",
        allRecommendations.every(
          (recommendation) => recommendation.evidenceRecordIds.length > 0
        ),
        allRecommendations.length,
        allRecommendations.filter(
          (recommendation) => recommendation.evidenceRecordIds.length > 0
        ).length
      ),
      createAssertion(
        "Playbook evidence IDs resolve to known evidence records.",
        missingEvidenceIds.length === 0,
        0,
        missingEvidenceIds.length
      ),
      createAssertion(
        "Every platform playbook references encyclopedia entries.",
        playbooks.every((playbook) => (playbook.encyclopediaEntryIds ?? []).length > 0),
        playbooks.length,
        playbooks.filter((playbook) => (playbook.encyclopediaEntryIds ?? []).length > 0).length
      )
    ];

    return {
      assertions,
      passed: assertions.every((assertion) => assertion.passed),
      platformId: platform.id,
      platformName: platform.name,
      playbookCount: playbooks.length
    };
  });
}
