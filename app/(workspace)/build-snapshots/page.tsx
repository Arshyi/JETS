import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { BuildSnapshotList } from "@/components/build-snapshots/build-snapshot-list";
import { ContentPage } from "@/components/pages/content-page";
import { ErrorState } from "@/components/states/error-state";
import {
  getBuildSnapshots,
  getDecisionAuditEventsForSubjects
} from "@/lib/supabase/queries";

export default async function BuildSnapshotsPage() {
  const state = await getBuildSnapshots();
  const activityState =
    state.isSignedIn && state.data.length > 0
      ? await getDecisionAuditEventsForSubjects(
          "build_snapshot",
          state.data.map((row) => row.id),
          120
        )
      : null;

  return (
    <ContentPage
      eyebrow="Version 0.9"
      title="Build Snapshots"
      description="Persisted Build Generator decisions with preserved inputs, outputs, scores, explanations, alternatives, and timestamps."
    >
      {!state.isConfigured ? (
        <SupabaseSetupState />
      ) : !state.isSignedIn ? (
        <SignedOutState next="/build-snapshots" />
      ) : state.message ? (
        <ErrorState title="Could not load build snapshots" description={state.message} />
      ) : (
        <BuildSnapshotList
          auditEvents={activityState?.data ?? []}
          rows={state.data}
        />
      )}
    </ContentPage>
  );
}
