import type { Metadata } from "next";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { ProjectDashboard } from "@/components/solution-builder/project-dashboard";
import { getBuildProjectDashboard } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Create, resume, archive, restore, and review JETS hardware solution projects."
};

export default async function BuildProjectsPage() {
  const state = await getBuildProjectDashboard();

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
          title="Sign in to manage projects"
          description="Build projects persist slots, notes, and audit history with your account."
          next="/solution-builder/projects"
        />
      </main>
    );
  }

  return <ProjectDashboard projects={state.data} />;
}
