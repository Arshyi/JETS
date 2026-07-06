import type { Metadata } from "next";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { ListingReviewQueue } from "@/components/listing-intelligence/listing-review-ui";
import { ContentPage } from "@/components/pages/content-page";
import { getListingIntelligenceState } from "@/lib/supabase/listing-intelligence-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Listing Review Queue",
  description: "Review parsed listing fields before they become trusted recommendation inputs."
};

export default async function ListingReviewPage() {
  const state = await getListingIntelligenceState();

  return (
    <ContentPage
      eyebrow="Listing review"
      title="Parsed Field Review Queue"
      description="Accept, reject, correct, or mark parsed fields unknown. Corrections become evidence instead of silent overwrites."
    >
      {!state.isConfigured ? (
        <div className="grid gap-6">
          <SupabaseSetupState />
          <ListingReviewQueue state={state} />
        </div>
      ) : !state.isSignedIn ? (
        <SignedOutState next="/listing-intelligence/review" />
      ) : (
        <ListingReviewQueue state={state} />
      )}
    </ContentPage>
  );
}
