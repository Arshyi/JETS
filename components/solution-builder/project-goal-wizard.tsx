import {
  BrainCircuit,
  BriefcaseBusiness,
  Gamepad2,
  Home,
  Server,
  SlidersHorizontal,
  Wrench
} from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import {
  projectGoalTemplates,
  type ProjectGoalId
} from "@/data/project-goals";
import { createGoalBuildProjectAction } from "@/lib/supabase/project-actions";

type ProjectGoalWizardProps = {
  selectedGoalId?: string | null;
};

const goalIcons: Record<ProjectGoalId, typeof Gamepad2> = {
  "ai-workstation": BrainCircuit,
  "cad-engineering-workstation": Wrench,
  "custom-project": SlidersHorizontal,
  "gaming-pc": Gamepad2,
  "home-server": Server,
  "office-pc": BriefcaseBusiness,
  "upgrade-existing-computer": Home
};

export function ProjectGoalWizard({ selectedGoalId }: ProjectGoalWizardProps) {
  const sortedTemplates = [...projectGoalTemplates].sort((left, right) => {
    if (left.id === selectedGoalId) {
      return -1;
    }

    if (right.id === selectedGoalId) {
      return 1;
    }

    return 0;
  });

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
          Create project
        </p>
        <h2 className="mt-3 text-3xl font-bold">What are you trying to build?</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          Pick the closest goal. JETS will create a project, choose a scoring
          preset, initialize the slot workspace, and explain what the optimizer
          will care about first.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sortedTemplates.map((template) => {
          const Icon = goalIcons[template.id];
          const isSelected = template.id === selectedGoalId;

          return (
            <form
              key={template.id}
              action={createGoalBuildProjectAction}
              className={
                isSelected
                  ? "rounded-lg border border-accent bg-accent/10 p-5"
                  : "rounded-lg border border-border bg-panel p-5"
              }
            >
              <input type="hidden" name="goalId" value={template.id} />
              <input type="hidden" name="title" value={template.defaultTitle} />
              <input type="hidden" name="budget" value={template.defaultBudget} />
              <input type="hidden" name="country" value="United States" />
              <input type="hidden" name="currency" value="USD" />

              <div className="flex items-start justify-between gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-background text-accent-strong dark:text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <StatusPill tone={isSelected ? "accent" : "neutral"}>
                  {template.scoringPreset}
                </StatusPill>
              </div>

              <h3 className="mt-5 text-xl font-semibold">{template.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                {template.description}
              </p>

              <div className="mt-4 rounded-lg border border-border bg-background p-3">
                <p className="text-xs font-semibold uppercase text-muted">
                  JETS will optimize for
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {template.optimizeFor}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill>${template.defaultBudget}</StatusPill>
                <StatusPill>{template.purpose}</StatusPill>
                <StatusPill>start with {template.firstSlotId}</StatusPill>
              </div>

              <button
                type="submit"
                className="mt-5 inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Create project
              </button>
            </form>
          );
        })}
      </div>
    </section>
  );
}
