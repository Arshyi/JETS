import { ClipboardCheck } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import type { CompatibilityReport, CompatibilityStatus } from "@/types/compatibility";

type CompatibilityResultListProps = {
  report: CompatibilityReport;
};

const statusTone: Record<CompatibilityStatus, "accent" | "neutral" | "warning"> = {
  Compatible: "accent",
  "Compatible with Warning": "warning",
  Incompatible: "warning"
};

export function CompatibilityResultList({ report }: CompatibilityResultListProps) {
  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-2">
        <ClipboardCheck className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Rule results</h2>
      </div>

      <div className="mt-5 grid gap-3">
        {report.results.map((result) => (
          <div
            key={result.ruleId}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold">{result.category}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{result.reason}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusPill tone={statusTone[result.status]}>{result.status}</StatusPill>
                <StatusPill>{result.confidence}%</StatusPill>
                {result.score === undefined ? null : (
                  <StatusPill>{result.score}/100</StatusPill>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
