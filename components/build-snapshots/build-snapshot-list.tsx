"use client";

import {
  Archive,
  Check,
  GitCompare,
  Heart,
  Pencil,
  RotateCcw,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/states/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { convertUsdToCurrency } from "@/lib/build-generator/config";
import { readBuildSnapshot } from "@/lib/build-snapshots/snapshot";
import {
  deleteBuildSnapshotAction,
  renameBuildSnapshotAction,
  updateBuildSnapshotFavoriteAction,
  updateBuildSnapshotStatusAction
} from "@/lib/supabase/persistence-actions";
import { buildSnapshotStatusLabels, buildSnapshotStatuses } from "@/types/build-snapshots";
import type { BuildGeneratorCurrency } from "@/types/build-generator";
import type { BuildSnapshotRow } from "@/types/database";

type BuildSnapshotListProps = {
  rows: BuildSnapshotRow[];
};

const maxCompareSnapshots = 3;

const statusTone: Record<string, "accent" | "neutral" | "warning"> = {
  accepted: "accent",
  archived: "neutral",
  purchased: "accent",
  rejected: "warning",
  reviewing: "neutral"
};

function formatCurrency(amountUsd: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    currency,
    maximumFractionDigits: 0,
    style: "currency"
  }).format(convertUsdToCurrency(amountUsd, currency as BuildGeneratorCurrency));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function BuildSnapshotList({ rows }: BuildSnapshotListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const compareHref = useMemo(
    () => `/build-snapshots/compare?ids=${selectedIds.map(encodeURIComponent).join(",")}`,
    [selectedIds]
  );

  function toggleSelected(snapshotId: string) {
    setSelectedIds((current) => {
      if (current.includes(snapshotId)) {
        return current.filter((id) => id !== snapshotId);
      }

      if (current.length >= maxCompareSnapshots) {
        return current;
      }

      return [...current, snapshotId];
    });
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title="No build snapshots yet"
        description="Save a Build Generator result to preserve its inputs, scores, explanations, and alternatives."
        icon={Archive}
      />
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-border bg-panel p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">{rows.length} saved snapshots</p>
          <p className="text-sm text-muted">{selectedIds.length} selected for compare</p>
        </div>
        <Link
          href={selectedIds.length >= 2 ? compareHref : "/build-snapshots"}
          aria-disabled={selectedIds.length < 2}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background aria-disabled:pointer-events-none aria-disabled:opacity-50"
        >
          <GitCompare className="h-4 w-4" aria-hidden="true" />
          Compare
        </Link>
      </div>

      <div className="grid gap-4">
        {rows.map((row) => {
          const snapshot = readBuildSnapshot(row.snapshot);
          const topRecommendation = snapshot?.summary.topRecommendation;
          const isSelected = selectedIds.includes(row.id);
          const isSelectionDisabled =
            selectedIds.length >= maxCompareSnapshots && !isSelected;

          return (
            <article key={row.id} className="rounded-lg border border-border bg-panel p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={statusTone[row.status] ?? "neutral"}>
                      {buildSnapshotStatusLabels[
                        row.status as keyof typeof buildSnapshotStatusLabels
                      ] ?? row.status}
                    </StatusPill>
                    {row.is_favorite ? <StatusPill tone="warning">Favorite</StatusPill> : null}
                    <StatusPill>v{row.app_version}</StatusPill>
                    <StatusPill>{row.currency}</StatusPill>
                  </div>

                  <h2 className="mt-4 text-xl font-semibold">{row.title}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                    {row.top_listing_title}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted">
                    <time dateTime={row.created_at}>Created {formatDate(row.created_at)}</time>
                    <time dateTime={row.updated_at}>Updated {formatDate(row.updated_at)}</time>
                  </div>
                </div>

                <label className="flex min-w-36 cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-muted">
                  <span>{isSelected ? "Selected" : "Compare"}</span>
                  <span className="grid h-5 w-5 place-items-center rounded border border-current">
                    {isSelected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                  </span>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={isSelectionDisabled}
                    onChange={() => toggleSelected(row.id)}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                {[
                  ["Budget", `${row.budget} ${row.currency}`],
                  ["Top overall", row.top_overall_score],
                  ["Decision", row.top_decision_score],
                  ["Compatibility", row.top_compatibility_score],
                  ["Platform health", row.platform_health]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-border bg-background p-4">
                    <p className="text-xs font-semibold uppercase text-muted">{label}</p>
                    <p className="mt-2 text-lg font-bold">{value}</p>
                  </div>
                ))}
              </div>

              {topRecommendation ? (
                <div className="mt-5 grid gap-4 lg:grid-cols-2">
                  <section className="rounded-lg border border-border bg-background p-4">
                    <h3 className="text-sm font-semibold">Why this build?</h3>
                    <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
                      {topRecommendation.whyThisBuild.slice(0, 3).map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </section>

                  <section className="rounded-lg border border-border bg-background p-4">
                    <h3 className="text-sm font-semibold">Snapshot details</h3>
                    <dl className="mt-3 grid gap-2 text-sm">
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Negotiation</dt>
                        <dd className="font-semibold">
                          {formatCurrency(
                            topRecommendation.estimatedNegotiationPrice,
                            row.currency
                          )}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Recommendations</dt>
                        <dd className="font-semibold">{snapshot.recommendations.length}</dd>
                      </div>
                      <div className="flex justify-between gap-3">
                        <dt className="text-muted">Candidates</dt>
                        <dd className="font-semibold">{snapshot.candidatesCount}</dd>
                      </div>
                    </dl>
                  </section>
                </div>
              ) : null}

              <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_220px]">
                <form action={renameBuildSnapshotAction} className="flex flex-col gap-2 sm:flex-row">
                  <input type="hidden" name="snapshotId" value={row.id} />
                  <input type="hidden" name="returnTo" value="/build-snapshots" />
                  <label className="sr-only" htmlFor={`title-${row.id}`}>
                    Snapshot title
                  </label>
                  <input
                    id={`title-${row.id}`}
                    name="title"
                    defaultValue={row.title}
                    className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <Pencil className="h-4 w-4" aria-hidden="true" />
                    Rename
                  </button>
                </form>

                <form action={updateBuildSnapshotStatusAction} className="flex gap-2">
                  <input type="hidden" name="snapshotId" value={row.id} />
                  <input type="hidden" name="returnTo" value="/build-snapshots" />
                  <label className="sr-only" htmlFor={`status-${row.id}`}>
                    Snapshot status
                  </label>
                  <select
                    id={`status-${row.id}`}
                    name="status"
                    defaultValue={row.status}
                    className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                  >
                    {buildSnapshotStatuses.map((status) => (
                      <option key={status} value={status}>
                        {buildSnapshotStatusLabels[status]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                    aria-label="Update status"
                    title="Update status"
                  >
                    <Check className="h-4 w-4" aria-hidden="true" />
                  </button>
                </form>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/build-generator?snapshot=${encodeURIComponent(row.id)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Restore
                </Link>

                <form action={updateBuildSnapshotFavoriteAction}>
                  <input type="hidden" name="snapshotId" value={row.id} />
                  <input type="hidden" name="returnTo" value="/build-snapshots" />
                  <input
                    type="hidden"
                    name="isFavorite"
                    value={row.is_favorite ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <Heart className="h-4 w-4" aria-hidden="true" />
                    {row.is_favorite ? "Unfavorite" : "Favorite"}
                  </button>
                </form>

                <form action={deleteBuildSnapshotAction}>
                  <input type="hidden" name="snapshotId" value={row.id} />
                  <input type="hidden" name="returnTo" value="/build-snapshots" />
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </button>
                </form>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
