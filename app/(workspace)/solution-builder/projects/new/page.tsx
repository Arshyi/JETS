import type { Metadata } from "next";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { ContentPage } from "@/components/pages/content-page";
import { ProjectGoalWizard } from "@/components/solution-builder/project-goal-wizard";
import { getPersistenceGateState } from "@/lib/supabase/queries";

type NewBuildProjectPageProps = {
  searchParams?: Promise<{
    goal?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Create Project",
  description:
    "Choose a JETS hardware goal and create a project-centered builder workspace."
};

export default async function NewBuildProjectPage({
  searchParams
}: NewBuildProjectPageProps) {
  const resolvedSearchParams: Promise<{ goal?: string }> =
    searchParams ?? Promise.resolve({});
  const [state, params] = await Promise.all([
    getPersistenceGateState(),
    resolvedSearchParams
  ]);

  return (
    <ContentPage
      eyebrow="Goal-first builder"
      title="Create Project"
      description="Start by choosing the hardware problem. JETS will turn that goal into a project, slot workspace, scoring preset, and optimizer direction."
    >
      {!state.isConfigured ? (
        <SupabaseSetupState />
      ) : !state.isSignedIn ? (
        <SignedOutState
          next="/solution-builder/projects/new"
          title="Sign in to create a project"
          description="Projects persist slots, validation, optimization runs, branches, and decision history with your account."
        />
      ) : (
        <ProjectGoalWizard selectedGoalId={params.goal} />
      )}
    </ContentPage>
  );
}
