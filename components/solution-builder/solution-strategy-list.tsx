import { Route } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import type { SolutionStrategyDefinition } from "@/types/solution-builder";

type SolutionStrategyListProps = {
  strategies: SolutionStrategyDefinition[];
};

const stageTone: Record<SolutionStrategyDefinition["stage"], "accent" | "neutral" | "warning"> = {
  active: "accent",
  foundation: "warning",
  planned: "neutral"
};

export function SolutionStrategyList({ strategies }: SolutionStrategyListProps) {
  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-3">
        <Route className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Solution strategies</h2>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {strategies.map((strategy) => (
          <article key={strategy.id} className="rounded-lg border border-border bg-background p-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusPill tone={stageTone[strategy.stage]}>{strategy.stage}</StatusPill>
              <StatusPill>{strategy.serviceDependencies.length} services</StatusPill>
            </div>
            <h3 className="mt-3 text-lg font-semibold">{strategy.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{strategy.description}</p>
            <ul className="mt-3 grid gap-1 text-sm text-muted">
              {strategy.tradeoffs.map((tradeoff) => (
                <li key={tradeoff}>{tradeoff}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
