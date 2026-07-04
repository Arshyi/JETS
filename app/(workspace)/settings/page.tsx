import type { Metadata } from "next";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { ContentPage } from "@/components/pages/content-page";
import { SettingsForm } from "@/components/persistence/settings-form";
import { ErrorState } from "@/components/states/error-state";
import { getUserSettings } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage JETS account preferences and future inventory defaults."
};

export default async function SettingsPage() {
  const state = await getUserSettings();

  return (
    <ContentPage
      eyebrow="Version 0.3"
      title="Settings"
      description="Persisted account preferences for future inventory defaults and notification behavior."
    >
      {!state.isConfigured ? (
        <SupabaseSetupState />
      ) : !state.isSignedIn ? (
        <SignedOutState next="/settings" />
      ) : state.message ? (
        <ErrorState title="Could not load settings" description={state.message} />
      ) : (
        <SettingsForm settings={state.data} />
      )}
    </ContentPage>
  );
}
