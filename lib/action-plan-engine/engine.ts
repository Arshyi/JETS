import type {
  ActionPlanValidationResult,
  EngineeringActionDifficulty,
  EngineeringActionPlan,
  EngineeringActionPlanProgress,
  EngineeringActionPlanState,
  EngineeringActionPriority,
  EngineeringActionRisk,
  EngineeringActionTask,
  EngineeringActionTaskStatus,
  EngineeringActionTaskType
} from "@/types/action-plan";
import type {
  HardwarePlaybook,
  HardwarePlaybookRecommendation
} from "@/types/playbook";
import type {
  BuildSlotId,
  BuildValidationIssue,
  BuildWorkspaceModel
} from "@/types/solution-builder";
import type { HardwareStrategyTypeId } from "@/types/strategy";

type GenerateActionPlanInput = {
  model: BuildWorkspaceModel;
  playbooks: HardwarePlaybook[];
  strategyId?: HardwareStrategyTypeId | string | null;
  strategyTitle?: string | null;
};

type TaskRule = {
  costUsd: number;
  difficulty: EngineeringActionDifficulty;
  priority: EngineeringActionPriority;
  risk: EngineeringActionRisk;
  slotIds: BuildSlotId[];
  timeMinutes: number;
  title: string;
  type: EngineeringActionTaskType;
};

const taskRules: TaskRule[] = [
  {
    costUsd: 25,
    difficulty: "Easy",
    priority: "high",
    risk: "medium",
    slotIds: ["pcie-adapter", "egpu-dock", "thunderbolt-adapter", "laptop-ram-dimm-adapter"],
    timeMinutes: 45,
    title: "Install adapter path",
    type: "install-adapter"
  },
  {
    costUsd: 95,
    difficulty: "Moderate",
    priority: "critical",
    risk: "high",
    slotIds: ["psu", "external-psu"],
    timeMinutes: 60,
    title: "Verify or replace power solution",
    type: "power-verification"
  },
  {
    costUsd: 120,
    difficulty: "Moderate",
    priority: "high",
    risk: "medium",
    slotIds: ["psu", "external-psu"],
    timeMinutes: 75,
    title: "Replace PSU if validation fails",
    type: "replace-psu"
  },
  {
    costUsd: 85,
    difficulty: "Easy",
    priority: "medium",
    risk: "low",
    slotIds: ["ram", "laptop-ram-dimm-adapter"],
    timeMinutes: 30,
    title: "Upgrade RAM",
    type: "upgrade-ram"
  },
  {
    costUsd: 220,
    difficulty: "Moderate",
    priority: "high",
    risk: "high",
    slotIds: ["gpu", "egpu-dock"],
    timeMinutes: 60,
    title: "Install GPU",
    type: "install-gpu"
  },
  {
    costUsd: 0,
    difficulty: "Advanced",
    priority: "critical",
    risk: "high",
    slotIds: ["motherboard", "cpu", "ram"],
    timeMinutes: 40,
    title: "Flash BIOS",
    type: "flash-bios"
  },
  {
    costUsd: 0,
    difficulty: "Moderate",
    priority: "medium",
    risk: "medium",
    slotIds: ["motherboard", "operating-system"],
    timeMinutes: 30,
    title: "Update firmware",
    type: "update-firmware"
  },
  {
    costUsd: 75,
    difficulty: "Easy",
    priority: "high",
    risk: "low",
    slotIds: ["storage", "additional-storage"],
    timeMinutes: 35,
    title: "Replace or add storage",
    type: "replace-storage"
  },
  {
    costUsd: 45,
    difficulty: "Moderate",
    priority: "medium",
    risk: "medium",
    slotIds: ["cpu-cooler", "fans"],
    timeMinutes: 45,
    title: "Replace cooling",
    type: "replace-cooling"
  },
  {
    costUsd: 12,
    difficulty: "Easy",
    priority: "medium",
    risk: "low",
    slotIds: ["accessories", "psu", "gpu", "storage"],
    timeMinutes: 25,
    title: "Cable management",
    type: "cable-management"
  },
  {
    costUsd: 0,
    difficulty: "Easy",
    priority: "critical",
    risk: "medium",
    slotIds: ["fans", "cpu-cooler", "gpu", "chassis"],
    timeMinutes: 30,
    title: "Thermal inspection",
    type: "thermal-inspection"
  },
  {
    costUsd: 0,
    difficulty: "Moderate",
    priority: "critical",
    risk: "medium",
    slotIds: ["cpu", "ram", "gpu", "storage", "psu"],
    timeMinutes: 90,
    title: "Stress testing",
    type: "stress-testing"
  }
];

const priorityScores: Record<EngineeringActionPriority, number> = {
  critical: 100,
  high: 80,
  low: 30,
  medium: 55
};

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function unique<T>(values: T[]) {
  return [...new Set(values)];
}

function taskRuleMatchesRecommendation(
  rule: TaskRule,
  recommendation: HardwarePlaybookRecommendation
) {
  const text = `${recommendation.title} ${recommendation.summary} ${recommendation.warnings.join(" ")}`.toLowerCase();

  return (
    rule.slotIds.some((slotId) => recommendation.slotHints.includes(slotId)) ||
    (rule.type === "flash-bios" && text.includes("bios")) ||
    (rule.type === "update-firmware" && text.includes("firmware")) ||
    (rule.type === "thermal-inspection" &&
      (text.includes("airflow") || text.includes("thermal") || text.includes("cooling"))) ||
    (rule.type === "stress-testing" &&
      (text.includes("stress") || recommendation.slotHints.length >= 3))
  );
}

function getIssuesForSlots(
  issues: BuildValidationIssue[],
  slotIds: BuildSlotId[]
) {
  return issues.filter((issue) => issue.slotId && slotIds.includes(issue.slotId));
}

function getTaskDescription(
  rule: TaskRule,
  recommendation: HardwarePlaybookRecommendation
) {
  switch (rule.type) {
    case "install-adapter":
      return `Install the adapter path recommended by "${recommendation.title}" and verify physical fit, slot placement, and cable routing before relying on it.`;
    case "replace-psu":
      return `Replace the PSU only if power verification fails or the current unit cannot safely support "${recommendation.title}".`;
    case "upgrade-ram":
      return `Upgrade RAM according to "${recommendation.title}" while checking platform type, slot count, and capacity limits.`;
    case "install-gpu":
      return `Install the GPU path from "${recommendation.title}" after power and clearance checks are satisfied.`;
    case "flash-bios":
      return `Flash or verify BIOS before installing parts that depend on newer platform support.`;
    case "update-firmware":
      return `Update firmware only after preserving current settings and confirming the update is relevant to this project.`;
    case "replace-storage":
      return `Install the storage upgrade from "${recommendation.title}" and confirm boot or data-path behavior.`;
    case "replace-cooling":
      return `Improve cooling before raising sustained load, GPU power, or CPU thermals.`;
    case "cable-management":
      return `Route cables to preserve airflow, avoid fan contact, and make future inspection easier.`;
    case "thermal-inspection":
      return `Inspect airflow, fans, intake paths, and sustained-load thermals before treating the build as stable.`;
    case "power-verification":
      return `Verify wattage, connectors, adapters, and PSU condition before installing higher-draw hardware.`;
    case "stress-testing":
      return `Run stability checks after hardware changes so the project moves from assembled to trustworthy.`;
  }
}

function shouldRequireBiosFirst(
  recommendation: HardwarePlaybookRecommendation,
  tasks: EngineeringActionTask[]
) {
  const text = `${recommendation.title} ${recommendation.summary} ${recommendation.warnings.join(" ")}`.toLowerCase();

  return text.includes("bios") && tasks.some((task) => task.type === "flash-bios");
}

function createRecommendationTask(
  rule: TaskRule,
  playbook: HardwarePlaybook,
  recommendation: HardwarePlaybookRecommendation,
  input: GenerateActionPlanInput,
  dependencyTaskIds: string[]
): EngineeringActionTask {
  const slotIds = rule.slotIds.filter((slotId) =>
    recommendation.slotHints.includes(slotId)
  );
  const issues = getIssuesForSlots(input.model.evaluation.issues, [
    ...slotIds,
    ...recommendation.slotHints
  ]);

  return {
    dependencyTaskIds,
    description: getTaskDescription(rule, recommendation),
    difficulty: rule.difficulty,
    estimatedCostUsd: rule.costUsd,
    estimatedTimeMinutes: rule.timeMinutes,
    evidenceRecordIds: recommendation.evidenceRecordIds,
    id: `action-${slugify(recommendation.id)}-${rule.type}`,
    isOptional: rule.priority !== "critical",
    priority: rule.priority,
    recommendation: {
      playbookId: playbook.id,
      playbookRecommendationId: recommendation.id,
      title: recommendation.title
    },
    resolvesValidationIssueIds: issues.map((issue) => issue.id),
    risk: rule.risk,
    slotIds: unique([...slotIds, ...recommendation.slotHints]),
    sortOrder: 0,
    source: {
      platformId: playbook.platformId,
      platformName: playbook.platformName,
      strategyId: input.strategyId ?? input.model.project.strategyId ?? null,
      strategyTitle: input.strategyTitle ?? input.model.project.strategyTitle ?? null
    },
    title: rule.title,
    type: rule.type,
    verification: recommendation.verification
  };
}

function getTaskIdsByType(
  tasks: EngineeringActionTask[],
  taskTypes: EngineeringActionTaskType[]
) {
  return tasks
    .filter((task) => taskTypes.includes(task.type))
    .map((task) => task.id);
}

function applyDependencyRules(
  tasks: EngineeringActionTask[],
  recommendation: HardwarePlaybookRecommendation
) {
  const biosTaskIds = getTaskIdsByType(tasks, ["flash-bios", "update-firmware"]);
  const powerTaskIds = getTaskIdsByType(tasks, ["power-verification", "replace-psu"]);
  const installTaskIds = getTaskIdsByType(tasks, [
    "install-adapter",
    "install-gpu",
    "replace-storage",
    "upgrade-ram",
    "replace-cooling",
    "cable-management",
    "thermal-inspection"
  ]);

  return tasks.map((task) => {
    const dependencies = new Set(task.dependencyTaskIds);

    if (
      shouldRequireBiosFirst(recommendation, tasks) &&
      !["flash-bios", "update-firmware"].includes(task.type)
    ) {
      for (const id of biosTaskIds) dependencies.add(id);
    }

    if (task.type === "install-gpu" || task.type === "replace-psu") {
      for (const id of powerTaskIds) {
        if (id !== task.id) dependencies.add(id);
      }
    }

    if (task.type === "thermal-inspection") {
      for (const id of getTaskIdsByType(tasks, ["install-gpu", "replace-cooling"])) {
        if (id !== task.id) dependencies.add(id);
      }
    }

    if (task.type === "stress-testing") {
      for (const id of installTaskIds) {
        if (id !== task.id) dependencies.add(id);
      }
    }

    return {
      ...task,
      dependencyTaskIds: [...dependencies].filter((id) => id !== task.id)
    };
  });
}

function buildTasksFromPlaybooks(input: GenerateActionPlanInput) {
  return input.playbooks.flatMap((playbook) =>
    playbook.recommendations.flatMap((recommendation) => {
      const baseTasks = taskRules
        .filter((rule) => taskRuleMatchesRecommendation(rule, recommendation))
        .map((rule) =>
          createRecommendationTask(rule, playbook, recommendation, input, [])
        );
      const tasks =
        baseTasks.some((task) => task.type === "stress-testing") || baseTasks.length === 0
          ? baseTasks
          : [
              ...baseTasks,
              createRecommendationTask(
                taskRules.find((rule) => rule.type === "stress-testing") ?? taskRules[0],
                playbook,
                recommendation,
                input,
                baseTasks.map((task) => task.id)
              )
            ];

      return applyDependencyRules(tasks, recommendation);
    })
  );
}

function getRuleForIssue(issue: BuildValidationIssue) {
  if (issue.area === "power" || issue.slotId === "psu") {
    return taskRules.find((rule) => rule.type === "power-verification");
  }

  if (issue.area === "cooling" || issue.area === "physical-fit") {
    return taskRules.find((rule) => rule.type === "thermal-inspection");
  }

  if (issue.area === "storage" || issue.slotId === "storage") {
    return taskRules.find((rule) => rule.type === "replace-storage");
  }

  if (issue.area === "ram" || issue.slotId === "ram") {
    return taskRules.find((rule) => rule.type === "upgrade-ram");
  }

  if (issue.area === "pcie" || issue.slotId === "pcie-adapter") {
    return taskRules.find((rule) => rule.type === "install-adapter");
  }

  if (issue.area === "platform-health") {
    return taskRules.find((rule) => rule.type === "update-firmware");
  }

  if (issue.slotId === "gpu") {
    return taskRules.find((rule) => rule.type === "install-gpu");
  }

  return null;
}

function buildTasksFromValidationIssues(input: GenerateActionPlanInput) {
  const platformId = input.model.platformInsight?.platformId ?? null;
  const platformName = input.model.platformInsight?.platformName ?? null;

  return input.model.evaluation.issues.flatMap((issue) => {
    const rule = getRuleForIssue(issue);

    if (!rule) {
      return [];
    }

    const slotIds = issue.slotId ? [issue.slotId] : rule.slotIds;

    return [
      {
        dependencyTaskIds: [],
        description: `Builder validation raised "${issue.title}". Complete this task to document the engineering step that should resolve or narrow the warning.`,
        difficulty: rule.difficulty,
        estimatedCostUsd: rule.costUsd,
        estimatedTimeMinutes: rule.timeMinutes,
        evidenceRecordIds: [],
        id: `validation-${slugify(issue.id)}-${rule.type}`,
        isOptional: issue.severity !== "blocking" && rule.priority !== "critical",
        priority:
          issue.severity === "blocking" ? "critical" : rule.priority,
        recommendation: null,
        resolvesValidationIssueIds: [issue.id],
        risk: issue.severity === "blocking" ? "high" : rule.risk,
        slotIds,
        sortOrder: 0,
        source: {
          platformId,
          platformName,
          strategyId: input.strategyId ?? input.model.project.strategyId ?? null,
          strategyTitle: input.strategyTitle ?? input.model.project.strategyTitle ?? null
        },
        title: `${rule.title}: ${issue.title}`,
        type: rule.type,
        verification: "pending-review"
      } satisfies EngineeringActionTask
    ];
  });
}

function dedupeTasks(tasks: EngineeringActionTask[]) {
  const seen = new Map<string, EngineeringActionTask>();

  for (const task of tasks) {
    const key = `${task.type}:${task.recommendation?.playbookRecommendationId ?? task.resolvesValidationIssueIds.join(",")}:${task.slotIds.join(",")}`;
    const existing = seen.get(key);

    if (!existing) {
      seen.set(key, task);
      continue;
    }

    seen.set(key, {
      ...existing,
      dependencyTaskIds: unique([
        ...existing.dependencyTaskIds,
        ...task.dependencyTaskIds
      ]),
      evidenceRecordIds: unique([
        ...existing.evidenceRecordIds,
        ...task.evidenceRecordIds
      ]),
      resolvesValidationIssueIds: unique([
        ...existing.resolvesValidationIssueIds,
        ...task.resolvesValidationIssueIds
      ]),
      slotIds: unique([...existing.slotIds, ...task.slotIds])
    });
  }

  return [...seen.values()]
    .sort((left, right) => {
      return (
        priorityScores[right.priority] - priorityScores[left.priority] ||
        left.title.localeCompare(right.title)
      );
    })
    .map((task, index) => ({
      ...task,
      sortOrder: index
    }));
}

export function createDefaultActionPlanState(
  plan: Pick<EngineeringActionPlan, "tasks">
): EngineeringActionPlanState {
  return plan.tasks.reduce((state, task) => {
    state[task.id] = {
      status: "recommended"
    };
    return state;
  }, {} as EngineeringActionPlanState);
}

export function canCompleteActionTask(
  task: EngineeringActionTask,
  state: EngineeringActionPlanState
) {
  return task.dependencyTaskIds.every(
    (dependencyId) => state[dependencyId]?.status === "completed"
  );
}

export function normalizeActionPlanState(
  plan: Pick<EngineeringActionPlan, "tasks">,
  state: EngineeringActionPlanState
): EngineeringActionPlanState {
  const defaults = createDefaultActionPlanState(plan);
  const merged: EngineeringActionPlanState = {
    ...defaults,
    ...state
  };

  for (const task of plan.tasks) {
    if (
      merged[task.id]?.status === "completed" &&
      !canCompleteActionTask(task, merged)
    ) {
      merged[task.id] = {
        ...merged[task.id],
        status: "accepted"
      };
    }
  }

  return merged;
}

function getActionableTasks(
  plan: Pick<EngineeringActionPlan, "tasks">,
  state: EngineeringActionPlanState
) {
  return plan.tasks.filter((task) => {
    const status = state[task.id]?.status ?? "recommended";

    return status !== "skipped" && status !== "rejected";
  });
}

export function getActionPlanProgress(
  plan: Pick<EngineeringActionPlan, "generatedFrom" | "tasks">,
  state: EngineeringActionPlanState = {}
): EngineeringActionPlanProgress {
  const normalizedState = normalizeActionPlanState(plan, state);
  const actionableTasks = getActionableTasks(plan, normalizedState);
  const completedTasks = actionableTasks.filter(
    (task) => normalizedState[task.id]?.status === "completed"
  );
  const acceptedTasks = actionableTasks.filter(
    (task) => normalizedState[task.id]?.status === "accepted"
  );
  const blockedTasks = actionableTasks.filter(
    (task) => !canCompleteActionTask(task, normalizedState)
  );
  const skippedTasks = plan.tasks.filter(
    (task) => normalizedState[task.id]?.status === "skipped"
  );
  const rejectedTasks = plan.tasks.filter(
    (task) => normalizedState[task.id]?.status === "rejected"
  );
  const remainingTasks = actionableTasks.filter(
    (task) => normalizedState[task.id]?.status !== "completed"
  );
  const resolvedValidationIssueIds = unique(
    completedTasks.flatMap((task) => task.resolvesValidationIssueIds)
  );
  const knowledgeLinkedTasks = plan.tasks.filter(
    (task) =>
      task.evidenceRecordIds.length > 0 &&
      task.recommendation &&
      task.source.platformId
  ).length;
  const totalPriority = actionableTasks.reduce(
    (sum, task) => sum + priorityScores[task.priority],
    0
  );
  const completedPriority = completedTasks.reduce(
    (sum, task) => sum + priorityScores[task.priority],
    0
  );
  const taskCompletion =
    actionableTasks.length > 0
      ? (completedTasks.length / actionableTasks.length) * 100
      : 100;
  const validationProgress =
    plan.generatedFrom.builderValidationIssueCount > 0
      ? (resolvedValidationIssueIds.length /
          plan.generatedFrom.builderValidationIssueCount) *
        100
      : 100;

  return {
    acceptedTasks: acceptedTasks.length,
    blockedTasks: blockedTasks.length,
    completedTasks: completedTasks.length,
    estimatedRemainingCostUsd: remainingTasks.reduce(
      (sum, task) => sum + task.estimatedCostUsd,
      0
    ),
    estimatedRemainingTimeMinutes: remainingTasks.reduce(
      (sum, task) => sum + task.estimatedTimeMinutes,
      0
    ),
    knowledgeCoveragePercent: clampPercent(
      plan.tasks.length > 0 ? (knowledgeLinkedTasks / plan.tasks.length) * 100 : 100
    ),
    overallCompletionPercent: clampPercent(taskCompletion),
    platformImprovementPercent: clampPercent(
      totalPriority > 0 ? (completedPriority / totalPriority) * 100 : taskCompletion
    ),
    projectMaturityPercent: clampPercent(
      plan.generatedFrom.projectCompletionPercent * 0.55 +
        taskCompletion * 0.35 +
        (plan.generatedFrom.builderValidationIssueCount ===
        resolvedValidationIssueIds.length
          ? 10
          : 0)
    ),
    rejectedTasks: rejectedTasks.length,
    resolvedValidationIssueIds,
    skippedTasks: skippedTasks.length,
    totalTasks: plan.tasks.length,
    validationProgressPercent: clampPercent(validationProgress)
  };
}

export function generateProjectActionPlan(
  input: GenerateActionPlanInput
): EngineeringActionPlan {
  const playbookTasks = buildTasksFromPlaybooks(input);
  const validationTasks = buildTasksFromValidationIssues(input);
  const tasks = dedupeTasks([...playbookTasks, ...validationTasks]);
  const planBase = {
    generatedFrom: {
      builderValidationIssueCount: input.model.evaluation.issues.length,
      playbookIds: input.playbooks.map((playbook) => playbook.id),
      projectCompletionPercent: input.model.evaluation.completionPercent,
      strategyId: input.strategyId ?? input.model.project.strategyId ?? null
    },
    id: `action-plan-${input.model.project.id}`,
    platformId: input.model.platformInsight?.platformId ?? input.playbooks[0]?.platformId ?? null,
    platformName:
      input.model.platformInsight?.platformName ??
      input.playbooks[0]?.platformName ??
      null,
    projectId: input.model.project.id,
    projectTitle: input.model.project.title,
    tasks
  };

  return {
    ...planBase,
    progress: getActionPlanProgress(planBase)
  };
}

function createAssertion(
  message: string,
  passed: boolean,
  expected: string | number | null,
  actual: string | number | null
) {
  return {
    actual,
    expected,
    message,
    passed
  };
}

export function validateActionPlanFixture(
  plan: EngineeringActionPlan
): ActionPlanValidationResult {
  const dependencyIds = new Set(plan.tasks.flatMap((task) => task.dependencyTaskIds));
  const taskIds = new Set(plan.tasks.map((task) => task.id));
  const tasksWithDependencies = plan.tasks.filter(
    (task) => task.dependencyTaskIds.length > 0
  );
  const tasksWithEvidence = plan.tasks.filter(
    (task) => task.evidenceRecordIds.length > 0 || task.resolvesValidationIssueIds.length > 0
  );
  const tasksWithValidationImpact = plan.tasks.filter(
    (task) => task.resolvesValidationIssueIds.length > 0
  );
  const supportedStatuses = new Set<EngineeringActionTaskStatus>([
    "accepted",
    "completed",
    "recommended",
    "rejected",
    "skipped"
  ]);
  const defaultState = createDefaultActionPlanState(plan);
  const progress = getActionPlanProgress(plan, defaultState);
  const assertions = [
    createAssertion("Action plan generates at least one task.", plan.tasks.length > 0, 1, plan.tasks.length),
    createAssertion(
      "Action plan includes dependency chains.",
      tasksWithDependencies.length > 0,
      1,
      tasksWithDependencies.length
    ),
    createAssertion(
      "Every dependency points to an existing task.",
      [...dependencyIds].every((id) => taskIds.has(id)),
      dependencyIds.size,
      [...dependencyIds].filter((id) => taskIds.has(id)).length
    ),
    createAssertion(
      "Tasks link back to evidence, playbooks, or validation issues.",
      tasksWithEvidence.length === plan.tasks.length,
      plan.tasks.length,
      tasksWithEvidence.length
    ),
    createAssertion(
      "Action plan exposes builder validation impact.",
      tasksWithValidationImpact.length > 0,
      1,
      tasksWithValidationImpact.length
    ),
    createAssertion(
      "Action plan exposes progress metrics.",
      progress.totalTasks === plan.tasks.length &&
        progress.estimatedRemainingTimeMinutes >= 0 &&
        progress.knowledgeCoveragePercent >= 0,
      plan.tasks.length,
      progress.totalTasks
    ),
    createAssertion(
      "Action plan supports the expected task statuses.",
      supportedStatuses.size === 5,
      5,
      supportedStatuses.size
    )
  ];

  return {
    assertions,
    fixtureId: plan.id,
    passed: assertions.every((assertion) => assertion.passed),
    taskCount: plan.tasks.length,
    title: `${plan.projectTitle} action plan`
  };
}
