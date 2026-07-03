import { GitBranch, GitFork, Plus } from "lucide-react";
import Link from "next/link";

import { StatusPill } from "@/components/ui/status-pill";
import { createBuildProjectBranchAction } from "@/lib/supabase/branch-actions";
import type { BuildProjectRow } from "@/types/database";

type ProjectBranchWorkspaceProps = {
  branches: BuildProjectRow[];
  currentProject: BuildProjectRow;
};

function formatBranchSource(value: string) {
  return value.replaceAll("-", " ");
}

export function ProjectBranchWorkspace({
  branches,
  currentProject
}: ProjectBranchWorkspaceProps) {
  const returnTo = `/solution-builder/projects/${currentProject.id}`;
  const parent = currentProject.parent_project_id
    ? branches.find((branch) => branch.id === currentProject.parent_project_id)
    : null;
  const children = branches.filter(
    (branch) => branch.parent_project_id === currentProject.id
  );

  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-3">
        <GitBranch className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Branch workspace</h2>
      </div>

      <div className="mt-4 grid gap-3 rounded-lg border border-border bg-background p-4">
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="accent">{currentProject.branch_name}</StatusPill>
          <StatusPill>depth {currentProject.branch_depth}</StatusPill>
          <StatusPill>{formatBranchSource(currentProject.branch_source)}</StatusPill>
        </div>
        {parent ? (
          <p className="text-sm text-muted">
            Parent branch:{" "}
            <Link
              href={`/solution-builder/projects/${parent.id}`}
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              {parent.branch_name}
            </Link>
          </p>
        ) : (
          <p className="text-sm text-muted">
            This is the root branch for the project family.
          </p>
        )}
      </div>

      <form action={createBuildProjectBranchAction} className="mt-4 grid gap-3">
        <input type="hidden" name="projectId" value={currentProject.id} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <label className="grid gap-2 text-sm font-medium">
          New branch name
          <input
            name="branchName"
            defaultValue="experiment"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Branch note
          <textarea
            name="branchNotes"
            rows={3}
            placeholder="What should this branch explore?"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </label>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create branch
        </button>
      </form>

      {children.length > 0 ? (
        <div className="mt-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <GitFork className="h-4 w-4 text-muted" aria-hidden="true" />
            Child branches
          </div>
          <div className="mt-3 grid gap-2">
            {children.map((branch) => (
              <Link
                key={branch.id}
                href={`/solution-builder/projects/${branch.id}`}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                <span className="block font-semibold">{branch.branch_name}</span>
                <span className="mt-1 block text-xs text-muted">{branch.title}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
