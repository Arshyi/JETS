import {
  getActionPlanProgress,
  normalizeActionPlanState
} from "@/lib/action-plan-engine/engine";
import type {
  EngineeringActionPlan,
  EngineeringActionPlanState,
  EngineeringActionTaskStatus
} from "@/types/action-plan";
import type { ActionPlanTaskRow } from "@/types/database";

const persistedStatuses = new Set<EngineeringActionTaskStatus>([
  "accepted",
  "completed",
  "recommended",
  "rejected",
  "skipped"
]);

function toPersistedStatus(value: string): EngineeringActionTaskStatus {
  return persistedStatuses.has(value as EngineeringActionTaskStatus)
    ? (value as EngineeringActionTaskStatus)
    : "recommended";
}

export function getActionPlanTaskRowsByKey(rows: ActionPlanTaskRow[]) {
  return new Map(rows.map((row) => [row.task_key, row]));
}

export function createActionPlanStateFromTaskRows(
  plan: Pick<EngineeringActionPlan, "tasks">,
  rows: ActionPlanTaskRow[]
): EngineeringActionPlanState {
  const validTaskIds = new Set(plan.tasks.map((task) => task.id));
  const state = rows.reduce((accumulator, row) => {
    if (!validTaskIds.has(row.task_key)) {
      return accumulator;
    }

    accumulator[row.task_key] = {
      status: toPersistedStatus(row.status),
      updatedAt: row.updated_at
    };

    return accumulator;
  }, {} as EngineeringActionPlanState);

  return normalizeActionPlanState(plan, state);
}

export function getActionPlanProgressFromTaskRows(
  plan: Pick<EngineeringActionPlan, "generatedFrom" | "tasks">,
  rows: ActionPlanTaskRow[]
) {
  return getActionPlanProgress(
    plan,
    createActionPlanStateFromTaskRows(plan, rows)
  );
}
