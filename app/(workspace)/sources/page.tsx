import { DuplicateList } from "@/components/ingestion/duplicate-list";
import { DryRunSummary } from "@/components/ingestion/dry-run-summary";
import { NormalizedListingTable } from "@/components/ingestion/normalized-listing-table";
import { SourceHealthCard } from "@/components/ingestion/source-health-card";
import { ContentPage } from "@/components/pages/content-page";
import { ErrorState } from "@/components/states/error-state";
import { getSourceStatusState } from "@/lib/supabase/ingestion-queries";

export const dynamic = "force-dynamic";

export default async function SourcesPage() {
  const state = await getSourceStatusState();

  return (
    <ContentPage
      eyebrow="Version 0.4"
      title="Source Health"
      description="Dry-run marketplace ingestion status, compliance posture, freshness flags, and duplicate detection for mock adapters only."
    >
      <div className="grid gap-6">
        {!state.isConfigured ? (
          <ErrorState
            title="Persistence not connected"
            description={`${state.message} Source health is still available from local dry-run mock adapters.`}
          />
        ) : null}

        <DryRunSummary report={state.report} />

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
