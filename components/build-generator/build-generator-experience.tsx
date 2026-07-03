"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { BuildRecommendationCard } from "@/components/build-generator/build-recommendation-card";
import { StatusPill } from "@/components/ui/status-pill";
import {
  countryCurrencyDefaults,
  defaultBuildGeneratorInput,
  ownedItemLabels,
  preferenceLabels
} from "@/lib/build-generator/config";
import { generateBuildRecommendations } from "@/lib/build-generator/engine";
import {
  buildGeneratorCountries,
  buildGeneratorCurrencies,
  buildGeneratorPreferenceKeys,
  ownedItemKeys
} from "@/types/build-generator";
import {
  hardwareUseCases,
  useCaseLabels
} from "@/types/hardware";
import type {
  BuildGeneratorCountry,
  BuildGeneratorCurrency,
  BuildGeneratorInput,
  BuildGeneratorPreferenceKey,
  OwnedItemKey
} from "@/types/build-generator";
import type { HardwareUseCase } from "@/types/hardware";

function parseBudget(value: string) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

export function BuildGeneratorExperience() {
  const [input, setInput] = useState<BuildGeneratorInput>(defaultBuildGeneratorInput);
  const result = useMemo(() => generateBuildRecommendations(input), [input]);

  function updateCountry(country: BuildGeneratorCountry) {
    setInput((current) => ({
      ...current,
      country,
      currency: countryCurrencyDefaults[country]
    }));
  }

  function updatePreference(key: BuildGeneratorPreferenceKey, checked: boolean) {
    setInput((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        [key]: checked
      }
    }));
  }

  function updateOwnedItem(key: OwnedItemKey, checked: boolean) {
    setInput((current) => ({
      ...current,
      ownedItems: {
        ...current.ownedItems,
        [key]: checked
      }
    }));
  }

  return (
    <main className="bg-background pb-16">
      <section className="border-b border-border bg-panel">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
            Version 0.7
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold">Build Generator</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
                Generate complete hardware recommendations from the current mock
                dataset using the deterministic decision and compatibility engines.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="accent">{result.recommendations.length} recommendations</StatusPill>
              <StatusPill>{result.candidates.length} complete candidates</StatusPill>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[340px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <form className="rounded-lg border border-border bg-panel p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">Generator Inputs</h2>
                <p className="mt-1 text-sm text-muted">
                  Local deterministic workflow only.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInput(defaultBuildGeneratorInput)}
                className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                title="Reset generator"
                aria-label="Reset generator"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6 grid gap-5">
              <label className="grid gap-2 text-sm font-medium">
                Budget
                <input
                  type="number"
                  min="0"
                  value={input.budget}
                  onChange={(event) =>
                    setInput((current) => ({
                      ...current,
                      budget: parseBudget(event.target.value)
                    }))
                  }
                  className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                />
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Country
                <select
                  value={input.country}
                  onChange={(event) =>
                    updateCountry(event.target.value as BuildGeneratorCountry)
                  }
                  className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                >
                  {buildGeneratorCountries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Currency
                <select
                  value={input.currency}
                  onChange={(event) =>
                    setInput((current) => ({
                      ...current,
                      currency: event.target.value as BuildGeneratorCurrency
                    }))
                  }
                  className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                >
                  {buildGeneratorCurrencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm font-medium">
                Primary use case
                <select
                  value={input.primaryUseCase}
                  onChange={(event) =>
                    setInput((current) => ({
                      ...current,
                      primaryUseCase: event.target.value as HardwareUseCase
                    }))
                  }
                  className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                >
                  {hardwareUseCases.map((useCase) => (
                    <option key={useCase} value={useCase}>
                      {useCaseLabels[useCase]}
                    </option>
                  ))}
                </select>
              </label>

              <div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-muted" aria-hidden="true" />
                  <p className="text-sm font-medium">Preferences</p>
                </div>
                <div className="mt-3 grid gap-2">
                  {buildGeneratorPreferenceKeys.map((key) => (
                    <label
                      key={key}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <span>{preferenceLabels[key]}</span>
                      <input
                        type="checkbox"
                        checked={input.preferences[key]}
                        onChange={(event) => updatePreference(key, event.target.checked)}
                        className="h-4 w-4 accent-accent"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Already owned</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {ownedItemKeys.map((key) => (
                    <label
                      key={key}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    >
                      <span>{ownedItemLabels[key]}</span>
                      <input
                        type="checkbox"
                        checked={input.ownedItems[key]}
                        onChange={(event) => updateOwnedItem(key, event.target.checked)}
                        className="h-4 w-4 accent-accent"
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </aside>

        <div className="grid gap-5">
          {result.recommendations.map((recommendation) => (
            <BuildRecommendationCard
              key={recommendation.category.id}
              currency={input.currency}
              recommendation={recommendation}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
