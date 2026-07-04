import { Lightbulb } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import type { PlatformUpgradeOpportunity } from "@/types/platform-knowledge";

type UpgradeOpportunityCardProps = {
  opportunity: PlatformUpgradeOpportunity;
};

export function UpgradeOpportunityCard({
  opportunity
}: UpgradeOpportunityCardProps) {
  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent-strong dark:text-accent">
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="accent">
              {opportunity.type.replaceAll("-", " ")}
            </StatusPill>
            <StatusPill>{opportunity.difficulty}</StatusPill>
            <StatusPill>{opportunity.confidence} confidence</StatusPill>
          </div>
          <h3 className="mt-3 text-base font-semibold">{opportunity.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            {opportunity.summary}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-panel px-3 py-2">
          <p className="text-xs font-semibold uppercase text-muted">Cost</p>
          <p className="mt-1 font-semibold">${opportunity.estimatedCostUsd}</p>
        </div>
        <div className="rounded-lg border border-border bg-panel px-3 py-2">
          <p className="text-xs font-semibold uppercase text-muted">Benefit</p>
          <p className="mt-1 font-semibold">
            {opportunity.expectedBenefitRating}/5
          </p>
        </div>
        <div className="rounded-lg border border-border bg-panel px-3 py-2">
          <p className="text-xs font-semibold uppercase text-muted">Slots</p>
          <p className="mt-1 truncate font-semibold">
            {opportunity.recommendedSlotIds?.join(", ") ?? "platform"}
          </p>
        </div>
      </div>

      {opportunity.improvements ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(opportunity.improvements).map(([label, value]) => (
            <StatusPill key={label}>
              {label}: {value}
            </StatusPill>
          ))}
        </div>
      ) : null}
    </article>
  );
}
