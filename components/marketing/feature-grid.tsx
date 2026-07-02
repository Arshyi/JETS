import { GitCompare, ListChecks, SearchCheck, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { featureCards } from "@/config/site";
import type { FeatureIcon } from "@/types/navigation";

const icons: Record<FeatureIcon, LucideIcon> = {
  search: SearchCheck,
  ranking: ListChecks,
  compatibility: GitCompare,
  guardrails: ShieldCheck
};

export function FeatureGrid() {
  return (
    <section className="bg-panel py-16">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
            Foundation choices
          </p>
          <h2 className="mt-3 text-3xl font-bold">Built to grow without rushing.</h2>
          <p className="mt-4 text-base leading-7 text-muted">
            Each milestone adds one durable layer while leaving expensive systems
            out until their surrounding product workflows are ready.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = icons[feature.icon];

            return (
              <article
                key={feature.title}
                className="rounded-lg border border-border bg-background p-5"
              >
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent-strong dark:text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
