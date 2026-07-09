import { ChevronDown, Link2, Network } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import { getReasoningPathExplanationsForIds } from "@/lib/reasoning-graph/engine";
import { cn } from "@/lib/utils";

type ReasoningPathPanelProps = {
  className?: string;
  defaultOpen?: boolean;
  description?: string;
  maxPaths?: number;
  pathIds: string[];
  title?: string;
};

function averageConfidence(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(
    values.reduce((total, value) => total + value, 0) / values.length
  );
}

export function ReasoningPathPanel({
  className,
  defaultOpen,
  description,
  maxPaths = 2,
  pathIds,
  title = "Why JETS thinks this"
}: ReasoningPathPanelProps) {
  const explanations = getReasoningPathExplanationsForIds(pathIds).slice(
    0,
    maxPaths
  );

  if (explanations.length === 0) {
    return null;
  }

  const confidence = averageConfidence(
    explanations.map((explanation) => explanation.confidence)
  );

  return (
    <details
      className={cn("group border-t border-border pt-4", className)}
      open={defaultOpen}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold">
        <span className="flex items-center gap-2">
          <Network className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
          {title}
        </span>
        <span className="flex items-center gap-2">
          <StatusPill>{explanations.length} path{explanations.length === 1 ? "" : "s"}</StatusPill>
          <StatusPill>{confidence}% confidence</StatusPill>
          <ChevronDown className="h-4 w-4 text-muted transition group-open:rotate-180" aria-hidden="true" />
        </span>
      </summary>

      {description ? (
        <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
      ) : null}

      <div className="mt-4 grid gap-4">
        {explanations.map((explanation) => (
          <div key={explanation.id} className="grid gap-3 rounded-md bg-subtle p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold">{explanation.title}</p>
              <StatusPill>{explanation.confidence}% confidence</StatusPill>
            </div>

            <div className="grid gap-2 text-xs text-muted">
              {explanation.steps.map((step, index) => (
                <div
                  key={step.edgeId}
                  className="grid gap-1 rounded-md border border-border bg-background px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {explanation.nodeLabels[index]}
                    </span>
                    <span>{step.relationshipLabel}</span>
                    <span className="font-semibold text-foreground">
                      {explanation.nodeLabels[index + 1]}
                    </span>
                  </div>
                  <p className="leading-5">{step.reason}</p>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill>{step.confidence}% edge confidence</StatusPill>
                    {step.evidenceIds.length > 0 ? (
                      step.evidenceIds.slice(0, 3).map((evidenceId) => (
                        <a
                          key={evidenceId}
                          href={`/evidence/${encodeURIComponent(evidenceId)}`}
                          className="inline-flex items-center gap-1 rounded-full border border-border bg-panel px-2.5 py-1 text-xs font-medium text-muted transition hover:text-foreground"
                        >
                          <Link2 className="h-3 w-3" aria-hidden="true" />
                          {evidenceId}
                        </a>
                      ))
                    ) : (
                      <StatusPill>Graph rule, evidence link pending</StatusPill>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-sm leading-6 text-muted">
              {explanation.plainEnglish}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}
