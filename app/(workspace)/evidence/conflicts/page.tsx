import type { Metadata } from "next";

import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import {
  EvidenceConflictList,
  EvidenceReviewStatusPanel
} from "@/components/evidence/evidence-review-ui";
import { ContentPage } from "@/components/pages/content-page";
import { getEvidenceReviewState } from "@/lib/supabase/evidence-queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Evidence Conflicts",
  description: "JETS preserved conflicting evidence and current handling rules."
};

export default async function EvidenceConflictsPage() {
  const state = await getEvidenceReviewState();

  return (
    <ContentPage
      eyebrow="Evidence conflicts"
      title="Conflict Review"
      description="Preserved disagreements between official documentation, community discoveries, parser output, and future moderation."
    >
      <div className="grid gap-6">
        {!state.isConfigured ? <SupabaseSetupState /> : null}
        <EvidenceReviewStatusPanel state={state} />
        <EvidenceConflictList conflicts={state.conflicts} />
      </div>
    </ContentPage>
  );
}
