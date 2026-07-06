import type { Metadata } from "next";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { EvidenceReviewQueue } from "@/components/evidence/evidence-review-ui";
import { ContentPage } from "@/components/pages/content-page";
import { getEvidenceReviewState } from "@/lib/supabase/evidence-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Evidence Review Queue",
  description: "Pending JETS evidence records waiting for review."
};

export default async function EvidenceReviewPage() {
  const state = await getEvidenceReviewState();

  return (
    <ContentPage
      eyebrow="Evidence moderation"
      title="Pending Review Queue"
      description="Review pending evidence submissions before they can become trusted platform knowledge or recommendation support."
    >
      {!state.isConfigured ? (
        <SupabaseSetupState />
      ) : !state.isSignedIn ? (
        <SignedOutState next="/evidence/review" />
      ) : (
        <EvidenceReviewQueue state={state} />
      )}
    </ContentPage>
  );
}
