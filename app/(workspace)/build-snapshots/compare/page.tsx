import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { BuildSnapshotCompare } from "@/components/build-snapshots/build-snapshot-compare";
import { ContentPage } from "@/components/pages/content-page";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { getBuildSnapshotsByIds } from "@/lib/supabase/queries";

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

  return (
    <ContentPage
      eyebrow="Version 0.8"
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
        <BuildSnapshotCompare rows={state.data} />
      )}
    </ContentPage>
  );
}
