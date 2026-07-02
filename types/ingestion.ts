import type {
  HardwareCondition,
  HardwareFormFactor,
  HardwareUseCase
} from "@/types/hardware";

export const listingSourceIds = [
  "dubizzle",
  "amazon-ae",
  "computer-plaza",
  "manual-upload"
] as const;

export type ListingSourceId = (typeof listingSourceIds)[number];

export type ListingSourceKind =
  | "marketplace"
  | "retail"
  | "local-vendor"
  | "manual";

export type ListingSourceStatus =
  | "healthy"
  | "degraded"
  | "paused"
  | "setup-required";

export type FreshnessStatus = "fresh" | "aging" | "stale";

export type MarketplaceCurrency = "AED" | "USD";

export type SourceRateLimitPolicy = {
  cooldownSeconds: number;
  maxRequestsPerMinute: number;
  notes: string;
};

export type ListingSource = {
  adapterMode: "mock-dry-run";
  baseUrl: string | null;
  complianceNotes: string[];
  enabled: boolean;
  id: ListingSourceId;
  kind: ListingSourceKind;
  locationScope: string;
  name: string;
  rateLimit: SourceRateLimitPolicy;
  status: ListingSourceStatus;
};

export type MockMarketplaceListingSeed = {
  categoryLabel: string;
  conditionLabel: string;
  currency: MarketplaceCurrency;
  description: string;
  externalId: string;
  firstSeenDaysAgo: number;
  location: string;
  observedDaysAgo: number;
  price: number | null;
  sellerName: string;
  sourceId: ListingSourceId;
  specs: Record<string, string>;
  title: string;
  url: string | null;
};

export type NormalizedListing = {
  category: string;
  condition: HardwareCondition;
  currency: MarketplaceCurrency;
  description: string;
  duplicateKey: string;
  externalId: string;
  firstSeenAt: string;
  formFactor: HardwareFormFactor;
  freshness: FreshnessStatus;
  id: string;
  lastSeenAt: string;
  listingUrl: string | null;
  location: string;
  price: number | null;
  recommendedUseCases: HardwareUseCase[];
  riskSignals: string[];
  sellerName: string;
  sourceId: ListingSourceId;
  sourceName: string;
  specs: Record<string, string>;
  title: string;
};

export type AdapterDryRunResult = {
  errors: string[];
  finishedAt: string;
  listings: NormalizedListing[];
  listingsNormalized: number;
  listingsSeen: number;
  source: ListingSource;
  startedAt: string;
  warnings: string[];
};

export type SourceAdapter = {
  dryRun: (context: IngestionRunContext) => Promise<AdapterDryRunResult>;
  source: ListingSource;
};

export type IngestionRunContext = {
  now: Date;
};

export type DuplicateListingReference = {
  currency: MarketplaceCurrency;
  externalId: string;
  freshness: FreshnessStatus;
  id: string;
  location: string;
  price: number | null;
  sourceName: string;
  title: string;
};

export type DuplicateGroup = {
  canonicalTitle: string;
  confidence: number;
  id: string;
  listings: DuplicateListingReference[];
  reason: string;
};

export type SourceHealthSnapshot = {
  agingCount: number;
  complianceNotes: string[];
  freshCount: number;
  lastObservedAt: string | null;
  listingCount: number;
  message: string;
  rateLimitSummary: string;
  source: ListingSource;
  staleCount: number;
  warningCount: number;
};

export type IngestionDryRunReport = {
  adapterResults: AdapterDryRunResult[];
  duplicateGroups: DuplicateGroup[];
  generatedAt: string;
  health: SourceHealthSnapshot[];
  listings: NormalizedListing[];
  mode: "dry-run";
  totals: {
    duplicatesDetected: number;
    sourcesChecked: number;
    staleListings: number;
    totalListings: number;
    warnings: number;
  };
};
