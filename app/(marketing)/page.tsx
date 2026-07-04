import type { Metadata } from "next";

import { FeatureGrid } from "@/components/marketing/feature-grid";
import { HeroSection } from "@/components/marketing/hero-section";

export const metadata: Metadata = {
  title: "Hardware Solution Builder",
  description:
    "JETS Hardware Solution Builder for planning, validating, recommending, and comparing complete used-hardware solutions."
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
            <h2 className="mt-3 text-3xl font-bold">Inventory supports projects.</h2>
          </div>
          <div className="rounded-lg border border-border bg-panel p-6">
            <p className="text-base leading-8 text-muted">
              JETS currently uses mock/demo inventory for components, base
              systems, adapters, and complete systems. Live ingestion and
              scraping are planned, but not active; the product center is
              Solution Builder projects.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
