import type { Metadata } from "next";

import {
  EvidenceConnectionSummary,
  EvidenceDashboard
} from "@/components/evidence/evidence-review-ui";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { ContentPage } from "@/components/pages/content-page";
import { getEvidenceReviewState } from "@/lib/supabase/evidence-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Evidence Review",
  description: "JETS evidence dashboard for provenance, verification, conflicts, and review state."
};

export default async function EvidencePage() {
  const state = await getEvidenceReviewState();

  return (
    <ContentPage
      eyebrow="Version 3.2"
      title="Evidence Review"
      description="Database-backed trust infrastructure for parsed fields, platform knowledge, solution reasoning, conflicts, and moderation state."
    >
      <div className="grid gap-6">
        {!state.isConfigured ? <SupabaseSetupState /> : null}
        <EvidenceConnectionSummary state={state} />
        <EvidenceDashboard state={state} />
      </div>
    </ContentPage>
  );
}
