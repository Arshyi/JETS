import type { Metadata } from "next";

import { BuildGeneratorExperience } from "@/components/build-generator/build-generator-experience";
import {
  getBuildSnapshotRestoreInput,
  getPersistenceGateState
} from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Build Generator",
  description:
    "Generate deterministic hardware recommendations from JETS mock listings and save decision snapshots."
};

type BuildGeneratorPageProps = {
  searchParams?: Promise<{
    snapshot?: string;
  }>;
};

export default async function BuildGeneratorPage({
  searchParams
}: BuildGeneratorPageProps) {
  const params = searchParams ? await searchParams : {};
  const snapshotId = params.snapshot;
  const [persistence, restoreState] = await Promise.all([
    getPersistenceGateState(),
    snapshotId ? getBuildSnapshotRestoreInput(snapshotId) : Promise.resolve(null)
  ]);

  return (
    <BuildGeneratorExperience
      initialInput={restoreState?.data?.input}
      persistence={persistence}
      restoredSnapshotTitle={restoreState?.data?.title}
    />
  );
}
