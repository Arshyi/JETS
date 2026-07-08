import {
  CheckCircle2,
  Circle,
  Clock3,
  DollarSign,
  FileText,
  MoveDown,
  MoveUp,
  RotateCcw,
  ShieldAlert,
  SkipForward,
  XCircle
} from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import { canCompleteActionTask } from "@/lib/action-plan-engine/engine";
import {
  createActionPlanStateFromTaskRows,
  getActionPlanProgressFromTaskRows,
  getActionPlanTaskRowsByKey
} from "@/lib/action-plan-engine/persistence";
import {
  acceptActionPlanTaskAction,
  completeActionPlanTaskAction,
  rejectActionPlanTaskAction,
  reopenActionPlanTaskAction,
  reorderOptionalActionPlanTaskAction,
  saveActionPlanDefinitionAction,
  skipActionPlanTaskAction,
  updateActionPlanTaskNotesAction
} from "@/lib/supabase/action-plan-actions";
import type {
  EngineeringActionPlan,
  EngineeringActionTask,
  EngineeringActionTaskStatus
} from "@/types/action-plan";
import type {
  ActionPlanAuditEventRow,
  ActionPlanCommentRow,
  ActionPlanProgressRow,
  ActionPlanTaskRow
} from "@/types/database";

type ActionPlanPanelProps = {
  auditEvents: ActionPlanAuditEventRow[];
  comments: ActionPlanCommentRow[];
  persistedProgress: ActionPlanProgressRow | null;
  persistedTasks: ActionPlanTaskRow[];
  plan: EngineeringActionPlan;
  returnTo: string;
};

type ActionPlanHiddenFieldsProps = {
  planSnapshot: string;
  projectId: string;
  returnTo: string;
  taskKey?: string;
};

function formatTime(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

function formatMoney(value: number) {
  if (value === 0) {
    return "$0";
  }

  return `$${value.toLocaleString()}`;
}

function statusTone(status: EngineeringActionTaskStatus) {
  if (status === "completed") return "accent";
  if (status === "rejected" || status === "skipped") return "warning";
  return "neutral";
}

function riskTone(risk: EngineeringActionTask["risk"]) {
  if (risk === "critical" || risk === "high") return "warning";
  if (risk === "low") return "accent";
  return "neutral";
}

function getDependencyText(
  task: EngineeringActionTask,
  tasks: EngineeringActionTask[]
) {
  if (task.dependencyTaskIds.length === 0) {
    return "No prerequisites";
  }

  return task.dependencyTaskIds
    .map((id) => tasks.find((candidate) => candidate.id === id)?.title ?? id)
    .join(", ");
}

function ActionPlanHiddenFields({
  planSnapshot,
  projectId,
  returnTo,
  taskKey
}: ActionPlanHiddenFieldsProps) {
  return (
    <>
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="planSnapshot" value={planSnapshot} />
      {taskKey ? <input type="hidden" name="taskKey" value={taskKey} /> : null}
    </>
  );
}

export function ActionPlanPanel({
  auditEvents,
  comments,
  persistedProgress,
  persistedTasks,
  plan,
  returnTo
}: ActionPlanPanelProps) {
  const rowsByKey = getActionPlanTaskRowsByKey(persistedTasks);
  const planSnapshot = JSON.stringify(plan);
  const state = createActionPlanStateFromTaskRows(plan, persistedTasks);
  const progress = getActionPlanProgressFromTaskRows(plan, persistedTasks);
  const sortedTasks = [...plan.tasks].sort((left, right) => {
    const leftRow = rowsByKey.get(left.id);
    const rightRow = rowsByKey.get(right.id);

    return (
      (leftRow?.sort_order ?? left.sortOrder) -
        (rightRow?.sort_order ?? right.sortOrder) ||
      left.title.localeCompare(right.title)
    );
  });

  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
              Action Plan Engine
            </p>
          </div>
          <h2 className="mt-3 text-2xl font-bold">Engineering Action Plan</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            Generated from the current platform, playbook, strategy source, and
            Builder validation state. Phase 5.2 persists task status, notes,
            progress, dependencies, and audit history to Supabase.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill tone={persistedTasks.length > 0 ? "accent" : "neutral"}>
              {persistedTasks.length > 0 ? "Persisted" : "Not saved yet"}
            </StatusPill>
            <StatusPill>{auditEvents.length} audit events</StatusPill>
            {persistedProgress ? (
              <StatusPill>Synced {persistedProgress.completion_percent}%</StatusPill>
            ) : null}
          </div>
        </div>
        <div className="grid gap-2 text-sm sm:grid-cols-2 lg:min-w-96">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-semibold uppercase text-muted">Completion</p>
            <p className="mt-1 text-2xl font-bold">
              {progress.overallCompletionPercent}%
            </p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-semibold uppercase text-muted">Maturity</p>
            <p className="mt-1 text-2xl font-bold">
              {progress.projectMaturityPercent}%
            </p>
          </div>
        </div>
      </div>

      {persistedTasks.length === 0 ? (
        <form action={saveActionPlanDefinitionAction} className="mt-5">
          <ActionPlanHiddenFields
            planSnapshot={planSnapshot}
            projectId={plan.projectId}
            returnTo={returnTo}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Save action plan to project
          </button>
        </form>
      ) : null}

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-semibold uppercase text-muted">Remaining cost</p>
          <p className="mt-2 text-2xl font-bold">
            {formatMoney(progress.estimatedRemainingCostUsd)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-semibold uppercase text-muted">Remaining time</p>
          <p className="mt-2 text-2xl font-bold">
            {formatTime(progress.estimatedRemainingTimeMinutes)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-semibold uppercase text-muted">Platform improvement</p>
          <p className="mt-2 text-2xl font-bold">
            {progress.platformImprovementPercent}%
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-semibold uppercase text-muted">Knowledge coverage</p>
          <p className="mt-2 text-2xl font-bold">
            {progress.knowledgeCoveragePercent}%
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-semibold uppercase text-muted">Validation progress</p>
          <p className="mt-2 text-2xl font-bold">
            {progress.validationProgressPercent}%
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-semibold uppercase text-muted">Resolved warnings</p>
          <p className="mt-2 text-2xl font-bold">
            {progress.resolvedValidationIssueIds.length}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusPill>{progress.completedTasks}/{progress.totalTasks} completed</StatusPill>
        <StatusPill>{progress.acceptedTasks} accepted</StatusPill>
        <StatusPill>{progress.blockedTasks} blocked</StatusPill>
        <StatusPill tone="warning">{progress.skippedTasks} skipped</StatusPill>
        <StatusPill tone="warning">{progress.rejectedTasks} rejected</StatusPill>
        {plan.platformName ? <StatusPill>{plan.platformName}</StatusPill> : null}
      </div>

      <div className="mt-6 grid gap-4">
        {sortedTasks.map((task) => {
          const persistedTask = rowsByKey.get(task.id);
          const taskState = state[task.id] ?? { status: "recommended" };
          const canComplete =
            taskState.status === "accepted" && canCompleteActionTask(task, state);
          const blocked =
            taskState.status === "accepted" && !canCompleteActionTask(task, state);
          const taskComments = persistedTask
            ? comments
                .filter((comment) => comment.task_id === persistedTask.id)
                .slice(0, 2)
            : [];

          return (
            <article
              key={task.id}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={statusTone(taskState.status)}>
                      {taskState.status}
                    </StatusPill>
                    <StatusPill>{task.type.replaceAll("-", " ")}</StatusPill>
                    <StatusPill>{task.difficulty}</StatusPill>
                    <StatusPill>{task.priority} priority</StatusPill>
                    <StatusPill tone={riskTone(task.risk)}>{task.risk} risk</StatusPill>
                    <StatusPill>{task.verification}</StatusPill>
                    {task.isOptional ? <StatusPill>optional</StatusPill> : null}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold">{task.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {task.description}
                  </p>
                </div>
                <div className="grid gap-2 text-sm sm:grid-cols-2 lg:min-w-60">
                  <div className="rounded-lg border border-border bg-panel p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
                      <Clock3 className="h-4 w-4" aria-hidden="true" />
                      Time
                    </div>
                    <p className="mt-2 text-base font-semibold">
                      {formatTime(task.estimatedTimeMinutes)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-panel p-3">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted">
                      <DollarSign className="h-4 w-4" aria-hidden="true" />
                      Cost
                    </div>
                    <p className="mt-2 text-base font-semibold">
                      {formatMoney(task.estimatedCostUsd)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 text-sm lg:grid-cols-3">
                <div className="rounded-lg border border-border bg-panel p-3">
                  <p className="text-xs font-semibold uppercase text-muted">
                    Dependencies
                  </p>
                  <p className="mt-2 leading-6 text-muted">
                    {getDependencyText(task, plan.tasks)}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-panel p-3">
                  <p className="text-xs font-semibold uppercase text-muted">
                    Evidence chain
                  </p>
                  <p className="mt-2 leading-6 text-muted">
                    {task.evidenceRecordIds.length} evidence records
                    {task.encyclopediaEntryIds.length > 0
                      ? ` - ${task.encyclopediaEntryIds.length} encyclopedia refs`
                      : ""}
                    {task.recommendation
                      ? ` - ${task.recommendation.title}`
                      : " - Builder validation"}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-panel p-3">
                  <p className="text-xs font-semibold uppercase text-muted">
                    Builder impact
                  </p>
                  <p className="mt-2 leading-6 text-muted">
                    {task.resolvesValidationIssueIds.length > 0
                      ? `${task.resolvesValidationIssueIds.length} validation signal(s)`
                      : "No direct warning attached"}
                  </p>
                </div>
              </div>

              {blocked ? (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning">
                  <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                  Complete prerequisites before marking this task complete.
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                {taskState.status !== "accepted" && taskState.status !== "completed" ? (
                  <form action={acceptActionPlanTaskAction}>
                    <ActionPlanHiddenFields
                      planSnapshot={planSnapshot}
                      projectId={plan.projectId}
                      returnTo={returnTo}
                      taskKey={task.id}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                    >
                      <Circle className="h-4 w-4" aria-hidden="true" />
                      Accept task
                    </button>
                  </form>
                ) : null}
                {taskState.status === "accepted" ? (
                  <form action={completeActionPlanTaskAction}>
                    <ActionPlanHiddenFields
                      planSnapshot={planSnapshot}
                      projectId={plan.projectId}
                      returnTo={returnTo}
                      taskKey={task.id}
                    />
                    <button
                      type="submit"
                      disabled={!canComplete}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                    >
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Mark complete
                    </button>
                  </form>
                ) : null}
                {taskState.status === "completed" ? (
                  <form action={reopenActionPlanTaskAction}>
                    <ActionPlanHiddenFields
                      planSnapshot={planSnapshot}
                      projectId={plan.projectId}
                      returnTo={returnTo}
                      taskKey={task.id}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                    >
                      <RotateCcw className="h-4 w-4" aria-hidden="true" />
                      Reopen task
                    </button>
                  </form>
                ) : null}
                {taskState.status !== "completed" ? (
                  <>
                    <form action={skipActionPlanTaskAction}>
                      <ActionPlanHiddenFields
                        planSnapshot={planSnapshot}
                        projectId={plan.projectId}
                        returnTo={returnTo}
                        taskKey={task.id}
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                      >
                        <SkipForward className="h-4 w-4" aria-hidden="true" />
                        Skip task
                      </button>
                    </form>
                    <form action={rejectActionPlanTaskAction}>
                      <ActionPlanHiddenFields
                        planSnapshot={planSnapshot}
                        projectId={plan.projectId}
                        returnTo={returnTo}
                        taskKey={task.id}
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm font-semibold text-warning transition hover:bg-warning/15 focus:outline-none focus:ring-2 focus:ring-warning focus:ring-offset-2 focus:ring-offset-background"
                      >
                        <XCircle className="h-4 w-4" aria-hidden="true" />
                        Reject recommendation
                      </button>
                    </form>
                  </>
                ) : null}
                {task.isOptional ? (
                  <>
                    <form action={reorderOptionalActionPlanTaskAction}>
                      <ActionPlanHiddenFields
                        planSnapshot={planSnapshot}
                        projectId={plan.projectId}
                        returnTo={returnTo}
                        taskKey={task.id}
                      />
                      <input
                        type="hidden"
                        name="sortOrder"
                        value={persistedTask?.sort_order ?? task.sortOrder}
                      />
                      <input type="hidden" name="direction" value="earlier" />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                      >
                        <MoveUp className="h-4 w-4" aria-hidden="true" />
                        Earlier
                      </button>
                    </form>
                    <form action={reorderOptionalActionPlanTaskAction}>
                      <ActionPlanHiddenFields
                        planSnapshot={planSnapshot}
                        projectId={plan.projectId}
                        returnTo={returnTo}
                        taskKey={task.id}
                      />
                      <input
                        type="hidden"
                        name="sortOrder"
                        value={persistedTask?.sort_order ?? task.sortOrder}
                      />
                      <input type="hidden" name="direction" value="later" />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                      >
                        <MoveDown className="h-4 w-4" aria-hidden="true" />
                        Later
                      </button>
                    </form>
                  </>
                ) : null}
              </div>

              <form action={updateActionPlanTaskNotesAction} className="mt-4 rounded-lg border border-border bg-panel p-3">
                <ActionPlanHiddenFields
                  planSnapshot={planSnapshot}
                  projectId={plan.projectId}
                  returnTo={returnTo}
                  taskKey={task.id}
                />
                <label
                  className="flex items-center gap-2 text-xs font-semibold uppercase text-muted"
                  htmlFor={`task-notes-${task.id}`}
                >
                  <FileText className="h-4 w-4" aria-hidden="true" />
                  Task notes
                </label>
                <textarea
                  id={`task-notes-${task.id}`}
                  name="notes"
                  defaultValue={persistedTask?.notes ?? ""}
                  rows={2}
                  placeholder="Test result, part source, cable caveat, or verification note"
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25"
                />
                <button
                  type="submit"
                  className="mt-2 inline-flex items-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  Save notes
                </button>
                {taskComments.length > 0 ? (
                  <div className="mt-3 grid gap-2">
                    {taskComments.map((comment) => (
                      <p
                        key={comment.id}
                        className="rounded-lg border border-border bg-background p-2 text-xs leading-5 text-muted"
                      >
                        {comment.body}
                      </p>
                    ))}
                  </div>
                ) : null}
              </form>
            </article>
          );
        })}
      </div>
    </section>
  );
}
