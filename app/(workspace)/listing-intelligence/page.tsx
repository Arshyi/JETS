import type { Metadata } from "next";

import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { ListingIntelligenceDashboard } from "@/components/listing-intelligence/listing-review-ui";
import { ContentPage } from "@/components/pages/content-page";
import { getListingIntelligenceState } from "@/lib/supabase/listing-intelligence-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Listing Intelligence",
  description:
    "Review normalized marketplace listings, parsed fields, corrections, duplicate signals, and recommendation readiness."
};

export default async function ListingIntelligencePage() {
  const state = await getListingIntelligenceState();

  return (
    <ContentPage
      eyebrow="Version 3.3"
      title="Listing Intelligence"
      description="Database-backed review infrastructure for individual listings. Demo and manual listings become normalized engineering objects before they can influence recommendations."
    >
      <div className="grid gap-6">
        {!state.isConfigured ? <SupabaseSetupState /> : null}
        <ListingIntelligenceDashboard state={state} />
      </div>
    </ContentPage>
  );
}
