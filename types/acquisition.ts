import type { EvidenceRecord } from "@/types/evidence";
import type { HardwareCondition } from "@/types/hardware";
import type { ListingReadinessStatus } from "@/types/listing-intelligence";
import type {
  MarketplaceFieldSource,
  MarketplaceIntelligenceSourceId
} from "@/types/marketplace-intelligence";
import type { ProjectGoalId } from "@/data/project-goals";
import type { PlatformKnowledgeId } from "@/types/platform-knowledge";
import type { ConfidenceLevel } from "@/types/solution-intelligence";

export const acquisitionMarketplaceIds = [
  "dubizzle",
  "facebook-marketplace",
  "ebay",
  "kijiji",
  "craigslist",
  "local-store",
  "manual-source"
] as const;

export const acquisitionDecisionStatuses = [
  "reviewing",
  "ready",
  "archived",
  "purchased",
  "rejected"
] as const;

export const acquisitionCorrectionFieldIds = [
  "cpu",
  "gpu",
  "ram",
  "platform",
  "price",
  "storage"
] as const;

export type AcquisitionMarketplaceId = (typeof acquisitionMarketplaceIds)[number];
export type AcquisitionDecisionStatus =
  (typeof acquisitionDecisionStatuses)[number];
export type AcquisitionCorrectionFieldId =
  (typeof acquisitionCorrectionFieldIds)[number];

export type AcquisitionMarketplaceOption = {
  description: string;
  id: AcquisitionMarketplaceId;
  label: string;
  sourceId: MarketplaceIntelligenceSourceId;
};

export type AcquisitionPersonalNotes = {
  general: string;
  meetingLocation: string;
  missingAccessories: string;
  negotiationIdeas: string;
  repairNotes: string;
  sellerConcerns: string;
  whySaved: string;
};

export type AcquisitionDraft = {
  condition: HardwareCondition;
  currency: "AED" | "USD";
  description: string;
  imageCount: number;
  listingUrl: string;
  location: string;
  marketplaceId: AcquisitionMarketplaceId;
  personalNotes: AcquisitionPersonalNotes;
  priceText: string;
  sellerNotes: string;
  title: string;
};

export type AcquisitionCorrection = {
  fieldId: AcquisitionCorrectionFieldId;
  isUnknown: boolean;
  value: string;
};

export type AcquisitionParsedFieldView = {
  confidence: ConfidenceLevel;
  correctedValue: string | null;
  fieldId: AcquisitionCorrectionFieldId;
  label: string;
  source: MarketplaceFieldSource;
  value: string | null;
};

export type AcquisitionAnalysis = {
  confidence: ConfidenceLevel;
  correctedEvidence: EvidenceRecord[];
  detectedPlatformId: PlatformKnowledgeId | null;
  detectedPlatformName: string | null;
  effectiveFields: AcquisitionParsedFieldView[];
  evidenceRecords: EvidenceRecord[];
  missingInformation: string[];
  priceAmount: number | null;
  readiness: ListingReadinessStatus;
  readinessReasons: string[];
  recommendedProjectGoals: Array<{
    href: string;
    id: ProjectGoalId;
    label: string;
  }>;
  recommendationPreviewScore: number;
  solutionClaims: Array<{
    confidence: ConfidenceLevel;
    reason: string;
    title: string;
  }>;
  upgradeOpportunities: Array<{
    confidence: ConfidenceLevel;
    estimatedCostUsd: number;
    title: string;
  }>;
};

export type AcquisitionRecordSnapshot = {
  confidence: ConfidenceLevel;
  detectedPlatformName: string | null;
  missingInformation: string[];
  priceAmount: number | null;
  readiness: ListingReadinessStatus;
  recommendationPreviewScore: number;
  title: string;
};

export type AcquisitionRecord = {
  corrections: AcquisitionCorrection[];
  createdAt: string;
  draft: AcquisitionDraft;
  id: string;
  snapshot: AcquisitionRecordSnapshot;
  status: AcquisitionDecisionStatus;
  updatedAt: string;
};

export type AcquisitionPersistenceState = {
  data: AcquisitionRecord[];
  isConfigured: boolean;
  isSignedIn: boolean;
  message?: string;
};
