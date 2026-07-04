import { Gauge } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import type { PlatformKnowledgeInsight } from "@/types/platform-knowledge";

type PlatformKnowledgeSummaryProps = {
  insight: PlatformKnowledgeInsight | null;
};

export function PlatformKnowledgeSummary({
  insight
}: PlatformKnowledgeSummaryProps) {
  if (!insight) {
    return (
      <div className="rounded-lg border border-border bg-background p-4">
        <p className="text-sm font-semibold">Platform knowledge</p>
        <p className="mt-2 text-sm leading-6 text-muted">
          Choose a recognized base system or motherboard to unlock platform
          potential, quirks, and upgrade paths.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent-strong dark:text-accent">
          <Gauge className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold">Platform knowledge</p>
          <h3 className="mt-2 text-base font-semibold">{insight.platformName}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{insight.summary}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <StatusPill tone="accent">
          Potential {insight.potentialScore}
        </StatusPill>
        <StatusPill>{insight.opportunityCount} opportunities</StatusPill>
        <StatusPill>{insight.constraintCount} constraints</StatusPill>
        <StatusPill>{insight.adapterCount} adapters</StatusPill>
      </div>
    </div>
  );
}
