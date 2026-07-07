import type { Metadata } from "next";

import { HomeGoalGrid } from "@/components/marketing/home-goal-grid";
import { getBuildProjects } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "What Hardware Are You Evaluating?",
  description:
    "JETS helps users capture hardware listings, normalize facts, review evidence, compare strategies, and turn promising acquisitions into project-centered builds."
};

export default async function HomePage() {
  const projects = await getBuildProjects();
  const recentProject = projects.isSignedIn
    ? projects.data.find((project) => project.status === "active") ?? projects.data[0]
    : null;

  return (
    <main>
      <HomeGoalGrid
        recentProjectHref={
          recentProject ? `/solution-builder/projects/${recentProject.id}` : null
        }
      />
      <section className="bg-background py-14">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[0.8fr_1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
              Workflow discipline
            </p>
            <h2 className="mt-3 text-3xl font-bold">
              Acquisition is now the front door.
            </h2>
          </div>
          <div className="rounded-lg border border-border bg-panel p-6">
            <p className="text-base leading-8 text-muted">
              JETS currently uses manual capture, mock/demo inventory, and
              deterministic validation. Live ingestion and scraping are not
              active. The practical loop is: capture a listing, normalize it,
              verify evidence, compare strategy paths, then create or update a
              project only when the hardware is worth pursuing.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
