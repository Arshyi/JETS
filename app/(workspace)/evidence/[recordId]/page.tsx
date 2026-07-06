import type { Metadata } from "next";

import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { EvidenceRecordDetail } from "@/components/evidence/evidence-review-ui";
import { ContentPage } from "@/components/pages/content-page";
import { getEvidenceRecordState } from "@/lib/supabase/evidence-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Evidence Detail",
  description: "Detailed JETS evidence provenance, review state, and audit notes."
};

export default async function EvidenceDetailPage({
  params
}: {
  params: Promise<{ recordId: string }>;
}) {
  const { recordId } = await params;
  const state = await getEvidenceRecordState(recordId);

  return (
    <ContentPage
      eyebrow="Evidence record"
      title={state.record?.claim ?? "Evidence Detail"}
      description="Review provenance, source type, confidence, verification status, and audit trail for a single evidence record."
    >
      <div className="grid gap-6">
        {!state.isConfigured ? <SupabaseSetupState /> : null}
        <EvidenceRecordDetail state={state} />
      </div>
    </ContentPage>
  );
}
