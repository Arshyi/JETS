import { BuildSlotCard } from "@/components/solution-builder/build-slot-card";
import { BuildValidationSummary } from "@/components/solution-builder/build-validation-summary";
import { CompareAgainstJets } from "@/components/solution-builder/compare-against-jets";
import { SolutionStrategyList } from "@/components/solution-builder/solution-strategy-list";
import { StatusPill } from "@/components/ui/status-pill";
import { getReasoningGraphPathIdsForContext } from "@/lib/reasoning-graph/engine";
import type { BuildSlotRequirement, BuildWorkspaceModel } from "@/types/solution-builder";

type BuildWorkspaceExperienceProps = {
  model: BuildWorkspaceModel;
};

const sectionLabels: Record<BuildSlotRequirement, string> = {
  optional: "Optional slots",
  required: "Required slots",
  solution: "Special solution slots"
};

export function BuildWorkspaceExperience({ model }: BuildWorkspaceExperienceProps) {
  const slotGroups = (["required", "optional", "solution"] as const).map(
    (requirement) => ({
      requirement,
      slots: model.evaluation.slots.filter(
        (slot) => slot.definition.requirement === requirement
      )
    })
  );
  const reasoningPathIds = model.platformInsight
    ? getReasoningGraphPathIdsForContext({
        platformId: model.platformInsight.platformId
      })
    : [];

  return (
    <main className="bg-background pb-16">
      <section className="border-b border-border bg-panel">
        <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
            Build My Own
          </p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold">{model.project.title}</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
                A slot-based project workspace for composing hardware into a complete solution before shopping becomes the main activity.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="accent">{model.project.purpose}</StatusPill>
              <StatusPill>{model.project.currency} {model.project.budget}</StatusPill>
              <StatusPill tone={model.evaluation.blockingCount > 0 ? "warning" : "accent"}>
                {model.evaluation.overallStatus}
              </StatusPill>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[340px_1fr] lg:px-8">
        <div className="grid gap-6 lg:sticky lg:top-24 lg:self-start">
          <BuildValidationSummary
            evaluation={model.evaluation}
            reasoningPathIds={reasoningPathIds}
          />
        </div>

        <div className="grid gap-8">
          {slotGroups.map((group) => (
            <section key={group.requirement}>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold">{sectionLabels[group.requirement]}</h2>
                <StatusPill>{group.slots.length} slots</StatusPill>
              </div>
              <div className="grid gap-4 xl:grid-cols-2">
                {group.slots.map((slot) => (
                  <BuildSlotCard key={slot.definition.id} slot={slot} />
                ))}
              </div>
            </section>
          ))}

          <CompareAgainstJets preview={model.comparePreview} />
          <SolutionStrategyList strategies={model.strategies} />
        </div>
      </section>
    </main>
  );
}
