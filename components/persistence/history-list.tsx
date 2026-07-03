import { Clock, Trash2 } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { clearHistoryAction } from "@/lib/supabase/persistence-actions";
import type { BuildHistoryRow } from "@/types/database";

type HistoryListProps = {
  rows: BuildHistoryRow[];
};

export function HistoryList({ rows }: HistoryListProps) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="No build history yet"
        description="Save or favorite mock listings from search to create a persisted research trail."
        icon={Clock}
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
    <div>
      <div className="mb-5 flex justify-end">
        <form action={clearHistoryAction}>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-panel px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear history
          </button>
        </form>
      </div>

      <div className="grid gap-4">
        {rows.map((row) => (
          <article key={row.id} className="rounded-lg border border-border bg-panel p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <StatusPill>{row.action.replaceAll("_", " ")}</StatusPill>
                <h2 className="mt-3 text-lg font-semibold">{row.title}</h2>
                <p className="mt-2 text-sm text-muted">Listing ID: {row.listing_id}</p>
              </div>
              <time className="text-sm text-muted" dateTime={row.created_at}>
                {new Date(row.created_at).toLocaleString()}
              </time>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
