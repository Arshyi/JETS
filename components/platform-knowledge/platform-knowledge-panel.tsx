import { AlertTriangle, Cpu, Gauge, Lightbulb, Wrench } from "lucide-react";

import { EvidencePanel } from "@/components/evidence/evidence-panel";
import { AdapterIntelligenceCard } from "@/components/platform-knowledge/adapter-intelligence-card";
import { UpgradeOpportunityCard } from "@/components/platform-knowledge/upgrade-opportunity-card";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getCommunityDiscoveriesForPlatform,
  getEvidenceConflictsForPlatform,
  getEvidenceSummaryForPlatform,
  getEvidenceSummaryForSubject,
  getKnowledgeQualityForPlatform,
  getKnowledgeTimelineForPlatform
} from "@/lib/evidence-engine";
import { getRecommendedAdaptersForPlatform } from "@/lib/platform-knowledge";
import type { PlatformKnowledgeProfile } from "@/types/platform-knowledge";

type PlatformKnowledgePanelProps = {
  profile: PlatformKnowledgeProfile | null;
};

function scoreRows(profile: PlatformKnowledgeProfile) {
  return [
    ["Upgrade ceiling", profile.potential.upgradeCeiling],
    ["Longevity", profile.potential.longevity],
    ["Expandability", profile.potential.expandability],
    ["Engineering flexibility", profile.potential.engineeringFlexibility],
    ["Community support", profile.potential.communitySupport],
    ["Hidden value", profile.potential.hiddenValue]
  ];
}

export function PlatformKnowledgePanel({ profile }: PlatformKnowledgePanelProps) {
  if (!profile) {
    return (
      <section className="rounded-lg border border-border bg-panel p-5">
        <div className="flex items-center gap-3">
          <Gauge className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
          <h2 className="text-xl font-bold">Platform Knowledge</h2>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted">
          No recognized platform is selected yet. Add a known base system,
          chassis, or motherboard to reveal hidden upgrade paths, constraints,
          adapter recommendations, and community knowledge.
        </p>
      </section>
    );
  }

  const adapters = getRecommendedAdaptersForPlatform(profile.id).slice(0, 4);
  const evidenceSummary = getEvidenceSummaryForPlatform(profile.id);
  const quality = getKnowledgeQualityForPlatform(profile);
  const conflicts = getEvidenceConflictsForPlatform(profile.id);
  const discoveries = getCommunityDiscoveriesForPlatform(profile.id);
  const knowledgeTimeline = getKnowledgeTimelineForPlatform(profile.id);

  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
            Platform Knowledge Engine
          </p>
          <h2 className="mt-3 text-2xl font-bold">{profile.name}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            {profile.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill>{profile.manufacturer}</StatusPill>
            <StatusPill>{profile.family}</StatusPill>
            <StatusPill>{profile.modelYears}</StatusPill>
            <StatusPill>{profile.specifications.ramType}</StatusPill>
          </div>
        </div>
        <div className="rounded-lg border border-accent/40 bg-accent/10 px-5 py-4 text-center">
          <p className="text-xs font-semibold uppercase text-muted">
            Platform Potential
          </p>
          <p className="mt-2 text-5xl font-bold text-accent-strong dark:text-accent">
            {profile.potential.overall}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {scoreRows(profile).map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase text-muted">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <EvidencePanel
          conflicts={conflicts}
          discoveries={discoveries}
          quality={quality}
          summary={evidenceSummary}
          timeline={knowledgeTimeline}
          title="Why do we believe this platform profile?"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section>
          <div className="mb-4 flex items-center gap-3">
            <Lightbulb className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h3 className="text-lg font-semibold">What enthusiasts know</h3>
          </div>
          <div className="grid gap-3">
            {profile.knowledgeCards.slice(0, 4).map((card) => (
              <article
                key={card.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex flex-wrap gap-2">
                  <StatusPill>{card.category.replaceAll("-", " ")}</StatusPill>
                  <StatusPill>{card.confidence} confidence</StatusPill>
                </div>
                <h4 className="mt-3 text-base font-semibold">{card.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted">{card.body}</p>
                <div className="mt-3">
                  <EvidencePanel
                    compact
                    summary={getEvidenceSummaryForSubject(card.id)}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-warning" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Platform constraints</h3>
          </div>
          <div className="grid gap-3">
            {profile.constraints.map((constraint) => (
              <article
                key={constraint.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex flex-wrap gap-2">
                  <StatusPill
                    tone={constraint.severity === "hard-limit" ? "warning" : "neutral"}
                  >
                    {constraint.severity}
                  </StatusPill>
                  <StatusPill>{constraint.confidence} confidence</StatusPill>
                </div>
                <h4 className="mt-3 text-base font-semibold">{constraint.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {constraint.description}
                </p>
                {constraint.mitigation ? (
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {constraint.mitigation}
                  </p>
                ) : null}
                <div className="mt-3">
                  <EvidencePanel
                    compact
                    summary={getEvidenceSummaryForSubject(constraint.id)}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6">
        <div className="mb-4 flex items-center gap-3">
          <Wrench className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Upgrade opportunities</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {profile.upgradeOpportunities.map((opportunity) => (
            <UpgradeOpportunityCard
              key={opportunity.id}
              opportunity={opportunity}
            />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-center gap-3">
          <Cpu className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
          <h3 className="text-lg font-semibold">PCIe intelligence</h3>
        </div>
        <div className="grid gap-4 xl:grid-cols-[0.9fr_1fr]">
          <div className="grid gap-3">
            {profile.pcieSlots.map((slot) => (
              <article
                key={slot.id}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex flex-wrap gap-2">
                  <StatusPill>Gen{slot.generation}</StatusPill>
                  <StatusPill>{slot.physicalSize}</StatusPill>
                  <StatusPill>x{slot.electricalLanes} electrical</StatusPill>
                </div>
                <p className="mt-3 text-sm font-semibold">
                  {slot.priority.replaceAll("-", " ")}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">{slot.notes}</p>
              </article>
            ))}
          </div>
          <div className="grid gap-3">
            {profile.pcieBottlenecks.map((bottleneck) => (
              <article
                key={`${bottleneck.workload}-${bottleneck.impact}`}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="flex flex-wrap gap-2">
                  <StatusPill>{bottleneck.workload}</StatusPill>
                  <StatusPill>{bottleneck.impact} impact</StatusPill>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {bottleneck.reason}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex items-center gap-3">
          <Wrench className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
          <h3 className="text-lg font-semibold">Adapter recommendations</h3>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {adapters.map((adapter) => (
            <AdapterIntelligenceCard key={adapter.id} adapter={adapter} />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h3 className="text-lg font-semibold">Upgrade timeline</h3>
        <div className="mt-4 grid gap-3">
          {profile.timeline.map((step, index) => (
            <article
              key={step.id}
              className="grid gap-3 rounded-lg border border-border bg-background p-4 sm:grid-cols-[48px_1fr]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-sm font-semibold text-accent-strong dark:text-accent">
                {index + 1}
              </div>
              <div>
                <h4 className="text-base font-semibold">{step.title}</h4>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {step.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
