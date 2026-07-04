import { Boxes, Save } from "lucide-react";
import Link from "next/link";

import { SelectedComponentCard } from "@/components/solution-builder/selected-component-card";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getComponentById,
  getComponentInventorySummary,
  getComponentsForSlot
} from "@/lib/component-inventory";
import { saveBuildProjectSlotAction } from "@/lib/supabase/project-actions";
import type { EvaluatedBuildWorkspaceSlot } from "@/types/solution-builder";

type SlotInventoryPickerProps = {
  projectId: string;
  returnTo: string;
  slot: EvaluatedBuildWorkspaceSlot;
};

export function SlotInventoryPicker({
  projectId,
  returnTo,
  slot
}: SlotInventoryPickerProps) {
  const components = getComponentsForSlot(slot.definition.id);
  const selectedComponent = getComponentById(slot.selectedHardware?.componentId);
  const inventoryParams = new URLSearchParams({
    projectId,
    query: slot.definition.searchIntent.query,
    returnTo,
    slot: slot.definition.id
  });

  if (slot.definition.searchIntent.formFactor) {
    inventoryParams.set("formFactor", slot.definition.searchIntent.formFactor);
  }

  if (slot.definition.searchIntent.useCase) {
    inventoryParams.set("useCase", slot.definition.searchIntent.useCase);
  }

  if (slot.definition.searchIntent.condition) {
    inventoryParams.set("condition", slot.definition.searchIntent.condition);
  }

  const inventoryHref = `/inventory?${inventoryParams.toString()}`;

  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={slot.status === "compatible" ? "accent" : "warning"}>
              {slot.status}
            </StatusPill>
            <StatusPill>{slot.definition.requirement}</StatusPill>
          </div>
          <h3 className="mt-3 text-lg font-semibold">{slot.definition.label}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            {getComponentInventorySummary(slot.definition.id)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill>{components.length} candidates</StatusPill>
          <Link
            href={inventoryHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            <Boxes className="h-4 w-4" aria-hidden="true" />
            Choose in inventory
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4">
        {selectedComponent ? (
          <SelectedComponentCard
            component={selectedComponent}
            projectId={projectId}
            returnTo={returnTo}
            slotId={slot.definition.id}
          />
        ) : (
          <p className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted">
            No {slot.definition.label.toLowerCase()} selected yet.
          </p>
        )}

        <form action={saveBuildProjectSlotAction} className="grid gap-3 rounded-lg border border-border bg-background p-4">
          <input type="hidden" name="projectId" value={projectId} />
          <input type="hidden" name="slotId" value={slot.definition.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <label className="grid gap-2 text-sm font-medium">
            Choose a {slot.definition.label}
            <select
              name="componentId"
              disabled={components.length === 0}
              className="h-11 rounded-lg border border-border bg-panel px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {components.map((component) => (
                <option key={component.id} value={component.id}>
                  {component.title} - ${component.price}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Slot notes
            <input
              name="notes"
              defaultValue={slot.notes ?? ""}
              placeholder="Fit notes, test result, seller caveat"
              className="h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </label>
          <button
            type="submit"
            disabled={components.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            Save component
          </button>
        </form>

        {slot.issues.length > 0 ? (
          <ul className="grid gap-2 text-sm leading-6 text-muted">
            {slot.issues.map((issue) => (
              <li key={issue.id}>{issue.title}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </article>
  );
}
