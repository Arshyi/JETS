import { FlaskConical } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import type { getCompatibilityValidationResults } from "@/data/compatibility/validation-fixtures";

type CompatibilityValidationListProps = {
  results: ReturnType<typeof getCompatibilityValidationResults>;
};

export function CompatibilityValidationList({
  results
}: CompatibilityValidationListProps) {
  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-2">
        <FlaskConical className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Deterministic fixtures</h2>
      </div>

      <div className="mt-5 grid gap-3">
        {results.map((fixture) => (
          <div
            key={fixture.name}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h3 className="text-sm font-semibold">{fixture.name}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{fixture.reason}</p>
              </div>
              <StatusPill tone={fixture.passed ? "accent" : "warning"}>
                {fixture.passed ? "passed" : "review"}
              </StatusPill>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {fixture.expectedResults.map((expected) => (
                <StatusPill
                  key={`${fixture.name}-${expected.ruleId}`}
                  tone={expected.passed ? "accent" : "warning"}
                >
                  {expected.ruleId}: {expected.actualStatus}
                </StatusPill>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
