"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createAcquisitionPersistencePayload,
  getPersistableCorrections,
  normalizeAcquisitionStatus,
  parseAcquisitionCorrections,
  parseAcquisitionDraft,
  persistedAcquisitionStatuses
} from "@/lib/acquisition/persistence";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AcquisitionCorrectionFieldId,
  AcquisitionDecisionStatus
} from "@/types/acquisition";
import type { Database, Json } from "@/types/database";

type SupabaseServerClient = NonNullable<
  Awaited<ReturnType<typeof createSupabaseServerClient>>
>;

type AcquisitionDecision =
  Database["public"]["Tables"]["acquisition_decisions"]["Insert"]["decision"];

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
  redirect(appendParam(returnTo, "acquisitionError", error));
}

function parseStatus(value: string): AcquisitionDecisionStatus {
  return persistedAcquisitionStatuses.includes(value as AcquisitionDecisionStatus)
    ? (value as AcquisitionDecisionStatus)
    : "reviewing";
}

function getCorrectionField(value: string): AcquisitionCorrectionFieldId {
  const fields: AcquisitionCorrectionFieldId[] = [
    "cpu",
    "gpu",
    "ram",
    "platform",
    "price",
    "storage"
  ];

  return fields.includes(value as AcquisitionCorrectionFieldId)
    ? (value as AcquisitionCorrectionFieldId)
    : "platform";
}

async function requireAcquisitionPersistence(returnTo: string) {
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

async function getOwnedAcquisition(
  supabase: SupabaseServerClient,
  userId: string,
  acquisitionId: string
)
{
  const { data } = await supabase
    .from("acquisition_records")
    .select("id,title,status")
    .eq("id", acquisitionId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

async function getOwnedProject(
  supabase: SupabaseServerClient,
  userId: string,
  projectId: string
) {
  const { data } = await supabase
    .from("build_projects")
    .select("id,title")
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

async function recordAcquisitionDecision(
  supabase: SupabaseServerClient,
  userId: string,
  input: {
    acquisitionId: string;
    decision: AcquisitionDecision;
    metadata?: Json;
    reason?: string | null;
  }
) {
  await supabase.from("acquisition_decisions").insert({
    acquisition_id: input.acquisitionId,
    decision: input.decision,
    metadata: input.metadata ?? {},
    reason: input.reason ?? null,
    user_id: userId
  });
}

function revalidateAcquisitionPaths(acquisitionId?: string) {
  revalidatePath("/acquire");
  revalidatePath("/acquire/history");

  if (acquisitionId) {
    revalidatePath(`/acquire/history/${acquisitionId}`);
  }
}

function parseCaptureForm(formData: FormData, returnTo: string) {
  try {
    return {
      corrections: parseAcquisitionCorrections(getText(formData, "correctionsJson")),
      draft: parseAcquisitionDraft(getText(formData, "draftJson"))
    };
  } catch {
    redirectWithError(returnTo, "invalid-acquisition-payload");
  }
}

async function persistCorrections(
  supabase: SupabaseServerClient,
  userId: string,
  acquisitionId: string,
  corrections: ReturnType<typeof parseAcquisitionCorrections>,
  fields: ReturnType<typeof createAcquisitionPersistencePayload>["analysis"]["effectiveFields"],
  evidenceRecords: ReturnType<typeof createAcquisitionPersistencePayload>["analysis"]["correctedEvidence"]
) {
  const persistableCorrections = getPersistableCorrections(corrections);

  if (persistableCorrections.length === 0) {
    return;
  }

  await supabase.from("acquisition_corrections").insert(
    persistableCorrections.map((correction) => {
      const parsedField = fields.find((field) => field.fieldId === correction.fieldId);
      const evidence = evidenceRecords.find((record) =>
        record.id.endsWith(`correction:${correction.fieldId}`)
      );

      return {
        acquisition_id: acquisitionId,
        before_value: parsedField?.value ?? null,
        corrected_value: correction.isUnknown ? null : correction.value.trim(),
        evidence_payload: toJson(evidence ?? {}),
        field_id: correction.fieldId,
        is_unknown: correction.isUnknown,
        user_id: userId
      };
    })
  );
}

export async function saveAcquisitionAction(formData: FormData) {
  const returnTo = getText(formData, "returnTo") || "/acquire/history";
  const { supabase, user } = await requireAcquisitionPersistence(returnTo);
  const status = parseStatus(getText(formData, "status"));
  const { corrections, draft } = parseCaptureForm(formData, returnTo);

  if (!draft.title || !draft.description || !draft.priceText) {
    redirectWithError(returnTo, "missing-required-fields");
  }

  const payload = createAcquisitionPersistencePayload({
    corrections,
    draft,
    status,
    userId: user.id
  });
  const { data, error } = await supabase
    .from("acquisition_records")
    .insert(payload.row)
    .select("id")
    .single();

  if (error || !data) {
    redirectWithError(returnTo, "save-failed");
  }

  await persistCorrections(
    supabase,
    user.id,
    data.id,
    corrections,
    payload.analysis.effectiveFields,
    payload.analysis.correctedEvidence
  );
  await recordAcquisitionDecision(supabase, user.id, {
    acquisitionId: data.id,
    decision: "saved",
    metadata: toJson({
      readiness: payload.analysis.readiness,
      status
    }),
    reason: `Saved acquisition as ${status}.`
  });

  revalidateAcquisitionPaths(data.id);
  redirect(`/acquire/history/${data.id}?saved=1`);
}

export async function updateAcquisitionAction(formData: FormData) {
  const returnTo = getText(formData, "returnTo") || "/acquire/history";
  const acquisitionId = getText(formData, "acquisitionId");
  const { supabase, user } = await requireAcquisitionPersistence(returnTo);
  const owned = await getOwnedAcquisition(supabase, user.id, acquisitionId);

  if (!owned) {
    redirectWithError(returnTo, "acquisition-not-found");
  }

  const { corrections, draft } = parseCaptureForm(formData, returnTo);
  const status = parseStatus(getText(formData, "status") || owned.status);
  const payload = createAcquisitionPersistencePayload({
    corrections,
    draft,
    status,
    userId: user.id
  });
  const { error } = await supabase
    .from("acquisition_records")
    .update(payload.row)
    .eq("id", acquisitionId)
    .eq("user_id", user.id);

  if (error) {
    redirectWithError(returnTo, "update-failed");
  }

  await supabase
    .from("acquisition_corrections")
    .delete()
    .eq("acquisition_id", acquisitionId)
    .eq("user_id", user.id);
  await persistCorrections(
    supabase,
    user.id,
    acquisitionId,
    corrections,
    payload.analysis.effectiveFields,
    payload.analysis.correctedEvidence
  );
  await recordAcquisitionDecision(supabase, user.id, {
    acquisitionId,
    decision: "updated",
    metadata: toJson({
      status,
      title: draft.title
    }),
    reason: "Updated saved acquisition payload."
  });

  revalidateAcquisitionPaths(acquisitionId);
  redirect(appendParam(returnTo, "updated", "1"));
}

async function updateAcquisitionStatusAction(
  formData: FormData,
  status: AcquisitionDecisionStatus,
  decision: AcquisitionDecision,
  reason: string
) {
  const returnTo = getText(formData, "returnTo") || "/acquire/history";
  const acquisitionId = getText(formData, "acquisitionId");
  const { supabase, user } = await requireAcquisitionPersistence(returnTo);
  const owned = await getOwnedAcquisition(supabase, user.id, acquisitionId);

  if (!owned) {
    redirectWithError(returnTo, "acquisition-not-found");
  }

  const { error } = await supabase
    .from("acquisition_records")
    .update({ status: normalizeAcquisitionStatus(status) })
    .eq("id", acquisitionId)
    .eq("user_id", user.id);

  if (error) {
    redirectWithError(returnTo, "status-update-failed");
  }

  await recordAcquisitionDecision(supabase, user.id, {
    acquisitionId,
    decision,
    metadata: toJson({
      previousStatus: owned.status,
      status
    }),
    reason
  });

  revalidateAcquisitionPaths(acquisitionId);
  redirect(appendParam(returnTo, "status", status));
}

export async function archiveAcquisitionAction(formData: FormData) {
  await updateAcquisitionStatusAction(
    formData,
    "archived",
    "archived",
    "Archived acquisition."
  );
}

export async function markPurchasedAcquisitionAction(formData: FormData) {
  await updateAcquisitionStatusAction(
    formData,
    "purchased",
    "purchased",
    "Marked acquisition purchased."
  );
}

export async function markRejectedAcquisitionAction(formData: FormData) {
  await updateAcquisitionStatusAction(
    formData,
    "rejected",
    "rejected",
    "Rejected acquisition."
  );
}

export async function markReadyAcquisitionAction(formData: FormData) {
  await updateAcquisitionStatusAction(
    formData,
    "ready",
    "updated",
    "Marked acquisition ready for project handoff."
  );
}

export async function addAcquisitionNoteAction(formData: FormData) {
  const returnTo = getText(formData, "returnTo") || "/acquire/history";
  const acquisitionId = getText(formData, "acquisitionId");
  const note = getText(formData, "note").slice(0, 2000);
  const { supabase, user } = await requireAcquisitionPersistence(returnTo);
  const owned = await getOwnedAcquisition(supabase, user.id, acquisitionId);

  if (!owned) {
    redirectWithError(returnTo, "acquisition-not-found");
  }

  if (!note) {
    redirectWithError(returnTo, "empty-note");
  }

  const { error } = await supabase.from("acquisition_notes").insert({
    acquisition_id: acquisitionId,
    body: note,
    note_type: getText(formData, "noteType") || "general",
    user_id: user.id
  });

  if (error) {
    redirectWithError(returnTo, "note-failed");
  }

  await recordAcquisitionDecision(supabase, user.id, {
    acquisitionId,
    decision: "note-added",
    metadata: toJson({ noteLength: note.length }),
    reason: "Added acquisition note."
  });

  revalidateAcquisitionPaths(acquisitionId);
  redirect(appendParam(returnTo, "note", "added"));
}

export async function addAcquisitionCorrectionAction(formData: FormData) {
  const returnTo = getText(formData, "returnTo") || "/acquire/history";
  const acquisitionId = getText(formData, "acquisitionId");
  const fieldId = getCorrectionField(getText(formData, "fieldId"));
  const value = getText(formData, "correctedValue").slice(0, 240);
  const isUnknown = getText(formData, "isUnknown") === "on";
  const { supabase, user } = await requireAcquisitionPersistence(returnTo);
  const owned = await getOwnedAcquisition(supabase, user.id, acquisitionId);

  if (!owned) {
    redirectWithError(returnTo, "acquisition-not-found");
  }

  if (!value && !isUnknown) {
    redirectWithError(returnTo, "empty-correction");
  }

  const { error } = await supabase.from("acquisition_corrections").insert({
    acquisition_id: acquisitionId,
    before_value: getText(formData, "beforeValue") || null,
    corrected_value: isUnknown ? null : value,
    evidence_payload: toJson({
      correctionSource: "acquisition-detail",
      fieldId,
      value: isUnknown ? "Unknown" : value
    }),
    field_id: fieldId,
    is_unknown: isUnknown,
    user_id: user.id
  });

  if (error) {
    redirectWithError(returnTo, "correction-failed");
  }

  await recordAcquisitionDecision(supabase, user.id, {
    acquisitionId,
    decision: "correction-added",
    metadata: toJson({
      fieldId,
      isUnknown,
      value
    }),
    reason: `Added ${fieldId} correction.`
  });

  revalidateAcquisitionPaths(acquisitionId);
  redirect(appendParam(returnTo, "correction", "added"));
}

export async function linkAcquisitionToProjectAction(formData: FormData) {
  const returnTo = getText(formData, "returnTo") || "/acquire/history";
  const acquisitionId = getText(formData, "acquisitionId");
  const projectId = getText(formData, "projectId");
  const { supabase, user } = await requireAcquisitionPersistence(returnTo);
  const [ownedAcquisition, ownedProject] = await Promise.all([
    getOwnedAcquisition(supabase, user.id, acquisitionId),
    getOwnedProject(supabase, user.id, projectId)
  ]);

  if (!ownedAcquisition || !ownedProject) {
    redirectWithError(returnTo, "link-target-not-found");
  }

  const { error } = await supabase.from("acquisition_project_links").upsert(
    {
      acquisition_id: acquisitionId,
      link_type: getText(formData, "linkType") || "created-from-acquisition",
      project_id: projectId,
      user_id: user.id
    },
    { onConflict: "acquisition_id,project_id" }
  );

  if (error) {
    redirectWithError(returnTo, "project-link-failed");
  }

  await recordAcquisitionDecision(supabase, user.id, {
    acquisitionId,
    decision: "linked-project",
    metadata: toJson({
      projectId,
      projectTitle: ownedProject.title
    }),
    reason: `Linked acquisition to project ${ownedProject.title}.`
  });

  revalidateAcquisitionPaths(acquisitionId);
  revalidatePath(`/solution-builder/projects/${projectId}`);
  redirect(appendParam(returnTo, "project", "linked"));
}

export async function compareSavedAcquisitionsAction(formData: FormData) {
  const returnTo = getText(formData, "returnTo") || "/acquire/history";
  const rawIds = getText(formData, "acquisitionIds");
  const title =
    getText(formData, "title").slice(0, 160) ||
    `Acquisition compare ${new Date().toISOString().slice(0, 10)}`;
  const { supabase, user } = await requireAcquisitionPersistence(returnTo);
  let acquisitionIds: string[] = [];

  try {
    acquisitionIds = (JSON.parse(rawIds) as string[]).slice(0, 3);
  } catch {
    redirectWithError(returnTo, "invalid-compare-set");
  }

  if (acquisitionIds.length < 2) {
    redirectWithError(returnTo, "compare-needs-two");
  }

  const { data: ownedRows } = await supabase
    .from("acquisition_records")
    .select("id")
    .eq("user_id", user.id)
    .in("id", acquisitionIds);
  const ownedIds = new Set((ownedRows ?? []).map((row) => row.id));
  const filteredIds = acquisitionIds.filter((id) => ownedIds.has(id));

  if (filteredIds.length < 2) {
    redirectWithError(returnTo, "compare-target-not-found");
  }

  const { error } = await supabase.from("acquisition_compare_sets").insert({
    acquisition_ids: filteredIds,
    title,
    user_id: user.id
  });

  if (error) {
    redirectWithError(returnTo, "compare-save-failed");
  }

  await Promise.all(
    filteredIds.map((acquisitionId) =>
      recordAcquisitionDecision(supabase, user.id, {
        acquisitionId,
        decision: "compare-created",
        metadata: toJson({
          acquisitionIds: filteredIds,
          title
        }),
        reason: `Added acquisition to compare set ${title}.`
      })
    )
  );

  revalidateAcquisitionPaths();
  redirect(appendParam(returnTo, "compare", "saved"));
}
