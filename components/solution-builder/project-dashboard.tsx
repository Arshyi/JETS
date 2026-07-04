import { Archive, FolderKanban, RotateCcw, Trash2 } from "lucide-react";
import Link from "next/link";

import { CreateProjectForm } from "@/components/solution-builder/create-project-form";
import { EmptyState } from "@/components/states/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import {
  archiveBuildProjectAction,
  deleteBuildProjectAction,
  restoreBuildProjectAction
} from "@/lib/supabase/project-actions";
import type { BuildProjectRow } from "@/types/database";

type ProjectDashboardProps = {
  projects: BuildProjectRow[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function ProjectDashboard({ projects }: ProjectDashboardProps) {
  return (
    <main className="bg-background pb-16">
      <section className="border-b border-border bg-panel">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
            Build My Own
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold">Project Dashboard</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            Create and restore persisted hardware projects before filling slots with component-aware inventory.
          </p>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[340px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <CreateProjectForm />
        </aside>

        <div>
          {projects.length === 0 ? (
            <EmptyState
              title="No build projects yet"
              description="Create your first hardware project to start filling slots, validating compatibility, and preparing optimization runs."
              icon={FolderKanban}
            />
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <article key={project.id} className="rounded-lg border border-border bg-panel p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <StatusPill tone={project.status === "active" ? "accent" : "neutral"}>
                          {project.status}
                        </StatusPill>
                        <StatusPill>{project.purpose}</StatusPill>
                        <StatusPill>{project.currency} {project.budget}</StatusPill>
                        <StatusPill>{project.branch_name}</StatusPill>
                        {project.parent_project_id ? (
                          <StatusPill>branch</StatusPill>
                        ) : (
                          <StatusPill>root</StatusPill>
                        )}
                      </div>
                      <h2 className="mt-3 text-2xl font-bold">{project.title}</h2>
                      <p className="mt-2 text-sm text-muted">
                        Updated {formatDate(project.updated_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/solution-builder/projects/${project.id}`}
                        className="inline-flex items-center justify-center rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                      >
                        Open
                      </Link>
                      <form action={project.status === "archived" ? restoreBuildProjectAction : archiveBuildProjectAction}>
                        <input type="hidden" name="projectId" value={project.id} />
                        <input type="hidden" name="returnTo" value="/solution-builder/projects" />
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                        >
                          {project.status === "archived" ? (
                            <RotateCcw className="h-4 w-4" aria-hidden="true" />
                          ) : (
                            <Archive className="h-4 w-4" aria-hidden="true" />
                          )}
                          {project.status === "archived" ? "Restore" : "Archive"}
                        </button>
                      </form>
                      <form action={deleteBuildProjectAction}>
                        <input type="hidden" name="projectId" value={project.id} />
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
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
