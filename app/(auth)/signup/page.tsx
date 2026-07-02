import { AuthForm } from "@/components/auth/auth-form";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function SignupPage() {
  return (
    <main className="bg-background">
      <section className="mx-auto grid min-h-[calc(100vh-8rem)] w-full max-w-xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
        {isSupabaseConfigured ? <AuthForm mode="signup" /> : <SupabaseSetupState />}
      </section>
    </main>
  );
}
