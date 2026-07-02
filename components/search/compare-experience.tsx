"use client";

import { GitCompare } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ScoreMeter } from "@/components/search/score-meter";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { StatusPill } from "@/components/ui/status-pill";
import { mockHardwareListings } from "@/data/mock-listings";
import {
  formatCurrency,
  getListingsByIds,
  maxCompareListings,
  parseCompareIds
} from "@/lib/hardware-search";
import {
  conditionLabels,
  formFactorLabels,
  useCaseLabels
} from "@/types/hardware";
import type { HardwareListing } from "@/types/hardware";

function renderRiskNotes(listing: HardwareListing) {
  return (
    <ul className="grid gap-2">
      {listing.riskNotes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
}

export function CompareExperience() {
  const searchParams = useSearchParams();
  const ids = useMemo(() => parseCompareIds(searchParams.get("ids")), [searchParams]);
  const listings = useMemo(() => getListingsByIds(ids), [ids]);
  const knownIds = useMemo(
    () => new Set(mockHardwareListings.map((listing) => listing.id)),
    []
  );
  const missingIds = ids.filter((id) => !knownIds.has(id));

  if (ids.length === 0) {
    return (
      <main className="bg-background">
        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <EmptyState
            title="No listings selected"
            description="Select up to three mock listings from search to build a comparison."
            icon={GitCompare}
            action={
              <Link
                href="/search"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Go to search
              </Link>
            }
          />
        </section>
      </main>
    );
  }

  if (listings.length === 0) {
    return (
      <main className="bg-background">
        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <ErrorState
            title="Comparison IDs were not found"
            description="The compare URL only supports mock listing IDs from the local v0.2 dataset."
            action={
              <Link
                href="/search"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Return to search
              </Link>
            }
          />
        </section>
      </main>
    );
  }

  return (
    <main className="bg-background">
      <section className="border-b border-border bg-panel">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
                Version 0.2
              </p>
              <h1 className="mt-3 text-4xl font-bold">Compare Listings</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
                Side-by-side mock listing comparison from URL query params.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="accent">{listings.length} selected</StatusPill>
              <StatusPill>Limit {maxCompareListings}</StatusPill>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {missingIds.length > 0 ? (
          <div className="mb-5 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-muted">
            Some IDs in the URL do not exist in the mock dataset:{" "}
            <span className="font-semibold text-foreground">{missingIds.join(", ")}</span>
          </div>
        ) : null}

        <div className="mb-6 flex justify-end">
          <Link
            href="/search"
            className="rounded-lg border border-border bg-panel px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            Back to search
          </Link>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-panel">
          <table className="min-w-[860px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-subtle">
                <th className="w-44 px-4 py-3 font-semibold">Signal</th>
                {listings.map((listing) => (
                  <th key={listing.id} className="px-4 py-3 align-top font-semibold">
                    <span className="block max-w-64">{listing.title}</span>
                    <span className="mt-2 inline-flex text-xs font-normal text-muted">
                      {listing.location}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <tr>
                <th className="px-4 py-4 font-medium text-muted">Price</th>
                {listings.map((listing) => (
                  <td key={listing.id} className="px-4 py-4 font-semibold">
                    {formatCurrency(listing.price)}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="px-4 py-4 font-medium text-muted">Negotiated target</th>
                {listings.map((listing) => (
                  <td key={listing.id} className="px-4 py-4 font-semibold">
                    {formatCurrency(listing.predictedNegotiatedPrice)}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="px-4 py-4 font-medium text-muted">Recommended use</th>
                {listings.map((listing) => (
                  <td key={listing.id} className="px-4 py-4">
                    {useCaseLabels[listing.recommendedUseCase]}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="px-4 py-4 font-medium text-muted">Form factor</th>
                {listings.map((listing) => (
                  <td key={listing.id} className="px-4 py-4">
                    {formFactorLabels[listing.formFactor]}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="px-4 py-4 font-medium text-muted">Condition</th>
                {listings.map((listing) => (
                  <td key={listing.id} className="px-4 py-4">
                    {conditionLabels[listing.condition]}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="px-4 py-4 font-medium text-muted">Weight class</th>
                {listings.map((listing) => (
                  <td key={listing.id} className="px-4 py-4">
                    {listing.weightClass}
                  </td>
                ))}
              </tr>
              {[
                ["Performance", "performance"],
                ["Value", "value"],
                ["Reliability", "reliability"],
                ["Aesthetic", "aesthetic"],
                ["Upgrade potential", "upgradePotential"],
                ["Sleeper fit", "sleeper"]
              ].map(([label, scoreKey]) => (
                <tr key={scoreKey}>
                  <th className="px-4 py-4 font-medium text-muted">{label}</th>
                  {listings.map((listing) => (
                    <td key={listing.id} className="px-4 py-4">
                      <ScoreMeter
                        label={label}
                        value={listing.scores[scoreKey as keyof typeof listing.scores]}
                        tone={scoreKey === "sleeper" ? "warning" : "accent"}
                      />
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th className="px-4 py-4 font-medium text-muted">Risk notes</th>
                {listings.map((listing) => (
                  <td key={listing.id} className="px-4 py-4 align-top text-muted">
                    {renderRiskNotes(listing)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
