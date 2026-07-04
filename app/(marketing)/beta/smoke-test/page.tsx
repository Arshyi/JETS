import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, ClipboardCheck, CircleDashed } from "lucide-react";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { ContentPage } from "@/components/pages/content-page";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getBuildHistory,
  getBuildProjects,
  getBuildSnapshots,
  getDecisionAuditEvents,
  getFavoriteBuilds,
  getSavedBuilds
} from "@/lib/supabase/queries";
import { getAuthContext } from "@/lib/supabase/session";

export const metadata: Metadata = {
  title: "Beta Smoke Test",
  description:
    "Signed-in JETS beta smoke-test checklist for auth, onboarding, projects, and persistence."
};

type SmokeCheck = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  isComplete: boolean;
  title: string;
};

function statusTone(isComplete: boolean) {
  return isComplete ? "accent" : "warning";
}

function statusLabel(isComplete: boolean) {
  return isComplete ? "Passed" : "Needs test";
}

export default async function BetaSmokeTestPage() {
  const [auth, projects, snapshots, activity, savedBuilds, favorites, history] =
    await Promise.all([
      getAuthContext(),
      getBuildProjects(),
      getBuildSnapshots(),
      getDecisionAuditEvents(10),
      getSavedBuilds(),
      getFavoriteBuilds(),
      getBuildHistory()
    ]);
  const activeProjects = projects.data.filter(
    (project) => project.status === "active"
  );
  const latestProject = activeProjects[0] ?? projects.data[0];
  const hasResearchTrail =
    savedBuilds.data.length + favorites.data.length + history.data.length > 0;
  const checks: SmokeCheck[] = [
    {
      actionHref: "/account",
      actionLabel: "Open account",
      description:
        "The app can read the current Supabase session and display the signed-in account.",
      isComplete: Boolean(auth.user),
      title: "Signed-in session"
    },
    {
      actionHref: "/onboarding",
      actionLabel: "Open onboarding",
      description:
        "New users have a project-first landing page after signup or email confirmation.",
      isComplete: Boolean(auth.user),
      title: "Post-auth onboarding"
    },
    {
      actionHref: latestProject
        ? `/solution-builder/projects/${latestProject.id}`
        : "/solution-builder/projects",
      actionLabel: latestProject ? "Open project" : "Create project",
      description:
        "At least one hardware project exists and can be opened after sign out and sign in.",
      isComplete: projects.data.length > 0,
      title: "Project persistence"
    },
    {
      actionHref: latestProject
        ? `/solution-builder/projects/${latestProject.id}/optimize`
        : "/solution-builder/projects",
      actionLabel: latestProject ? "Open optimizer" : "Create project",
      description:
        "The tester can fill slots, run optimization, and preserve branch-safe decisions.",
      isComplete: activity.data.some((event) =>
        event.summary.toLowerCase().includes("optimization")
      ),
      title: "Optimization activity"
    },
    {
      actionHref: "/build-snapshots",
      actionLabel: "Open snapshots",
      description:
        "Generated recommendation snapshots can be saved, renamed, compared, favorited, and restored.",
      isComplete: snapshots.data.length > 0,
      title: "Decision snapshots"
    },
    {
      actionHref: "/activity",
      actionLabel: "Open activity",
      description:
        "Project, snapshot, save, favorite, and history actions create a readable audit trail.",
      isComplete: activity.data.length > 0,
      title: "Audit timeline"
    },
    {
      actionHref: "/saved-builds",
      actionLabel: "Open research",
      description:
        "Saved builds, favorites, and history either show persisted rows or project-first empty states.",
      isComplete: hasResearchTrail,
      title: "Research persistence"
    }
  ];
  const completeCount = checks.filter((check) => check.isComplete).length;

  return (
    <ContentPage
      eyebrow="Private beta"
      title="Signed-In Smoke Test"
      description="Use this checklist after account creation, email confirmation, and login to verify the first authenticated JETS experience."
    >
      {!auth.isConfigured ? (
        <SupabaseSetupState />
      ) : !auth.user ? (
        <SignedOutState
          next="/beta/smoke-test"
          title="Sign in before smoke testing"
          description="The beta smoke test checks Supabase session state and user-owned project persistence."
        />
      ) : (
        <div className="grid gap-6">
          <article className="rounded-lg border border-border bg-panel p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="accent">Signed in</StatusPill>
              <StatusPill>
                {completeCount}/{checks.length} checks passing
              </StatusPill>
              <StatusPill>{auth.user.email}</StatusPill>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
              Run this after signup confirmation, after creating the first
              project, and again after signing out and back in. Any incomplete
              check should point to the next page to test.
            </p>
          </article>

          <div className="grid gap-4 lg:grid-cols-2">
            {checks.map((check) => (
              <article
                key={check.title}
                className="rounded-lg border border-border bg-panel p-5"
              >
                <div className="flex items-start gap-3">
                  {check.isComplete ? (
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 text-accent-strong dark:text-accent"
                      aria-hidden="true"
                    />
                  ) : (
                    <CircleDashed
                      className="mt-0.5 h-5 w-5 text-warning"
                      aria-hidden="true"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{check.title}</h2>
                      <StatusPill tone={statusTone(check.isComplete)}>
                        {statusLabel(check.isComplete)}
                      </StatusPill>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {check.description}
                    </p>
                    {check.actionHref ? (
                      <Link
                        href={check.actionHref}
                        className="mt-4 inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                      >
                        {check.actionLabel}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <article className="rounded-lg border border-border bg-panel p-5">
            <div className="flex items-center gap-3">
              <ClipboardCheck
                className="h-5 w-5 text-accent-strong dark:text-accent"
                aria-hidden="true"
              />
              <h2 className="text-lg font-semibold">Manual pass before sharing</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Sign out, sign back in, and confirm the same project appears.",
                "Confirm email links land on JETS and show a success or clear error message.",
                "Check mobile header navigation and the signed-in status indicator.",
                "Verify missing data pages route testers back to Solution Builder."
              ].map((item) => (
                <p
                  key={item}
                  className="rounded-lg border border-border bg-background p-3 text-sm leading-6 text-muted"
                >
                  {item}
                </p>
              ))}
            </div>
          </article>
        </div>
      )}
    </ContentPage>
  );
}
