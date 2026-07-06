"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { appVersion } from "@/lib/app-version";
import { buildListingIntelligenceRecord } from "@/lib/listing-intelligence/engine";
import { normalizeMarketplaceListing } from "@/lib/marketplace-intelligence/normalize";
import { getAdminGate } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import {
  listingModerationStatuses,
  listingReviewActions
} from "@/types/listing-intelligence";
import {
  marketplaceIntelligenceSourceIds,
  type MarketplaceIntelligenceSourceId,
  type RawMarketplaceListing
} from "@/types/marketplace-intelligence";
import type { Json } from "@/types/database";
import type {
  EvidenceConfidence,
  EvidenceVerificationStatus
} from "@/types/evidence";
import type { ListingReviewAction } from "@/types/listing-intelligence";

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

function getNumber(formData: FormData, key: string, fallback = 0) {
  const value = Number(getText(formData, key).replace(/[^0-9.]/g, ""));

  return Number.isFinite(value) ? value : fallback;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

async function requireSignedIn(returnTo: string) {
  if (!isSupabaseConfigured) {
    redirect("/beta/setup");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/beta/setup");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  return { supabase, user };
}

async function requireModerator(returnTo: string) {
  const gate = await getAdminGate();

  if (!gate.isAllowed) {
    redirect(`${returnTo}?listingError=moderator-required`);
  }

  const authClient = await createSupabaseServerClient();
  const serviceClient = createSupabaseServiceRoleClient();

  if (!authClient || !serviceClient) {
    redirect(`${returnTo}?listingError=service-role-required`);
  }

  const {
    data: { user }
  } = await authClient.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  return { serviceClient, user };
}

function revalidateListingPaths(listingKey?: string | null) {
  revalidatePath("/listing-intelligence");
  revalidatePath("/listing-intelligence/review");
  revalidatePath("/listing-intelligence/duplicates");
  revalidatePath("/sources");
  revalidatePath("/evidence");

  if (listingKey) {
    revalidatePath(`/listing-intelligence/${listingKey}`);
  }
}

export async function submitManualListingAction(formData: FormData) {
  const returnTo = getText(formData, "returnTo") || "/listing-intelligence";
  const { supabase, user } = await requireSignedIn(returnTo);
  const sourceId = parseOption<MarketplaceIntelligenceSourceId>(
    getText(formData, "marketplace"),
    marketplaceIntelligenceSourceIds,
    "manual-entry"
  );
  const currency = parseOption(getText(formData, "currency"), ["AED", "USD"] as const, "AED");
  const rawTitle = getText(formData, "rawTitle").slice(0, 240);
  const rawDescription = getText(formData, "rawDescription").slice(0, 1800);
  const marketplaceListingId =
    getText(formData, "marketplaceListingId").slice(0, 120) ||
    `manual-${Date.now()}`;
  const price = getNumber(formData, "price");
  const location = getText(formData, "location").slice(0, 160) || "Unknown";
  const seller = getText(formData, "seller").slice(0, 160) || "Manual entry";
  const imageCount = Math.max(0, Math.min(20, getNumber(formData, "imageCount")));
  const categoryLabel =
    getText(formData, "categoryLabel").slice(0, 120) || "Manual hardware listing";

  if (!rawTitle || !rawDescription) {
    redirect(`${returnTo}?listingError=missing-fields`);
  }

  const raw: RawMarketplaceListing = {
    categoryLabel,
    currency,
    description: rawDescription,
    externalId: marketplaceListingId,
    imageCount,
    locationText: location,
    marketplaceSpecific: { submittedBy: "manual-entry" },
    observedAt: new Date().toISOString(),
    priceText: price > 0 ? `${currency} ${price}` : "Price unknown",
    sellerDisplayName: seller,
    sourceId,
    title: rawTitle,
    url: null
  };
  const normalized = normalizeMarketplaceListing(raw);
  const intelligence = buildListingIntelligenceRecord(normalized);
  const listingKey = `manual-${slugify(sourceId)}-${slugify(marketplaceListingId)}-${Date.now()}`;
  const { data: listing } = await supabase
    .from("normalized_marketplace_listings")
    .insert({
      app_version: appVersion,
      condition: normalized.hardware.condition.value,
      currency,
      detected_components: normalized.hardware.detectedComponents as unknown as Json,
      evidence_record_ids: [],
      image_urls: [],
      listing_health: intelligence.health as unknown as Json,
      listing_health_score: intelligence.health.score,
      listing_key: listingKey,
      listing_status: "needs-review",
      location,
      marketplace: sourceId,
      marketplace_listing_id: marketplaceListingId,
      normalized_payload: normalized as unknown as Json,
      normalized_platform_id:
        normalized.hardware.platformDetection.detectedPlatformId,
      parsing_confidence: intelligence.parsingConfidence,
      price: price > 0 ? price : null,
      raw_description: rawDescription,
      raw_payload: raw as unknown as Json,
      raw_title: rawTitle,
      readiness_reasons: intelligence.health.readinessBlockers,
      recommendation_readiness:
        intelligence.recommendationPreview.recommendationReadiness,
      seller,
      source_kind: "manual-entry",
      submitted_by: user.id,
      verification_status: "pending-review",
      visibility: "public"
    })
    .select("id")
    .single();

  if (listing?.id) {
    await supabase.from("listing_parsed_fields").insert(
      intelligence.fields.map((field) => ({
        confidence: field.confidence,
        created_by: user.id,
        evidence_record_ids: [],
        field_label: field.label,
        field_path: field.fieldPath,
        field_source: field.source,
        final_value: field.value,
        normalized_listing_id: listing.id,
        parsed_value: field.parsedValue,
        review_status: "pending-review",
        verification_status: "pending-review"
      }))
    );
    await supabase.from("listing_review_events").insert({
      action: "manual_listing_submitted",
      after_state: {
        listingKey,
        marketplace: sourceId,
        marketplaceListingId,
        title: rawTitle
      } as Json,
      created_by: user.id,
      normalized_listing_id: listing.id,
      reason: "Manual listing entered for review.",
      summary: "Manual listing snapshot submitted to Listing Intelligence."
    });
  }

  revalidateListingPaths(listingKey);
  redirect(`/listing-intelligence/${listingKey}`);
}

function getReviewResult(
  action: ListingReviewAction,
  parsedValue: string | null,
  correctedValue: string
): {
  correctedValue: string | null;
  finalValue: string | null;
  reviewStatus: string;
  verificationStatus: EvidenceVerificationStatus;
} {
  if (action === "accept") {
    return {
      correctedValue: null,
      finalValue: parsedValue,
      reviewStatus: "accepted",
      verificationStatus: "verified"
    };
  }

  if (action === "reject") {
    return {
      correctedValue: null,
      finalValue: null,
      reviewStatus: "rejected",
      verificationStatus: "disputed"
    };
  }

  if (action === "mark-unknown") {
    return {
      correctedValue: null,
      finalValue: null,
      reviewStatus: "unknown",
      verificationStatus: "verified"
    };
  }

  return {
    correctedValue: correctedValue || null,
    finalValue: correctedValue || null,
    reviewStatus: "corrected",
    verificationStatus: "verified"
  };
}

export async function reviewListingFieldAction(formData: FormData) {
  const fieldId = getText(formData, "fieldId");
  const listingKey = getText(formData, "listingKey");
  const returnTo =
    getText(formData, "returnTo") ||
    (listingKey ? `/listing-intelligence/${listingKey}` : "/listing-intelligence/review");
  const action = parseOption<ListingReviewAction>(
    getText(formData, "reviewAction"),
    listingReviewActions,
    "accept"
  );
  const correctedValue = getText(formData, "correctedValue").slice(0, 240);
  const reason = getText(formData, "reason").slice(0, 1200);

  if (!fieldId) {
    redirect(returnTo);
  }

  if (action === "correct" && !correctedValue) {
    redirect(`${returnTo}?listingError=correction-required`);
  }

  const { serviceClient, user } = await requireModerator(returnTo);
  const { data: field } = await serviceClient
    .from("listing_parsed_fields")
    .select("*")
    .eq("id", fieldId)
    .maybeSingle();

  if (!field) {
    redirect(returnTo);
  }

  const { data: listing } = await serviceClient
    .from("normalized_marketplace_listings")
    .select("*")
    .eq("id", field.normalized_listing_id)
    .maybeSingle();

  if (!listing) {
    redirect(returnTo);
  }

  const result = getReviewResult(action, field.parsed_value, correctedValue);
  const reviewedAt = new Date().toISOString();
  let evidenceRecordId: string | null = null;

  if (action === "correct") {
    const { data: evidenceRecord } = await serviceClient
      .from("evidence_records")
      .insert({
        app_version: appVersion,
        claim: `${field.field_label} corrected to ${correctedValue}`,
        confidence: "high" satisfies EvidenceConfidence,
        extraction_method: "moderator-review",
        metadata: {
          fieldPath: field.field_path,
          listingKey: listing.listing_key,
          previousValue: field.parsed_value
        } as Json,
        platform_id: listing.normalized_platform_id,
        source_title: "JETS listing field correction",
        source_type: "moderator-verified",
        source_url: listing.source_url,
        subject_id: `${listing.listing_key}:${field.field_path}`,
        subject_type: "marketplace-parsed-field",
        submitted_by: user.id,
        supporting_text:
          reason ||
          `Reviewer corrected ${field.field_label} from ${field.parsed_value ?? "unknown"} to ${correctedValue}.`,
        verification_status: "verified",
        visibility: "public"
      })
      .select("id")
      .single();

    evidenceRecordId = evidenceRecord?.id ?? null;
  }

  const evidenceRecordIds = evidenceRecordId
    ? Array.from(new Set([...field.evidence_record_ids, evidenceRecordId]))
    : field.evidence_record_ids;

  await serviceClient
    .from("listing_parsed_fields")
    .update({
      corrected_value: result.correctedValue,
      correction_reason: reason || null,
      evidence_record_ids: evidenceRecordIds,
      final_value: result.finalValue,
      review_status: result.reviewStatus,
      reviewed_at: reviewedAt,
      reviewed_by: user.id,
      verification_status: result.verificationStatus
    })
    .eq("id", field.id);

  if (action === "correct") {
    const { data: correction } = await serviceClient
      .from("listing_field_corrections")
      .insert({
        after_value: correctedValue,
        before_value: field.parsed_value,
        created_by: user.id,
        evidence_record_id: evidenceRecordId,
        field_path: field.field_path,
        normalized_listing_id: listing.id,
        parsed_field_id: field.id,
        reason: reason || "Reviewer corrected parsed listing field.",
        reviewed_at: reviewedAt,
        reviewed_by: user.id,
        status: "verified"
      })
      .select("id")
      .single();

    if (evidenceRecordId) {
      await serviceClient.from("parsed_field_evidence_links").insert({
        confidence: "high",
        created_by: user.id,
        evidence_record_id: evidenceRecordId,
        extraction_method: "moderator-review",
        field_path: field.field_path,
        normalized_listing_id: listing.listing_key,
        source_id: listing.marketplace,
        subject_id: `${listing.listing_key}:${field.field_path}`,
        subject_type: "marketplace-parsed-field",
        verification_status: "verified"
      });
    }

    await serviceClient.from("listing_review_events").insert({
      action: `field_${action}`,
      after_state: {
        correctedValue,
        evidenceRecordId
      } as Json,
      before_state: field as unknown as Json,
      correction_id: correction?.id ?? null,
      created_by: user.id,
      normalized_listing_id: listing.id,
      parsed_field_id: field.id,
      reason: reason || "Reviewer corrected parsed field.",
      summary: `${field.field_label} corrected for this listing.`
    });
  } else {
    await serviceClient.from("listing_review_events").insert({
      action: `field_${action}`,
      after_state: result as unknown as Json,
      before_state: field as unknown as Json,
      created_by: user.id,
      normalized_listing_id: listing.id,
      parsed_field_id: field.id,
      reason: reason || `Reviewer marked field ${action}.`,
      summary: `${field.field_label} marked ${result.reviewStatus}.`
    });
  }

  revalidateListingPaths(listing.listing_key);
  redirect(returnTo);
}

export async function reviewListingStatusAction(formData: FormData) {
  const listingKey = getText(formData, "listingKey");
  const returnTo =
    getText(formData, "returnTo") ||
    (listingKey ? `/listing-intelligence/${listingKey}` : "/listing-intelligence/review");
  const nextStatus = parseOption(
    getText(formData, "verificationStatus"),
    listingModerationStatuses,
    "pending-review"
  );
  const reason = getText(formData, "reason").slice(0, 1200);

  if (!listingKey) {
    redirect(returnTo);
  }

  const { serviceClient, user } = await requireModerator(returnTo);
  const { data: listing } = await serviceClient
    .from("normalized_marketplace_listings")
    .select("*")
    .eq("listing_key", listingKey)
    .maybeSingle();

  if (!listing) {
    redirect(returnTo);
  }

  const reviewedAt = new Date().toISOString();
  const listingStatus =
    nextStatus === "verified"
      ? "ready-for-recommendation"
      : nextStatus === "archived"
        ? "archived"
        : "needs-review";

  await serviceClient
    .from("normalized_marketplace_listings")
    .update({
      listing_status: listingStatus,
      review_reason: reason || `Marked ${nextStatus}.`,
      reviewed_at: reviewedAt,
      reviewed_by: user.id,
      verification_status: nextStatus
    })
    .eq("id", listing.id);
  await serviceClient.from("listing_review_events").insert({
    action: `listing_marked_${nextStatus}`,
    after_state: {
      listingStatus,
      reviewedAt,
      reviewedBy: user.id,
      verificationStatus: nextStatus
    } as Json,
    before_state: listing as unknown as Json,
    created_by: user.id,
    normalized_listing_id: listing.id,
    reason: reason || `Reviewer marked listing ${nextStatus}.`,
    summary: `Listing marked ${nextStatus}.`
  });

  revalidateListingPaths(listingKey);
  redirect(returnTo);
}
