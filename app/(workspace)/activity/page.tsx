import type { Metadata } from "next";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { AuditTimeline } from "@/components/decision-audit/audit-timeline";
import { ContentPage } from "@/components/pages/content-page";
import { ErrorState } from "@/components/states/error-state";
import { getDecisionAuditEvents } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Decision Activity",
  description: "Unified JETS audit timeline for saved builds, snapshots, notes, and decisions."
};

export default async function ActivityPage() {
  const state = await getDecisionAuditEvents(120);

  return (
    <ContentPage
      eyebrow="Version 0.9"
      title="Decision Activity"
      description="Unified audit trail for saved builds, favorites, build snapshots, notes, restores, and decision outcomes."
    >
      {!state.isConfigured ? (
        <SupabaseSetupState />
      ) : !state.isSignedIn ? (
        <SignedOutState next="/activity" />
      ) : state.message ? (
        <ErrorState title="Could not load activity" description={state.message} />
      ) : (
        <AuditTimeline events={state.data} />
      )}
    </ContentPage>
  );
}
