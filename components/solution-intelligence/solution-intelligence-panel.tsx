import {
  Cpu,
  DollarSign,
  GitBranch,
  Lightbulb,
  ListChecks,
  Sparkles
} from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import type {
  BottleneckFinding,
  CostAllocationStatus,
  QualitativeRiskLevel,
  SolutionIntelligenceReport
} from "@/types/solution-intelligence";

type SolutionIntelligencePanelProps = {
  branchCount: number;
  report: SolutionIntelligenceReport;
};

const riskTone: Record<QualitativeRiskLevel, "accent" | "neutral" | "warning"> = {
  critical: "warning",
  high: "warning",
  low: "neutral",
  moderate: "neutral",
  "very-low": "accent"
};

const costTone: Record<CostAllocationStatus, "accent" | "neutral" | "warning"> = {
  balanced: "accent",
  missing: "warning",
  overspending: "warning",
  underinvestment: "warning"
};

function formatLabel(value: string) {
  return value.replaceAll("-", " ");
}

function BottleneckCard({
  finding,
  label
}: {
  finding: BottleneckFinding;
  label: string;
}) {
  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-wrap gap-2">
        <StatusPill tone={riskTone[finding.level]}>{formatLabel(finding.level)}</StatusPill>
        <StatusPill>{finding.confidence.confidence} confidence</StatusPill>
      </div>
      <h3 className="mt-3 text-base font-semibold">{label}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{finding.reason}</p>
    </article>
  );
}

export function SolutionIntelligencePanel({
  branchCount,
  report
}: SolutionIntelligencePanelProps) {
  const bottlenecks = Object.entries(report.bottlenecks);

  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
            Solution Intelligence Engine
          </p>
          <h2 className="mt-3 text-2xl font-bold">Complete system reasoning</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            {report.summary}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background px-4 py-3">
          <p className="text-xs font-semibold uppercase text-muted">Confidence</p>
          <p className="mt-2 text-xl font-bold">{report.confidence.confidence}</p>
          <p className="mt-1 text-xs text-muted">{formatLabel(report.confidence.source)}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section>
          <div className="mb-4 flex items-center gap-3">
            <ListChecks className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Why this works</h3>
          </div>
          <div className="grid gap-3">
            {report.whyThisWorks.length > 0 ? (
              report.whyThisWorks.map((finding) => (
                <article
                  key={finding.id}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <div className="flex flex-wrap gap-2">
                    <StatusPill tone="accent">{finding.status}</StatusPill>
                    <StatusPill>{finding.confidence.confidence} confidence</StatusPill>
                  </div>
                  <h4 className="mt-3 text-base font-semibold">{finding.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {finding.reason}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-border bg-background p-4 text-sm leading-6 text-muted">
                Add core components so JETS can explain why the solution works.
              </p>
            )}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <Cpu className="h-5 w-5 text-warning" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Why something is rejected</h3>
          </div>
          <div className="grid gap-3">
            {report.rejectionReasons.length > 0 ? (
              report.rejectionReasons.map((finding) => (
                <article
                  key={finding.id}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <div className="flex flex-wrap gap-2">
                    <StatusPill tone={finding.status === "rejected" ? "warning" : "neutral"}>
                      {finding.status}
                    </StatusPill>
                    <StatusPill>{finding.confidence.confidence} confidence</StatusPill>
                  </div>
                  <h4 className="mt-3 text-base font-semibold">{finding.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {finding.reason}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-lg border border-border bg-background p-4 text-sm leading-6 text-muted">
                No blocking rejection reasons are active in the current report.
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-6">
        <div className="mb-4 flex items-center gap-3">
          <Cpu className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Bottleneck analysis</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {bottlenecks.map(([key, finding]) => (
            <BottleneckCard
              key={key}
              finding={finding}
              label={formatLabel(key)}
            />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Upgrade impact simulator</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {report.upgradeScenarios.map((scenario) => (
            <article
              key={scenario.id}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex flex-wrap gap-2">
                <StatusPill>{scenario.confidence.confidence} confidence</StatusPill>
                <StatusPill>${scenario.estimatedCostUsd}</StatusPill>
              </div>
              <h4 className="mt-3 text-base font-semibold">
                {scenario.current} to {scenario.suggested}
              </h4>
              <p className="mt-2 text-sm leading-6 text-muted">
                {scenario.summary}
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {Object.values(scenario.metrics).map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-lg border border-border bg-panel px-3 py-2"
                  >
                    <p className="text-xs font-semibold uppercase text-muted">
                      {metric.label}
                    </p>
                    <p className="mt-1 font-semibold">{formatLabel(metric.value)}</p>
                  </div>
                ))}
              </div>
              <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted">
                {scenario.tradeoffs.map((tradeoff) => (
                  <li key={tradeoff}>{tradeoff}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-lg font-semibold">Use-case analysis</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {report.useCases.map((useCase) => (
            <article
              key={useCase.id}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex flex-wrap gap-2">
                <StatusPill tone={useCase.fit === "excellent" ? "accent" : "neutral"}>
                  {useCase.fit}
                </StatusPill>
              </div>
              <h4 className="mt-3 text-base font-semibold">{useCase.title}</h4>
              <ul className="mt-2 grid gap-2 text-sm leading-6 text-muted">
                {useCase.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Where money is going</h3>
        </div>
        <p className="mb-4 text-sm leading-6 text-muted">
          {report.costEfficiency.summary}
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {report.costEfficiency.allocations.map((allocation) => (
            <article
              key={`${allocation.slotId}-${allocation.title}`}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex flex-wrap gap-2">
                <StatusPill tone={costTone[allocation.status]}>
                  {allocation.status}
                </StatusPill>
                <StatusPill>{allocation.percent}%</StatusPill>
              </div>
              <h4 className="mt-3 text-base font-semibold">{allocation.title}</h4>
              <p className="mt-1 text-sm text-muted">${allocation.amount}</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                {allocation.reason}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Hidden opportunities</h3>
          </div>
          <div className="grid gap-3">
            {[...report.hiddenOpportunities, ...report.platformOpportunities].length > 0 ? (
              [...report.hiddenOpportunities, ...report.platformOpportunities].map(
                (opportunity) => (
                  <article
                    key={opportunity.id}
                    className="rounded-lg border border-border bg-background p-4"
                  >
                    <div className="flex flex-wrap gap-2">
                      <StatusPill tone="accent">{formatLabel(opportunity.type)}</StatusPill>
                      <StatusPill>
                        {opportunity.confidence.confidence} confidence
                      </StatusPill>
                      {opportunity.estimatedSavingsUsd ? (
                        <StatusPill>${opportunity.estimatedSavingsUsd}</StatusPill>
                      ) : null}
                    </div>
                    <h4 className="mt-3 text-base font-semibold">
                      {opportunity.title}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      {opportunity.reason}
                    </p>
                  </article>
                )
              )
            ) : (
              <p className="rounded-lg border border-border bg-background p-4 text-sm leading-6 text-muted">
                No hidden opportunities are active yet.
              </p>
            )}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Optimization advisor</h3>
          </div>
          <div className="grid gap-3">
            {report.advisor.map((advisor) => (
              <article
                key={advisor.goalId}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex flex-wrap gap-2">
                  <StatusPill>{advisor.confidence.confidence} confidence</StatusPill>
                </div>
                <h4 className="mt-3 text-base font-semibold">{advisor.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {advisor.recommendedAction}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <ListChecks className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Engineering decision history</h3>
          </div>
          <div className="grid gap-3">
            {report.decisionTimeline.map((event, index) => (
              <article
                key={event.id}
                className="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-[48px_1fr]"
              >
                <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-sm font-semibold text-accent-strong dark:text-accent">
                  {index + 1}
                </div>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill tone={event.status === "warning" ? "warning" : "neutral"}>
                      {event.status}
                    </StatusPill>
                  </div>
                  <h4 className="mt-3 text-base font-semibold">{event.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {event.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center gap-3">
            <GitBranch className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Branch intelligence</h3>
          </div>
          <p className="mb-4 text-sm leading-6 text-muted">
            {branchCount > 0
              ? `${branchCount} branch${branchCount === 1 ? "" : "es"} can be explained across cost, power, gaming, AI, longevity, and upgrade room.`
              : "Create an optimized branch to compare cost, power, gaming, AI, longevity, and upgrade room."}
          </p>
          <div className="grid gap-3">
            {report.branchIntelligence.map((signal) => (
              <article
                key={signal.dimension}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex flex-wrap gap-2">
                  <StatusPill>{formatLabel(signal.dimension)}</StatusPill>
                  <StatusPill>{signal.confidence.confidence} confidence</StatusPill>
                </div>
                <h4 className="mt-3 text-base font-semibold">{signal.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted">{signal.reason}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
