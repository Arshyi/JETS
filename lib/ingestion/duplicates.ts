import { getCanonicalTokens } from "@/lib/ingestion/normalize";
import type {
  DuplicateGroup,
  DuplicateListingReference,
  NormalizedListing
} from "@/types/ingestion";

function toTokenSet(title: string) {
  return new Set(getCanonicalTokens(title));
}

function getModelTokens(title: string) {
  return getCanonicalTokens(title).filter(
    (token) =>
      /\d/.test(token) ||
      [
        "alienware",
        "macbook",
        "optiplex",
        "quadro",
        "radeon",
        "rtx",
        "thinkpad",
        "thinkstation",
        "xeon"
      ].includes(token)
  );
}

function getOverlapScore(left: Set<string>, right: Set<string>) {
  const intersection = Array.from(left).filter((token) => right.has(token)).length;
  const union = new Set([...Array.from(left), ...Array.from(right)]).size;

  return union === 0 ? 0 : intersection / union;
}

function getPriceDeltaPercent(left: NormalizedListing, right: NormalizedListing) {
  if (left.price === null || right.price === null) {
    return 1;
  }

  const average = (left.price + right.price) / 2;

  return average === 0 ? 1 : Math.abs(left.price - right.price) / average;
}

function isLikelyDuplicate(left: NormalizedListing, right: NormalizedListing) {
  if (left.id === right.id) {
    return false;
  }

  if (left.sourceId === right.sourceId && left.externalId === right.externalId) {
    return true;
  }

  const priceDelta = getPriceDeltaPercent(left, right);
  const titleOverlap = getOverlapScore(toTokenSet(left.title), toTokenSet(right.title));
  const leftModels = new Set(getModelTokens(left.title));
  const rightModels = new Set(getModelTokens(right.title));
  const modelOverlap = getOverlapScore(leftModels, rightModels);

  return (
    (modelOverlap >= 0.6 && priceDelta <= 0.22) ||
    (titleOverlap >= 0.52 && priceDelta <= 0.18)
  );
}

function toReference(listing: NormalizedListing): DuplicateListingReference {
  return {
    currency: listing.currency,
    externalId: listing.externalId,
    freshness: listing.freshness,
    id: listing.id,
    location: listing.location,
    price: listing.price,
    sourceName: listing.sourceName,
    title: listing.title
  };
}

function getGroupConfidence(listings: NormalizedListing[]) {
  if (listings.length < 2) {
    return 0;
  }

  const [first, ...rest] = listings;
  const scores = rest.map((listing) => {
    const tokenScore = getOverlapScore(toTokenSet(first.title), toTokenSet(listing.title));
    const priceScore = 1 - Math.min(getPriceDeltaPercent(first, listing), 1);

    return tokenScore * 0.65 + priceScore * 0.35;
  });

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  return Math.round(Math.max(0.45, Math.min(0.98, average)) * 100);
}

export function detectDuplicateGroups(listings: NormalizedListing[]): DuplicateGroup[] {
  const groups: DuplicateGroup[] = [];
  const assignedIds = new Set<string>();

  listings.forEach((listing) => {
    if (assignedIds.has(listing.id)) {
      return;
    }

    const matches = [
      listing,
      ...listings.filter(
        (candidate) =>
          !assignedIds.has(candidate.id) && isLikelyDuplicate(listing, candidate)
      )
    ];

    if (matches.length < 2) {
      return;
    }

    matches.forEach((match) => assignedIds.add(match.id));

    groups.push({
      canonicalTitle: matches[0].title,
      confidence: getGroupConfidence(matches),
      id: `dup-${groups.length + 1}`,
      listings: matches.map(toReference),
      reason: "Similar model tokens and close asking prices across sources."
    });
  });

  return groups;
}
