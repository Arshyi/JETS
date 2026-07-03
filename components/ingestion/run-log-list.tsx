import { History } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import type { IngestionRunRow } from "@/types/database";

type RunLogListProps = {
  message?: string;
  runs: IngestionRunRow[];
};

function getStatusTone(status: string) {
  if (status === "completed") {
    return "accent";
  }

  if (status === "warning" || status === "failed") {
    return "warning";
  }

  return "neutral";
}

export function RunLogList({ message, runs }: RunLogListProps) {
  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-2">
        <History className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Persisted run logs</h2>
      </div>
      {message ? <p className="mt-3 text-sm leading-6 text-warning">{message}</p> : null}

      {runs.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="No persisted ingestion runs"
            description="Run a dry run after applying the v0.4 migration and configuring the service role key to write logs here."
            icon={History}
            action={
              <Link
                href="/beta/setup"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Open setup checklist
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          {runs.map((run) => (
            <div
              key={run.id}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {run.source_id ?? "All sources"} dry run
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short"
                    }).format(new Date(run.started_at))}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone={getStatusTone(run.status)}>{run.status}</StatusPill>
                  <StatusPill>{run.listings_seen} seen</StatusPill>
                  <StatusPill>{run.listings_normalized} normalized</StatusPill>
                  <StatusPill>{run.duplicates_detected} duplicate groups</StatusPill>
                  <StatusPill>{run.stale_listings} stale</StatusPill>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
