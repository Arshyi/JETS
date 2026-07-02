import { ListChecks } from "lucide-react";

import { ScoreMeter } from "@/components/search/score-meter";
import { StatusPill } from "@/components/ui/status-pill";
import type { DecisionEvaluation } from "@/types/decision";

type ScoreBreakdownProps = {
  evaluation: DecisionEvaluation;
};

const scoreRows = [
  ["Performance", "performance"],
  ["Value", "value"],
  ["Reliability", "reliability"],
  ["Risk control", "risk"],
  ["Freshness", "freshness"],
  ["Upgrade potential", "upgradePotential"],
  ["Aesthetics", "aesthetics"],
  ["Use-case fit", "useCaseFit"]
] as const;

export function ScoreBreakdown({ evaluation }: ScoreBreakdownProps) {
  return (
    <section className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold">Decision score</h3>
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            {evaluation.explanation.summary}
          </p>
        </div>
        <div className="rounded-lg bg-accent/10 px-4 py-3 text-center">
          <p className="text-xs font-semibold uppercase text-muted">Final</p>
          <p className="mt-1 text-3xl font-bold text-accent-strong dark:text-accent">
            {evaluation.breakdown.finalScore}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {scoreRows.map(([label, key]) => (
          <ScoreMeter
            key={key}
            label={label}
            value={evaluation.breakdown[key]}
            tone={key === "risk" && evaluation.breakdown[key] < 55 ? "warning" : "accent"}
          />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusPill>{evaluation.preset.label} preset</StatusPill>
        <StatusPill>{evaluation.weightClass}</StatusPill>
        <StatusPill tone={evaluation.breakdown.shippingPenalty >= 20 ? "warning" : "neutral"}>
          Shipping penalty {evaluation.breakdown.shippingPenalty}
        </StatusPill>
      </div>
    </section>
  );
}
