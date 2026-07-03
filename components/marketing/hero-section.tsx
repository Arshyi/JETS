import { ClipboardCheck, DraftingCompass } from "lucide-react";
import Link from "next/link";

import { DecisionPreview } from "@/components/marketing/decision-preview";

export function HeroSection() {
  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_0.9fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
            Version 2.0: solution builder foundation
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
            JETS
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            Just Enough Tech Solutions is becoming a hardware solution builder.
            Users can compose a build by hardware slots or let JETS recommend
            complete solution paths from budget, purpose, preferences, and owned
            hardware.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/solution-builder"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              <DraftingCompass className="h-4 w-4" aria-hidden="true" />
              Open Solution Builder
            </Link>
            <Link
              href="/beta"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-panel px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Beta Checklist
              <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <DecisionPreview />
      </div>
    </section>
  );
}
