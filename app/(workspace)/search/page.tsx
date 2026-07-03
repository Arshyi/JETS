import type { Metadata } from "next";

import { SearchExperience } from "@/components/search/search-experience";
import { getComponentsForSlot } from "@/lib/component-inventory";
import { getHardwareFiltersFromSearchParams } from "@/lib/hardware-search";
import { isBuildSlotId } from "@/lib/solution-builder/projects";
import { getSlotInventoryContext } from "@/lib/solution-builder/workspace";
import { getSearchPersistenceState } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Search",
  description: "Search, filter, rank, save, favorite, and compare local JETS mock hardware listings."
};

type SearchPageProps = {
  searchParams?: Promise<{
    condition?: string;
    formFactor?: string;
    location?: string;
    maxBudget?: string;
    minBudget?: string;
    query?: string;
    slot?: string;
    useCase?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = searchParams ? await searchParams : {};
  const persistence = await getSearchPersistenceState();
  const initialFilters = getHardwareFiltersFromSearchParams(params);
  const inventoryContext = getSlotInventoryContext(params.slot);
  const componentInventory =
    params.slot && isBuildSlotId(params.slot) ? getComponentsForSlot(params.slot) : [];

  return (
    <SearchExperience
      componentInventory={componentInventory}
      initialFilters={initialFilters}
      inventoryContext={inventoryContext}
      persistence={persistence}
    />
  );
}
