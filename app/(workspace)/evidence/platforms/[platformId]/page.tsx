import type { Metadata } from "next";

import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { PlatformEvidenceHistory } from "@/components/evidence/evidence-review-ui";
import { ContentPage } from "@/components/pages/content-page";
import { getPlatformKnowledgeById } from "@/lib/platform-knowledge";
import { getPlatformEvidenceState } from "@/lib/supabase/evidence-queries";
import type { PlatformKnowledgeId } from "@/types/platform-knowledge";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Platform Evidence History",
  description: "Evidence records, timeline, and conflicts for a JETS platform profile."
};

export default async function PlatformEvidencePage({
  params
}: {
  params: Promise<{ platformId: PlatformKnowledgeId }>;
}) {
  const { platformId } = await params;
  const state = await getPlatformEvidenceState(platformId);
  const profile = getPlatformKnowledgeById(platformId);

  return (
    <ContentPage
      eyebrow="Platform evidence"
      title={profile?.name ?? platformId}
      description="Platform-specific evidence records, knowledge history, and preserved conflicts."
    >
      <div className="grid gap-6">
        {!state.isConfigured ? <SupabaseSetupState /> : null}
        <PlatformEvidenceHistory
          conflicts={state.conflicts}
          records={state.records}
          timeline={state.timeline}
        />
      </div>
    </ContentPage>
  );
}
