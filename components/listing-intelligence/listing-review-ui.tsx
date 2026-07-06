import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  GitCompare,
  History,
  Lightbulb,
  PencilLine,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/states/empty-state";
import { StatusPill } from "@/components/ui/status-pill";
import {
  submitManualListingAction,
  reviewListingFieldAction,
  reviewListingStatusAction
} from "@/lib/supabase/listing-intelligence-actions";
import { formatEvidenceLabel } from "@/lib/evidence-engine";
import { getListingReadinessLabel } from "@/lib/listing-intelligence/engine";
import {
  listingModerationStatuses,
  listingReviewActions
} from "@/types/listing-intelligence";
import type {
  ListingFutureHook,
  ListingIntelligenceRecord,
  ListingIntelligenceRecordState,
  ListingIntelligenceState,
  ListingParsedField
} from "@/types/listing-intelligence";

function toneForStatus(status: string): "accent" | "neutral" | "warning" {
  if (["ready", "verified", "accepted", "corrected"].includes(status)) {
    return "accent";
  }

  if (["not-ready", "disputed", "rejected", "archived"].includes(status)) {
    return "warning";
  }

  return "neutral";
}

function formatDate(value: string | null) {
  if (!value) return "Not reviewed";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium"
  }).format(new Date(value));
}

function formatPrice(listing: ListingIntelligenceRecord) {
  if (listing.priceAmount === null) {
    return "Price unknown";
  }

  return new Intl.NumberFormat("en-US", {
    currency: listing.normalized.price.currency,
    maximumFractionDigits: 0,
    style: "currency"
  }).format(listing.priceAmount);
}

function SummaryCard({
  label,
  value
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-lg border border-border bg-panel p-4">
      <p className="text-xs font-semibold uppercase text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}

function ListingCard({ listing }: { listing: ListingIntelligenceRecord }) {
  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill>{listing.normalized.marketplace.sourceName}</StatusPill>
            <StatusPill tone={toneForStatus(listing.status)}>
              {formatEvidenceLabel(listing.status)}
            </StatusPill>
            <StatusPill tone={toneForStatus(listing.recommendationPreview.recommendationReadiness)}>
              {getListingReadinessLabel(
                listing.recommendationPreview.recommendationReadiness
              )}
            </StatusPill>
            <StatusPill>{listing.isPersisted ? "persisted" : "demo"}</StatusPill>
          </div>
          <h2 className="mt-3 text-xl font-semibold">{listing.normalized.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            {listing.normalized.description}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase text-muted">Preview score</p>
          <p className="mt-1 text-2xl font-bold">
            {listing.recommendationPreview.previewScore}
          </p>
          <p className="mt-1 text-sm text-muted">{formatPrice(listing)}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <StatusPill>{listing.health.score}% health</StatusPill>
        <StatusPill>{listing.parsingConfidence} parsing</StatusPill>
        <StatusPill>
          {listing.normalizedPlatformId ?? "unknown platform"}
        </StatusPill>
      </div>
      <Link
        href={`/listing-intelligence/${encodeURIComponent(listing.id)}`}
        className="mt-5 inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold transition hover:bg-subtle"
      >
        Open listing review
      </Link>
    </article>
  );
}

export function ListingReviewStatusPanel({
  state
}: {
  state: ListingIntelligenceState;
}) {
  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-wrap gap-2">
        <StatusPill tone={state.isConfigured ? "accent" : "warning"}>
          {state.isConfigured ? "Supabase configured" : "demo fallback"}
        </StatusPill>
        <StatusPill tone={state.isSignedIn ? "accent" : "neutral"}>
          {state.isSignedIn ? "signed in" : "public view"}
        </StatusPill>
        <StatusPill tone={state.canModerate ? "accent" : "neutral"}>
          {state.canModerate ? "review enabled" : "read-only review"}
        </StatusPill>
      </div>
      {state.message ? (
        <p className="mt-3 text-sm leading-6 text-muted">{state.message}</p>
      ) : null}
      {state.isConfigured && !state.isServiceRoleConfigured ? (
        <p className="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-4 py-3 text-sm leading-6 text-muted">
          Field moderation needs `SUPABASE_SERVICE_ROLE_KEY` plus an email in
          `JETS_ADMIN_EMAILS`.
        </p>
      ) : null}
    </article>
  );
}

export function ManualListingForm() {
  return (
    <form
      action={submitManualListingAction}
      className="rounded-lg border border-border bg-panel p-5"
    >
      <input type="hidden" name="returnTo" value="/listing-intelligence" />
      <div>
        <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
          Manual input
        </p>
        <h2 className="mt-2 text-xl font-bold">Submit a listing snapshot</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Manual snapshots run through the deterministic parser and enter human
          review. Unknown fields stay unknown.
        </p>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Marketplace
          <select
            name="marketplace"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            defaultValue="manual-entry"
          >
            <option value="manual-entry">Manual Entry</option>
            <option value="dubizzle">Dubizzle demo</option>
            <option value="local-computer-store">Local store demo</option>
            <option value="csv-import">CSV import demo</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Marketplace listing ID
          <input
            name="marketplaceListingId"
            maxLength={120}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            placeholder="manual-p520-001"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold md:col-span-2">
          Raw title
          <input
            name="rawTitle"
            required
            maxLength={240}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            placeholder="Lenovo ThinkStation P520 W-2135 64GB RTX 3060"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold md:col-span-2">
          Raw description
          <textarea
            name="rawDescription"
            required
            maxLength={1800}
            rows={4}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            placeholder="Paste only listing text that the seller actually provided."
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Price
          <input
            name="price"
            inputMode="numeric"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            placeholder="1450"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Currency
          <select
            name="currency"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            defaultValue="AED"
          >
            <option value="AED">AED</option>
            <option value="USD">USD</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Location
          <input
            name="location"
            maxLength={160}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            placeholder="Dubai, UAE"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Seller
          <input
            name="seller"
            maxLength={160}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            placeholder="Business surplus seller"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Category label
          <input
            name="categoryLabel"
            maxLength={120}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            placeholder="Workstation desktop"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Image count
          <input
            name="imageCount"
            inputMode="numeric"
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
            placeholder="6"
          />
        </label>
      </div>
      <button
        type="submit"
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
      >
        Normalize listing
      </button>
    </form>
  );
}

export function ListingIntelligenceDashboard({
  state
}: {
  state: ListingIntelligenceState;
}) {
  const readyCount = state.listings.filter(
    (listing) => listing.recommendationPreview.recommendationReadiness === "ready"
  ).length;
  const duplicateCount = state.duplicateCandidates.filter(
    (candidate) => candidate.status !== "distinct"
  ).length;

  return (
    <div className="grid gap-6">
      <ListingReviewStatusPanel state={state} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Listings" value={state.listings.length} />
        <SummaryCard label="Pending fields" value={state.pendingFields.length} />
        <SummaryCard label="Ready" value={readyCount} />
        <SummaryCard label="Duplicate signals" value={duplicateCount} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/listing-intelligence/review"
          className="rounded-lg border border-border bg-panel p-4 font-semibold transition hover:bg-subtle"
        >
          Parsed field queue
        </Link>
        <Link
          href="/listing-intelligence/duplicates"
          className="rounded-lg border border-border bg-panel p-4 font-semibold transition hover:bg-subtle"
        >
          Duplicate review
        </Link>
        <Link
          href="/evidence"
          className="rounded-lg border border-border bg-panel p-4 font-semibold transition hover:bg-subtle"
        >
          Evidence review
        </Link>
        <Link
          href="/sources"
          className="rounded-lg border border-border bg-panel p-4 font-semibold transition hover:bg-subtle"
        >
          Source health
        </Link>
      </div>
      {state.isSignedIn ? <ManualListingForm /> : null}
      <section className="grid gap-4">
        <h2 className="text-xl font-bold">Listing review workspace</h2>
        {state.listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </section>
    </div>
  );
}

function FieldReviewForm({
  field,
  listing
}: {
  field: ListingParsedField;
  listing: ListingIntelligenceRecord;
}) {
  return (
    <form action={reviewListingFieldAction} className="grid gap-3">
      <input type="hidden" name="fieldId" value={field.id} />
      <input type="hidden" name="listingKey" value={listing.id} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listing-intelligence/${listing.id}`}
      />
      <label className="grid gap-2 text-sm font-semibold">
        Review action
        <select
          name="reviewAction"
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
          defaultValue="accept"
        >
          {listingReviewActions.map((action) => (
            <option key={action} value={action}>
              {formatEvidenceLabel(action)}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Corrected value
        <input
          name="correctedValue"
          maxLength={240}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
          placeholder="Only needed for correction"
        />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Reason
        <textarea
          name="reason"
          rows={3}
          maxLength={1200}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
          placeholder="Explain the review decision."
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
      >
        Save field review
      </button>
    </form>
  );
}

function ListingStatusForm({ listing }: { listing: ListingIntelligenceRecord }) {
  return (
    <form action={reviewListingStatusAction} className="grid gap-3">
      <input type="hidden" name="listingKey" value={listing.id} />
      <input
        type="hidden"
        name="returnTo"
        value={`/listing-intelligence/${listing.id}`}
      />
      <label className="grid gap-2 text-sm font-semibold">
        Listing status
        <select
          name="verificationStatus"
          defaultValue={listing.status}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
        >
          {listingModerationStatuses.map((status) => (
            <option key={status} value={status}>
              {formatEvidenceLabel(status)}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Reason
        <textarea
          name="reason"
          rows={3}
          maxLength={1200}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal"
          placeholder="Explain why this listing status changed."
        />
      </label>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
      >
        Save listing status
      </button>
    </form>
  );
}

function FieldTable({
  canModerate,
  listing
}: {
  canModerate: boolean;
  listing: ListingIntelligenceRecord;
}) {
  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-2">
        <PencilLine className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-xl font-bold">Parsed Field Review</h2>
      </div>
      <div className="mt-4 grid gap-4">
        {listing.fields.map((field) => (
          <article
            key={field.id}
            className="grid gap-4 rounded-lg border border-border bg-background p-4 lg:grid-cols-[1fr_320px]"
          >
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusPill>{field.source}</StatusPill>
                <StatusPill>{field.confidence} confidence</StatusPill>
                <StatusPill tone={toneForStatus(field.reviewStatus)}>
                  {formatEvidenceLabel(field.reviewStatus)}
                </StatusPill>
              </div>
              <h3 className="mt-3 text-base font-semibold">{field.label}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Parsed: {field.parsedValue ?? "Unknown"}
              </p>
              <p className="mt-1 text-sm leading-6 text-muted">
                Current: {field.value ?? "Unknown"}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {field.evidenceRecordIds.map((id) => (
                  <Link key={id} href={`/evidence/${id}`}>
                    <StatusPill>{id}</StatusPill>
                  </Link>
                ))}
              </div>
            </div>
            {canModerate && listing.isPersisted ? (
              <FieldReviewForm field={field} listing={listing} />
            ) : (
              <p className="text-sm leading-6 text-muted">
                Persisted moderator review is available after Supabase, service
                role, and admin allowlist setup. Demo fields remain read-only.
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function RawListingSection({ listing }: { listing: ListingIntelligenceRecord }) {
  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-2">
        <FileSearch className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-xl font-bold">Raw Listing</h2>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_280px]">
        <div>
          <h3 className="text-lg font-semibold">{listing.raw.title}</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            {listing.raw.description}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm font-semibold">{formatPrice(listing)}</p>
          <p className="mt-2 text-sm text-muted">{listing.raw.locationText}</p>
          <p className="mt-2 text-sm text-muted">{listing.raw.sellerDisplayName}</p>
          <p className="mt-2 text-sm text-muted">
            {listing.raw.imageCount} image references
          </p>
        </div>
      </div>
    </section>
  );
}

function RecommendationPreviewSection({
  listing
}: {
  listing: ListingIntelligenceRecord;
}) {
  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-xl font-bold">Recommendation Preview</h2>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Potential score"
          value={listing.recommendationPreview.previewScore}
        />
        <SummaryCard
          label="Platform potential"
          value={listing.recommendationPreview.platformPotential}
        />
        <SummaryCard
          label="Listing health"
          value={`${listing.health.score}%`}
        />
      </div>
      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-background p-4">
          <h3 className="text-sm font-semibold">Solution Intelligence</h3>
          <div className="mt-3 grid gap-3">
            {listing.recommendationPreview.solutionIntelligenceClaims.map((claim) => (
              <p key={claim.title} className="text-sm leading-6 text-muted">
                <span className="font-semibold text-foreground">{claim.title}: </span>
                {claim.reason}
              </p>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <h3 className="text-sm font-semibold">Upgrade opportunities</h3>
          <div className="mt-3 grid gap-2">
            {listing.recommendationPreview.upgradeOpportunities.length > 0 ? (
              listing.recommendationPreview.upgradeOpportunities.map((opportunity) => (
                <StatusPill key={opportunity.title}>
                  {opportunity.title} - ${opportunity.estimatedCostUsd}
                </StatusPill>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted">
                Platform-specific opportunities need a known platform.
              </p>
            )}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <h3 className="text-sm font-semibold">Adapters and future paths</h3>
          <div className="mt-3 grid gap-2">
            {listing.recommendationPreview.adapterRecommendations.length > 0 ? (
              listing.recommendationPreview.adapterRecommendations.map((adapter) => (
                <StatusPill key={adapter.title}>
                  {adapter.title} - {adapter.difficulty}
                </StatusPill>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted">
                Adapter recommendations need a connected platform profile.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function FutureReadySection({
  hooks,
  listing
}: {
  hooks: ListingFutureHook[];
  listing: ListingIntelligenceRecord;
}) {
  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-xl font-bold">Future Ready</h2>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">
        This listing entered through {formatEvidenceLabel(listing.sourceKind)}.
        Future producers should still write raw listings into this same review
        pipeline.
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {hooks.map((hook) => (
          <article
            key={hook.kind}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="flex flex-wrap gap-2">
              <StatusPill>{formatEvidenceLabel(hook.kind)}</StatusPill>
              <StatusPill>{formatEvidenceLabel(hook.status)}</StatusPill>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted">{hook.note}</p>
            <p className="mt-2 text-xs leading-5 text-muted">{hook.boundary}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ListingReviewQueue({
  state
}: {
  state: ListingIntelligenceState;
}) {
  if (state.pendingFields.length === 0) {
    return (
      <EmptyState
        icon={CheckCircle2}
        title="No parsed fields waiting for review"
        description="New manual listings and future importer output will appear here as reviewable fields."
      />
    );
  }

  return (
    <div className="grid gap-5">
      <ListingReviewStatusPanel state={state} />
      {state.listings
        .filter((listing) =>
          listing.fields.some((field) => field.reviewStatus === "pending-review")
        )
        .map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
    </div>
  );
}

export function ListingDuplicateReview({
  state
}: {
  state: ListingIntelligenceState;
}) {
  const duplicateListings = state.listings.filter(
    (listing) => listing.duplicateCandidates.length > 0
  );

  if (duplicateListings.length === 0) {
    return (
      <EmptyState
        icon={GitCompare}
        title="No duplicate candidates"
        description="Deterministic duplicate signals will appear here when listings share seller, platform, description, hardware, or source identifiers."
      />
    );
  }

  return (
    <div className="grid gap-5">
      {duplicateListings.map((listing) => (
        <article
          key={listing.id}
          className="rounded-lg border border-border bg-panel p-5"
        >
          <div className="flex flex-wrap gap-2">
            <StatusPill>{listing.normalized.title}</StatusPill>
            <StatusPill>{listing.duplicateCandidates.length} candidates</StatusPill>
          </div>
          <div className="mt-4 grid gap-3">
            {listing.duplicateCandidates.map((candidate) => (
              <div
                key={`${listing.id}-${candidate.candidateListingId}`}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone={toneForStatus(candidate.status)}>
                    {formatEvidenceLabel(candidate.status)}
                  </StatusPill>
                  <StatusPill>{candidate.confidence} confidence</StatusPill>
                </div>
                <h3 className="mt-3 font-semibold">{candidate.candidateTitle}</h3>
                <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
                  {candidate.signals.map((signal) => (
                    <li key={signal.label}>
                      {signal.label}: {signal.reason}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export function ListingDetail({
  state
}: {
  state: ListingIntelligenceRecordState;
}) {
  if (!state.listing) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Listing not found"
        description="This listing is not visible to the current session or does not exist."
      />
    );
  }

  const listing = state.listing;

  return (
    <div className="grid gap-6">
      <ListingReviewStatusPanel state={state} />
      <article className="rounded-lg border border-border bg-panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={toneForStatus(listing.status)}>
                {formatEvidenceLabel(listing.status)}
              </StatusPill>
              <StatusPill>{listing.parsingConfidence} parsing confidence</StatusPill>
              <StatusPill>{listing.isPersisted ? "persisted" : "demo fallback"}</StatusPill>
            </div>
            <h2 className="mt-3 text-2xl font-bold">{listing.normalized.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              {listing.health.summary}
            </p>
          </div>
          {state.canModerate && listing.isPersisted ? (
            <div className="w-full rounded-lg border border-border bg-background p-4 lg:w-80">
              <ListingStatusForm listing={listing} />
            </div>
          ) : null}
        </div>
      </article>

      <RawListingSection listing={listing} />
      <FieldTable canModerate={state.canModerate} listing={listing} />

      <section className="rounded-lg border border-border bg-panel p-5">
        <h2 className="text-xl font-bold">Evidence and Corrections</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="text-sm font-semibold">Evidence links</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {listing.evidenceRecordIds.length > 0 ? (
                listing.evidenceRecordIds.map((id) => (
                  <Link key={id} href={`/evidence/${id}`}>
                    <StatusPill>{id}</StatusPill>
                  </Link>
                ))
              ) : (
                <p className="text-sm leading-6 text-muted">
                  Persisted evidence links will appear after field corrections or
                  review imports.
                </p>
              )}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-4">
            <h3 className="text-sm font-semibold">Corrections</h3>
            {listing.corrections.length === 0 ? (
              <p className="mt-3 text-sm leading-6 text-muted">
                No human corrections have been recorded for this listing yet.
              </p>
            ) : (
              <div className="mt-3 grid gap-3">
                {listing.corrections.map((correction) => (
                  <p key={correction.id} className="text-sm leading-6 text-muted">
                    {correction.fieldPath}: {correction.beforeValue ?? "unknown"} to{" "}
                    {correction.afterValue ?? "unknown"}. {correction.reason}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <RecommendationPreviewSection listing={listing} />

      <section className="rounded-lg border border-border bg-panel p-5">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
          <h2 className="text-xl font-bold">Review History</h2>
        </div>
        <div className="mt-4 grid gap-3">
          {listing.reviewEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-lg border border-border bg-background p-4"
            >
              <div className="flex flex-wrap gap-2">
                <StatusPill>{formatEvidenceLabel(event.action)}</StatusPill>
                <StatusPill>{formatDate(event.createdAt)}</StatusPill>
              </div>
              <p className="mt-3 text-sm leading-6 text-muted">{event.summary}</p>
              {event.reason ? (
                <p className="mt-2 text-sm leading-6 text-muted">
                  Reason: {event.reason}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <FutureReadySection hooks={state.futureHooks} listing={listing} />
    </div>
  );
}
