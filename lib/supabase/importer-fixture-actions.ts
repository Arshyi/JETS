"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { appVersion } from "@/lib/app-version";
import { buildImporterFixtureResult } from "@/lib/importer-fixtures/engine";
import { getAdminGate } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import {
  importerFixtureSetIds,
  importerRunModes,
  type ImporterFixtureItemResult,
  type ImporterFixtureParsedListing,
  type ImporterFixtureSetId,
  type ImporterRunMode
} from "@/types/importer-fixtures";
import type { Json } from "@/types/database";

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function parseOption<T extends string>(
  value: string,
  options: readonly T[],
  fallback: T
) {
  return options.includes(value as T) ? (value as T) : fallback;
}

async function requireModerator(returnTo: string) {
  const gate = await getAdminGate();

  if (!gate.isAllowed) {
    redirect(`${returnTo}?importerError=admin-required`);
  }

  const authClient = await createSupabaseServerClient();
  const serviceClient = createSupabaseServiceRoleClient();

  if (!authClient || !serviceClient) {
    redirect(`${returnTo}?importerError=service-role-required`);
  }

  const {
    data: { user }
  } = await authClient.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  return { serviceClient, user };
}

function revalidateImporterPaths(listingKey?: string | null) {
  revalidatePath("/admin/importer-fixtures");
  revalidatePath("/listing-intelligence");
  revalidatePath("/listing-intelligence/review");
  revalidatePath("/listing-intelligence/duplicates");
  revalidatePath("/evidence");

  if (listingKey) {
    revalidatePath(`/listing-intelligence/${listingKey}`);
  }
}

async function getExistingListingKeys(
  serviceClient: NonNullable<ReturnType<typeof createSupabaseServiceRoleClient>>
) {
  const { data } = await serviceClient
    .from("normalized_marketplace_listings")
    .select("listing_key")
    .limit(600);

  return new Set((data ?? []).map((row) => row.listing_key));
}

async function upsertEvidenceForField({
  createdBy,
  parsed,
  serviceClient
}: {
  createdBy: string;
  parsed: ImporterFixtureParsedListing;
  serviceClient: NonNullable<ReturnType<typeof createSupabaseServiceRoleClient>>;
}) {
  const sourceKey = `${parsed.listingKey}:fixture-source`;
  const { data: source } = await serviceClient
    .from("evidence_sources")
    .upsert(
      {
        metadata: {
          fixtureSourceType: parsed.fixture.fixtureSourceType,
          marketplace: parsed.raw.sourceId,
          marketplaceListingId: parsed.raw.externalId
        } as Json,
        source_key: sourceKey,
        source_type: "manual-research",
        submitted_by: createdBy,
        title: `Fixture listing: ${parsed.raw.title}`,
        trust_weight: 45,
        url: parsed.raw.url,
        verification_status: "pending-review",
        visibility: "public"
      },
      { onConflict: "source_key" }
    )
    .select("id")
    .single();
  const evidenceIdsByField = new Map<string, string>();

  for (const field of parsed.intelligence.fields) {
    const subjectId = `${parsed.listingKey}:${field.fieldPath}`;
    const { data: existing } = await serviceClient
      .from("evidence_records")
      .select("id")
      .eq("subject_id", subjectId)
      .eq("subject_type", "marketplace-parsed-field")
      .maybeSingle();
    let evidenceRecordId = existing?.id ?? null;

    if (!evidenceRecordId) {
      const valueLabel = field.value ?? "unknown";
      const { data: evidenceRecord } = await serviceClient
        .from("evidence_records")
        .insert({
          app_version: appVersion,
          claim: `${field.label} parsed as ${valueLabel}`,
          confidence: field.confidence,
          extraction_method: "deterministic-parser",
          metadata: {
            fieldPath: field.fieldPath,
            fieldSource: field.source,
            fixtureSourceType: parsed.fixture.fixtureSourceType,
            listingKey: parsed.listingKey,
            rawTitle: parsed.raw.title
          } as Json,
          platform_id: parsed.intelligence.normalizedPlatformId,
          source_id: source?.id ?? null,
          source_title: `Fixture listing: ${parsed.raw.title}`,
          source_type: "manual-research",
          source_url: parsed.raw.url,
          subject_id: subjectId,
          subject_type: "marketplace-parsed-field",
          submitted_by: createdBy,
          supporting_text:
            field.value === null
              ? `No ${field.label} value was detected in fixture title or description.`
              : `${field.label} value "${field.value}" was parsed from ${field.source}. Title: ${parsed.raw.title}. Description: ${parsed.raw.description}`,
          verification_status: "pending-review",
          visibility: "public"
        })
        .select("id")
        .single();

      evidenceRecordId = evidenceRecord?.id ?? null;
    }

    if (evidenceRecordId) {
      evidenceIdsByField.set(field.fieldPath, evidenceRecordId);
      await serviceClient.from("parsed_field_evidence_links").upsert(
        {
          confidence: field.confidence,
          created_by: createdBy,
          evidence_record_id: evidenceRecordId,
          extraction_method: "deterministic-parser",
          field_path: field.fieldPath,
          normalized_listing_id: parsed.listingKey,
          source_id: parsed.raw.sourceId,
          subject_id: subjectId,
          subject_type: "marketplace-parsed-field",
          verification_status: "pending-review"
        },
        {
          onConflict: "normalized_listing_id,field_path,evidence_record_id"
        }
      );
    }
  }

  return evidenceIdsByField;
}

async function upsertListingFromFixture({
  createdBy,
  item,
  serviceClient
}: {
  createdBy: string;
  item: ImporterFixtureItemResult;
  serviceClient: NonNullable<ReturnType<typeof createSupabaseServiceRoleClient>>;
}) {
  if (!item.parsed) {
    return null;
  }

  const parsed = item.parsed;
  const { data: listing } = await serviceClient
    .from("normalized_marketplace_listings")
    .upsert(
      {
        app_version: appVersion,
        condition: parsed.intelligence.normalized.hardware.condition.value,
        currency: parsed.raw.currency,
        detected_components: parsed.intelligence.normalized.hardware
          .detectedComponents as unknown as Json,
        image_urls: [],
        listing_health: parsed.intelligence.health as unknown as Json,
        listing_health_score: parsed.intelligence.health.score,
        listing_key: parsed.listingKey,
        listing_status: "needs-review",
        location: parsed.raw.locationText,
        marketplace: parsed.raw.sourceId,
        marketplace_listing_id: parsed.raw.externalId,
        normalized_payload: parsed.intelligence.normalized as unknown as Json,
        normalized_platform_id: parsed.intelligence.normalizedPlatformId,
        parsing_confidence: parsed.intelligence.parsingConfidence,
        price: parsed.intelligence.priceAmount,
        raw_description: parsed.raw.description,
        raw_payload: parsed.raw as unknown as Json,
        raw_title: parsed.raw.title,
        readiness_reasons:
          parsed.intelligence.recommendationPreview.readinessReasons,
        recommendation_readiness:
          parsed.intelligence.recommendationPreview.recommendationReadiness,
        seller: parsed.raw.sellerDisplayName,
        source_kind: "demo-fixture",
        submitted_by: createdBy,
        verification_status: "pending-review",
        visibility: "public"
      },
      { onConflict: "listing_key" }
    )
    .select("id, listing_key")
    .single();

  if (!listing) {
    return null;
  }

  const evidenceIds = await upsertEvidenceForField({
    createdBy,
    parsed,
    serviceClient
  });
  const listingEvidenceIds = Array.from(new Set(evidenceIds.values()));

  await serviceClient
    .from("normalized_marketplace_listings")
    .update({ evidence_record_ids: listingEvidenceIds })
    .eq("id", listing.id);
  await serviceClient.from("listing_parsed_fields").upsert(
    parsed.intelligence.fields.map((field) => ({
      confidence: field.confidence,
      created_by: createdBy,
      evidence_record_ids: evidenceIds.has(field.fieldPath)
        ? [evidenceIds.get(field.fieldPath)!]
        : [],
      field_label: field.label,
      field_path: field.fieldPath,
      field_source: field.source,
      final_value: field.value,
      normalized_listing_id: listing.id,
      parsed_value: field.parsedValue,
      review_status: "pending-review",
      verification_status: "pending-review"
    })),
    { onConflict: "normalized_listing_id,field_path" }
  );
  if (parsed.intelligence.duplicateCandidates.length > 0) {
    await serviceClient.from("listing_duplicate_candidates").upsert(
      parsed.intelligence.duplicateCandidates.map((candidate) => ({
        candidate_listing_key: candidate.candidateListingId,
        confidence: candidate.confidence,
        normalized_listing_id: listing.id,
        review_status: "pending-review",
        signals: candidate.signals as unknown as Json,
        status: candidate.status
      })),
      { onConflict: "normalized_listing_id,candidate_listing_key" }
    );
  }
  await serviceClient.from("listing_review_events").insert({
    action: "fixture_imported",
    after_state: {
      evidenceIds: listingEvidenceIds,
      listingKey: listing.listing_key,
      marketplace: parsed.raw.sourceId,
      mode: "import"
    } as Json,
    created_by: createdBy,
    normalized_listing_id: listing.id,
    reason: "Seeded through v3.4 deterministic importer fixture.",
    summary: "Fixture listing imported into Listing Intelligence."
  });

  return {
    evidenceIds: listingEvidenceIds,
    id: listing.id,
    listingKey: listing.listing_key
  };
}

export async function runImporterFixtureAction(formData: FormData) {
  const returnTo = getText(formData, "returnTo") || "/admin/importer-fixtures";
  const fixtureSetId = parseOption<ImporterFixtureSetId>(
    getText(formData, "fixtureSetId"),
    importerFixtureSetIds,
    "core-demo-listings"
  );
  const mode = parseOption<ImporterRunMode>(
    getText(formData, "mode"),
    importerRunModes,
    "dry-run"
  );
  const { serviceClient, user } = await requireModerator(returnTo);
  const existingListingKeys = await getExistingListingKeys(serviceClient);
  const result = buildImporterFixtureResult({
    existingListingKeys,
    fixtureSetId,
    mode
  });
  const finishedAt = new Date().toISOString();
  const runStatus =
    result.summary.errors > 0 ? "completed-with-errors" : "completed";
  const { data: run } = await serviceClient
    .from("importer_fixture_runs")
    .insert({
      app_version: appVersion,
      created_by: user.id,
      created_count: result.summary.created,
      error_count: result.summary.errors,
      finished_at: finishedAt,
      fixture_count: result.items.length,
      fixture_set_id: fixtureSetId,
      mode,
      skipped_count: result.summary.skipped,
      status: runStatus,
      summary: result.summary as unknown as Json,
      updated_count: result.summary.updated
    })
    .select("id")
    .single();
  const importedListingIds = new Map<string, string>();

  if (mode === "import") {
    for (const item of result.items.filter((candidate) => candidate.status !== "error")) {
      const listing = await upsertListingFromFixture({
        createdBy: user.id,
        item,
        serviceClient
      });

      if (listing) {
        importedListingIds.set(item.listingKey, listing.id);
      }
    }
  }

  if (run?.id) {
    await serviceClient.from("importer_fixture_run_items").insert(
      result.items.map((item) => ({
        error_codes: item.errors.map((error) => error.code),
        external_id: item.externalId,
        fixture_key: item.listingKey,
        listing_key: item.status === "error" ? null : item.listingKey,
        marketplace: item.marketplace,
        message:
          item.errors.length > 0
            ? item.errors.map((error) => error.message).join(" ")
            : mode === "dry-run"
              ? `Dry-run would ${item.status} this listing.`
              : `Import ${item.status} this listing.`,
        metadata: {
          errors: item.errors,
          fixtureTitle: item.fixtureTitle,
          mode
        } as unknown as Json,
        normalized_listing_id: importedListingIds.get(item.listingKey) ?? null,
        run_id: run.id,
        status: item.status
      }))
    );
  }

  revalidateImporterPaths();
  redirect(`${returnTo}?run=${run?.id ?? "complete"}`);
}

export async function reviewDuplicateCandidateAction(formData: FormData) {
  const duplicateId = getText(formData, "duplicateId");
  const listingKey = getText(formData, "listingKey");
  const returnTo =
    getText(formData, "returnTo") ||
    (listingKey ? `/listing-intelligence/${listingKey}` : "/listing-intelligence/duplicates");
  const action = parseOption(
    getText(formData, "duplicateAction"),
    ["mark-duplicate", "mark-distinct", "merge-later"] as const,
    "merge-later"
  );
  const reason = getText(formData, "reason").slice(0, 1200);

  if (!duplicateId) {
    redirect(returnTo);
  }

  const { serviceClient, user } = await requireModerator(returnTo);
  const { data: duplicate } = await serviceClient
    .from("listing_duplicate_candidates")
    .select("*")
    .eq("id", duplicateId)
    .maybeSingle();

  if (!duplicate) {
    redirect(returnTo);
  }

  const reviewedAt = new Date().toISOString();
  const nextState =
    action === "mark-duplicate"
      ? { review_status: "accepted", status: "likely-duplicate" }
      : action === "mark-distinct"
        ? { review_status: "rejected", status: "distinct" }
        : { review_status: "pending-review", status: "possible-duplicate" };

  await serviceClient
    .from("listing_duplicate_candidates")
    .update({
      ...nextState,
      review_reason:
        reason ||
        (action === "merge-later"
          ? "Merge candidate acknowledged for a future merge workflow."
          : `Duplicate candidate marked ${nextState.status}.`),
      reviewed_at: reviewedAt,
      reviewed_by: user.id
    })
    .eq("id", duplicate.id);
  await serviceClient.from("listing_review_events").insert({
    action: `duplicate_${action}`,
    after_state: {
      duplicateAction: action,
      reviewedAt,
      reviewedBy: user.id,
      ...nextState
    } as Json,
    before_state: duplicate as unknown as Json,
    created_by: user.id,
    normalized_listing_id: duplicate.normalized_listing_id,
    reason:
      reason ||
      (action === "merge-later"
        ? "Merge placeholder only; no automatic merge performed."
        : `Reviewer chose ${action}.`),
    summary:
      action === "merge-later"
        ? "Duplicate candidate reserved for future merge workflow."
        : `Duplicate candidate reviewed as ${nextState.status}.`
  });

  revalidateImporterPaths(listingKey);
  redirect(returnTo);
}
