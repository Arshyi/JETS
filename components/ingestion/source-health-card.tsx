import { Activity, Clock, Database, ShieldCheck } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import { getFreshnessLabel } from "@/lib/ingestion/freshness";
import type { SourceHealthSnapshot } from "@/types/ingestion";

type SourceHealthCardProps = {
  health: SourceHealthSnapshot;
};

function getSourceTone(status: SourceHealthSnapshot["source"]["status"]) {
  if (status === "healthy") {
    return "accent";
  }

  if (status === "degraded" || status === "setup-required") {
    return "warning";
  }

  return "neutral";
}

export function SourceHealthCard({ health }: SourceHealthCardProps) {
  const lastObserved = health.lastObservedAt
    ? new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
        timeStyle: "short"
      }).format(new Date(health.lastObservedAt))
    : "No listings observed";

  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={getSourceTone(health.source.status)}>
              {health.source.status}
            </StatusPill>
            <StatusPill>{health.source.adapterMode}</StatusPill>
            <StatusPill>{health.source.kind}</StatusPill>
          </div>
          <h2 className="mt-4 text-xl font-semibold">{health.source.name}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{health.message}</p>
        </div>

        <div className="rounded-lg border border-border bg-background p-4 text-sm">
          <div className="flex items-center gap-2 text-muted">
            <Clock className="h-4 w-4" aria-hidden="true" />
            Last observed
          </div>
          <p className="mt-2 font-semibold">{lastObserved}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Listings", health.listingCount],
          [getFreshnessLabel("fresh"), health.freshCount],
          [getFreshnessLabel("aging"), health.agingCount],
          [getFreshnessLabel("stale"), health.staleCount]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase text-muted">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold">Rate limit posture</h3>
          </div>
          <p className="mt-3 text-sm leading-6 text-muted">
            {health.rateLimitSummary}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold">Compliance notes</h3>
          </div>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
            {health.complianceNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      </div>

      {health.warningCount > 0 ? (
        <div className="mt-5 flex items-center gap-2 text-sm text-warning">
          <Database className="h-4 w-4" aria-hidden="true" />
          {health.warningCount} dry-run warning
          {health.warningCount === 1 ? "" : "s"} to review.
        </div>
      ) : null}
    </article>
  );
}
