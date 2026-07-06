import { mockMarketplaceRawListings } from "@/data/mock-marketplace-intelligence";
import type {
  ImporterFixtureListing,
  ImporterFixtureSet
} from "@/types/importer-fixtures";

function toFixture(
  listing: (typeof mockMarketplaceRawListings)[number]
): ImporterFixtureListing {
  return {
    ...listing,
    fixtureSourceType: "demo-marketplace-fixture"
  };
}

const validDemoFixtures = mockMarketplaceRawListings.map(toFixture);

const validationErrorFixtures: ImporterFixtureListing[] = [
  {
    categoryLabel: "Broken validation fixture",
    currency: "AED",
    description:
      "Missing title fixture with a price and description so only the title validation fails.",
    externalId: "fixture-missing-title-01",
    fixtureSourceType: "validation-error-fixture",
    imageCount: 2,
    locationText: "Dubai, UAE",
    marketplaceSpecific: { fixture: "missing-title" },
    observedAt: "2026-07-06T08:00:00.000Z",
    priceText: "AED 500",
    sellerDisplayName: "Fixture seller",
    sourceId: "manual-entry",
    title: "",
    url: null
  },
  {
    categoryLabel: "Broken validation fixture",
    currency: "AED",
    description:
      "Dell OptiPlex 7060 i5 16GB SSD. Price is intentionally missing.",
    externalId: "fixture-missing-price-01",
    fixtureSourceType: "validation-error-fixture",
    imageCount: 3,
    locationText: "Dubai, UAE",
    marketplaceSpecific: { fixture: "missing-price" },
    observedAt: "2026-07-06T08:05:00.000Z",
    priceText: "",
    sellerDisplayName: "Fixture seller",
    sourceId: "manual-entry",
    title: "Dell OptiPlex 7060 missing price",
    url: null
  },
  {
    categoryLabel: "Unsupported marketplace fixture",
    currency: "AED",
    description:
      "Lenovo ThinkStation P520 W-2135 64GB ECC. Marketplace source is intentionally unsupported.",
    externalId: "fixture-unsupported-source-01",
    fixtureSourceType: "validation-error-fixture",
    imageCount: 5,
    locationText: "Dubai, UAE",
    marketplaceSpecific: { fixture: "unsupported-marketplace" },
    observedAt: "2026-07-06T08:10:00.000Z",
    priceText: "AED 1200",
    sellerDisplayName: "Fixture seller",
    sourceId: "unsupported-market",
    title: "Unsupported marketplace ThinkStation fixture",
    url: null
  },
  {
    categoryLabel: "Invalid currency fixture",
    currency: "GBP",
    description:
      "Ryzen 5 gaming PC RTX 3060 16GB RAM 1TB NVMe. Currency is intentionally unsupported.",
    externalId: "fixture-invalid-currency-01",
    fixtureSourceType: "validation-error-fixture",
    imageCount: 4,
    locationText: "Dubai, UAE",
    marketplaceSpecific: { fixture: "invalid-currency" },
    observedAt: "2026-07-06T08:15:00.000Z",
    priceText: "GBP 700",
    sellerDisplayName: "Fixture seller",
    sourceId: "manual-entry",
    title: "Ryzen gaming PC invalid currency fixture",
    url: null
  },
  {
    categoryLabel: "Unknown platform fixture",
    currency: "AED",
    description:
      "Custom desktop with generic CPU, generic GPU, 16GB RAM, and SSD. No known platform alias appears.",
    externalId: "fixture-low-platform-confidence-01",
    fixtureSourceType: "validation-error-fixture",
    imageCount: 3,
    locationText: "Dubai, UAE",
    marketplaceSpecific: { fixture: "low-confidence-platform" },
    observedAt: "2026-07-06T08:20:00.000Z",
    priceText: "AED 900",
    sellerDisplayName: "Fixture seller",
    sourceId: "manual-entry",
    title: "Generic desktop unknown platform fixture",
    url: null
  },
  {
    categoryLabel: "Duplicate fixture A",
    currency: "AED",
    description:
      "Lenovo ThinkStation P520 W-2135 64GB ECC DDR4 Quadro P2000 1TB NVMe.",
    externalId: "fixture-duplicate-external-id-01",
    fixtureSourceType: "validation-error-fixture",
    imageCount: 5,
    locationText: "Dubai, UAE",
    marketplaceSpecific: { fixture: "duplicate-a" },
    observedAt: "2026-07-06T08:25:00.000Z",
    priceText: "AED 1500",
    sellerDisplayName: "Fixture duplicate seller",
    sourceId: "dubizzle",
    title: "ThinkStation P520 duplicate fixture A",
    url: null
  },
  {
    categoryLabel: "Duplicate fixture B",
    currency: "AED",
    description:
      "Lenovo ThinkStation P520 W-2135 64GB ECC DDR4 Quadro P2000 1TB NVMe duplicate row.",
    externalId: "fixture-duplicate-external-id-01",
    fixtureSourceType: "validation-error-fixture",
    imageCount: 5,
    locationText: "Dubai, UAE",
    marketplaceSpecific: { fixture: "duplicate-b" },
    observedAt: "2026-07-06T08:30:00.000Z",
    priceText: "AED 1500",
    sellerDisplayName: "Fixture duplicate seller",
    sourceId: "dubizzle",
    title: "ThinkStation P520 duplicate fixture B",
    url: null
  }
];

export const importerFixtureSets: ImporterFixtureSet[] = [
  {
    description:
      "Validated representative demo listings that can seed Listing Intelligence into Supabase.",
    id: "core-demo-listings",
    listings: validDemoFixtures,
    title: "Core demo listings"
  },
  {
    description:
      "Intentional error cases for fixture validation: missing title, missing price, unsupported marketplace, invalid currency, low-confidence platform detection, and duplicate external ID.",
    id: "validation-error-listings",
    listings: validationErrorFixtures,
    title: "Validation error fixtures"
  }
];
