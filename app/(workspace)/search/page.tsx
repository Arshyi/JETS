import { SearchExperience } from "@/components/search/search-experience";
import { getSearchPersistenceState } from "@/lib/supabase/queries";

export default async function SearchPage() {
  const persistence = await getSearchPersistenceState();

  return <SearchExperience persistence={persistence} />;
}
