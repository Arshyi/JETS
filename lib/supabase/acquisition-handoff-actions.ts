"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { appVersion } from "@/lib/app-version";
import {
  buildHandoffEvidenceLinksForProject,
  createComponentSnapshotFromMapping,
  getAcquisitionHandoffPlan
} from "@/lib/acquisition/handoff";
import {
  getAcquisitionAnalysisFromRow,
  mapAcquisitionRecordRow
} from "@/lib/acquisition/persistence";
import {
  countryCurrencyDefaults,
  defaultBuildGeneratorPreferences,
  defaultOwnedItems
} from "@/lib/build-generator/config";
import { isBuildSlotId } from "@/lib/solution-builder/projects";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildGeneratorCountries,
  buildGeneratorCurrencies
} from "@/types/build-generator";
import {
  acquisitionHandoffClassificationIds,
  type AcquisitionHandoffClassificationId,
  type AcquisitionHandoffSlotMapping
} from "@/types/acquisition";
import { hardwareUseCases, type HardwareUseCase } from "@/types/hardware";
import type {
  AcquisitionCorrectionRow,
  AcquisitionRecordRow,
  BuildProjectRow,
  BuildProjectSlotRow,
  Json
} from "@/types/database";
import type {
  BuildGeneratorCountry,
  BuildGeneratorCurrency
} from "@/types/build-generator";

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createSupabaseServerClient>>
>;

type HandoffMode =
  | "add-existing"
  | "create-branch"
  | "create-project"
  | "link-evidence";

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function toJson(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function appendParam(path: string, key: string, value: string) {
  const separator = path.includes("?") ? "&" : "?";

  return `${path}${separator}${key}=${encodeURIComponent(value)}`;
}

function redirectWithError(returnTo: string, error: string): never {
  redirect(appendParam(returnTo, "handoffError", error));
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

function parseBudget(value: string, fallback: number) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseMode(value: string): HandoffMode {
  if (
    value === "add-existing" ||
    value === "create-branch" ||
    value === "create-project" ||
    value === "link-evidence"
  ) {
    return value;
  }

  return "add-existing";
}

function parseClassification(value: string): AcquisitionHandoffClassificationId {
  return acquisitionHandoffClassificationIds.includes(
    value as AcquisitionHandoffClassificationId
  )
    ? (value as AcquisitionHandoffClassificationId)
    : "unknown-review-later";
}

function normalizeBranchName(value: string, fallback: string) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-/]+|[-/]+$/g, "")
    .slice(0, 80);

  return normalized || fallback;
}

async function requireHandoffPersistence(returnTo: string) {
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

async function getOwnedAcquisitionDetail(
  supabase: SupabaseServerClient,
  userId: string,
  acquisitionId: string
) {
  const [{ data: row }, { data: corrections }] = await Promise.all([
    supabase
      .from("acquisition_records")
      .select("*")
      .eq("id", acquisitionId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("acquisition_corrections")
      .select("*")
      .eq("acquisition_id", acquisitionId)
      .eq("user_id", userId)
  ]);

  if (!row) {
    return null;
  }

  const acquisitionRow = row as AcquisitionRecordRow;
  const correctionRows = (corrections ?? []) as AcquisitionCorrectionRow[];

  return {
    analysis: getAcquisitionAnalysisFromRow(acquisitionRow),
    record: mapAcquisitionRecordRow(acquisitionRow, correctionRows),
    row: acquisitionRow
  };
}

async function getOwnedProjectWithSlots(
  supabase: SupabaseServerClient,
  userId: string,
  projectId: string
) {
  const [{ data: project }, { data: slots }] = await Promise.all([
    supabase
      .from("build_projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("build_project_slots")
      .select("*")
      .eq("project_id", projectId)
      .eq("user_id", userId)
  ]);

  return {
    project: project as BuildProjectRow | null,
    slots: (slots ?? []) as BuildProjectSlotRow[]
  };
}

async function recordProjectAuditEvent(
  supabase: SupabaseServerClient,
  userId: string,
  input: {
    afterState?: Json | null;
    beforeState?: Json | null;
    eventType: string;
    metadata?: Json;
    projectId: string;
    summary: string;
  }
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

async function recordAcquisitionDecision(
  supabase: SupabaseServerClient,
  userId: string,
  input: {
    acquisitionId: string;
    metadata?: Json;
    projectId: string;
    reason: string;
  }
) {
  await supabase.from("acquisition_decisions").insert({
    acquisition_id: input.acquisitionId,
    decision: "linked-project",
    metadata: input.metadata ?? {},
    reason: input.reason,
    user_id: userId
  });
}

async function createProjectFromAcquisition(
  supabase: SupabaseServerClient,
  userId: string,
  formData: FormData,
  acquisitionTitle: string,
  fallbackBudget: number,
  fallbackCurrency: BuildGeneratorCurrency
) {
  const rawCountry = getText(formData, "country") || "United States";
  const country = parseCountry(rawCountry);
  const currency = parseCurrency(getText(formData, "currency") || fallbackCurrency, country);
  const title =
    getText(formData, "projectTitle").slice(0, 120) ||
    `Acquisition project: ${acquisitionTitle}`.slice(0, 120);
  const purpose = parseUseCase(getText(formData, "purpose"));
  const budget = parseBudget(getText(formData, "budget"), fallbackBudget);
  const { data, error } = await supabase
    .from("build_projects")
    .insert({
      app_version: appVersion,
      branch_notes: `Created from acquisition handoff: ${acquisitionTitle}.`,
      budget,
      country,
      currency,
      owned_items: defaultOwnedItems as unknown as Json,
      preferences: defaultBuildGeneratorPreferences as unknown as Json,
      purpose,
      title,
      user_id: userId
    })
    .select("*")
    .single();

  if (!data || error) {
    return null;
  }

  await recordProjectAuditEvent(supabase, userId, {
    afterState: toJson({ acquisitionTitle, budget, country, currency, purpose, title }),
    eventType: "project_created",
    metadata: toJson({ appVersion, source: "acquisition-handoff" }),
    projectId: data.id,
    summary: `Created project from acquisition ${acquisitionTitle}.`
  });

  return data as BuildProjectRow;
}

async function createBranchFromAcquisition(
  supabase: SupabaseServerClient,
  userId: string,
  sourceProject: BuildProjectRow,
  sourceSlots: BuildProjectSlotRow[],
  formData: FormData,
  acquisitionTitle: string
) {
  const branchName = normalizeBranchName(
    getText(formData, "branchName"),
    `acquisition-${new Date().toISOString().slice(0, 10)}`
  );
  const rootProjectId = sourceProject.root_project_id ?? sourceProject.id;
  const { data, error } = await supabase
    .from("build_projects")
    .insert({
      app_version: appVersion,
      branch_depth: sourceProject.branch_depth + 1,
      branch_name: branchName,
      branch_notes: `Acquisition branch using ${acquisitionTitle}.`,
      branch_source: "import",
      budget: sourceProject.budget,
      country: sourceProject.country,
      currency: sourceProject.currency,
      owned_items: sourceProject.owned_items,
      parent_project_id: sourceProject.id,
      preferences: sourceProject.preferences,
      purpose: sourceProject.purpose,
      root_project_id: rootProjectId,
      source_optimization_suggestion_ids: [],
      status: "active",
      title: `${sourceProject.title} (${branchName})`,
      user_id: userId
    })
    .select("*")
    .single();

  if (!data || error) {
    return null;
  }

  if (sourceSlots.length > 0) {
    await supabase.from("build_project_slots").insert(
      sourceSlots.map((slot) => ({
        component_category: slot.component_category,
        component_id: slot.component_id,
        component_snapshot: slot.component_snapshot,
        notes: slot.notes,
        project_id: data.id,
        slot_id: slot.slot_id,
        user_id: userId
      }))
    );
  }

  await recordProjectAuditEvent(supabase, userId, {
    afterState: toJson({
      acquisitionTitle,
      branchName,
      parentProjectId: sourceProject.id,
      rootProjectId
    }),
    eventType: "project_branch_created",
    metadata: toJson({ appVersion, source: "acquisition-handoff" }),
    projectId: data.id,
    summary: `Created acquisition branch ${branchName} from ${sourceProject.title}.`
  });

  await recordProjectAuditEvent(supabase, userId, {
    afterState: toJson({ branchProjectId: data.id, branchName }),
    eventType: "project_branch_created_from_source",
    metadata: toJson({ branchProjectId: data.id, source: "acquisition-handoff" }),
    projectId: sourceProject.id,
    summary: `Created acquisition branch ${branchName}.`
  });

  return data as BuildProjectRow;
}

function getAcceptedMappings(
  formData: FormData,
  mappings: AcquisitionHandoffSlotMapping[]
) {
  const acceptedSlotIds = new Set(
    formData
      .getAll("acceptedSlotIds")
      .filter((value): value is string => typeof value === "string")
      .filter(isBuildSlotId)
  );

  return mappings
    .filter((mapping) => acceptedSlotIds.has(mapping.slotId))
    .map((mapping) => {
      const correctedLabel = getText(formData, `slotLabel:${mapping.slotId}`);

      return correctedLabel
        ? { ...mapping, proposedLabel: correctedLabel.slice(0, 180) }
        : mapping;
    });
}

async function applyHandoffToProject(input: {
  acceptedMappings: AcquisitionHandoffSlotMapping[];
  acquisitionId: string;
  classification: AcquisitionHandoffClassificationId;
  mode: HandoffMode;
  planMappings: AcquisitionHandoffSlotMapping[];
  project: BuildProjectRow;
  record: ReturnType<typeof mapAcquisitionRecordRow>;
  rejectedMappings: AcquisitionHandoffSlotMapping[];
  supabase: SupabaseServerClient;
  userId: string;
}) {
  const evidenceLinks = buildHandoffEvidenceLinksForProject(
    input.acquisitionId,
    input.project.id,
    input.acceptedMappings
  );

  await recordProjectAuditEvent(input.supabase, input.userId, {
    afterState: toJson({
      acquisitionId: input.acquisitionId,
      classification: input.classification,
      mode: input.mode
    }),
    eventType: "acquisition_linked",
    metadata: toJson({ acquisitionId: input.acquisitionId }),
    projectId: input.project.id,
    summary: `Linked acquisition ${input.record.snapshot.title}.`
  });

  for (const mapping of input.planMappings) {
    await recordProjectAuditEvent(input.supabase, input.userId, {
      afterState: toJson(mapping),
      eventType: "slot_proposed",
      metadata: toJson({
        acquisitionId: input.acquisitionId,
        confidence: mapping.confidence,
        slotId: mapping.slotId
      }),
      projectId: input.project.id,
      summary: `Proposed ${mapping.proposedLabel} for ${mapping.slotLabel}.`
    });
  }

  for (const mapping of input.acceptedMappings) {
    const { data: previousSlot } = await input.supabase
      .from("build_project_slots")
      .select("*")
      .eq("project_id", input.project.id)
      .eq("slot_id", mapping.slotId)
      .eq("user_id", input.userId)
      .maybeSingle();
    const snapshot = createComponentSnapshotFromMapping({
      classification: input.classification,
      mapping,
      record: input.record
    });
    const componentSnapshot = {
      ...snapshot,
      acquisitionEvidence: {
        acquisitionId: input.acquisitionId,
        confidence: mapping.confidence,
        evidenceId: mapping.evidenceId,
        fieldId: mapping.fieldId,
        sourceText: mapping.sourceText
      }
    };

    await input.supabase.from("build_project_slots").upsert(
      {
        component_category: mapping.componentCategory,
        component_id: snapshot.id,
        component_snapshot: toJson(componentSnapshot),
        notes: `Acquisition handoff from ${input.record.snapshot.title}. ${mapping.reason}`,
        project_id: input.project.id,
        slot_id: mapping.slotId,
        user_id: input.userId
      },
      { onConflict: "project_id,slot_id" }
    );
    await recordProjectAuditEvent(input.supabase, input.userId, {
      afterState: toJson({
        acquisitionId: input.acquisitionId,
        componentId: snapshot.id,
        slotId: mapping.slotId,
        title: mapping.proposedLabel
      }),
      beforeState: (previousSlot as unknown as Json) ?? null,
      eventType: "slot_accepted",
      metadata: toJson({
        acquisitionId: input.acquisitionId,
        confidence: mapping.confidence,
        evidenceId: mapping.evidenceId,
        slotId: mapping.slotId
      }),
      projectId: input.project.id,
      summary: `Accepted ${mapping.proposedLabel} for ${mapping.slotLabel}.`
    });
  }

  for (const mapping of input.rejectedMappings) {
    await recordProjectAuditEvent(input.supabase, input.userId, {
      afterState: toJson({
        acquisitionId: input.acquisitionId,
        slotId: mapping.slotId,
        title: mapping.proposedLabel
      }),
      eventType: "slot_rejected",
      metadata: toJson({
        acquisitionId: input.acquisitionId,
        confidence: mapping.confidence,
        evidenceId: mapping.evidenceId,
        slotId: mapping.slotId
      }),
      projectId: input.project.id,
      summary: `Rejected ${mapping.proposedLabel} for ${mapping.slotLabel}.`
    });
  }

  await input.supabase.from("acquisition_project_links").upsert(
    {
      accepted_slot_ids: input.acceptedMappings.map((mapping) => mapping.slotId),
      acquisition_id: input.acquisitionId,
      completed_at: new Date().toISOString(),
      evidence_links: toJson(evidenceLinks),
      handoff_classification: input.classification,
      handoff_status: input.mode === "link-evidence" ? "evidence-only" : "applied",
      link_type:
        input.mode === "create-branch"
          ? "branch-from-acquisition"
          : input.mode === "create-project"
            ? "created-from-acquisition"
            : input.mode === "link-evidence"
              ? "evidence-only"
              : "applied-to-project",
      project_id: input.project.id,
      rejected_slot_ids: input.rejectedMappings.map((mapping) => mapping.slotId),
      slot_mappings: toJson(input.planMappings),
      user_id: input.userId
    },
    { onConflict: "acquisition_id,project_id" }
  );

  await recordProjectAuditEvent(input.supabase, input.userId, {
    afterState: toJson({
      acceptedSlotIds: input.acceptedMappings.map((mapping) => mapping.slotId),
      acquisitionId: input.acquisitionId,
      classification: input.classification,
      evidenceLinks,
      rejectedSlotIds: input.rejectedMappings.map((mapping) => mapping.slotId)
    }),
    eventType: "handoff_completed",
    metadata: toJson({
      acquisitionId: input.acquisitionId,
      mode: input.mode
    }),
    projectId: input.project.id,
    summary: `Completed acquisition handoff from ${input.record.snapshot.title}.`
  });

  await recordAcquisitionDecision(input.supabase, input.userId, {
    acquisitionId: input.acquisitionId,
    metadata: toJson({
      acceptedSlotIds: input.acceptedMappings.map((mapping) => mapping.slotId),
      classification: input.classification,
      mode: input.mode,
      projectId: input.project.id,
      rejectedSlotIds: input.rejectedMappings.map((mapping) => mapping.slotId)
    }),
    projectId: input.project.id,
    reason: `Completed ${input.mode} handoff to ${input.project.title}.`
  });
}

function revalidateHandoffPaths(acquisitionId: string, projectId: string) {
  revalidatePath("/acquire/history");
  revalidatePath(`/acquire/history/${acquisitionId}`);
  revalidatePath("/solution-builder/projects");
  revalidatePath(`/solution-builder/projects/${projectId}`);
}

export async function handoffAcquisitionToProjectAction(formData: FormData) {
  const returnTo = getText(formData, "returnTo") || "/acquire/history";
  const acquisitionId = getText(formData, "acquisitionId");
  const mode = parseMode(getText(formData, "handoffMode"));
  const classification = parseClassification(getText(formData, "classification"));
  const { supabase, user } = await requireHandoffPersistence(returnTo);
  const acquisition = await getOwnedAcquisitionDetail(
    supabase,
    user.id,
    acquisitionId
  );

  if (!acquisition) {
    redirectWithError(returnTo, "acquisition-not-found");
  }

  const plan = getAcquisitionHandoffPlan(
    acquisition.record,
    acquisition.analysis,
    "pending-project"
  );
  const acceptedMappings =
    mode === "link-evidence" ? [] : getAcceptedMappings(formData, plan.mappings);
  const acceptedIds = new Set(acceptedMappings.map((mapping) => mapping.slotId));
  const rejectedMappings = plan.mappings.filter(
    (mapping) => !acceptedIds.has(mapping.slotId)
  );
  const fallbackCurrency =
    acquisition.record.draft.currency === "AED" ? "AED" : "USD";
  const fallbackBudget = acquisition.record.snapshot.priceAmount ?? 850;
  let targetProject: BuildProjectRow | null = null;

  if (mode === "create-project") {
    targetProject = await createProjectFromAcquisition(
      supabase,
      user.id,
      formData,
      acquisition.record.snapshot.title,
      fallbackBudget,
      fallbackCurrency
    );
  } else {
    const projectId = getText(formData, "projectId");
    const { project, slots } = await getOwnedProjectWithSlots(
      supabase,
      user.id,
      projectId
    );

    if (!project) {
      redirectWithError(returnTo, "project-not-found");
    }

    if (mode === "create-branch") {
      targetProject = await createBranchFromAcquisition(
        supabase,
        user.id,
        project,
        slots,
        formData,
        acquisition.record.snapshot.title
      );
    } else {
      targetProject = project;
    }
  }

  if (!targetProject) {
    redirectWithError(returnTo, "project-create-failed");
  }

  await applyHandoffToProject({
    acceptedMappings,
    acquisitionId,
    classification,
    mode,
    planMappings: plan.mappings,
    project: targetProject,
    record: acquisition.record,
    rejectedMappings,
    supabase,
    userId: user.id
  });

  revalidateHandoffPaths(acquisitionId, targetProject.id);
  redirect(`/solution-builder/projects/${targetProject.id}?handoff=acquisition`);
}
