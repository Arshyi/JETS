import { BookOpen, GitBranch, Layers3, ShieldCheck } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import type { PlatformEncyclopediaEntry } from "@/types/platform-encyclopedia";

type PlatformEncyclopediaSummaryProps = {
  entry: PlatformEncyclopediaEntry;
};

export function PlatformEncyclopediaSummary({
  entry
}: PlatformEncyclopediaSummaryProps) {
  return (
    <section className="rounded-lg border border-border bg-background p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h3 className="text-lg font-semibold">Platform Encyclopedia</h3>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
            {entry.overview.summary}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill>{entry.provenance.verification}</StatusPill>
            <StatusPill>Quality {entry.provenance.knowledgeQualityScore}</StatusPill>
            <StatusPill>{entry.diagrams.length} diagrams</StatusPill>
            <StatusPill>{entry.facts.length} facts</StatusPill>
          </div>
        </div>
        <div className="grid gap-2 text-sm sm:grid-cols-3 lg:min-w-[420px]">
          <div className="rounded-lg border border-border bg-panel p-3">
            <p className="text-xs font-semibold uppercase text-muted">Memory</p>
            <p className="mt-1 font-semibold">
              {entry.memoryTopology.maxRamGb} GB, {entry.memoryTopology.slotCount} slots
            </p>
          </div>
          <div className="rounded-lg border border-border bg-panel p-3">
            <p className="text-xs font-semibold uppercase text-muted">Power</p>
            <p className="mt-1 font-semibold">
              {entry.powerSystem.nominalWattageRange}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-panel p-3">
            <p className="text-xs font-semibold uppercase text-muted">Life</p>
            <p className="mt-1 font-semibold">
              {entry.reliability.serviceLifeYears}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-panel p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Layers3 className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
            Topologies
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            <li>{entry.storageTopology.driveBaySummary}</li>
            <li>{entry.cooling.airflowPattern}</li>
            <li>{entry.powerSystem.psuFamily}</li>
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-panel p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <GitBranch className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
            Upgrade encyclopedia
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            <li>{entry.upgradeEncyclopedia.maxRam.summary}</li>
            <li>{entry.upgradeEncyclopedia.nvmeAdapterSupport.summary}</li>
            <li>{entry.upgradeEncyclopedia.pcieBifurcation.summary}</li>
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-panel p-4">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
            Reliability
          </div>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            <li>Repair: {entry.reliability.repairDifficulty}</li>
            <li>Parts: {entry.reliability.replacementAvailability}</li>
            <li>{entry.lifecycle.summary}</li>
          </ul>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {entry.workloadProfiles.slice(0, 6).map((profile) => (
          <div
            key={profile.id}
            className="rounded-lg border border-border bg-panel p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold">{profile.title}</p>
              <StatusPill>{profile.suitability}</StatusPill>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted">
              {profile.reasons[0]}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
