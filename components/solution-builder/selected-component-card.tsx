import { Cpu, X } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import { getComponentCategoryLabel } from "@/lib/component-inventory";
import { clearBuildProjectSlotAction } from "@/lib/supabase/project-actions";
import type { ComponentInventoryItem } from "@/types/component-inventory";

type SelectedComponentCardProps = {
  component: ComponentInventoryItem;
  projectId: string;
  returnTo: string;
  slotId: string;
};

export function SelectedComponentCard({
  component,
  projectId,
  returnTo,
  slotId
}: SelectedComponentCardProps) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="accent">{getComponentCategoryLabel(component.category)}</StatusPill>
            <StatusPill>{component.condition}</StatusPill>
          </div>
          <h4 className="mt-3 text-base font-semibold">{component.title}</h4>
        </div>
        <Cpu className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
      </div>
      <p className="mt-2 text-sm leading-6 text-muted">{component.summary}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-lg border border-border bg-panel px-2 py-1">
          ${component.price}
        </span>
        <span className="rounded-lg border border-border bg-panel px-2 py-1">
          {component.location}
        </span>
      </div>
      <form action={clearBuildProjectSlotAction} className="mt-4">
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="slotId" value={slotId} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        >
          <X className="h-4 w-4" aria-hidden="true" />
          Clear slot
        </button>
      </form>
    </div>
  );
}
