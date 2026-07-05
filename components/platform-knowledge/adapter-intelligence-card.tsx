import { Cable } from "lucide-react";

import { EvidencePanel } from "@/components/evidence/evidence-panel";
import { StatusPill } from "@/components/ui/status-pill";
import { getEvidenceSummaryForSubject } from "@/lib/evidence-engine";
import type { AdapterIntelligenceProfile } from "@/types/platform-knowledge";

type AdapterIntelligenceCardProps = {
  adapter: AdapterIntelligenceProfile;
};

export function AdapterIntelligenceCard({ adapter }: AdapterIntelligenceCardProps) {
  const evidenceSummary = getEvidenceSummaryForSubject(adapter.id);

  return (
    <article className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent-strong dark:text-accent">
          <Cable className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill>{adapter.type}</StatusPill>
            <StatusPill>{adapter.difficulty}</StatusPill>
            <StatusPill>{adapter.compatibilityConfidence} confidence</StatusPill>
          </div>
          <h3 className="mt-3 text-base font-semibold">{adapter.title}</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            {adapter.expectedPerformance}
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-panel px-3 py-2">
        <p className="text-xs font-semibold uppercase text-muted">Expected cost</p>
        <p className="mt-1 font-semibold">${adapter.costUsd}</p>
      </div>

      <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted">
        {adapter.notes.slice(0, 2).map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>

      <div className="mt-4">
        <EvidencePanel compact summary={evidenceSummary} />
      </div>
    </article>
  );
}
