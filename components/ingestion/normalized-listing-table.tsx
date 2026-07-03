import { Rows3 } from "lucide-react";

import { EmptyState } from "@/components/states/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { normalizedListingToDecisionCandidate } from "@/lib/decision-engine/adapters";
import { evaluateDecisionCandidate } from "@/lib/decision-engine/scoring";
import { formatMarketplacePrice } from "@/lib/ingestion/dry-run";
import {
  conditionLabels,
  formFactorLabels,
  useCaseLabels
} from "@/types/hardware";
import type { NormalizedListing } from "@/types/ingestion";

type NormalizedListingTableProps = {
  listings: NormalizedListing[];
};

export function NormalizedListingTable({ listings }: NormalizedListingTableProps) {
  if (listings.length === 0) {
    return (
      <article className="rounded-lg border border-border bg-panel p-5">
        <div className="flex items-center gap-2">
          <Rows3 className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Normalized listing sample</h2>
        </div>
        <div className="mt-5">
          <EmptyState
            title="No normalized listings"
            description="The current dry-run report did not return normalized mock listings."
            icon={Rows3}
          />
        </div>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-2">
        <Rows3 className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Normalized listing sample</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">
        Every adapter returns the same shape: source, external ID, normalized
        condition, form factor, use cases, freshness, duplicate key, and risk
        signals.
      </p>

      <div className="mt-5 overflow-hidden rounded-lg border border-border">
        <div className="hidden grid-cols-[1.2fr_2fr_120px_120px_120px_100px] border-b border-border bg-background px-4 py-3 text-xs font-semibold uppercase text-muted lg:grid">
          <span>Source</span>
          <span>Listing</span>
          <span>Price</span>
          <span>Condition</span>
          <span>Freshness</span>
          <span>Decision</span>
        </div>
        <div className="divide-y divide-border">
          {listings.slice(0, 8).map((listing) => {
            const evaluation = evaluateDecisionCandidate(
              normalizedListingToDecisionCandidate(listing)
            );

            return (
              <div
                key={listing.id}
                className="grid gap-3 bg-background p-4 text-sm lg:grid-cols-[1.2fr_2fr_120px_120px_120px_100px] lg:items-center"
              >
                <div>
                  <p className="font-semibold">{listing.sourceName}</p>
                  <p className="mt-1 text-xs text-muted">{listing.externalId}</p>
                </div>
                <div>
                  <p className="font-semibold">{listing.title}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <StatusPill>{formFactorLabels[listing.formFactor]}</StatusPill>
                    {listing.recommendedUseCases.slice(0, 2).map((useCase) => (
                      <StatusPill key={useCase}>
                        {useCaseLabels[useCase]}
                      </StatusPill>
                    ))}
                  </div>
                </div>
                <p className="font-semibold">
                  {formatMarketplacePrice(listing.price, listing.currency)}
                </p>
                <StatusPill tone={listing.condition === "broken" ? "warning" : "neutral"}>
                  {conditionLabels[listing.condition]}
                </StatusPill>
                <StatusPill tone={listing.freshness === "stale" ? "warning" : "accent"}>
                  {listing.freshness}
                </StatusPill>
                <StatusPill tone={evaluation.breakdown.finalScore >= 70 ? "accent" : "warning"}>
                  {evaluation.breakdown.finalScore}
                </StatusPill>
              </div>
            );
          })}
        </div>
      </div>
    </article>
  );
}
