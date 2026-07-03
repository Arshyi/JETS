import { Activity, FileClock } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import {
  formatAuditTimestamp,
  getDecisionAuditEventLabel,
  getDecisionAuditSubjectLabel
} from "@/lib/decision-audit/format";
import type { DecisionAuditEventRow } from "@/types/database";

type AuditTimelineProps = {
  compact?: boolean;
  events: DecisionAuditEventRow[];
};

function getStateSummary(row: DecisionAuditEventRow) {
  if (
    !row.before_state ||
    !row.after_state ||
    typeof row.before_state !== "object" ||
    typeof row.after_state !== "object" ||
    Array.isArray(row.before_state) ||
    Array.isArray(row.after_state)
  ) {
    return null;
  }

  const beforeKeys = Object.keys(row.before_state);
  const afterKeys = Object.keys(row.after_state);
  const sharedKey = afterKeys.find((key) => beforeKeys.includes(key));

  if (!sharedKey) {
    return null;
  }

  return `${sharedKey}: ${String(row.before_state[sharedKey])} -> ${String(row.after_state[sharedKey])}`;
}

export function AuditTimeline({ compact = false, events }: AuditTimelineProps) {
  if (events.length === 0) {
    return (
      <EmptyState
        title="No decision activity yet"
        description="Save builds, create snapshots, update notes, or mark outcomes to build an audit trail."
        icon={FileClock}
        action={
          <Link
            href="/beta/demo-data"
            className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            View demo workflow
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-3">
      {events.map((event) => {
        const stateSummary = getStateSummary(event);

        return (
          <article
            key={event.id}
            className="rounded-lg border border-border bg-panel p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill tone="accent">
                    {getDecisionAuditEventLabel(event.event_type)}
                  </StatusPill>
                  {!compact ? (
                    <StatusPill>
                      {getDecisionAuditSubjectLabel(event.subject_type)}
                    </StatusPill>
                  ) : null}
                  <StatusPill>v{event.app_version}</StatusPill>
                </div>
                <h2 className="mt-3 text-base font-semibold">{event.subject_title}</h2>
                <p className="mt-1 text-sm leading-6 text-muted">{event.summary}</p>
                {event.note ? (
                  <p className="mt-3 rounded-lg border border-border bg-background px-3 py-2 text-sm leading-6 text-muted">
                    {event.note}
                  </p>
                ) : null}
                {stateSummary ? (
                  <p className="mt-2 text-sm text-muted">{stateSummary}</p>
                ) : null}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Activity className="h-4 w-4" aria-hidden="true" />
                <time dateTime={event.created_at}>
                  {formatAuditTimestamp(event.created_at)}
                </time>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
