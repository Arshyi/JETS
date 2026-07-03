import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { BuildSnapshotList } from "@/components/build-snapshots/build-snapshot-list";
import { ContentPage } from "@/components/pages/content-page";
import { ErrorState } from "@/components/states/error-state";
import { getBuildSnapshots } from "@/lib/supabase/queries";

export default async function BuildSnapshotsPage() {
  const state = await getBuildSnapshots();

  return (
    <ContentPage
      eyebrow="Version 0.8"
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
        <BuildSnapshotList rows={state.data} />
      )}
    </ContentPage>
  );
}
