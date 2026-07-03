import { AuditTimeline } from "@/components/decision-audit/audit-timeline";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getSnapshotScoreDelta,
  readBuildSnapshot
} from "@/lib/build-snapshots/snapshot";
import { buildSnapshotStatusLabels } from "@/types/build-snapshots";
import { restoreBuildSnapshotAction } from "@/lib/supabase/persistence-actions";
import type {
  BuildDecisionSnapshot,
  BuildSnapshotRecommendation
} from "@/types/build-snapshots";
import type { BuildSnapshotRow, DecisionAuditEventRow } from "@/types/database";

type SnapshotWithRow = {
  row: BuildSnapshotRow;
  snapshot: BuildDecisionSnapshot;
};

type BuildSnapshotCompareProps = {
  auditEvents?: DecisionAuditEventRow[];
  rows: BuildSnapshotRow[];
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatDelta(value: number) {
  if (value > 0) {
    return `+${value}`;
  }

  return `${value}`;
}

function getRecommendation(
  snapshot: BuildDecisionSnapshot,
  categoryId: string
): BuildSnapshotRecommendation | null {
  return (
    snapshot.recommendations.find(
      (recommendation) => recommendation.categoryId === categoryId
    ) ?? null
  );
}

export function BuildSnapshotCompare({
  auditEvents = [],
  rows
}: BuildSnapshotCompareProps) {
  const snapshots = rows
    .map((row) => {
      const snapshot = readBuildSnapshot(row.snapshot);

      return snapshot ? { row, snapshot } : null;
    })
    .filter((item): item is SnapshotWithRow => Boolean(item));
  const baseline = snapshots[0] ?? null;
  const categories = baseline?.snapshot.recommendations ?? [];

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 lg:grid-cols-3">
        {snapshots.map(({ row, snapshot }) => {
          const top = snapshot.summary.topRecommendation;
          const baselineTop = baseline?.snapshot.summary.topRecommendation;
          const delta =
            top && baselineTop ? getSnapshotScoreDelta(top, baselineTop) : null;

          return (
            <article key={row.id} className="rounded-lg border border-border bg-panel p-5">
              <div className="flex flex-wrap gap-2">
                <StatusPill>
                  {buildSnapshotStatusLabels[
                    row.status as keyof typeof buildSnapshotStatusLabels
                  ] ?? row.status}
                </StatusPill>
                {row.is_favorite ? <StatusPill tone="warning">Favorite</StatusPill> : null}
                <StatusPill>v{snapshot.appVersion}</StatusPill>
              </div>
              <h2 className="mt-4 text-lg font-semibold">{row.title}</h2>
              <p className="mt-2 text-sm text-muted">{row.top_listing_title}</p>
              <time className="mt-3 block text-sm text-muted" dateTime={row.created_at}>
                {formatDate(row.created_at)}
              </time>

              <dl className="mt-5 grid gap-2 text-sm">
                {[
                  ["Overall", row.top_overall_score, delta?.overallScore],
                  ["Decision", row.top_decision_score, delta?.decisionScore],
                  ["Compatibility", row.top_compatibility_score, delta?.compatibilityScore],
                  ["Platform health", row.platform_health, delta?.platformHealth]
                ].map(([label, value, change]) => (
                  <div key={label} className="flex items-center justify-between gap-3">
                    <dt className="text-muted">{label}</dt>
                    <dd className="font-semibold">
                      {value}
                      {typeof change === "number" && change !== 0 ? (
                        <span className="ml-2 text-muted">({formatDelta(change)})</span>
                      ) : null}
                    </dd>
                  </div>
                ))}
              </dl>

              <form action={restoreBuildSnapshotAction} className="mt-5">
                <input type="hidden" name="snapshotId" value={row.id} />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  Restore
                </button>
              </form>
            </article>
          );
        })}
      </div>

      {baseline ? (
        <section className="rounded-lg border border-border bg-panel p-5">
          <h2 className="text-lg font-semibold">Recommendation score changes</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-xs uppercase text-muted">
                <tr>
                  <th className="whitespace-nowrap px-3 py-2 font-semibold">Category</th>
                  {snapshots.map(({ row }) => (
                    <th key={row.id} className="whitespace-nowrap px-3 py-2 font-semibold">
                      {row.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => {
                  const baselineRecommendation = getRecommendation(
                    baseline.snapshot,
                    category.categoryId
                  );

                  return (
                    <tr key={category.categoryId} className="border-t border-border">
                      <th className="whitespace-nowrap px-3 py-3 font-semibold">
                        {category.categoryLabel}
                      </th>
                      {snapshots.map(({ row, snapshot }) => {
                        const recommendation = getRecommendation(
                          snapshot,
                          category.categoryId
                        );
                        const delta =
                          recommendation && baselineRecommendation
                            ? recommendation.overallScore -
                              baselineRecommendation.overallScore
                            : 0;

                        return (
                          <td key={row.id} className="min-w-48 px-3 py-3 align-top">
                            {recommendation ? (
                              <div>
                                <p className="font-semibold">{recommendation.overallScore}</p>
                                {delta !== 0 ? (
                                  <p className="mt-1 text-muted">{formatDelta(delta)}</p>
                                ) : null}
                                <p className="mt-1 text-muted">{recommendation.title}</p>
                              </div>
                            ) : (
                              <span className="text-muted">Unavailable</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      {auditEvents.length > 0 ? (
        <section className="rounded-lg border border-border bg-panel p-5">
          <h2 className="text-lg font-semibold">Compared snapshot activity</h2>
          <div className="mt-4">
            <AuditTimeline compact events={auditEvents} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
