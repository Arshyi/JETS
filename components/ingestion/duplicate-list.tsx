import { CopyCheck } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import { formatMarketplacePrice } from "@/lib/ingestion/dry-run";
import type { DuplicateGroup } from "@/types/ingestion";

type DuplicateListProps = {
  duplicateGroups: DuplicateGroup[];
};

export function DuplicateList({ duplicateGroups }: DuplicateListProps) {
  if (duplicateGroups.length === 0) {
    return (
      <article className="rounded-lg border border-border bg-panel p-5">
        <div className="flex items-center gap-2">
          <CopyCheck className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
          <h2 className="text-lg font-semibold">Duplicate candidates</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">
          The current dry run did not identify duplicate listing candidates.
        </p>
      </article>
    );
  }

  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-2">
        <CopyCheck className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Duplicate candidates</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">
        These are inspection hints only. Future ingestion should keep the source
        records and attach merge decisions separately.
      </p>

      <div className="mt-5 grid gap-4">
        {duplicateGroups.map((group) => (
          <div key={group.id} className="rounded-lg border border-border bg-background p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold">{group.canonicalTitle}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{group.reason}</p>
              </div>
              <StatusPill tone={group.confidence >= 70 ? "accent" : "warning"}>
                {group.confidence}% confidence
              </StatusPill>
            </div>

            <div className="mt-4 grid gap-3">
              {group.listings.map((listing) => (
                <div
                  key={listing.id}
                  className="grid gap-2 rounded-lg border border-border bg-panel p-3 text-sm md:grid-cols-[1fr_140px_120px]"
                >
                  <div>
                    <p className="font-semibold">{listing.title}</p>
                    <p className="mt-1 text-muted">
                      {listing.sourceName} - {listing.location}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatMarketplacePrice(listing.price, listing.currency)}
                  </p>
                  <StatusPill tone={listing.freshness === "stale" ? "warning" : "neutral"}>
                    {listing.freshness}
                  </StatusPill>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}
