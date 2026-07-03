export const supabaseEnv = {
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL
};

export const isSupabaseConfigured = Boolean(
  supabaseEnv.url && supabaseEnv.anonKey
);

export const supabaseSetupChecklistPath = "/beta/setup";

export const supabaseSetupMessage =
  "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then apply the SQL migrations listed in the beta setup checklist. Static mock workflows still work without Supabase.";
