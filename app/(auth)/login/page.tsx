import type { Metadata } from "next";

import { AuthForm } from "@/components/auth/auth-form";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string;
  }>;
};

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to JETS to use Supabase-backed persistence."
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="bg-background">
      <section className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
        {isSupabaseConfigured ? (
          <AuthForm mode="login" next={params.next ?? "/account"} />
        ) : (
          <SupabaseSetupState />
        )}
      </section>
    </main>
  );
}
