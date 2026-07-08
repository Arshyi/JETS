import type {
  BuildSlotStatus,
  BuildValidationIssue,
  BuildWorkspaceModel,
  EvaluatedBuildWorkspaceSlot
} from "@/types/solution-builder";

function getSlotStatus(
  slot: EvaluatedBuildWorkspaceSlot,
  issues: BuildValidationIssue[]
): BuildSlotStatus {
  if (
    slot.definition.requirement === "required" &&
    !slot.selectedHardware
  ) {
    return "missing";
  }

  return issues.length > 0 ? "warning" : "compatible";
}

export function applyActionPlanValidationProgress(
  model: BuildWorkspaceModel,
  resolvedValidationIssueIds: string[]
): BuildWorkspaceModel {
  if (resolvedValidationIssueIds.length === 0) {
    return model;
  }

  const resolvedIds = new Set(resolvedValidationIssueIds);
  const issues = model.evaluation.issues.filter(
    (issue) => !resolvedIds.has(issue.id)
  );
  const blockingCount = issues.filter(
    (issue) => issue.severity === "blocking"
  ).length;
  const warningCount = issues.filter(
    (issue) => issue.severity === "warning"
  ).length;
  const slots = model.evaluation.slots.map((slot) => {
    const slotIssues = slot.issues.filter((issue) => !resolvedIds.has(issue.id));

    return {
      ...slot,
      issues: slotIssues,
      status: getSlotStatus(slot, slotIssues)
    };
  });
  const areaSummaries = model.evaluation.areaSummaries.map((summary) => {
    const issueCount = issues.filter((issue) => issue.area === summary.area).length;
    const status: BuildSlotStatus = issueCount > 0 ? "warning" : "compatible";

    return {
      ...summary,
      issueCount,
      status
    };
  });

  return {
    ...model,
    evaluation: {
      ...model.evaluation,
      areaSummaries,
      blockingCount,
      issues,
      overallStatus:
        blockingCount > 0
          ? "Blocked"
          : warningCount > 0
            ? "Needs review"
            : "Ready",
      slots,
      warningCount
    }
  };
}
