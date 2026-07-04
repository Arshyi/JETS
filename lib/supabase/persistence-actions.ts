"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createBuildDecisionSnapshot,
  getDefaultBuildSnapshotTitle,
  isBuildSnapshotStatus
} from "@/lib/build-snapshots/snapshot";
import { parseBuildGeneratorInput } from "@/lib/build-generator/validation";
import { appVersion } from "@/lib/app-version";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getMockListingById } from "@/lib/supabase/queries";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";
import type {
  DecisionAuditEventType,
  DecisionAuditSubjectType
} from "@/types/decision-audit";

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createSupabaseServerClient>>
>;

type AuditEventInput = {
  afterState?: Json | null;
  beforeState?: Json | null;
  eventType: DecisionAuditEventType;
  metadata?: Json;
  note?: string | null;
  subjectId?: string | null;
  subjectTitle: string;
  subjectType: DecisionAuditSubjectType;
  summary: string;
};

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

async function requirePersistence(next = "/inventory") {
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
  revalidatePath("/activity");
  revalidatePath("/account");
}

function revalidateAuditPaths() {
  revalidatePath("/activity");
  revalidatePath("/account");
  revalidatePath("/build-snapshots");
  revalidatePath("/build-snapshots/compare");
  revalidatePath("/saved-builds");
  revalidatePath("/favorites");
  revalidatePath("/history");
}

async function recordAuditEvent(
  supabase: SupabaseServerClient,
  userId: string,
  input: AuditEventInput
) {
  await supabase.from("decision_audit_events").insert({
    after_state: input.afterState ?? null,
    app_version: appVersion,
    before_state: input.beforeState ?? null,
    event_type: input.eventType,
    metadata: input.metadata ?? {},
    note: input.note ?? null,
    subject_id: input.subjectId ?? null,
    subject_title: input.subjectTitle,
    subject_type: input.subjectType,
    summary: input.summary,
    user_id: userId
  });
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
  const returnTo = getText(formData, "returnTo") || "/inventory";
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
  await recordAuditEvent(supabase, user.id, {
    afterState: listing as unknown as Json,
    eventType: "build_saved",
    metadata: { listingId: listing.id, source: "inventory" },
    subjectId: listing.id,
    subjectTitle: listing.title,
    subjectType: "hardware_listing",
    summary: `Saved ${listing.title} as a build decision.`
  });

  revalidatePath("/saved-builds");
  revalidatePath("/history");
  revalidatePath("/inventory");
  revalidatePath("/search");
  revalidateAuditPaths();
  redirect(returnTo);
}

export async function favoriteBuildAction(formData: FormData) {
  const listingId = getText(formData, "listingId");
  const returnTo = getText(formData, "returnTo") || "/inventory";
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
  await recordAuditEvent(supabase, user.id, {
    afterState: listing as unknown as Json,
    eventType: "build_favorited",
    metadata: { listingId: listing.id, source: "inventory" },
    subjectId: listing.id,
    subjectTitle: listing.title,
    subjectType: "hardware_listing",
    summary: `Favorited ${listing.title}.`
  });

  revalidatePath("/favorites");
  revalidatePath("/history");
  revalidatePath("/inventory");
  revalidatePath("/search");
  revalidateAuditPaths();
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
  revalidatePath("/inventory");
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
  revalidatePath("/inventory");
  revalidatePath("/search");
}

export async function clearHistoryAction() {
  const { supabase, user } = await requirePersistence();
  const { count } = await supabase
    .from("build_history")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  await supabase.from("build_history").delete().eq("user_id", user.id);
  await recordAuditEvent(supabase, user.id, {
    eventType: "history_cleared",
    metadata: { clearedCount: count ?? 0 },
    subjectId: "build_history",
    subjectTitle: "Build history",
    subjectType: "build_history",
    summary: `Cleared ${count ?? 0} build history item${count === 1 ? "" : "s"}.`
  });

  revalidatePath("/history");
  revalidateAuditPaths();
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
  const notes = getText(formData, "notes").slice(0, 1200);

  if (!topRecommendation) {
    redirect(returnTo);
  }

  const { data, error } = await supabase.from("build_snapshots").insert({
    app_version: snapshot.appVersion,
    budget: input.budget,
    country: input.country,
    currency: input.currency,
    notes,
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
  }).select("id").single();

  if (!error && data) {
    await recordHistory(
      user.id,
      topRecommendation.listingId,
      "saved_build_snapshot",
      snapshot as unknown as Json,
      title
    );
    await recordAuditEvent(supabase, user.id, {
      afterState: {
        notes,
        status: "reviewing",
        title,
        topListingId: topRecommendation.listingId,
        topOverallScore: topRecommendation.overallScore
      },
      eventType: "snapshot_created",
      metadata: {
        appVersion: snapshot.appVersion,
        budget: input.budget,
        currency: input.currency,
        primaryUseCase: input.primaryUseCase,
        recommendations: snapshot.recommendations.length
      },
      note: notes || null,
      subjectId: data.id,
      subjectTitle: title,
      subjectType: "build_snapshot",
      summary: `Created snapshot ${title}.`
    });
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
  const { data: existing } = await supabase
    .from("build_snapshots")
    .select("id,title")
    .eq("id", snapshotId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    redirect(returnTo);
  }

  await supabase
    .from("build_snapshots")
    .update({ title })
    .eq("id", snapshotId)
    .eq("user_id", user.id);
  await recordAuditEvent(supabase, user.id, {
    afterState: { title },
    beforeState: { title: existing.title },
    eventType: "snapshot_renamed",
    subjectId: snapshotId,
    subjectTitle: title,
    subjectType: "build_snapshot",
    summary: `Renamed snapshot from ${existing.title} to ${title}.`
  });

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
  const { data: existing } = await supabase
    .from("build_snapshots")
    .select("id,title,is_favorite")
    .eq("id", snapshotId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    redirect(returnTo);
  }

  await supabase
    .from("build_snapshots")
    .update({ is_favorite: isFavorite })
    .eq("id", snapshotId)
    .eq("user_id", user.id);
  await recordAuditEvent(supabase, user.id, {
    afterState: { isFavorite },
    beforeState: { isFavorite: existing.is_favorite },
    eventType: isFavorite ? "snapshot_favorited" : "snapshot_unfavorited",
    subjectId: snapshotId,
    subjectTitle: existing.title,
    subjectType: "build_snapshot",
    summary: `${isFavorite ? "Favorited" : "Unfavorited"} snapshot ${existing.title}.`
  });

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
  const { data: existing } = await supabase
    .from("build_snapshots")
    .select("id,title,status")
    .eq("id", snapshotId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    redirect(returnTo);
  }

  await supabase
    .from("build_snapshots")
    .update({ status })
    .eq("id", snapshotId)
    .eq("user_id", user.id);
  await recordAuditEvent(supabase, user.id, {
    afterState: { status },
    beforeState: { status: existing.status },
    eventType: "snapshot_status_changed",
    metadata: { from: existing.status, to: status },
    subjectId: snapshotId,
    subjectTitle: existing.title,
    subjectType: "build_snapshot",
    summary: `Changed ${existing.title} from ${existing.status} to ${status}.`
  });

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
  const { data: existing } = await supabase
    .from("build_snapshots")
    .select("id,title,status,is_favorite,top_listing_id,top_overall_score")
    .eq("id", snapshotId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    redirect(returnTo);
  }

  const { error } = await supabase
    .from("build_snapshots")
    .delete()
    .eq("id", snapshotId)
    .eq("user_id", user.id);

  if (!error) {
    await recordAuditEvent(supabase, user.id, {
      beforeState: {
        isFavorite: existing.is_favorite,
        status: existing.status,
        topListingId: existing.top_listing_id,
        topOverallScore: existing.top_overall_score
      },
      eventType: "snapshot_deleted",
      subjectId: snapshotId,
      subjectTitle: existing.title,
      subjectType: "build_snapshot",
      summary: `Deleted snapshot ${existing.title}.`
    });
  }

  revalidateBuildSnapshotPaths();
  redirect(returnTo);
}

export async function restoreBuildSnapshotAction(formData: FormData) {
  const snapshotId = getText(formData, "snapshotId");
  const returnTo = snapshotId
    ? `/build-generator?snapshot=${encodeURIComponent(snapshotId)}`
    : "/build-snapshots";

  if (!snapshotId) {
    redirect("/build-snapshots");
  }

  const { supabase, user } = await requirePersistence("/build-snapshots");
  const { data: existing } = await supabase
    .from("build_snapshots")
    .select("id,title,top_listing_id,top_overall_score")
    .eq("id", snapshotId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    redirect("/build-snapshots");
  }

  await recordAuditEvent(supabase, user.id, {
    eventType: "snapshot_restored",
    metadata: {
      topListingId: existing.top_listing_id,
      topOverallScore: existing.top_overall_score
    },
    subjectId: snapshotId,
    subjectTitle: existing.title,
    subjectType: "build_snapshot",
    summary: `Restored snapshot ${existing.title} into the Build Generator.`
  });

  revalidateAuditPaths();
  redirect(returnTo);
}

export async function updateBuildSnapshotNotesAction(formData: FormData) {
  const snapshotId = getText(formData, "snapshotId");
  const notes = getText(formData, "notes").slice(0, 1200);
  const returnTo = getText(formData, "returnTo") || "/build-snapshots";

  if (!snapshotId) {
    redirect(returnTo);
  }

  const { supabase, user } = await requirePersistence(returnTo);
  const { data: existing } = await supabase
    .from("build_snapshots")
    .select("id,title,notes")
    .eq("id", snapshotId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    redirect(returnTo);
  }

  await supabase
    .from("build_snapshots")
    .update({ notes })
    .eq("id", snapshotId)
    .eq("user_id", user.id);
  await recordAuditEvent(supabase, user.id, {
    afterState: { notes },
    beforeState: { notes: existing.notes },
    eventType: "snapshot_note_updated",
    note: notes || null,
    subjectId: snapshotId,
    subjectTitle: existing.title,
    subjectType: "build_snapshot",
    summary: `Updated notes for snapshot ${existing.title}.`
  });

  revalidateBuildSnapshotPaths();
  redirect(returnTo);
}

export async function updateSavedBuildNotesAction(formData: FormData) {
  const savedBuildId = getText(formData, "savedBuildId");
  const notes = getText(formData, "notes").slice(0, 1200);
  const returnTo = getText(formData, "returnTo") || "/saved-builds";

  if (!savedBuildId) {
    redirect(returnTo);
  }

  const { supabase, user } = await requirePersistence(returnTo);
  const { data: existing } = await supabase
    .from("saved_builds")
    .select("id,listing_id,title,notes")
    .eq("id", savedBuildId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    redirect(returnTo);
  }

  await supabase
    .from("saved_builds")
    .update({ notes })
    .eq("id", savedBuildId)
    .eq("user_id", user.id);
  await recordAuditEvent(supabase, user.id, {
    afterState: { notes },
    beforeState: { notes: existing.notes ?? "" },
    eventType: "build_note_updated",
    note: notes || null,
    subjectId: existing.listing_id,
    subjectTitle: existing.title,
    subjectType: "hardware_listing",
    summary: `Updated notes for saved build ${existing.title}.`
  });

  revalidatePath("/saved-builds");
  revalidateAuditPaths();
  redirect(returnTo);
}
