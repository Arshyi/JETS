"use client";

import { SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { CompareSelectionBar } from "@/components/search/compare-selection-bar";
import { FilterPanel } from "@/components/search/filter-panel";
import { RankingCard } from "@/components/search/ranking-card";
import { SortControl } from "@/components/search/sort-control";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingState } from "@/components/states/loading-state";
import { mockHardwareListings } from "@/data/mock-listings";
import {
  defaultHardwareFilters,
  getHardwareLocations,
  maxCompareListings,
  searchHardwareListings
} from "@/lib/hardware-search";
import type {
  HardwareFilters,
  HardwareListing,
  HardwareSortKey
} from "@/types/hardware";
import type { SearchPersistenceState } from "@/types/persistence";

type SearchExperienceProps = {
  persistence: SearchPersistenceState;
};

export function SearchExperience({ persistence }: SearchExperienceProps) {
  const [filters, setFilters] = useState<HardwareFilters>(defaultHardwareFilters);
  const [sortKey, setSortKey] = useState<HardwareSortKey>("best-value");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 150);

    return () => window.clearTimeout(timeout);
  }, []);

  const locations = useMemo(
    () => getHardwareLocations(mockHardwareListings),
    []
  );

  const listings = useMemo(
    () => searchHardwareListings(mockHardwareListings, filters, sortKey),
    [filters, sortKey]
  );

  const selectedListings = useMemo(() => {
    const listingsById = new Map(
      mockHardwareListings.map((listing) => [listing.id, listing])
    );

    return selectedIds
      .map((id) => listingsById.get(id))
      .filter((listing): listing is HardwareListing => Boolean(listing));
  }, [selectedIds]);

  function updateFilter<Key extends keyof HardwareFilters>(
    key: Key,
    value: HardwareFilters[Key]
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  }

  function resetFilters() {
    setFilters(defaultHardwareFilters);
    setSortKey("best-value");
  }

  function toggleCompare(id: string) {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter((selectedId) => selectedId !== id);
      }

      if (current.length >= maxCompareListings) {
        return current;
      }

      return [...current, id];
    });
  }

  function removeSelected(id: string) {
    setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));
  }

  return (
    <main className="bg-background pb-28">
      <section className="border-b border-border bg-panel">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
            Version 0.2
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold">Search Experience</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
                Local mock listings ranked by value, performance, reliability,
                aesthetics, upgrade room, and repair risk.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted">
              {mockHardwareListings.length} static mock listings
            </div>
          </div>
          {!persistence.isConfigured || !persistence.isSignedIn ? (
            <div className="mt-6 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted">
              {persistence.isConfigured
                ? "Sign in to save builds, favorite listings, and write history. Search still works without an account."
                : persistence.message}
            </div>
          ) : null}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <FilterPanel
            filters={filters}
            locations={locations}
            resultCount={listings.length}
            onChange={updateFilter}
            onReset={resetFilters}
          />
        </div>

        <div>
          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-border bg-panel p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent-strong dark:text-accent">
                <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold">Ranked results</p>
                <p className="text-sm text-muted">
                  Sorted by {sortKey.replaceAll("-", " ")}
                </p>
              </div>
            </div>
            <SortControl sortKey={sortKey} onChange={setSortKey} />
          </div>

          {isLoading ? (
            <LoadingState title="Preparing local mock listings" />
          ) : listings.length === 0 ? (
            <EmptyState
              title="No listings match those filters"
              description="Widen the budget, clear a condition, or search a broader hardware term."
              action={
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                >
                  Reset filters
                </button>
              }
            />
          ) : (
            <div className="grid gap-5">
              {listings.map((listing) => (
                <RankingCard
                  key={listing.id}
                  isFavorited={persistence.favoriteListingIds.includes(listing.id)}
                  isPersistenceReady={
                    persistence.isConfigured && persistence.isSignedIn
                  }
                  isSaved={persistence.savedListingIds.includes(listing.id)}
                  listing={listing}
                  isSelected={selectedIds.includes(listing.id)}
                  isSelectionDisabled={selectedIds.length >= maxCompareListings}
                  onToggleCompare={toggleCompare}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <CompareSelectionBar
        selectedListings={selectedListings}
        onRemove={removeSelected}
        onClear={() => setSelectedIds([])}
      />
    </main>
  );
}
