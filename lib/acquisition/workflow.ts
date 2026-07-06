import {
  getProjectGoalTemplate,
  projectGoalTemplates
} from "@/data/project-goals";
import { buildListingIntelligenceRecord } from "@/lib/listing-intelligence/engine";
import { normalizeMarketplaceListing } from "@/lib/marketplace-intelligence/normalize";
import { platformKnowledgeProfiles } from "@/data/platform-knowledge";
import type {
  AcquisitionAnalysis,
  AcquisitionCorrection,
  AcquisitionCorrectionFieldId,
  AcquisitionDraft,
  AcquisitionMarketplaceId,
  AcquisitionMarketplaceOption,
  AcquisitionParsedFieldView,
  AcquisitionRecord,
  AcquisitionRecordSnapshot
} from "@/types/acquisition";
import type {
  EvidenceConfidence,
  EvidenceRecord
} from "@/types/evidence";
import type { HardwareUseCase } from "@/types/hardware";
import type {
  MarketplaceFieldSource,
  RawMarketplaceListing
} from "@/types/marketplace-intelligence";
import type {
  ConfidenceLevel,
  ConfidenceSourceType
} from "@/types/solution-intelligence";

const acquisitionVersion = "v4.1";

export const acquisitionMarketplaceOptions: AcquisitionMarketplaceOption[] = [
  {
    description: "User-pasted Dubizzle listing details.",
    id: "dubizzle",
    label: "Dubizzle",
    sourceId: "dubizzle"
  },
  {
    description: "User-pasted Facebook Marketplace listing details.",
    id: "facebook-marketplace",
    label: "Facebook Marketplace",
    sourceId: "facebook-marketplace"
  },
  {
    description: "User-provided eBay listing facts.",
    id: "ebay",
    label: "eBay",
    sourceId: "ebay"
  },
  {
    description: "User-provided Kijiji listing facts.",
    id: "kijiji",
    label: "Kijiji",
    sourceId: "kijiji"
  },
  {
    description: "User-provided Craigslist listing facts.",
    id: "craigslist",
    label: "Craigslist",
    sourceId: "craigslist"
  },
  {
    description: "Store, recycler, repair shop, or parts-counter offer.",
    id: "local-store",
    label: "Local store / recycler",
    sourceId: "local-computer-store"
  },
  {
    description: "Friend, family, school surplus, or unknown source.",
    id: "manual-source",
    label: "Manual / other source",
    sourceId: "manual-entry"
  }
];

export const defaultAcquisitionDraft: AcquisitionDraft = {
  condition: "good",
  currency: "AED",
  description:
    "Dell Precision 5820 tower workstation, Xeon W CPU, 32GB memory, Quadro P2000, 512GB SSD. Good for CAD. No OS mentioned.",
  imageCount: 5,
  listingUrl: "https://example.com/precision-5820-demo",
  location: "Dubai, UAE",
  marketplaceId: "dubizzle",
  personalNotes: {
    general: "",
    meetingLocation: "",
    missingAccessories: "Ask if power cable, drive caddies, and Windows license are included.",
    negotiationIdeas: "Offer 1600 AED if PSU cable set and BIOS photos are missing.",
    repairNotes: "",
    sellerConcerns: "Need proof of boot, CPU model, and front-panel condition.",
    whySaved: "Potential engineering workstation base with upgrade room."
  },
  priceText: "AED 1800",
  sellerNotes: "Seller says it was used in an office and tested before listing.",
  title: "Dell Precision 5820 Xeon W 32GB P2000"
};

export const defaultAcquisitionCorrections: AcquisitionCorrection[] = [
  { fieldId: "cpu", isUnknown: false, value: "" },
  { fieldId: "gpu", isUnknown: false, value: "" },
  { fieldId: "ram", isUnknown: false, value: "" },
  { fieldId: "platform", isUnknown: false, value: "" },
  { fieldId: "price", isUnknown: false, value: "" },
  { fieldId: "storage", isUnknown: false, value: "" }
];

export const acquisitionStatusLabels: Record<AcquisitionRecord["status"], string> = {
  archived: "Archived",
  purchased: "Purchased",
  ready: "Ready",
  reviewing: "Reviewing",
  rejected: "Rejected"
};

const correctionLabels: Record<AcquisitionCorrectionFieldId, string> = {
  cpu: "CPU",
  gpu: "GPU",
  platform: "Platform",
  price: "Price",
  ram: "RAM",
  storage: "Storage"
};

function getMarketplaceOption(marketplaceId: AcquisitionMarketplaceId) {
  return (
    acquisitionMarketplaceOptions.find((option) => option.id === marketplaceId) ??
    acquisitionMarketplaceOptions[acquisitionMarketplaceOptions.length - 1]
  );
}

function normalizeKeyPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 72);
}

function toEvidenceConfidence(confidence: ConfidenceLevel): EvidenceConfidence {
  if (confidence === "high") return "high";
  if (confidence === "medium") return "medium";
  return "low";
}

function parsePriceText(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getFieldCorrection(
  corrections: AcquisitionCorrection[],
  fieldId: AcquisitionCorrectionFieldId
) {
  return corrections.find((correction) => correction.fieldId === fieldId);
}

function correctedValue(
  corrections: AcquisitionCorrection[],
  fieldId: AcquisitionCorrectionFieldId
) {
  const correction = getFieldCorrection(corrections, fieldId);

  if (!correction || correction.isUnknown || !correction.value.trim()) {
    return null;
  }

  return correction.value.trim();
}

function createEvidenceRecord({
  claim,
  confidence,
  id,
  sourceDetail,
  sourceTitle,
  sourceUrl,
  subjectId,
  supportingText
}: {
  claim: string;
  confidence: EvidenceConfidence;
  id: string;
  sourceDetail?: string;
  sourceTitle: string;
  sourceUrl?: string | null;
  subjectId: string;
  supportingText: string;
}): EvidenceRecord {
  return {
    claim,
    confidence,
    dateAdded: "2026-07-06",
    extractionMethod: "manual-curation",
    id,
    sourceDetail,
    sourceTitle,
    sourceType: "user-submission",
    sourceUrl,
    subjectId,
    subjectType: "marketplace-parsed-field",
    supportingText,
    verificationStatus: "pending-review",
    version: acquisitionVersion
  };
}

function getCorrectionEvidence(
  draft: AcquisitionDraft,
  corrections: AcquisitionCorrection[],
  subjectPrefix: string
): EvidenceRecord[] {
  return corrections
    .filter((correction) => correction.isUnknown || correction.value.trim())
    .map((correction) => {
      const label = correctionLabels[correction.fieldId];
      const value = correction.isUnknown
        ? "Unknown"
        : correction.value.trim();

      return createEvidenceRecord({
        claim: `${label} manually reviewed as ${value}.`,
        confidence: correction.isUnknown ? "medium" : "high",
        id: `${subjectPrefix}:correction:${correction.fieldId}`,
        sourceDetail: "Manual acquisition correction before import.",
        sourceTitle: draft.title || "Manual acquisition",
        sourceUrl: draft.listingUrl || null,
        subjectId: `${subjectPrefix}:${correction.fieldId}`,
        supportingText: correction.isUnknown
          ? `User marked ${label} as unknown during acquisition review.`
          : `User corrected ${label} to "${correction.value.trim()}".`
      });
    });
}

function getParserEvidence(
  draft: AcquisitionDraft,
  confidence: ConfidenceLevel,
  subjectPrefix: string
): EvidenceRecord {
  return createEvidenceRecord({
    claim: "Manual acquisition fields were parsed into normalized listing facts.",
    confidence: toEvidenceConfidence(confidence),
    id: `${subjectPrefix}:parser`,
    sourceDetail: getMarketplaceOption(draft.marketplaceId).label,
    sourceTitle: draft.title || "Manual acquisition",
    sourceUrl: draft.listingUrl || null,
    subjectId: `${subjectPrefix}:raw-listing`,
    supportingText:
      "The user provided title, description, price, location, seller notes, and personal notes. No scraping or browser automation was used."
  });
}

function getAcquisitionExternalId(draft: AcquisitionDraft) {
  const source = draft.listingUrl || `${draft.title}-${draft.location}`;

  return `manual-${normalizeKeyPart(source || "acquisition") || "acquisition"}`;
}

export function acquisitionDraftToRawListing(
  draft: AcquisitionDraft
): RawMarketplaceListing {
  const source = getMarketplaceOption(draft.marketplaceId);
  const conditionText =
    draft.condition === "broken"
      ? "Condition: broken or for parts."
      : `Condition: ${draft.condition}.`;
  const sellerNotes = draft.sellerNotes.trim()
    ? `Seller notes: ${draft.sellerNotes.trim()}`
    : "";

  return {
    categoryLabel: "Manual acquisition listing",
    currency: draft.currency,
    description: [draft.description, conditionText, sellerNotes]
      .filter(Boolean)
      .join("\n\n"),
    externalId: getAcquisitionExternalId(draft),
    imageCount: draft.imageCount,
    locationText: draft.location,
    marketplaceSpecific: {
      captureMode: "manual-acquisition",
      marketplaceLabel: source.label,
      personalNotes: Object.values(draft.personalNotes)
        .filter(Boolean)
        .join(" | ")
    },
    observedAt: "2026-07-06T00:00:00.000Z",
    priceText: draft.priceText,
    sellerDisplayName: "Manual acquisition seller",
    sourceId: source.sourceId,
    title: draft.title,
    url: draft.listingUrl || null
  };
}

function getParsedFields(
  raw: RawMarketplaceListing,
  corrections: AcquisitionCorrection[]
): AcquisitionParsedFieldView[] {
  const normalized = normalizeMarketplaceListing(raw);
  const fields: Array<{
    fieldId: AcquisitionCorrectionFieldId;
    label: string;
    source: MarketplaceFieldSource;
    value: string | null;
    confidence: ConfidenceLevel;
  }> = [
    {
      confidence: normalized.hardware.detectedComponents.cpu.confidence,
      fieldId: "cpu",
      label: "CPU",
      source: normalized.hardware.detectedComponents.cpu.source,
      value: normalized.hardware.detectedComponents.cpu.value
    },
    {
      confidence: normalized.hardware.detectedComponents.gpu.confidence,
      fieldId: "gpu",
      label: "GPU",
      source: normalized.hardware.detectedComponents.gpu.source,
      value: normalized.hardware.detectedComponents.gpu.value
    },
    {
      confidence: normalized.hardware.detectedComponents.memory.confidence,
      fieldId: "ram",
      label: "RAM",
      source: normalized.hardware.detectedComponents.memory.source,
      value: normalized.hardware.detectedComponents.memory.value
    },
    {
      confidence: normalized.hardware.platformDetection.confidence,
      fieldId: "platform",
      label: "Platform",
      source: normalized.hardware.platformDetection.source,
      value: normalized.hardware.platformDetection.detectedPlatformName
    },
    {
      confidence: normalized.price.amount.confidence,
      fieldId: "price",
      label: "Price",
      source: normalized.price.amount.source,
      value: normalized.price.amount.value
        ? `${normalized.price.currency} ${normalized.price.amount.value}`
        : null
    },
    {
      confidence: normalized.hardware.detectedComponents.storage.confidence,
      fieldId: "storage",
      label: "Storage",
      source: normalized.hardware.detectedComponents.storage.source,
      value: normalized.hardware.detectedComponents.storage.value
    }
  ];

  return fields.map((field) => {
    const correction = getFieldCorrection(corrections, field.fieldId);

    return {
      ...field,
      correctedValue: correction?.isUnknown
        ? null
        : correctedValue(corrections, field.fieldId)
    };
  });
}

function getEffectivePlatformId(
  rawPlatformId: AcquisitionAnalysis["detectedPlatformId"],
  platformCorrection: string | null
) {
  if (!platformCorrection) {
    return rawPlatformId;
  }

  const normalizedCorrection = platformCorrection.toLowerCase();
  const match = platformKnowledgeProfiles.find((profile) =>
    [profile.name, ...profile.aliases].some((alias) =>
      normalizedCorrection.includes(alias.toLowerCase())
    )
  );

  return match?.id ?? rawPlatformId;
}

function getMissingInformation(fields: AcquisitionParsedFieldView[]) {
  return fields
    .filter((field) => !(field.correctedValue ?? field.value))
    .map((field) => field.label);
}

function getRecommendedProjectGoals(useCases: HardwareUseCase[]) {
  const goalIds = new Set<string>();

  if (useCases.includes("gaming")) goalIds.add("gaming-pc");
  if (useCases.includes("ai")) goalIds.add("ai-workstation");
  if (useCases.includes("cad") || useCases.includes("engineering")) {
    goalIds.add("cad-engineering-workstation");
  }
  if (useCases.includes("homelab")) goalIds.add("home-server");
  if (useCases.includes("general")) goalIds.add("office-pc");

  if (goalIds.size === 0) {
    goalIds.add("custom-project");
  }

  return Array.from(goalIds)
    .slice(0, 4)
    .map((goalId) => {
      const template = getProjectGoalTemplate(goalId);

      return {
        href: `/solution-builder/projects/new?goal=${template.id}`,
        id: template.id,
        label: template.title
      };
    });
}

export function analyzeAcquisitionDraft(
  draft: AcquisitionDraft,
  corrections: AcquisitionCorrection[]
): AcquisitionAnalysis {
  const raw = acquisitionDraftToRawListing(draft);
  const normalized = normalizeMarketplaceListing(raw);
  const listing = buildListingIntelligenceRecord(normalized, [normalized]);
  const subjectPrefix = `acquisition:${raw.sourceId}:${raw.externalId}`;
  const effectiveFields = getParsedFields(raw, corrections);
  const platformCorrection = correctedValue(corrections, "platform");
  const effectivePlatformId = getEffectivePlatformId(
    normalized.hardware.platformDetection.detectedPlatformId,
    platformCorrection
  );
  const correctedEvidence = getCorrectionEvidence(draft, corrections, subjectPrefix);

  return {
    confidence: normalized.confidence.confidence,
    correctedEvidence,
    detectedPlatformId: effectivePlatformId,
    detectedPlatformName:
      platformCorrection ??
      normalized.hardware.platformDetection.detectedPlatformName,
    effectiveFields,
    evidenceRecords: [
      getParserEvidence(draft, normalized.confidence.confidence, subjectPrefix),
      ...correctedEvidence
    ],
    missingInformation: Array.from(
      new Set([
        ...normalized.health.missingInformation,
        ...getMissingInformation(effectiveFields)
      ])
    ),
    priceAmount: parsePriceText(correctedValue(corrections, "price") ?? draft.priceText),
    readiness: listing.recommendationPreview.recommendationReadiness,
    readinessReasons: listing.recommendationPreview.readinessReasons,
    recommendedProjectGoals: getRecommendedProjectGoals(
      normalized.hardware.recommendedUseCases
    ),
    recommendationPreviewScore: listing.recommendationPreview.previewScore,
    solutionClaims: listing.recommendationPreview.solutionIntelligenceClaims.map(
      (claim) => ({
        confidence: claim.confidence,
        reason: claim.reason,
        title: claim.title
      })
    ),
    upgradeOpportunities: listing.recommendationPreview.upgradeOpportunities
  };
}

export function createAcquisitionSnapshot(
  draft: AcquisitionDraft,
  analysis: AcquisitionAnalysis
): AcquisitionRecordSnapshot {
  return {
    confidence: analysis.confidence,
    detectedPlatformName: analysis.detectedPlatformName,
    missingInformation: analysis.missingInformation,
    priceAmount: analysis.priceAmount,
    readiness: analysis.readiness,
    recommendationPreviewScore: analysis.recommendationPreviewScore,
    title: draft.title || "Untitled acquisition"
  };
}

export function getDecisionStatusFromReadiness(
  readiness: AcquisitionAnalysis["readiness"]
): AcquisitionRecord["status"] {
  if (readiness === "ready") return "ready";
  return "reviewing";
}

export function getAcquisitionGoalOptions() {
  return projectGoalTemplates
    .filter((template) =>
      [
        "gaming-pc",
        "cad-engineering-workstation",
        "ai-workstation",
        "home-server"
      ].includes(template.id)
    )
    .map((template) => ({
      href: `/solution-builder/projects/new?goal=${template.id}`,
      id: template.id,
      label: `Create ${template.title}`
    }));
}

export function getConfidenceSourceLabel(source: ConfidenceSourceType) {
  return source.replaceAll("-", " ");
}
