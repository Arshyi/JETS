"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { appVersion } from "@/lib/app-version";
import { optimizeBuildProject } from "@/lib/optimization-engine/pipeline";
import {
  buildWorkspaceProjectFromRows,
  isBuildSlotId
} from "@/lib/solution-builder/projects";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  optimizationDepths,
  optimizationGoals
} from "@/types/optimization";
import type { Json } from "@/types/database";
import type {
  BuildProjectNoteRow,
  BuildProjectSlotRow
} from "@/types/database";
import type {
  OptimizationDepth,
  OptimizationGoal
} from "@/types/optimization";

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function parseGoal(value: string): OptimizationGoal {
  return optimizationGoals.includes(value as OptimizationGoal)
    ? (value as OptimizationGoal)
    : "best-balanced";
}

function parseDepth(value: string): OptimizationDepth {
  return optimizationDepths.includes(value as OptimizationDepth)
    ? (value as OptimizationDepth)
    : "standard";
}

function parseLockedSlots(formData: FormData) {
  return formData
    .getAll("lockedSlots")
    .filter((value): value is string => typeof value === "string")
    .filter(isBuildSlotId);
}

async function requireOptimizationPersistence(next: string) {
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

function revalidateOptimizationPaths(projectId: string) {
  revalidatePath(`/solution-builder/projects/${projectId}`);
  revalidatePath(`/solution-builder/projects/${projectId}/optimize`);
  revalidatePath("/solution-builder/projects");
}

export async function runBuildProjectOptimizationAction(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const returnTo =
    getText(formData, "returnTo") ||
    (projectId
      ? `/solution-builder/projects/${projectId}/optimize`
      : "/solution-builder/projects");
  const goal = parseGoal(getText(formData, "goal"));
  const depth = parseDepth(getText(formData, "depth"));
  const lockedSlots = parseLockedSlots(formData);

  if (!projectId) {
    redirect(returnTo);
  }

  const { supabase, user } = await requireOptimizationPersistence(returnTo);
  const { data: project } = await supabase
    .from("build_projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) {
    redirect(returnTo);
  }

  const [slotsResult, notesResult] = await Promise.all([
    supabase
      .from("build_project_slots")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user.id),
    supabase
      .from("build_project_notes")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20)
  ]);
  const slotRows = (slotsResult.data ?? []) as BuildProjectSlotRow[];
  const notes = (notesResult.data ?? []) as BuildProjectNoteRow[];
  const workspaceProject = buildWorkspaceProjectFromRows(project, slotRows);
  const result = optimizeBuildProject(workspaceProject, {
    depth,
    goal,
    lockedSlots,
    projectNotes: notes.map((note) => note.note)
  });
  const summary = result.suggestions[0]
    ? `${result.suggestions.length} suggestion${result.suggestions.length === 1 ? "" : "s"} found. Top change: ${result.suggestions[0].reason}`
    : "No positive optimization suggestions found under the selected constraints.";
  const { data: run, error } = await supabase
    .from("build_project_optimization_runs")
    .insert({
      app_version: appVersion,
      baseline_score: result.baselineScore,
      depth,
      goal,
      input_project_snapshot: workspaceProject as unknown as Json,
      locked_slots: lockedSlots,
      optimized_score: result.optimizedScore,
      project_id: projectId,
      summary,
      user_id: user.id
    })
    .select("id")
    .single();

  if (!run || error) {
    redirect(returnTo);
  }

  if (result.suggestions.length > 0) {
    await supabase.from("build_project_optimization_suggestions").insert(
      result.suggestions.map((suggestion, index) => ({
        action: suggestion.action,
        compatibility_impact: suggestion.compatibilityImpact,
        confidence: suggestion.confidence,
        current_component_id: suggestion.currentComponentId ?? null,
        current_component_title: suggestion.currentComponentTitle ?? null,
        estimated_cost_delta: suggestion.estimatedCostDelta,
        power_impact: suggestion.powerImpact,
        project_id: projectId,
        ranking: index + 1,
        reason: suggestion.reason,
        reliability_impact: suggestion.reliabilityImpact,
        run_id: run.id,
        score_delta: suggestion.scoreDelta,
        slot_id: suggestion.slotId,
        suggested_component_id: suggestion.suggestedComponent?.id ?? null,
        suggested_component_snapshot:
          (suggestion.suggestedComponent as unknown as Json) ?? null,
        suggested_component_title: suggestion.suggestedComponent?.title ?? null,
        upgradeability_impact: suggestion.upgradeabilityImpact,
        user_id: user.id
      }))
    );
  }

  await supabase.from("build_project_audit_events").insert({
    after_state: {
      depth,
      goal,
      lockedSlots,
      optimizedScore: result.optimizedScore,
      suggestions: result.suggestions.length
    },
    before_state: {
      baselineScore: result.baselineScore
    },
    event_type: "optimization_run_created",
    metadata: {
      runId: run.id
    },
    project_id: projectId,
    summary: `Ran ${goal.replaceAll("-", " ")} optimization at ${depth} depth.`,
    user_id: user.id
  });

  revalidateOptimizationPaths(projectId);
  redirect(`/solution-builder/projects/${projectId}/optimize?run=${run.id}`);
}
