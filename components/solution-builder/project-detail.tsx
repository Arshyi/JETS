import { Archive, Compass, FileText, Link2, RotateCcw, Save, Sparkles } from "lucide-react";
import Link from "next/link";

import { ActionPlanPanel } from "@/components/action-plans/action-plan-panel";
import { PlaybookPanel } from "@/components/playbooks/playbook-panel";
import { BuildValidationSummary } from "@/components/solution-builder/build-validation-summary";
import { CompareAgainstJets } from "@/components/solution-builder/compare-against-jets";
import { PlatformKnowledgePanel } from "@/components/platform-knowledge/platform-knowledge-panel";
import { SolutionIntelligencePanel } from "@/components/solution-intelligence/solution-intelligence-panel";
import { ProjectBranchWorkspace } from "@/components/solution-builder/project-branch-workspace";
import { ProjectWorkflowProgress } from "@/components/solution-builder/project-workflow-progress";
import { ProjectAuditTimeline } from "@/components/solution-builder/project-audit-timeline";
import { SlotInventoryPicker } from "@/components/solution-builder/slot-inventory-picker";
import { StatusPill } from "@/components/ui/status-pill";
import {
  addBuildProjectNoteAction,
  archiveBuildProjectAction,
  renameBuildProjectAction,
  restoreBuildProjectAction
} from "@/lib/supabase/project-actions";
import { generateProjectActionPlan } from "@/lib/action-plan-engine/engine";
import { getPlatformKnowledgeById } from "@/lib/platform-knowledge";
import {
  getPlaybookProjectProgress,
  getPlaybooksForProject
} from "@/lib/playbook-engine/engine";
import { analyzeBuildSolution } from "@/lib/solution-intelligence/engine";
import type { BuildProjectDetailData } from "@/lib/solution-builder/projects";
import type { BuildProjectSlotRow, Json } from "@/types/database";
import type { BuildSlotRequirement } from "@/types/solution-builder";

type ProjectDetailProps = {
  data: BuildProjectDetailData;
};

const sectionLabels: Record<BuildSlotRequirement, string> = {
  optional: "Optional slots",
  required: "Required slots",
  solution: "Special solution slots"
};

function isRecord(value: unknown): value is Record<string, Json | undefined> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function getAcquisitionEvidence(slot: BuildProjectSlotRow) {
  if (!isRecord(slot.component_snapshot)) {
    return null;
  }

  const evidence = slot.component_snapshot.acquisitionEvidence;

  if (!isRecord(evidence)) {
    return null;
  }

  return {
    acquisitionId:
      typeof evidence.acquisitionId === "string" ? evidence.acquisitionId : null,
    confidence:
      typeof evidence.confidence === "number" ? evidence.confidence : null,
    evidenceId: typeof evidence.evidenceId === "string" ? evidence.evidenceId : null,
    fieldId: typeof evidence.fieldId === "string" ? evidence.fieldId : null,
    sourceText: typeof evidence.sourceText === "string" ? evidence.sourceText : null
  };
}

function getStrategyScore(snapshot: Json) {
  if (!isRecord(snapshot)) {
    return null;
  }

  return typeof snapshot.overallScore === "number" ? snapshot.overallScore : null;
}

export function ProjectDetail({ data }: ProjectDetailProps) {
  const { model, projectRow } = data;
  const returnTo = `/solution-builder/projects/${projectRow.id}`;
  const platformProfile = getPlatformKnowledgeById(
    model.platformInsight?.platformId
  );
  const playbooks = getPlaybooksForProject(model);
  const playbookProgress = getPlaybookProjectProgress(playbooks, model);
  const actionPlan = generateProjectActionPlan({
    model,
    playbooks,
    strategyId: projectRow.strategy_id,
    strategyTitle: projectRow.strategy_title
  });
  const solutionIntelligence = analyzeBuildSolution(model);
  const warningCount = model.evaluation.warningCount + model.evaluation.blockingCount;
  const branchCount = data.branches.filter((branch) => branch.id !== projectRow.id).length;
  const slotGroups = (["required", "optional", "solution"] as const).map(
    (requirement) => ({
      requirement,
      slots: model.evaluation.slots.filter(
        (slot) => slot.definition.requirement === requirement
      )
    })
  );
  const acquisitionDerivedSlots = data.slotRows
    .map((slot) => ({ evidence: getAcquisitionEvidence(slot), slot }))
    .filter((item) => item.evidence);

  return (
    <main className="bg-background pb-16">
      <section className="border-b border-border bg-panel">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
                Builder
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold">{model.project.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
                Fill hardware slots, validate the build, optimize unlocked parts,
                and branch ideas without losing the original.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={projectRow.status === "active" ? "accent" : "neutral"}>
                {projectRow.status}
              </StatusPill>
              <StatusPill>{model.project.purpose}</StatusPill>
              <StatusPill>{model.project.currency} {model.project.budget}</StatusPill>
              <StatusPill>{projectRow.branch_name}</StatusPill>
              {projectRow.strategy_title ? (
                <StatusPill tone="accent">{projectRow.strategy_title}</StatusPill>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <form action={renameBuildProjectAction} className="grid gap-2 rounded-lg border border-border bg-background p-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <input type="hidden" name="projectId" value={projectRow.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <label className="sr-only" htmlFor="project-title">Project title</label>
              <input
                id="project-title"
                name="title"
                defaultValue={projectRow.title}
                className="h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Rename
              </button>
            </form>
            <form action={projectRow.status === "archived" ? restoreBuildProjectAction : archiveBuildProjectAction}>
              <input type="hidden" name="projectId" value={projectRow.id} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <button
                type="submit"
                className="inline-flex h-full items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                {projectRow.status === "archived" ? (
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Archive className="h-4 w-4" aria-hidden="true" />
                )}
                {projectRow.status === "archived" ? "Restore" : "Archive"}
              </button>
            </form>
          </div>

          <div className="mt-6">
            <ProjectWorkflowProgress
              branchCount={branchCount}
              completionPercent={model.evaluation.completionPercent}
              currentStage="components"
              hasOptimizationRuns={data.optimizationRuns.length > 0}
              projectId={projectRow.id}
              warningCount={warningCount}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[340px_1fr] lg:px-8">
        <aside className="grid gap-6 lg:sticky lg:top-24 lg:self-start">
          <BuildValidationSummary evaluation={model.evaluation} />
          <ProjectBranchWorkspace
            branches={data.branches}
            currentProject={projectRow}
          />
          {projectRow.strategy_title ? (
            <div className="rounded-lg border border-border bg-panel p-5">
              <div className="flex items-center gap-3">
                <Compass className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
                <h2 className="text-lg font-semibold">Strategy source</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                {projectRow.strategy_title} created this project before slot
                selection. Strategy answers whether this path is worth pursuing;
                Builder now validates the exact hardware.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <StatusPill>{projectRow.strategy_id ?? "strategy"}</StatusPill>
                {getStrategyScore(projectRow.strategy_snapshot) ? (
                  <StatusPill>
                    Score {getStrategyScore(projectRow.strategy_snapshot)}
                  </StatusPill>
                ) : null}
              </div>
            </div>
          ) : (
            <Link
              href="/strategy"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              Compare strategies
            </Link>
          )}
          <form action={addBuildProjectNoteAction} className="rounded-lg border border-border bg-panel p-5">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Project note</h2>
            </div>
            <input type="hidden" name="projectId" value={projectRow.id} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <textarea
              name="note"
              rows={4}
              placeholder="Decision notes, seller questions, test result, or repair caveat"
              className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
            <button
              type="submit"
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Add note
            </button>
          </form>
          {data.notes.length > 0 ? (
            <div className="rounded-lg border border-border bg-panel p-5">
              <h2 className="text-lg font-semibold">Recent notes</h2>
              <div className="mt-4 grid gap-3">
                {data.notes.slice(0, 3).map((note) => (
                  <p key={note.id} className="rounded-lg border border-border bg-background p-3 text-sm leading-6 text-muted">
                    {note.note}
                  </p>
                ))}
              </div>
            </div>
          ) : null}
          {data.linkedAcquisitions.length > 0 ? (
            <div className="rounded-lg border border-border bg-panel p-5">
              <div className="flex items-center gap-3">
                <Link2 className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
                <h2 className="text-lg font-semibold">Linked acquisitions</h2>
              </div>
              <div className="mt-4 grid gap-3">
                {data.linkedAcquisitions.slice(0, 4).map(({ acquisition, link }) => (
                  <Link
                    key={link.id}
                    href={`/acquire/history/${link.acquisition_id}`}
                    className="rounded-lg border border-border bg-background p-3 text-sm transition hover:border-accent"
                  >
                    <span className="block font-semibold">
                      {acquisition?.title ?? "Acquisition record"}
                    </span>
                    <span className="mt-1 block text-xs text-muted">
                      {link.handoff_classification} · {link.handoff_status} ·{" "}
                      {link.accepted_slot_ids.length} accepted slots
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
          <Link
            href={`/solution-builder/projects/${projectRow.id}/optimize`}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Optimize My Build
          </Link>
          <Link
            href="/solution-builder/projects"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            Back to dashboard
          </Link>
        </aside>

        <div className="grid gap-8">
          {(data.linkedAcquisitions.length > 0 || acquisitionDerivedSlots.length > 0) ? (
            <section className="rounded-lg border border-border bg-panel p-5">
              <h2 className="text-xl font-bold">Source listing evidence</h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                Acquisition handoff keeps the source listing attached to the project
                and records which slots came from reviewed listing evidence.
              </p>
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {data.linkedAcquisitions.map(({ acquisition, link }) => (
                  <div
                    key={link.id}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">
                        {acquisition?.title ?? "Acquisition record"}
                      </h3>
                      <StatusPill>{link.handoff_status}</StatusPill>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {link.handoff_classification} · accepted{" "}
                      {link.accepted_slot_ids.join(", ") || "no slots"} · rejected{" "}
                      {link.rejected_slot_ids.join(", ") || "none"}
                    </p>
                    <Link
                      href={`/acquire/history/${link.acquisition_id}`}
                      className="mt-3 inline-flex text-sm font-semibold text-accent-strong dark:text-accent"
                    >
                      Open acquisition detail
                    </Link>
                  </div>
                ))}
                {acquisitionDerivedSlots.map(({ evidence, slot }) => (
                  <div
                    key={`${slot.id}-${evidence?.evidenceId}`}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold">{slot.slot_id}</h3>
                      <StatusPill>
                        {evidence?.confidence ?? "unknown"}% confidence
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {slot.notes || "Acquisition-derived slot."}
                    </p>
                    <p className="mt-2 text-xs text-muted">
                      Evidence: {evidence?.fieldId ?? "listing"} ·{" "}
                      {evidence?.sourceText?.slice(0, 120) ?? "No source text"}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {slotGroups.map((group) => (
            <section key={group.requirement}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">{sectionLabels[group.requirement]}</h2>
                <StatusPill>{group.slots.length} slots</StatusPill>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {group.slots.map((slot) => (
                  <SlotInventoryPicker
                    key={slot.definition.id}
                    projectId={projectRow.id}
                    returnTo={returnTo}
                    slot={slot}
                  />
                ))}
              </div>
            </section>
          ))}

          <PlatformKnowledgePanel profile={platformProfile} />

          <PlaybookPanel
            description="JETS compares this project against platform-specific builder playbooks, then separates completed recommendations from remaining upgrade guidance."
            playbooks={playbooks}
            progress={playbookProgress}
            title="Project Playbook"
          />

          <ActionPlanPanel plan={actionPlan} />

          <SolutionIntelligencePanel
            branchCount={branchCount}
            report={solutionIntelligence}
          />

          <CompareAgainstJets preview={model.comparePreview} />

          <section className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-xl font-bold">Finished Solution</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {model.evaluation.completionPercent >= 100 && warningCount === 0
                ? "This project has all required slots filled and no blocking validation warnings. Review optimization branches, compare scenarios, then mark the solution ready outside JETS."
                : "A finished solution needs required components, a clean validation pass, and at least one optimization review. Continue with the next action shown in the dashboard or progress bar."}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold">Project audit history</h2>
            <ProjectAuditTimeline events={data.auditEvents} />
          </section>
        </div>
      </section>
    </main>
  );
}
