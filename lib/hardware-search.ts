import { mockHardwareListings } from "@/data/mock-listings";
import type {
  HardwareFilters,
  HardwareListing,
  HardwareSortKey
} from "@/types/hardware";

export const maxCompareListings = 3;

export const defaultHardwareFilters: HardwareFilters = {
  query: "",
  minBudget: null,
  maxBudget: null,
  useCase: "all",
  formFactor: "all",
  condition: "all",
  location: "all"
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value);
}

export function getHardwareLocations(listings: HardwareListing[]) {
  return Array.from(new Set(listings.map((listing) => listing.location))).sort();
}

export function filterHardwareListings(
  listings: HardwareListing[],
  filters: HardwareFilters
) {
  const query = filters.query.trim().toLowerCase();

  return listings.filter((listing) => {
    const searchableText = [
      listing.title,
      listing.summary,
      listing.location,
      listing.weightClass,
      ...listing.tags,
      ...Object.values(listing.specs)
    ]
      .join(" ")
      .toLowerCase();

    if (query && !searchableText.includes(query)) {
      return false;
    }

    if (filters.minBudget !== null && listing.price < filters.minBudget) {
      return false;
    }

    if (filters.maxBudget !== null && listing.price > filters.maxBudget) {
      return false;
    }

    if (
      filters.useCase !== "all" &&
      !listing.recommendedUseCases.includes(filters.useCase)
    ) {
      return false;
    }

    if (filters.formFactor !== "all" && listing.formFactor !== filters.formFactor) {
      return false;
    }

    if (filters.condition !== "all" && listing.condition !== filters.condition) {
      return false;
    }

    if (filters.location !== "all" && listing.location !== filters.location) {
      return false;
    }

    return true;
  });
}

export function sortHardwareListings(
  listings: HardwareListing[],
  sortKey: HardwareSortKey
) {
  return [...listings].sort((a, b) => {
    if (sortKey === "lowest-price") {
      return a.price - b.price || b.scores.value - a.scores.value;
    }

    if (sortKey === "highest-performance") {
      return b.scores.performance - a.scores.performance || a.price - b.price;
    }

    if (sortKey === "highest-reliability") {
      return b.scores.reliability - a.scores.reliability || a.price - b.price;
    }

    if (sortKey === "best-sleeper") {
      return b.scores.sleeper - a.scores.sleeper || b.scores.value - a.scores.value;
    }

    return b.scores.value - a.scores.value || a.price - b.price;
  });
}

export function searchHardwareListings(
  listings: HardwareListing[],
  filters: HardwareFilters,
  sortKey: HardwareSortKey
) {
  return sortHardwareListings(filterHardwareListings(listings, filters), sortKey);
}

export function parseCompareIds(value: string | null) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, maxCompareListings);
}

export function getListingsByIds(ids: string[]) {
  const listingsById = new Map(
    mockHardwareListings.map((listing) => [listing.id, listing])
  );

  return ids
    .map((id) => listingsById.get(id))
    .filter((listing): listing is HardwareListing => Boolean(listing));
}

export function getCompareHref(ids: string[]) {
  const selectedIds = ids.slice(0, maxCompareListings);

  if (selectedIds.length === 0) {
    return "/compare";
  }

  return `/compare?ids=${encodeURIComponent(selectedIds.join(","))}`;
}
