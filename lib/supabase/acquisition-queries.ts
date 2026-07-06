import {
  getAcquisitionAnalysisFromRow,
  mapAcquisitionRecordRow,
  normalizeAcquisitionStatus,
  persistedAcquisitionStatuses
} from "@/lib/acquisition/persistence";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AcquisitionDecisionStatus,
  AcquisitionPersistenceState,
  AcquisitionRecord
} from "@/types/acquisition";
import type {
  AcquisitionCompareSetRow,
  AcquisitionCorrectionRow,
  AcquisitionDecisionRow,
  AcquisitionNoteRow,
  AcquisitionProjectLinkRow,
  AcquisitionRecordRow,
  BuildProjectRow
} from "@/types/database";

export type AcquisitionHistoryFilters = {
  marketplace?: string;
  source?: string;
  status?: string;
};

export type AcquisitionDetailState = AcquisitionPersistenceState & {
  analysis: ReturnType<typeof getAcquisitionAnalysisFromRow>;
  compareSets: AcquisitionCompareSetRow[];
  corrections: AcquisitionCorrectionRow[];
  decisions: AcquisitionDecisionRow[];
  notes: AcquisitionNoteRow[];
  projectLinks: AcquisitionProjectLinkRow[];
  projects: Array<Pick<BuildProjectRow, "id" | "status" | "title">>;
  record: AcquisitionRecord | null;
  row: AcquisitionRecordRow | null;
};

async function getAcquisitionUserAndClient() {
  if (!isSupabaseConfigured) {
    return {
      client: null,
      message: supabaseSetupMessage,
      userId: null
    };
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      client: null,
      message: supabaseSetupMessage,
      userId: null
    };
  }

  const {
    data: { user }
  } = await client.auth.getUser();

  return {
    client,
    message: undefined,
    userId: user?.id ?? null
  };
}

export async function getAcquisitionHistoryState(
  filters: AcquisitionHistoryFilters = {}
): Promise<AcquisitionPersistenceState & { compareSets: AcquisitionCompareSetRow[] }> {
  const { client, message, userId } = await getAcquisitionUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      compareSets: [],
      data: [],
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return {
      compareSets: [],
      data: [],
      isConfigured: true,
      isSignedIn: false
    };
  }

  let recordsQuery = client
    .from("acquisition_records")
    .select("*")
    .eq("user_id", userId);

  if (
    filters.status &&
    persistedAcquisitionStatuses.includes(filters.status as AcquisitionDecisionStatus)
  ) {
    recordsQuery = recordsQuery.eq(
      "status",
      normalizeAcquisitionStatus(filters.status)
    );
  }

  if (filters.marketplace) {
    recordsQuery = recordsQuery.eq("marketplace", filters.marketplace);
  }

  if (filters.source) {
    recordsQuery = recordsQuery.eq("source_id", filters.source);
  }

  const [recordsResult, compareSetsResult] = await Promise.all([
    recordsQuery.order("updated_at", { ascending: false }),
    client
      .from("acquisition_compare_sets")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
  ]);

  return {
    compareSets: compareSetsResult.data ?? [],
    data: ((recordsResult.data ?? []) as AcquisitionRecordRow[]).map((row) =>
      mapAcquisitionRecordRow(row)
    ),
    isConfigured: true,
    isSignedIn: true,
    message: recordsResult.error?.message ?? compareSetsResult.error?.message
  };
}

export async function getAcquisitionDetailState(
  acquisitionId: string
): Promise<AcquisitionDetailState> {
  const { client, message, userId } = await getAcquisitionUserAndClient();
  const emptyState: AcquisitionDetailState = {
    analysis: null,
    compareSets: [],
    corrections: [],
    data: [],
    decisions: [],
    isConfigured: Boolean(isSupabaseConfigured && client),
    isSignedIn: Boolean(userId),
    message,
    notes: [],
    projectLinks: [],
    projects: [],
    record: null,
    row: null
  };

  if (!isSupabaseConfigured || !client) {
    return { ...emptyState, isConfigured: false, isSignedIn: false };
  }

  if (!userId) {
    return { ...emptyState, isConfigured: true, isSignedIn: false };
  }

  const { data: row, error: recordError } = await client
    .from("acquisition_records")
    .select("*")
    .eq("id", acquisitionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!row) {
    return {
      ...emptyState,
      isConfigured: true,
      isSignedIn: true,
      message: recordError?.message
    };
  }

  const [
    correctionsResult,
    notesResult,
    decisionsResult,
    linksResult,
    compareSetsResult,
    projectsResult
  ] = await Promise.all([
    client
      .from("acquisition_corrections")
      .select("*")
      .eq("acquisition_id", acquisitionId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    client
      .from("acquisition_notes")
      .select("*")
      .eq("acquisition_id", acquisitionId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    client
      .from("acquisition_decisions")
      .select("*")
      .eq("acquisition_id", acquisitionId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    client
      .from("acquisition_project_links")
      .select("*")
      .eq("acquisition_id", acquisitionId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    client
      .from("acquisition_compare_sets")
      .select("*")
      .eq("user_id", userId)
      .contains("acquisition_ids", [acquisitionId])
      .order("updated_at", { ascending: false }),
    client
      .from("build_projects")
      .select("id,title,status")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
  ]);
  const corrections = (correctionsResult.data ?? []) as AcquisitionCorrectionRow[];
  const acquisitionRow = row as AcquisitionRecordRow;

  return {
    analysis: getAcquisitionAnalysisFromRow(acquisitionRow),
    compareSets: compareSetsResult.data ?? [],
    corrections,
    data: [mapAcquisitionRecordRow(acquisitionRow, corrections)],
    decisions: decisionsResult.data ?? [],
    isConfigured: true,
    isSignedIn: true,
    message:
      correctionsResult.error?.message ??
      notesResult.error?.message ??
      decisionsResult.error?.message ??
      linksResult.error?.message ??
      compareSetsResult.error?.message ??
      projectsResult.error?.message,
    notes: notesResult.data ?? [],
    projectLinks: linksResult.data ?? [],
    projects: (projectsResult.data ?? []) as Array<
      Pick<BuildProjectRow, "id" | "status" | "title">
    >,
    record: mapAcquisitionRecordRow(acquisitionRow, corrections),
    row: acquisitionRow
  };
}
