import type { Metadata } from "next";

import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HeroSection } from "@/components/marketing/hero-section";

export const metadata: Metadata = {
  title: "Private Beta Hardware Decisions",
  description:
    "JETS private beta for deterministic used-hardware search, build generation, snapshots, and audit trails."
};

export default function HomePage() {
  return (
    <main>
      <HeroSection />
      <FeatureGrid />
      <section className="bg-background py-16">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.8fr_1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
              Product discipline
            </p>
            <h2 className="mt-3 text-3xl font-bold">Ideas have a home before they become code.</h2>
          </div>
          <div className="rounded-lg border border-border bg-panel p-6">
            <p className="text-base leading-8 text-muted">
              The project starts with docs/vision.md so bigger concepts can be captured
              without being smuggled into the current milestone. Accounts,
              scraping, and the decision engine still wait for their own layers.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
