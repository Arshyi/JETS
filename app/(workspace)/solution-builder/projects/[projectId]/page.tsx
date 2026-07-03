import type { Metadata } from "next";
import Link from "next/link";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { ProjectDetail } from "@/components/solution-builder/project-detail";
import { EmptyState } from "@/components/states/empty-state";
import { getBuildProjectDetail } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Build Project",
  description:
    "Fill persisted JETS build slots with component-aware inventory and review project audit history."
};

type BuildProjectPageProps = {
  params: Promise<{
    projectId: string;
  }>;
};

export default async function BuildProjectPage({ params }: BuildProjectPageProps) {
  const { projectId } = await params;
  const state = await getBuildProjectDetail(projectId);

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
          title="Sign in to open this project"
          description="Project slots, notes, and audit history require an account."
          next={`/solution-builder/projects/${projectId}`}
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

  return <ProjectDetail data={state.data} />;
}
