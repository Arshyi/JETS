import { GitBranch, Lock, Sparkles, Unlock } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { formatAuditTimestamp } from "@/lib/decision-audit/format";
import { createOptimizedProjectBranchAction } from "@/lib/supabase/branch-actions";
import { runBuildProjectOptimizationAction } from "@/lib/supabase/optimization-actions";
import {
  optimizationDepthLabels,
  optimizationDepths,
  optimizationGoalLabels,
  optimizationGoals
} from "@/types/optimization";
import type { BuildProjectDetailData } from "@/lib/solution-builder/projects";
import type {
  BuildProjectOptimizationRunRow,
  BuildProjectOptimizationSuggestionRow
} from "@/types/database";

type OptimizationExperienceProps = {
  detail: BuildProjectDetailData;
  runs: BuildProjectOptimizationRunRow[];
  selectedRun: BuildProjectOptimizationRunRow | null;
  suggestions: BuildProjectOptimizationSuggestionRow[];
};

const pipelineSteps = [
  "Candidate Solutions",
  "Compatibility Filter",
  "Decision Engine",
  "Optimization Pass",
  "Ranking",
  "Explainability"
];

function formatDelta(value: number) {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
}

function formatMoney(value: number) {
  if (value > 0) {
    return `+$${value}`;
  }

  if (value < 0) {
    return `-$${Math.abs(value)}`;
  }

  return "$0";
}

export function OptimizationExperience({
  detail,
  runs,
  selectedRun,
  suggestions
}: OptimizationExperienceProps) {
  const { model, projectRow } = detail;
  const returnTo = `/solution-builder/projects/${projectRow.id}/optimize`;

  return (
    <main className="bg-background pb-16">
      <section className="border-b border-border bg-panel">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
            Optimize My Build
          </p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold">{model.project.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
                Analyze the current project, preserve locked components, and search deterministic component swaps or reuse paths.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="accent">{model.evaluation.completionPercent}% complete</StatusPill>
              <StatusPill>{model.evaluation.overallStatus}</StatusPill>
              <StatusPill>{runs.length} runs</StatusPill>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[360px_1fr] lg:px-8">
        <aside className="grid gap-6 lg:sticky lg:top-24 lg:self-start">
          <form action={runBuildProjectOptimizationAction} className="rounded-lg border border-border bg-panel p-5">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Optimization controls</h2>
            </div>
            <input type="hidden" name="projectId" value={projectRow.id} />
            <input type="hidden" name="returnTo" value={returnTo} />

            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Goal
                <select
                  name="goal"
                  defaultValue={selectedRun?.goal ?? "best-balanced"}
                  className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                >
                  {optimizationGoals.map((goal) => (
                    <option key={goal} value={goal}>
                      {optimizationGoalLabels[goal]}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Depth
                <select
                  name="depth"
                  defaultValue={selectedRun?.depth ?? "standard"}
                  className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                >
                  {optimizationDepths.map((depth) => (
                    <option key={depth} value={depth}>
                      {optimizationDepthLabels[depth]}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <p className="text-sm font-medium">Locked components</p>
                <div className="mt-3 grid gap-2">
                  {model.evaluation.slots
                    .filter((slot) => slot.definition.requirement === "required")
                    .map((slot) => {
                      const isSelected = Boolean(slot.selectedHardware);

                      return (
                        <label
                          key={slot.definition.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                        >
                          <span className="min-w-0">
                            <span className="block font-medium">{slot.definition.label}</span>
                            <span className="block truncate text-xs text-muted">
                              {slot.selectedHardware?.label ?? "Empty"}
                            </span>
                          </span>
                          <span className="flex items-center gap-2">
                            {isSelected ? (
                              <Lock className="h-4 w-4 text-muted" aria-hidden="true" />
                            ) : (
                              <Unlock className="h-4 w-4 text-muted" aria-hidden="true" />
                            )}
                            <input
                              type="checkbox"
                              name="lockedSlots"
                              value={slot.definition.id}
                              disabled={!isSelected}
                              defaultChecked={selectedRun?.locked_slots.includes(slot.definition.id) ?? false}
                              className="h-4 w-4 accent-accent disabled:cursor-not-allowed"
                            />
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Optimize
              </button>
            </div>
          </form>

          <Link
            href={`/solution-builder/projects/${projectRow.id}`}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            Back to project
          </Link>
        </aside>

        <div className="grid gap-6">
          {selectedRun ? (
            <>
              <section className="rounded-lg border border-border bg-panel p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill tone="accent">
                        {optimizationGoalLabels[selectedRun.goal as keyof typeof optimizationGoalLabels] ?? selectedRun.goal}
                      </StatusPill>
                      <StatusPill>{selectedRun.depth}</StatusPill>
                      <StatusPill>{selectedRun.locked_slots.length} locked</StatusPill>
                    </div>
                    <h2 className="mt-4 text-2xl font-bold">Optimized build summary</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">{selectedRun.summary}</p>
                    <p className="mt-2 text-sm text-muted">
                      Run {formatAuditTimestamp(selectedRun.created_at)}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs font-semibold uppercase text-muted">Baseline</p>
                      <p className="mt-2 text-4xl font-bold">{selectedRun.baseline_score}</p>
                    </div>
                    <div className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs font-semibold uppercase text-muted">Optimized</p>
                      <p className="mt-2 text-4xl font-bold text-accent-strong dark:text-accent">
                        {selectedRun.optimized_score}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-border bg-panel p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">Suggested improvements</h2>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Select suggestions and branch the project. The original build stays unchanged.
                    </p>
                  </div>
                  <StatusPill>{suggestions.length} suggestions</StatusPill>
                </div>

                {suggestions.length > 0 ? (
                  <form action={createOptimizedProjectBranchAction} className="mt-5 grid gap-4">
                    <input type="hidden" name="projectId" value={projectRow.id} />
                    <input type="hidden" name="runId" value={selectedRun.id} />
                    <input type="hidden" name="returnTo" value={returnTo} />
                    <label className="grid gap-2 text-sm font-medium lg:max-w-md">
                      Branch name
                      <input
                        name="branchName"
                        defaultValue={`opt/${selectedRun.goal}`}
                        className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                      />
                    </label>

                    <div className="grid gap-4">
                      {suggestions.map((suggestion) => (
                        <article key={suggestion.id} className="rounded-lg border border-border bg-background p-4">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex gap-3">
                              <input
                                type="checkbox"
                                name="suggestionIds"
                                value={suggestion.id}
                                defaultChecked={suggestion.ranking <= 3}
                                className="mt-1 h-4 w-4 shrink-0 accent-accent"
                                aria-label={`Apply suggestion ${suggestion.ranking}`}
                              />
                              <div>
                                <div className="flex flex-wrap gap-2">
                                  <StatusPill tone="accent">#{suggestion.ranking}</StatusPill>
                                  <StatusPill>{suggestion.action}</StatusPill>
                                  <StatusPill>{suggestion.slot_id}</StatusPill>
                                  <StatusPill>{suggestion.confidence}% confidence</StatusPill>
                                </div>
                                <h3 className="mt-3 text-lg font-semibold">
                                  {suggestion.current_component_title
                                    ? `${suggestion.current_component_title} -> ${suggestion.suggested_component_title ?? "reuse path"}`
                                    : suggestion.suggested_component_title ?? "Reuse owned hardware"}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-muted">
                                  {suggestion.reason}
                                </p>
                              </div>
                            </div>
                            <div className="grid min-w-52 grid-cols-2 gap-2 text-sm">
                              <div className="rounded-lg border border-border bg-panel px-3 py-2">
                                <p className="text-xs text-muted">Score</p>
                                <p className="font-bold">{formatDelta(suggestion.score_delta)}</p>
                              </div>
                              <div className="rounded-lg border border-border bg-panel px-3 py-2">
                                <p className="text-xs text-muted">Cost</p>
                                <p className="font-bold">{formatMoney(suggestion.estimated_cost_delta)}</p>
                              </div>
                              <div className="rounded-lg border border-border bg-panel px-3 py-2">
                                <p className="text-xs text-muted">Reliability</p>
                                <p className="font-bold">{formatDelta(suggestion.reliability_impact)}</p>
                              </div>
                              <div className="rounded-lg border border-border bg-panel px-3 py-2">
                                <p className="text-xs text-muted">Upgrade</p>
                                <p className="font-bold">{formatDelta(suggestion.upgradeability_impact)}</p>
                              </div>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background sm:w-fit"
                    >
                      <GitBranch className="h-4 w-4" aria-hidden="true" />
                      Create optimized branch
                    </button>
                  </form>
                ) : (
                  <p className="mt-5 rounded-lg border border-border bg-background p-4 text-sm text-muted">
                    No positive branchable improvements were found for the selected goal and locked slots.
                  </p>
                )}
              </section>
            </>
          ) : (
            <EmptyState
              title="No optimization runs yet"
              description="Choose a goal, select a depth, lock any components that must stay fixed, then run the optimizer."
              icon={Sparkles}
            />
          )}

          <section className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">Explanation pipeline</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {pipelineSteps.map((step, index) => (
                <div key={step} className="rounded-lg border border-border bg-background p-4">
                  <p className="text-xs font-semibold uppercase text-muted">
                    Step {index + 1}
                  </p>
                  <p className="mt-2 font-semibold">{step}</p>
                </div>
              ))}
            </div>
          </section>

          {runs.length > 1 ? (
            <section className="rounded-lg border border-border bg-panel p-5">
              <h2 className="text-lg font-semibold">Previous runs</h2>
              <div className="mt-4 grid gap-2">
                {runs.map((run) => (
                  <Link
                    key={run.id}
                    href={`/solution-builder/projects/${projectRow.id}/optimize?run=${run.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <span>{run.goal.replaceAll("-", " ")} / {run.depth}</span>
                    <span className="text-muted">{run.optimized_score}</span>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}
