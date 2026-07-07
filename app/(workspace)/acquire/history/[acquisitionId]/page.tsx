import {
  Archive,
  Check,
  Compass,
  Link as LinkIcon,
  NotebookText,
  ShoppingBag,
  X
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { ContentPage } from "@/components/pages/content-page";
import { EmptyState } from "@/components/states/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getAcquisitionHandoffClassificationOptions,
  getAcquisitionHandoffPlan
} from "@/lib/acquisition/handoff";
import { handoffAcquisitionToProjectAction } from "@/lib/supabase/acquisition-handoff-actions";
import {
  acquisitionCorrectionFieldIds,
  type AcquisitionCorrectionFieldId
} from "@/types/acquisition";
import { acquisitionStatusLabels } from "@/lib/acquisition/workflow";
import {
  addAcquisitionCorrectionAction,
  addAcquisitionNoteAction,
  archiveAcquisitionAction,
  markPurchasedAcquisitionAction,
  markReadyAcquisitionAction,
  markRejectedAcquisitionAction
} from "@/lib/supabase/acquisition-actions";
import { getAcquisitionDetailState } from "@/lib/supabase/acquisition-queries";
import { buildGeneratorCountries, buildGeneratorCurrencies } from "@/types/build-generator";
import type { AcquisitionDecisionStatus, AcquisitionRecord } from "@/types/acquisition";
import { hardwareUseCases } from "@/types/hardware";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Acquisition Detail",
  description:
    "Review a persisted acquisition record, raw listing facts, normalized preview, evidence, corrections, notes, and project links."
};

function formatMoney(currency: string, value: number | null) {
  if (value === null) return "Unknown";

  return `${currency} ${value.toLocaleString()}`;
}

function statusTone(status: AcquisitionDecisionStatus) {
  if (status === "ready" || status === "purchased") return "accent";
  if (status === "reviewing") return "warning";
  return "neutral";
}

function getStrategyHref(record: AcquisitionRecord) {
  const params = new URLSearchParams({
    budget: String(record.snapshot.priceAmount ?? 850),
    country: record.draft.currency === "AED" ? "United Arab Emirates" : "United States",
    currency: record.draft.currency,
    goal: "engineering"
  });

  return `/strategy?${params.toString()}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString();
}

function JsonPanel({ title, value }: { title: string; value: unknown }) {
  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <pre className="mt-4 max-h-96 overflow-auto rounded-lg border border-border bg-background p-4 text-xs leading-5 text-muted">
        {JSON.stringify(value, null, 2)}
      </pre>
    </section>
  );
}

function StatusAction({
  acquisitionId,
  action,
  children,
  returnTo
}: {
  acquisitionId: string;
  action: (formData: FormData) => Promise<void>;
  children: React.ReactNode;
  returnTo: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="returnTo" value={returnTo} />
      <input type="hidden" name="acquisitionId" value={acquisitionId} />
      <button
        type="submit"
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground"
      >
        {children}
      </button>
    </form>
  );
}

function fieldLabel(fieldId: AcquisitionCorrectionFieldId) {
  return {
    cpu: "CPU",
    gpu: "GPU",
    platform: "Platform",
    price: "Price",
    ram: "RAM",
    storage: "Storage"
  }[fieldId];
}

type AcquisitionDetailPageProps = {
  params: Promise<{
    acquisitionId: string;
  }>;
};

export default async function AcquisitionDetailPage({
  params
}: AcquisitionDetailPageProps) {
  const { acquisitionId } = await params;
  const state = await getAcquisitionDetailState(acquisitionId);
  const record = state.record;
  const returnTo = `/acquire/history/${acquisitionId}`;

  if (!state.isConfigured) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SupabaseSetupState />
      </main>
    );
  }

  if (!state.isSignedIn) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SignedOutState
          title="Sign in to review this acquisition"
          description="Acquisition details are account-scoped records protected by Supabase RLS."
          next={returnTo}
        />
      </main>
    );
  }

  if (!record || !state.row) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title="Acquisition not found"
          description="This saved acquisition may have been deleted, or it belongs to another signed-in user."
          action={
            <Link
              href="/acquire/history"
              className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong"
            >
              Back to history
            </Link>
          }
        />
      </main>
    );
  }

  const handoffPlan = getAcquisitionHandoffPlan(record, state.analysis);
  const classificationOptions = getAcquisitionHandoffClassificationOptions();

  return (
    <ContentPage
      eyebrow="Saved acquisition"
      title={record.snapshot.title}
      description="A persisted acquisition record keeps the raw listing, normalized preview, evidence, corrections, notes, decision trail, and project handoff state together."
    >
      <div className="grid gap-6">
        <section className="rounded-lg border border-border bg-panel p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusPill tone={statusTone(record.status)}>
                  {acquisitionStatusLabels[record.status]}
                </StatusPill>
                <StatusPill>{record.snapshot.confidence} confidence</StatusPill>
                <StatusPill>{record.snapshot.readiness}</StatusPill>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">
                {record.snapshot.detectedPlatformName ?? "Unknown platform"} ·{" "}
                {formatMoney(record.draft.currency, record.snapshot.priceAmount)} ·{" "}
                {record.draft.location}
              </p>
              <p className="mt-1 text-xs text-muted">
                Created {formatDate(record.createdAt)} · Updated{" "}
                {formatDate(record.updatedAt)}
              </p>
            </div>
            <Link
              href="/acquire/history"
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground"
            >
              Back to history
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <StatusAction
              acquisitionId={record.id}
              action={markReadyAcquisitionAction}
              returnTo={returnTo}
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Ready
            </StatusAction>
            <StatusAction
              acquisitionId={record.id}
              action={markPurchasedAcquisitionAction}
              returnTo={returnTo}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Purchased
            </StatusAction>
            <StatusAction
              acquisitionId={record.id}
              action={markRejectedAcquisitionAction}
              returnTo={returnTo}
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Rejected
            </StatusAction>
            <StatusAction
              acquisitionId={record.id}
              action={archiveAcquisitionAction}
              returnTo={returnTo}
            >
              <Archive className="h-4 w-4" aria-hidden="true" />
              Archive
            </StatusAction>
          </div>
        </section>

        {state.message ? (
          <div className="rounded-lg border border-warning bg-warning/10 p-4 text-sm text-warning">
            {state.message}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">Recommendation preview</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase text-muted">Score</p>
                <p className="mt-2 text-3xl font-bold">
                  {record.snapshot.recommendationPreviewScore}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase text-muted">Missing</p>
                <p className="mt-2 text-lg font-semibold">
                  {record.snapshot.missingInformation.length}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs font-semibold uppercase text-muted">Evidence</p>
                <p className="mt-2 text-lg font-semibold">
                  {state.analysis?.evidenceRecords.length ?? 0}
                </p>
              </div>
            </div>
            <div className="mt-5 grid gap-2">
              {(state.analysis?.solutionClaims ?? []).map((claim) => (
                <div
                  key={claim.title}
                  className="rounded-lg border border-border bg-background p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{claim.title}</p>
                    <StatusPill>{claim.confidence}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{claim.reason}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">Use in Project</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Review the proposed slot mappings before applying anything. The
              acquisition record remains unchanged; accepted slots become
              acquisition-derived project slots with audit and evidence metadata.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill>{handoffPlan.summary}</StatusPill>
              <StatusPill>{handoffPlan.classification}</StatusPill>
            </div>
            <Link
              href={getStrategyHref(record)}
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground"
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              Analyze strategy before project
            </Link>
            <form
              action={handoffAcquisitionToProjectAction}
              className="mt-5 grid gap-5 rounded-lg border border-border bg-background p-4"
            >
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="acquisitionId" value={record.id} />
              <div className="grid gap-4 lg:grid-cols-3">
                <label className="grid gap-2 text-sm font-medium">
                  <span>Handoff action</span>
                  <select
                    className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground"
                    name="handoffMode"
                    defaultValue={state.projects.length > 0 ? "add-existing" : "create-project"}
                  >
                    <option value="create-project">Create new project</option>
                    <option value="add-existing">Add to existing project</option>
                    <option value="create-branch">Create branch from project</option>
                    <option value="link-evidence">Link as evidence only</option>
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  <span>Classification</span>
                  <select
                    className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground"
                    name="classification"
                    defaultValue={handoffPlan.classification}
                  >
                    {classificationOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  <span>Existing project</span>
                  <select
                    className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground"
                    name="projectId"
                    disabled={state.projects.length === 0}
                  >
                    {state.projects.length > 0 ? (
                      state.projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.title} ({project.status})
                        </option>
                      ))
                    ) : (
                      <option>No existing projects</option>
                    )}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-4">
                <label className="grid gap-2 text-sm font-medium lg:col-span-2">
                  <span>New project title</span>
                  <input
                    className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground"
                    name="projectTitle"
                    defaultValue={`Acquisition project: ${record.snapshot.title}`.slice(0, 100)}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  <span>Purpose</span>
                  <select
                    className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground"
                    name="purpose"
                    defaultValue="engineering"
                  >
                    {hardwareUseCases.map((useCase) => (
                      <option key={useCase} value={useCase}>
                        {useCase}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  <span>Budget</span>
                  <input
                    className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground"
                    name="budget"
                    defaultValue={record.snapshot.priceAmount ?? 850}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  <span>Country</span>
                  <select
                    className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground"
                    name="country"
                    defaultValue="United States"
                  >
                    {buildGeneratorCountries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  <span>Currency</span>
                  <select
                    className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground"
                    name="currency"
                    defaultValue={record.draft.currency}
                  >
                    {buildGeneratorCurrencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium lg:col-span-2">
                  <span>Branch name</span>
                  <input
                    className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground"
                    name="branchName"
                    defaultValue="acquisition-branch"
                  />
                </label>
              </div>

              <div>
                <h3 className="text-sm font-semibold">Slot mapping review</h3>
                <div className="mt-3 grid gap-3">
                  {handoffPlan.mappings.length > 0 ? (
                    handoffPlan.mappings.map((mapping) => (
                      <div
                        key={mapping.slotId}
                        className="grid gap-3 rounded-lg border border-border bg-panel p-3 lg:grid-cols-[auto_0.7fr_1fr_auto]"
                      >
                        <label className="flex items-start gap-2 text-sm font-semibold">
                          <input
                            className="mt-1 h-4 w-4 accent-accent"
                            defaultChecked={mapping.confidence >= 60}
                            name="acceptedSlotIds"
                            type="checkbox"
                            value={mapping.slotId}
                          />
                          Accept
                        </label>
                        <div>
                          <p className="text-sm font-semibold">{mapping.slotLabel}</p>
                          <p className="mt-1 text-xs text-muted">{mapping.reason}</p>
                        </div>
                        <label className="grid gap-2 text-sm font-medium">
                          <span>Slot value or correction</span>
                          <input
                            className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                            name={`slotLabel:${mapping.slotId}`}
                            defaultValue={mapping.proposedLabel}
                          />
                        </label>
                        <StatusPill>{mapping.confidence}% confidence</StatusPill>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-lg border border-dashed border-border bg-panel p-4 text-sm text-muted">
                      No confident slot mappings yet. Use evidence-only linking
                      or add corrections before handoff.
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong"
              >
                <LinkIcon className="h-4 w-4" aria-hidden="true" />
                Use in Project
              </button>
            </form>
            {state.projectLinks.length > 0 ? (
              <div className="mt-5 grid gap-2">
                <p className="text-sm font-semibold">Linked projects</p>
                {state.projectLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={`/solution-builder/projects/${link.project_id}`}
                    className="rounded-lg border border-border bg-background p-3 text-sm font-semibold transition hover:border-accent"
                  >
                    {link.link_type}: {link.project_id}
                  </Link>
                ))}
              </div>
            ) : null}
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">Evidence</h2>
            <div className="mt-4 grid gap-3">
              {(state.analysis?.evidenceRecords ?? []).map((evidence) => (
                <div
                  key={evidence.id}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-semibold">{evidence.claim}</p>
                    <StatusPill>{evidence.confidence}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {evidence.supportingText}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {evidence.sourceTitle} · {evidence.verificationStatus}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">Corrections</h2>
            <div className="mt-4 grid gap-3">
              {state.corrections.length > 0 ? (
                state.corrections.map((correction) => (
                  <div
                    key={correction.id}
                    className="rounded-lg border border-border bg-background p-4 text-sm"
                  >
                    <p className="font-semibold">
                      {correction.field_id}:{" "}
                      {correction.is_unknown
                        ? "Unknown"
                        : correction.corrected_value}
                    </p>
                    <p className="mt-1 text-muted">
                      Before: {correction.before_value ?? "No parsed value"} ·{" "}
                      {formatDate(correction.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-border bg-background p-4 text-sm text-muted">
                  No persisted corrections yet.
                </p>
              )}
            </div>
            <form
              action={addAcquisitionCorrectionAction}
              className="mt-5 grid gap-3 rounded-lg border border-border bg-background p-4"
            >
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="acquisitionId" value={record.id} />
              <label className="grid gap-2 text-sm font-medium">
                <span>Field</span>
                <select
                  className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground"
                  name="fieldId"
                >
                  {acquisitionCorrectionFieldIds.map((fieldId) => (
                    <option key={fieldId} value={fieldId}>
                      {fieldLabel(fieldId)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                <span>Correction</span>
                <input
                  className="rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground"
                  name="correctedValue"
                  placeholder="Corrected CPU, GPU, RAM, platform, price, or storage"
                />
              </label>
              <label className="flex items-center gap-2 text-sm font-medium">
                <input className="h-4 w-4 accent-accent" name="isUnknown" type="checkbox" />
                Mark as unknown
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong"
              >
                Add correction
              </button>
            </form>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">Notes</h2>
            <div className="mt-4 grid gap-3">
              {state.notes.length > 0 ? (
                state.notes.map((note) => (
                  <div
                    key={note.id}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <p className="text-sm leading-6 text-muted">{note.body}</p>
                    <p className="mt-2 text-xs text-muted">
                      {note.note_type} · {formatDate(note.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-border bg-background p-4 text-sm text-muted">
                  No persisted review notes yet.
                </p>
              )}
            </div>
            <form
              action={addAcquisitionNoteAction}
              className="mt-5 grid gap-3 rounded-lg border border-border bg-background p-4"
            >
              <input type="hidden" name="returnTo" value={returnTo} />
              <input type="hidden" name="acquisitionId" value={record.id} />
              <label className="grid gap-2 text-sm font-medium">
                <span>Add note</span>
                <textarea
                  className="min-h-28 rounded-lg border border-border bg-panel px-3 py-2 text-sm text-foreground"
                  name="note"
                  placeholder="Meeting details, negotiation context, seller concern, or project handoff note."
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong"
              >
                <NotebookText className="h-4 w-4" aria-hidden="true" />
                Add note
              </button>
            </form>
          </article>

          <article className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">Decision history</h2>
            <div className="mt-4 grid gap-3">
              {state.decisions.length > 0 ? (
                state.decisions.map((decision) => (
                  <div
                    key={decision.id}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{decision.decision}</p>
                      <StatusPill>{formatDate(decision.created_at)}</StatusPill>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {decision.reason ?? "No reason recorded."}
                    </p>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-border bg-background p-4 text-sm text-muted">
                  No decision events recorded yet.
                </p>
              )}
            </div>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <JsonPanel title="Raw listing" value={state.row.raw_payload} />
          <JsonPanel title="Normalized listing" value={state.row.normalized_payload} />
        </section>
      </div>
    </ContentPage>
  );
}
