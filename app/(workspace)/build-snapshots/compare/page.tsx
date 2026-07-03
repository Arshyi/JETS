import type { Metadata } from "next";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { BuildSnapshotCompare } from "@/components/build-snapshots/build-snapshot-compare";
import { ContentPage } from "@/components/pages/content-page";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import {
  getBuildSnapshotsByIds,
  getDecisionAuditEventsForSubjects
} from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Compare Build Snapshots",
  description: "Compare JETS build snapshot score changes and activity."
};

type BuildSnapshotComparePageProps = {
  searchParams?: Promise<{
    ids?: string;
  }>;
};

function parseSnapshotIds(value: string | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 3);
}

export default async function BuildSnapshotComparePage({
  searchParams
}: BuildSnapshotComparePageProps) {
  const params = searchParams ? await searchParams : {};
  const snapshotIds = parseSnapshotIds(params.ids);
  const state = await getBuildSnapshotsByIds(snapshotIds);
  const activityState =
    state.isSignedIn && state.data.length > 0
      ? await getDecisionAuditEventsForSubjects(
          "build_snapshot",
          state.data.map((row) => row.id),
          80
        )
      : null;

  return (
    <ContentPage
      eyebrow="Version 0.9"
      title="Compare Build Snapshots"
      description="Score deltas across saved Build Generator decisions."
    >
      {!state.isConfigured ? (
        <SupabaseSetupState />
      ) : !state.isSignedIn ? (
        <SignedOutState next="/build-snapshots/compare" />
      ) : state.message ? (
        <ErrorState title="Could not compare snapshots" description={state.message} />
      ) : state.data.length < 2 ? (
        <EmptyState
          title="Select at least two snapshots"
          description="Build snapshot comparisons need two or three saved generator runs."
        />
      ) : (
        <BuildSnapshotCompare
          auditEvents={activityState?.data ?? []}
          rows={state.data}
        />
      )}
    </ContentPage>
  );
}
