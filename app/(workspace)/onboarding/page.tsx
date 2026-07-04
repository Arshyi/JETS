import type { Metadata } from "next";
import { CheckCircle2, FolderKanban, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { ContentPage } from "@/components/pages/content-page";
import { CreateProjectForm } from "@/components/solution-builder/create-project-form";
import { StatusPill } from "@/components/ui/status-pill";
import { getBuildProjects } from "@/lib/supabase/queries";
import { getAuthContext } from "@/lib/supabase/session";

type OnboardingPageProps = {
  searchParams: Promise<{
    authMessage?: string;
    authStatus?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Onboarding",
  description:
    "Start the signed-in JETS beta workflow by creating a hardware project."
};

function isConfirmedEmailMessage(status?: string, message?: string) {
  return status === "success" && message === "email-confirmed";
}

export default async function OnboardingPage({
  searchParams
}: OnboardingPageProps) {
  const [params, auth, projectsState] = await Promise.all([
    searchParams,
    getAuthContext(),
    getBuildProjects()
  ]);
  const projects = projectsState.data;
  const firstProject = projects.find((project) => project.status === "active") ?? projects[0];
  const hasProjects = projects.length > 0;

  return (
    <ContentPage
      eyebrow="Private beta"
      title="Welcome to JETS"
      description="Start with a hardware project. Search, optimization, snapshots, and audit history are supporting tools around that project."
    >
      {!auth.isConfigured ? (
        <SupabaseSetupState />
      ) : !auth.user ? (
        <SignedOutState
          next="/onboarding"
          title="Sign in to start onboarding"
          description="Create or log in to a JETS account before testing project persistence."
        />
      ) : (
        <div className="grid gap-6">
          {isConfirmedEmailMessage(params.authStatus, params.authMessage) ? (
            <article className="rounded-lg border border-accent/40 bg-accent/10 p-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
                <h2 className="text-lg font-semibold">Email confirmed</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                Your Supabase session is active. You can now create projects,
                save slot selections, and test persistence across sign out and
                sign in.
              </p>
            </article>
          ) : null}

          <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
            <article className="rounded-lg border border-border bg-panel p-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="accent">Signed in</StatusPill>
                <StatusPill>Private beta</StatusPill>
                <StatusPill>Project-first workflow</StatusPill>
              </div>
              <h2 className="mt-5 text-2xl font-semibold">
                {auth.profile?.display_name ?? auth.user.email ?? "JETS tester"}
              </h2>
              <p className="mt-2 text-sm text-muted">{auth.user.email}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {firstProject ? (
                  <Link
                    href={`/solution-builder/projects/${firstProject.id}`}
                    className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    Continue latest project
                  </Link>
                ) : (
                  <Link
                    href="#first-project"
                    className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    Create first project
                  </Link>
                )}
                <Link
                  href="/beta/smoke-test"
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  Run beta smoke test
                </Link>
              </div>
            </article>

            <article className="rounded-lg border border-border bg-panel p-5">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
                <h2 className="text-lg font-semibold">Session check</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">
                Sign out after creating a project, then log back in. Your
                project should still appear on the dashboard.
              </p>
              <div className="mt-5">
                <SignOutButton />
              </div>
            </article>
          </section>

          <section id="first-project" className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div>
              {hasProjects ? (
                <article className="rounded-lg border border-border bg-panel p-5">
                  <div className="flex items-center gap-3">
                    <FolderKanban className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
                    <h2 className="text-lg font-semibold">Your projects</h2>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    You already have {projects.length} persisted project
                    {projects.length === 1 ? "" : "s"}. The next useful beta
                    step is to open one, fill missing slots, then run Optimize.
                  </p>
                  <div className="mt-5 grid gap-3">
                    {projects.slice(0, 3).map((project) => (
                      <Link
                        key={project.id}
                        href={`/solution-builder/projects/${project.id}`}
                        className="rounded-lg border border-border bg-background p-4 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                      >
                        <div className="flex flex-wrap gap-2">
                          <StatusPill tone={project.status === "active" ? "accent" : "neutral"}>
                            {project.status}
                          </StatusPill>
                          <StatusPill>{project.purpose}</StatusPill>
                        </div>
                        <h3 className="mt-3 font-semibold">{project.title}</h3>
                      </Link>
                    ))}
                  </div>
                </article>
              ) : (
                <CreateProjectForm
                  compact
                  heading="Create your first hardware project"
                  submitLabel="Create and open project"
                />
              )}
            </div>

            <article className="rounded-lg border border-border bg-panel p-5">
              <h2 className="text-lg font-semibold">First beta workflow</h2>
              <div className="mt-5 grid gap-3">
                {[
                  "Create a hardware project.",
                  "Open the project and fill at least chassis, CPU, RAM, storage, PSU, and cooling slots.",
                  "Review warnings and completion percentage.",
                  "Run Optimize with one or two unlocked slots.",
                  "Sign out, sign back in, and confirm the project persists."
                ].map((item, index) => (
                  <div key={item} className="flex gap-3 rounded-lg border border-border bg-background p-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-subtle text-xs font-semibold text-muted">
                      {index + 1}
                    </span>
                    <p className="text-sm leading-6 text-muted">{item}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </div>
      )}
    </ContentPage>
  );
}
