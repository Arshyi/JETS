import { AlertTriangle, BookOpen, CheckCircle2, ShieldCheck, Wrench } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import { getEvidenceSummaryForPlaybook } from "@/lib/playbook-engine/engine";
import type {
  HardwarePlaybook,
  HardwarePlaybookRecommendation,
  PlaybookProjectProgress
} from "@/types/playbook";

type PlaybookPanelProps = {
  description?: string;
  playbooks: HardwarePlaybook[];
  progress?: PlaybookProjectProgress;
  title?: string;
};

function toneForVerification(verification: string) {
  if (verification === "verified") return "accent";
  if (verification === "disputed" || verification === "unverified") return "warning";
  return "neutral";
}

function getRecommendationStatus(
  recommendation: HardwarePlaybookRecommendation,
  progress?: PlaybookProjectProgress
) {
  if (
    progress?.completedRecommendations.some(
      (item) => item.recommendation.id === recommendation.id
    )
  ) {
    return "Completed";
  }

  if (
    progress?.remainingRecommendations.some(
      (item) => item.recommendation.id === recommendation.id
    )
  ) {
    return "Remaining";
  }

  return null;
}

function RecommendationCard({
  progress,
  recommendation
}: {
  progress?: PlaybookProjectProgress;
  recommendation: HardwarePlaybookRecommendation;
}) {
  const status = getRecommendationStatus(recommendation, progress);

  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap items-center gap-2">
        {status ? (
          <StatusPill tone={status === "Completed" ? "accent" : "neutral"}>
            {status}
          </StatusPill>
        ) : null}
        <StatusPill>{recommendation.confidence} confidence</StatusPill>
        <StatusPill>{recommendation.difficulty}</StatusPill>
        <StatusPill tone={toneForVerification(recommendation.verification)}>
          {recommendation.verification}
        </StatusPill>
        {recommendation.encyclopediaEntryIds?.length ? (
          <StatusPill>{recommendation.encyclopediaEntryIds.length} encyclopedia refs</StatusPill>
        ) : null}
      </div>
      <h4 className="mt-3 text-base font-semibold">{recommendation.title}</h4>
      <p className="mt-2 text-sm leading-6 text-muted">{recommendation.summary}</p>
      <div className="mt-3 grid gap-2 text-xs text-muted sm:grid-cols-2">
        <p>
          <span className="font-semibold text-foreground">Cost:</span>{" "}
          {recommendation.estimatedCostText}
        </p>
        <p>
          <span className="font-semibold text-foreground">Slots:</span>{" "}
          {recommendation.slotHints.join(", ")}
        </p>
        <p>
          <span className="font-semibold text-foreground">Knowledge:</span>{" "}
          {recommendation.knowledgeQualityScore}/100
        </p>
        <p>
          <span className="font-semibold text-foreground">Evidence:</span>{" "}
          {recommendation.evidenceRecordIds.length} linked records
        </p>
      </div>
      {recommendation.warnings.length > 0 ? (
        <div className="mt-3 rounded-lg border border-warning/30 bg-warning/10 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-warning">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Playbook warnings
          </div>
          <ul className="mt-2 grid gap-1 text-sm leading-6 text-muted">
            {recommendation.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

export function PlaybookPanel({
  description = "Playbooks compress platform-specific builder experience into reusable recommendations, warnings, adapters, and upgrade paths.",
  playbooks,
  progress,
  title = "Hardware Playbooks"
}: PlaybookPanelProps) {
  if (playbooks.length === 0) {
    return (
      <section className="rounded-lg border border-border bg-panel p-5">
        <div className="flex items-center gap-3">
          <BookOpen className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">
          No platform playbook is available yet. Add or classify a recognized
          base platform to reveal experienced-builder guidance.
        </p>
      </section>
    );
  }

  const primaryPlaybook = playbooks[0];
  const evidenceSummary = getEvidenceSummaryForPlaybook(primaryPlaybook);
  const remainingCount = progress?.remainingRecommendations.length ?? 0;
  const completedCount = progress?.completedRecommendations.length ?? 0;

  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
              Playbook Engine
            </p>
          </div>
          <h2 className="mt-3 text-2xl font-bold">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            {description}
          </p>
        </div>
        <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-80">
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-semibold uppercase text-muted">Playbooks</p>
            <p className="mt-1 text-2xl font-bold">{playbooks.length}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-semibold uppercase text-muted">Done</p>
            <p className="mt-1 text-2xl font-bold">{completedCount}</p>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-xs font-semibold uppercase text-muted">Remaining</p>
            <p className="mt-1 text-2xl font-bold">{remainingCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <StatusPill>{primaryPlaybook.platformName}</StatusPill>
        <StatusPill>{primaryPlaybook.useCase}</StatusPill>
        <StatusPill>{primaryPlaybook.knowledgeQualityScore}/100 knowledge</StatusPill>
        <StatusPill tone={toneForVerification(primaryPlaybook.verification)}>
          {primaryPlaybook.verification}
        </StatusPill>
        {evidenceSummary ? (
          <StatusPill>{evidenceSummary.evidenceCount} evidence records</StatusPill>
        ) : null}
        {primaryPlaybook.encyclopediaEntryIds?.length ? (
          <StatusPill>{primaryPlaybook.encyclopediaEntryIds.length} encyclopedia refs</StatusPill>
        ) : null}
      </div>

      {progress?.warnings.length ? (
        <div className="mt-5 rounded-lg border border-warning/30 bg-warning/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-warning">
            <AlertTriangle className="h-4 w-4" aria-hidden="true" />
            Remaining playbook cautions
          </div>
          <ul className="mt-2 grid gap-1 text-sm leading-6 text-muted">
            {progress.warnings.slice(0, 5).map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6">
        {playbooks.slice(0, 3).map((playbook) => {
          const mistakeSection = playbook.sections.find(
            (section) => section.id === "common-mistakes"
          );
          const adapterSection = playbook.sections.find(
            (section) => section.id === "required-adapters"
          );
          const lifespanSection = playbook.sections.find(
            (section) => section.id === "platform-lifespan"
          );

          return (
            <article key={playbook.id} className="rounded-lg border border-border bg-subtle p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{playbook.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {playbook.summary}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 lg:justify-end">
                  {playbook.recommendedStrategyTypes.map((strategyType) => (
                    <StatusPill key={strategyType}>{strategyType}</StatusPill>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                {playbook.recommendations.map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.id}
                    progress={progress}
                    recommendation={recommendation}
                  />
                ))}
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-3">
                {mistakeSection ? (
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
                      <h4 className="text-sm font-semibold">{mistakeSection.title}</h4>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {mistakeSection.summary}
                    </p>
                  </div>
                ) : null}
                {adapterSection ? (
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
                      <h4 className="text-sm font-semibold">{adapterSection.title}</h4>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {adapterSection.summary}
                    </p>
                  </div>
                ) : null}
                {lifespanSection ? (
                  <div className="rounded-lg border border-border bg-background p-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
                      <h4 className="text-sm font-semibold">{lifespanSection.title}</h4>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {lifespanSection.summary}
                    </p>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {progress && progress.completedRecommendations.length > 0 ? (
        <div className="mt-5 rounded-lg border border-accent/30 bg-accent/10 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent-strong dark:text-accent">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Completed playbook recommendations
          </div>
          <p className="mt-2 text-sm leading-6 text-muted">
            {progress.completedRecommendations
              .map((item) => item.recommendation.title)
              .join(", ")}
          </p>
        </div>
      ) : null}
    </section>
  );
}
