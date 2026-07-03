import { FileClock } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { formatAuditTimestamp } from "@/lib/decision-audit/format";
import type { BuildProjectAuditEventRow } from "@/types/database";

type ProjectAuditTimelineProps = {
  events: BuildProjectAuditEventRow[];
};

export function ProjectAuditTimeline({ events }: ProjectAuditTimelineProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No project activity yet"
        description="Create notes, save slot selections, clear slots, or rename the project to build its audit trail."
        icon={FileClock}
      />
    );
  }

  return (
    <div className="grid gap-3">
      {events.map((event) => (
        <article key={event.id} className="rounded-lg border border-border bg-panel p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <StatusPill tone="accent">{event.event_type.replaceAll("_", " ")}</StatusPill>
              <p className="mt-3 text-sm leading-6 text-muted">{event.summary}</p>
            </div>
            <time className="text-sm text-muted" dateTime={event.created_at}>
              {formatAuditTimestamp(event.created_at)}
            </time>
          </div>
        </article>
      ))}
    </div>
  );
}
