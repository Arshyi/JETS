import { Check, Cpu, Heart, MapPin, Save, ShieldAlert } from "lucide-react";

import { CompatibilityBadges } from "@/components/compatibility/compatibility-badges";
import { PlatformHealthIndicator } from "@/components/compatibility/platform-health-indicator";
import { ScoreBreakdown } from "@/components/decision/score-breakdown";
import { WhyThisRanks } from "@/components/decision/why-this-ranks";
import { ScoreMeter } from "@/components/search/score-meter";
import { StatusPill } from "@/components/ui/status-pill";
import { getCompatibilityReportForListingId } from "@/data/compatibility/profiles";
import { evaluateHardwareListing } from "@/lib/decision-engine/ranking";
import { formatCurrency } from "@/lib/hardware-search";
import {
  favoriteBuildAction,
  saveBuildAction
} from "@/lib/supabase/persistence-actions";
import { cn } from "@/lib/utils";
import {
  conditionLabels,
  formFactorLabels,
  useCaseLabels
} from "@/types/hardware";
import type { HardwareListing, HardwareUseCase } from "@/types/hardware";

type RankingCardProps = {
  isFavorited: boolean;
  isPersistenceReady: boolean;
  isSaved: boolean;
  isSelected: boolean;
  isSelectionDisabled: boolean;
  listing: HardwareListing;
  onToggleCompare: (id: string) => void;
  rankingUseCase?: HardwareUseCase;
  returnTo?: string;
};

export function RankingCard({
  isFavorited,
  isPersistenceReady,
  isSaved,
  isSelected,
  isSelectionDisabled,
  listing,
  onToggleCompare,
  rankingUseCase,
  returnTo = "/inventory"
}: RankingCardProps) {
  const checkboxId = `compare-${listing.id}`;
  const evaluation = evaluateHardwareListing(
    listing,
    rankingUseCase ?? listing.recommendedUseCase
  );
  const compatibilityReport = getCompatibilityReportForListingId(listing.id);

  return (
    <article
      className={cn(
        "rounded-lg border bg-panel p-5 transition",
        isSelected ? "border-accent shadow-soft" : "border-border"
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={listing.condition === "broken" ? "warning" : "neutral"}>
              {conditionLabels[listing.condition]}
            </StatusPill>
            <StatusPill>{formFactorLabels[listing.formFactor]}</StatusPill>
            <StatusPill tone="accent">
              {useCaseLabels[listing.recommendedUseCase]}
            </StatusPill>
            <StatusPill>{evaluation.preset.label} ranking</StatusPill>
            {compatibilityReport ? (
              <CompatibilityBadges report={compatibilityReport} />
            ) : null}
          </div>
          <h2 className="mt-4 text-xl font-semibold">{listing.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {listing.summary}
          </p>
        </div>

        <label
          htmlFor={checkboxId}
          className={cn(
            "flex min-w-32 cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm font-medium",
            isSelected
              ? "border-accent bg-accent/10 text-accent-strong dark:text-accent"
              : "border-border bg-background text-muted",
            isSelectionDisabled && !isSelected && "cursor-not-allowed opacity-60"
          )}
        >
          <span>{isSelected ? "Selected" : "Compare"}</span>
          <span className="grid h-5 w-5 place-items-center rounded border border-current">
            {isSelected ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
          </span>
          <input
            id={checkboxId}
            type="checkbox"
            checked={isSelected}
            disabled={isSelectionDisabled && !isSelected}
            onChange={() => onToggleCompare(listing.id)}
            className="sr-only"
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <form action={saveBuildAction}>
          <input type="hidden" name="listingId" value={listing.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button
            type="submit"
            disabled={!isPersistenceReady}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
            title={
              isPersistenceReady
                ? isSaved
                  ? "Saved in Supabase"
                  : "Save inventory item"
                : "Sign in and configure Supabase to save inventory items"
            }
          >
            <Save className="h-4 w-4" aria-hidden="true" />
            {isSaved ? "Saved" : "Save item"}
          </button>
        </form>

        <form action={favoriteBuildAction}>
          <input type="hidden" name="listingId" value={listing.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button
            type="submit"
            disabled={!isPersistenceReady}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60"
            title={
              isPersistenceReady
                ? isFavorited
                  ? "Favorited in Supabase"
                  : "Favorite inventory item"
                : "Sign in and configure Supabase to favorite inventory items"
            }
          >
            <Heart className="h-4 w-4" aria-hidden="true" />
            {isFavorited ? "Favorited" : "Favorite"}
          </button>
        </form>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[220px_1fr]">
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-semibold uppercase text-muted">Asking price</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(listing.price)}</p>
          <p className="mt-3 text-sm text-muted">
            Negotiated target:{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(listing.predictedNegotiatedPrice)}
            </span>
          </p>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            {listing.location}
          </div>
          <div className="mt-5">
            <ScoreMeter label="Sleeper fit" value={listing.scores.sleeper} tone="warning" />
          </div>
        </div>

        <ScoreBreakdown evaluation={evaluation} />
      </div>

      <div className="mt-5">
        <WhyThisRanks explanation={evaluation.explanation} />
      </div>

      {compatibilityReport ? (
        <div className="mt-5">
          <PlatformHealthIndicator report={compatibilityReport} />
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold">Key specs</h3>
          </div>
          <dl className="mt-4 grid gap-2 text-sm">
            {Object.entries(listing.specs).map(([key, value]) => (
              <div key={key} className="grid grid-cols-[92px_1fr] gap-3">
                <dt className="text-muted">{key}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-warning" aria-hidden="true" />
            <h3 className="text-sm font-semibold">Risk notes</h3>
          </div>
          <ul className="mt-4 grid gap-2 text-sm text-muted">
            {listing.riskNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Weight class:{" "}
            <span className="font-semibold text-foreground">{evaluation.weightClass}</span>
          </p>
        </div>
      </div>
    </article>
  );
}
