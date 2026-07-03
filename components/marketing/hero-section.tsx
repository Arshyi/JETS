import { Archive, Search } from "lucide-react";
import Link from "next/link";

import { DecisionPreview } from "@/components/marketing/decision-preview";

export function HeroSection() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
            Version 0.8: saved decision snapshots
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            JETS
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            Just Enough Tech Solutions is becoming an AI-assisted decision engine
            for used hardware. This version preserves Build Generator decisions
            as restorable, comparable snapshots with timestamps, score history,
            and recommendation outcomes, without live scraping, checkout, or AI.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/build-snapshots"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
              View Snapshots
            </Link>
            <Link
              href="/build-generator"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Open Generator
              <Search className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <DecisionPreview />
      </div>
    </section>
  );
}
