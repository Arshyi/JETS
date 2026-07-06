import { appVersion } from "@/lib/app-version";
import {
  acquisitionDraftToRawListing,
  acquisitionMarketplaceOptions,
  analyzeAcquisitionDraft,
  createAcquisitionSnapshot,
  defaultAcquisitionCorrections,
  defaultAcquisitionDraft
} from "@/lib/acquisition/workflow";
import { normalizeMarketplaceListing } from "@/lib/marketplace-intelligence/normalize";
import type {
  AcquisitionAnalysis,
  AcquisitionCorrection,
  AcquisitionCorrectionFieldId,
  AcquisitionDecisionStatus,
  AcquisitionDraft,
  AcquisitionMarketplaceId,
  AcquisitionPersonalNotes,
  AcquisitionRecord
} from "@/types/acquisition";
import type {
  AcquisitionCorrectionRow,
  AcquisitionRecordRow,
  Database,
  Json
} from "@/types/database";
import type { HardwareCondition } from "@/types/hardware";

export type AcquisitionRecordInsert =
  Database["public"]["Tables"]["acquisition_records"]["Insert"];

export type AcquisitionRecordUpdate =
  Database["public"]["Tables"]["acquisition_records"]["Update"];

export const persistedAcquisitionStatuses: AcquisitionDecisionStatus[] = [
  "reviewing",
  "ready",
  "archived",
  "purchased",
  "rejected"
];

const legacyStatusMap: Record<string, AcquisitionDecisionStatus> = {
  "needs-review": "reviewing",
  "recently-captured": "reviewing"
};

const acquisitionCorrectionFieldIds: AcquisitionCorrectionFieldId[] = [
  "cpu",
  "gpu",
  "ram",
  "platform",
  "price",
  "storage"
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function getString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function getNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getNullableNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function getPersonalNotes(value: Json): AcquisitionPersonalNotes {
  if (!isRecord(value)) {
    return defaultAcquisitionDraft.personalNotes;
  }

  return {
    general: getString(value.general),
    meetingLocation: getString(value.meetingLocation),
    missingAccessories: getString(value.missingAccessories),
    negotiationIdeas: getString(value.negotiationIdeas),
    repairNotes: getString(value.repairNotes),
    sellerConcerns: getString(value.sellerConcerns),
    whySaved: getString(value.whySaved)
  };
}

export function normalizeAcquisitionStatus(
  value: string | null | undefined
): AcquisitionDecisionStatus {
  if (value && persistedAcquisitionStatuses.includes(value as AcquisitionDecisionStatus)) {
    return value as AcquisitionDecisionStatus;
  }

  return value ? legacyStatusMap[value] ?? "reviewing" : "reviewing";
}

function normalizeMarketplaceId(value: string): AcquisitionMarketplaceId {
  return acquisitionMarketplaceOptions.some((option) => option.id === value)
    ? (value as AcquisitionMarketplaceId)
    : "manual-source";
}

function normalizeCondition(value: string): HardwareCondition {
  return ["excellent", "good", "fair", "broken"].includes(value)
    ? (value as HardwareCondition)
    : "good";
}

function normalizeCurrency(value: string): AcquisitionDraft["currency"] {
  return value === "USD" ? "USD" : "AED";
}

export function correctionRowToAcquisitionCorrection(
  row: AcquisitionCorrectionRow
): AcquisitionCorrection {
  return {
    fieldId: acquisitionCorrectionFieldIds.includes(
      row.field_id as AcquisitionCorrectionFieldId
    )
      ? (row.field_id as AcquisitionCorrectionFieldId)
      : "platform",
    isUnknown: row.is_unknown,
    value: row.corrected_value ?? ""
  };
}

export function mapAcquisitionRecordRow(
  row: AcquisitionRecordRow,
  correctionRows: AcquisitionCorrectionRow[] = []
): AcquisitionRecord {
  const analysisSnapshot = isRecord(row.analysis_snapshot)
    ? row.analysis_snapshot
    : {};
  const snapshot = isRecord(analysisSnapshot.snapshot)
    ? analysisSnapshot.snapshot
    : {};
  const fallbackCorrections = Array.isArray(analysisSnapshot.corrections)
    ? (analysisSnapshot.corrections as AcquisitionCorrection[])
    : defaultAcquisitionCorrections;
  const corrections =
    correctionRows.length > 0
      ? correctionRows.map(correctionRowToAcquisitionCorrection)
      : fallbackCorrections;

  return {
    corrections,
    createdAt: row.created_at,
    draft: {
      condition: normalizeCondition(row.condition),
      currency: normalizeCurrency(row.currency),
      description: row.description,
      imageCount: row.image_count,
      listingUrl: row.listing_url ?? "",
      location: row.location,
      marketplaceId: normalizeMarketplaceId(row.marketplace),
      personalNotes: getPersonalNotes(row.personal_notes),
      priceText: row.price_text,
      sellerNotes: row.seller_notes ?? "",
      title: row.title
    },
    id: row.id,
    snapshot: {
      confidence: row.confidence as AcquisitionRecord["snapshot"]["confidence"],
      detectedPlatformName: row.detected_platform_name,
      missingInformation: Array.isArray(snapshot.missingInformation)
        ? snapshot.missingInformation.map((item) => String(item))
        : [],
      priceAmount: getNullableNumber(row.price_amount),
      readiness: row.readiness as AcquisitionRecord["snapshot"]["readiness"],
      recommendationPreviewScore: row.recommendation_preview_score,
      title: row.title || getString(snapshot.title, "Untitled acquisition")
    },
    status: normalizeAcquisitionStatus(row.status),
    updatedAt: row.updated_at
  };
}

export function createAcquisitionPersistencePayload({
  corrections,
  draft,
  status,
  userId
}: {
  corrections: AcquisitionCorrection[];
  draft: AcquisitionDraft;
  status: AcquisitionDecisionStatus;
  userId: string;
}) {
  const source =
    acquisitionMarketplaceOptions.find((option) => option.id === draft.marketplaceId) ??
    acquisitionMarketplaceOptions[acquisitionMarketplaceOptions.length - 1];
  const rawListing = acquisitionDraftToRawListing(draft);
  const normalizedListing = normalizeMarketplaceListing(rawListing);
  const analysis = analyzeAcquisitionDraft(draft, corrections);
  const snapshot = createAcquisitionSnapshot(draft, analysis);
  const row: AcquisitionRecordInsert = {
    analysis_snapshot: toJson({
      analysis,
      corrections,
      snapshot
    }),
    app_version: appVersion,
    condition: draft.condition,
    confidence: analysis.confidence,
    currency: draft.currency,
    description: draft.description,
    detected_platform_id: analysis.detectedPlatformId,
    detected_platform_name: analysis.detectedPlatformName,
    image_count: draft.imageCount,
    listing_url: draft.listingUrl || null,
    location: draft.location,
    marketplace: draft.marketplaceId,
    normalized_payload: toJson(normalizedListing),
    personal_notes: toJson(draft.personalNotes),
    price_amount: analysis.priceAmount,
    price_text: draft.priceText,
    raw_payload: toJson(rawListing),
    readiness: analysis.readiness,
    recommendation_preview_score: analysis.recommendationPreviewScore,
    seller_notes: draft.sellerNotes || null,
    source_id: source.sourceId,
    status,
    title: draft.title || "Untitled acquisition",
    user_id: userId
  };

  return {
    analysis,
    normalizedListing,
    rawListing,
    row,
    snapshot
  };
}

export function getAcquisitionAnalysisFromRow(
  row: AcquisitionRecordRow
): AcquisitionAnalysis | null {
  if (!isRecord(row.analysis_snapshot)) {
    return null;
  }

  return isRecord(row.analysis_snapshot.analysis)
    ? (row.analysis_snapshot.analysis as unknown as AcquisitionAnalysis)
    : null;
}

export function parseAcquisitionDraft(value: string): AcquisitionDraft {
  const parsed = JSON.parse(value) as Partial<AcquisitionDraft>;

  return {
    condition: normalizeCondition(getString(parsed.condition, "good")),
    currency: normalizeCurrency(getString(parsed.currency, "AED")),
    description: getString(parsed.description).slice(0, 3000),
    imageCount: Math.max(0, Math.min(24, getNumber(parsed.imageCount))),
    listingUrl: getString(parsed.listingUrl).slice(0, 500),
    location: getString(parsed.location, "Unknown").slice(0, 160),
    marketplaceId: normalizeMarketplaceId(getString(parsed.marketplaceId)),
    personalNotes: getPersonalNotes(toJson(parsed.personalNotes ?? {})),
    priceText: getString(parsed.priceText).slice(0, 80),
    sellerNotes: getString(parsed.sellerNotes).slice(0, 1200),
    title: getString(parsed.title, "Untitled acquisition").slice(0, 240)
  };
}

export function parseAcquisitionCorrections(value: string): AcquisitionCorrection[] {
  const parsed = JSON.parse(value) as Array<Partial<AcquisitionCorrection>>;

  return defaultAcquisitionCorrections.map((fallback) => {
    const match = parsed.find((item) => item.fieldId === fallback.fieldId);

    return {
      fieldId: fallback.fieldId,
      isUnknown: Boolean(match?.isUnknown),
      value: getString(match?.value).slice(0, 240)
    };
  });
}

export function getPersistableCorrections(corrections: AcquisitionCorrection[]) {
  return corrections.filter((correction) => correction.isUnknown || correction.value.trim());
}
