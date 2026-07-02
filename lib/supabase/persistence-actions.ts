"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

async function requirePersistence() {
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
    redirect("/login?next=/search");
  }

  return { supabase, user };
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

  const { supabase, user } = await requirePersistence();

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

  const { supabase, user } = await requirePersistence();

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
