"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { appVersion } from "@/lib/app-version";
import { isBuildSlotId } from "@/lib/solution-builder/projects";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  BuildProjectOptimizationSuggestionRow,
  BuildProjectRow,
  BuildProjectSlotRow,
  Json
} from "@/types/database";

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createSupabaseServerClient>>
>;

type BranchSource = "manual" | "optimization";

type BranchInput = {
  branchName: string;
  branchNotes?: string;
  branchSource: BranchSource;
  sourceOptimizationRunId?: string | null;
  sourceOptimizationSuggestionIds?: string[];
  sourceProject: BuildProjectRow;
  sourceSlots: BuildProjectSlotRow[];
  title: string;
};

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function normalizeBranchName(value: string, fallback: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "")
    .slice(0, 80);

  return normalized || fallback;
}

async function requireBranchPersistence(next: string) {
  if (!isSupabaseConfigured) {
    redirect("/account");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/account");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return { supabase, user };
}

async function getOwnedProjectWithSlots(
  supabase: SupabaseServerClient,
  userId: string,
  projectId: string
) {
  const [{ data: project }, { data: slots }] = await Promise.all([
    supabase
      .from("build_projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("build_project_slots")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
  ]);

  return {
    project: project as BuildProjectRow | null,
    slots: (slots ?? []) as BuildProjectSlotRow[]
  };
}

async function recordBranchAuditEvent(
  supabase: SupabaseServerClient,
  userId: string,
  input: {
    afterState?: Json | null;
    beforeState?: Json | null;
    eventType: string;
    metadata?: Json;
    projectId: string;
    summary: string;
  }
) {
  await supabase.from("build_project_audit_events").insert({
    after_state: input.afterState ?? null,
    before_state: input.beforeState ?? null,
    event_type: input.eventType,
    metadata: input.metadata ?? {},
    project_id: input.projectId,
    summary: input.summary,
    user_id: userId
  });
}

function revalidateBranchPaths(sourceProjectId: string, branchProjectId?: string) {
  revalidatePath("/solution-builder");
  revalidatePath("/solution-builder/projects");
  revalidatePath(`/solution-builder/projects/${sourceProjectId}`);
  revalidatePath(`/solution-builder/projects/${sourceProjectId}/optimize`);

  if (branchProjectId) {
    revalidatePath(`/solution-builder/projects/${branchProjectId}`);
  }
}

async function createProjectBranch(
  supabase: SupabaseServerClient,
  userId: string,
  input: BranchInput
) {
  const rootProjectId = input.sourceProject.root_project_id ?? input.sourceProject.id;
  const { data: branch, error } = await supabase
    .from("build_projects")
    .insert({
      app_version: appVersion,
      branch_depth: input.sourceProject.branch_depth + 1,
      branch_name: input.branchName,
      branch_notes: input.branchNotes ?? "",
      branch_source: input.branchSource,
      budget: input.sourceProject.budget,
      country: input.sourceProject.country,
      currency: input.sourceProject.currency,
      owned_items: input.sourceProject.owned_items,
      parent_project_id: input.sourceProject.id,
      preferences: input.sourceProject.preferences,
      purpose: input.sourceProject.purpose,
      root_project_id: rootProjectId,
      source_optimization_run_id: input.sourceOptimizationRunId ?? null,
      source_optimization_suggestion_ids:
        input.sourceOptimizationSuggestionIds ?? [],
      status: "active",
      title: input.title,
      user_id: userId
    })
    .select("*")
    .single();

  if (!branch || error) {
    return null;
  }

  if (input.sourceSlots.length > 0) {
    await supabase.from("build_project_slots").insert(
      input.sourceSlots.map((slot) => ({
        component_category: slot.component_category,
        component_id: slot.component_id,
        component_snapshot: slot.component_snapshot,
        notes: slot.notes,
        project_id: branch.id,
        slot_id: slot.slot_id,
        user_id: userId
      }))
    );
  }

  await recordBranchAuditEvent(supabase, userId, {
    afterState: {
      branchName: input.branchName,
      branchSource: input.branchSource,
      parentProjectId: input.sourceProject.id,
      rootProjectId,
      sourceOptimizationRunId: input.sourceOptimizationRunId ?? null,
      sourceOptimizationSuggestionIds:
        input.sourceOptimizationSuggestionIds ?? []
    },
    eventType: "project_branch_created",
    metadata: {
      appVersion,
      branchProjectId: branch.id,
      sourceProjectId: input.sourceProject.id
    },
    projectId: branch.id,
    summary: `Created branch ${input.branchName} from ${input.sourceProject.title}.`
  });

  await recordBranchAuditEvent(supabase, userId, {
    afterState: {
      branchName: input.branchName,
      branchProjectId: branch.id,
      branchSource: input.branchSource
    },
    eventType: "project_branch_created_from_source",
    metadata: {
      branchProjectId: branch.id
    },
    projectId: input.sourceProject.id,
    summary: `Created child branch ${input.branchName}.`
  });

  return branch as BuildProjectRow;
}

async function applySuggestionsToBranch(
  supabase: SupabaseServerClient,
  userId: string,
  branchProjectId: string,
  suggestions: BuildProjectOptimizationSuggestionRow[]
) {
  for (const suggestion of suggestions) {
    if (!isBuildSlotId(suggestion.slot_id)) {
      continue;
    }

    const note = `Optimization ${suggestion.action}: ${suggestion.reason}`;

    if (suggestion.action === "remove") {
      await supabase
        .from("build_project_slots")
        .delete()
        .eq("project_id", branchProjectId)
        .eq("slot_id", suggestion.slot_id)
        .eq("user_id", userId);
      continue;
    }

    if (suggestion.suggested_component_id && suggestion.suggested_component_snapshot) {
      await supabase.from("build_project_slots").upsert(
        {
          component_category:
            typeof suggestion.suggested_component_snapshot === "object" &&
            suggestion.suggested_component_snapshot &&
            !Array.isArray(suggestion.suggested_component_snapshot) &&
            typeof suggestion.suggested_component_snapshot.category === "string"
              ? suggestion.suggested_component_snapshot.category
              : null,
          component_id: suggestion.suggested_component_id,
          component_snapshot: suggestion.suggested_component_snapshot,
          notes: note,
          project_id: branchProjectId,
          slot_id: suggestion.slot_id,
          user_id: userId
        },
        {
          onConflict: "project_id,slot_id"
        }
      );
      continue;
    }

    await supabase.from("build_project_slots").upsert(
      {
        notes: note,
        project_id: branchProjectId,
        slot_id: suggestion.slot_id,
        user_id: userId
      },
      {
        onConflict: "project_id,slot_id"
      }
    );
  }
}

export async function createBuildProjectBranchAction(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const returnTo =
    getText(formData, "returnTo") ||
    (projectId ? `/solution-builder/projects/${projectId}` : "/solution-builder/projects");
  const branchName = normalizeBranchName(
    getText(formData, "branchName"),
    "experiment"
  );

  if (!projectId) {
    redirect(returnTo);
  }

  const { supabase, user } = await requireBranchPersistence(returnTo);
  const { project, slots } = await getOwnedProjectWithSlots(
    supabase,
    user.id,
    projectId
  );

  if (!project) {
    redirect(returnTo);
  }

  const branch = await createProjectBranch(supabase, user.id, {
    branchName,
    branchNotes: getText(formData, "branchNotes").slice(0, 800),
    branchSource: "manual",
    sourceProject: project,
    sourceSlots: slots,
    title: `${project.title} (${branchName})`
  });

  revalidateBranchPaths(projectId, branch?.id);
  redirect(branch ? `/solution-builder/projects/${branch.id}` : returnTo);
}

export async function createOptimizedProjectBranchAction(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const runId = getText(formData, "runId");
  const returnTo =
    getText(formData, "returnTo") ||
    (projectId ? `/solution-builder/projects/${projectId}/optimize` : "/solution-builder/projects");
  const suggestionIds = formData
    .getAll("suggestionIds")
    .filter((value): value is string => typeof value === "string");
  const branchName = normalizeBranchName(
    getText(formData, "branchName"),
    "optimized"
  );

  if (!projectId || !runId || suggestionIds.length === 0) {
    redirect(returnTo);
  }

  const { supabase, user } = await requireBranchPersistence(returnTo);
  const { project, slots } = await getOwnedProjectWithSlots(
    supabase,
    user.id,
    projectId
  );

  if (!project) {
    redirect(returnTo);
  }

  const { data: run } = await supabase
    .from("build_project_optimization_runs")
    .select("id,goal,depth")
    .eq("id", runId)
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!run) {
    redirect(returnTo);
  }

  const { data: suggestions } = await supabase
    .from("build_project_optimization_suggestions")
    .select("*")
    .eq("run_id", runId)
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .in("id", suggestionIds)
    .order("ranking", { ascending: true });
  const selectedSuggestions =
    (suggestions ?? []) as BuildProjectOptimizationSuggestionRow[];

  if (selectedSuggestions.length === 0) {
    redirect(returnTo);
  }

  const branch = await createProjectBranch(supabase, user.id, {
    branchName,
    branchNotes: `Optimization branch from ${run.goal} / ${run.depth}.`,
    branchSource: "optimization",
    sourceOptimizationRunId: runId,
    sourceOptimizationSuggestionIds: selectedSuggestions.map(
      (suggestion) => suggestion.id
    ),
    sourceProject: project,
    sourceSlots: slots,
    title: `${project.title} (${branchName})`
  });

  if (!branch) {
    redirect(returnTo);
  }

  await applySuggestionsToBranch(
    supabase,
    user.id,
    branch.id,
    selectedSuggestions
  );
  await recordBranchAuditEvent(supabase, user.id, {
    afterState: {
      appliedSuggestions: selectedSuggestions.map((suggestion) => ({
        action: suggestion.action,
        scoreDelta: suggestion.score_delta,
        slotId: suggestion.slot_id,
        suggestionId: suggestion.id
      })),
      sourceOptimizationRunId: runId
    },
    eventType: "optimization_branch_applied",
    metadata: {
      sourceProjectId: projectId
    },
    projectId: branch.id,
    summary: `Applied ${selectedSuggestions.length} optimization suggestion${selectedSuggestions.length === 1 ? "" : "s"} into this branch.`
  });

  revalidateBranchPaths(projectId, branch.id);
  redirect(`/solution-builder/projects/${branch.id}`);
}
