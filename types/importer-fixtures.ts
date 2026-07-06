import type { ListingIntelligenceRecord } from "@/types/listing-intelligence";
import type {
  MarketplaceIntelligenceSourceId,
  RawMarketplaceListing
} from "@/types/marketplace-intelligence";

export const importerFixtureSourceTypes = [
  "demo-marketplace-fixture",
  "manual-seed-fixture",
  "validation-error-fixture"
] as const;

export type ImporterFixtureSourceType =
  (typeof importerFixtureSourceTypes)[number];

export const importerFixtureSetIds = [
  "core-demo-listings",
  "validation-error-listings"
] as const;

export type ImporterFixtureSetId = (typeof importerFixtureSetIds)[number];

export const importerRunModes = ["dry-run", "import"] as const;

export type ImporterRunMode = (typeof importerRunModes)[number];

export const importerResultStatuses = [
  "created",
  "updated",
  "skipped",
  "error",
  "dry-run"
] as const;

export type ImporterResultStatus = (typeof importerResultStatuses)[number];

export const importerValidationErrorCodes = [
  "missing-title",
  "missing-price",
  "unsupported-marketplace",
  "invalid-currency",
  "low-confidence-platform-detection",
  "duplicate-external-id"
] as const;

export type ImporterValidationErrorCode =
  (typeof importerValidationErrorCodes)[number];

export type ImporterFixtureListing = Omit<
  RawMarketplaceListing,
  "currency" | "sourceId"
> & {
  currency: string;
  fixtureSourceType: ImporterFixtureSourceType;
  sourceId: string;
};

export type ImporterFixtureSet = {
  description: string;
  id: ImporterFixtureSetId;
  listings: ImporterFixtureListing[];
  title: string;
};

export type ImporterValidationError = {
  code: ImporterValidationErrorCode;
  field?: string;
  message: string;
};

export type ImporterFixtureParsedListing = {
  fixture: ImporterFixtureListing;
  intelligence: ListingIntelligenceRecord;
  listingKey: string;
  raw: RawMarketplaceListing;
};

export type ImporterFixtureItemResult = {
  errors: ImporterValidationError[];
  externalId: string;
  fixtureTitle: string;
  listingKey: string;
  marketplace: string;
  parsed: ImporterFixtureParsedListing | null;
  status: ImporterResultStatus;
};

export type ImporterFixtureImportResult = {
  errors: ImporterValidationError[];
  fixtureSetId: ImporterFixtureSetId;
  generatedAt: string;
  items: ImporterFixtureItemResult[];
  mode: ImporterRunMode;
  summary: {
    created: number;
    errors: number;
    skipped: number;
    updated: number;
  };
};

export type ImporterFixtureRunView = {
  appVersion: string;
  createdAt: string;
  createdBy: string | null;
  errorCount: number;
  fixtureCount: number;
  fixtureSetId: ImporterFixtureSetId;
  id: string;
  mode: ImporterRunMode;
  skippedCount: number;
  status: string;
  updatedCount: number;
  createdCount: number;
};

export type ImporterFixtureRunItemView = {
  createdAt: string;
  errorCodes: ImporterValidationErrorCode[];
  externalId: string;
  fixtureKey: string;
  id: string;
  listingKey: string | null;
  marketplace: string;
  message: string;
  normalizedListingId: string | null;
  runId: string;
  status: ImporterResultStatus;
};

export type ImporterFixtureState = {
  canRun: boolean;
  isConfigured: boolean;
  isServiceRoleConfigured: boolean;
  latestRunItems: ImporterFixtureRunItemView[];
  latestRuns: ImporterFixtureRunView[];
  previews: ImporterFixtureImportResult[];
  message?: string;
};

export function isSupportedMarketplace(
  value: string
): value is MarketplaceIntelligenceSourceId {
  return [
    "dubizzle",
    "facebook-marketplace",
    "ebay",
    "kijiji",
    "craigslist",
    "yahoo-auctions",
    "mercari",
    "amazon-renewed",
    "newegg",
    "local-computer-store",
    "csv-import",
    "manual-entry",
    "future-api"
  ].includes(value);
}
