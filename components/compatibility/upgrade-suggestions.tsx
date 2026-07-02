import { Wrench } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import type { CompatibilitySeverity, UpgradeSuggestion } from "@/types/compatibility";

type UpgradeSuggestionsProps = {
  suggestions: UpgradeSuggestion[];
};

const priorityTone: Record<CompatibilitySeverity, "accent" | "neutral" | "warning"> = {
  high: "warning",
  low: "neutral",
  medium: "warning"
};

export function UpgradeSuggestions({ suggestions }: UpgradeSuggestionsProps) {
  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Upgrade suggestions</h2>
      </div>

      {suggestions.length === 0 ? (
        <p className="mt-3 text-sm leading-6 text-muted">
          No blocking upgrade suggestions were produced by the current rule set.
        </p>
      ) : (
        <div className="mt-5 grid gap-3">
          {suggestions.map((suggestion) => (
            <div
              key={`${suggestion.title}-${suggestion.reason}`}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold">{suggestion.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {suggestion.reason}
                  </p>
                </div>
                <StatusPill tone={priorityTone[suggestion.priority]}>
                  {suggestion.priority}
                </StatusPill>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
