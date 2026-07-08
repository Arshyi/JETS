"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  canCompleteActionTask,
  getActionPlanProgress
} from "@/lib/action-plan-engine/engine";
import { createActionPlanStateFromTaskRows } from "@/lib/action-plan-engine/persistence";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  EngineeringActionPlan,
  EngineeringActionTask,
  EngineeringActionTaskStatus
} from "@/types/action-plan";
import type { ActionPlanTaskRow, Json } from "@/types/database";

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createSupabaseServerClient>>
>;

type ActionPlanAuditInput = {
  afterState?: Json | null;
  beforeState?: Json | null;
  eventType: string;
  metadata?: Json;
  projectId: string;
  summary: string;
  taskId?: string | null;
};

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function parseInteger(value: string, fallback: number) {
  const parsed = Number.parseInt(value, 10);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseActionPlanSnapshot(value: string): EngineeringActionPlan | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as EngineeringActionPlan;

    return parsed?.projectId && Array.isArray(parsed.tasks) ? parsed : null;
  } catch {
    return null;
  }
}

function getPlanFromForm(formData: FormData, projectId: string) {
  const plan = parseActionPlanSnapshot(getText(formData, "planSnapshot"));

  if (!plan || plan.projectId !== projectId) {
    return null;
  }

  return plan;
}

function getTaskByKey(plan: EngineeringActionPlan, taskKey: string) {
  return plan.tasks.find((task) => task.id === taskKey) ?? null;
}

async function requireActionPlanPersistence(next: string) {
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

async function getOwnedProject(
  supabase: SupabaseServerClient,
  userId: string,
  projectId: string
) {
  const { data } = await supabase
    .from("build_projects")
    .select("id,title")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

function toTaskInsert(
  userId: string,
  projectId: string,
  task: EngineeringActionTask,
  persistedTask?: ActionPlanTaskRow
) {
  return {
    description: task.description,
    difficulty: task.difficulty,
    estimated_cost_usd: task.estimatedCostUsd,
    estimated_time_minutes: task.estimatedTimeMinutes,
    evidence_record_ids: task.evidenceRecordIds,
    is_optional: task.isOptional,
    platform_id: task.source.platformId,
    platform_name: task.source.platformName,
    playbook_id: task.recommendation?.playbookId ?? null,
    playbook_recommendation_id:
      task.recommendation?.playbookRecommendationId ?? null,
    playbook_recommendation_title: task.recommendation?.title ?? null,
    priority: task.priority,
    project_id: projectId,
    resolves_validation_issue_ids: task.resolvesValidationIssueIds,
    risk: task.risk,
    slot_ids: task.slotIds,
    sort_order: persistedTask?.sort_order ?? task.sortOrder,
    strategy_id: task.source.strategyId,
    strategy_title: task.source.strategyTitle,
    task_key: task.id,
    task_snapshot: task as unknown as Json,
    task_type: task.type,
    title: task.title,
    user_id: userId,
    verification: task.verification
  };
}

async function getTaskRows(
  supabase: SupabaseServerClient,
  userId: string,
  projectId: string
) {
  const { data } = await supabase
    .from("action_plan_tasks")
    .select("*")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []) as ActionPlanTaskRow[];
}

async function syncActionPlanDefinition(
  supabase: SupabaseServerClient,
  userId: string,
  projectId: string,
  plan: EngineeringActionPlan
) {
  if (plan.tasks.length === 0) {
    return [] as ActionPlanTaskRow[];
  }

  const existingRows = await getTaskRows(supabase, userId, projectId);
  const existingRowsByKey = new Map(
    existingRows.map((row) => [row.task_key, row])
  );

  await supabase.from("action_plan_tasks").upsert(
    plan.tasks.map((task) =>
      toTaskInsert(userId, projectId, task, existingRowsByKey.get(task.id))
    ),
    { onConflict: "project_id,task_key" }
  );

  const taskRows = await getTaskRows(supabase, userId, projectId);
  const taskRowsByKey = new Map(taskRows.map((row) => [row.task_key, row]));
  const dependencies = plan.tasks.flatMap((task) => {
    const taskRow = taskRowsByKey.get(task.id);

    if (!taskRow) {
      return [];
    }

    return task.dependencyTaskIds.flatMap((dependencyKey) => {
      const dependencyRow = taskRowsByKey.get(dependencyKey);

      return dependencyRow
        ? [
            {
              dependency_key: dependencyKey,
              depends_on_task_id: dependencyRow.id,
              project_id: projectId,
              task_id: taskRow.id,
              user_id: userId
            }
          ]
        : [];
    });
  });
  const dependencyKeys = new Set<string>();
  const uniqueDependencies = dependencies.filter((dependency) => {
    const key = `${dependency.task_id}:${dependency.depends_on_task_id}`;

    if (dependencyKeys.has(key)) {
      return false;
    }

    dependencyKeys.add(key);
    return true;
  });

  await supabase
    .from("action_plan_dependencies")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", userId);

  if (uniqueDependencies.length > 0) {
    await supabase.from("action_plan_dependencies").insert(uniqueDependencies);
  }

  return taskRows;
}

async function recordActionPlanAuditEvent(
  supabase: SupabaseServerClient,
  userId: string,
  input: ActionPlanAuditInput
) {
  await supabase.from("action_plan_audit_events").insert({
    after_state: input.afterState ?? null,
    before_state: input.beforeState ?? null,
    event_type: input.eventType,
    metadata: input.metadata ?? {},
    project_id: input.projectId,
    summary: input.summary,
    task_id: input.taskId ?? null,
    user_id: userId
  });
}

async function syncActionPlanProgress(
  supabase: SupabaseServerClient,
  userId: string,
  projectId: string,
  plan: EngineeringActionPlan
) {
  const taskRows = await getTaskRows(supabase, userId, projectId);
  const state = createActionPlanStateFromTaskRows(plan, taskRows);
  const progress = getActionPlanProgress(plan, state);

  await supabase.from("action_plan_progress").upsert(
    {
      action_plan_snapshot: plan as unknown as Json,
      completion_percent: progress.overallCompletionPercent,
      estimated_remaining_cost_usd: progress.estimatedRemainingCostUsd,
      estimated_remaining_time_minutes: progress.estimatedRemainingTimeMinutes,
      knowledge_coverage_percent: progress.knowledgeCoveragePercent,
      platform_improvement_percent: progress.platformImprovementPercent,
      project_id: projectId,
      project_maturity_percent: progress.projectMaturityPercent,
      resolved_validation_issue_ids: progress.resolvedValidationIssueIds,
      user_id: userId,
      validation_progress_percent: progress.validationProgressPercent
    },
    { onConflict: "project_id" }
  );

  return progress;
}

function revalidateProjectActionPlan(projectId: string) {
  revalidatePath("/solution-builder/projects");
  revalidatePath(`/solution-builder/projects/${projectId}`);
}

export async function saveActionPlanDefinitionAction(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const returnTo =
    getText(formData, "returnTo") ||
    (projectId ? `/solution-builder/projects/${projectId}` : "/solution-builder/projects");
  const plan = projectId ? getPlanFromForm(formData, projectId) : null;

  if (!projectId || !plan) {
    redirect(returnTo);
  }

  const { supabase, user } = await requireActionPlanPersistence(returnTo);
  const project = await getOwnedProject(supabase, user.id, projectId);

  if (!project) {
    redirect(returnTo);
  }

  const existingTasks = await syncActionPlanDefinition(
    supabase,
    user.id,
    projectId,
    plan
  );

  await recordActionPlanAuditEvent(supabase, user.id, {
    afterState: {
      taskCount: plan.tasks.length
    },
    eventType: "action_plan_saved",
    metadata: {
      existingTaskCount: existingTasks.length,
      projectTitle: project.title
    },
    projectId,
    summary: `Saved the engineering action plan for ${project.title}.`
  });
  await syncActionPlanProgress(supabase, user.id, projectId, plan);

  revalidateProjectActionPlan(projectId);
  redirect(returnTo);
}

function getTaskUpdateForStatus(
  status: EngineeringActionTaskStatus,
  current: ActionPlanTaskRow
) {
  const now = new Date().toISOString();

  if (status === "accepted") {
    return {
      accepted_at: current.accepted_at ?? now,
      rejected_at: null,
      skipped_at: null,
      status
    };
  }

  if (status === "completed") {
    return {
      accepted_at: current.accepted_at ?? now,
      completed_at: now,
      rejected_at: null,
      skipped_at: null,
      status
    };
  }

  if (status === "skipped") {
    return {
      completed_at: null,
      skipped_at: now,
      status
    };
  }

  if (status === "rejected") {
    return {
      completed_at: null,
      rejected_at: now,
      status
    };
  }

  return { status };
}

async function transitionTask(
  formData: FormData,
  status: EngineeringActionTaskStatus,
  eventType: string,
  summaryVerb: string
) {
  const projectId = getText(formData, "projectId");
  const taskKey = getText(formData, "taskKey");
  const returnTo =
    getText(formData, "returnTo") ||
    (projectId ? `/solution-builder/projects/${projectId}` : "/solution-builder/projects");
  const plan = projectId ? getPlanFromForm(formData, projectId) : null;

  if (!projectId || !taskKey || !plan) {
    redirect(returnTo);
  }

  const task = getTaskByKey(plan, taskKey);

  if (!task) {
    redirect(returnTo);
  }

  const { supabase, user } = await requireActionPlanPersistence(returnTo);
  const project = await getOwnedProject(supabase, user.id, projectId);

  if (!project) {
    redirect(returnTo);
  }

  await syncActionPlanDefinition(supabase, user.id, projectId, plan);
  const beforeRows = await getTaskRows(supabase, user.id, projectId);
  const beforeState = createActionPlanStateFromTaskRows(plan, beforeRows);
  const current = beforeRows.find((row) => row.task_key === taskKey);

  if (!current) {
    redirect(returnTo);
  }

  if (status === "completed" && !canCompleteActionTask(task, beforeState)) {
    redirect(returnTo);
  }

  const update = getTaskUpdateForStatus(status, current);

  await supabase
    .from("action_plan_tasks")
    .update(update)
    .eq("id", current.id)
    .eq("user_id", user.id);

  const afterRows = await getTaskRows(supabase, user.id, projectId);
  const after = afterRows.find((row) => row.id === current.id) ?? null;

  await recordActionPlanAuditEvent(supabase, user.id, {
    afterState: (after as unknown as Json) ?? null,
    beforeState: current as unknown as Json,
    eventType,
    metadata: {
      projectTitle: project.title,
      taskKey,
      taskType: task.type
    },
    projectId,
    summary: `${summaryVerb} ${task.title}.`,
    taskId: current.id
  });
  await syncActionPlanProgress(supabase, user.id, projectId, plan);

  revalidateProjectActionPlan(projectId);
  redirect(returnTo);
}

export async function acceptActionPlanTaskAction(formData: FormData) {
  await transitionTask(
    formData,
    "accepted",
    "action_task_accepted",
    "Accepted"
  );
}

export async function completeActionPlanTaskAction(formData: FormData) {
  await transitionTask(
    formData,
    "completed",
    "action_task_completed",
    "Completed"
  );
}

export async function skipActionPlanTaskAction(formData: FormData) {
  await transitionTask(formData, "skipped", "action_task_skipped", "Skipped");
}

export async function rejectActionPlanTaskAction(formData: FormData) {
  await transitionTask(
    formData,
    "rejected",
    "action_task_rejected",
    "Rejected"
  );
}

export async function reopenActionPlanTaskAction(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const taskKey = getText(formData, "taskKey");
  const returnTo =
    getText(formData, "returnTo") ||
    (projectId ? `/solution-builder/projects/${projectId}` : "/solution-builder/projects");
  const plan = projectId ? getPlanFromForm(formData, projectId) : null;

  if (!projectId || !taskKey || !plan) {
    redirect(returnTo);
  }

  const task = getTaskByKey(plan, taskKey);

  if (!task) {
    redirect(returnTo);
  }

  const { supabase, user } = await requireActionPlanPersistence(returnTo);
  const project = await getOwnedProject(supabase, user.id, projectId);

  if (!project) {
    redirect(returnTo);
  }

  await syncActionPlanDefinition(supabase, user.id, projectId, plan);
  const beforeRows = await getTaskRows(supabase, user.id, projectId);
  const current = beforeRows.find((row) => row.task_key === taskKey);

  if (!current) {
    redirect(returnTo);
  }

  const update = {
    completed_at: null,
    reopened_at: new Date().toISOString(),
    status: "accepted" as const
  };

  await supabase
    .from("action_plan_tasks")
    .update(update)
    .eq("id", current.id)
    .eq("user_id", user.id);

  const afterRows = await getTaskRows(supabase, user.id, projectId);
  const after = afterRows.find((row) => row.id === current.id) ?? null;

  await recordActionPlanAuditEvent(supabase, user.id, {
    afterState: (after as unknown as Json) ?? null,
    beforeState: current as unknown as Json,
    eventType: "action_task_reopened",
    metadata: {
      projectTitle: project.title,
      taskKey,
      taskType: task.type
    },
    projectId,
    summary: `Reopened ${task.title}.`,
    taskId: current.id
  });
  await syncActionPlanProgress(supabase, user.id, projectId, plan);

  revalidateProjectActionPlan(projectId);
  redirect(returnTo);
}

export async function updateActionPlanTaskNotesAction(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const taskKey = getText(formData, "taskKey");
  const notes = getText(formData, "notes").slice(0, 1600);
  const returnTo =
    getText(formData, "returnTo") ||
    (projectId ? `/solution-builder/projects/${projectId}` : "/solution-builder/projects");
  const plan = projectId ? getPlanFromForm(formData, projectId) : null;

  if (!projectId || !taskKey || !plan) {
    redirect(returnTo);
  }

  const task = getTaskByKey(plan, taskKey);

  if (!task) {
    redirect(returnTo);
  }

  const { supabase, user } = await requireActionPlanPersistence(returnTo);
  const project = await getOwnedProject(supabase, user.id, projectId);

  if (!project) {
    redirect(returnTo);
  }

  await syncActionPlanDefinition(supabase, user.id, projectId, plan);
  const beforeRows = await getTaskRows(supabase, user.id, projectId);
  const current = beforeRows.find((row) => row.task_key === taskKey);

  if (!current) {
    redirect(returnTo);
  }

  await supabase
    .from("action_plan_tasks")
    .update({ notes })
    .eq("id", current.id)
    .eq("user_id", user.id);

  if (notes) {
    await supabase.from("action_plan_comments").insert({
      body: notes,
      comment_type: "note",
      project_id: projectId,
      task_id: current.id,
      user_id: user.id
    });
  }

  await recordActionPlanAuditEvent(supabase, user.id, {
    afterState: { notes },
    beforeState: { notes: current.notes },
    eventType: "action_task_notes_updated",
    metadata: {
      projectTitle: project.title,
      taskKey,
      taskType: task.type
    },
    projectId,
    summary: `Updated notes for ${task.title}.`,
    taskId: current.id
  });
  await syncActionPlanProgress(supabase, user.id, projectId, plan);

  revalidateProjectActionPlan(projectId);
  redirect(returnTo);
}

export async function reorderOptionalActionPlanTaskAction(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const taskKey = getText(formData, "taskKey");
  const direction = getText(formData, "direction");
  const returnTo =
    getText(formData, "returnTo") ||
    (projectId ? `/solution-builder/projects/${projectId}` : "/solution-builder/projects");
  const plan = projectId ? getPlanFromForm(formData, projectId) : null;

  if (!projectId || !taskKey || !plan) {
    redirect(returnTo);
  }

  const task = getTaskByKey(plan, taskKey);

  if (!task || !task.isOptional) {
    redirect(returnTo);
  }

  const { supabase, user } = await requireActionPlanPersistence(returnTo);
  const project = await getOwnedProject(supabase, user.id, projectId);

  if (!project) {
    redirect(returnTo);
  }

  await syncActionPlanDefinition(supabase, user.id, projectId, plan);
  const beforeRows = await getTaskRows(supabase, user.id, projectId);
  const current = beforeRows.find((row) => row.task_key === taskKey);

  if (!current) {
    redirect(returnTo);
  }

  const offset = direction === "earlier" ? -1 : 1;
  const sortOrder = Math.max(
    0,
    parseInteger(getText(formData, "sortOrder"), current.sort_order) + offset
  );

  await supabase
    .from("action_plan_tasks")
    .update({ sort_order: sortOrder })
    .eq("id", current.id)
    .eq("user_id", user.id);

  await recordActionPlanAuditEvent(supabase, user.id, {
    afterState: { sortOrder },
    beforeState: { sortOrder: current.sort_order },
    eventType: "action_task_reordered",
    metadata: {
      direction,
      projectTitle: project.title,
      taskKey,
      taskType: task.type
    },
    projectId,
    summary: `Reordered optional task ${task.title}.`,
    taskId: current.id
  });
  await syncActionPlanProgress(supabase, user.id, projectId, plan);

  revalidateProjectActionPlan(projectId);
  redirect(returnTo);
}
