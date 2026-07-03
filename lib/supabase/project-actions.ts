"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { appVersion } from "@/lib/app-version";
import {
  countryCurrencyDefaults,
  defaultBuildGeneratorPreferences,
  defaultOwnedItems
} from "@/lib/build-generator/config";
import {
  getComponentById,
  isComponentAllowedForSlot
} from "@/lib/component-inventory";
import { getDefaultProjectInput, isBuildSlotId } from "@/lib/solution-builder/projects";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildGeneratorCountries,
  buildGeneratorCurrencies
} from "@/types/build-generator";
import { hardwareUseCases } from "@/types/hardware";
import type {
  BuildGeneratorCountry,
  BuildGeneratorCurrency
} from "@/types/build-generator";
import type { Json } from "@/types/database";
import type { HardwareUseCase } from "@/types/hardware";

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createSupabaseServerClient>>
>;

type ProjectAuditInput = {
  afterState?: Json | null;
  beforeState?: Json | null;
  eventType: string;
  metadata?: Json;
  projectId: string;
  summary: string;
};

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function parseBudget(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function parseCountry(value: string): BuildGeneratorCountry {
  return buildGeneratorCountries.includes(value as BuildGeneratorCountry)
    ? (value as BuildGeneratorCountry)
    : "United States";
}

function parseCurrency(
  value: string,
  country: BuildGeneratorCountry
): BuildGeneratorCurrency {
  return buildGeneratorCurrencies.includes(value as BuildGeneratorCurrency)
    ? (value as BuildGeneratorCurrency)
    : countryCurrencyDefaults[country];
}

function parseUseCase(value: string): HardwareUseCase {
  return hardwareUseCases.includes(value as HardwareUseCase)
    ? (value as HardwareUseCase)
    : "engineering";
}

async function requireProjectPersistence(next = "/solution-builder/projects") {
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

async function getOwnedProject(
  supabase: SupabaseServerClient,
  userId: string,
  projectId: string
) {
  const { data } = await supabase
    .from("build_projects")
    .select("id,title,status")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

async function recordProjectAuditEvent(
  supabase: SupabaseServerClient,
  userId: string,
  input: ProjectAuditInput
) {
  await supabase.from("build_project_audit_events").insert({
    after_state: input.afterState ?? null,
    before_state: input.beforeState ?? null,
    event_type: input.eventType,
    metadata: input.metadata ?? {},
    project_id: input.projectId,
    summary: input.summary,
    user_id: userId
  });
}

function revalidateProjectPaths(projectId?: string) {
  revalidatePath("/solution-builder");
  revalidatePath("/solution-builder/build-my-own");
  revalidatePath("/solution-builder/projects");

  if (projectId) {
    revalidatePath(`/solution-builder/projects/${projectId}`);
  }
}

export async function createBuildProjectAction(formData: FormData) {
  const defaults = getDefaultProjectInput();
  const rawCountry = getText(formData, "country") || defaults.country;
  const country = parseCountry(rawCountry);
  const currency = parseCurrency(getText(formData, "currency"), country);
  const title = (getText(formData, "title") || defaults.title).slice(0, 120);
  const purpose = parseUseCase(getText(formData, "purpose") || defaults.purpose);
  const budget = parseBudget(getText(formData, "budget") || String(defaults.budget));
  const { supabase, user } = await requireProjectPersistence(
    "/solution-builder/projects"
  );
  const { data, error } = await supabase
    .from("build_projects")
    .insert({
      app_version: appVersion,
      budget,
      country,
      currency,
      owned_items: defaultOwnedItems as unknown as Json,
      preferences: defaultBuildGeneratorPreferences as unknown as Json,
      purpose,
      title,
      user_id: user.id
    })
    .select("id")
    .single();

  if (!data || error) {
    redirect("/solution-builder/projects");
  }

  await recordProjectAuditEvent(supabase, user.id, {
    afterState: { budget, country, currency, purpose, title },
    eventType: "project_created",
    metadata: { appVersion },
    projectId: data.id,
    summary: `Created build project ${title}.`
  });

  revalidateProjectPaths(data.id);
  redirect(`/solution-builder/projects/${data.id}`);
}

export async function renameBuildProjectAction(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const title = getText(formData, "title").slice(0, 120);
  const returnTo = getText(formData, "returnTo") || "/solution-builder/projects";

  if (!projectId || !title) {
    redirect(returnTo);
  }

  const { supabase, user } = await requireProjectPersistence(returnTo);
  const existing = await getOwnedProject(supabase, user.id, projectId);

  if (!existing) {
    redirect(returnTo);
  }

  await supabase
    .from("build_projects")
    .update({ title })
    .eq("id", projectId)
    .eq("user_id", user.id);
  await recordProjectAuditEvent(supabase, user.id, {
    afterState: { title },
    beforeState: { title: existing.title },
    eventType: "project_renamed",
    projectId,
    summary: `Renamed project from ${existing.title} to ${title}.`
  });

  revalidateProjectPaths(projectId);
  redirect(returnTo);
}

export async function archiveBuildProjectAction(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const returnTo = getText(formData, "returnTo") || "/solution-builder/projects";

  if (!projectId) {
    redirect(returnTo);
  }

  const { supabase, user } = await requireProjectPersistence(returnTo);
  const existing = await getOwnedProject(supabase, user.id, projectId);

  if (!existing) {
    redirect(returnTo);
  }

  await supabase
    .from("build_projects")
    .update({ status: "archived" })
    .eq("id", projectId)
    .eq("user_id", user.id);
  await recordProjectAuditEvent(supabase, user.id, {
    afterState: { status: "archived" },
    beforeState: { status: existing.status },
    eventType: "project_archived",
    projectId,
    summary: `Archived project ${existing.title}.`
  });

  revalidateProjectPaths(projectId);
  redirect(returnTo);
}

export async function restoreBuildProjectAction(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const returnTo = getText(formData, "returnTo") || "/solution-builder/projects";

  if (!projectId) {
    redirect(returnTo);
  }

  const { supabase, user } = await requireProjectPersistence(returnTo);
  const existing = await getOwnedProject(supabase, user.id, projectId);

  if (!existing) {
    redirect(returnTo);
  }

  await supabase
    .from("build_projects")
    .update({ status: "active" })
    .eq("id", projectId)
    .eq("user_id", user.id);
  await recordProjectAuditEvent(supabase, user.id, {
    afterState: { status: "active" },
    beforeState: { status: existing.status },
    eventType: "project_restored",
    projectId,
    summary: `Restored project ${existing.title}.`
  });

  revalidateProjectPaths(projectId);
  redirect(returnTo);
}

export async function deleteBuildProjectAction(formData: FormData) {
  const projectId = getText(formData, "projectId");

  if (!projectId) {
    redirect("/solution-builder/projects");
  }

  const { supabase, user } = await requireProjectPersistence(
    "/solution-builder/projects"
  );

  await supabase
    .from("build_projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  revalidateProjectPaths();
  redirect("/solution-builder/projects");
}

export async function saveBuildProjectSlotAction(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const slotId = getText(formData, "slotId");
  const componentId = getText(formData, "componentId");
  const notes = getText(formData, "notes").slice(0, 800);
  const returnTo =
    getText(formData, "returnTo") ||
    (projectId ? `/solution-builder/projects/${projectId}` : "/solution-builder/projects");

  if (!projectId || !isBuildSlotId(slotId) || !componentId) {
    redirect(returnTo);
  }

  const component = getComponentById(componentId);

  if (!component || !isComponentAllowedForSlot(component, slotId)) {
    redirect(returnTo);
  }

  const { supabase, user } = await requireProjectPersistence(returnTo);
  const existing = await getOwnedProject(supabase, user.id, projectId);

  if (!existing) {
    redirect(returnTo);
  }

  const { data: previousSlot } = await supabase
    .from("build_project_slots")
    .select("component_id,component_category,component_snapshot,notes")
    .eq("project_id", projectId)
    .eq("slot_id", slotId)
    .eq("user_id", user.id)
    .maybeSingle();

  await supabase.from("build_project_slots").upsert(
    {
      component_category: component.category,
      component_id: component.id,
      component_snapshot: component as unknown as Json,
      notes,
      project_id: projectId,
      slot_id: slotId,
      user_id: user.id
    },
    {
      onConflict: "project_id,slot_id"
    }
  );
  await recordProjectAuditEvent(supabase, user.id, {
    afterState: {
      componentCategory: component.category,
      componentId: component.id,
      componentTitle: component.title,
      notes,
      slotId
    },
    beforeState: (previousSlot as unknown as Json) ?? null,
    eventType: "slot_component_saved",
    metadata: { slotId },
    projectId,
    summary: `Saved ${component.title} into ${slotId}.`
  });

  revalidateProjectPaths(projectId);
  redirect(returnTo);
}

export async function clearBuildProjectSlotAction(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const slotId = getText(formData, "slotId");
  const returnTo =
    getText(formData, "returnTo") ||
    (projectId ? `/solution-builder/projects/${projectId}` : "/solution-builder/projects");

  if (!projectId || !isBuildSlotId(slotId)) {
    redirect(returnTo);
  }

  const { supabase, user } = await requireProjectPersistence(returnTo);
  const existing = await getOwnedProject(supabase, user.id, projectId);

  if (!existing) {
    redirect(returnTo);
  }

  const { data: previousSlot } = await supabase
    .from("build_project_slots")
    .select("*")
    .eq("project_id", projectId)
    .eq("slot_id", slotId)
    .eq("user_id", user.id)
    .maybeSingle();

  await supabase
    .from("build_project_slots")
    .delete()
    .eq("project_id", projectId)
    .eq("slot_id", slotId)
    .eq("user_id", user.id);
  await recordProjectAuditEvent(supabase, user.id, {
    beforeState: (previousSlot as unknown as Json) ?? null,
    eventType: "slot_component_cleared",
    metadata: { slotId },
    projectId,
    summary: `Cleared ${slotId} on ${existing.title}.`
  });

  revalidateProjectPaths(projectId);
  redirect(returnTo);
}

export async function addBuildProjectNoteAction(formData: FormData) {
  const projectId = getText(formData, "projectId");
  const note = getText(formData, "note").slice(0, 1200);
  const returnTo =
    getText(formData, "returnTo") ||
    (projectId ? `/solution-builder/projects/${projectId}` : "/solution-builder/projects");

  if (!projectId || !note) {
    redirect(returnTo);
  }

  const { supabase, user } = await requireProjectPersistence(returnTo);
  const existing = await getOwnedProject(supabase, user.id, projectId);

  if (!existing) {
    redirect(returnTo);
  }

  await supabase.from("build_project_notes").insert({
    note,
    project_id: projectId,
    user_id: user.id
  });
  await recordProjectAuditEvent(supabase, user.id, {
    afterState: { note },
    eventType: "project_note_added",
    projectId,
    summary: `Added a note to ${existing.title}.`
  });

  revalidateProjectPaths(projectId);
  redirect(returnTo);
}
