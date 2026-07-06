"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { appVersion } from "@/lib/app-version";
import { getEvidenceSourceTrust } from "@/lib/evidence-engine";
import { getAdminGate } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service-role";
import {
  evidenceConfidenceLevels,
  evidenceExtractionMethods,
  evidenceSourceTypes,
  evidenceSubjectTypes,
  evidenceVerificationStatuses
} from "@/types/evidence";
import type {
  EvidenceConfidence,
  EvidenceExtractionMethod,
  EvidenceSourceType,
  EvidenceSubjectType,
  EvidenceVerificationStatus
} from "@/types/evidence";
import type { Json } from "@/types/database";

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function normalizeSourceKey(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

function parseOption<T extends string>(
  value: string,
  options: readonly T[],
  fallback: T
) {
  return options.includes(value as T) ? (value as T) : fallback;
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

function revalidateEvidencePaths(recordId?: string, platformId?: string | null) {
  revalidatePath("/evidence");
  revalidatePath("/evidence/review");
  revalidatePath("/evidence/conflicts");

  if (recordId) {
    revalidatePath(`/evidence/${recordId}`);
  }

  if (platformId) {
    revalidatePath(`/evidence/platforms/${platformId}`);
  }
}

export async function submitEvidenceRecordAction(formData: FormData) {
  const returnTo = getText(formData, "returnTo") || "/evidence";
  const { supabase, user } = await requireSignedIn(returnTo);
  const sourceType = parseOption<EvidenceSourceType>(
    getText(formData, "sourceType"),
    evidenceSourceTypes,
    "user-submission"
  );
  const subjectType = parseOption<EvidenceSubjectType>(
    getText(formData, "subjectType"),
    evidenceSubjectTypes,
    "platform-profile"
  );
  const confidence = parseOption<EvidenceConfidence>(
    getText(formData, "confidence"),
    evidenceConfidenceLevels,
    "medium"
  );
  const extractionMethod = parseOption<EvidenceExtractionMethod>(
    getText(formData, "extractionMethod"),
    evidenceExtractionMethods,
    "manual-curation"
  );
  const claim = getText(formData, "claim").slice(0, 500);
  const supportingText = getText(formData, "supportingText").slice(0, 1600);
  const sourceTitle =
    getText(formData, "sourceTitle").slice(0, 240) || "User-submitted evidence";
  const sourceUrl = getText(formData, "sourceUrl").slice(0, 600) || null;
  const subjectId = getText(formData, "subjectId").slice(0, 160);
  const platformId = getText(formData, "platformId").slice(0, 120) || null;

  if (!claim || !supportingText || !subjectId) {
    redirect(`${returnTo}?evidenceError=missing-fields`);
  }

  const sourceKey = [
    "user",
    user.id,
    normalizeSourceKey(sourceTitle) || "evidence-source",
    Date.now()
  ].join("-");
  const { data: source } = await supabase
    .from("evidence_sources")
    .insert({
      source_key: sourceKey,
      source_type: sourceType,
      submitted_by: user.id,
      title: sourceTitle,
      trust_weight: getEvidenceSourceTrust(sourceType),
      url: sourceUrl,
      verification_status: "pending-review",
      visibility: "public"
    })
    .select("id")
    .single();
  const { data: record } = await supabase
    .from("evidence_records")
    .insert({
      app_version: appVersion,
      claim,
      confidence,
      extraction_method: extractionMethod,
      platform_id: platformId,
      source_id: source?.id ?? null,
      source_title: sourceTitle,
      source_type: sourceType,
      source_url: sourceUrl,
      subject_id: subjectId,
      subject_type: subjectType,
      submitted_by: user.id,
      supporting_text: supportingText,
      verification_status: "pending-review",
      visibility: "public"
    })
    .select("id")
    .single();

  if (record?.id) {
    await supabase.from("evidence_review_notes").insert({
      action: "submitted",
      after_state: {
        claim,
        confidence,
        extractionMethod,
        platformId,
        sourceTitle,
        sourceType,
        subjectId,
        subjectType
      } as Json,
      created_by: user.id,
      evidence_record_id: record.id,
      note: "Evidence submitted for review.",
      reason: "User submission"
    });
  }

  revalidateEvidencePaths(record?.id, platformId);
  redirect(record?.id ? `/evidence/${record.id}` : returnTo);
}

export async function reviewEvidenceRecordAction(formData: FormData) {
  const recordId = getText(formData, "recordId");
  const returnTo =
    getText(formData, "returnTo") || (recordId ? `/evidence/${recordId}` : "/evidence/review");
  const nextStatus = parseOption<EvidenceVerificationStatus>(
    getText(formData, "verificationStatus"),
    evidenceVerificationStatuses,
    "pending-review"
  );
  const reason = getText(formData, "reason").slice(0, 1200);

  if (!recordId) {
    redirect(returnTo);
  }

  const gate = await getAdminGate();

  if (!gate.isAllowed) {
    redirect(`${returnTo}?evidenceError=moderator-required`);
  }

  const authClient = await createSupabaseServerClient();
  const serviceClient = createSupabaseServiceRoleClient();

  if (!authClient || !serviceClient) {
    redirect(`${returnTo}?evidenceError=service-role-required`);
  }

  const {
    data: { user }
  } = await authClient.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }

  const { data: before } = await serviceClient
    .from("evidence_records")
    .select("*")
    .eq("id", recordId)
    .maybeSingle();

  if (!before) {
    redirect(returnTo);
  }

  const reviewedAt = new Date().toISOString();

  await serviceClient
    .from("evidence_records")
    .update({
      review_reason: reason || `Marked ${nextStatus}.`,
      reviewed_at: reviewedAt,
      reviewed_by: user.id,
      verification_status: nextStatus
    })
    .eq("id", recordId);
  await serviceClient.from("evidence_review_notes").insert({
    action: `status_changed_to_${nextStatus}`,
    after_state: {
      reviewReason: reason || `Marked ${nextStatus}.`,
      reviewedAt,
      reviewedBy: user.id,
      verificationStatus: nextStatus
    } as Json,
    before_state: before as unknown as Json,
    created_by: user.id,
    evidence_record_id: recordId,
    note: `Evidence marked ${nextStatus}.`,
    reason: reason || `Moderator marked evidence ${nextStatus}.`
  });

  revalidateEvidencePaths(recordId, before.platform_id);
  redirect(returnTo);
}
