import { importerFixtureSets } from "@/data/importer-fixtures";
import { buildListingIntelligenceRecord } from "@/lib/listing-intelligence/engine";
import { normalizeMarketplaceListing } from "@/lib/marketplace-intelligence/normalize";
import type {
  ImporterFixtureImportResult,
  ImporterFixtureItemResult,
  ImporterFixtureListing,
  ImporterFixtureParsedListing,
  ImporterFixtureSet,
  ImporterFixtureSetId,
  ImporterRunMode,
  ImporterValidationError
} from "@/types/importer-fixtures";
import { isSupportedMarketplace } from "@/types/importer-fixtures";
import type { RawMarketplaceListing } from "@/types/marketplace-intelligence";

const supportedCurrencies = ["AED", "USD"] as const;

function normalizeKeyPart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function getImporterFixtureSet(
  fixtureSetId: ImporterFixtureSetId
): ImporterFixtureSet {
  return (
    importerFixtureSets.find((fixtureSet) => fixtureSet.id === fixtureSetId) ??
    importerFixtureSets[0]
  );
}

export function getFixtureListingKey(fixture: ImporterFixtureListing) {
  return `fixture-${normalizeKeyPart(fixture.sourceId)}-${normalizeKeyPart(
    fixture.externalId
  )}`;
}

function parsePrice(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ""));

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function getDuplicateCounts(fixtures: ImporterFixtureListing[]) {
  return fixtures.reduce((counts, fixture) => {
    const key = `${fixture.sourceId}:${fixture.externalId}`;

    counts.set(key, (counts.get(key) ?? 0) + 1);

    return counts;
  }, new Map<string, number>());
}

function validateFixtureShape(
  fixture: ImporterFixtureListing,
  duplicateCounts: Map<string, number>
): ImporterValidationError[] {
  const errors: ImporterValidationError[] = [];

  if (!fixture.title.trim()) {
    errors.push({
      code: "missing-title",
      field: "title",
      message: "Fixture is missing a raw title."
    });
  }

  if (!parsePrice(fixture.priceText)) {
    errors.push({
      code: "missing-price",
      field: "priceText",
      message: "Fixture is missing a parseable price."
    });
  }

  if (!isSupportedMarketplace(fixture.sourceId)) {
    errors.push({
      code: "unsupported-marketplace",
      field: "sourceId",
      message: `${fixture.sourceId} is not a supported marketplace fixture source.`
    });
  }

  if (!supportedCurrencies.includes(fixture.currency as "AED" | "USD")) {
    errors.push({
      code: "invalid-currency",
      field: "currency",
      message: `${fixture.currency} is not supported by the current fixture importer.`
    });
  }

  if (duplicateCounts.get(`${fixture.sourceId}:${fixture.externalId}`)! > 1) {
    errors.push({
      code: "duplicate-external-id",
      field: "externalId",
      message: "Fixture set contains another row with the same marketplace and external ID."
    });
  }

  return errors;
}

function toRawListing(
  fixture: ImporterFixtureListing
): RawMarketplaceListing | null {
  if (
    !isSupportedMarketplace(fixture.sourceId) ||
    !supportedCurrencies.includes(fixture.currency as "AED" | "USD")
  ) {
    return null;
  }

  return {
    categoryLabel: fixture.categoryLabel,
    currency: fixture.currency as "AED" | "USD",
    description: fixture.description,
    externalId: fixture.externalId,
    imageCount: fixture.imageCount,
    locationText: fixture.locationText,
    marketplaceSpecific: fixture.marketplaceSpecific,
    observedAt: fixture.observedAt,
    priceText: fixture.priceText,
    sellerDisplayName: fixture.sellerDisplayName,
    sellerRatingText: fixture.sellerRatingText,
    sourceId: fixture.sourceId,
    title: fixture.title,
    url: fixture.url
  };
}

function parseFixture(
  fixture: ImporterFixtureListing,
  allRawListings: RawMarketplaceListing[]
): ImporterFixtureParsedListing | null {
  const raw = toRawListing(fixture);

  if (!raw) {
    return null;
  }

  const normalized = normalizeMarketplaceListing(raw);
  const allNormalized = allRawListings.map(normalizeMarketplaceListing);

  return {
    fixture,
    intelligence: buildListingIntelligenceRecord(normalized, allNormalized),
    listingKey: getFixtureListingKey(fixture),
    raw
  };
}

function validateParsedListing(
  parsed: ImporterFixtureParsedListing | null
): ImporterValidationError[] {
  if (!parsed) {
    return [];
  }

  if (parsed.intelligence.normalized.hardware.platformDetection.confidence === "low") {
    return [
      {
        code: "low-confidence-platform-detection",
        field: "hardware.platform",
        message:
          "Platform detection confidence is low; human review must resolve platform identity before seeding."
      }
    ];
  }

  return [];
}

export function buildImporterFixtureResult({
  existingListingKeys = new Set<string>(),
  fixtureSetId,
  mode
}: {
  existingListingKeys?: Set<string>;
  fixtureSetId: ImporterFixtureSetId;
  mode: ImporterRunMode;
}): ImporterFixtureImportResult {
  const fixtureSet = getImporterFixtureSet(fixtureSetId);
  const duplicateCounts = getDuplicateCounts(fixtureSet.listings);
  const validRawListings = fixtureSet.listings
    .map(toRawListing)
    .filter((listing): listing is RawMarketplaceListing => Boolean(listing));
  const items: ImporterFixtureItemResult[] = fixtureSet.listings.map((fixture) => {
    const shapeErrors = validateFixtureShape(fixture, duplicateCounts);
    const parsed =
      shapeErrors.length === 0 ? parseFixture(fixture, validRawListings) : null;
    const errors = [...shapeErrors, ...validateParsedListing(parsed)];
    const listingKey = getFixtureListingKey(fixture);

    return {
      errors,
      externalId: fixture.externalId,
      fixtureTitle: fixture.title || "(missing title)",
      listingKey,
      marketplace: fixture.sourceId,
      parsed,
      status:
        errors.length > 0
          ? "error"
          : existingListingKeys.has(listingKey)
            ? "updated"
            : "created"
    };
  });
  const summary = {
    created: items.filter((item) => item.status === "created").length,
    errors: items.filter((item) => item.status === "error").length,
    skipped: items.filter((item) => item.status === "skipped").length,
    updated: items.filter((item) => item.status === "updated").length
  };

  return {
    errors: items.flatMap((item) => item.errors),
    fixtureSetId,
    generatedAt: new Date().toISOString(),
    items,
    mode,
    summary
  };
}

export function getImporterFixturePreviews() {
  return importerFixtureSets.map((fixtureSet) =>
    buildImporterFixtureResult({
      fixtureSetId: fixtureSet.id,
      mode: "dry-run"
    })
  );
}
