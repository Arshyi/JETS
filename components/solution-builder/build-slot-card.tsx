import { CheckCircle2, Search, TriangleAlert, XCircle } from "lucide-react";
import Link from "next/link";

import { StatusPill } from "@/components/ui/status-pill";
import type {
  BuildSlotStatus,
  EvaluatedBuildWorkspaceSlot
} from "@/types/solution-builder";

type BuildSlotCardProps = {
  slot: EvaluatedBuildWorkspaceSlot;
};

const statusMeta: Record<
  BuildSlotStatus,
  {
    icon: typeof CheckCircle2;
    label: string;
    tone: "accent" | "neutral" | "warning";
  }
> = {
  compatible: {
    icon: CheckCircle2,
    label: "Compatible",
    tone: "accent"
  },
  missing: {
    icon: XCircle,
    label: "Missing",
    tone: "warning"
  },
  warning: {
    icon: TriangleAlert,
    label: "Warning",
    tone: "warning"
  }
};

export function BuildSlotCard({ slot }: BuildSlotCardProps) {
  const meta = statusMeta[slot.status];
  const StatusIcon = meta.icon;

  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={meta.tone}>
              <span className="inline-flex items-center gap-1">
                <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {meta.label}
              </span>
            </StatusPill>
            <StatusPill>{slot.definition.requirement}</StatusPill>
          </div>
          <h3 className="mt-3 text-lg font-semibold">{slot.definition.label}</h3>
        </div>
        <Link
          href={slot.searchHref}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          aria-label={`Search inventory for ${slot.definition.label}`}
          title={`Search inventory for ${slot.definition.label}`}
        >
          <Search className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <p className="mt-3 text-sm leading-6 text-muted">
        {slot.selectedHardware?.label ?? slot.definition.description}
      </p>

      {slot.notes ? (
        <p className="mt-3 rounded-lg border border-border bg-background px-3 py-2 text-sm leading-6 text-muted">
          {slot.notes}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
        <span className="rounded-lg border border-border bg-background px-2 py-1">
          {slot.inventoryMatches} inventory matches
        </span>
        <span className="rounded-lg border border-border bg-background px-2 py-1">
          {slot.issues.length} validation notes
        </span>
      </div>

      {slot.issues.length > 0 ? (
        <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted">
          {slot.issues.slice(0, 2).map((issue) => (
            <li key={issue.id}>{issue.title}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
