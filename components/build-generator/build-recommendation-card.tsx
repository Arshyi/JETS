import { Check, CircleAlert, GitCompare } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import { convertUsdToCurrency } from "@/lib/build-generator/config";
import type {
  BuildGeneratorCurrency,
  BuildRecommendation,
  BuildRiskLevel
} from "@/types/build-generator";

type BuildRecommendationCardProps = {
  currency: BuildGeneratorCurrency;
  recommendation: BuildRecommendation;
};

const riskTone: Record<BuildRiskLevel, "accent" | "neutral" | "warning"> = {
  High: "warning",
  Low: "accent",
  Medium: "warning"
};

function formatCurrency(amountUsd: number, currency: BuildGeneratorCurrency) {
  return new Intl.NumberFormat("en-US", {
    currency,
    maximumFractionDigits: 0,
    style: "currency"
  }).format(convertUsdToCurrency(amountUsd, currency));
}

export function BuildRecommendationCard({
  currency,
  recommendation
}: BuildRecommendationCardProps) {
  const { candidate } = recommendation;
  const metrics = candidate.metrics;

  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="accent">{recommendation.category.label}</StatusPill>
            <StatusPill tone={riskTone[metrics.riskLevel]}>
              {metrics.riskLevel} risk
            </StatusPill>
            <StatusPill>{candidate.formFactor}</StatusPill>
          </div>
          <h2 className="mt-4 text-2xl font-semibold">{candidate.listing.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {candidate.listing.summary}
          </p>
        </div>

        <div className="rounded-lg border border-border bg-background p-4 text-center">
          <p className="text-xs font-semibold uppercase text-muted">Overall score</p>
          <p className="mt-1 text-4xl font-bold text-accent-strong dark:text-accent">
            {metrics.overallScore}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Compatibility", metrics.compatibilityScore],
          ["Decision", metrics.decisionScore],
          ["Reliability", metrics.reliability],
          ["Upgradeability", metrics.upgradeability],
          ["Platform health", metrics.platformHealth],
          ["Lifetime", `${metrics.estimatedRemainingLifetimeYears} yrs`],
          ["Negotiation", formatCurrency(metrics.estimatedNegotiationPrice, currency)],
          ["Shipping weight", `${metrics.estimatedShippingWeightLb} lb`]
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase text-muted">{label}</p>
            <p className="mt-2 text-lg font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold">Why this build?</h3>
          </div>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted">
            {recommendation.whyThisBuild.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <GitCompare className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold">Closest alternatives</h3>
          </div>
          <div className="mt-4 grid gap-3">
            {recommendation.alternatives.map((alternative) => (
              <div key={alternative.listingId} className="text-sm">
                <p className="font-semibold">{alternative.title}</p>
                <p className="mt-1 text-muted">{alternative.explanation}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {candidate.compatibilityReport?.suggestions.length ? (
        <div className="mt-5 rounded-lg border border-warning/40 bg-warning/10 p-4">
          <div className="flex items-center gap-2">
            <CircleAlert className="h-4 w-4 text-warning" aria-hidden="true" />
            <h3 className="text-sm font-semibold">Compatibility notes</h3>
          </div>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
            {candidate.compatibilityReport.suggestions.slice(0, 2).map((suggestion) => (
              <li key={`${suggestion.title}-${suggestion.reason}`}>
                {suggestion.title}: {suggestion.reason}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
