import { mockHardwareListings } from "@/data/mock-listings";
import { readBuildSnapshot } from "@/lib/build-snapshots/snapshot";
import { buildWorkspaceProjectFromRows } from "@/lib/solution-builder/projects";
import { createBuildWorkspaceModel } from "@/lib/solution-builder/workspace";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AcquisitionProjectLinkRow,
  AcquisitionRecordRow,
  ActionPlanAuditEventRow,
  ActionPlanCommentRow,
  ActionPlanDependencyRow,
  ActionPlanProgressRow,
  ActionPlanTaskRow,
  BuildHistoryRow,
  BuildProjectAuditEventRow,
  BuildProjectNoteRow,
  BuildProjectOptimizationRunRow,
  BuildProjectOptimizationSuggestionRow,
  BuildProjectRow,
  BuildProjectSlotRow,
  BuildSnapshotRow,
  DecisionAuditEventRow,
  FavoriteBuildRow,
  SavedBuildRow,
  UserSettingsRow
} from "@/types/database";
import type { BuildGeneratorInput } from "@/types/build-generator";
import type { DecisionAuditSubjectType } from "@/types/decision-audit";
import type { AuthGateState, SearchPersistenceState } from "@/types/persistence";
import type {
  BuildSlotId,
  BuildWorkspaceModel
} from "@/types/solution-builder";

export type BuildProjectDashboardSummary = {
  branchCount: number;
  lastActivity: BuildProjectAuditEventRow | null;
  latestOptimizationRun: BuildProjectOptimizationRunRow | null;
  missingRequiredSlots: string[];
  model: BuildWorkspaceModel;
  optimizationRunCount: number;
  project: BuildProjectRow;
  recommendedNextAction: {
    description: string;
    href: string;
    label: string;
  };
  selectedRequiredSlotCount: number;
  totalRequiredSlotCount: number;
};

async function getUserAndClient() {
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

export async function getSearchPersistenceState(): Promise<SearchPersistenceState> {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      favoriteListingIds: [],
      isConfigured: false,
      isSignedIn: false,
      message,
      savedListingIds: []
    };
  }

  if (!userId) {
    return {
      favoriteListingIds: [],
      isConfigured: true,
      isSignedIn: false,
      savedListingIds: []
    };
  }

  const [savedResult, favoriteResult] = await Promise.all([
    client.from("saved_builds").select("listing_id").eq("user_id", userId),
    client.from("favorite_builds").select("listing_id").eq("user_id", userId)
  ]);

  return {
    favoriteListingIds:
      favoriteResult.data?.map((favorite) => favorite.listing_id) ?? [],
    isConfigured: true,
    isSignedIn: true,
    message: savedResult.error?.message ?? favoriteResult.error?.message,
    savedListingIds: savedResult.data?.map((saved) => saved.listing_id) ?? []
  };
}

export async function getPersistenceGateState(): Promise<AuthGateState> {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  return {
    isConfigured: true,
    isSignedIn: Boolean(userId)
  };
}

export async function getSavedBuilds() {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return { data: [] as SavedBuildRow[], isConfigured: false, isSignedIn: false, message };
  }

  if (!userId) {
    return { data: [] as SavedBuildRow[], isConfigured: true, isSignedIn: false };
  }

  const { data, error } = await client
    .from("saved_builds")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  return {
    data: data ?? [],
    isConfigured: true,
    isSignedIn: true,
    message: error?.message
  };
}

export async function getFavoriteBuilds() {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: [] as FavoriteBuildRow[],
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return { data: [] as FavoriteBuildRow[], isConfigured: true, isSignedIn: false };
  }

  const { data, error } = await client
    .from("favorite_builds")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return {
    data: data ?? [],
    isConfigured: true,
    isSignedIn: true,
    message: error?.message
  };
}

export async function getBuildHistory() {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: [] as BuildHistoryRow[],
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return { data: [] as BuildHistoryRow[], isConfigured: true, isSignedIn: false };
  }

  const { data, error } = await client
    .from("build_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    data: data ?? [],
    isConfigured: true,
    isSignedIn: true,
    message: error?.message
  };
}

export async function getDecisionAuditEvents(limit = 80) {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: [] as DecisionAuditEventRow[],
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return {
      data: [] as DecisionAuditEventRow[],
      isConfigured: true,
      isSignedIn: false
    };
  }

  const { data, error } = await client
    .from("decision_audit_events")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return {
    data: data ?? [],
    isConfigured: true,
    isSignedIn: true,
    message: error?.message
  };
}

export async function getDecisionAuditEventsForSubjects(
  subjectType: DecisionAuditSubjectType,
  subjectIds: string[],
  limit = 40
) {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: [] as DecisionAuditEventRow[],
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return {
      data: [] as DecisionAuditEventRow[],
      isConfigured: true,
      isSignedIn: false
    };
  }

  if (subjectIds.length === 0) {
    return {
      data: [] as DecisionAuditEventRow[],
      isConfigured: true,
      isSignedIn: true
    };
  }

  const { data, error } = await client
    .from("decision_audit_events")
    .select("*")
    .eq("user_id", userId)
    .eq("subject_type", subjectType)
    .in("subject_id", subjectIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  return {
    data: data ?? [],
    isConfigured: true,
    isSignedIn: true,
    message: error?.message
  };
}

export async function getUserSettings() {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: null as UserSettingsRow | null,
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return { data: null as UserSettingsRow | null, isConfigured: true, isSignedIn: false };
  }

  const { data, error } = await client
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    data,
    isConfigured: true,
    isSignedIn: true,
    message: error?.message
  };
}

export async function getBuildSnapshots() {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: [] as BuildSnapshotRow[],
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return { data: [] as BuildSnapshotRow[], isConfigured: true, isSignedIn: false };
  }

  const { data, error } = await client
    .from("build_snapshots")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return {
    data: data ?? [],
    isConfigured: true,
    isSignedIn: true,
    message: error?.message
  };
}

export async function getBuildProjects() {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: [] as BuildProjectRow[],
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return {
      data: [] as BuildProjectRow[],
      isConfigured: true,
      isSignedIn: false
    };
  }

  const { data, error } = await client
    .from("build_projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  return {
    data: data ?? [],
    isConfigured: true,
    isSignedIn: true,
    message: error?.message
  };
}

function getSlotInventoryHref(projectId: string, slotId: BuildSlotId) {
  const params = new URLSearchParams({
    projectId,
    returnTo: `/solution-builder/projects/${projectId}`,
    slot: slotId
  });

  return `/inventory?${params.toString()}`;
}

function getDashboardNextAction(
  projectId: string,
  model: BuildWorkspaceModel,
  optimizationRunCount: number,
  branchCount: number
) {
  const firstMissingRequiredSlot = model.evaluation.slots.find(
    (slot) =>
      slot.definition.requirement === "required" && slot.status === "missing"
  );

  if (firstMissingRequiredSlot) {
    return {
      description: `No ${firstMissingRequiredSlot.definition.label.toLowerCase()} selected yet.`,
      href: getSlotInventoryHref(projectId, firstMissingRequiredSlot.definition.id),
      label: `Add ${firstMissingRequiredSlot.definition.label}`
    };
  }

  if (model.evaluation.blockingCount + model.evaluation.warningCount > 0) {
    return {
      description: "The build has validation warnings to review before optimizing.",
      href: `/solution-builder/projects/${projectId}`,
      label: "Review validation"
    };
  }

  if (optimizationRunCount === 0) {
    return {
      description: "No optimization runs yet. Let JETS analyze unlocked slots.",
      href: `/solution-builder/projects/${projectId}/optimize`,
      label: "Optimize this build"
    };
  }

  if (branchCount === 0) {
    return {
      description: "No branches yet. Try another scenario without changing the original.",
      href: `/solution-builder/projects/${projectId}/optimize`,
      label: "Try another scenario"
    };
  }

  return {
    description: "The project is ready for comparison and final review.",
    href: `/solution-builder/projects/${projectId}`,
    label: "Review finished solution"
  };
}

export async function getBuildProjectDashboard() {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: [] as BuildProjectDashboardSummary[],
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return {
      data: [] as BuildProjectDashboardSummary[],
      isConfigured: true,
      isSignedIn: false
    };
  }

  const { data: projects, error: projectsError } = await client
    .from("build_projects")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  const projectRows = (projects ?? []) as BuildProjectRow[];
  const projectIds = projectRows.map((project) => project.id);

  if (projectIds.length === 0) {
    return {
      data: [] as BuildProjectDashboardSummary[],
      isConfigured: true,
      isSignedIn: true,
      message: projectsError?.message
    };
  }

  const [slotsResult, auditResult, runsResult] = await Promise.all([
    client
      .from("build_project_slots")
      .select("*")
      .eq("user_id", userId)
      .in("project_id", projectIds),
    client
      .from("build_project_audit_events")
      .select("*")
      .eq("user_id", userId)
      .in("project_id", projectIds)
      .order("created_at", { ascending: false })
      .limit(200),
    client
      .from("build_project_optimization_runs")
      .select("*")
      .eq("user_id", userId)
      .in("project_id", projectIds)
      .order("created_at", { ascending: false })
      .limit(200)
  ]);
  const slotsByProject = new Map<string, BuildProjectSlotRow[]>();
  const auditByProject = new Map<string, BuildProjectAuditEventRow[]>();
  const runsByProject = new Map<string, BuildProjectOptimizationRunRow[]>();

  for (const slot of (slotsResult.data ?? []) as BuildProjectSlotRow[]) {
    slotsByProject.set(slot.project_id, [
      ...(slotsByProject.get(slot.project_id) ?? []),
      slot
    ]);
  }

  for (const event of (auditResult.data ?? []) as BuildProjectAuditEventRow[]) {
    auditByProject.set(event.project_id, [
      ...(auditByProject.get(event.project_id) ?? []),
      event
    ]);
  }

  for (const run of (runsResult.data ?? []) as BuildProjectOptimizationRunRow[]) {
    runsByProject.set(run.project_id, [
      ...(runsByProject.get(run.project_id) ?? []),
      run
    ]);
  }

  const summaries = projectRows.map((project) => {
    const projectSlots = slotsByProject.get(project.id) ?? [];
    const workspaceProject = buildWorkspaceProjectFromRows(project, projectSlots);
    const model = createBuildWorkspaceModel(workspaceProject);
    const requiredSlots = model.evaluation.slots.filter(
      (slot) => slot.definition.requirement === "required"
    );
    const missingRequiredSlots = requiredSlots
      .filter((slot) => slot.status === "missing")
      .map((slot) => slot.definition.label);
    const rootProjectId = project.root_project_id ?? project.id;
    const branchCount = projectRows.filter(
      (candidate) =>
        candidate.id !== project.id &&
        (candidate.root_project_id ?? candidate.id) === rootProjectId
    ).length;
    const optimizationRuns = runsByProject.get(project.id) ?? [];

    return {
      branchCount,
      lastActivity: auditByProject.get(project.id)?.[0] ?? null,
      latestOptimizationRun: optimizationRuns[0] ?? null,
      missingRequiredSlots,
      model,
      optimizationRunCount: optimizationRuns.length,
      project,
      recommendedNextAction: getDashboardNextAction(
        project.id,
        model,
        optimizationRuns.length,
        branchCount
      ),
      selectedRequiredSlotCount: requiredSlots.length - missingRequiredSlots.length,
      totalRequiredSlotCount: requiredSlots.length
    };
  });

  return {
    data: summaries,
    isConfigured: true,
    isSignedIn: true,
    message:
      projectsError?.message ??
      slotsResult.error?.message ??
      auditResult.error?.message ??
      runsResult.error?.message
  };
}

export async function getBuildProjectDetail(projectId: string) {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: null,
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return {
      data: null,
      isConfigured: true,
      isSignedIn: false
    };
  }

  const { data: projectRow, error: projectError } = await client
    .from("build_projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!projectRow) {
    return {
      data: null,
      isConfigured: true,
      isSignedIn: true,
      message: projectError?.message
    };
  }

  const lineageRootId = projectRow.root_project_id ?? projectRow.id;
  const [
    slotsResult,
    notesResult,
    auditResult,
    branchesResult,
    optimizationRunsResult,
    acquisitionLinksResult,
    actionPlanTasksResult,
    actionPlanProgressResult,
    actionPlanCommentsResult,
    actionPlanAuditEventsResult,
    actionPlanDependenciesResult
  ] = await Promise.all([
    client
      .from("build_project_slots")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId),
    client
      .from("build_project_notes")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20),
    client
      .from("build_project_audit_events")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    client
      .from("build_projects")
      .select("*")
      .eq("user_id", userId)
      .or(`id.eq.${lineageRootId},root_project_id.eq.${lineageRootId}`)
      .order("branch_depth", { ascending: true })
      .order("updated_at", { ascending: false }),
    client
      .from("build_project_optimization_runs")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(8),
    client
      .from("acquisition_project_links")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(40),
    client
      .from("action_plan_tasks")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    client
      .from("action_plan_progress")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .maybeSingle(),
    client
      .from("action_plan_comments")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    client
      .from("action_plan_audit_events")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    client
      .from("action_plan_dependencies")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
  ]);
  const slotRows = (slotsResult.data ?? []) as BuildProjectSlotRow[];
  const workspaceProject = buildWorkspaceProjectFromRows(projectRow, slotRows);
  const acquisitionLinks =
    (acquisitionLinksResult.data ?? []) as AcquisitionProjectLinkRow[];
  const acquisitionIds = acquisitionLinks.map((link) => link.acquisition_id);
  const acquisitionRecordsResult =
    acquisitionIds.length > 0
      ? await client
          .from("acquisition_records")
          .select("*")
          .eq("user_id", userId)
          .in("id", acquisitionIds)
      : { data: [] as AcquisitionRecordRow[], error: null };
  const acquisitionRecordsById = new Map(
    ((acquisitionRecordsResult.data ?? []) as AcquisitionRecordRow[]).map(
      (record) => [record.id, record]
    )
  );

  return {
    data: {
      actionPlanAuditEvents: (actionPlanAuditEventsResult.data ?? []) as ActionPlanAuditEventRow[],
      actionPlanComments: (actionPlanCommentsResult.data ?? []) as ActionPlanCommentRow[],
      actionPlanDependencies: (actionPlanDependenciesResult.data ?? []) as ActionPlanDependencyRow[],
      actionPlanProgress:
        (actionPlanProgressResult.data as ActionPlanProgressRow | null) ?? null,
      actionPlanTasks: (actionPlanTasksResult.data ?? []) as ActionPlanTaskRow[],
      auditEvents: (auditResult.data ?? []) as BuildProjectAuditEventRow[],
      branches: (branchesResult.data ?? []) as BuildProjectRow[],
      linkedAcquisitions: acquisitionLinks.map((link) => ({
        acquisition: acquisitionRecordsById.get(link.acquisition_id) ?? null,
        link
      })),
      model: createBuildWorkspaceModel(workspaceProject),
      notes: (notesResult.data ?? []) as BuildProjectNoteRow[],
      optimizationRuns: (optimizationRunsResult.data ?? []) as BuildProjectOptimizationRunRow[],
      projectRow,
      slotRows
    },
    isConfigured: true,
    isSignedIn: true,
    message:
      slotsResult.error?.message ??
      notesResult.error?.message ??
      auditResult.error?.message ??
      branchesResult.error?.message ??
      optimizationRunsResult.error?.message ??
      acquisitionLinksResult.error?.message ??
      actionPlanTasksResult.error?.message ??
      actionPlanProgressResult.error?.message ??
      actionPlanCommentsResult.error?.message ??
      actionPlanAuditEventsResult.error?.message ??
      actionPlanDependenciesResult.error?.message ??
      acquisitionRecordsResult.error?.message
  };
}

export async function getBuildProjectOptimizationState(
  projectId: string,
  runId?: string
) {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: null,
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return {
      data: null,
      isConfigured: true,
      isSignedIn: false
    };
  }

  const detail = await getBuildProjectDetail(projectId);

  if (!detail.data) {
    return {
      data: null,
      isConfigured: detail.isConfigured,
      isSignedIn: detail.isSignedIn,
      message: detail.message
    };
  }

  const { data: runs, error: runsError } = await client
    .from("build_project_optimization_runs")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(12);
  const typedRuns = (runs ?? []) as BuildProjectOptimizationRunRow[];
  const selectedRun =
    typedRuns.find((run) => run.id === runId) ?? typedRuns[0] ?? null;
  const { data: suggestions, error: suggestionsError } = selectedRun
    ? await client
        .from("build_project_optimization_suggestions")
        .select("*")
        .eq("run_id", selectedRun.id)
        .eq("user_id", userId)
        .order("ranking", { ascending: true })
    : {
        data: [] as BuildProjectOptimizationSuggestionRow[],
        error: null
      };

  return {
    data: {
      detail: detail.data,
      runs: typedRuns,
      selectedRun,
      suggestions: (suggestions ?? []) as BuildProjectOptimizationSuggestionRow[]
    },
    isConfigured: true,
    isSignedIn: true,
    message: detail.message ?? runsError?.message ?? suggestionsError?.message
  };
}

export async function getBuildSnapshotsByIds(snapshotIds: string[]) {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: [] as BuildSnapshotRow[],
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return { data: [] as BuildSnapshotRow[], isConfigured: true, isSignedIn: false };
  }

  if (snapshotIds.length === 0) {
    return { data: [] as BuildSnapshotRow[], isConfigured: true, isSignedIn: true };
  }

  const { data, error } = await client
    .from("build_snapshots")
    .select("*")
    .eq("user_id", userId)
    .in("id", snapshotIds);
  const rowsById = new Map((data ?? []).map((row) => [row.id, row]));

  return {
    data: snapshotIds
      .map((snapshotId) => rowsById.get(snapshotId))
      .filter((row): row is BuildSnapshotRow => Boolean(row)),
    isConfigured: true,
    isSignedIn: true,
    message: error?.message
  };
}

export async function getBuildSnapshotRestoreInput(snapshotId: string) {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: null as { input: BuildGeneratorInput; title: string } | null,
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return {
      data: null as { input: BuildGeneratorInput; title: string } | null,
      isConfigured: true,
      isSignedIn: false
    };
  }

  const { data, error } = await client
    .from("build_snapshots")
    .select("snapshot,title")
    .eq("user_id", userId)
    .eq("id", snapshotId)
    .maybeSingle();
  const snapshot = data ? readBuildSnapshot(data.snapshot) : null;
  const restoredData =
    data && snapshot ? { input: snapshot.input, title: data.title } : null;

  return {
    data: restoredData,
    isConfigured: true,
    isSignedIn: true,
    message: error?.message
  };
}

export function getMockListingById(listingId: string) {
  return mockHardwareListings.find((listing) => listing.id === listingId) ?? null;
}
