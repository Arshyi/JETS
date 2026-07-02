"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { formatMarketplacePrice, runMockIngestionDryRun } from "@/lib/ingestion/dry-run";
import { getAdminGate } from "@/lib/supabase/admin";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import type { Json } from "@/types/database";
import { listingSourceIds } from "@/types/ingestion";
import type { IngestionDryRunReport, ListingSourceId } from "@/types/ingestion";

function parseSourceId(formData: FormData): ListingSourceId[] | undefined {
  const sourceId = formData.get("sourceId");

  if (typeof sourceId !== "string" || sourceId === "all") {
    return undefined;
  }

  return listingSourceIds.includes(sourceId as ListingSourceId)
    ? [sourceId as ListingSourceId]
    : undefined;
}

function getDuplicateCountForSource(
  report: IngestionDryRunReport,
  sourceId: ListingSourceId
) {
  return report.duplicateGroups.filter((group) =>
    group.listings.some((listing) => listing.id.startsWith(`${sourceId}:`))
  ).length;
}

export async function runIngestionDryRunAction(formData: FormData) {
  const gate = await getAdminGate();

  if (!gate.isAllowed) {
    redirect("/admin/ingestion");
  }

  const report = await runMockIngestionDryRun(parseSourceId(formData));
  const supabase = createSupabaseServiceRoleClient();

  if (supabase) {
    await supabase.from("listing_sources").upsert(
      report.adapterResults.map((result) => ({
        adapter_mode: result.source.adapterMode,
        base_url: result.source.baseUrl,
        compliance_notes: result.source.complianceNotes,
        enabled: result.source.enabled,
        id: result.source.id,
        kind: result.source.kind,
        location_scope: result.source.locationScope,
        name: result.source.name,
        rate_limit_notes: `${result.source.rateLimit.maxRequestsPerMinute} rpm, ${result.source.rateLimit.cooldownSeconds}s cooldown. ${result.source.rateLimit.notes}`,
        status: result.source.status
      })),
      {
        onConflict: "id"
      }
    );

    await supabase.from("ingested_listings").upsert(
      report.listings.map((listing) => ({
        category: listing.category,
        condition: listing.condition,
        currency: listing.currency,
        description: listing.description,
        duplicate_key: listing.duplicateKey,
        external_id: listing.externalId,
        first_seen_at: listing.firstSeenAt,
        form_factor: listing.formFactor,
        freshness_status: listing.freshness,
        last_seen_at: listing.lastSeenAt,
        listing_url: listing.listingUrl,
        location: listing.location,
        price: listing.price,
        raw_payload: listing as unknown as Json,
        recommended_use_cases: listing.recommendedUseCases,
        risk_signals: listing.riskSignals,
        seller_name: listing.sellerName,
        source_id: listing.sourceId,
        specs: listing.specs as unknown as Json,
        title: listing.title
      })),
      {
        onConflict: "source_id,external_id"
      }
    );

    await supabase.from("ingestion_runs").insert(
      report.adapterResults.map((result) => {
        const staleListings = result.listings.filter(
          (listing) => listing.freshness === "stale"
        ).length;

        return {
          duplicates_detected: getDuplicateCountForSource(report, result.source.id),
          errors: result.errors as unknown as Json,
          finished_at: result.finishedAt,
          listings_normalized: result.listingsNormalized,
          listings_seen: result.listingsSeen,
          metadata: {
            dryRunOnly: true,
            generatedAt: report.generatedAt,
            sourceName: result.source.name,
            warnings: result.warnings,
            samplePrices: result.listings.slice(0, 3).map((listing) =>
              formatMarketplacePrice(listing.price, listing.currency)
            )
          } as Json,
          mode: "dry_run",
          source_id: result.source.id,
          stale_listings: staleListings,
          started_at: result.startedAt,
          status:
            result.errors.length > 0
              ? "failed"
              : result.warnings.length > 0
                ? "warning"
                : "completed"
        };
      })
    );
  }

  revalidatePath("/admin/ingestion");
  revalidatePath("/sources");
  redirect("/admin/ingestion");
}
