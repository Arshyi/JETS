import type { Metadata } from "next";
import Link from "next/link";
import { Database, ListChecks } from "lucide-react";

import { ContentPage } from "@/components/pages/content-page";
import { StatusPill } from "@/components/ui/status-pill";
import { betaDemoWorkflow, betaSmokeTests } from "@/data/beta";
import { mockHardwareListings } from "@/data/mock-listings";
import { mockListingSources } from "@/data/mock-ingestion";

export const metadata: Metadata = {
  title: "Beta Demo Data",
  description:
    "Seeded mock data and demo workflow for validating the JETS private beta."
};

export default function BetaDemoDataPage() {
  return (
    <ContentPage
      eyebrow="Private beta"
      title="Demo Data Workflow"
      description="A stable walkthrough for beta testers using current mock/demo inventory, dry-run source data, and Supabase-backed user records."
    >
      <div className="grid gap-6">
        <article className="rounded-lg border border-border bg-panel p-5">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Seeded local data</h2>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase text-muted">Mock inventory listings</p>
              <p className="mt-2 text-2xl font-bold">{mockHardwareListings.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase text-muted">Mock sources</p>
              <p className="mt-2 text-2xl font-bold">{mockListingSources.length}</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase text-muted">Persistence</p>
              <p className="mt-2 text-sm font-semibold">User-created</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase text-muted">Live scraping</p>
              <p className="mt-2 text-sm font-semibold">Disabled</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-6 text-muted">
            The app does not seed production user rows automatically. Beta testers
            create saved builds, favorites, snapshots, notes, and audit events by
            walking through the product flow below.
          </p>
        </article>

        <article className="rounded-lg border border-border bg-panel p-5">
          <div className="flex items-center gap-3">
            <ListChecks className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Demo flow</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {betaDemoWorkflow.map((item, index) => (
              <div key={item.title} className="rounded-lg border border-border bg-background p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill>{index + 1}</StatusPill>
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-border bg-panel p-5">
          <h2 className="text-lg font-semibold">Smoke-test checklist</h2>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted">
            {betaSmokeTests.map((test) => (
              <li key={test}>{test}</li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/inventory"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Open Inventory
            </Link>
            <Link
              href="/build-generator"
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Open Generator
            </Link>
          </div>
        </article>
      </div>
    </ContentPage>
  );
}
