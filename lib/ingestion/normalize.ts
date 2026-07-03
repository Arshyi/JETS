import { dateFromDaysAgo, getFreshnessStatus } from "@/lib/ingestion/freshness";
import type { HardwareCondition, HardwareFormFactor, HardwareUseCase } from "@/types/hardware";
import type {
  ListingSource,
  MockMarketplaceListingSeed,
  NormalizedListing
} from "@/types/ingestion";

const stopWords = new Set([
  "and",
  "box",
  "for",
  "gb",
  "good",
  "pc",
  "ram",
  "the",
  "used",
  "with"
]);

function textIncludes(text: string, values: string[]) {
  const normalized = text.toLowerCase();

  return values.some((value) => normalized.includes(value));
}

export function getCanonicalTokens(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function mapCondition(label: string, description: string): HardwareCondition {
  const combined = `${label} ${description}`.toLowerCase();

  if (
    textIncludes(combined, [
      "broken",
      "for parts",
      "no boot",
      "no display",
      "water damage",
      "fault"
    ])
  ) {
    return "broken";
  }

  if (textIncludes(combined, ["fair", "older", "needs", "used"])) {
    return "fair";
  }

  if (textIncludes(combined, ["excellent", "open-box", "open box"])) {
    return "excellent";
  }

  return "good";
}

function inferFormFactor(
  seed: MockMarketplaceListingSeed
): HardwareFormFactor {
  const searchable = `${seed.categoryLabel} ${seed.title} ${seed.description}`.toLowerCase();

  if (textIncludes(searchable, ["gpu", "component", "card"])) {
    return "component";
  }

  if (
    textIncludes(searchable, [
      "laptop",
      "macbook",
      "mobile workstation",
      "notebook",
      "thinkpad",
      "zephyrus"
    ])
  ) {
    return "laptop";
  }

  if (textIncludes(searchable, ["thinkstation", "workstation", "quadro", "xeon"])) {
    return "workstation";
  }

  return "desktop";
}

function inferUseCases(seed: MockMarketplaceListingSeed): HardwareUseCase[] {
  const searchable = `${seed.categoryLabel} ${seed.title} ${seed.description} ${Object.values(
    seed.specs
  ).join(" ")}`.toLowerCase();
  const useCases = new Set<HardwareUseCase>();

  if (textIncludes(searchable, ["gaming", "rtx", "gtx", "rx ", "alienware", "rog"])) {
    useCases.add("gaming");
  }

  if (textIncludes(searchable, ["cad", "quadro", "a2000", "p2000", "p620"])) {
    useCases.add("cad");
  }

  if (
    textIncludes(searchable, [
      "ecc",
      "engineering",
      "thinkstation",
      "workstation",
      "xeon"
    ])
  ) {
    useCases.add("engineering");
  }

  if (
    textIncludes(searchable, [
      "ecc",
      "homelab",
      "lab",
      "node",
      "optiplex",
      "render",
      "server",
      "thinkstation",
      "workstation",
      "xeon"
    ])
  ) {
    useCases.add("homelab");
  }

  if (textIncludes(searchable, ["ai", "cuda", "rtx", "a2000", "3060", "4060"])) {
    useCases.add("ai");
  }

  if (
    textIncludes(searchable, [
      "business",
      "developer",
      "laptop",
      "nvme",
      "programming",
      "ssd",
      "thinkpad"
    ])
  ) {
    useCases.add("programming");
  }

  if (
    textIncludes(searchable, [
      "business",
      "desktop",
      "laptop",
      "office",
      "optiplex",
      "productivity"
    ]) ||
    useCases.size === 0
  ) {
    useCases.add("general");
  }

  return Array.from(useCases);
}

function createDuplicateKey(seed: MockMarketplaceListingSeed) {
  const tokens = getCanonicalTokens(seed.title);
  const modelTokens = tokens.filter((token) => /\d/.test(token));
  const selectedTokens = Array.from(new Set([...modelTokens, ...tokens])).slice(0, 7);
  const priceBucket =
    seed.price === null ? "no-price" : Math.round(seed.price / 100) * 100;

  return `${selectedTokens.join("-")}-${seed.currency}-${priceBucket}`;
}

function buildRiskSignals(
  condition: HardwareCondition,
  seed: MockMarketplaceListingSeed,
  source: ListingSource
) {
  const risks: string[] = [];

  if (condition === "broken") {
    risks.push("Repair-risk listing: verify parts value before treating it as a usable build.");
  }

  if (condition === "fair") {
    risks.push("Condition needs verification with stress tests, photos, or vendor notes.");
  }

  if (seed.price === null) {
    risks.push("Price is missing and should be excluded from ranking until confirmed.");
  }

  if (source.status === "setup-required") {
    risks.push("Source needs policy or credential setup before any future live ingestion.");
  }

  if (!seed.url) {
    risks.push("Dry-run row has no live listing URL by design.");
  }

  return risks;
}

export function normalizeListing(
  seed: MockMarketplaceListingSeed,
  source: ListingSource,
  now: Date
): NormalizedListing {
  const firstSeenAt = dateFromDaysAgo(now, seed.firstSeenDaysAgo);
  const lastSeenAt = dateFromDaysAgo(now, seed.observedDaysAgo);
  const condition = mapCondition(seed.conditionLabel, seed.description);

  return {
    category: seed.categoryLabel,
    condition,
    currency: seed.currency,
    description: seed.description,
    duplicateKey: createDuplicateKey(seed),
    externalId: seed.externalId,
    firstSeenAt,
    formFactor: inferFormFactor(seed),
    freshness: getFreshnessStatus(lastSeenAt, now),
    id: `${seed.sourceId}:${seed.externalId}`,
    lastSeenAt,
    listingUrl: seed.url,
    location: seed.location,
    price: seed.price,
    recommendedUseCases: inferUseCases(seed),
    riskSignals: buildRiskSignals(condition, seed, source),
    sellerName: seed.sellerName,
    sourceId: seed.sourceId,
    sourceName: source.name,
    specs: seed.specs,
    title: seed.title
  };
}
