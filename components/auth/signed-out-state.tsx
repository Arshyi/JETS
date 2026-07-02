import { LogIn } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";

type SignedOutStateProps = {
  description?: string;
  next?: string;
  title?: string;
};

export function SignedOutState({
  description = "Sign in to use account-backed JETS persistence.",
  next = "/account",
  title = "Sign in required"
}: SignedOutStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={LogIn}
      action={
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <Link
            href={`/login?next=${encodeURIComponent(next)}`}
            className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-panel px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            Create account
          </Link>
        </div>
      }
    />
  );
}
