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
import { getComponentCategoryLabel } from "@/lib/component-inventory";
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
import type { ComponentInventoryItem } from "@/types/component-inventory";
import type { SearchPersistenceState } from "@/types/persistence";

type SearchExperienceProps = {
  componentInventory?: ComponentInventoryItem[];
  initialFilters?: HardwareFilters;
  inventoryContext?: {
    description: string;
    slotId: string;
    title: string;
  } | null;
  persistence: SearchPersistenceState;
};

export function SearchExperience({
  componentInventory = [],
  initialFilters = defaultHardwareFilters,
  inventoryContext,
  persistence
}: SearchExperienceProps) {
  const [filters, setFilters] = useState<HardwareFilters>(initialFilters);
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
  const activeRankingUseCase =
    filters.useCase === "all" ? undefined : filters.useCase;

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
    setFilters(initialFilters);
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
            {inventoryContext ? "Inventory service" : "Supporting service"}
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold">
                {inventoryContext?.title ?? "Search Experience"}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
                {inventoryContext?.description ??
                  "Local mock listings ranked by the transparent deterministic decision engine across value, performance, reliability, risk, freshness, upgrade room, shipping friction, and use-case fit."}
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
          {inventoryContext ? (
            <section className="mb-5 rounded-lg border border-border bg-panel p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Component inventory</h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Slot-filtered component candidates for {inventoryContext.title}.
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted">
                  {componentInventory.length} components
                </div>
              </div>
              {componentInventory.length > 0 ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {componentInventory.slice(0, 6).map((component) => (
                    <article key={component.id} className="rounded-lg border border-border bg-background p-4">
                      <p className="text-xs font-semibold uppercase text-accent-strong dark:text-accent">
                        {getComponentCategoryLabel(component.category)}
                      </p>
                      <h3 className="mt-2 text-base font-semibold">{component.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted">
                        {component.summary}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                        <span className="rounded-lg border border-border bg-panel px-2 py-1">
                          ${component.price}
                        </span>
                        <span className="rounded-lg border border-border bg-panel px-2 py-1">
                          {component.condition}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted">
                  No typed components are mapped to this slot yet.
                </p>
              )}
            </section>
          ) : null}

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
                  rankingUseCase={activeRankingUseCase}
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
