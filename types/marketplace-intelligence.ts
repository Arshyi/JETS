import type {
  HardwareCondition,
  HardwareFormFactor,
  HardwareUseCase
} from "@/types/hardware";
import type {
  ConfidenceLevel,
  ConfidenceSourceType
} from "@/types/solution-intelligence";
import type { PlatformKnowledgeId } from "@/types/platform-knowledge";

export const marketplaceIntelligenceSourceIds = [
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
] as const;

export type MarketplaceIntelligenceSourceId =
  (typeof marketplaceIntelligenceSourceIds)[number];

export type MarketplaceAccessMode =
  | "mock-adapter"
  | "future-approved-api"
  | "future-csv"
  | "future-browser-extension"
  | "future-manual-entry"
  | "future-ocr"
  | "future-image-recognition"
  | "future-llm-extraction";

export type MarketplaceSourceAdapterDefinition = {
  accessMode: MarketplaceAccessMode;
  complianceNotes: string[];
  id: MarketplaceIntelligenceSourceId;
  name: string;
  stage: "demo" | "planned" | "blocked-until-policy-review";
};

export type MarketplaceFieldSource =
  | "listing-title"
  | "listing-description"
  | "seller-provided-specs"
  | "marketplace-metadata"
  | "image-count"
  | "future-ocr"
  | "future-image-recognition"
  | "future-barcode"
  | "future-api";

export type ParsedListingField<T> = {
  confidence: ConfidenceLevel;
  source: MarketplaceFieldSource;
  value: T | null;
};

export type RawMarketplaceListing = {
  categoryLabel: string;
  currency: "AED" | "USD";
  description: string;
  externalId: string;
  imageCount: number;
  locationText: string;
  marketplaceSpecific: Record<string, string | number | boolean | null>;
  observedAt: string;
  priceText: string;
  sellerDisplayName: string;
  sellerRatingText?: string;
  sourceId: MarketplaceIntelligenceSourceId;
  title: string;
  url: string | null;
};

export type MarketplaceMetadata = {
  externalId: string;
  observedAt: string;
  sourceId: MarketplaceIntelligenceSourceId;
  sourceName: string;
  url: string | null;
};

export type SellerMetadata = {
  displayName: string;
  rating: ParsedListingField<string>;
};

export type NormalizedPrice = {
  amount: ParsedListingField<number>;
  currency: "AED" | "USD";
};

export type NormalizedLocation = {
  country: ParsedListingField<string>;
  locality: ParsedListingField<string>;
  raw: string;
};

export type DetectedComponents = {
  cpu: ParsedListingField<string>;
  gpu: ParsedListingField<string>;
  memory: ParsedListingField<string>;
  operatingSystem: ParsedListingField<string>;
  storage: ParsedListingField<string>;
};

export type PlatformDetection = {
  confidence: ConfidenceLevel;
  detectedGeneration: ParsedListingField<string>;
  detectedPlatformId: PlatformKnowledgeId | null;
  detectedPlatformName: string | null;
  evidence: string[];
  source: MarketplaceFieldSource;
};

export type NormalizedHardwareMetadata = {
  condition: ParsedListingField<HardwareCondition>;
  detectedComponents: DetectedComponents;
  formFactor: ParsedListingField<HardwareFormFactor>;
  platformDetection: PlatformDetection;
  recommendedUseCases: HardwareUseCase[];
};

export type MarketplaceHealthSnapshot = {
  communityKnowledgeAvailability: ConfidenceLevel;
  completeness: number;
  descriptionQuality: ConfidenceLevel;
  estimatedReliability: ConfidenceLevel;
  missingInformation: string[];
  parsingConfidence: ConfidenceLevel;
  photoCount: number;
};

export type MarketplaceOpportunityPreview = {
  confidence: ConfidenceLevel;
  estimatedImpact: string;
  source: "platform-knowledge" | "deterministic-parser";
  title: string;
};

export type MarketplaceUpgradePathway = {
  confidence: ConfidenceLevel;
  description: string;
  linksInto: "solution-intelligence" | "platform-knowledge" | "optimization";
  targetUseCase: HardwareUseCase | "rendering" | "virtualization";
  title: string;
};

export type MarketplaceConfidenceSummary = {
  confidence: ConfidenceLevel;
  reason: string;
  source: ConfidenceSourceType;
};

export type MarketplaceNormalizedListing = {
  confidence: MarketplaceConfidenceSummary;
  description: string;
  health: MarketplaceHealthSnapshot;
  hardware: NormalizedHardwareMetadata;
  id: string;
  images: {
    count: number;
    placeholders: string[];
  };
  location: NormalizedLocation;
  marketplace: MarketplaceMetadata;
  opportunities: MarketplaceOpportunityPreview[];
  possibleFutures: MarketplaceUpgradePathway[];
  price: NormalizedPrice;
  raw: RawMarketplaceListing;
  seller: SellerMetadata;
  title: string;
};

export type MarketplaceImportPipelineResult = {
  generatedAt: string;
  listings: MarketplaceNormalizedListing[];
  sourceAdapters: MarketplaceSourceAdapterDefinition[];
  totals: {
    highConfidencePlatforms: number;
    listingsNormalized: number;
    platformMatches: number;
    sourcesRepresented: number;
  };
};
