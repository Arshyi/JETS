import { BookOpenCheck, GitCompare, History, ShieldCheck } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import {
  formatEvidenceLabel,
  getEvidenceSourceLabel
} from "@/lib/evidence-engine";
import type {
  CommunityDiscovery,
  EvidenceConfidence,
  EvidenceSummary,
  EvidenceVerificationStatus,
  KnowledgeConflict,
  KnowledgeQualityScore,
  KnowledgeTimelineEvent
} from "@/types/evidence";

type EvidencePanelProps = {
  compact?: boolean;
  conflicts?: KnowledgeConflict[];
  discoveries?: CommunityDiscovery[];
  quality?: KnowledgeQualityScore;
  summary: EvidenceSummary;
  timeline?: KnowledgeTimelineEvent[];
  title?: string;
};

const confidenceTone: Record<EvidenceConfidence, "accent" | "neutral" | "warning"> = {
  high: "accent",
  low: "warning",
  medium: "neutral",
  "very-high": "accent"
};

const verificationTone: Record<
  EvidenceVerificationStatus,
  "accent" | "neutral" | "warning"
> = {
  archived: "neutral",
  deprecated: "warning",
  disputed: "warning",
  "pending-review": "neutral",
  superseded: "neutral",
  unverified: "warning",
  verified: "accent"
};

function QualityMeter({
  label,
  value
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-panel px-3 py-2">
      <p className="text-xs font-semibold uppercase text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

export function EvidencePanel({
  compact = false,
  conflicts = [],
  discoveries = [],
  quality,
  summary,
  timeline = [],
  title = "Why do we believe this?"
}: EvidencePanelProps) {
  return (
    <details
      className={
        compact
          ? "rounded-lg border border-border bg-panel px-3 py-2"
          : "rounded-lg border border-border bg-background p-4"
      }
    >
      <summary className="cursor-pointer list-none">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent-strong dark:text-accent">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold">{title}</p>
              {!compact ? (
                <p className="mt-1 text-sm leading-6 text-muted">
                  {summary.supportingText}
                </p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={confidenceTone[summary.confidence]}>
              {formatEvidenceLabel(summary.confidence)} confidence
            </StatusPill>
            <StatusPill tone={verificationTone[summary.verificationStatus]}>
              {formatEvidenceLabel(summary.verificationStatus)}
            </StatusPill>
            <StatusPill>{summary.evidenceCount} evidence</StatusPill>
          </div>
        </div>
      </summary>

      <div className="mt-4 grid gap-4">
        {compact ? (
          <p className="text-sm leading-6 text-muted">{summary.supportingText}</p>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-panel px-3 py-2">
            <p className="text-xs font-semibold uppercase text-muted">Best source</p>
            <p className="mt-1 text-sm font-semibold">{summary.strongestSourceLabel}</p>
          </div>
          <div className="rounded-lg border border-border bg-panel px-3 py-2">
            <p className="text-xs font-semibold uppercase text-muted">Trust weight</p>
            <p className="mt-1 text-sm font-semibold">{summary.trustWeight}/100</p>
          </div>
          <div className="rounded-lg border border-border bg-panel px-3 py-2">
            <p className="text-xs font-semibold uppercase text-muted">Source type</p>
            <p className="mt-1 text-sm font-semibold">
              {getEvidenceSourceLabel(summary.sourceType)}
            </p>
          </div>
        </div>

        {summary.records.length > 0 ? (
          <div className="grid gap-3">
            {summary.records.slice(0, compact ? 2 : 4).map((record) => (
              <article
                key={record.id}
                className="rounded-lg border border-border bg-panel p-3"
              >
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone={confidenceTone[record.confidence]}>
                    {formatEvidenceLabel(record.confidence)}
                  </StatusPill>
                  <StatusPill tone={verificationTone[record.verificationStatus]}>
                    {formatEvidenceLabel(record.verificationStatus)}
                  </StatusPill>
                  <StatusPill>
                    {formatEvidenceLabel(record.extractionMethod)}
                  </StatusPill>
                </div>
                <h4 className="mt-3 text-sm font-semibold">{record.claim}</h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {record.supportingText}
                </p>
                <p className="mt-2 text-xs text-muted">
                  {record.sourceTitle} - Added {record.dateAdded} - v{record.version}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-border bg-panel p-3 text-sm leading-6 text-muted">
            This item is architecture-ready but does not have a dedicated evidence
            record yet.
          </p>
        )}

        {quality ? (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <BookOpenCheck className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
              <h4 className="text-sm font-semibold">Knowledge Quality</h4>
            </div>
            <p className="mb-3 text-sm leading-6 text-muted">{quality.summary}</p>
            <div className="grid gap-2 sm:grid-cols-3">
              <QualityMeter label="Overall" value={quality.overall} />
              <QualityMeter
                label="Documentation"
                value={quality.documentationCompleteness}
              />
              <QualityMeter label="Evidence" value={quality.evidenceQuality} />
              <QualityMeter label="Community" value={quality.communityValidation} />
              <QualityMeter label="Official" value={quality.officialDocumentation} />
              <QualityMeter label="Verification" value={quality.verificationLevel} />
            </div>
          </section>
        ) : null}

        {conflicts.length > 0 ? (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-warning" aria-hidden="true" />
              <h4 className="text-sm font-semibold">Conflicting Evidence</h4>
            </div>
            <div className="grid gap-2">
              {conflicts.map((conflict) => (
                <article
                  key={conflict.id}
                  className="rounded-lg border border-warning/30 bg-warning/10 p-3"
                >
                  <div className="flex flex-wrap gap-2">
                    <StatusPill tone="warning">
                      {formatEvidenceLabel(conflict.status)}
                    </StatusPill>
                    <StatusPill>{conflict.conflictingEvidenceIds.length} sources</StatusPill>
                  </div>
                  <h4 className="mt-3 text-sm font-semibold">{conflict.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {conflict.summary}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {conflict.currentHandling}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {discoveries.length > 0 ? (
          <section>
            <h4 className="mb-3 text-sm font-semibold">Related discoveries</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {discoveries.slice(0, 4).map((discovery) => (
                <article
                  key={discovery.id}
                  className="rounded-lg border border-border bg-panel p-3"
                >
                  <div className="flex flex-wrap gap-2">
                    <StatusPill>{discovery.impact} impact</StatusPill>
                    <StatusPill>{discovery.difficulty}</StatusPill>
                    <StatusPill>
                      {formatEvidenceLabel(discovery.moderationStatus)}
                    </StatusPill>
                  </div>
                  <h4 className="mt-3 text-sm font-semibold">{discovery.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {discovery.summary}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ) : null}

        {timeline.length > 0 ? (
          <section>
            <div className="mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
              <h4 className="text-sm font-semibold">Knowledge History</h4>
            </div>
            <div className="grid gap-2">
              {timeline.map((event) => (
                <article
                  key={event.id}
                  className="grid gap-3 rounded-lg border border-border bg-panel p-3 sm:grid-cols-[64px_1fr]"
                >
                  <p className="text-sm font-semibold text-accent-strong dark:text-accent">
                    {event.dateLabel}
                  </p>
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill tone={verificationTone[event.verificationStatus]}>
                        {formatEvidenceLabel(event.verificationStatus)}
                      </StatusPill>
                      <StatusPill>{event.evidenceIds.length} evidence</StatusPill>
                    </div>
                    <h4 className="mt-3 text-sm font-semibold">{event.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {event.description}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </details>
  );
}
