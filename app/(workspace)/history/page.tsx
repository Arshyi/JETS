import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { ContentPage } from "@/components/pages/content-page";
import { HistoryList } from "@/components/persistence/history-list";
import { ErrorState } from "@/components/states/error-state";
import { getBuildHistory } from "@/lib/supabase/queries";

export default async function HistoryPage() {
  const state = await getBuildHistory();

  return (
    <ContentPage
      eyebrow="Version 0.3"
      title="History"
      description="A persisted research trail for saved and favorited mock listings."
    >
      {!state.isConfigured ? (
        <SupabaseSetupState />
      ) : !state.isSignedIn ? (
        <SignedOutState next="/history" />
      ) : state.message ? (
        <ErrorState title="Could not load history" description={state.message} />
      ) : (
        <HistoryList rows={state.data} />
      )}
    </ContentPage>
  );
}
