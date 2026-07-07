"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { appVersion } from "@/lib/app-version";
import {
  defaultBuildGeneratorPreferences,
  defaultOwnedItems
} from "@/lib/build-generator/config";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildGeneratorCountries,
  buildGeneratorCurrencies,
  ownedItemKeys
} from "@/types/build-generator";
import { hardwareUseCases, useCaseLabels } from "@/types/hardware";
import { strategyTypeIds } from "@/types/strategy";
import type {
  BuildGeneratorCountry,
  BuildGeneratorCurrency,
  BuildGeneratorPreferences,
  OwnedItems
} from "@/types/build-generator";
import type { Json } from "@/types/database";
import type { HardwareUseCase } from "@/types/hardware";
import type {
  HardwareStrategyRecommendation,
  HardwareStrategyTypeId
} from "@/types/strategy";

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createSupabaseServerClient>>
>;

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function appendParam(path: string, key: string, value: string) {
  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}${key}=${encodeURIComponent(value)}`;
}

function parseBudget(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 850;
}

function parseCountry(value: string): BuildGeneratorCountry {
  return buildGeneratorCountries.includes(value as BuildGeneratorCountry)
    ? (value as BuildGeneratorCountry)
    : "United States";
}

function parseCurrency(value: string): BuildGeneratorCurrency {
  return buildGeneratorCurrencies.includes(value as BuildGeneratorCurrency)
    ? (value as BuildGeneratorCurrency)
    : "USD";
}

function parseUseCase(value: string): HardwareUseCase {
  return hardwareUseCases.includes(value as HardwareUseCase)
    ? (value as HardwareUseCase)
    : "engineering";
}

function parseStrategyType(value: string): HardwareStrategyTypeId | null {
  return strategyTypeIds.includes(value as HardwareStrategyTypeId)
    ? (value as HardwareStrategyTypeId)
    : null;
}

function parseOwnedHardware(formData: FormData): OwnedItems {
  return ownedItemKeys.reduce((items, key) => {
    items[key] = getText(formData, `owned:${key}`) === "on";
    return items;
  }, { ...defaultOwnedItems });
}

function parseStrategySnapshot(value: string) {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value) as unknown;

    if (!isRecord(parsed)) {
      return null;
    }

    const type = parseStrategyType(String(parsed.type ?? ""));
    const title = typeof parsed.title === "string" ? parsed.title : null;

    if (!type || !title) {
      return null;
    }

    return parsed as unknown as HardwareStrategyRecommendation;
  } catch {
    return null;
  }
}

function getStrategyPreferences(
  strategyType: HardwareStrategyTypeId,
  purpose: HardwareUseCase
): BuildGeneratorPreferences {
  return {
    ...defaultBuildGeneratorPreferences,
    lowestPricePriority:
      strategyType === "upgrade-existing-machine" ||
      strategyType === "wait-for-better-value",
    lowPowerUsage: strategyType === "mini-pc",
    preferDesktops:
      strategyType !== "laptop-egpu" && strategyType !== "mini-pc",
    preferLaptops: strategyType === "laptop-egpu",
    preferWorkstations:
      strategyType === "buy-used-workstation" ||
      strategyType === "server-conversion" ||
      purpose === "engineering" ||
      purpose === "cad",
    quietOperation: strategyType === "mini-pc",
    smallFormFactor: strategyType === "mini-pc",
    upgradeabilityPriority:
      strategyType === "build-from-scratch" ||
      strategyType === "buy-used-workstation" ||
      strategyType === "hybrid-strategy"
  };
}

async function requireStrategyPersistence(returnTo: string) {
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

async function recordProjectAuditEvent(
  supabase: SupabaseServerClient,
  userId: string,
  input: {
    afterState?: Json | null;
    eventType: string;
    metadata?: Json;
    projectId: string;
    summary: string;
  }
) {
  await supabase.from("build_project_audit_events").insert({
    after_state: input.afterState ?? null,
    before_state: null,
    event_type: input.eventType,
    metadata: input.metadata ?? {},
    project_id: input.projectId,
    summary: input.summary,
    user_id: userId
  });
}

export async function createProjectFromStrategyAction(formData: FormData) {
  const returnTo = getText(formData, "returnTo") || "/strategy";
  const snapshot = parseStrategySnapshot(getText(formData, "strategySnapshot"));
  const strategyType =
    parseStrategyType(getText(formData, "strategyType")) ?? snapshot?.type ?? null;

  if (!strategyType || snapshot?.shouldCreateProject === false) {
    redirect(appendParam(returnTo, "strategyError", "not-project-ready"));
  }

  const title = (
    getText(formData, "projectTitle") ||
    snapshot?.projectSeed?.title ||
    `${snapshot?.title ?? "Strategy"} project`
  ).slice(0, 120);
  const country = parseCountry(getText(formData, "country"));
  const currency = parseCurrency(getText(formData, "currency"));
  const budget = parseBudget(getText(formData, "budget"));
  const purpose = parseUseCase(getText(formData, "purpose"));
  const ownedHardware = parseOwnedHardware(formData);
  const preferences = getStrategyPreferences(strategyType, purpose);
  const strategyTitle = (snapshot?.title ?? strategyType).slice(0, 120);
  const branchNotes =
    snapshot?.projectSeed?.branchNotes ??
    `Strategy: ${strategyTitle}. Primary goal: ${useCaseLabels[purpose]}.`;
  const { supabase, user } = await requireStrategyPersistence(returnTo);
  const { data, error } = await supabase
    .from("build_projects")
    .insert({
      app_version: appVersion,
      branch_notes: branchNotes,
      budget,
      country,
      currency,
      owned_items: ownedHardware as unknown as Json,
      preferences: preferences as unknown as Json,
      purpose,
      strategy_id: strategyType,
      strategy_snapshot: toJson(snapshot ?? { strategyType, strategyTitle }),
      strategy_title: strategyTitle,
      title,
      user_id: user.id
    })
    .select("id")
    .single();

  if (!data || error) {
    redirect(appendParam(returnTo, "strategyError", "project-create-failed"));
  }

  await supabase.from("build_project_notes").insert({
    note:
      snapshot?.whyChosen?.slice(0, 3).join(" ") ||
      `Created from ${strategyTitle}.`,
    project_id: data.id,
    user_id: user.id
  });
  await recordProjectAuditEvent(supabase, user.id, {
    afterState: toJson({
      budget,
      country,
      currency,
      purpose,
      strategyId: strategyType,
      strategyTitle,
      title
    }),
    eventType: "strategy_project_created",
    metadata: toJson({ appVersion, source: "strategy-engine" }),
    projectId: data.id,
    summary: `Created project ${title} from strategy ${strategyTitle}.`
  });

  revalidatePath("/strategy");
  revalidatePath("/solution-builder/projects");
  revalidatePath(`/solution-builder/projects/${data.id}`);
  redirect(`/solution-builder/projects/${data.id}?createdFrom=strategy`);
}
