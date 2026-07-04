import { CheckCircle2, CircleDashed } from "lucide-react";
import Link from "next/link";

import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";

type WorkflowStageId =
  | "project"
  | "components"
  | "validate"
  | "optimize"
  | "compare"
  | "finish";

type ProjectWorkflowProgressProps = {
  branchCount: number;
  completionPercent: number;
  currentStage: WorkflowStageId;
  hasOptimizationRuns: boolean;
  projectId: string;
  warningCount: number;
};

const stageLabels: Record<WorkflowStageId, string> = {
  compare: "Compare",
  components: "Components",
  finish: "Finish",
  optimize: "Optimize",
  project: "Project",
  validate: "Validate"
};

const orderedStages: WorkflowStageId[] = [
  "project",
  "components",
  "validate",
  "optimize",
  "compare",
  "finish"
];

function getStageHref(projectId: string, stage: WorkflowStageId) {
  if (stage === "optimize") {
    return `/solution-builder/projects/${projectId}/optimize`;
  }

  return `/solution-builder/projects/${projectId}`;
}

function getStageComplete(
  stage: WorkflowStageId,
  completionPercent: number,
  hasOptimizationRuns: boolean,
  branchCount: number,
  warningCount: number
) {
  if (stage === "project") {
    return true;
  }

  if (stage === "components") {
    return completionPercent > 0;
  }

  if (stage === "validate") {
    return completionPercent >= 100 && warningCount === 0;
  }

  if (stage === "optimize") {
    return hasOptimizationRuns;
  }

  if (stage === "compare") {
    return branchCount > 0;
  }

  return completionPercent >= 100 && hasOptimizationRuns;
}

export function ProjectWorkflowProgress({
  branchCount,
  completionPercent,
  currentStage,
  hasOptimizationRuns,
  projectId,
  warningCount
}: ProjectWorkflowProgressProps) {
  return (
    <nav
      aria-label="Project workflow progress"
      className="rounded-lg border border-border bg-background p-3"
    >
      <div className="flex flex-wrap items-center gap-2">
        {orderedStages.map((stage) => {
          const isCurrent = stage === currentStage;
          const isComplete = getStageComplete(
            stage,
            completionPercent,
            hasOptimizationRuns,
            branchCount,
            warningCount
          );
          const Icon = isComplete ? CheckCircle2 : CircleDashed;

          return (
            <Link
              key={stage}
              href={getStageHref(projectId, stage)}
              className={cn(
                "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background",
                isCurrent
                  ? "border-accent bg-accent/10 text-accent-strong dark:text-accent"
                  : "border-border bg-panel text-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {stageLabels[stage]}
            </Link>
          );
        })}
        <StatusPill>{completionPercent}% complete</StatusPill>
      </div>
    </nav>
  );
}
