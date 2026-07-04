import { Heart, Trash2 } from "lucide-react";
import Link from "next/link";

import { StatusPill } from "@/components/ui/status-pill";
import { formatCurrency } from "@/lib/hardware-search";
import {
  removeFavoriteBuildAction,
  removeSavedBuildAction,
  updateSavedBuildNotesAction
} from "@/lib/supabase/persistence-actions";
import type { FavoriteBuildRow, Json, SavedBuildRow } from "@/types/database";

type BuildCardProps = {
  row: FavoriteBuildRow | SavedBuildRow;
  type: "favorite" | "saved";
};

function getSnapshotValue(snapshot: Json, key: string) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) {
    return null;
  }

  return snapshot[key];
}

function getPrice(snapshot: Json) {
  const value = getSnapshotValue(snapshot, "price");

  return typeof value === "number" ? formatCurrency(value) : "Price unavailable";
}

function getSummary(snapshot: Json) {
  const value = getSnapshotValue(snapshot, "summary");

  return typeof value === "string" ? value : "Saved mock listing snapshot.";
}

export function BuildCard({ row, type }: BuildCardProps) {
  const removeAction =
    type === "saved" ? removeSavedBuildAction : removeFavoriteBuildAction;
  const savedNotes = type === "saved" && "notes" in row ? row.notes ?? "" : "";

  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={type === "favorite" ? "warning" : "accent"}>
              {type === "favorite" ? "Favorite" : "Saved"}
            </StatusPill>
            <StatusPill>{getPrice(row.snapshot)}</StatusPill>
          </div>
          <h2 className="mt-4 text-xl font-semibold">{row.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {getSummary(row.snapshot)}
          </p>
        </div>

        <form action={removeAction}>
          <input type="hidden" name="listingId" value={row.listing_id} />
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            {type === "favorite" ? (
              <Heart className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            )}
            Remove
          </button>
        </form>
      </div>

      {type === "saved" ? (
        <form
          action={updateSavedBuildNotesAction}
          className="mt-5 rounded-lg border border-border bg-background p-4"
        >
          <input type="hidden" name="savedBuildId" value={row.id} />
          <input type="hidden" name="returnTo" value="/saved-builds" />
          <label className="text-sm font-semibold" htmlFor={`notes-${row.id}`}>
            Decision notes
          </label>
          <textarea
            id={`notes-${row.id}`}
            name="notes"
            defaultValue={savedNotes}
            rows={3}
            className="mt-3 w-full rounded-lg border border-border bg-panel px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
            placeholder="Why this build is worth saving, what changed, or what would make it a purchase."
          />
          <div className="mt-3 flex justify-end">
            <button
              type="submit"
              className="rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Save notes
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={`/compare?ids=${encodeURIComponent(row.listing_id)}`}
          className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        >
          Compare
        </Link>
        <Link
          href="/inventory"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
        >
          Back to inventory
        </Link>
      </div>
    </article>
  );
}
