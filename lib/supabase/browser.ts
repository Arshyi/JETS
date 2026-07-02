"use client";

import { createBrowserClient } from "@supabase/ssr";

import { isSupabaseConfigured, supabaseEnv } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

export function createSupabaseBrowserClient() {
  if (!isSupabaseConfigured || !supabaseEnv.url || !supabaseEnv.anonKey) {
    return null;
  }

  return createBrowserClient<Database>(supabaseEnv.url, supabaseEnv.anonKey);
}
