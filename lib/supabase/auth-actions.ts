"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionState } from "@/types/persistence";

const authErrorState: ActionState = {
  message: supabaseSetupMessage,
  status: "error"
};

function getText(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

export async function signInAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isSupabaseConfigured) {
    return authErrorState;
  }

  const email = getText(formData, "email");
  const password = getText(formData, "password");
  const next = getText(formData, "next") || "/account";
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return authErrorState;
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return {
      message: error.message,
      status: "error"
    };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUpAction(
  _previousState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!isSupabaseConfigured) {
    return authErrorState;
  }

  const email = getText(formData, "email");
  const password = getText(formData, "password");
  const displayName = getText(formData, "displayName");
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return authErrorState;
  }

  const { error } = await supabase.auth.signUp({
    email,
    options: {
      data: {
        display_name: displayName || email.split("@")[0]
      }
    },
    password
  });

  if (error) {
    return {
      message: error.message,
      status: "error"
    };
  }

  return {
    message:
      "Account created. Check email confirmation settings in Supabase, then sign in.",
    status: "success"
  };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
