import type { Metadata } from "next";

import { StrategyWorkspace } from "@/components/strategy/strategy-workspace";
import { countryCurrencyDefaults, defaultOwnedItems } from "@/lib/build-generator/config";
import { acquisitionRecordsToStrategyInputs } from "@/lib/strategy-engine/acquisitions";
import {
  createDefaultStrategyInput,
  generateHardwareStrategies
} from "@/lib/strategy-engine/engine";
import { getAcquisitionHistoryState } from "@/lib/supabase/acquisition-queries";
import {
  buildGeneratorCountries,
  buildGeneratorCurrencies,
  ownedItemKeys
} from "@/types/build-generator";
import { hardwareUseCases } from "@/types/hardware";
import {
  strategyNoisePreferenceIds,
  strategyPortabilityIds,
  strategyPowerConstraintIds,
  strategyRepairWillingnessIds,
  strategyRiskToleranceIds,
  strategyTimeHorizonIds
} from "@/types/strategy";
import type {
  BuildGeneratorCountry,
  BuildGeneratorCurrency,
  OwnedItems
} from "@/types/build-generator";
import type { HardwareUseCase } from "@/types/hardware";
import type {
  StrategyNoisePreference,
  StrategyPortability,
  StrategyPowerConstraint,
  StrategyRepairWillingness,
  StrategyRiskTolerance,
  StrategyTimeHorizon
} from "@/types/strategy";

export const metadata: Metadata = {
  title: "Strategy Engine",
  description:
    "Compare deterministic hardware strategies before turning acquisitions into JETS projects."
};

type StrategyPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];

  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getNumberParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
  fallback: number
) {
  const parsed = Number(getParam(params, key));

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function parseCountry(value: string): BuildGeneratorCountry {
  return buildGeneratorCountries.includes(value as BuildGeneratorCountry)
    ? (value as BuildGeneratorCountry)
    : "United States";
}

function parseCurrency(
  value: string,
  country: BuildGeneratorCountry
): BuildGeneratorCurrency {
  return buildGeneratorCurrencies.includes(value as BuildGeneratorCurrency)
    ? (value as BuildGeneratorCurrency)
    : countryCurrencyDefaults[country];
}

function parseUseCase(value: string): HardwareUseCase {
  return hardwareUseCases.includes(value as HardwareUseCase)
    ? (value as HardwareUseCase)
    : "engineering";
}

function parseChoice<T extends string>(
  value: string,
  allowed: readonly T[],
  fallback: T
) {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function parseOwnedItems(
  params: Record<string, string | string[] | undefined>
): OwnedItems {
  return ownedItemKeys.reduce((items, key) => {
    items[key] = getParam(params, `owned:${key}`) === "on";
    return items;
  }, { ...defaultOwnedItems });
}

export default async function StrategyPage({ searchParams }: StrategyPageProps) {
  const params = (await searchParams) ?? {};
  const acquisitionState = await getAcquisitionHistoryState();
  const country = parseCountry(getParam(params, "country"));
  const currency = parseCurrency(getParam(params, "currency"), country);
  const acquisitions = acquisitionState.isSignedIn
    ? acquisitionRecordsToStrategyInputs(acquisitionState.data)
    : [];
  const input = createDefaultStrategyInput({
    acquisitions,
    budget: getNumberParam(params, "budget", 850),
    country,
    currency,
    goals: [parseUseCase(getParam(params, "goal"))],
    noisePreference: parseChoice<StrategyNoisePreference>(
      getParam(params, "noisePreference"),
      strategyNoisePreferenceIds,
      "balanced"
    ),
    ownedHardware: parseOwnedItems(params),
    portability: parseChoice<StrategyPortability>(
      getParam(params, "portability"),
      strategyPortabilityIds,
      "not-needed"
    ),
    powerConstraint: parseChoice<StrategyPowerConstraint>(
      getParam(params, "powerConstraint"),
      strategyPowerConstraintIds,
      "moderate"
    ),
    region: country,
    repairWillingness: parseChoice<StrategyRepairWillingness>(
      getParam(params, "repairWillingness"),
      strategyRepairWillingnessIds,
      "minor"
    ),
    riskTolerance: parseChoice<StrategyRiskTolerance>(
      getParam(params, "riskTolerance"),
      strategyRiskToleranceIds,
      "medium"
    ),
    timeHorizon: parseChoice<StrategyTimeHorizon>(
      getParam(params, "timeHorizon"),
      strategyTimeHorizonIds,
      "medium"
    )
  });
  const result = generateHardwareStrategies(input);

  return (
    <StrategyWorkspace
      acquisitionState={{
        count: acquisitions.length,
        isConfigured: acquisitionState.isConfigured,
        isSignedIn: acquisitionState.isSignedIn,
        message: acquisitionState.message
      }}
      result={result}
      strategyError={getParam(params, "strategyError")}
    />
  );
}
