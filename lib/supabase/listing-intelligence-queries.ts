import {
  buildDemoListingIntelligenceRecords,
  buildListingIntelligenceRecord,
  listingFutureHooks
} from "@/lib/listing-intelligence/engine";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/config";
import { getAdminGate } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createSupabaseServiceRoleClient,
  isSupabaseServiceRoleConfigured
} from "@/lib/supabase/service-role";
import type {
  ListingDuplicateCandidate,
  ListingDuplicateSignal,
  ListingFieldReviewStatus,
  ListingIntelligenceRecord,
  ListingIntelligenceRecordState,
  ListingIntelligenceState,
  ListingModerationStatus,
  ListingParsedField,
  ListingReviewEvent,
  ListingSourceKind,
  ListingStatus
} from "@/types/listing-intelligence";
import type {
  EvidenceConfidence,
  EvidenceVerificationStatus
} from "@/types/evidence";
import type {
  ListingDuplicateCandidateRow,
  ListingFieldCorrectionRow,
  ListingParsedFieldRow,
  ListingReviewEventRow,
  NormalizedMarketplaceListingRow
} from "@/types/database";
import type { MarketplaceNormalizedListing } from "@/types/marketplace-intelligence";

const confidenceValues = new Set<EvidenceConfidence>([
  "low",
  "medium",
  "high",
  "very-high"
]);
const verificationStatuses = new Set<EvidenceVerificationStatus>([
  "unverified",
  "pending-review",
  "verified",
  "deprecated",
  "disputed",
  "superseded",
  "archived"
]);
const listingStatuses = new Set<ListingStatus>([
  "active",
  "needs-review",
  "ready-for-recommendation",
  "hidden",
  "archived"
]);
const moderationStatuses = new Set<ListingModerationStatus>([
  "unverified",
  "pending-review",
  "verified",
  "disputed",
  "deprecated",
  "superseded",
  "archived"
]);
const fieldReviewStatuses = new Set<ListingFieldReviewStatus>([
  "pending-review",
  "accepted",
  "rejected",
  "corrected",
  "unknown"
]);
const sourceKinds = new Set<ListingSourceKind>([
  "demo-fixture",
  "manual-entry",
  "future-scraper",
  "future-browser-extension",
  "future-csv-import",
  "future-marketplace-api",
  "future-ocr",
  "future-ai-extraction"
]);

function toConfidence(value: string): EvidenceConfidence {
  return confidenceValues.has(value as EvidenceConfidence)
    ? (value as EvidenceConfidence)
    : "medium";
}

function toVerificationStatus(value: string): EvidenceVerificationStatus {
  return verificationStatuses.has(value as EvidenceVerificationStatus)
    ? (value as EvidenceVerificationStatus)
    : "pending-review";
}

function toModerationStatus(value: string): ListingModerationStatus {
  return moderationStatuses.has(value as ListingModerationStatus)
    ? (value as ListingModerationStatus)
    : "pending-review";
}

function toListingStatus(value: string): ListingStatus {
  return listingStatuses.has(value as ListingStatus)
    ? (value as ListingStatus)
    : "needs-review";
}

function toFieldReviewStatus(value: string): ListingFieldReviewStatus {
  return fieldReviewStatuses.has(value as ListingFieldReviewStatus)
    ? (value as ListingFieldReviewStatus)
    : "pending-review";
}

function toSourceKind(value: string): ListingSourceKind {
  return sourceKinds.has(value as ListingSourceKind)
    ? (value as ListingSourceKind)
    : "manual-entry";
}

function parseSignals(value: unknown): ListingDuplicateSignal[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const signal = item as Record<string, unknown>;

      return {
        label: typeof signal.label === "string" ? signal.label : "Duplicate signal",
        reason: typeof signal.reason === "string" ? signal.reason : "Signal preserved.",
        weight: typeof signal.weight === "number" ? signal.weight : 0
      };
    })
    .filter((item): item is ListingDuplicateSignal => Boolean(item));
}

function getPersistedNormalizedListing(
  row: NormalizedMarketplaceListingRow,
  demoRecords: ListingIntelligenceRecord[]
): MarketplaceNormalizedListing {
  const demoMatch = demoRecords.find((record) => record.id === row.listing_key);

  if (demoMatch) {
    return demoMatch.normalized;
  }

  return row.normalized_payload as unknown as MarketplaceNormalizedListing;
}

function mapFieldRow(row: ListingParsedFieldRow): ListingParsedField {
  return {
    confidence: toConfidence(row.confidence),
    correctionReason: row.correction_reason,
    evidenceRecordIds: row.evidence_record_ids,
    fieldPath: row.field_path,
    id: row.id,
    label: row.field_label,
    parsedValue: row.parsed_value,
    reviewStatus: toFieldReviewStatus(row.review_status),
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    source: row.field_source as ListingParsedField["source"],
    value: row.final_value ?? row.corrected_value ?? row.parsed_value,
    verificationStatus: toVerificationStatus(row.verification_status)
  };
}

function mapCorrectionRow(row: ListingFieldCorrectionRow) {
  return {
    afterValue: row.after_value,
    beforeValue: row.before_value,
    createdAt: row.created_at,
    evidenceRecordId: row.evidence_record_id,
    fieldPath: row.field_path,
    id: row.id,
    reason: row.reason,
    reviewerId: row.created_by
  };
}

function mapDuplicateRow(
  row: ListingDuplicateCandidateRow,
  titleByKey: Map<string, string>
): ListingDuplicateCandidate {
  const key = row.candidate_listing_key ?? row.candidate_listing_id ?? "unknown";

  return {
    candidateListingId: key,
    candidateTitle: titleByKey.get(key) ?? key,
    confidence: toConfidence(row.confidence),
    signals: parseSignals(row.signals),
    status:
      row.status === "likely-duplicate" || row.status === "distinct"
        ? row.status
        : "possible-duplicate"
  };
}

function mapEventRow(row: ListingReviewEventRow): ListingReviewEvent {
  return {
    action: row.action,
    createdAt: row.created_at,
    createdBy: row.created_by,
    fieldPath: null,
    id: row.id,
    reason: row.reason,
    summary: row.summary
  };
}

function groupByListingId<T extends { normalized_listing_id: string | null }>(
  rows: T[]
) {
  return rows.reduce((groups, row) => {
    if (!row.normalized_listing_id) {
      return groups;
    }

    const existing = groups.get(row.normalized_listing_id) ?? [];

    existing.push(row);
    groups.set(row.normalized_listing_id, existing);

    return groups;
  }, new Map<string, T[]>());
}

function getStaticState(message?: string): ListingIntelligenceState {
  const listings = buildDemoListingIntelligenceRecords();

  return {
    canModerate: false,
    duplicateCandidates: listings.flatMap((listing) => listing.duplicateCandidates),
    futureHooks: listingFutureHooks,
    isConfigured: false,
    isServiceRoleConfigured: false,
    isSignedIn: false,
    listings,
    message,
    pendingFields: listings.flatMap((listing) =>
      listing.fields.filter((field) => field.reviewStatus === "pending-review")
    ),
    pendingListings: listings.filter((listing) => listing.status === "pending-review"),
    usesDemoFallback: true
  };
}

export async function getListingIntelligenceState(): Promise<ListingIntelligenceState> {
  if (!isSupabaseConfigured) {
    return getStaticState(supabaseSetupMessage);
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return getStaticState(supabaseSetupMessage);
  }

  const {
    data: { user }
  } = await client.auth.getUser();
  const adminGate = await getAdminGate();
  const serviceClient =
    adminGate.isAllowed && isSupabaseServiceRoleConfigured
      ? createSupabaseServiceRoleClient()
      : null;
  const queryClient = serviceClient ?? client;
  const [
    listingsResult,
    fieldsResult,
    correctionsResult,
    duplicatesResult,
    eventsResult
  ] = await Promise.all([
    queryClient
      .from("normalized_marketplace_listings")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(120),
    queryClient
      .from("listing_parsed_fields")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(600),
    queryClient
      .from("listing_field_corrections")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300),
    queryClient
      .from("listing_duplicate_candidates")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300),
    queryClient
      .from("listing_review_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(300)
  ]);
  const demoRecords = buildDemoListingIntelligenceRecords();
  const persistedRows =
    (listingsResult.data ?? []) as NormalizedMarketplaceListingRow[];
  const fieldsByListing = groupByListingId(
    (fieldsResult.data ?? []) as ListingParsedFieldRow[]
  );
  const correctionsByListing = groupByListingId(
    (correctionsResult.data ?? []) as ListingFieldCorrectionRow[]
  );
  const duplicatesByListing = groupByListingId(
    (duplicatesResult.data ?? []) as ListingDuplicateCandidateRow[]
  );
  const eventsByListing = groupByListingId(
    (eventsResult.data ?? []) as ListingReviewEventRow[]
  );
  const titleByKey = new Map(
    [
      ...demoRecords.map((record) => [record.id, record.normalized.title] as const),
      ...persistedRows.map((row) => [row.listing_key, row.raw_title] as const)
    ]
  );
  const persistedRecords = persistedRows.map((row) => {
    const normalized = getPersistedNormalizedListing(row, demoRecords);
    const base = buildListingIntelligenceRecord(normalized);
    const fields =
      fieldsByListing.get(row.id)?.map(mapFieldRow) ??
      base.fields.map((field) => ({
        ...field,
        verificationStatus: toVerificationStatus(row.verification_status)
      }));
    const corrections =
      correctionsByListing.get(row.id)?.map(mapCorrectionRow) ?? [];
    const duplicateCandidates =
      duplicatesByListing.get(row.id)?.map((candidate) =>
        mapDuplicateRow(candidate, titleByKey)
      ) ?? base.duplicateCandidates;
    const reviewEvents =
      eventsByListing.get(row.id)?.map(mapEventRow) ?? base.reviewEvents;

    return {
      ...base,
      corrections,
      duplicateCandidates,
      evidenceRecordIds: row.evidence_record_ids,
      fields,
      health: {
        ...base.health,
        score: row.listing_health_score,
        summary:
          typeof row.listing_health === "object" &&
          row.listing_health !== null &&
          "summary" in row.listing_health &&
          typeof row.listing_health.summary === "string"
            ? row.listing_health.summary
            : base.health.summary
      },
      id: row.listing_key,
      isPersisted: true,
      listingStatus: toListingStatus(row.listing_status),
      normalizedPlatformId: row.normalized_platform_id as typeof base.normalizedPlatformId,
      parsingConfidence: toConfidence(row.parsing_confidence),
      priceAmount: row.price,
      recommendationPreview: {
        ...base.recommendationPreview,
        readinessReasons: row.readiness_reasons,
        recommendationReadiness:
          row.recommendation_readiness === "ready" ||
          row.recommendation_readiness === "not-ready"
            ? row.recommendation_readiness
            : "needs-review"
      },
      reviewEvents,
      seller: row.seller ?? base.seller,
      sourceKind: toSourceKind(row.source_kind),
      status: toModerationStatus(row.verification_status),
      updatedAt: row.updated_at
    } satisfies ListingIntelligenceRecord;
  });
  const persistedKeys = new Set(persistedRecords.map((record) => record.id));
  const listings = [
    ...persistedRecords,
    ...demoRecords.filter((record) => !persistedKeys.has(record.id))
  ];

  return {
    canModerate: Boolean(adminGate.isAllowed && serviceClient),
    duplicateCandidates: listings.flatMap((listing) => listing.duplicateCandidates),
    futureHooks: listingFutureHooks,
    isConfigured: true,
    isServiceRoleConfigured: isSupabaseServiceRoleConfigured,
    isSignedIn: Boolean(user),
    listings,
    message:
      listingsResult.error?.message ??
      fieldsResult.error?.message ??
      correctionsResult.error?.message ??
      duplicatesResult.error?.message ??
      eventsResult.error?.message ??
      (persistedRows.length === 0
        ? "No persisted listing intelligence records found yet. Showing representative demo listings."
        : undefined),
    pendingFields: listings.flatMap((listing) =>
      listing.fields.filter((field) => field.reviewStatus === "pending-review")
    ),
    pendingListings: listings.filter((listing) => listing.status === "pending-review"),
    usesDemoFallback: persistedRows.length === 0
  };
}

export async function getListingIntelligenceRecordState(
  listingId: string
): Promise<ListingIntelligenceRecordState> {
  const state = await getListingIntelligenceState();

  return {
    ...state,
    listing: state.listings.find((listing) => listing.id === listingId) ?? null
  };
}
