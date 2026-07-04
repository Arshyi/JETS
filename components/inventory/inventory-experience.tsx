"use client";

import { Boxes, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { ComponentInventoryCard } from "@/components/inventory/component-inventory-card";
import { CompareSelectionBar } from "@/components/search/compare-selection-bar";
import { FilterPanel } from "@/components/search/filter-panel";
import { RankingCard } from "@/components/search/ranking-card";
import { SortControl } from "@/components/search/sort-control";
import { EmptyState } from "@/components/states/empty-state";
import { LoadingState } from "@/components/states/loading-state";
import { StatusPill } from "@/components/ui/status-pill";
import { mockComponentInventory } from "@/data/mock-components";
import { mockHardwareListings } from "@/data/mock-listings";
import {
  defaultHardwareFilters,
  maxCompareListings,
  searchHardwareListings
} from "@/lib/hardware-search";
import {
  filterComponentsForInventory,
  getInventoryCategoryForComponent,
  getInventoryCategoriesForSlot,
  getInventoryLocations,
  getInventorySections,
  getInventorySortDescription,
  inventoryCategoryDescriptions,
  inventoryCategoryLabels
} from "@/lib/inventory";
import type {
  HardwareFilters,
  HardwareListing,
  HardwareSortKey
} from "@/types/hardware";
import type { ComponentInventoryItem } from "@/types/component-inventory";
import type { BuildSlotId } from "@/types/solution-builder";
import type { SearchPersistenceState } from "@/types/persistence";

type InventoryExperienceProps = {
  componentInventory?: ComponentInventoryItem[];
  initialFilters?: HardwareFilters;
  inventoryContext?: {
    description: string;
    slotId: BuildSlotId;
    slotLabel: string;
    title: string;
  } | null;
  persistence: SearchPersistenceState;
  projectContext?: {
    projectId: string;
    returnTo: string;
    slotId: BuildSlotId;
  } | null;
  returnTo?: string;
};

export function InventoryExperience({
  componentInventory,
  initialFilters = defaultHardwareFilters,
  inventoryContext,
  persistence,
  projectContext = null,
  returnTo = "/inventory"
}: InventoryExperienceProps) {
  const [filters, setFilters] = useState<HardwareFilters>(initialFilters);
  const [sortKey, setSortKey] = useState<HardwareSortKey>("best-value");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const slotCategoryIds = inventoryContext
    ? getInventoryCategoriesForSlot(inventoryContext.slotId)
    : null;
  const activeCategoryIds = slotCategoryIds?.length ? slotCategoryIds : undefined;
  const availableComponents = componentInventory ?? mockComponentInventory;

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 150);

    return () => window.clearTimeout(timeout);
  }, []);

  const locations = useMemo(
    () => getInventoryLocations(mockHardwareListings, availableComponents),
    [availableComponents]
  );

  const components = useMemo(() => {
    const filtered = filterComponentsForInventory(availableComponents, filters);

    return activeCategoryIds
      ? filtered.filter((component) =>
          activeCategoryIds.includes(getInventoryCategoryForComponent(component))
        )
      : filtered;
  }, [activeCategoryIds, availableComponents, filters]);

  const listings = useMemo(() => {
    const filtered = searchHardwareListings(mockHardwareListings, filters, sortKey);

    if (!activeCategoryIds) {
      return filtered;
    }

    return getInventorySections(filtered, [], activeCategoryIds).flatMap(
      (section) => section.listings
    );
  }, [activeCategoryIds, filters, sortKey]);
  const sections = useMemo(
    () => getInventorySections(listings, components, activeCategoryIds),
    [activeCategoryIds, components, listings]
  );
  const resultCount = components.length + listings.length;
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
            Inventory service
          </p>
          <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold">
                {inventoryContext?.title ?? "Inventory"}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
                {inventoryContext?.description ??
                  "Demo inventory for Solution Builder projects: components, base systems, adapters, complete systems, and legacy mock listings. This is not live marketplace scraping."}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted">
              {resultCount} demo inventory items
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-sm font-semibold">Project-first workflow</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Inventory supports project slots and generated solution paths. It
                is not the main product surface.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-sm font-semibold">Mock/demo data</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Current items are typed mock components and local mock listings
                for deterministic beta testing.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <p className="text-sm font-semibold">No live scraping</p>
              <p className="mt-2 text-sm leading-6 text-muted">
                Marketplace ingestion is planned, but this page makes no live
                marketplace requests.
              </p>
            </div>
          </div>

          {!persistence.isConfigured || !persistence.isSignedIn ? (
            <div className="mt-6 rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted">
              {persistence.isConfigured
                ? "Sign in to save or favorite inventory research. Project slot inventory remains viewable without an account."
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
            resultCount={resultCount}
            onChange={updateFilter}
            onReset={resetFilters}
          />
        </div>

        <div>
          {inventoryContext ? (
            <section className="mb-5 rounded-lg border border-border bg-panel p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill tone="accent">{inventoryContext.slotLabel}</StatusPill>
                    <StatusPill>{resultCount} matching items</StatusPill>
                  </div>
                  <h2 className="mt-3 text-lg font-semibold">
                    Slot-driven inventory
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Only categories relevant to this slot are shown. Components
                    can be added directly when project context is present.
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          <div className="mb-5 flex flex-col gap-3 rounded-lg border border-border bg-panel p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent-strong dark:text-accent">
                <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold">Category sections</p>
                <p className="text-sm text-muted">
                  No universal ranking across unlike hardware.
                </p>
              </div>
            </div>
            <SortControl sortKey={sortKey} onChange={setSortKey} />
          </div>

          <p className="mb-5 rounded-lg border border-border bg-subtle px-4 py-3 text-sm leading-6 text-muted">
            {getInventorySortDescription(sortKey)}
          </p>

          {isLoading ? (
            <LoadingState title="Preparing demo inventory" />
          ) : sections.length === 0 ? (
            <EmptyState
              title="No inventory matches those filters"
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
            <div className="grid gap-8">
              {sections.map((section) => (
                <section key={section.categoryId}>
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Boxes
                          className="h-5 w-5 text-accent-strong dark:text-accent"
                          aria-hidden="true"
                        />
                        <h2 className="text-2xl font-bold">
                          {inventoryCategoryLabels[section.categoryId]}
                        </h2>
                      </div>
                      <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
                        {inventoryCategoryDescriptions[section.categoryId]}
                      </p>
                    </div>
                    <StatusPill>
                      {section.components.length + section.listings.length} items
                    </StatusPill>
                  </div>

                  {section.components.length > 0 ? (
                    <div className="mb-5 grid gap-5">
                      {section.components.map((component) => (
                        <ComponentInventoryCard
                          key={component.id}
                          component={component}
                          projectContext={projectContext}
                        />
                      ))}
                    </div>
                  ) : null}

                  {section.listings.length > 0 ? (
                    <div className="grid gap-5">
                      {section.listings.map((listing) => (
                        <RankingCard
                          key={listing.id}
                          isFavorited={persistence.favoriteListingIds.includes(
                            listing.id
                          )}
                          isPersistenceReady={
                            persistence.isConfigured && persistence.isSignedIn
                          }
                          isSaved={persistence.savedListingIds.includes(listing.id)}
                          listing={listing}
                          rankingUseCase={activeRankingUseCase}
                          returnTo={returnTo}
                          isSelected={selectedIds.includes(listing.id)}
                          isSelectionDisabled={
                            selectedIds.length >= maxCompareListings
                          }
                          onToggleCompare={toggleCompare}
                        />
                      ))}
                    </div>
                  ) : null}
                </section>
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
