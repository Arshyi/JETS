import type { Metadata } from "next";
import Link from "next/link";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { OptimizationExperience } from "@/components/optimization/optimization-experience";
import { EmptyState } from "@/components/states/empty-state";
import { getBuildProjectOptimizationState } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Optimize My Build",
  description:
    "Run deterministic JETS optimization goals against a persisted Build My Own project."
};

type OptimizeProjectPageProps = {
  params: Promise<{
    projectId: string;
  }>;
  searchParams?: Promise<{
    run?: string;
  }>;
};

export default async function OptimizeProjectPage({
  params,
  searchParams
}: OptimizeProjectPageProps) {
  const { projectId } = await params;
  const query = searchParams ? await searchParams : {};
  const state = await getBuildProjectOptimizationState(projectId, query.run);

  if (!state.isConfigured) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SupabaseSetupState />
      </main>
    );
  }

  if (!state.isSignedIn) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SignedOutState
          title="Sign in to optimize this project"
          description="Optimization runs persist suggestions and audit history with your account."
          next={`/solution-builder/projects/${projectId}/optimize`}
        />
      </main>
    );
  }

  if (!state.data) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title="Project not found"
          description="This project may have been deleted, or it belongs to another signed-in user."
          action={
            <Link
              href="/solution-builder/projects"
              className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Back to projects
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <OptimizationExperience
      detail={state.data.detail}
      runs={state.data.runs}
      selectedRun={state.data.selectedRun}
      suggestions={state.data.suggestions}
    />
  );
}
