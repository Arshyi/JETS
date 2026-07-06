import type { Metadata } from "next";
import Link from "next/link";

import { DuplicateList } from "@/components/ingestion/duplicate-list";
import { DryRunSummary } from "@/components/ingestion/dry-run-summary";
import { NormalizedListingTable } from "@/components/ingestion/normalized-listing-table";
import { SourceHealthCard } from "@/components/ingestion/source-health-card";
import { MarketplaceIntelligenceDemo } from "@/components/marketplace-intelligence/marketplace-intelligence-demo";
import { ContentPage } from "@/components/pages/content-page";
import { ErrorState } from "@/components/states/error-state";
import { buildMarketplaceImportPipelineReport } from "@/lib/marketplace-intelligence/normalize";
import { getSourceStatusState } from "@/lib/supabase/ingestion-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Source Health",
  description: "Inspect JETS dry-run source health, normalized listing samples, and duplicate hints."
};

export default async function SourcesPage() {
  const state = await getSourceStatusState();
  const marketplaceIntelligenceReport = buildMarketplaceImportPipelineReport();

  return (
    <ContentPage
      eyebrow="Version 0.4"
      title="Source Health"
      description="Dry-run marketplace ingestion status, compliance posture, freshness flags, and duplicate detection for mock adapters only."
    >
      <div className="grid gap-6">
        {!state.isConfigured ? (
          <ErrorState
            title="Persistence not connected yet"
            description={`${state.message} Source health remains available from local dry-run mock adapters, but persisted source records need Supabase setup.`}
            action={
              <Link
                href="/beta/setup"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Open setup checklist
              </Link>
            }
          />
        ) : null}

        <DryRunSummary report={state.report} />

        <MarketplaceIntelligenceDemo report={marketplaceIntelligenceReport} />

        <article className="rounded-lg border border-border bg-panel p-5">
          <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
            Listing Intelligence
          </p>
          <h2 className="mt-2 text-xl font-bold">Review normalized listings before recommendation</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            Source adapters produce raw listing snapshots. Listing Intelligence
            turns each snapshot into reviewable fields, correction evidence,
            duplicate signals, and recommendation readiness.
          </p>
          <Link
            href="/listing-intelligence"
            className="mt-4 inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-subtle"
          >
            Open Listing Intelligence
          </Link>
        </article>

        <div className="grid gap-4">
          {state.report.health.map((health) => (
            <SourceHealthCard key={health.source.id} health={health} />
          ))}
        </div>

        <NormalizedListingTable listings={state.report.listings} />
        <DuplicateList duplicateGroups={state.report.duplicateGroups} />
      </div>
    </ContentPage>
  );
}
