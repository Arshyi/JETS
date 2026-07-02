import { SignedOutState } from "@/components/auth/signed-out-state";
import { DuplicateList } from "@/components/ingestion/duplicate-list";
import { DryRunSummary } from "@/components/ingestion/dry-run-summary";
import { RunLogList } from "@/components/ingestion/run-log-list";
import { SourceHealthCard } from "@/components/ingestion/source-health-card";
import { ContentPage } from "@/components/pages/content-page";
import { ErrorState } from "@/components/states/error-state";
import { StatusPill } from "@/components/ui/status-pill";
import { runMockIngestionDryRun } from "@/lib/ingestion/dry-run";
import { getAdminGate } from "@/lib/supabase/admin";
import { getRecentIngestionRuns } from "@/lib/supabase/ingestion-queries";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

export default async function AdminIngestionPage() {
  const gate = await getAdminGate();
  const report = await runMockIngestionDryRun();
  const runLogState = gate.isAllowed
    ? await getRecentIngestionRuns()
    : { data: [], message: undefined };

  return (
    <ContentPage
      eyebrow="Version 0.4"
      title="Admin Ingestion Dry Run"
      description="Admin-only dry-run controls for mock marketplace adapters, normalized listing previews, duplicate detection, and persisted run logs."
    >
      <div className="grid gap-6">
        {gate.isAllowed ? (
          <article className="rounded-lg border border-border bg-panel p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="accent">Admin verified</StatusPill>
              <StatusPill>{gate.userEmail}</StatusPill>
              <StatusPill>dry-run only</StatusPill>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              Running this page stores mock normalized listings and ingestion
              run logs when the v0.4 Supabase migration has been applied.
            </p>
          </article>
        ) : gate.status === "signed-out" ? (
          <SignedOutState
            next="/admin/ingestion"
            title={gate.title}
            description={gate.description}
          />
        ) : (
          <ErrorState title={gate.title} description={gate.description} />
        )}

        {gate.isAllowed && !isSupabaseServiceRoleConfigured ? (
          <ErrorState
            title="Service role key required"
            description="Set SUPABASE_SERVICE_ROLE_KEY on the server before dry-run results can be persisted to ingestion tables."
          />
        ) : null}

        <DryRunSummary
          report={report}
          showRunControls={gate.isAllowed && isSupabaseServiceRoleConfigured}
        />

        {gate.isAllowed ? (
          <RunLogList runs={runLogState.data} message={runLogState.message} />
        ) : null}

        <div className="grid gap-4">
          {report.health.map((health) => (
            <SourceHealthCard key={health.source.id} health={health} />
          ))}
        </div>

        <DuplicateList duplicateGroups={report.duplicateGroups} />
      </div>
    </ContentPage>
  );
}
