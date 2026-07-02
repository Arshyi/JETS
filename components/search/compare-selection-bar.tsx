"use client";

import { GitCompare, X } from "lucide-react";
import Link from "next/link";

import { maxCompareListings } from "@/lib/hardware-search";
import { getCompareHref } from "@/lib/hardware-search";
import type { HardwareListing } from "@/types/hardware";

type CompareSelectionBarProps = {
  selectedListings: HardwareListing[];
  onRemove: (id: string) => void;
  onClear: () => void;
};

export function CompareSelectionBar({
  selectedListings,
  onRemove,
  onClear
}: CompareSelectionBarProps) {
  if (selectedListings.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold">
            {selectedListings.length} of {maxCompareListings} selected
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {selectedListings.map((listing) => (
              <span
                key={listing.id}
                className="inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm"
              >
                <span className="max-w-48 truncate">{listing.title}</span>
                <button
                  type="button"
                  onClick={() => onRemove(listing.id)}
                  className="grid h-5 w-5 place-items-center rounded text-muted transition hover:bg-subtle hover:text-foreground"
                  aria-label={`Remove ${listing.title} from comparison`}
                  title="Remove"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClear}
            className="rounded-lg border border-border bg-panel px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            Clear
          </button>
          <Link
            href={getCompareHref(selectedListings.map((listing) => listing.id))}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            <GitCompare className="h-4 w-4" aria-hidden="true" />
            Compare
          </Link>
        </div>
      </div>
    </div>
  );
}
