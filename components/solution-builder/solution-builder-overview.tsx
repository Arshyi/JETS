import { Boxes, DraftingCompass } from "lucide-react";
import Link from "next/link";

import { ContentPage } from "@/components/pages/content-page";
import { solutionBuilderModes } from "@/data/solution-builder";
import type { SolutionBuilderServiceDependency } from "@/types/solution-builder";

type SolutionBuilderOverviewProps = {
  services: SolutionBuilderServiceDependency[];
};

const modeIcons = {
  "build-my-own": DraftingCompass,
  "let-jets-recommend": Boxes
} as const;

export function SolutionBuilderOverview({ services }: SolutionBuilderOverviewProps) {
  return (
    <ContentPage
      eyebrow="Version 2.0"
      title="Hardware Solution Builder"
      description="JETS starts with a project. Create a goal-first builder workspace, fill slots through contextual inventory, validate the build, then optimize or branch scenarios."
    >
      <div className="grid gap-6">
        <section className="rounded-lg border border-border bg-panel p-6">
          <h2 className="text-2xl font-bold">Start with a project</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            The builder is the home of the workflow. Inventory, validation,
            optimization, branches, comparisons, snapshots, and activity support
            the project rather than competing as separate starting points.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/solution-builder/projects/new"
              className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Create project
            </Link>
            <Link
              href="/solution-builder/projects"
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Open projects
            </Link>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-2">
          {solutionBuilderModes.map((mode) => {
            const Icon = modeIcons[mode.id];

            return (
              <Link
                key={mode.id}
                href={mode.href}
                className="rounded-lg border border-border bg-panel p-6 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                <Icon className="h-6 w-6 text-accent-strong dark:text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-2xl font-bold">{mode.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">{mode.description}</p>
              </Link>
            );
          })}
        </div>

        <section className="rounded-lg border border-border bg-panel p-5">
          <h2 className="text-lg font-semibold">Secondary services</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <Link
                key={service.name}
                href={service.href}
                className="rounded-lg border border-border bg-background p-4 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                <h3 className="text-sm font-semibold">{service.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{service.role}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </ContentPage>
  );
}
