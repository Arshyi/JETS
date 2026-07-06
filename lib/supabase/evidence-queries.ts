import {
  evidenceRecords,
  knowledgeConflicts,
  knowledgeTimelineEvents
} from "@/data/evidence";
import { getEvidenceSourceTrust } from "@/lib/evidence-engine";
import { getAdminGate } from "@/lib/supabase/admin";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createSupabaseServiceRoleClient,
  isSupabaseServiceRoleConfigured
} from "@/lib/supabase/service-role";
import type {
  EvidenceConfidence,
  EvidenceExtractionMethod,
  EvidenceSourceType,
  EvidenceSubjectType,
  EvidenceVerificationStatus,
  KnowledgeConflictStatus
} from "@/types/evidence";
import type {
  EvidenceConflictRow,
  EvidenceRecordRow,
  EvidenceReviewNoteRow,
  EvidenceSourceRow,
  EvidenceTimelineEventRow,
  ParsedFieldEvidenceLinkRow
} from "@/types/database";
import type { PlatformKnowledgeId } from "@/types/platform-knowledge";

export type EvidenceReviewRecord = {
  appVersion: string;
  claim: string;
  confidence: EvidenceConfidence;
  createdAt: string;
  extractionMethod: EvidenceExtractionMethod;
  id: string;
  isPersisted: boolean;
  platformId: string | null;
  reviewReason: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  sourceTitle: string;
  sourceType: EvidenceSourceType;
  sourceUrl: string | null;
  subjectId: string;
  subjectType: EvidenceSubjectType;
  submittedBy: string | null;
  supportingText: string;
  updatedAt: string;
  verificationStatus: EvidenceVerificationStatus;
  visibility: string;
};

export type EvidenceSourceView = {
  id: string;
  isPersisted: boolean;
  sourceType: EvidenceSourceType;
  title: string;
  trustWeight: number;
  verificationStatus: EvidenceVerificationStatus;
};

export type EvidenceConflictView = {
  claimId: string;
  conflictingEvidenceIds: string[];
  createdAt: string;
  currentHandling: string;
  id: string;
  isPersisted: boolean;
  platformId: string | null;
  status: KnowledgeConflictStatus;
  summary: string;
  title: string;
  verificationStatus: EvidenceVerificationStatus;
};

export type EvidenceTimelineView = {
  createdAt: string;
  dateLabel: string;
  description: string;
  evidenceRecordIds: string[];
  id: string;
  isPersisted: boolean;
  platformId: string;
  title: string;
  verificationStatus: EvidenceVerificationStatus;
};

export type EvidenceReviewNoteView = {
  action: string;
  createdAt: string;
  createdBy: string | null;
  evidenceRecordId: string | null;
  id: string;
  note: string;
  reason: string | null;
};

export type ParsedFieldEvidenceLinkView = {
  confidence: EvidenceConfidence;
  evidenceRecordId: string;
  extractionMethod: EvidenceExtractionMethod;
  fieldPath: string;
  id: string;
  normalizedListingId: string;
  sourceId: string | null;
  subjectId: string;
  subjectType: string;
  verificationStatus: EvidenceVerificationStatus;
};

export type EvidenceReviewState = {
  canModerate: boolean;
  conflicts: EvidenceConflictView[];
  isConfigured: boolean;
  isModerator: boolean;
  isServiceRoleConfigured: boolean;
  isSignedIn: boolean;
  links: ParsedFieldEvidenceLinkView[];
  message?: string;
  notes: EvidenceReviewNoteView[];
  pendingRecords: EvidenceReviewRecord[];
  records: EvidenceReviewRecord[];
  sources: EvidenceSourceView[];
  timeline: EvidenceTimelineView[];
  usesDemoFallback: boolean;
};

export type EvidenceRecordState = EvidenceReviewState & {
  record: EvidenceReviewRecord | null;
};

const sourceTypes = new Set<EvidenceSourceType>([
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
]);
const confidenceValues = new Set<EvidenceConfidence>([
  "low",
  "medium",
  "high",
  "very-high"
]);
const extractionMethods = new Set<EvidenceExtractionMethod>([
  "manual-curation",
  "deterministic-parser",
  "structured-spec-entry",
  "community-report",
  "moderator-review",
  "csv-import",
  "api-import",
  "future-ai-extraction",
  "future-ocr",
  "future-scraper"
]);
const subjectTypes = new Set<EvidenceSubjectType>([
  "platform-profile",
  "platform-specification",
  "platform-constraint",
  "platform-knowledge-card",
  "upgrade-opportunity",
  "adapter-intelligence",
  "marketplace-parsed-field",
  "solution-intelligence-finding",
  "compatibility-rule",
  "community-discovery"
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
const conflictStatuses = new Set<KnowledgeConflictStatus>([
  "open",
  "needs-review",
  "resolved",
  "accepted-with-warning"
]);

function toSourceType(value: string): EvidenceSourceType {
  return sourceTypes.has(value as EvidenceSourceType)
    ? (value as EvidenceSourceType)
    : "manual-research";
}

function toConfidence(value: string): EvidenceConfidence {
  return confidenceValues.has(value as EvidenceConfidence)
    ? (value as EvidenceConfidence)
    : "medium";
}

function toExtractionMethod(value: string): EvidenceExtractionMethod {
  return extractionMethods.has(value as EvidenceExtractionMethod)
    ? (value as EvidenceExtractionMethod)
    : "manual-curation";
}

function toSubjectType(value: string): EvidenceSubjectType {
  return subjectTypes.has(value as EvidenceSubjectType)
    ? (value as EvidenceSubjectType)
    : "platform-profile";
}

function toVerificationStatus(value: string): EvidenceVerificationStatus {
  return verificationStatuses.has(value as EvidenceVerificationStatus)
    ? (value as EvidenceVerificationStatus)
    : "pending-review";
}

function toConflictStatus(value: string): KnowledgeConflictStatus {
  return conflictStatuses.has(value as KnowledgeConflictStatus)
    ? (value as KnowledgeConflictStatus)
    : "needs-review";
}

function mapRecordRow(row: EvidenceRecordRow): EvidenceReviewRecord {
  return {
    appVersion: row.app_version,
    claim: row.claim,
    confidence: toConfidence(row.confidence),
    createdAt: row.created_at,
    extractionMethod: toExtractionMethod(row.extraction_method),
    id: row.id,
    isPersisted: true,
    platformId: row.platform_id,
    reviewReason: row.review_reason,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    sourceTitle: row.source_title,
    sourceType: toSourceType(row.source_type),
    sourceUrl: row.source_url,
    subjectId: row.subject_id,
    subjectType: toSubjectType(row.subject_type),
    submittedBy: row.submitted_by,
    supportingText: row.supporting_text,
    updatedAt: row.updated_at,
    verificationStatus: toVerificationStatus(row.verification_status),
    visibility: row.visibility
  };
}

function mapStaticRecord(record: (typeof evidenceRecords)[number]): EvidenceReviewRecord {
  return {
    appVersion: record.version,
    claim: record.claim,
    confidence: record.confidence,
    createdAt: record.dateAdded,
    extractionMethod: record.extractionMethod,
    id: record.id,
    isPersisted: false,
    platformId: record.platformId ?? null,
    reviewReason: null,
    reviewedAt: null,
    reviewedBy: null,
    sourceTitle: record.sourceTitle,
    sourceType: record.sourceType,
    sourceUrl: record.sourceUrl ?? null,
    subjectId: record.subjectId,
    subjectType: record.subjectType,
    submittedBy: null,
    supportingText: record.supportingText,
    updatedAt: record.dateAdded,
    verificationStatus: record.verificationStatus,
    visibility: "public"
  };
}

function mapSourceRow(row: EvidenceSourceRow): EvidenceSourceView {
  return {
    id: row.id,
    isPersisted: true,
    sourceType: toSourceType(row.source_type),
    title: row.title,
    trustWeight: row.trust_weight,
    verificationStatus: toVerificationStatus(row.verification_status)
  };
}

function mapConflictRow(row: EvidenceConflictRow): EvidenceConflictView {
  return {
    claimId: row.claim_id,
    conflictingEvidenceIds: row.conflicting_evidence_ids,
    createdAt: row.created_at,
    currentHandling: row.current_handling,
    id: row.id,
    isPersisted: true,
    platformId: row.platform_id,
    status: toConflictStatus(row.status),
    summary: row.summary,
    title: row.title,
    verificationStatus: toVerificationStatus(row.verification_status)
  };
}

function mapStaticConflict(
  conflict: (typeof knowledgeConflicts)[number]
): EvidenceConflictView {
  return {
    claimId: conflict.claimId,
    conflictingEvidenceIds: conflict.conflictingEvidenceIds,
    createdAt: "2026-07-05",
    currentHandling: conflict.currentHandling,
    id: conflict.id,
    isPersisted: false,
    platformId: conflict.platformId,
    status: conflict.status,
    summary: conflict.summary,
    title: conflict.title,
    verificationStatus: conflict.status === "resolved" ? "verified" : "disputed"
  };
}

function mapTimelineRow(row: EvidenceTimelineEventRow): EvidenceTimelineView {
  return {
    createdAt: row.created_at,
    dateLabel: row.date_label,
    description: row.description,
    evidenceRecordIds: row.evidence_record_ids,
    id: row.id,
    isPersisted: true,
    platformId: row.platform_id,
    title: row.title,
    verificationStatus: toVerificationStatus(row.verification_status)
  };
}

function mapStaticTimeline(
  event: (typeof knowledgeTimelineEvents)[number]
): EvidenceTimelineView {
  return {
    createdAt: "2026-07-05",
    dateLabel: event.dateLabel,
    description: event.description,
    evidenceRecordIds: event.evidenceIds,
    id: event.id,
    isPersisted: false,
    platformId: event.platformId,
    title: event.title,
    verificationStatus: event.verificationStatus
  };
}

function mapNoteRow(row: EvidenceReviewNoteRow): EvidenceReviewNoteView {
  return {
    action: row.action,
    createdAt: row.created_at,
    createdBy: row.created_by,
    evidenceRecordId: row.evidence_record_id,
    id: row.id,
    note: row.note,
    reason: row.reason
  };
}

function mapLinkRow(row: ParsedFieldEvidenceLinkRow): ParsedFieldEvidenceLinkView {
  return {
    confidence: toConfidence(row.confidence),
    evidenceRecordId: row.evidence_record_id,
    extractionMethod: toExtractionMethod(row.extraction_method),
    fieldPath: row.field_path,
    id: row.id,
    normalizedListingId: row.normalized_listing_id,
    sourceId: row.source_id,
    subjectId: row.subject_id,
    subjectType: row.subject_type,
    verificationStatus: toVerificationStatus(row.verification_status)
  };
}

function getStaticState(message?: string): EvidenceReviewState {
  const records = evidenceRecords.map(mapStaticRecord);

  return {
    canModerate: false,
    conflicts: knowledgeConflicts.map(mapStaticConflict),
    isConfigured: false,
    isModerator: false,
    isServiceRoleConfigured: false,
    isSignedIn: false,
    links: [],
    message,
    notes: [],
    pendingRecords: records.filter((record) =>
      ["unverified", "pending-review"].includes(record.verificationStatus)
    ),
    records,
    sources: Array.from(
      new Map(
        records.map((record) => [
          record.sourceType,
          {
            id: record.sourceType,
            isPersisted: false,
            sourceType: record.sourceType,
            title: record.sourceTitle,
            trustWeight: getEvidenceSourceTrust(record.sourceType),
            verificationStatus: record.verificationStatus
          }
        ])
      ).values()
    ),
    timeline: knowledgeTimelineEvents.map(mapStaticTimeline),
    usesDemoFallback: true
  };
}

export async function getEvidenceReviewState(): Promise<EvidenceReviewState> {
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
    sourcesResult,
    recordsResult,
    conflictsResult,
    timelineResult,
    notesResult,
    linksResult
  ] = await Promise.all([
    queryClient
      .from("evidence_sources")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(120),
    queryClient
      .from("evidence_records")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(220),
    queryClient
      .from("evidence_conflicts")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(100),
    queryClient
      .from("evidence_timeline_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(120),
    queryClient
      .from("evidence_review_notes")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(160),
    queryClient
      .from("parsed_field_evidence_links")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(160)
  ]);
  const persistedRecords = ((recordsResult.data ?? []) as EvidenceRecordRow[]).map(
    mapRecordRow
  );
  const staticRecords = evidenceRecords.map(mapStaticRecord);
  const persistedRecordIds = new Set(persistedRecords.map((record) => record.id));
  const records = [
    ...persistedRecords,
    ...staticRecords.filter((record) => !persistedRecordIds.has(record.id))
  ];
  const conflicts =
    ((conflictsResult.data ?? []) as EvidenceConflictRow[]).map(mapConflictRow);
  const persistedConflictIds = new Set(conflicts.map((conflict) => conflict.id));
  const timeline =
    ((timelineResult.data ?? []) as EvidenceTimelineEventRow[]).map(mapTimelineRow);
  const persistedTimelineIds = new Set(timeline.map((event) => event.id));

  return {
    canModerate: Boolean(adminGate.isAllowed && serviceClient),
    conflicts:
      conflicts.length > 0
        ? [
            ...conflicts,
            ...knowledgeConflicts
              .map(mapStaticConflict)
              .filter((conflict) => !persistedConflictIds.has(conflict.id))
          ]
        : knowledgeConflicts.map(mapStaticConflict),
    isConfigured: true,
    isModerator: adminGate.isAllowed,
    isServiceRoleConfigured: isSupabaseServiceRoleConfigured,
    isSignedIn: Boolean(user),
    links: ((linksResult.data ?? []) as ParsedFieldEvidenceLinkRow[]).map(mapLinkRow),
    message:
      sourcesResult.error?.message ??
      recordsResult.error?.message ??
      conflictsResult.error?.message ??
      timelineResult.error?.message ??
      notesResult.error?.message ??
      linksResult.error?.message ??
      (persistedRecords.length === 0
        ? "No persisted evidence records found yet. Showing seeded demo evidence."
        : undefined),
    notes: ((notesResult.data ?? []) as EvidenceReviewNoteRow[]).map(mapNoteRow),
    pendingRecords: records.filter((record) =>
      ["unverified", "pending-review"].includes(record.verificationStatus)
    ),
    records,
    sources:
      ((sourcesResult.data ?? []) as EvidenceSourceRow[]).map(mapSourceRow),
    timeline:
      timeline.length > 0
        ? [
            ...timeline,
            ...knowledgeTimelineEvents
              .map(mapStaticTimeline)
              .filter((event) => !persistedTimelineIds.has(event.id))
          ]
        : knowledgeTimelineEvents.map(mapStaticTimeline),
    usesDemoFallback: persistedRecords.length === 0
  };
}

export async function getEvidenceRecordState(recordId: string) {
  const state = await getEvidenceReviewState();
  const record = state.records.find((candidate) => candidate.id === recordId) ?? null;

  return {
    ...state,
    notes: state.notes.filter((note) => note.evidenceRecordId === recordId),
    record
  };
}

export async function getPlatformEvidenceState(platformId: PlatformKnowledgeId) {
  const state = await getEvidenceReviewState();

  return {
    ...state,
    conflicts: state.conflicts.filter((conflict) => conflict.platformId === platformId),
    records: state.records.filter((record) => record.platformId === platformId),
    timeline: state.timeline.filter((event) => event.platformId === platformId)
  };
}
