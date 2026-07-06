import type { Metadata } from "next";

import { AcquisitionWorkspace } from "@/components/acquisition/acquisition-workspace";
import { ContentPage } from "@/components/pages/content-page";
import { getAcquisitionHistoryState } from "@/lib/supabase/acquisition-queries";

export const metadata: Metadata = {
  title: "Acquire Hardware",
  description:
    "Capture a hardware listing manually, normalize it through JETS, review evidence and readiness, then decide whether to save or create a project."
};

export default async function AcquireHardwarePage() {
  const persistence = await getAcquisitionHistoryState();

  return (
    <ContentPage
      eyebrow="Phase 4 acquisition"
      title="Acquire Hardware"
      description="Paste a listing, review what JETS can infer, correct missing facts as evidence, compare purchase candidates, and turn promising hardware into a project."
    >
      <AcquisitionWorkspace persistence={persistence} />
    </ContentPage>
  );
}
