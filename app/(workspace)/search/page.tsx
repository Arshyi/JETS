import type { Metadata } from "next";

import { SearchExperience } from "@/components/search/search-experience";
import { getSearchPersistenceState } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Search",
  description: "Search, filter, rank, save, favorite, and compare local JETS mock hardware listings."
};

export default async function SearchPage() {
  const persistence = await getSearchPersistenceState();

  return <SearchExperience persistence={persistence} />;
}
