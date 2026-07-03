import type { Metadata } from "next";

import { SearchExperience } from "@/components/search/search-experience";
import { getHardwareFiltersFromSearchParams } from "@/lib/hardware-search";
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

  return (
    <SearchExperience
      initialFilters={initialFilters}
      inventoryContext={inventoryContext}
      persistence={persistence}
    />
  );
}
