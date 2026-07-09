import { Activity, Gauge, ShieldCheck, TriangleAlert } from "lucide-react";

import { ReasoningPathPanel } from "@/components/reasoning/reasoning-path-panel";
import { StatusPill } from "@/components/ui/status-pill";
import type { BuildWorkspaceEvaluation } from "@/types/solution-builder";

type BuildValidationSummaryProps = {
  evaluation: BuildWorkspaceEvaluation;
  reasoningPathIds?: string[];
};

export function BuildValidationSummary({
  evaluation,
  reasoningPathIds = []
}: BuildValidationSummaryProps) {
  const priorityIssues = evaluation.issues
    .filter((issue) => issue.severity !== "info")
    .slice(0, 5);

  return (
    <aside className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
            Continuous validation
          </p>
          <h2 className="mt-2 text-2xl font-bold">{evaluation.completionPercent}% complete</h2>
        </div>
        <StatusPill tone={evaluation.blockingCount > 0 ? "warning" : "accent"}>
          {evaluation.overallStatus}
        </StatusPill>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
        {[
          {
            icon: Gauge,
            label: "Platform health",
            value: evaluation.platformHealth
          },
          {
            icon: Activity,
            label: "Upgrade path",
            value: evaluation.upgradePathScore
          },
          {
            icon: TriangleAlert,
            label: "Warnings",
            value: evaluation.warningCount + evaluation.blockingCount
          }
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-lg border border-border bg-background p-4">
              <div className="flex items-center gap-2 text-sm text-muted">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </div>
              <p className="mt-2 text-2xl font-bold">{item.value}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
          <h3 className="text-sm font-semibold">Validation areas</h3>
        </div>
        <div className="mt-3 grid gap-2">
          {evaluation.areaSummaries.map((area) => (
            <div
              key={area.area}
              className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
            >
              <span>{area.label}</span>
              <StatusPill tone={area.status === "compatible" ? "accent" : "warning"}>
                {area.issueCount}
              </StatusPill>
            </div>
          ))}
        </div>
      </div>

      {priorityIssues.length > 0 ? (
        <div className="mt-5 rounded-lg border border-warning/40 bg-warning/10 p-4">
          <h3 className="text-sm font-semibold">Warnings</h3>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
            {priorityIssues.map((issue) => (
              <li key={issue.id}>{issue.title}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <ReasoningPathPanel
        className="mt-5"
        maxPaths={2}
        pathIds={reasoningPathIds}
        title="Why JETS thinks these warnings matter"
      />
    </aside>
  );
}
