import { Play, ServerCog } from "lucide-react";

import { runIngestionDryRunAction } from "@/lib/supabase/ingestion-actions";
import { StatusPill } from "@/components/ui/status-pill";
import type { IngestionDryRunReport } from "@/types/ingestion";

type DryRunSummaryProps = {
  report: IngestionDryRunReport;
  showRunControls?: boolean;
};

export function DryRunSummary({
  report,
  showRunControls = false
}: DryRunSummaryProps) {
  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone="accent">{report.mode}</StatusPill>
            <StatusPill>{report.totals.sourcesChecked} sources</StatusPill>
          </div>
          <h2 className="mt-4 text-xl font-semibold">Ingestion dry-run preview</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Local mock adapters normalize source rows, flag stale listings, and
            identify likely duplicates without making live marketplace requests.
          </p>
        </div>

        {showRunControls ? (
          <form action={runIngestionDryRunAction} className="rounded-lg border border-border bg-background p-4">
            <label
              htmlFor="sourceId"
              className="text-xs font-semibold uppercase text-muted"
            >
              Dry-run source
            </label>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <select
                id="sourceId"
                name="sourceId"
                className="min-h-10 rounded-lg border border-border bg-panel px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                defaultValue="all"
              >
                <option value="all">All sources</option>
                {report.adapterResults.map((result) => (
                  <option key={result.source.id} value={result.source.id}>
                    {result.source.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                <Play className="h-4 w-4" aria-hidden="true" />
                Run dry run
              </button>
            </div>
          </form>
        ) : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ["Listings", report.totals.totalListings],
          ["Duplicates", report.totals.duplicatesDetected],
          ["Stale", report.totals.staleListings],
          ["Warnings", report.totals.warnings],
          [
            "Generated",
            new Intl.DateTimeFormat("en-US", {
              dateStyle: "medium",
              timeStyle: "short"
            }).format(new Date(report.generatedAt))
          ]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase text-muted">{label}</p>
            <p className="mt-2 text-lg font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3">
        {report.adapterResults.map((result) => (
          <div
            key={result.source.id}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <ServerCog className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
                <h3 className="text-sm font-semibold">{result.source.name}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill>{result.listingsSeen} seen</StatusPill>
                <StatusPill>{result.listingsNormalized} normalized</StatusPill>
                {result.warnings.length > 0 ? (
                  <StatusPill tone="warning">
                    {result.warnings.length} warning
                    {result.warnings.length === 1 ? "" : "s"}
                  </StatusPill>
                ) : (
                  <StatusPill tone="accent">clean</StatusPill>
                )}
              </div>
            </div>
            {result.warnings.length > 0 ? (
              <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ))}
      </div>
    </article>
  );
}
