import { createClient } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabaseEnv } from "@/lib/supabase/config";
import type { Database } from "@/types/database";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseServiceRoleConfigured = Boolean(
  isSupabaseConfigured && supabaseEnv.url && serviceRoleKey
);

export function createSupabaseServiceRoleClient() {
  if (!isSupabaseServiceRoleConfigured || !supabaseEnv.url || !serviceRoleKey) {
    return null;
  }

  return createClient<Database>(supabaseEnv.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
