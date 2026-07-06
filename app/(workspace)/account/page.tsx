import type { Metadata } from "next";
import Link from "next/link";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { AuditTimeline } from "@/components/decision-audit/audit-timeline";
import { ContentPage } from "@/components/pages/content-page";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getBuildProjects,
  getBuildSnapshots,
  getDecisionAuditEvents,
  getFavoriteBuilds,
  getSavedBuilds
} from "@/lib/supabase/queries";
import { getAuthContext } from "@/lib/supabase/session";

export const metadata: Metadata = {
  title: "Account",
  description:
    "JETS account status, onboarding actions, project persistence, and recent decision activity."
};

export default async function AccountPage() {
  const [auth, activity, projects, snapshots, savedBuilds, favorites] =
    await Promise.all([
      getAuthContext(),
      getDecisionAuditEvents(5),
      getBuildProjects(),
      getBuildSnapshots(),
      getSavedBuilds(),
      getFavoriteBuilds()
    ]);
  const activeProjects = projects.data.filter(
    (project) => project.status === "active"
  );
  const latestProject = activeProjects[0] ?? projects.data[0];

  return (
    <ContentPage
      eyebrow="Private beta"
      title="Account"
      description="Your signed-in JETS control panel for onboarding, projects, persistence checks, and beta validation."
    >
      {!auth.isConfigured ? (
        <div className="grid gap-6">
          <SupabaseSetupState />
          <article className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">Private beta setup path</h2>
            <div className="mt-4 grid gap-2 text-sm text-muted">
              <code className="rounded-lg border border-border bg-background px-3 py-2">
                NEXT_PUBLIC_SUPABASE_URL
              </code>
              <code className="rounded-lg border border-border bg-background px-3 py-2">
                NEXT_PUBLIC_SUPABASE_ANON_KEY
              </code>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              After adding them, apply the Supabase migrations in order, restart
              the dev server, and use the beta setup checklist before testing
              persistence.
            </p>
            <div className="mt-5">
              <Link
                href="/beta/setup"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Open setup checklist
              </Link>
            </div>
          </article>
        </div>
      ) : auth.user ? (
        <div className="grid gap-6">
          <article className="rounded-lg border border-border bg-panel p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="accent">Signed in</StatusPill>
              <StatusPill>Supabase Auth</StatusPill>
              <StatusPill>Private beta</StatusPill>
            </div>
            <h2 className="mt-5 text-2xl font-semibold">
              {auth.profile?.display_name ?? auth.user.email ?? "JETS user"}
            </h2>
            <p className="mt-2 text-sm text-muted">{auth.user.email}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href={
                  latestProject
                    ? `/solution-builder/projects/${latestProject.id}`
                    : "/onboarding"
                }
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                {latestProject ? "Continue hardware project" : "Start onboarding"}
              </Link>
              <Link
                href="/solution-builder/projects"
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Project dashboard
              </Link>
              <Link
                href="/beta/smoke-test"
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Beta smoke test
              </Link>
              <Link
                href="/evidence"
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Evidence review
              </Link>
            </div>
          </article>

          <section className="grid gap-4 lg:grid-cols-4">
            {[
              ["Hardware projects", projects.data.length, "/solution-builder/projects"],
              ["Active projects", activeProjects.length, "/solution-builder/projects"],
              ["Decision snapshots", snapshots.data.length, "/build-snapshots"],
              [
                "Saved research",
                savedBuilds.data.length + favorites.data.length,
                "/saved-builds"
              ]
            ].map(([label, value, href]) => (
              <Link
                key={label}
                href={String(href)}
                className="rounded-lg border border-border bg-panel p-5 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                <p className="text-sm font-semibold text-muted">{label}</p>
                <p className="mt-3 text-3xl font-bold">{value}</p>
              </Link>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {latestProject ? (
              <article className="rounded-lg border border-border bg-panel p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill
                    tone={latestProject.status === "active" ? "accent" : "neutral"}
                  >
                    {latestProject.status}
                  </StatusPill>
                  <StatusPill>{latestProject.purpose}</StatusPill>
                  <StatusPill>{latestProject.currency}</StatusPill>
                </div>
                <h2 className="mt-4 text-xl font-semibold">
                  {latestProject.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted">
                  This is the current center of the signed-in beta workflow.
                  Open it, fill missing slots, run Optimize, and confirm changes
                  persist after sign out and sign in.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/solution-builder/projects/${latestProject.id}`}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    Open project
                  </Link>
                  <Link
                    href={`/solution-builder/projects/${latestProject.id}/optimize`}
                    className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    Optimize
                  </Link>
                </div>
              </article>
            ) : (
              <article className="rounded-lg border border-border bg-panel p-5">
                <h2 className="text-lg font-semibold">
                  Create your first hardware project
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  Start with the hardware goal. JETS will create the project,
                  choose a scoring preset, and open the builder.
                </p>
                <Link
                  href="/solution-builder/projects/new"
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  Choose project goal
                </Link>
              </article>
            )}

            <article className="rounded-lg border border-border bg-panel p-5">
              <h2 className="text-lg font-semibold">Session</h2>
              <p className="mt-3 text-sm leading-6 text-muted">
                Use this during beta testing to confirm project persistence
                survives sign out and sign in.
              </p>
              <div className="mt-5 grid gap-2">
                <SignOutButton />
                <Link
                  href="/settings"
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  Settings
                </Link>
              </div>
            </article>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Recent activity</h2>
              <Link
                href="/activity"
                className="text-sm font-semibold text-accent-strong transition hover:text-foreground dark:text-accent"
              >
                View all
              </Link>
            </div>
            <AuditTimeline compact events={activity.data} />
          </section>
        </div>
      ) : (
        <SignedOutState
          next="/account"
          title="No active session"
          description="Log in or create an account to start onboarding, create projects, and test persistence."
        />
      )}
    </ContentPage>
  );
}
