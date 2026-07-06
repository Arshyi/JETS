import type { Metadata } from "next";

import { ListingDetail } from "@/components/listing-intelligence/listing-review-ui";
import { ContentPage } from "@/components/pages/content-page";
import { getListingIntelligenceRecordState } from "@/lib/supabase/listing-intelligence-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Listing Review",
  description: "Inspect one normalized listing, parsed fields, evidence, corrections, and recommendation readiness."
};

export default async function ListingDetailPage({
  params
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  const state = await getListingIntelligenceRecordState(decodeURIComponent(listingId));

  return (
    <ContentPage
      eyebrow="Listing Intelligence"
      title="Listing Review Workspace"
      description="Raw listing text, normalized fields, evidence, corrections, duplicate context, platform knowledge, and recommendation preview for one listing."
    >
      <ListingDetail state={state} />
    </ContentPage>
  );
}
