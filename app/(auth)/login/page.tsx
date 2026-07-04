import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ActionState } from "@/types/persistence";

type LoginPageProps = {
  searchParams: Promise<{
    authMessage?: string;
    authStatus?: string;
    next?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to JETS to use Supabase-backed persistence."
};

const authCallbackMessages = {
  "auth-not-configured": {
    message: "Supabase is not configured for this deployment yet.",
    status: "error"
  },
  "confirmation-invalid": {
    message:
      "That confirmation link is invalid or expired. Try signing up again or request a fresh link.",
    status: "error"
  },
  "confirmation-missing": {
    message:
      "That confirmation link is missing its verification code. Open the latest email from Supabase and try again.",
    status: "error"
  },
  "email-confirmed": {
    message: "Email confirmed. Please log in to continue.",
    status: "success"
  }
} satisfies Record<string, Pick<ActionState, "message" | "status">>;

type AuthCallbackMessage = keyof typeof authCallbackMessages;

function isAuthCallbackMessage(value: string | undefined): value is AuthCallbackMessage {
  return Boolean(value && value in authCallbackMessages);
}

function getAuthCallbackState(
  status: string | undefined,
  message: string | undefined
): ActionState | undefined {
  if (status !== "success" && status !== "error") {
    return undefined;
  }

  const mappedMessage = isAuthCallbackMessage(message)
    ? authCallbackMessages[message]
    : undefined;

  if (!mappedMessage || mappedMessage.status !== status) {
    return undefined;
  }

  return mappedMessage;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const authCallbackState = getAuthCallbackState(
    params.authStatus,
    params.authMessage
  );

  return (
    <main className="bg-background">
      <section className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
        {isSupabaseConfigured ? (
          <AuthForm
            initialState={authCallbackState}
            mode="login"
            next={params.next ?? "/account"}
          />
        ) : (
          <SupabaseSetupState />
        )}
      </section>
    </main>
  );
}
