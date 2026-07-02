import { detectDuplicateGroups } from "@/lib/ingestion/duplicates";
import { mockSourceAdapters } from "@/lib/ingestion/adapters";
import type {
  AdapterDryRunResult,
  FreshnessStatus,
  IngestionDryRunReport,
  ListingSourceId,
  MarketplaceCurrency,
  SourceHealthSnapshot
} from "@/types/ingestion";

function countFreshness(
  result: AdapterDryRunResult,
  freshness: FreshnessStatus
) {
  return result.listings.filter((listing) => listing.freshness === freshness).length;
}

function getSourceMessage(result: AdapterDryRunResult) {
  if (result.source.status === "setup-required") {
    return "Setup required before live ingestion. Mock dry runs remain available.";
  }

  if (result.source.status === "paused") {
    return "Paused for live ingestion until compliance review is complete.";
  }

  if (result.warnings.length > 0) {
    return "Dry run completed with warnings to review.";
  }

  return "Dry run completed cleanly.";
}

function buildHealthSnapshot(result: AdapterDryRunResult): SourceHealthSnapshot {
  const rateLimit =
    result.source.rateLimit.maxRequestsPerMinute === 0
      ? "Manual source: no automated requests."
      : `${result.source.rateLimit.maxRequestsPerMinute} request${
          result.source.rateLimit.maxRequestsPerMinute === 1 ? "" : "s"
        }/min with ${result.source.rateLimit.cooldownSeconds}s cooldown.`;

  return {
    agingCount: countFreshness(result, "aging"),
    complianceNotes: result.source.complianceNotes,
    freshCount: countFreshness(result, "fresh"),
    lastObservedAt:
      result.listings
        .map((listing) => listing.lastSeenAt)
        .sort()
        .at(-1) ?? null,
    listingCount: result.listings.length,
    message: getSourceMessage(result),
    rateLimitSummary: `${rateLimit} ${result.source.rateLimit.notes}`,
    source: result.source,
    staleCount: countFreshness(result, "stale"),
    warningCount: result.warnings.length
  };
}

export function formatMarketplacePrice(
  value: number | null,
  currency: MarketplaceCurrency
) {
  if (value === null) {
    return "Price TBD";
  }

  return new Intl.NumberFormat("en-US", {
    currency,
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

export async function runMockIngestionDryRun(
  sourceIds?: ListingSourceId[]
): Promise<IngestionDryRunReport> {
  const now = new Date();
  const selectedAdapters = sourceIds?.length
    ? mockSourceAdapters.filter((adapter) => sourceIds.includes(adapter.source.id))
    : mockSourceAdapters;
  const adapterResults = await Promise.all(
    selectedAdapters.map((adapter) => adapter.dryRun({ now }))
  );
  const listings = adapterResults.flatMap((result) => result.listings);
  const duplicateGroups = detectDuplicateGroups(listings);
  const staleListings = listings.filter(
    (listing) => listing.freshness === "stale"
  ).length;

  return {
    adapterResults,
    duplicateGroups,
    generatedAt: now.toISOString(),
    health: adapterResults.map(buildHealthSnapshot),
    listings,
    mode: "dry-run",
    totals: {
      duplicatesDetected: duplicateGroups.length,
      sourcesChecked: adapterResults.length,
      staleListings,
      totalListings: listings.length,
      warnings: adapterResults.reduce(
        (total, result) => total + result.warnings.length,
        0
      )
    }
  };
}
