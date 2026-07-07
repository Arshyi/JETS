import { ArrowRight, BarChart3, Compass, FolderPlus, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import { ownedItemKeys } from "@/types/build-generator";
import { hardwareUseCases, useCaseLabels } from "@/types/hardware";
import { createProjectFromStrategyAction } from "@/lib/supabase/strategy-actions";
import {
  strategyNoisePreferenceIds,
  strategyPortabilityIds,
  strategyPowerConstraintIds,
  strategyRepairWillingnessIds,
  strategyRiskToleranceIds,
  strategyTimeHorizonIds,
  strategyTradeoffDefinitions
} from "@/types/strategy";
import type { BuildGeneratorCountry, BuildGeneratorCurrency } from "@/types/build-generator";
import type { StrategyEngineResult, StrategyTradeoffKey } from "@/types/strategy";

type StrategyWorkspaceProps = {
  acquisitionState: {
    count: number;
    isConfigured: boolean;
    isSignedIn: boolean;
    message?: string;
  };
  result: StrategyEngineResult;
  strategyError?: string;
};

const countryOptions: BuildGeneratorCountry[] = [
  "United States",
  "United Arab Emirates",
  "Canada",
  "United Kingdom"
];

const currencyOptions: BuildGeneratorCurrency[] = ["USD", "AED", "CAD", "GBP"];

const tradeoffKeys: StrategyTradeoffKey[] = [
  "cost",
  "performance",
  "upgradeability",
  "reliability",
  "powerDraw",
  "noise",
  "difficulty",
  "repairability",
  "platformPotential",
  "futureExpansion",
  "confidence"
];

function titleCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function scoreTone(score: number) {
  if (score >= 80) {
    return "text-accent-strong dark:text-accent";
  }

  if (score >= 62) {
    return "text-accent-strong dark:text-accent";
  }

  return "text-warning";
}

function hiddenStrategyInputs(result: StrategyEngineResult) {
  return (
    <>
      <input type="hidden" name="budget" value={result.input.budget} />
      <input type="hidden" name="country" value={result.input.country} />
      <input type="hidden" name="currency" value={result.input.currency} />
      <input type="hidden" name="purpose" value={result.input.goals[0] ?? "general"} />
      {ownedItemKeys.map((key) =>
        result.input.ownedHardware[key] ? (
          <input key={key} type="hidden" name={`owned:${key}`} value="on" />
        ) : null
      )}
    </>
  );
}

export function StrategyWorkspace({
  acquisitionState,
  result,
  strategyError
}: StrategyWorkspaceProps) {
  const topStrategies = result.recommendations.slice(0, 3);

  return (
    <main className="bg-background pb-16">
      <section className="border-b border-border bg-panel">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
              Strategy Engine
            </p>
            <h1 className="mt-3 max-w-4xl text-4xl font-bold">
              Should you build, buy, repair, upgrade, or walk away?
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
              Strategy happens before component selection. JETS compares possible
              hardware paths using deterministic rules, your budget, owned
              hardware, constraints, and saved acquisitions. No AI, no live
              scraping, and no marketplace APIs are active here.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <StatusPill tone="accent">Deterministic</StatusPill>
              <StatusPill>Pre-project decision</StatusPill>
              <StatusPill>{result.input.acquisitions.length} acquisition inputs</StatusPill>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-background p-5">
            <div className="flex items-center gap-3">
              <Compass className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Strategy inputs</h2>
            </div>
            <form action="/strategy" className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-medium">
                Budget
                <input
                  name="budget"
                  type="number"
                  min={0}
                  defaultValue={result.input.budget}
                  className="h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Country
                  <select
                    name="country"
                    defaultValue={result.input.country}
                    className="h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                  >
                    {countryOptions.map((country) => (
                      <option key={country}>{country}</option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Currency
                  <select
                    name="currency"
                    defaultValue={result.input.currency}
                    className="h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                  >
                    {currencyOptions.map((currency) => (
                      <option key={currency}>{currency}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label className="grid gap-2 text-sm font-medium">
                Goal
                <select
                  name="goal"
                  defaultValue={result.input.goals[0] ?? "engineering"}
                  className="h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                >
                  {hardwareUseCases.map((useCase) => (
                    <option key={useCase} value={useCase}>
                      {useCaseLabels[useCase]}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Risk
                  <select
                    name="riskTolerance"
                    defaultValue={result.input.riskTolerance}
                    className="h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                  >
                    {strategyRiskToleranceIds.map((value) => (
                      <option key={value} value={value}>
                        {titleCase(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Noise
                  <select
                    name="noisePreference"
                    defaultValue={result.input.noisePreference}
                    className="h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                  >
                    {strategyNoisePreferenceIds.map((value) => (
                      <option key={value} value={value}>
                        {titleCase(value)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Power
                  <select
                    name="powerConstraint"
                    defaultValue={result.input.powerConstraint}
                    className="h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                  >
                    {strategyPowerConstraintIds.map((value) => (
                      <option key={value} value={value}>
                        {titleCase(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Portability
                  <select
                    name="portability"
                    defaultValue={result.input.portability}
                    className="h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                  >
                    {strategyPortabilityIds.map((value) => (
                      <option key={value} value={value}>
                        {titleCase(value)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-medium">
                  Repair
                  <select
                    name="repairWillingness"
                    defaultValue={result.input.repairWillingness}
                    className="h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                  >
                    {strategyRepairWillingnessIds.map((value) => (
                      <option key={value} value={value}>
                        {titleCase(value)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="grid gap-2 text-sm font-medium">
                  Horizon
                  <select
                    name="timeHorizon"
                    defaultValue={result.input.timeHorizon}
                    className="h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                  >
                    {strategyTimeHorizonIds.map((value) => (
                      <option key={value} value={value}>
                        {titleCase(value)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <fieldset className="grid gap-2">
                <legend className="text-sm font-medium">Already owned</legend>
                <div className="grid gap-2 sm:grid-cols-3">
                  {ownedItemKeys.map((key) => (
                    <label key={key} className="flex items-center gap-2 text-sm text-muted">
                      <input
                        name={`owned:${key}`}
                        type="checkbox"
                        value="on"
                        defaultChecked={result.input.ownedHardware[key]}
                        className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                      />
                      {key.toUpperCase()}
                    </label>
                  ))}
                </div>
              </fieldset>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Analyze strategies
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:px-8">
        {strategyError ? (
          <div className="rounded-lg border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
            This strategy is not ready to become a project yet. Keep it as a
            decision, review acquisitions, or adjust constraints.
          </div>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-3">
          {topStrategies.map((strategy) => (
            <article key={strategy.id} className="rounded-lg border border-border bg-panel p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted">
                    Rank {strategy.rank}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">{strategy.title}</h2>
                </div>
                <p className={`text-3xl font-bold ${scoreTone(strategy.overallScore)}`}>
                  {strategy.overallScore}
                </p>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{strategy.summary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <StatusPill>{strategy.confidence}% confidence</StatusPill>
                <StatusPill>
                  {strategy.expectedLifespanYears > 0
                    ? `${strategy.expectedLifespanYears} year life`
                    : "No build yet"}
                </StatusPill>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {(["cost", "performance", "reliability", "platformPotential"] as StrategyTradeoffKey[]).map((key) => (
                  <div key={key} className="rounded-lg border border-border bg-background p-3">
                    <p className="text-xs font-semibold uppercase text-muted">
                      {strategyTradeoffDefinitions[key].label}
                    </p>
                    <p className="mt-1 text-2xl font-bold">{strategy.tradeoffs[key]}</p>
                    <p className="mt-1 text-xs text-muted">
                      {strategyTradeoffDefinitions[key].direction === "lower-better"
                        ? "Lower is better"
                        : "Higher is better"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold">Why this strategy?</p>
                <ul className="mt-2 grid gap-2 text-sm leading-6 text-muted">
                  {strategy.whyChosen.slice(0, 4).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold">Alternatives ranked lower</p>
                <ul className="mt-2 grid gap-2 text-sm leading-6 text-muted">
                  {strategy.whyAlternativesRankedLower.slice(0, 3).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold">Risks</p>
                <ul className="mt-2 grid gap-2 text-sm leading-6 text-muted">
                  {strategy.risks.slice(0, 3).map((risk) => (
                    <li key={risk}>{risk}</li>
                  ))}
                </ul>
              </div>

              <form action={createProjectFromStrategyAction} className="mt-5 grid gap-3">
                <input type="hidden" name="returnTo" value="/strategy" />
                <input type="hidden" name="strategyType" value={strategy.type} />
                <input
                  type="hidden"
                  name="strategySnapshot"
                  value={JSON.stringify(strategy)}
                />
                {hiddenStrategyInputs(result)}
                <label className="grid gap-2 text-sm font-medium">
                  Project title
                  <input
                    name="projectTitle"
                    defaultValue={strategy.projectSeed?.title ?? strategy.title}
                    disabled={!strategy.shouldCreateProject}
                    className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition disabled:opacity-60 focus:border-accent focus:ring-2 focus:ring-accent/25"
                  />
                </label>
                <button
                  type="submit"
                  disabled={!strategy.shouldCreateProject}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  <FolderPlus className="h-4 w-4" aria-hidden="true" />
                  {strategy.shouldCreateProject ? "Create project from strategy" : "Do not create project"}
                </button>
              </form>
            </article>
          ))}
        </section>

        <section className="rounded-lg border border-border bg-panel p-5">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h2 className="text-xl font-bold">Strategy comparison</h2>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border text-xs uppercase text-muted">
                <tr>
                  <th className="py-3 pr-4">Strategy</th>
                  {tradeoffKeys.map((key) => (
                    <th key={key} className="py-3 pr-4">
                      {strategyTradeoffDefinitions[key].label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topStrategies.map((strategy) => (
                  <tr key={strategy.id} className="border-b border-border last:border-0">
                    <td className="py-3 pr-4 font-semibold">{strategy.title}</td>
                    {tradeoffKeys.map((key) => (
                      <td key={key} className="py-3 pr-4">
                        {strategy.tradeoffs[key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {result.comparison.map((highlight) => (
              <div key={highlight.label} className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm font-semibold">{highlight.label}</p>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {highlight.explanation}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div className="rounded-lg border border-border bg-panel p-5">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
              <h2 className="text-xl font-bold">Acquisition inputs</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">
              Saved acquisitions are optional strategy inputs. Strategy can decide
              that a listing should become a project, feed a hybrid path, remain
              evidence only, or be ignored.
            </p>
            <div className="mt-5">
              {acquisitionState.isConfigured && acquisitionState.isSignedIn ? (
                acquisitionState.count > 0 ? (
                  <p className="text-sm text-muted">
                    Using {acquisitionState.count} recent saved acquisition
                    {acquisitionState.count === 1 ? "" : "s"} as possible inputs.
                  </p>
                ) : (
                  <EmptyState
                    title="No acquisitions feeding strategy yet"
                    description="Capture a listing first, then Strategy can decide whether it deserves a project."
                    icon={Compass}
                    action={
                      <Link
                        href="/acquire"
                        className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                      >
                        Capture acquisition
                      </Link>
                    }
                  />
                )
              ) : (
                <EmptyState
                  title="Sign in to use saved acquisitions"
                  description={acquisitionState.message ?? "Strategy can run with demo inputs, but saved acquisitions require Supabase persistence."}
                  icon={Compass}
                  action={
                    <Link
                      href="/login?next=/strategy"
                      className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                    >
                      Sign in
                    </Link>
                  }
                />
              )}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-xl font-bold">Where this fits</h2>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-muted">
              <p>Compatibility answers whether exact parts can work together.</p>
              <p>Optimization improves a chosen project by changing unlocked parts.</p>
              <p>Strategy decides whether the entire path is worth pursuing.</p>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
