"use client";

import {
  CheckCircle2,
  Circle,
  Clock3,
  DollarSign,
  RotateCcw,
  ShieldAlert,
  SkipForward,
  XCircle
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StatusPill } from "@/components/ui/status-pill";
import {
  canCompleteActionTask,
  createDefaultActionPlanState,
  getActionPlanProgress,
  normalizeActionPlanState
} from "@/lib/action-plan-engine/engine";
import type {
  EngineeringActionPlan,
  EngineeringActionPlanState,
  EngineeringActionTask,
  EngineeringActionTaskStatus
} from "@/types/action-plan";

type ActionPlanPanelProps = {
  plan: EngineeringActionPlan;
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

function loadStoredState(storageKey: string) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);

    return raw ? (JSON.parse(raw) as EngineeringActionPlanState) : null;
  } catch {
    return null;
  }
}

export function ActionPlanPanel({ plan }: ActionPlanPanelProps) {
  const storageKey = `jets-action-plan:${plan.projectId}:${plan.id}`;
  const [state, setState] = useState<EngineeringActionPlanState>(() =>
    createDefaultActionPlanState(plan)
  );

  useEffect(() => {
    const storedState = loadStoredState(storageKey);

    if (storedState) {
      setState(normalizeActionPlanState(plan, storedState));
    }
  }, [plan, storageKey]);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  const normalizedState = useMemo(
    () => normalizeActionPlanState(plan, state),
    [plan, state]
  );
  const progress = useMemo(
    () => getActionPlanProgress(plan, normalizedState),
    [plan, normalizedState]
  );

  function setTaskStatus(taskId: string, status: EngineeringActionTaskStatus) {
    setState((current) => ({
      ...current,
      [taskId]: {
        status,
        updatedAt: new Date().toISOString()
      }
    }));
  }

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
            Builder validation state. Task choices are local to this browser in
            Phase 5.1.
          </p>
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

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
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
          <p className="text-xs font-semibold uppercase text-muted">Validation impact</p>
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
        {plan.tasks.map((task) => {
          const taskState = normalizedState[task.id] ?? { status: "recommended" };
          const canComplete =
            taskState.status === "accepted" &&
            canCompleteActionTask(task, normalizedState);
          const blocked =
            taskState.status === "accepted" &&
            !canCompleteActionTask(task, normalizedState);

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
                    <StatusPill>{task.priority} priority</StatusPill>
                    <StatusPill tone={riskTone(task.risk)}>{task.risk} risk</StatusPill>
                    <StatusPill>{task.verification}</StatusPill>
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
                  <button
                    type="button"
                    onClick={() => setTaskStatus(task.id, "accepted")}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong"
                  >
                    <Circle className="h-4 w-4" aria-hidden="true" />
                    Accept task
                  </button>
                ) : null}
                {taskState.status === "accepted" ? (
                  <button
                    type="button"
                    disabled={!canComplete}
                    onClick={() => setTaskStatus(task.id, "completed")}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                    Mark complete
                  </button>
                ) : null}
                {taskState.status === "completed" ? (
                  <button
                    type="button"
                    onClick={() => setTaskStatus(task.id, "accepted")}
                    className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    Undo completion
                  </button>
                ) : null}
                {taskState.status !== "completed" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setTaskStatus(task.id, "skipped")}
                      className="inline-flex items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground"
                    >
                      <SkipForward className="h-4 w-4" aria-hidden="true" />
                      Skip task
                    </button>
                    <button
                      type="button"
                      onClick={() => setTaskStatus(task.id, "rejected")}
                      className="inline-flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm font-semibold text-warning transition hover:bg-warning/15"
                    >
                      <XCircle className="h-4 w-4" aria-hidden="true" />
                      Reject recommendation
                    </button>
                  </>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
