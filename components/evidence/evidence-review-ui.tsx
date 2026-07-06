import {
  Archive,
  CheckCircle2,
  FileQuestion,
  GitCompare,
  History,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import {
  formatEvidenceLabel,
  getEvidenceSourceLabel
} from "@/lib/evidence-engine";
import {
  reviewEvidenceRecordAction,
  submitEvidenceRecordAction
} from "@/lib/supabase/evidence-actions";
import {
  evidenceConfidenceLevels,
  evidenceExtractionMethods,
  evidenceSourceTypes,
  evidenceSubjectTypes,
  evidenceVerificationStatuses
} from "@/types/evidence";
import type {
  EvidenceConflictView,
  EvidenceRecordState,
  EvidenceReviewRecord,
  EvidenceReviewState,
  EvidenceTimelineView
} from "@/lib/supabase/evidence-queries";

type RecordListProps = {
  records: EvidenceReviewRecord[];
  title?: string;
};

const reviewStatuses = evidenceVerificationStatuses.filter(
  (status) => status !== "unverified"
);

function toneForStatus(status: string): "accent" | "neutral" | "warning" {
  if (status === "verified") return "accent";
  if (["disputed", "deprecated", "archived"].includes(status)) return "warning";
  return "neutral";
}

function formatDate(value: string | null) {
  if (!value) return "Not reviewed";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium"
  }).format(new Date(value));
}

function SummaryCard({
  label,
  value
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <p className="text-xs font-semibold uppercase text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

export function EvidenceSubmissionForm() {
  return (
    <form
      action={submitEvidenceRecordAction}
      className="rounded-lg border border-border bg-panel p-5"
    >
      <input type="hidden" name="returnTo" value="/evidence" />
      <div>
        <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
          Submit evidence
        </p>
        <h2 className="mt-2 text-xl font-bold">Add a pending evidence record</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Submissions enter pending review. They do not become trusted knowledge
          until reviewed.
        </p>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Claim
          <input
            name="claim"
            required
            maxLength={500}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            placeholder="P520 supports PCIe NVMe adapter boot path"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Subject ID
          <input
            name="subjectId"
            required
            maxLength={160}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            placeholder="p520-pcie-nvme"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Platform ID
          <input
            name="platformId"
            maxLength={120}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            placeholder="thinkstation-p520"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Source title
          <input
            name="sourceTitle"
            maxLength={240}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            placeholder="Lenovo service manual or user report"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Source URL
          <input
            name="sourceUrl"
            maxLength={600}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            placeholder="https://example.com/source"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Source type
          <select
            name="sourceType"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            defaultValue="user-submission"
          >
            {evidenceSourceTypes.map((sourceType) => (
              <option key={sourceType} value={sourceType}>
                {formatEvidenceLabel(sourceType)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Subject type
          <select
            name="subjectType"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
          >
            {evidenceSubjectTypes.map((subjectType) => (
              <option key={subjectType} value={subjectType}>
                {formatEvidenceLabel(subjectType)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Confidence
          <select
            name="confidence"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            defaultValue="medium"
          >
            {evidenceConfidenceLevels.map((confidence) => (
              <option key={confidence} value={confidence}>
                {formatEvidenceLabel(confidence)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold md:col-span-2">
          Extraction method
          <select
            name="extractionMethod"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            defaultValue="manual-curation"
          >
            {evidenceExtractionMethods.map((method) => (
              <option key={method} value={method}>
                {formatEvidenceLabel(method)}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold md:col-span-2">
          Supporting text
          <textarea
            name="supportingText"
            required
            maxLength={1600}
            rows={4}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            placeholder="Paste the relevant claim or describe exactly what was observed."
          />
        </label>
      </div>

      <button
        type="submit"
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
      >
        Submit for review
      </button>
    </form>
  );
}

export function EvidenceRecordList({ records, title = "Evidence records" }: RecordListProps) {
  if (records.length === 0) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="No evidence records yet"
        description="Evidence will appear here after records are submitted, verified, or seeded."
      />
    );
  }

  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-bold">{title}</h2>
      {records.map((record) => (
        <article
          key={record.id}
          className="rounded-lg border border-border bg-panel p-5"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusPill tone={toneForStatus(record.verificationStatus)}>
                  {formatEvidenceLabel(record.verificationStatus)}
                </StatusPill>
                <StatusPill>{formatEvidenceLabel(record.confidence)} confidence</StatusPill>
                <StatusPill>{record.isPersisted ? "persisted" : "demo fallback"}</StatusPill>
              </div>
              <h3 className="mt-3 text-lg font-semibold">{record.claim}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {record.supportingText}
              </p>
            </div>
            <Link
              href={`/evidence/${record.id}`}
              className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-subtle"
            >
              Open evidence
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill>{formatEvidenceLabel(record.subjectType)}</StatusPill>
            <StatusPill>{record.subjectId}</StatusPill>
            {record.platformId ? (
              <Link href={`/evidence/platforms/${record.platformId}`}>
                <StatusPill>{record.platformId}</StatusPill>
              </Link>
            ) : null}
            <StatusPill>{getEvidenceSourceLabel(record.sourceType)}</StatusPill>
          </div>
        </article>
      ))}
    </section>
  );
}

export function EvidenceReviewStatusPanel({ state }: { state: EvidenceReviewState }) {
  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-wrap gap-2">
        <StatusPill tone={state.isConfigured ? "accent" : "warning"}>
          {state.isConfigured ? "Supabase configured" : "demo fallback"}
        </StatusPill>
        <StatusPill tone={state.isSignedIn ? "accent" : "neutral"}>
          {state.isSignedIn ? "signed in" : "public view"}
        </StatusPill>
        <StatusPill tone={state.canModerate ? "accent" : "neutral"}>
          {state.canModerate ? "moderation enabled" : "review read-only"}
        </StatusPill>
      </div>
      {state.message ? (
        <p className="mt-3 text-sm leading-6 text-muted">{state.message}</p>
      ) : null}
      {state.isModerator && !state.isServiceRoleConfigured ? (
        <p className="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm leading-6 text-muted">
          This account is admin-allowed, but `SUPABASE_SERVICE_ROLE_KEY` is
          required for server-gated review actions.
        </p>
      ) : null}
    </article>
  );
}

export function EvidenceDashboard({ state }: { state: EvidenceReviewState }) {
  const verifiedCount = state.records.filter(
    (record) => record.verificationStatus === "verified"
  ).length;

  return (
    <div className="grid gap-6">
      <EvidenceReviewStatusPanel state={state} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Records" value={state.records.length} />
        <SummaryCard label="Pending" value={state.pendingRecords.length} />
        <SummaryCard label="Verified" value={verifiedCount} />
        <SummaryCard label="Conflicts" value={state.conflicts.length} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/evidence/review"
          className="rounded-lg border border-border bg-panel p-4 font-semibold transition hover:bg-subtle"
        >
          Pending review queue
        </Link>
        <Link
          href="/evidence/conflicts"
          className="rounded-lg border border-border bg-panel p-4 font-semibold transition hover:bg-subtle"
        >
          Evidence conflicts
        </Link>
        <Link
          href="/sources"
          className="rounded-lg border border-border bg-panel p-4 font-semibold transition hover:bg-subtle"
        >
          Marketplace parsed fields
        </Link>
        <Link
          href="/solution-builder/projects"
          className="rounded-lg border border-border bg-panel p-4 font-semibold transition hover:bg-subtle"
        >
          Project evidence context
        </Link>
      </div>
      {state.isSignedIn ? <EvidenceSubmissionForm /> : null}
      <EvidenceRecordList records={state.records.slice(0, 12)} />
    </div>
  );
}

function ReviewForm({
  record,
  returnTo
}: {
  record: EvidenceReviewRecord;
  returnTo: string;
}) {
  return (
    <form action={reviewEvidenceRecordAction} className="grid gap-3">
      <input type="hidden" name="recordId" value={record.id} />
      <input type="hidden" name="returnTo" value={returnTo} />
      <label className="grid gap-2 text-sm font-semibold">
        Review status
        <select
          name="verificationStatus"
          defaultValue={record.verificationStatus}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
        >
          {reviewStatuses.map((status) => (
            <option key={status} value={status}>
              {formatEvidenceLabel(status)}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Reason
        <textarea
          name="reason"
          rows={3}
          maxLength={1200}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
          placeholder="Explain what changed and why."
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
      >
        Save review
      </button>
    </form>
  );
}

export function EvidenceReviewQueue({ state }: { state: EvidenceReviewState }) {
  if (state.pendingRecords.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="No pending evidence"
        description="The review queue is empty. New submissions and parser evidence candidates will appear here."
      />
    );
  }

  return (
    <div className="grid gap-5">
      <EvidenceReviewStatusPanel state={state} />
      {state.pendingRecords.map((record) => (
        <article
          key={record.id}
          className="grid gap-5 rounded-lg border border-border bg-panel p-5 lg:grid-cols-[1fr_320px]"
        >
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="neutral">
                {formatEvidenceLabel(record.verificationStatus)}
              </StatusPill>
              <StatusPill>{formatEvidenceLabel(record.sourceType)}</StatusPill>
              <StatusPill>{record.isPersisted ? "persisted" : "demo fallback"}</StatusPill>
            </div>
            <h2 className="mt-3 text-lg font-semibold">{record.claim}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {record.supportingText}
            </p>
            <Link
              href={`/evidence/${record.id}`}
              className="mt-4 inline-flex text-sm font-semibold text-accent-strong dark:text-accent"
            >
              Open detail
            </Link>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            {state.canModerate && record.isPersisted ? (
              <ReviewForm record={record} returnTo="/evidence/review" />
            ) : (
              <p className="text-sm leading-6 text-muted">
                Moderator review requires an admin-allowed account, applied v3.2
                migration, and server-side service role configuration.
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

export function EvidenceRecordDetail({
  state
}: {
  state: EvidenceRecordState;
}) {
  if (!state.record) {
    return (
      <EmptyState
        icon={FileQuestion}
        title="Evidence not found"
        description="This evidence record is not visible to the current session or does not exist."
      />
    );
  }

  const record = state.record;

  return (
    <div className="grid gap-6">
      <EvidenceReviewStatusPanel state={state} />
      <article className="rounded-lg border border-border bg-panel p-5">
        <div className="flex flex-wrap gap-2">
          <StatusPill tone={toneForStatus(record.verificationStatus)}>
            {formatEvidenceLabel(record.verificationStatus)}
          </StatusPill>
          <StatusPill>{formatEvidenceLabel(record.confidence)} confidence</StatusPill>
          <StatusPill>{record.isPersisted ? "persisted" : "demo fallback"}</StatusPill>
        </div>
        <h2 className="mt-4 text-2xl font-bold">{record.claim}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{record.supportingText}</p>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Source" value={getEvidenceSourceLabel(record.sourceType)} />
          <SummaryCard label="Subject" value={formatEvidenceLabel(record.subjectType)} />
          <SummaryCard label="Added" value={formatDate(record.createdAt)} />
          <SummaryCard label="Reviewed" value={formatDate(record.reviewedAt)} />
        </div>
      </article>

      {state.canModerate && record.isPersisted ? (
        <article className="rounded-lg border border-border bg-panel p-5">
          <h2 className="text-xl font-bold">Review action</h2>
          <div className="mt-4">
            <ReviewForm record={record} returnTo={`/evidence/${record.id}`} />
          </div>
        </article>
      ) : null}

      <section className="rounded-lg border border-border bg-panel p-5">
        <h2 className="text-xl font-bold">Audit trail</h2>
        {state.notes.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-muted">
            No persisted review notes are visible for this record yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {state.notes.map((note) => (
              <article
                key={note.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex flex-wrap gap-2">
                  <StatusPill>{formatEvidenceLabel(note.action)}</StatusPill>
                  <StatusPill>{formatDate(note.createdAt)}</StatusPill>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{note.note}</p>
                {note.reason ? (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Reason: {note.reason}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export function EvidenceConflictList({
  conflicts
}: {
  conflicts: EvidenceConflictView[];
}) {
  if (conflicts.length === 0) {
    return (
      <EmptyState
        icon={GitCompare}
        title="No conflicts visible"
        description="Conflicting evidence will appear here when JETS preserves multiple claims instead of overwriting them."
      />
    );
  }

  return (
    <div className="grid gap-4">
      {conflicts.map((conflict) => (
        <article
          key={conflict.id}
          className="rounded-lg border border-border bg-panel p-5"
        >
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="warning">{formatEvidenceLabel(conflict.status)}</StatusPill>
            <StatusPill>{conflict.conflictingEvidenceIds.length} records</StatusPill>
            <StatusPill>{conflict.isPersisted ? "persisted" : "demo fallback"}</StatusPill>
          </div>
          <h2 className="mt-3 text-xl font-semibold">{conflict.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{conflict.summary}</p>
          <p className="mt-3 rounded-lg border border-border bg-background p-3 text-sm leading-6 text-muted">
            {conflict.currentHandling}
          </p>
          {conflict.platformId ? (
            <Link
              href={`/evidence/platforms/${conflict.platformId}`}
              className="mt-4 inline-flex text-sm font-semibold text-accent-strong dark:text-accent"
            >
              Open platform evidence history
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export function PlatformEvidenceHistory({
  conflicts,
  records,
  timeline
}: {
  conflicts: EvidenceConflictView[];
  records: EvidenceReviewRecord[];
  timeline: EvidenceTimelineView[];
}) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Records" value={records.length} />
        <SummaryCard label="Timeline events" value={timeline.length} />
        <SummaryCard label="Conflicts" value={conflicts.length} />
      </div>
      <section className="rounded-lg border border-border bg-panel p-5">
        <div className="mb-4 flex items-center gap-2">
          <History className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
          <h2 className="text-xl font-bold">Knowledge history</h2>
        </div>
        {timeline.length === 0 ? (
          <p className="text-sm leading-6 text-muted">
            No platform timeline events are visible yet.
          </p>
        ) : (
          <div className="grid gap-3">
            {timeline.map((event) => (
              <article
                key={event.id}
                className="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-[72px_1fr]"
              >
                <p className="text-sm font-semibold text-accent-strong dark:text-accent">
                  {event.dateLabel}
                </p>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill tone={toneForStatus(event.verificationStatus)}>
                      {formatEvidenceLabel(event.verificationStatus)}
                    </StatusPill>
                    <StatusPill>
                      {event.isPersisted ? "persisted" : "demo fallback"}
                    </StatusPill>
                  </div>
                  <h3 className="mt-3 text-base font-semibold">{event.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {event.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <EvidenceRecordList records={records} title="Platform evidence records" />
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Archive className="h-5 w-5 text-warning" aria-hidden="true" />
          <h2 className="text-xl font-bold">Platform conflicts</h2>
        </div>
        <EvidenceConflictList conflicts={conflicts} />
      </section>
    </div>
  );
}

export function EvidenceConnectionSummary({
  state
}: {
  state: EvidenceReviewState;
}) {
  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-xl font-bold">Connected evidence surfaces</h2>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Platform claims" value={state.records.filter((record) => record.platformId).length} />
        <SummaryCard label="Parsed field links" value={state.links.length} />
        <SummaryCard label="Review notes" value={state.notes.length} />
        <SummaryCard label="Sources" value={state.sources.length} />
      </div>
    </article>
  );
}
