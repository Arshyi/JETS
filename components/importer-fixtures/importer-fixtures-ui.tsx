import { AlertTriangle, Database, FileCheck2, PlayCircle } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { importerFixtureSets } from "@/data/importer-fixtures";
import { runImporterFixtureAction } from "@/lib/supabase/importer-fixture-actions";
import { formatEvidenceLabel } from "@/lib/evidence-engine";
import type {
  ImporterFixtureImportResult,
  ImporterFixtureRunItemView,
  ImporterFixtureRunView,
  ImporterFixtureState
} from "@/types/importer-fixtures";

function toneForStatus(status: string): "accent" | "neutral" | "warning" {
  if (["created", "updated", "completed"].includes(status)) return "accent";
  if (["error", "failed", "completed-with-errors"].includes(status)) {
    return "warning";
  }

  return "neutral";
}

function SummaryCard({
  label,
  value
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <p className="text-xs font-semibold uppercase text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function FixtureRunForm({
  canRun,
  fixtureSetId,
  mode
}: {
  canRun: boolean;
  fixtureSetId: string;
  mode: "dry-run" | "import";
}) {
  return (
    <form action={runImporterFixtureAction}>
      <input type="hidden" name="returnTo" value="/admin/importer-fixtures" />
      <input type="hidden" name="fixtureSetId" value={fixtureSetId} />
      <input type="hidden" name="mode" value={mode} />
      <button
        type="submit"
        disabled={!canRun}
        className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-subtle disabled:cursor-not-allowed disabled:opacity-50"
      >
        {mode === "dry-run" ? "Run dry-run" : "Run import"}
      </button>
    </form>
  );
}

function FixturePreviewCard({
  canRun,
  preview
}: {
  canRun: boolean;
  preview: ImporterFixtureImportResult;
}) {
  const fixtureSet = importerFixtureSets.find(
    (candidate) => candidate.id === preview.fixtureSetId
  );

  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill>{preview.mode}</StatusPill>
            <StatusPill>{preview.items.length} fixtures</StatusPill>
            <StatusPill tone={preview.summary.errors > 0 ? "warning" : "accent"}>
              {preview.summary.errors} errors
            </StatusPill>
          </div>
          <h2 className="mt-3 text-xl font-semibold">
            {fixtureSet?.title ?? preview.fixtureSetId}
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {fixtureSet?.description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FixtureRunForm
            canRun={canRun}
            fixtureSetId={preview.fixtureSetId}
            mode="dry-run"
          />
          <FixtureRunForm
            canRun={canRun && preview.summary.errors === 0}
            fixtureSetId={preview.fixtureSetId}
            mode="import"
          />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <SummaryCard label="Create" value={preview.summary.created} />
        <SummaryCard label="Update" value={preview.summary.updated} />
        <SummaryCard label="Skip" value={preview.summary.skipped} />
        <SummaryCard label="Error" value={preview.summary.errors} />
      </div>

      <div className="mt-5 overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-background text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Fixture</th>
              <th className="px-3 py-2">Marketplace</th>
              <th className="px-3 py-2">Result</th>
              <th className="px-3 py-2">Errors</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-panel">
            {preview.items.map((item) => (
              <tr key={item.listingKey}>
                <td className="px-3 py-3 font-medium">{item.fixtureTitle}</td>
                <td className="px-3 py-3 text-muted">{item.marketplace}</td>
                <td className="px-3 py-3">
                  <StatusPill tone={toneForStatus(item.status)}>
                    {formatEvidenceLabel(item.status)}
                  </StatusPill>
                </td>
                <td className="px-3 py-3 text-muted">
                  {item.errors.length > 0
                    ? item.errors.map((error) => error.code).join(", ")
                    : "None"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function ErrorList({ previews }: { previews: ImporterFixtureImportResult[] }) {
  const errors = previews.flatMap((preview) =>
    preview.items.flatMap((item) =>
      item.errors.map((error) => ({
        ...error,
        fixtureTitle: item.fixtureTitle,
        listingKey: item.listingKey
      }))
    )
  );

  if (errors.length === 0) {
    return (
      <EmptyState
        icon={FileCheck2}
        title="No fixture validation errors"
        description="The current selected fixture previews are clean."
      />
    );
  }

  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
        <h2 className="text-xl font-bold">Validation Errors</h2>
      </div>
      <div className="mt-4 grid gap-3">
        {errors.map((error) => (
          <article
            key={`${error.listingKey}-${error.code}`}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="warning">{formatEvidenceLabel(error.code)}</StatusPill>
              {error.field ? <StatusPill>{error.field}</StatusPill> : null}
            </div>
            <h3 className="mt-3 font-semibold">{error.fixtureTitle}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{error.message}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function RunTable({
  items,
  runs
}: {
  items: ImporterFixtureRunItemView[];
  runs: ImporterFixtureRunView[];
}) {
  if (runs.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title="No importer fixture runs yet"
        description="Dry-run and import results will appear here after an admin runs a fixture set."
      />
    );
  }

  const latestRunId = runs[0]?.id;
  const latestItems = items.filter((item) => item.runId === latestRunId);

  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-2">
        <PlayCircle className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-xl font-bold">Latest Import Result</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <SummaryCard label="Fixtures" value={runs[0].fixtureCount} />
        <SummaryCard label="Created" value={runs[0].createdCount} />
        <SummaryCard label="Updated" value={runs[0].updatedCount} />
        <SummaryCard label="Skipped" value={runs[0].skippedCount} />
        <SummaryCard label="Errors" value={runs[0].errorCount} />
      </div>
      <div className="mt-5 overflow-hidden rounded-lg border border-border">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-background text-xs uppercase text-muted">
            <tr>
              <th className="px-3 py-2">Fixture</th>
              <th className="px-3 py-2">Marketplace</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Message</th>
              <th className="px-3 py-2">Listing</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-panel">
            {latestItems.map((item) => (
              <tr key={item.id}>
                <td className="px-3 py-3 font-medium">{item.fixtureKey}</td>
                <td className="px-3 py-3 text-muted">{item.marketplace}</td>
                <td className="px-3 py-3">
                  <StatusPill tone={toneForStatus(item.status)}>
                    {formatEvidenceLabel(item.status)}
                  </StatusPill>
                </td>
                <td className="px-3 py-3 text-muted">{item.message}</td>
                <td className="px-3 py-3">
                  {item.listingKey ? (
                    <Link
                      href={`/listing-intelligence/${item.listingKey}`}
                      className="font-semibold text-accent-strong dark:text-accent"
                    >
                      Open review
                    </Link>
                  ) : (
                    <span className="text-muted">Not created</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function ImporterFixturesAdmin({
  state
}: {
  state: ImporterFixtureState;
}) {
  return (
    <div className="grid gap-6">
      <article className="rounded-lg border border-border bg-panel p-5">
        <div className="flex flex-wrap gap-2">
          <StatusPill tone={state.isConfigured ? "accent" : "warning"}>
            {state.isConfigured ? "Supabase configured" : "demo preview"}
          </StatusPill>
          <StatusPill tone={state.canRun ? "accent" : "neutral"}>
            {state.canRun ? "admin import enabled" : "preview only"}
          </StatusPill>
          <StatusPill tone={state.isServiceRoleConfigured ? "accent" : "neutral"}>
            {state.isServiceRoleConfigured ? "service role set" : "service role missing"}
          </StatusPill>
        </div>
        {state.message ? (
          <p className="mt-3 text-sm leading-6 text-muted">{state.message}</p>
        ) : null}
        <p className="mt-3 text-sm leading-6 text-muted">
          Fixture imports use representative demo/manual listings only. They do
          not scrape, automate browsers, call marketplace APIs, run OCR, or use
          AI extraction.
        </p>
      </article>

      <div className="grid gap-5">
        {state.previews.map((preview) => (
          <FixturePreviewCard
            key={preview.fixtureSetId}
            canRun={state.canRun}
            preview={preview}
          />
        ))}
      </div>

      <ErrorList previews={state.previews} />
      <RunTable items={state.latestRunItems} runs={state.latestRuns} />
    </div>
  );
}
