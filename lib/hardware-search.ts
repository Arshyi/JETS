import { mockHardwareListings } from "@/data/mock-listings";
import { sortListingsByDecision } from "@/lib/decision-engine/ranking";
import type {
  HardwareFilters,
  HardwareListing,
  HardwareSortKey,
  HardwareUseCase
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
  sortKey: HardwareSortKey,
  useCase?: HardwareUseCase
) {
  return sortListingsByDecision(listings, sortKey, useCase);
}

export function searchHardwareListings(
  listings: HardwareListing[],
  filters: HardwareFilters,
  sortKey: HardwareSortKey
) {
  return sortHardwareListings(
    filterHardwareListings(listings, filters),
    sortKey,
    filters.useCase === "all" ? undefined : filters.useCase
  );
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
