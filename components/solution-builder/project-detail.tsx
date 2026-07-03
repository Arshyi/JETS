import { Archive, FileText, RotateCcw, Save, Sparkles } from "lucide-react";
import Link from "next/link";

import { BuildValidationSummary } from "@/components/solution-builder/build-validation-summary";
import { CompareAgainstJets } from "@/components/solution-builder/compare-against-jets";
import { ProjectBranchWorkspace } from "@/components/solution-builder/project-branch-workspace";
import { ProjectAuditTimeline } from "@/components/solution-builder/project-audit-timeline";
import { SlotInventoryPicker } from "@/components/solution-builder/slot-inventory-picker";
import { StatusPill } from "@/components/ui/status-pill";
import {
  addBuildProjectNoteAction,
  archiveBuildProjectAction,
  renameBuildProjectAction,
  restoreBuildProjectAction
} from "@/lib/supabase/project-actions";
import type { BuildProjectDetailData } from "@/lib/solution-builder/projects";
import type { BuildSlotRequirement } from "@/types/solution-builder";

type ProjectDetailProps = {
  data: BuildProjectDetailData;
};

const sectionLabels: Record<BuildSlotRequirement, string> = {
  optional: "Optional slots",
  required: "Required slots",
  solution: "Special solution slots"
};

export function ProjectDetail({ data }: ProjectDetailProps) {
  const { model, projectRow } = data;
  const returnTo = `/solution-builder/projects/${projectRow.id}`;
  const slotGroups = (["required", "optional", "solution"] as const).map(
    (requirement) => ({
      requirement,
      slots: model.evaluation.slots.filter(
        (slot) => slot.definition.requirement === requirement
      )
    })
  );

  return (
    <main className="bg-background pb-16">
      <section className="border-b border-border bg-panel">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
                Build project
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-bold">{model.project.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
                Persisted slot workspace backed by typed component inventory and deterministic validation.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={projectRow.status === "active" ? "accent" : "neutral"}>
                {projectRow.status}
              </StatusPill>
              <StatusPill>{model.project.purpose}</StatusPill>
              <StatusPill>{model.project.currency} {model.project.budget}</StatusPill>
              <StatusPill>{projectRow.branch_name}</StatusPill>
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
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[340px_1fr] lg:px-8">
        <aside className="grid gap-6 lg:sticky lg:top-24 lg:self-start">
          <BuildValidationSummary evaluation={model.evaluation} />
          <ProjectBranchWorkspace
            branches={data.branches}
            currentProject={projectRow}
          />
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
            Back to projects
          </Link>
        </aside>

        <div className="grid gap-8">
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

          <CompareAgainstJets preview={model.comparePreview} />

          <section>
            <h2 className="mb-4 text-xl font-bold">Project audit history</h2>
            <ProjectAuditTimeline events={data.auditEvents} />
          </section>
        </div>
      </section>
    </main>
  );
}
