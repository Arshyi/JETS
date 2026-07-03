import { BuildGeneratorExperience } from "@/components/build-generator/build-generator-experience";
import {
  getBuildSnapshotRestoreInput,
  getPersistenceGateState
} from "@/lib/supabase/queries";

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
