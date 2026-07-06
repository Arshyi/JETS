import type { Json } from "@/types/database";
import type {
  MarketplaceFieldSource,
  MarketplaceIntelligenceSourceId,
  MarketplaceNormalizedListing,
  RawMarketplaceListing
} from "@/types/marketplace-intelligence";
import type { PlatformKnowledgeId } from "@/types/platform-knowledge";
import type {
  ConfidenceLevel,
  ConfidenceSourceType
} from "@/types/solution-intelligence";
import type {
  EvidenceConfidence,
  EvidenceVerificationStatus
} from "@/types/evidence";

export const listingModerationStatuses = [
  "unverified",
  "pending-review",
  "verified",
  "disputed",
  "deprecated",
  "superseded",
  "archived"
] as const;

export type ListingModerationStatus =
  (typeof listingModerationStatuses)[number];

export const listingReviewActions = [
  "accept",
  "reject",
  "correct",
  "mark-unknown"
] as const;

export type ListingReviewAction = (typeof listingReviewActions)[number];

export const listingFieldReviewStatuses = [
  "pending-review",
  "accepted",
  "rejected",
  "corrected",
  "unknown"
] as const;

export type ListingFieldReviewStatus =
  (typeof listingFieldReviewStatuses)[number];

export const listingStatuses = [
  "active",
  "needs-review",
  "ready-for-recommendation",
  "hidden",
  "archived"
] as const;

export type ListingStatus = (typeof listingStatuses)[number];

export const listingReadinessStatuses = [
  "ready",
  "needs-review",
  "not-ready"
] as const;

export type ListingReadinessStatus =
  (typeof listingReadinessStatuses)[number];

export const listingDuplicateStatuses = [
  "likely-duplicate",
  "possible-duplicate",
  "distinct"
] as const;

export type ListingDuplicateStatus =
  (typeof listingDuplicateStatuses)[number];

export type ListingSourceKind =
  | "demo-fixture"
  | "manual-entry"
  | "future-scraper"
  | "future-browser-extension"
  | "future-csv-import"
  | "future-marketplace-api"
  | "future-ocr"
  | "future-ai-extraction";

export type ListingHealthDimension = {
  label: string;
  reason: string;
  score: number;
};

export type ListingHealthAnalysis = {
  dimensions: ListingHealthDimension[];
  missingFields: string[];
  photoQuality: ConfidenceLevel;
  readinessBlockers: string[];
  score: number;
  summary: string;
};

export type ListingParsedField = {
  confidence: EvidenceConfidence;
  correctionReason: string | null;
  evidenceRecordIds: string[];
  fieldPath: string;
  id: string;
  label: string;
  parsedValue: string | null;
  reviewStatus: ListingFieldReviewStatus;
  reviewedAt: string | null;
  reviewedBy: string | null;
  source: MarketplaceFieldSource;
  value: string | null;
  verificationStatus: EvidenceVerificationStatus;
};

export type ListingCorrection = {
  afterValue: string | null;
  beforeValue: string | null;
  createdAt: string;
  evidenceRecordId: string | null;
  fieldPath: string;
  id: string;
  reason: string;
  reviewerId: string | null;
};

export type ListingDuplicateSignal = {
  label: string;
  reason: string;
  weight: number;
};

export type ListingDuplicateCandidate = {
  candidateListingId: string;
  candidateTitle: string;
  confidence: EvidenceConfidence;
  id?: string;
  reviewReason?: string | null;
  reviewStatus?: ListingFieldReviewStatus;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  signals: ListingDuplicateSignal[];
  status: ListingDuplicateStatus;
};

export type ListingRecommendationPreview = {
  adapterRecommendations: Array<{
    confidence: ConfidenceLevel;
    difficulty: string;
    title: string;
  }>;
  platformPotential: number;
  previewScore: number;
  recommendationReadiness: ListingReadinessStatus;
  readinessReasons: string[];
  solutionIntelligenceClaims: Array<{
    confidence: ConfidenceLevel;
    reason: string;
    source: ConfidenceSourceType;
    title: string;
  }>;
  upgradeOpportunities: Array<{
    confidence: ConfidenceLevel;
    estimatedCostUsd: number;
    title: string;
  }>;
};

export type ListingFutureHook = {
  boundary: string;
  kind: ListingSourceKind;
  note: string;
  status: "planned" | "blocked-until-policy-review" | "ready-interface";
};

export type ListingReviewEvent = {
  action: string;
  createdAt: string;
  createdBy: string | null;
  fieldPath: string | null;
  id: string;
  reason: string | null;
  summary: string;
};

export type ListingIntelligenceRecord = {
  corrections: ListingCorrection[];
  createdAt: string;
  duplicateCandidates: ListingDuplicateCandidate[];
  evidenceRecordIds: string[];
  fields: ListingParsedField[];
  health: ListingHealthAnalysis;
  id: string;
  isPersisted: boolean;
  listingStatus: ListingStatus;
  marketplace: MarketplaceIntelligenceSourceId;
  marketplaceListingId: string;
  normalized: MarketplaceNormalizedListing;
  normalizedPlatformId: PlatformKnowledgeId | null;
  parsingConfidence: EvidenceConfidence;
  priceAmount: number | null;
  raw: RawMarketplaceListing;
  recommendationPreview: ListingRecommendationPreview;
  reviewEvents: ListingReviewEvent[];
  seller: string;
  sourceKind: ListingSourceKind;
  status: ListingModerationStatus;
  updatedAt: string;
};

export type ListingIntelligenceState = {
  canModerate: boolean;
  duplicateCandidates: ListingDuplicateCandidate[];
  futureHooks: ListingFutureHook[];
  isConfigured: boolean;
  isServiceRoleConfigured: boolean;
  isSignedIn: boolean;
  listings: ListingIntelligenceRecord[];
  message?: string;
  pendingFields: ListingParsedField[];
  pendingListings: ListingIntelligenceRecord[];
  usesDemoFallback: boolean;
};

export type ListingIntelligenceRecordState = ListingIntelligenceState & {
  listing: ListingIntelligenceRecord | null;
};

export type PersistedListingSnapshot = {
  detectedComponents: Json;
  health: Json;
  normalizedPayload: Json;
  rawPayload: Json;
};
