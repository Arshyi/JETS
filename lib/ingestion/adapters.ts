import {
  mockAdapterListings,
  mockListingSources
} from "@/data/mock-ingestion";
import { normalizeListing } from "@/lib/ingestion/normalize";
import type {
  IngestionRunContext,
  ListingSourceId,
  SourceAdapter
} from "@/types/ingestion";

function getSeedsForSource(sourceId: ListingSourceId) {
  return mockAdapterListings[sourceId] ?? [];
}

function getSourceWarning(sourceStatus: string, sourceName: string) {
  if (sourceStatus === "setup-required") {
    return `${sourceName} needs credential or policy setup before live ingestion can be considered.`;
  }

  if (sourceStatus === "paused") {
    return `${sourceName} is paused for live ingestion until compliance review is complete.`;
  }

  if (sourceStatus === "degraded") {
    return `${sourceName} should be treated as degraded until health checks improve.`;
  }

  return null;
}

export function getListingSourceById(sourceId: ListingSourceId) {
  return mockListingSources.find((source) => source.id === sourceId) ?? null;
}

export const mockSourceAdapters: SourceAdapter[] = mockListingSources.map(
  (source) => ({
    async dryRun(context: IngestionRunContext) {
      const startedAt = context.now.toISOString();
      const seeds = getSeedsForSource(source.id);
      const listings = seeds.map((seed) =>
        normalizeListing(seed, source, context.now)
      );
      const statusWarning = getSourceWarning(source.status, source.name);
      const staleCount = listings.filter(
        (listing) => listing.freshness === "stale"
      ).length;
      const warnings = [
        statusWarning,
        staleCount > 0
          ? `${staleCount} listing${staleCount === 1 ? "" : "s"} flagged stale.`
          : null
      ].filter((warning): warning is string => Boolean(warning));

      return {
        errors: [],
        finishedAt: new Date(context.now.getTime() + 50).toISOString(),
        listings,
        listingsNormalized: listings.length,
        listingsSeen: seeds.length,
        source,
        startedAt,
        warnings
      };
    },
    source
  })
);

