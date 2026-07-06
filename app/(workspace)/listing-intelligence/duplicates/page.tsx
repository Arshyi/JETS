import type { Metadata } from "next";

import { ListingDuplicateReview } from "@/components/listing-intelligence/listing-review-ui";
import { ContentPage } from "@/components/pages/content-page";
import { getListingIntelligenceState } from "@/lib/supabase/listing-intelligence-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Listing Duplicates",
  description: "Review deterministic duplicate signals across normalized listings."
};

export default async function ListingDuplicatesPage() {
  const state = await getListingIntelligenceState();

  return (
    <ContentPage
      eyebrow="Listing intelligence"
      title="Duplicate Review"
      description="Detect likely and possible duplicate listings using deterministic source, seller, description, hardware, and platform signals."
    >
      <ListingDuplicateReview state={state} />
    </ContentPage>
  );
}
