export const supabaseEnv = {
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  url: process.env.NEXT_PUBLIC_SUPABASE_URL
};

export const isSupabaseConfigured = Boolean(
  supabaseEnv.url && supabaseEnv.anonKey
);

export const supabaseSetupMessage =
  "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable accounts and persistence.";
