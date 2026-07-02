import { mockHardwareListings } from "@/data/mock-listings";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  BuildHistoryRow,
  FavoriteBuildRow,
  SavedBuildRow,
  UserSettingsRow
} from "@/types/database";
import type { SearchPersistenceState } from "@/types/persistence";

async function getUserAndClient() {
  if (!isSupabaseConfigured) {
    return {
      client: null,
      message: supabaseSetupMessage,
      userId: null
    };
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      client: null,
      message: supabaseSetupMessage,
      userId: null
    };
  }

  const {
    data: { user }
  } = await client.auth.getUser();

  return {
    client,
    message: undefined,
    userId: user?.id ?? null
  };
}

export async function getSearchPersistenceState(): Promise<SearchPersistenceState> {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      favoriteListingIds: [],
      isConfigured: false,
      isSignedIn: false,
      message,
      savedListingIds: []
    };
  }

  if (!userId) {
    return {
      favoriteListingIds: [],
      isConfigured: true,
      isSignedIn: false,
      savedListingIds: []
    };
  }

  const [savedResult, favoriteResult] = await Promise.all([
    client.from("saved_builds").select("listing_id").eq("user_id", userId),
    client.from("favorite_builds").select("listing_id").eq("user_id", userId)
  ]);

  return {
    favoriteListingIds:
      favoriteResult.data?.map((favorite) => favorite.listing_id) ?? [],
    isConfigured: true,
    isSignedIn: true,
    message: savedResult.error?.message ?? favoriteResult.error?.message,
    savedListingIds: savedResult.data?.map((saved) => saved.listing_id) ?? []
  };
}

export async function getSavedBuilds() {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return { data: [] as SavedBuildRow[], isConfigured: false, isSignedIn: false, message };
  }

  if (!userId) {
    return { data: [] as SavedBuildRow[], isConfigured: true, isSignedIn: false };
  }

  const { data, error } = await client
    .from("saved_builds")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  return {
    data: data ?? [],
    isConfigured: true,
    isSignedIn: true,
    message: error?.message
  };
}

export async function getFavoriteBuilds() {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: [] as FavoriteBuildRow[],
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return { data: [] as FavoriteBuildRow[], isConfigured: true, isSignedIn: false };
  }

  const { data, error } = await client
    .from("favorite_builds")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return {
    data: data ?? [],
    isConfigured: true,
    isSignedIn: true,
    message: error?.message
  };
}

export async function getBuildHistory() {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: [] as BuildHistoryRow[],
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return { data: [] as BuildHistoryRow[], isConfigured: true, isSignedIn: false };
  }

  const { data, error } = await client
    .from("build_history")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  return {
    data: data ?? [],
    isConfigured: true,
    isSignedIn: true,
    message: error?.message
  };
}

export async function getUserSettings() {
  const { client, message, userId } = await getUserAndClient();

  if (!isSupabaseConfigured || !client) {
    return {
      data: null as UserSettingsRow | null,
      isConfigured: false,
      isSignedIn: false,
      message
    };
  }

  if (!userId) {
    return { data: null as UserSettingsRow | null, isConfigured: true, isSignedIn: false };
  }

  const { data, error } = await client
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  return {
    data,
    isConfigured: true,
    isSignedIn: true,
    message: error?.message
  };
}

export function getMockListingById(listingId: string) {
  return mockHardwareListings.find((listing) => listing.id === listingId) ?? null;
}
