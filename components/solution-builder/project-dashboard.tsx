import { Archive, FolderKanban, Plus, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { formatAuditTimestamp } from "@/lib/decision-audit/format";
import {
  archiveBuildProjectAction,
  deleteBuildProjectAction,
  restoreBuildProjectAction
} from "@/lib/supabase/project-actions";
import type { BuildProjectDashboardSummary } from "@/lib/supabase/queries";

type ProjectDashboardProps = {
  projects: BuildProjectDashboardSummary[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function getOptimizationLabel(project: BuildProjectDashboardSummary) {
  if (!project.latestOptimizationRun) {
    return "No optimization runs yet";
  }

  return `Latest optimized score ${project.latestOptimizationRun.optimized_score}`;
}

function getMissingSlotSummary(project: BuildProjectDashboardSummary) {
  if (project.missingRequiredSlots.length === 0) {
    return "Required slots are filled.";
  }

  return project.missingRequiredSlots.slice(0, 3).join(", ");
}

export function ProjectDashboard({ projects }: ProjectDashboardProps) {
  return (
    <main className="bg-background pb-16">
      <section className="border-b border-border bg-panel">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-12 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
              Projects
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold">Project Dashboard</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
              Continue a hardware solution from goal to components, validation,
              optimization, branches, comparison, and final review.
            </p>
          </div>
          <Link
            href="/solution-builder/projects/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create project
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Start by choosing what you are trying to build. JETS will create the builder workspace and guide the next slot."
            icon={FolderKanban}
            action={
              <Link
                href="/solution-builder/projects/new"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Create project
              </Link>
            }
          />
        ) : (
          <div className="grid gap-5">
            {projects.map((project) => {
              const row = project.project;
              const evaluation = project.model.evaluation;

              return (
                <article
                  key={row.id}
                  className="rounded-lg border border-border bg-panel p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <StatusPill tone={row.status === "active" ? "accent" : "neutral"}>
                          {row.status}
                        </StatusPill>
                        <StatusPill>{row.purpose}</StatusPill>
                        <StatusPill>
                          {row.currency} {row.budget}
                        </StatusPill>
                        <StatusPill>{row.branch_name}</StatusPill>
                        {row.parent_project_id ? (
                          <StatusPill>branch</StatusPill>
                        ) : (
                          <StatusPill>root</StatusPill>
                        )}
                      </div>
                      <h2 className="mt-3 text-2xl font-bold">{row.title}</h2>
                      <p className="mt-2 text-sm text-muted">
                        Updated {formatDate(row.updated_at)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/solution-builder/projects/${row.id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                      >
                        Open Builder
                      </Link>
                      <form action={row.status === "archived" ? restoreBuildProjectAction : archiveBuildProjectAction}>
                        <input type="hidden" name="projectId" value={row.id} />
                        <input type="hidden" name="returnTo" value="/solution-builder/projects" />
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                        >
                          {row.status === "archived" ? (
                            <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Archive className="h-4 w-4" aria-hidden="true" />
                          )}
                          {row.status === "archived" ? "Restore" : "Archive"}
                        </button>
                      </form>
                      <form action={deleteBuildProjectAction}>
                        <input type="hidden" name="projectId" value={row.id} />
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm font-semibold text-warning transition hover:bg-warning/15 focus:outline-none focus:ring-2 focus:ring-warning focus:ring-offset-2 focus:ring-offset-background"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6">
                    {[
                      ["Build score", project.model.comparePreview.yourBuild.score],
                      ["Completion", `${evaluation.completionPercent}%`],
                      [
                        "Required slots",
                        `${project.selectedRequiredSlotCount}/${project.totalRequiredSlotCount}`
                      ],
                      [
                        "Warnings",
                        evaluation.warningCount + evaluation.blockingCount
                      ],
                      ["Optimizations", project.optimizationRunCount],
                      ["Branches", project.branchCount]
                    ].map(([label, value]) => (
                      <div
                        key={label}
                        className="rounded-lg border border-border bg-background p-4"
                      >
                        <p className="text-xs font-semibold uppercase text-muted">
                          {label}
                        </p>
                        <p className="mt-2 text-2xl font-bold">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm font-semibold">Missing slots</p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {getMissingSlotSummary(project)}
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm font-semibold">Validation summary</p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {evaluation.overallStatus} with{" "}
                        {evaluation.warningCount + evaluation.blockingCount} items
                        to review.
                      </p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm font-semibold">Optimization status</p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {getOptimizationLabel(project)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_280px]">
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-sm font-semibold">Last activity</p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {project.lastActivity
                          ? `${project.lastActivity.summary} ${formatAuditTimestamp(project.lastActivity.created_at)}`
                          : "No project activity yet. Add a component to start the audit trail."}
                      </p>
                    </div>
                    <div className="rounded-lg border border-accent/40 bg-accent/10 p-4">
                      <p className="text-sm font-semibold">Recommended next action</p>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {project.recommendedNextAction.description}
                      </p>
                      <Link
                        href={project.recommendedNextAction.href}
                        className="mt-4 inline-flex items-center justify-center rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                      >
                        {project.recommendedNextAction.label}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
