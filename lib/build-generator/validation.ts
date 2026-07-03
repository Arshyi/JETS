import {
  buildGeneratorCountries,
  buildGeneratorCurrencies,
  buildGeneratorPreferenceKeys,
  ownedItemKeys
} from "@/types/build-generator";
import { hardwareUseCases } from "@/types/hardware";
import type { BuildGeneratorInput } from "@/types/build-generator";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasBooleanRecordKeys<T extends readonly string[]>(
  value: unknown,
  keys: T
): value is Record<T[number], boolean> {
  if (!isRecord(value)) {
    return false;
  }

  return keys.every((key) => typeof value[key] === "boolean");
}

export function isBuildGeneratorInput(value: unknown): value is BuildGeneratorInput {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.budget === "number" &&
    Number.isFinite(value.budget) &&
    value.budget >= 0 &&
    buildGeneratorCountries.includes(
      value.country as (typeof buildGeneratorCountries)[number]
    ) &&
    buildGeneratorCurrencies.includes(
      value.currency as (typeof buildGeneratorCurrencies)[number]
    ) &&
    hardwareUseCases.includes(value.primaryUseCase as (typeof hardwareUseCases)[number]) &&
    hasBooleanRecordKeys(value.preferences, buildGeneratorPreferenceKeys) &&
    hasBooleanRecordKeys(value.ownedItems, ownedItemKeys)
  );
}

export function parseBuildGeneratorInput(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;

    return isBuildGeneratorInput(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
