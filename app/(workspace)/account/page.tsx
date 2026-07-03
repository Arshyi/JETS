import type { Metadata } from "next";
import Link from "next/link";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { AuditTimeline } from "@/components/decision-audit/audit-timeline";
import { ContentPage } from "@/components/pages/content-page";
import { StatusPill } from "@/components/ui/status-pill";
import { getDecisionAuditEvents } from "@/lib/supabase/queries";
import { getAuthContext } from "@/lib/supabase/session";

export const metadata: Metadata = {
  title: "Account",
  description: "JETS account status, Supabase setup state, and recent decision activity."
};

export default async function AccountPage() {
  const [auth, activity] = await Promise.all([
    getAuthContext(),
    getDecisionAuditEvents(5)
  ]);

  return (
    <ContentPage
      eyebrow="Version 0.9"
      title="Account"
      description="Supabase-backed account status, persistence, and recent decision activity."
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
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <article className="rounded-lg border border-border bg-panel p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone="accent">Signed in</StatusPill>
              <StatusPill>Supabase Auth</StatusPill>
            </div>
            <h2 className="mt-5 text-2xl font-semibold">
              {auth.profile?.display_name ?? auth.user.email ?? "JETS user"}
            </h2>
            <p className="mt-2 text-sm text-muted">{auth.user.email}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/saved-builds"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Saved builds
              </Link>
              <Link
                href="/activity"
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Activity
              </Link>
              <Link
                href="/settings"
                className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Settings
              </Link>
            </div>
          </article>

          <article className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">Session</h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              Signing out clears the Supabase session cookies managed by the SSR
              client.
            </p>
            <div className="mt-5">
              <SignOutButton />
            </div>
          </article>

          <section className="lg:col-span-2">
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
          description="Log in or create an account to persist saved builds, favorites, history, and settings."
        />
      )}
    </ContentPage>
  );
}
