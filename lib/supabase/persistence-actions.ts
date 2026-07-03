"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createBuildDecisionSnapshot,
  getDefaultBuildSnapshotTitle,
  isBuildSnapshotStatus
} from "@/lib/build-snapshots/snapshot";
import { parseBuildGeneratorInput } from "@/lib/build-generator/validation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getMockListingById } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function getNumber(formData: FormData, key: string) {
  const value = getText(formData, key);

  if (!value) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

async function requirePersistence(next = "/search") {
  if (!isSupabaseConfigured) {
    redirect("/account");
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    redirect("/account");
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  return { supabase, user };
}

function revalidateBuildSnapshotPaths() {
  revalidatePath("/build-generator");
  revalidatePath("/build-snapshots");
  revalidatePath("/build-snapshots/compare");
  revalidatePath("/history");
}

async function recordHistory(
  userId: string,
  listingId: string,
  action: string,
  snapshot: Json,
  title: string
) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return;
  }

  await supabase.from("build_history").insert({
    action,
    listing_id: listingId,
    snapshot,
    title,
    user_id: userId
  });
}

export async function saveBuildAction(formData: FormData) {
  const listingId = getText(formData, "listingId");
  const returnTo = getText(formData, "returnTo") || "/search";
  const listing = getMockListingById(listingId);

  if (!listing) {
    redirect(returnTo);
  }

  const { supabase, user } = await requirePersistence(returnTo);

  await supabase.from("saved_builds").upsert(
    {
      listing_id: listing.id,
      snapshot: listing as unknown as Json,
      title: listing.title,
      user_id: user.id
    },
    {
      onConflict: "user_id,listing_id"
    }
  );

  await recordHistory(user.id, listing.id, "saved_build", listing as unknown as Json, listing.title);

  revalidatePath("/saved-builds");
  revalidatePath("/history");
  revalidatePath("/search");
  redirect(returnTo);
}

export async function favoriteBuildAction(formData: FormData) {
  const listingId = getText(formData, "listingId");
  const returnTo = getText(formData, "returnTo") || "/search";
  const listing = getMockListingById(listingId);

  if (!listing) {
    redirect(returnTo);
  }

  const { supabase, user } = await requirePersistence(returnTo);

  await supabase.from("favorite_builds").upsert(
    {
      listing_id: listing.id,
      snapshot: listing as unknown as Json,
      title: listing.title,
      user_id: user.id
    },
    {
      onConflict: "user_id,listing_id"
    }
  );

  await recordHistory(user.id, listing.id, "favorited_build", listing as unknown as Json, listing.title);

  revalidatePath("/favorites");
  revalidatePath("/history");
  revalidatePath("/search");
  redirect(returnTo);
}

export async function removeSavedBuildAction(formData: FormData) {
  const listingId = getText(formData, "listingId");
  const { supabase, user } = await requirePersistence();

  await supabase
    .from("saved_builds")
    .delete()
    .eq("user_id", user.id)
    .eq("listing_id", listingId);

  revalidatePath("/saved-builds");
  revalidatePath("/search");
}

export async function removeFavoriteBuildAction(formData: FormData) {
  const listingId = getText(formData, "listingId");
  const { supabase, user } = await requirePersistence();

  await supabase
    .from("favorite_builds")
    .delete()
    .eq("user_id", user.id)
    .eq("listing_id", listingId);

  revalidatePath("/favorites");
  revalidatePath("/search");
}

export async function clearHistoryAction() {
  const { supabase, user } = await requirePersistence();

  await supabase.from("build_history").delete().eq("user_id", user.id);

  revalidatePath("/history");
}

export async function updateSettingsAction(formData: FormData) {
  const { supabase, user } = await requirePersistence();

  await supabase.from("user_settings").upsert(
    {
      default_budget_max: getNumber(formData, "defaultBudgetMax"),
      default_budget_min: getNumber(formData, "defaultBudgetMin"),
      default_location: getText(formData, "defaultLocation") || null,
      email_notifications: formData.get("emailNotifications") === "on",
      preferred_theme: getText(formData, "preferredTheme") || "system",
      preferred_use_case: getText(formData, "preferredUseCase") || null,
      user_id: user.id
    },
    {
      onConflict: "user_id"
    }
  );

  revalidatePath("/settings");
}

export async function saveBuildSnapshotAction(formData: FormData) {
  const input = parseBuildGeneratorInput(getText(formData, "inputJson"));
  const returnTo = getText(formData, "returnTo") || "/build-snapshots";

  if (!input) {
    redirect(returnTo);
  }

  const { supabase, user } = await requirePersistence("/build-generator");
  const snapshot = createBuildDecisionSnapshot(input);
  const topRecommendation = snapshot.summary.topRecommendation;
  const fallbackTitle = getDefaultBuildSnapshotTitle(input);
  const title = (getText(formData, "title") || fallbackTitle).slice(0, 120);

  if (!topRecommendation) {
    redirect(returnTo);
  }

  const { error } = await supabase.from("build_snapshots").insert({
    app_version: snapshot.appVersion,
    budget: input.budget,
    country: input.country,
    currency: input.currency,
    platform_health: topRecommendation.platformHealth,
    primary_use_case: input.primaryUseCase,
    snapshot: snapshot as unknown as Json,
    title,
    top_compatibility_score: topRecommendation.compatibilityScore,
    top_decision_score: topRecommendation.decisionScore,
    top_listing_id: topRecommendation.listingId,
    top_listing_title: topRecommendation.title,
    top_overall_score: topRecommendation.overallScore,
    user_id: user.id
  });

  if (!error) {
    await recordHistory(
      user.id,
      topRecommendation.listingId,
      "saved_build_snapshot",
      snapshot as unknown as Json,
      title
    );
  }

  revalidateBuildSnapshotPaths();
  redirect(returnTo);
}

export async function renameBuildSnapshotAction(formData: FormData) {
  const snapshotId = getText(formData, "snapshotId");
  const title = getText(formData, "title").slice(0, 120);
  const returnTo = getText(formData, "returnTo") || "/build-snapshots";

  if (!snapshotId || !title) {
    redirect(returnTo);
  }

  const { supabase, user } = await requirePersistence(returnTo);

  await supabase
    .from("build_snapshots")
    .update({ title })
    .eq("id", snapshotId)
    .eq("user_id", user.id);

  revalidateBuildSnapshotPaths();
  redirect(returnTo);
}

export async function updateBuildSnapshotFavoriteAction(formData: FormData) {
  const snapshotId = getText(formData, "snapshotId");
  const isFavorite = getText(formData, "isFavorite") === "true";
  const returnTo = getText(formData, "returnTo") || "/build-snapshots";

  if (!snapshotId) {
    redirect(returnTo);
  }

  const { supabase, user } = await requirePersistence(returnTo);

  await supabase
    .from("build_snapshots")
    .update({ is_favorite: isFavorite })
    .eq("id", snapshotId)
    .eq("user_id", user.id);

  revalidateBuildSnapshotPaths();
  redirect(returnTo);
}

export async function updateBuildSnapshotStatusAction(formData: FormData) {
  const snapshotId = getText(formData, "snapshotId");
  const status = getText(formData, "status");
  const returnTo = getText(formData, "returnTo") || "/build-snapshots";

  if (!snapshotId || !isBuildSnapshotStatus(status)) {
    redirect(returnTo);
  }

  const { supabase, user } = await requirePersistence(returnTo);

  await supabase
    .from("build_snapshots")
    .update({ status })
    .eq("id", snapshotId)
    .eq("user_id", user.id);

  revalidateBuildSnapshotPaths();
  redirect(returnTo);
}

export async function deleteBuildSnapshotAction(formData: FormData) {
  const snapshotId = getText(formData, "snapshotId");
  const returnTo = getText(formData, "returnTo") || "/build-snapshots";

  if (!snapshotId) {
    redirect(returnTo);
  }

  const { supabase, user } = await requirePersistence(returnTo);

  await supabase
    .from("build_snapshots")
    .delete()
    .eq("id", snapshotId)
    .eq("user_id", user.id);

  revalidateBuildSnapshotPaths();
  redirect(returnTo);
}
