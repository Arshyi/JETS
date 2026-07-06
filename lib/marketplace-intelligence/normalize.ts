import {
  marketplaceSourceAdapterDefinitions,
  mockMarketplaceRawListings
} from "@/data/mock-marketplace-intelligence";
import { getPlatformKnowledgeById } from "@/lib/platform-knowledge";
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
import type {
  MarketplaceFieldSource,
  MarketplaceHealthSnapshot,
  MarketplaceImportPipelineResult,
  MarketplaceNormalizedListing,
  MarketplaceOpportunityPreview,
  MarketplaceUpgradePathway,
  ParsedListingField,
  PlatformDetection,
  RawMarketplaceListing
} from "@/types/marketplace-intelligence";

type AliasMatch<T extends string> = {
  aliases: string[];
  value: T;
};

const platformAliases: Array<AliasMatch<PlatformKnowledgeId> & { label: string }> = [
  {
    aliases: ["precision 5820", "dell precision 5820", "t5820"],
    label: "Dell Precision 5820",
    value: "precision-5820"
  },
  {
    aliases: ["precision t5810", "dell t5810", "t5810"],
    label: "Dell Precision T5810",
    value: "precision-t5810"
  },
  {
    aliases: ["thinkstation p520", "lenovo p520", "p520"],
    label: "Lenovo ThinkStation P520",
    value: "thinkstation-p520"
  },
  {
    aliases: ["thinkstation p510", "lenovo p510", "p510"],
    label: "Lenovo ThinkStation P510",
    value: "thinkstation-p510"
  },
  {
    aliases: ["optiplex 7060", "dell 7060", "7060 sff"],
    label: "Dell OptiPlex 7060 SFF",
    value: "optiplex-7060"
  },
  {
    aliases: ["hp z440", "z440"],
    label: "HP Z440",
    value: "hp-z440"
  },
  {
    aliases: ["hp z840", "z840"],
    label: "HP Z840",
    value: "hp-z840"
  },
  {
    aliases: ["mac pro 5 1", "mac pro 5,1", "macpro5 1", "cheese grater"],
    label: "Mac Pro 5,1",
    value: "mac-pro-5-1"
  }
];

const cpuAliases = [
  "Xeon W-2135",
  "Xeon W",
  "Core i5-8500",
  "i5 8500",
  "Core i7-11850H",
  "i7-11850H",
  "Core i7-9700T",
  "i7-9700T",
  "Ryzen 5 5600",
  "Ryzen 5",
  "Dual CPU"
];

const gpuAliases = [
  "RTX 4070",
  "RTX 3060 Ti",
  "RTX 3060",
  "RTX A2000",
  "A2000 Laptop",
  "Quadro P2000",
  "Quadro P620",
  "P2000",
  "P620",
  "RX 580",
  "Intel UHD 630"
];

const ramAliases = ["ram", "memory", "ecc ddr4", "ddr4", "sodimm", "so-dimm"];

const storageAliases = ["nvme", "ssd", "hdd", "sata", "m.2"];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function textIncludes(text: string, term: string) {
  return normalizeText(text).includes(normalizeText(term));
}

function parsedField<T>(
  value: T | null,
  confidence: ConfidenceLevel,
  source: MarketplaceFieldSource
): ParsedListingField<T> {
  return { confidence, source, value };
}

function detectTextValue(
  raw: RawMarketplaceListing,
  aliases: string[]
): ParsedListingField<string> {
  const titleMatch = aliases.find((alias) => textIncludes(raw.title, alias));

  if (titleMatch) {
    return parsedField(titleMatch, "high", "listing-title");
  }

  const descriptionMatch = aliases.find((alias) =>
    textIncludes(raw.description, alias)
  );

  if (descriptionMatch) {
    return parsedField(descriptionMatch, "medium", "listing-description");
  }

  return parsedField<string>(null, "low", "listing-description");
}

function parsePrice(raw: RawMarketplaceListing): ParsedListingField<number> {
  const numeric = Number(raw.priceText.replace(/[^0-9.]/g, ""));

  if (Number.isFinite(numeric) && numeric > 0) {
    return parsedField(numeric, "high", "marketplace-metadata");
  }

  return parsedField<number>(null, "low", "marketplace-metadata");
}

function parseCondition(raw: RawMarketplaceListing): ParsedListingField<HardwareCondition> {
  const text = `${raw.title} ${raw.description} ${raw.categoryLabel}`;

  if (
    ["for parts", "no boot", "water damage", "broken", "fault"].some((term) =>
      textIncludes(text, term)
    )
  ) {
    return parsedField("broken", "high", "listing-description");
  }

  if (["excellent", "tested", "good condition"].some((term) => textIncludes(text, term))) {
    return parsedField("good", "medium", "listing-description");
  }

  return parsedField("good", "low", "listing-description");
}

function parseFormFactor(raw: RawMarketplaceListing): ParsedListingField<HardwareFormFactor> {
  const text = `${raw.title} ${raw.description} ${raw.categoryLabel}`;

  if (["laptop", "mobile workstation", "thinkpad"].some((term) => textIncludes(text, term))) {
    return parsedField("laptop", "high", "listing-title");
  }

  if (["gpu", "graphics card", "component"].some((term) => textIncludes(text, term))) {
    return parsedField("component", "medium", "listing-title");
  }

  if (["workstation", "precision", "thinkstation", "z440", "z840"].some((term) => textIncludes(text, term))) {
    return parsedField("workstation", "high", "listing-title");
  }

  return parsedField("desktop", "medium", "listing-title");
}

function parseRam(raw: RawMarketplaceListing): ParsedListingField<string> {
  const combined = `${raw.title} ${raw.description}`;
  const explicitAfterSize = combined.match(
    /(\d{1,4})\s*gb\s*(?:ecc\s*)?(?:ddr\d|ram|memory|sodimm|so-dimm)/i
  );
  const explicitBeforeSize = combined.match(
    /(?:ram|memory)\D{0,20}(\d{1,4})\s*gb/i
  );
  const match = explicitAfterSize ?? explicitBeforeSize;

  if (!match) {
    return parsedField<string>(null, "low", "listing-description");
  }

  return parsedField(
    `${match[1]} GB`,
    ramAliases.some((alias) => textIncludes(combined, alias)) ? "high" : "medium",
    "listing-description"
  );
}

function parseStorage(raw: RawMarketplaceListing): ParsedListingField<string> {
  const combined = `${raw.title} ${raw.description}`;
  const match = combined.match(/(\d+(?:\.\d+)?)\s*(tb|gb)\s*(nvme|ssd|hdd|sata|m\.2)/i);

  if (!match) {
    return parsedField<string>(null, "low", "listing-description");
  }

  const size = `${match[1]} ${match[2].toUpperCase()}`;
  const kind = ` ${match[3].toUpperCase()}`;

  return parsedField(
    `${size}${kind}`,
    storageAliases.some((alias) => textIncludes(combined, alias)) ? "medium" : "low",
    "listing-description"
  );
}

function parseOperatingSystem(raw: RawMarketplaceListing): ParsedListingField<string> {
  if (textIncludes(raw.description, "windows 11")) {
    return parsedField("Windows 11", "medium", "listing-description");
  }

  if (textIncludes(raw.description, "windows installed")) {
    return parsedField("Windows installed", "medium", "listing-description");
  }

  if (textIncludes(raw.description, "no os")) {
    return parsedField<string>(null, "high", "listing-description");
  }

  return parsedField<string>(null, "low", "listing-description");
}

function parseGeneration(raw: RawMarketplaceListing): ParsedListingField<string> {
  const cpu = detectTextValue(raw, cpuAliases).value;

  if (!cpu) {
    return parsedField<string>(null, "low", "listing-title");
  }

  if (cpu.includes("8500") || cpu.includes("9700")) {
    return parsedField("Intel 8th/9th generation class", "medium", "listing-title");
  }

  if (cpu.includes("11850")) {
    return parsedField("Intel 11th generation mobile workstation class", "medium", "listing-title");
  }

  if (cpu.includes("W-2135") || cpu.includes("Xeon W")) {
    return parsedField("Xeon W LGA2066 class", "medium", "listing-title");
  }

  if (cpu.includes("Ryzen 5")) {
    return parsedField("Ryzen AM4 class", "medium", "listing-title");
  }

  return parsedField<string>(null, "low", "listing-title");
}

function detectPlatform(raw: RawMarketplaceListing): PlatformDetection {
  const combined = `${raw.title} ${raw.description}`;
  const match = platformAliases.find((candidate) =>
    candidate.aliases.some((alias) => textIncludes(combined, alias))
  );

  if (!match) {
    return {
      confidence: "low",
      detectedGeneration: parseGeneration(raw),
      detectedPlatformId: null,
      detectedPlatformName: null,
      evidence: ["No known platform alias matched the title or description."],
      source: "listing-title"
    };
  }

  const matchedInTitle = match.aliases.some((alias) => textIncludes(raw.title, alias));

  return {
    confidence: matchedInTitle ? "high" : "medium",
    detectedGeneration: parseGeneration(raw),
    detectedPlatformId: match.value,
    detectedPlatformName: match.label,
    evidence: [
      `Matched alias for ${match.label}.`,
      matchedInTitle ? "Alias appeared in listing title." : "Alias appeared in listing description."
    ],
    source: matchedInTitle ? "listing-title" : "listing-description"
  };
}

function inferUseCases(raw: RawMarketplaceListing, platformId: PlatformKnowledgeId | null) {
  const text = `${raw.title} ${raw.description} ${raw.categoryLabel}`;
  const useCases = new Set<HardwareUseCase>();

  if (["gaming", "rtx", "rx ", "gtx"].some((term) => textIncludes(text, term))) {
    useCases.add("gaming");
  }

  if (["cad", "quadro", "workstation", "precision", "thinkstation"].some((term) => textIncludes(text, term))) {
    useCases.add("cad");
    useCases.add("engineering");
  }

  if (["rtx", "a2000", "local ai", "cuda"].some((term) => textIncludes(text, term))) {
    useCases.add("ai");
  }

  if (["optiplex", "mini pc", "office"].some((term) => textIncludes(text, term))) {
    useCases.add("general");
    useCases.add("homelab");
  }

  if (["laptop", "thinkpad"].some((term) => textIncludes(text, term))) {
    useCases.add("programming");
  }

  if (platformId) {
    useCases.add("engineering");
  }

  if (useCases.size === 0) {
    useCases.add("general");
  }

  return Array.from(useCases);
}

function getFieldCompleteness(listing: MarketplaceNormalizedListing) {
  const fields = [
    listing.price.amount.value,
    listing.location.locality.value,
    listing.hardware.platformDetection.detectedPlatformName,
    listing.hardware.detectedComponents.cpu.value,
    listing.hardware.detectedComponents.gpu.value,
    listing.hardware.detectedComponents.memory.value,
    listing.hardware.detectedComponents.storage.value,
    listing.hardware.detectedComponents.operatingSystem.value
  ];

  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

function getMissingInformation(listing: MarketplaceNormalizedListing) {
  const missing: string[] = [];

  if (!listing.price.amount.value) missing.push("price");
  if (!listing.hardware.platformDetection.detectedPlatformName) missing.push("platform");
  if (!listing.hardware.detectedComponents.cpu.value) missing.push("CPU");
  if (!listing.hardware.detectedComponents.gpu.value) missing.push("GPU");
  if (!listing.hardware.detectedComponents.memory.value) missing.push("RAM");
  if (!listing.hardware.detectedComponents.storage.value) missing.push("storage");
  if (!listing.hardware.detectedComponents.operatingSystem.value) missing.push("operating system");

  return missing;
}

function averageConfidence(values: ConfidenceLevel[]): ConfidenceLevel {
  const scores = values.map((value) =>
    value === "high" ? 3 : value === "medium" ? 2 : 1
  );
  const average = scores.reduce((total, value) => total + value, 0) / scores.length;

  if (average >= 2.5) return "high";
  if (average >= 1.6) return "medium";
  return "low";
}

function buildHealth(listing: MarketplaceNormalizedListing): MarketplaceHealthSnapshot {
  const missingInformation = getMissingInformation(listing);
  const parsingConfidence = averageConfidence([
    listing.price.amount.confidence,
    listing.hardware.platformDetection.confidence,
    listing.hardware.detectedComponents.cpu.confidence,
    listing.hardware.detectedComponents.gpu.confidence,
    listing.hardware.detectedComponents.memory.confidence,
    listing.hardware.detectedComponents.storage.confidence
  ]);

  return {
    communityKnowledgeAvailability: listing.hardware.platformDetection.detectedPlatformId
      ? "high"
      : "low",
    completeness: getFieldCompleteness(listing),
    descriptionQuality:
      listing.description.length > 120
        ? "high"
        : listing.description.length > 60
          ? "medium"
          : "low",
    estimatedReliability:
      missingInformation.length <= 2 && listing.images.count >= 5
        ? "high"
        : missingInformation.length <= 4
          ? "medium"
          : "low",
    missingInformation,
    parsingConfidence,
    photoCount: listing.images.count
  };
}

function buildOpportunities(
  platformId: PlatformKnowledgeId | null
): MarketplaceOpportunityPreview[] {
  const profile = getPlatformKnowledgeById(platformId);

  if (!profile) {
    return [
      {
        confidence: "low",
        estimatedImpact: "Unknown until platform is detected.",
        source: "deterministic-parser",
        title: "Platform opportunity pending"
      }
    ];
  }

  return profile.upgradeOpportunities.slice(0, 4).map((opportunity) => ({
    confidence: opportunity.confidence,
    estimatedImpact: opportunity.summary,
    source: "platform-knowledge",
    title: opportunity.title
  }));
}

function buildPossibleFutures(
  raw: RawMarketplaceListing,
  platformId: PlatformKnowledgeId | null
): MarketplaceUpgradePathway[] {
  const text = `${raw.title} ${raw.description} ${raw.categoryLabel}`;
  const futures: MarketplaceUpgradePathway[] = [];

  if (["for parts", "no boot", "water damage", "broken", "fault"].some((term) => textIncludes(text, term))) {
    return [
      {
        confidence: "low",
        description:
          "Repair-risk listings must be reviewed for fault scope, replacement parts, and negotiation upside before they become a recommendation.",
        linksInto: "solution-intelligence",
        targetUseCase: "general",
        title: "Repair-risk Listing Review"
      }
    ];
  }

  if (platformId) {
    futures.push({
      confidence: "high",
      description:
        "Detected platform can be handed to Platform Knowledge and Solution Intelligence for project-level reasoning.",
      linksInto: "solution-intelligence",
      targetUseCase: "engineering",
      title: "Engineering Workstation"
    });
  }

  if (["rtx", "gaming", "rx "].some((term) => textIncludes(text, term))) {
    futures.push({
      confidence: "medium",
      description:
        "GPU clues suggest a gaming path, but PSU, case clearance, and CPU bottleneck still need Builder validation.",
      linksInto: "optimization",
      targetUseCase: "gaming",
      title: "Gaming PC"
    });
  }

  if (["rtx", "quadro", "a2000", "p2000"].some((term) => textIncludes(text, term))) {
    futures.push({
      confidence: "medium",
      description:
        "GPU and platform clues can be analyzed for CUDA, CAD, rendering, or local AI suitability.",
      linksInto: "solution-intelligence",
      targetUseCase: "ai",
      title: "Local AI"
    });
  }

  if (["optiplex", "mac pro", "workstation", "server", "mini pc"].some((term) => textIncludes(text, term))) {
    futures.push({
      confidence: "medium",
      description:
        "Storage, networking, noise, and power signals can be evaluated as a home-server pathway.",
      linksInto: "platform-knowledge",
      targetUseCase: "homelab",
      title: "Home Server"
    });
  }

  return futures.length > 0
    ? futures
    : [
        {
          confidence: "low",
          description:
            "Normalized listing needs more detected hardware before JETS can propose a future path.",
          linksInto: "solution-intelligence",
          targetUseCase: "general",
          title: "General Purpose System"
        }
      ];
}

function getOverallConfidence(
  listing: MarketplaceNormalizedListing
): {
  confidence: ConfidenceLevel;
  reason: string;
  source: ConfidenceSourceType;
} {
  const confidenceValue = averageConfidence([
    listing.health.parsingConfidence,
    listing.hardware.platformDetection.confidence,
    listing.health.estimatedReliability
  ]);

  return {
    confidence: confidenceValue,
    reason:
      confidenceValue === "high"
        ? "Core hardware fields, platform detection, and listing health are strong enough for demo reasoning."
        : confidenceValue === "medium"
          ? "Some useful fields were parsed, but missing information should be reviewed before ranking."
          : "Too many important fields are unknown for confident reasoning.",
    source: "demo-fixture"
  };
}

function getSourceName(sourceId: RawMarketplaceListing["sourceId"]) {
  return (
    marketplaceSourceAdapterDefinitions.find((source) => source.id === sourceId)
      ?.name ?? sourceId
  );
}

export function normalizeMarketplaceListing(
  raw: RawMarketplaceListing
): MarketplaceNormalizedListing {
  const platformDetection = detectPlatform(raw);
  const sourceName = getSourceName(raw.sourceId);
  const listingWithoutHealthAndConfidence = {
    confidence: {
      confidence: "low" as ConfidenceLevel,
      reason: "Pending health calculation.",
      source: "demo-fixture" as ConfidenceSourceType
    },
    description: raw.description,
    hardware: {
      condition: parseCondition(raw),
      detectedComponents: {
        cpu: detectTextValue(raw, cpuAliases),
        gpu: detectTextValue(raw, gpuAliases),
        memory: parseRam(raw),
        operatingSystem: parseOperatingSystem(raw),
        storage: parseStorage(raw)
      },
      formFactor: parseFormFactor(raw),
      platformDetection,
      recommendedUseCases: inferUseCases(
        raw,
        platformDetection.detectedPlatformId
      )
    },
    health: {
      communityKnowledgeAvailability: "low" as ConfidenceLevel,
      completeness: 0,
      descriptionQuality: "low" as ConfidenceLevel,
      estimatedReliability: "low" as ConfidenceLevel,
      missingInformation: [],
      parsingConfidence: "low" as ConfidenceLevel,
      photoCount: raw.imageCount
    },
    id: `${raw.sourceId}:${raw.externalId}`,
    images: {
      count: raw.imageCount,
      placeholders: Array.from({ length: Math.min(raw.imageCount, 3) }).map(
        (_, index) => `image-${index + 1}`
      )
    },
    location: {
      country: parsedField(raw.locationText.includes("UAE") ? "UAE" : "USA", "medium", "marketplace-metadata"),
      locality: parsedField(raw.locationText, "high", "marketplace-metadata"),
      raw: raw.locationText
    },
    marketplace: {
      externalId: raw.externalId,
      observedAt: raw.observedAt,
      sourceId: raw.sourceId,
      sourceName,
      url: raw.url
    },
    opportunities: buildOpportunities(platformDetection.detectedPlatformId),
    possibleFutures: buildPossibleFutures(raw, platformDetection.detectedPlatformId),
    price: {
      amount: parsePrice(raw),
      currency: raw.currency
    },
    raw,
    seller: {
      displayName: raw.sellerDisplayName,
      rating: parsedField(
        raw.sellerRatingText ?? null,
        raw.sellerRatingText ? "medium" : "low",
        "marketplace-metadata"
      )
    },
    title: raw.title
  } satisfies MarketplaceNormalizedListing;
  const health = buildHealth(listingWithoutHealthAndConfidence);
  const listing = {
    ...listingWithoutHealthAndConfidence,
    health
  };

  return {
    ...listing,
    confidence: getOverallConfidence(listing)
  };
}

export function buildMarketplaceImportPipelineReport(): MarketplaceImportPipelineResult {
  const listings = mockMarketplaceRawListings.map(normalizeMarketplaceListing);
  const platformMatches = listings.filter(
    (listing) => listing.hardware.platformDetection.detectedPlatformId
  ).length;

  return {
    generatedAt: "2026-07-05T09:45:00.000Z",
    listings,
    sourceAdapters: marketplaceSourceAdapterDefinitions,
    totals: {
      highConfidencePlatforms: listings.filter(
        (listing) => listing.hardware.platformDetection.confidence === "high"
      ).length,
      listingsNormalized: listings.length,
      platformMatches,
      sourcesRepresented: new Set(listings.map((listing) => listing.marketplace.sourceId)).size
    }
  };
}
