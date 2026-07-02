import { CircleAlert, Lightbulb } from "lucide-react";

import type { DecisionExplanation } from "@/types/decision";

type WhyThisRanksProps = {
  explanation: DecisionExplanation;
};

export function WhyThisRanks({ explanation }: WhyThisRanksProps) {
  return (
    <section className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h3 className="text-sm font-semibold">Why this ranks</h3>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Strengths</p>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
            {(explanation.positives.length > 0
              ? explanation.positives
              : ["Balanced enough to remain in the ranked set for this preset."]
            ).map((positive) => (
              <li key={positive}>{positive}</li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <CircleAlert className="h-4 w-4 text-warning" aria-hidden="true" />
            <p className="text-xs font-semibold uppercase text-muted">Cautions</p>
          </div>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
            {(explanation.cautions.length > 0
              ? explanation.cautions
              : ["No major deterministic caution was triggered by the current mock data."]
            ).map((caution) => (
              <li key={caution}>{caution}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
