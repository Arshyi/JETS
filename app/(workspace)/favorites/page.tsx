import type { Metadata } from "next";
import Link from "next/link";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { SupabaseSetupState } from "@/components/auth/supabase-setup-state";
import { ContentPage } from "@/components/pages/content-page";
import { BuildCard } from "@/components/persistence/build-card";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { getFavoriteBuilds } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Review favorite JETS mock hardware listings."
};

export default async function FavoritesPage() {
  const state = await getFavoriteBuilds();

  return (
    <ContentPage
      eyebrow="Version 0.3"
      title="Favorites"
      description="Persisted favorite mock listings for quick return visits."
    >
      {!state.isConfigured ? (
        <SupabaseSetupState />
      ) : !state.isSignedIn ? (
        <SignedOutState next="/favorites" />
      ) : state.message ? (
        <ErrorState title="Could not load favorites" description={state.message} />
      ) : state.data.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Use the Favorite button on search results to persist mock listings here."
          action={
            <Link
              href="/search"
              className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Open search
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4">
          {state.data.map((row) => (
            <BuildCard key={row.id} row={row} type="favorite" />
          ))}
        </div>
      )}
    </ContentPage>
  );
}
