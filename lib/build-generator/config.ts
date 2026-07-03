import type {
  BuildGeneratorCountry,
  BuildGeneratorCurrency,
  BuildGeneratorInput,
  BuildGeneratorPreferences,
  BuildRecommendationCategory,
  OwnedItemKey,
  OwnedItems
} from "@/types/build-generator";

export const currencyToUsd: Record<BuildGeneratorCurrency, number> = {
  AED: 0.27,
  CAD: 0.73,
  GBP: 1.27,
  USD: 1
};

export const countryShippingWeightMultiplier: Record<BuildGeneratorCountry, number> = {
  Canada: 1.1,
  "United Arab Emirates": 1.35,
  "United Kingdom": 1.25,
  "United States": 1
};

export const countryCurrencyDefaults: Record<
  BuildGeneratorCountry,
  BuildGeneratorCurrency
> = {
  Canada: "CAD",
  "United Arab Emirates": "AED",
  "United Kingdom": "GBP",
  "United States": "USD"
};

export const ownedItemLabels: Record<OwnedItemKey, string> = {
  gpu: "GPU",
  hdd: "HDD",
  keyboard: "Keyboard",
  monitor: "Monitor",
  mouse: "Mouse",
  psu: "PSU",
  ram: "RAM",
  speakers: "Speakers",
  ssd: "SSD"
};

export const ownedItemSetupCostsUsd: Record<OwnedItemKey, number> = {
  gpu: 0,
  hdd: 0,
  keyboard: 25,
  monitor: 120,
  mouse: 20,
  psu: 0,
  ram: 0,
  speakers: 25,
  ssd: 0
};

export const preferenceLabels: Record<keyof BuildGeneratorPreferences, string> = {
  aestheticsPriority: "Aesthetics priority",
  lowestPricePriority: "Lowest price priority",
  lowPowerUsage: "Low power usage",
  preferDesktops: "Prefer desktops",
  preferLaptops: "Prefer laptops",
  preferWorkstations: "Prefer workstations",
  quietOperation: "Quiet operation",
  reliabilityPriority: "Reliability priority",
  smallFormFactor: "Small form factor",
  upgradeabilityPriority: "Upgradeability priority"
};

export const buildRecommendationCategories: BuildRecommendationCategory[] = [
  { id: "best-overall", label: "🏆 Best Overall" },
  { id: "best-value", label: "💰 Best Value" },
  { id: "highest-performance", label: "⚡ Highest Performance" },
  { id: "best-engineering", label: "🛠 Best Engineering", targetUseCase: "engineering" },
  { id: "best-ai", label: "🧠 Best AI", targetUseCase: "ai" },
  { id: "best-gaming", label: "🎮 Best Gaming", targetUseCase: "gaming" },
  { id: "best-workstation", label: "🏢 Best Workstation", targetUseCase: "engineering" },
  { id: "sleeper-build", label: "🧪 Sleeper Build", targetUseCase: "homelab" }
];

export const defaultBuildGeneratorPreferences: BuildGeneratorPreferences = {
  aestheticsPriority: false,
  lowestPricePriority: false,
  lowPowerUsage: false,
  preferDesktops: false,
  preferLaptops: false,
  preferWorkstations: false,
  quietOperation: false,
  reliabilityPriority: true,
  smallFormFactor: false,
  upgradeabilityPriority: true
};

export const defaultOwnedItems: OwnedItems = {
  gpu: false,
  hdd: false,
  keyboard: false,
  monitor: false,
  mouse: false,
  psu: false,
  ram: false,
  speakers: false,
  ssd: false
};

export const defaultBuildGeneratorInput: BuildGeneratorInput = {
  budget: 850,
  country: "United States",
  currency: "USD",
  ownedItems: defaultOwnedItems,
  preferences: defaultBuildGeneratorPreferences,
  primaryUseCase: "gaming"
};

export function convertCurrencyToUsd(
  amount: number,
  currency: BuildGeneratorCurrency
) {
  return Math.round(amount * currencyToUsd[currency]);
}

export function convertUsdToCurrency(
  amountUsd: number,
  currency: BuildGeneratorCurrency
) {
  return Math.round(amountUsd / currencyToUsd[currency]);
}
