import type { Metadata } from "next";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardCheck,
  Database,
  MessageSquare,
  Rocket
} from "lucide-react";

import { ContentPage } from "@/components/pages/content-page";
import { betaDemoWorkflow, betaSetupChecklist, betaSmokeTests } from "@/data/beta";

export const metadata: Metadata = {
  title: "Private Beta",
  description:
    "Private beta onboarding for JETS, including setup, demo workflow, and smoke-test guidance."
};

const betaCards = [
  {
    title: "Setup",
    description: "Confirm Supabase environment variables, migrations, and local verification.",
    href: "/beta/setup",
    icon: CheckCircle2
  },
  {
    title: "Demo data",
    description: "Walk through the seeded mock listings, snapshots, audit events, and dry-run sources.",
    href: "/beta/demo-data",
    icon: Database
  },
  {
    title: "Smoke test",
    description: "Validate the signed-in onboarding, project, persistence, and audit paths.",
    href: "/beta/smoke-test",
    icon: ClipboardCheck
  },
  {
    title: "Feedback",
    description: "Capture beta feedback without adding a production support backend yet.",
    href: "/feedback",
    icon: MessageSquare
  }
];

export default function BetaOnboardingPage() {
  return (
    <ContentPage
      eyebrow="Version 1.0"
      title="Private Beta Onboarding"
      description="A focused starting point for validating the current deterministic JETS workflow with a small beta group."
    >
      <div className="grid gap-6">
        <article className="rounded-lg border border-border bg-panel p-5">
          <div className="flex items-center gap-3">
            <Rocket className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Beta scope</h2>
          </div>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-muted">
            JETS v1.0 is for testing the existing local mock search, deterministic
            Build Generator, saved snapshots, audit trail, auth, and dry-run
            ingestion foundation. It intentionally does not include AI, live
            scraping, checkout, or production marketplace data.
          </p>
        </article>

        <div className="grid gap-4 lg:grid-cols-4">
          {betaCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.href}
                href={card.href}
                className="rounded-lg border border-border bg-panel p-5 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                <Icon className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
                <h2 className="mt-4 text-lg font-semibold">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{card.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <article className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">Setup snapshot</h2>
            <p className="mt-3 text-sm text-muted">
              {betaSetupChecklist.length} setup checks before a beta session.
            </p>
          </article>
          <article className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">Demo workflow</h2>
            <p className="mt-3 text-sm text-muted">
              {betaDemoWorkflow.length} guided steps using local mock data.
            </p>
          </article>
          <article className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">Smoke tests</h2>
            <p className="mt-3 text-sm text-muted">
              {betaSmokeTests.length} checks for each beta build.
            </p>
          </article>
        </div>
      </div>
    </ContentPage>
  );
}
