import type { Metadata } from "next";

import { BuildGeneratorExperience } from "@/components/build-generator/build-generator-experience";
import {
  getBuildSnapshotRestoreInput,
  getPersistenceGateState
} from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Let JETS Recommend",
  description:
    "Let JETS synthesize complete hardware solution paths from budget, purpose, preferences, owned hardware, and deterministic scoring."
};

type RecommendPageProps = {
  searchParams?: Promise<{
    snapshot?: string;
  }>;
};

export default async function RecommendPage({ searchParams }: RecommendPageProps) {
  const params = searchParams ? await searchParams : {};
  const snapshotId = params.snapshot;
  const [persistence, restoreState] = await Promise.all([
    getPersistenceGateState(),
    snapshotId ? getBuildSnapshotRestoreInput(snapshotId) : Promise.resolve(null)
  ]);

  return (
    <BuildGeneratorExperience
      headerContent={{
        description:
          "Enter the hardware problem once. JETS evaluates complete solution paths across the shared inventory, decision, compatibility, snapshot, and audit foundations.",
        eyebrow: "Let JETS Recommend",
        title: "Solution Recommendations"
      }}
      initialInput={restoreState?.data?.input}
      persistence={persistence}
      restoredSnapshotTitle={restoreState?.data?.title}
    />
  );
}
