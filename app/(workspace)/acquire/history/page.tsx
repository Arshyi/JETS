import { FileSearch, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { ContentPage } from "@/components/pages/content-page";
import { StatusPill } from "@/components/ui/status-pill";
import {
  acquisitionMarketplaceOptions,
  acquisitionStatusLabels
} from "@/lib/acquisition/workflow";
import { getAcquisitionHistoryState } from "@/lib/supabase/acquisition-queries";
import type { AcquisitionDecisionStatus } from "@/types/acquisition";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Acquisition History",
  description:
    "Review saved manual acquisition records, statuses, compare sets, and project handoff candidates."
};

const statusOptions: AcquisitionDecisionStatus[] = [
  "reviewing",
  "ready",
  "purchased",
  "rejected",
  "archived"
];

function formatMoney(currency: string, value: number | null) {
  if (value === null) return "Unknown";

  return `${currency} ${value.toLocaleString()}`;
}

function statusTone(status: AcquisitionDecisionStatus) {
  if (status === "ready" || status === "purchased") return "accent";
  if (status === "reviewing") return "warning";
  return "neutral";
}

type AcquisitionHistoryPageProps = {
  searchParams?: Promise<{
    marketplace?: string;
    source?: string;
    status?: string;
  }>;
};

export default async function AcquisitionHistoryPage({
  searchParams
}: AcquisitionHistoryPageProps) {
  const params = searchParams ? await searchParams : {};
  const state = await getAcquisitionHistoryState(params);

  if (!state.isConfigured) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SupabaseSetupState />
      </main>
    );
  }

  if (!state.isSignedIn) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SignedOutState
          title="Sign in to view acquisition history"
          description="Acquisition records persist raw listing facts, normalized previews, corrections, notes, decisions, and project links with your account."
          next="/acquire/history"
        />
      </main>
    );
  }

  return (
    <ContentPage
      eyebrow="Phase 4.1"
      title="Acquisition History"
      description="Saved manual acquisitions are persisted records now. Use this dashboard to filter purchase candidates, reopen details, compare saved sets, and hand promising hardware to projects."
    >
      <div className="grid gap-6">
        <section className="rounded-lg border border-border bg-panel p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Filters</h2>
              <p className="mt-1 text-sm text-muted">
                Filter by marketplace, source adapter, or decision state.
              </p>
            </div>
            <Link
              href="/acquire"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Capture listing
            </Link>
          </div>
          <form className="mt-5 grid gap-4 md:grid-cols-4" action="/acquire/history">
            <label className="grid gap-2 text-sm font-medium">
              <span>Status</span>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                name="status"
                defaultValue={params.status ?? ""}
              >
                <option value="">Any status</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {acquisitionStatusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              <span>Marketplace</span>
              <select
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                name="marketplace"
                defaultValue={params.marketplace ?? ""}
              >
                <option value="">Any marketplace</option>
                {acquisitionMarketplaceOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              <span>Source ID</span>
              <input
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                defaultValue={params.source ?? ""}
                name="source"
                placeholder="dubizzle, manual-entry"
              />
            </label>
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong"
              >
                Apply
              </button>
              <Link
                href="/acquire/history"
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground"
              >
                Reset
              </Link>
            </div>
          </form>
        </section>

        {state.message ? (
          <div className="rounded-lg border border-warning bg-warning/10 p-4 text-sm text-warning">
            {state.message}
          </div>
        ) : null}

        <section className="grid gap-4">
          {state.data.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-panel p-8 text-center">
              <FileSearch className="mx-auto h-8 w-8 text-muted" aria-hidden="true" />
              <h2 className="mt-4 text-xl font-semibold">No saved acquisitions yet</h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted">
                Capture a listing manually, let JETS normalize it, then save it
                as reviewing, ready, rejected, archived, or purchased.
              </p>
              <Link
                href="/acquire"
                className="mt-5 inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong"
              >
                Capture first acquisition
              </Link>
            </div>
          ) : (
            state.data.map((record) => (
              <article
                key={record.id}
                className="rounded-lg border border-border bg-panel p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{record.snapshot.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {record.snapshot.detectedPlatformName ?? "Unknown platform"} ·{" "}
                      {record.draft.location}
                    </p>
                  </div>
                  <StatusPill tone={statusTone(record.status)}>
                    {acquisitionStatusLabels[record.status]}
                  </StatusPill>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <StatusPill>
                    {formatMoney(record.draft.currency, record.snapshot.priceAmount)}
                  </StatusPill>
                  <StatusPill>
                    Score {record.snapshot.recommendationPreviewScore}
                  </StatusPill>
                  <StatusPill>{record.snapshot.confidence} confidence</StatusPill>
                  <StatusPill>{record.snapshot.readiness}</StatusPill>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/acquire/history/${record.id}`}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong"
                  >
                    Open detail
                  </Link>
                  {record.draft.listingUrl ? (
                    <Link
                      href={record.draft.listingUrl}
                      className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground"
                    >
                      Original listing
                    </Link>
                  ) : null}
                </div>
              </article>
            ))
          )}
        </section>

        {state.compareSets.length > 0 ? (
          <section className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">Saved compare sets</h2>
            <div className="mt-4 grid gap-3">
              {state.compareSets.map((set) => (
                <div
                  key={set.id}
                  className="rounded-lg border border-border bg-background p-4 text-sm"
                >
                  <p className="font-semibold">{set.title}</p>
                  <p className="mt-1 text-muted">
                    {set.acquisition_ids.length} acquisitions ·{" "}
                    {new Date(set.updated_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </ContentPage>
  );
}
