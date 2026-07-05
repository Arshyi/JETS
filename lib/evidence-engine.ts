import {
  communityDiscoveries,
  evidenceRecords,
  evidenceSourceTrustWeights,
  knowledgeConflicts,
  knowledgeTimelineEvents
} from "@/data/evidence";
import type {
  CommunityDiscovery,
  EvidenceConfidence,
  EvidenceRecord,
  EvidenceSourceType,
  EvidenceSummary,
  EvidenceVerificationStatus,
  KnowledgeConflict,
  KnowledgeQualityScore,
  KnowledgeTimelineEvent
} from "@/types/evidence";
import type {
  PlatformKnowledgeId,
  PlatformKnowledgeProfile
} from "@/types/platform-knowledge";

const confidenceScores: Record<EvidenceConfidence, number> = {
  high: 3,
  low: 1,
  medium: 2,
  "very-high": 4
};

const verificationScores: Record<EvidenceVerificationStatus, number> = {
  archived: 1,
  deprecated: 1,
  disputed: 1,
  "pending-review": 2,
  superseded: 2,
  unverified: 1,
  verified: 4
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function confidenceFromScore(score: number): EvidenceConfidence {
  if (score >= 3.5) return "very-high";
  if (score >= 2.5) return "high";
  if (score >= 1.5) return "medium";
  return "low";
}

function getHighestVerificationStatus(
  records: EvidenceRecord[]
): EvidenceVerificationStatus {
  if (records.some((record) => record.verificationStatus === "disputed")) {
    return "disputed";
  }

  const strongest = [...records].sort(
    (left, right) =>
      verificationScores[right.verificationStatus] -
      verificationScores[left.verificationStatus]
  )[0];

  return strongest?.verificationStatus ?? "pending-review";
}

export function formatEvidenceLabel(value: string) {
  return value.replaceAll("-", " ");
}

export function getEvidenceSourceTrust(sourceType: EvidenceSourceType) {
  return (
    evidenceSourceTrustWeights.find((source) => source.sourceType === sourceType)
      ?.trustWeight ?? 40
  );
}

export function getEvidenceSourceLabel(sourceType: EvidenceSourceType) {
  return (
    evidenceSourceTrustWeights.find((source) => source.sourceType === sourceType)
      ?.label ?? formatEvidenceLabel(sourceType)
  );
}

export function getEvidenceRecordsForSubject(subjectId: string) {
  return evidenceRecords.filter((record) => record.subjectId === subjectId);
}

export function getEvidenceRecordsForPlatform(platformId: PlatformKnowledgeId) {
  return evidenceRecords.filter((record) => record.platformId === platformId);
}

export function getEvidenceConflictsForPlatform(
  platformId: PlatformKnowledgeId
): KnowledgeConflict[] {
  return knowledgeConflicts.filter((conflict) => conflict.platformId === platformId);
}

export function getCommunityDiscoveriesForPlatform(
  platformId: PlatformKnowledgeId
): CommunityDiscovery[] {
  return communityDiscoveries.filter(
    (discovery) => discovery.platformId === platformId
  );
}

export function getKnowledgeTimelineForPlatform(
  platformId: PlatformKnowledgeId
): KnowledgeTimelineEvent[] {
  return knowledgeTimelineEvents.filter((event) => event.platformId === platformId);
}

export function getEvidenceSummaryForSubject(subjectId: string): EvidenceSummary {
  const records = getEvidenceRecordsForSubject(subjectId);

  if (records.length === 0) {
    return {
      confidence: "medium",
      evidenceCount: 0,
      records: [],
      sourceType: "manual-research",
      strongestSourceLabel: "Pending evidence",
      supportingText:
        "No dedicated evidence record is attached yet. Treat this knowledge item as pending review until provenance is added.",
      trustWeight: getEvidenceSourceTrust("manual-research"),
      verificationStatus: "pending-review"
    };
  }

  const strongestRecord = [...records].sort((left, right) => {
    const leftScore =
      getEvidenceSourceTrust(left.sourceType) +
      confidenceScores[left.confidence] * 10 +
      verificationScores[left.verificationStatus] * 8;
    const rightScore =
      getEvidenceSourceTrust(right.sourceType) +
      confidenceScores[right.confidence] * 10 +
      verificationScores[right.verificationStatus] * 8;

    return rightScore - leftScore;
  })[0];
  const averageConfidence =
    records.reduce((total, record) => total + confidenceScores[record.confidence], 0) /
    records.length;

  return {
    confidence: confidenceFromScore(averageConfidence),
    evidenceCount: records.length,
    records,
    sourceType: strongestRecord.sourceType,
    strongestSourceLabel: getEvidenceSourceLabel(strongestRecord.sourceType),
    supportingText: strongestRecord.supportingText,
    trustWeight: getEvidenceSourceTrust(strongestRecord.sourceType),
    verificationStatus: getHighestVerificationStatus(records)
  };
}

export function getEvidenceSummaryForPlatform(
  platformId: PlatformKnowledgeId
): EvidenceSummary {
  const records = getEvidenceRecordsForPlatform(platformId);

  if (records.length === 0) {
    return getEvidenceSummaryForSubject(platformId);
  }

  const averageConfidence =
    records.reduce((total, record) => total + confidenceScores[record.confidence], 0) /
    records.length;
  const strongestRecord = [...records].sort(
    (left, right) =>
      getEvidenceSourceTrust(right.sourceType) - getEvidenceSourceTrust(left.sourceType)
  )[0];

  return {
    confidence: confidenceFromScore(averageConfidence),
    evidenceCount: records.length,
    records,
    sourceType: strongestRecord.sourceType,
    strongestSourceLabel: getEvidenceSourceLabel(strongestRecord.sourceType),
    supportingText: strongestRecord.supportingText,
    trustWeight: getEvidenceSourceTrust(strongestRecord.sourceType),
    verificationStatus: getHighestVerificationStatus(records)
  };
}

export function getKnowledgeQualityForPlatform(
  profile: PlatformKnowledgeProfile
): KnowledgeQualityScore {
  const records = getEvidenceRecordsForPlatform(profile.id);
  const conflicts = getEvidenceConflictsForPlatform(profile.id);
  const discoveries = getCommunityDiscoveriesForPlatform(profile.id);
  const officialRecords = records.filter((record) =>
    [
      "official-documentation",
      "manufacturer-specification",
      "service-manual",
      "moderator-verified"
    ].includes(record.sourceType)
  );
  const verifiedRecords = records.filter(
    (record) => record.verificationStatus === "verified"
  );
  const disputedRecords = records.filter(
    (record) => record.verificationStatus === "disputed"
  );
  const evidenceSubjects = new Set(records.map((record) => record.subjectId));
  const modeledKnowledgeItems =
    profile.knowledgeCards.length +
    profile.constraints.length +
    profile.upgradeOpportunities.length +
    5;
  const averageTrust =
    records.length > 0
      ? records.reduce(
          (total, record) => total + getEvidenceSourceTrust(record.sourceType),
          0
        ) / records.length
      : 35;
  const averageConfidence =
    records.length > 0
      ? records.reduce(
          (total, record) => total + confidenceScores[record.confidence] * 25,
          0
        ) / records.length
      : 35;

  const documentationCompleteness = clampScore(
    (evidenceSubjects.size / Math.max(modeledKnowledgeItems, 1)) * 100
  );
  const evidenceQuality = clampScore(averageTrust * 0.55 + averageConfidence * 0.45);
  const communityValidation = clampScore(35 + discoveries.length * 18);
  const officialDocumentation = clampScore(officialRecords.length * 28);
  const conflictLevel = clampScore(
    100 - conflicts.length * 18 - disputedRecords.length * 12
  );
  const verificationLevel = clampScore(
    records.length > 0 ? (verifiedRecords.length / records.length) * 100 : 20
  );
  const overall = clampScore(
    documentationCompleteness * 0.18 +
      evidenceQuality * 0.24 +
      communityValidation * 0.16 +
      officialDocumentation * 0.16 +
      conflictLevel * 0.12 +
      verificationLevel * 0.14
  );

  return {
    communityValidation,
    conflictLevel,
    documentationCompleteness,
    evidenceQuality,
    officialDocumentation,
    overall,
    summary:
      overall >= 80
        ? "Knowledge quality is strong for demo reasoning, with visible provenance and review state."
        : overall >= 60
          ? "Knowledge quality is useful but still needs more evidence coverage before high-stakes recommendations."
          : "Knowledge quality is early-stage and should stay in review before production decisions.",
    verificationLevel
  };
}
