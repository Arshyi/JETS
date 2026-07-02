import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { ContentPage } from "@/components/pages/content-page";
import { BuildCard } from "@/components/persistence/build-card";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { getSavedBuilds } from "@/lib/supabase/queries";

export default async function SavedBuildsPage() {
  const state = await getSavedBuilds();

  return (
    <ContentPage
      eyebrow="Version 0.3"
      title="Saved Builds"
      description="Persisted saved build candidates from the mock search experience."
    >
      {!state.isConfigured ? (
        <SupabaseSetupState />
      ) : !state.isSignedIn ? (
        <SignedOutState next="/saved-builds" />
      ) : state.message ? (
        <ErrorState title="Could not load saved builds" description={state.message} />
      ) : state.data.length === 0 ? (
        <EmptyState
          title="No saved builds yet"
          description="Use the Save Build button on search results to persist mock listings here."
        />
      ) : (
        <div className="grid gap-4">
          {state.data.map((row) => (
            <BuildCard key={row.id} row={row} type="saved" />
          ))}
        </div>
      )}
    </ContentPage>
  );
}
