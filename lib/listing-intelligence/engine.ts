import { buildMarketplaceImportPipelineReport } from "@/lib/marketplace-intelligence/normalize";
import {
  getPlatformKnowledgeById,
  getRecommendedAdaptersForPlatform
} from "@/lib/platform-knowledge";
import type {
  MarketplaceFieldSource,
  MarketplaceNormalizedListing
} from "@/types/marketplace-intelligence";
import type {
  EvidenceConfidence,
  EvidenceVerificationStatus
} from "@/types/evidence";
import type {
  ListingDuplicateCandidate,
  ListingDuplicateSignal,
  ListingFutureHook,
  ListingHealthAnalysis,
  ListingIntelligenceRecord,
  ListingParsedField,
  ListingReadinessStatus,
  ListingRecommendationPreview
} from "@/types/listing-intelligence";

const parserEvidenceId = "ev-marketplace-platform-detection";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeListingId(listing: MarketplaceNormalizedListing) {
  return `demo-${listing.marketplace.sourceId}-${listing.marketplace.externalId}`;
}

function confidenceToEvidence(
  confidence: MarketplaceNormalizedListing["confidence"]["confidence"]
): EvidenceConfidence {
  if (confidence === "high") return "high";
  if (confidence === "medium") return "medium";
  return "low";
}

function getConfidenceScore(confidence: EvidenceConfidence) {
  if (confidence === "very-high") return 100;
  if (confidence === "high") return 82;
  if (confidence === "medium") return 58;
  return 34;
}

function parsedField(
  listingId: string,
  fieldPath: string,
  label: string,
  value: string | number | null,
  confidence: EvidenceConfidence,
  source: MarketplaceFieldSource,
  verificationStatus: EvidenceVerificationStatus = "pending-review"
): ListingParsedField {
  const stringValue = value === null ? null : String(value);

  return {
    confidence,
    correctionReason: null,
    evidenceRecordIds: [parserEvidenceId],
    fieldPath,
    id: `${listingId}:${fieldPath}`,
    label,
    parsedValue: stringValue,
    reviewStatus: "pending-review",
    reviewedAt: null,
    reviewedBy: null,
    source,
    value: stringValue,
    verificationStatus
  };
}

function getListingFields(
  listing: MarketplaceNormalizedListing
): ListingParsedField[] {
  const listingId = normalizeListingId(listing);

  return [
    parsedField(
      listingId,
      "marketplace.price.amount",
      "Price",
      listing.price.amount.value,
      confidenceToEvidence(listing.price.amount.confidence),
      listing.price.amount.source
    ),
    parsedField(
      listingId,
      "marketplace.location.locality",
      "Location",
      listing.location.locality.value,
      confidenceToEvidence(listing.location.locality.confidence),
      listing.location.locality.source
    ),
    parsedField(
      listingId,
      "seller.displayName",
      "Seller",
      listing.seller.displayName,
      "medium",
      "marketplace-metadata"
    ),
    parsedField(
      listingId,
      "hardware.platform",
      "Platform",
      listing.hardware.platformDetection.detectedPlatformName,
      confidenceToEvidence(listing.hardware.platformDetection.confidence),
      listing.hardware.platformDetection.source
    ),
    parsedField(
      listingId,
      "hardware.cpu",
      "CPU",
      listing.hardware.detectedComponents.cpu.value,
      confidenceToEvidence(listing.hardware.detectedComponents.cpu.confidence),
      listing.hardware.detectedComponents.cpu.source
    ),
    parsedField(
      listingId,
      "hardware.gpu",
      "GPU",
      listing.hardware.detectedComponents.gpu.value,
      confidenceToEvidence(listing.hardware.detectedComponents.gpu.confidence),
      listing.hardware.detectedComponents.gpu.source
    ),
    parsedField(
      listingId,
      "hardware.memory",
      "RAM",
      listing.hardware.detectedComponents.memory.value,
      confidenceToEvidence(listing.hardware.detectedComponents.memory.confidence),
      listing.hardware.detectedComponents.memory.source
    ),
    parsedField(
      listingId,
      "hardware.storage",
      "Storage",
      listing.hardware.detectedComponents.storage.value,
      confidenceToEvidence(listing.hardware.detectedComponents.storage.confidence),
      listing.hardware.detectedComponents.storage.source
    ),
    parsedField(
      listingId,
      "hardware.operatingSystem",
      "Operating System",
      listing.hardware.detectedComponents.operatingSystem.value,
      confidenceToEvidence(
        listing.hardware.detectedComponents.operatingSystem.confidence
      ),
      listing.hardware.detectedComponents.operatingSystem.source
    ),
    parsedField(
      listingId,
      "hardware.condition",
      "Condition",
      listing.hardware.condition.value,
      confidenceToEvidence(listing.hardware.condition.confidence),
      listing.hardware.condition.source
    )
  ];
}

function getHealthDimensions(
  listing: MarketplaceNormalizedListing,
  fields: ListingParsedField[]
) {
  const knownFields = fields.filter((field) => field.value).length;
  const fieldCompleteness = clampScore((knownFields / fields.length) * 100);
  const confidenceScore = clampScore(
    fields.reduce((sum, field) => sum + getConfidenceScore(field.confidence), 0) /
      Math.max(fields.length, 1)
  );
  const photoScore = clampScore(Math.min(listing.images.count, 8) * 12.5);
  const descriptionScore = clampScore(
    listing.description.length > 160
      ? 92
      : listing.description.length > 90
        ? 72
        : listing.description.length > 45
          ? 52
          : 28
  );
  const marketplaceScore =
    listing.marketplace.sourceId === "local-computer-store"
      ? 82
      : listing.marketplace.sourceId === "manual-entry"
        ? 62
        : 58;
  const evidenceScore =
    fields.filter((field) => field.evidenceRecordIds.length > 0).length /
    Math.max(fields.length, 1);

  return [
    {
      label: "Information completeness",
      reason: `${knownFields} of ${fields.length} key fields have parser values.`,
      score: fieldCompleteness
    },
    {
      label: "Photo quality",
      reason: `${listing.images.count} listing photos are available to future reviewers.`,
      score: photoScore
    },
    {
      label: "Parsing confidence",
      reason: "Average parser confidence across reviewable fields.",
      score: confidenceScore
    },
    {
      label: "Evidence quality",
      reason: "Parsed fields are linked to deterministic parser evidence pending human review.",
      score: clampScore(evidenceScore * 70)
    },
    {
      label: "Marketplace quality",
      reason: `${listing.marketplace.sourceName} is treated as a demo source with compliance notes.`,
      score: marketplaceScore
    },
    {
      label: "Description quality",
      reason: "Longer descriptions usually reduce unknown hardware risk.",
      score: descriptionScore
    }
  ];
}

function getListingHealth(
  listing: MarketplaceNormalizedListing,
  fields: ListingParsedField[]
): ListingHealthAnalysis {
  const dimensions = getHealthDimensions(listing, fields);
  const missingFields = fields
    .filter((field) => !field.value)
    .map((field) => field.label);
  const score = clampScore(
    dimensions.reduce((sum, dimension) => sum + dimension.score, 0) /
      Math.max(dimensions.length, 1)
  );
  const readinessBlockers = [
    ...missingFields.map((field) => `Missing ${field}`),
    ...(listing.health.parsingConfidence === "low"
      ? ["Overall parser confidence is low"]
      : []),
    ...(listing.hardware.platformDetection.detectedPlatformId
      ? []
      : ["Unknown platform"])
  ];

  return {
    dimensions,
    missingFields,
    photoQuality:
      listing.images.count >= 7
        ? "high"
        : listing.images.count >= 4
          ? "medium"
          : "low",
    readinessBlockers,
    score,
    summary:
      score >= 75
        ? "Listing is healthy enough for recommendation preview after review."
        : score >= 55
          ? "Listing is useful, but human review should resolve unknowns first."
          : "Listing is too incomplete for reliable recommendation use."
  };
}

function getRecommendationReadiness(
  health: ListingHealthAnalysis,
  fields: ListingParsedField[]
): ListingReadinessStatus {
  const hasConflict = fields.some(
    (field) => field.verificationStatus === "disputed"
  );

  if (hasConflict || health.readinessBlockers.length >= 4 || health.score < 45) {
    return "not-ready";
  }

  if (health.readinessBlockers.length > 0 || health.score < 72) {
    return "needs-review";
  }

  return "ready";
}

function getRecommendationPreview(
  listing: MarketplaceNormalizedListing,
  health: ListingHealthAnalysis,
  fields: ListingParsedField[]
): ListingRecommendationPreview {
  const profile = getPlatformKnowledgeById(
    listing.hardware.platformDetection.detectedPlatformId
  );
  const adapters = profile ? getRecommendedAdaptersForPlatform(profile.id) : [];
  const platformPotential = profile?.potential.overall ?? 35;
  const readiness = getRecommendationReadiness(health, fields);
  const previewScore = clampScore(
    health.score * 0.42 +
      platformPotential * 0.34 +
      getConfidenceScore(confidenceToEvidence(listing.confidence.confidence)) * 0.24
  );

  return {
    adapterRecommendations: adapters.slice(0, 3).map((adapter) => ({
      confidence: adapter.compatibilityConfidence,
      difficulty: adapter.difficulty,
      title: adapter.title
    })),
    platformPotential,
    previewScore,
    recommendationReadiness: readiness,
    readinessReasons:
      readiness === "ready"
        ? ["Core listing fields, platform context, and parser confidence are usable."]
        : health.readinessBlockers,
    solutionIntelligenceClaims: [
      {
        confidence: profile ? "high" : "medium",
        reason: profile
          ? `${profile.name} can be handed to Platform Knowledge before project creation.`
          : "Unknown platform limits solution intelligence until reviewed.",
        source: profile ? "platform-knowledge" : "decision-engine",
        title: "Platform-aware recommendation preview"
      },
      {
        confidence: listing.hardware.detectedComponents.gpu.value ? "medium" : "low",
        reason: listing.hardware.detectedComponents.gpu.value
          ? "Detected GPU allows power, workload, and upgrade-path previews."
          : "GPU is unknown, so gaming, rendering, and AI previews stay conservative.",
        source: "decision-engine",
        title: "Graphics path preview"
      }
    ],
    upgradeOpportunities:
      profile?.upgradeOpportunities.slice(0, 4).map((opportunity) => ({
        confidence: opportunity.confidence,
        estimatedCostUsd: opportunity.estimatedCostUsd,
        title: opportunity.title
      })) ?? []
  };
}

function getDuplicateSignals(
  listing: MarketplaceNormalizedListing,
  candidate: MarketplaceNormalizedListing
): ListingDuplicateSignal[] {
  const signals: ListingDuplicateSignal[] = [];

  if (
    listing.marketplace.externalId === candidate.marketplace.externalId &&
    listing.marketplace.sourceId === candidate.marketplace.sourceId
  ) {
    signals.push({
      label: "Same marketplace ID",
      reason: "The source and external listing identifier are identical.",
      weight: 55
    });
  }

  if (normalizeText(listing.description) === normalizeText(candidate.description)) {
    signals.push({
      label: "Same description",
      reason: "The normalized listing descriptions match exactly.",
      weight: 35
    });
  }

  if (normalizeText(listing.seller.displayName) === normalizeText(candidate.seller.displayName)) {
    signals.push({
      label: "Same seller",
      reason: "Both listings use the same seller display name.",
      weight: 16
    });
  }

  if (
    listing.hardware.platformDetection.detectedPlatformId &&
    listing.hardware.platformDetection.detectedPlatformId ===
      candidate.hardware.platformDetection.detectedPlatformId
  ) {
    signals.push({
      label: "Same platform",
      reason: "Both listings resolve to the same platform knowledge profile.",
      weight: 14
    });
  }

  if (
    listing.hardware.detectedComponents.cpu.value &&
    listing.hardware.detectedComponents.cpu.value ===
      candidate.hardware.detectedComponents.cpu.value
  ) {
    signals.push({
      label: "Same CPU",
      reason: "The CPU parser value is identical.",
      weight: 8
    });
  }

  if (
    listing.hardware.detectedComponents.gpu.value &&
    listing.hardware.detectedComponents.gpu.value ===
      candidate.hardware.detectedComponents.gpu.value
  ) {
    signals.push({
      label: "Same GPU",
      reason: "The GPU parser value is identical.",
      weight: 8
    });
  }

  return signals;
}

function getDuplicateCandidates(
  listing: MarketplaceNormalizedListing,
  allListings: MarketplaceNormalizedListing[]
): ListingDuplicateCandidate[] {
  return allListings
    .filter((candidate) => candidate.id !== listing.id)
    .map((candidate) => {
      const signals = getDuplicateSignals(listing, candidate);
      const score = signals.reduce((sum, signal) => sum + signal.weight, 0);

      return {
        candidateListingId: normalizeListingId(candidate),
        candidateTitle: candidate.title,
        confidence: score >= 70 ? "high" : score >= 35 ? "medium" : "low",
        signals,
        status:
          score >= 70
            ? "likely-duplicate"
            : score >= 35
              ? "possible-duplicate"
              : "distinct"
      } satisfies ListingDuplicateCandidate;
    })
    .filter((candidate) => candidate.status !== "distinct")
    .sort((left, right) => right.signals.length - left.signals.length);
}

export const listingFutureHooks: ListingFutureHook[] = [
  {
    boundary: "Produces raw listings only; never bypasses source policy.",
    kind: "future-scraper",
    note: "A scraper can later write raw title, description, price, photos, and source metadata into the same review pipeline.",
    status: "blocked-until-policy-review"
  },
  {
    boundary: "User-initiated capture, no private messages or hidden seller data.",
    kind: "future-browser-extension",
    note: "A browser extension can submit a raw listing snapshot for normalization and human review.",
    status: "ready-interface"
  },
  {
    boundary: "CSV rows must preserve original source attribution.",
    kind: "future-csv-import",
    note: "Inventory sheets can become normalized listings after required field validation.",
    status: "ready-interface"
  },
  {
    boundary: "Manual entries must mark unknown fields as unknown.",
    kind: "manual-entry",
    note: "Signed-in users can submit representative listing facts without pretending they are verified.",
    status: "ready-interface"
  },
  {
    boundary: "Requires marketplace-approved auth, limits, and data retention rules.",
    kind: "future-marketplace-api",
    note: "Approved APIs become listing producers, not separate recommendation systems.",
    status: "planned"
  },
  {
    boundary: "Future OCR output must become reviewable evidence before trust.",
    kind: "future-ocr",
    note: "Image-derived fields will use the same parsed field review states.",
    status: "planned"
  },
  {
    boundary: "Future AI extraction cannot become truth without evidence review.",
    kind: "future-ai-extraction",
    note: "AI can propose parsed fields later, while humans and evidence decide trust.",
    status: "planned"
  }
];

export function buildListingIntelligenceRecord(
  listing: MarketplaceNormalizedListing,
  allListings: MarketplaceNormalizedListing[] = [listing]
): ListingIntelligenceRecord {
  const fields = getListingFields(listing);
  const health = getListingHealth(listing, fields);
  const recommendationPreview = getRecommendationPreview(listing, health, fields);
  const duplicateCandidates = getDuplicateCandidates(listing, allListings);

  return {
    corrections: [],
    createdAt: listing.marketplace.observedAt,
    duplicateCandidates,
    evidenceRecordIds: Array.from(
      new Set(fields.flatMap((field) => field.evidenceRecordIds))
    ),
    fields,
    health,
    id: normalizeListingId(listing),
    isPersisted: false,
    listingStatus:
      recommendationPreview.recommendationReadiness === "ready"
        ? "ready-for-recommendation"
        : "needs-review",
    marketplace: listing.marketplace.sourceId,
    marketplaceListingId: listing.marketplace.externalId,
    normalized: listing,
    normalizedPlatformId: listing.hardware.platformDetection.detectedPlatformId,
    parsingConfidence: confidenceToEvidence(listing.confidence.confidence),
    priceAmount: listing.price.amount.value,
    raw: listing.raw,
    recommendationPreview,
    reviewEvents: [
      {
        action: "normalized",
        createdAt: listing.marketplace.observedAt,
        createdBy: null,
        fieldPath: null,
        id: `${normalizeListingId(listing)}:normalized`,
        reason: "Generated by deterministic demo normalization.",
        summary: "Raw listing normalized into reviewable fields."
      }
    ],
    seller: listing.seller.displayName,
    sourceKind: "demo-fixture",
    status: "pending-review",
    updatedAt: listing.marketplace.observedAt
  };
}

export function buildDemoListingIntelligenceRecords() {
  const report = buildMarketplaceImportPipelineReport();

  return report.listings.map((listing) =>
    buildListingIntelligenceRecord(listing, report.listings)
  );
}

export function getDemoListingIntelligenceRecord(listingId: string) {
  return (
    buildDemoListingIntelligenceRecords().find(
      (listing) => listing.id === listingId
    ) ?? null
  );
}

export function getListingReadinessLabel(status: ListingReadinessStatus) {
  if (status === "ready") return "Ready for recommendation";
  if (status === "needs-review") return "Needs review";
  return "Not ready";
}
