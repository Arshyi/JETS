import { MapPin, Plus, ShieldAlert } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import { getComponentCategoryLabel } from "@/lib/component-inventory";
import { saveBuildProjectSlotAction } from "@/lib/supabase/project-actions";
import { conditionLabels, useCaseLabels } from "@/types/hardware";
import type { ComponentInventoryItem } from "@/types/component-inventory";
import type { BuildSlotId } from "@/types/solution-builder";

type ComponentInventoryCardProps = {
  component: ComponentInventoryItem;
  projectContext?: {
    projectId: string;
    returnTo: string;
    slotId: BuildSlotId;
  } | null;
};

export function ComponentInventoryCard({
  component,
  projectContext
}: ComponentInventoryCardProps) {
  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="accent">
              {getComponentCategoryLabel(component.category)}
            </StatusPill>
            <StatusPill tone={component.condition === "broken" ? "warning" : "neutral"}>
              {conditionLabels[component.condition]}
            </StatusPill>
            {component.recommendedUseCases.slice(0, 2).map((useCase) => (
              <StatusPill key={useCase}>{useCaseLabels[useCase]}</StatusPill>
            ))}
          </div>
          <h3 className="mt-4 text-xl font-semibold">{component.title}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {component.summary}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase text-muted">Demo price</p>
          <p className="mt-1 text-2xl font-bold">${component.price}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {component.location}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
            {component.tags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="rounded-lg border border-border bg-panel px-2 py-1"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-warning" aria-hidden="true" />
            <h4 className="text-sm font-semibold">Risk notes</h4>
          </div>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
            {component.riskNotes.slice(0, 2).map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>

      {projectContext ? (
        <form action={saveBuildProjectSlotAction} className="mt-5">
          <input type="hidden" name="projectId" value={projectContext.projectId} />
          <input type="hidden" name="slotId" value={projectContext.slotId} />
          <input type="hidden" name="componentId" value={component.id} />
          <input type="hidden" name="returnTo" value={projectContext.returnTo} />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add to project slot
          </button>
        </form>
      ) : null}
    </article>
  );
}
