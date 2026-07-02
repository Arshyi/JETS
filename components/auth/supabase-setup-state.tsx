import Link from "next/link";

import { ErrorState } from "@/components/states/error-state";
import { supabaseSetupMessage } from "@/lib/supabase/config";

export function SupabaseSetupState() {
  return (
    <ErrorState
      title="Supabase setup required"
      description={supabaseSetupMessage}
      action={
        <Link
          href="/account"
          className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        >
          View setup notes
        </Link>
      }
    />
  );
}
