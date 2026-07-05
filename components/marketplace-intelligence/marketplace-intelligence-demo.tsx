import { BrainCircuit, Database, FileSearch, ShieldCheck } from "lucide-react";

import { EvidencePanel } from "@/components/evidence/evidence-panel";
import { StatusPill } from "@/components/ui/status-pill";
import { getEvidenceSummaryForSubject } from "@/lib/evidence-engine";
import { getPlatformKnowledgeById } from "@/lib/platform-knowledge";
import type { EvidenceConfidence } from "@/types/evidence";
import type {
  MarketplaceImportPipelineResult,
  MarketplaceNormalizedListing
} from "@/types/marketplace-intelligence";

type MarketplaceIntelligenceDemoProps = {
  report: MarketplaceImportPipelineResult;
};

function formatPrice(listing: MarketplaceNormalizedListing) {
  const amount = listing.price.amount.value;

  if (amount === null) {
    return "Price unknown";
  }

  return new Intl.NumberFormat("en-US", {
    currency: listing.price.currency,
    maximumFractionDigits: 0,
    style: "currency"
  }).format(amount);
}

function FieldSummary({
  confidence,
  label,
  source,
  value
}: {
  confidence: EvidenceConfidence;
  label: string;
  source: string;
  value: string | null;
}) {
  return (
    <div className="rounded-lg border border-border bg-panel px-3 py-2">
      <p className="text-xs font-semibold uppercase text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value ?? "Unknown"}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <StatusPill>{source}</StatusPill>
        <StatusPill>{confidence} confidence</StatusPill>
      </div>
    </div>
  );
}

export function MarketplaceIntelligenceDemo({
  report
}: MarketplaceIntelligenceDemoProps) {
  const parserEvidence = getEvidenceSummaryForSubject(
    "marketplace-platform-detection"
  );

  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
            Phase 3 architecture
          </p>
          <h2 className="mt-3 text-2xl font-bold">Marketplace Intelligence</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            Mock source adapters feed raw marketplace text into deterministic
            normalization, platform detection, Platform Knowledge, and Solution
            Intelligence hooks. No live scraping or marketplace APIs run here.
          </p>
        </div>
        <div className="grid gap-2 rounded-lg border border-border bg-background p-4 text-sm">
          <StatusPill tone="accent">{report.totals.listingsNormalized} normalized</StatusPill>
          <StatusPill>{report.totals.platformMatches} platform matches</StatusPill>
          <StatusPill>{report.totals.sourcesRepresented} demo sources</StatusPill>
        </div>
      </div>

      <div className="mt-6">
        <EvidencePanel
          compact
          summary={parserEvidence}
          title="How do we know parsed marketplace fields?"
        />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {report.sourceAdapters.slice(0, 8).map((adapter) => (
          <article
            key={adapter.id}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="flex flex-wrap gap-2">
              <StatusPill tone={adapter.stage === "demo" ? "accent" : "neutral"}>
                {adapter.stage}
              </StatusPill>
              <StatusPill>{adapter.accessMode.replaceAll("-", " ")}</StatusPill>
            </div>
            <h3 className="mt-3 text-base font-semibold">{adapter.name}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              {adapter.complianceNotes[0]}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-5">
        {report.listings.slice(0, 5).map((listing) => {
          const profile = getPlatformKnowledgeById(
            listing.hardware.platformDetection.detectedPlatformId
          );
          const topOpportunity = listing.opportunities[0];
          const topFuture = listing.possibleFutures[0];

          return (
            <article
              key={listing.id}
              className="rounded-lg border border-border bg-background p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill>{listing.marketplace.sourceName}</StatusPill>
                    <StatusPill>{listing.confidence.confidence} confidence</StatusPill>
                    <StatusPill>{listing.health.completeness}% complete</StatusPill>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold">{listing.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {listing.description}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-panel px-4 py-3 text-right">
                  <p className="text-xs font-semibold uppercase text-muted">Parsed price</p>
                  <p className="mt-1 text-xl font-bold">{formatPrice(listing)}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 xl:grid-cols-[0.8fr_1fr_1fr_1fr]">
                <div className="rounded-lg border border-border bg-panel p-4">
                  <div className="flex items-center gap-2">
                    <FileSearch className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
                    <h4 className="text-sm font-semibold">Raw Listing</h4>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {listing.raw.title}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    {listing.raw.imageCount} photos, {listing.raw.locationText}
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-panel p-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
                    <h4 className="text-sm font-semibold">Normalized Hardware</h4>
                  </div>
                  <div className="mt-3 grid gap-2">
                    <FieldSummary
                      confidence={listing.hardware.detectedComponents.cpu.confidence}
                      label="CPU"
                      source={listing.hardware.detectedComponents.cpu.source}
                      value={listing.hardware.detectedComponents.cpu.value}
                    />
                    <FieldSummary
                      confidence={listing.hardware.detectedComponents.gpu.confidence}
                      label="GPU"
                      source={listing.hardware.detectedComponents.gpu.source}
                      value={listing.hardware.detectedComponents.gpu.value}
                    />
                    <FieldSummary
                      confidence={listing.hardware.detectedComponents.memory.confidence}
                      label="RAM"
                      source={listing.hardware.detectedComponents.memory.source}
                      value={listing.hardware.detectedComponents.memory.value}
                    />
                    <FieldSummary
                      confidence={listing.hardware.detectedComponents.storage.confidence}
                      label="Storage"
                      source={listing.hardware.detectedComponents.storage.source}
                      value={listing.hardware.detectedComponents.storage.value}
                    />
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-panel p-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
                    <h4 className="text-sm font-semibold">Detected Platform</h4>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill
                      tone={
                        listing.hardware.platformDetection.confidence === "high"
                          ? "accent"
                          : "neutral"
                      }
                    >
                      {listing.hardware.platformDetection.confidence}
                    </StatusPill>
                    <StatusPill>
                      {listing.health.communityKnowledgeAvailability} knowledge
                    </StatusPill>
                  </div>
                  <p className="mt-3 text-sm font-semibold">
                    {listing.hardware.platformDetection.detectedPlatformName ??
                      "Unknown platform"}
                  </p>
                  <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted">
                    {listing.hardware.platformDetection.evidence.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border border-border bg-panel p-4">
                  <div className="flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
                    <h4 className="text-sm font-semibold">Knowledge and Recommendation</h4>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted">
                    {profile
                      ? `Platform Potential ${profile.potential.overall}. ${profile.summary}`
                      : "No platform profile is connected yet."}
                  </p>
                  <div className="mt-3 grid gap-2">
                    <StatusPill tone="accent">
                      {topOpportunity?.title ?? "Opportunity pending"}
                    </StatusPill>
                    <StatusPill>
                      {topFuture?.title ?? "Future path pending"}
                    </StatusPill>
                  </div>
                </div>
              </div>

              {listing.health.missingInformation.length > 0 ? (
                <p className="mt-4 rounded-lg border border-border bg-panel px-4 py-3 text-sm leading-6 text-muted">
                  Missing: {listing.health.missingInformation.join(", ")}.
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
