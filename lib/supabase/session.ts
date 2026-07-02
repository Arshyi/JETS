import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProfileRow } from "@/types/database";

export type AuthContext = {
  isConfigured: boolean;
  message?: string;
  profile: ProfileRow | null;
  user: {
    email?: string;
    id: string;
  } | null;
};

export async function getAuthContext(): Promise<AuthContext> {
  if (!isSupabaseConfigured) {
    return {
      isConfigured: false,
      message: supabaseSetupMessage,
      profile: null,
      user: null
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      isConfigured: false,
      message: supabaseSetupMessage,
      profile: null,
      user: null
    };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      isConfigured: true,
      profile: null,
      user: null
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    isConfigured: true,
    profile,
    user: {
      email: user.email,
      id: user.id
    }
  };
}
