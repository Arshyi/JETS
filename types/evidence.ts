import type { PlatformKnowledgeId } from "@/types/platform-knowledge";

export const evidenceSourceTypes = [
  "official-documentation",
  "manufacturer-specification",
  "service-manual",
  "community-discovery",
  "forum",
  "video",
  "benchmark",
  "moderator-verified",
  "user-submission",
  "manual-research",
  "future-ai-extraction",
  "future-ocr",
  "future-scraper"
] as const;

export const evidenceVerificationStatuses = [
  "unverified",
  "pending-review",
  "verified",
  "deprecated",
  "disputed",
  "superseded",
  "archived"
] as const;

export type EvidenceSourceType = (typeof evidenceSourceTypes)[number];
export type EvidenceVerificationStatus =
  (typeof evidenceVerificationStatuses)[number];
export type EvidenceConfidence = "low" | "medium" | "high" | "very-high";

export type EvidenceExtractionMethod =
  | "manual-curation"
  | "deterministic-parser"
  | "structured-spec-entry"
  | "community-report"
  | "moderator-review"
  | "csv-import"
  | "api-import"
  | "future-ai-extraction"
  | "future-ocr"
  | "future-scraper";

export type EvidenceSubjectType =
  | "platform-profile"
  | "platform-specification"
  | "platform-constraint"
  | "platform-knowledge-card"
  | "upgrade-opportunity"
  | "adapter-intelligence"
  | "marketplace-parsed-field"
  | "solution-intelligence-finding"
  | "compatibility-rule"
  | "community-discovery";

export type EvidenceSourceTrust = {
  description: string;
  label: string;
  sourceType: EvidenceSourceType;
  trustWeight: number;
};

export type EvidenceRecord = {
  claim: string;
  confidence: EvidenceConfidence;
  dateAdded: string;
  extractionMethod: EvidenceExtractionMethod;
  id: string;
  platformId?: PlatformKnowledgeId;
  relatedDiscoveryIds?: string[];
  relatedEvidenceIds?: string[];
  sourceDetail?: string;
  sourceTitle: string;
  sourceType: EvidenceSourceType;
  sourceUrl?: string | null;
  subjectId: string;
  subjectType: EvidenceSubjectType;
  supersedesEvidenceIds?: string[];
  supportingText: string;
  verificationStatus: EvidenceVerificationStatus;
  version: string;
};

export type KnowledgeConflictStatus =
  | "open"
  | "needs-review"
  | "resolved"
  | "accepted-with-warning";

export type KnowledgeConflict = {
  claimId: string;
  conflictingEvidenceIds: string[];
  currentHandling: string;
  id: string;
  platformId: PlatformKnowledgeId;
  status: KnowledgeConflictStatus;
  summary: string;
  title: string;
};

export type CommunityDiscovery = {
  difficulty: "easy" | "moderate" | "advanced" | "experimental";
  evidenceIds: string[];
  id: string;
  impact: "low" | "medium" | "high" | "very-high";
  moderationStatus: "future-review-needed" | "seeded-demo" | "verified-demo";
  platformId: PlatformKnowledgeId;
  summary: string;
  title: string;
};

export type KnowledgeTimelineEvent = {
  dateLabel: string;
  description: string;
  evidenceIds: string[];
  id: string;
  platformId: PlatformKnowledgeId;
  title: string;
  verificationStatus: EvidenceVerificationStatus;
  version: string;
};

export type EvidenceSummary = {
  confidence: EvidenceConfidence;
  evidenceCount: number;
  records: EvidenceRecord[];
  sourceType: EvidenceSourceType;
  strongestSourceLabel: string;
  supportingText: string;
  trustWeight: number;
  verificationStatus: EvidenceVerificationStatus;
};

export type KnowledgeQualityScore = {
  communityValidation: number;
  conflictLevel: number;
  documentationCompleteness: number;
  evidenceQuality: number;
  officialDocumentation: number;
  overall: number;
  summary: string;
  verificationLevel: number;
};
