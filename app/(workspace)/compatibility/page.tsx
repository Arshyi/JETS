import type { Metadata } from "next";

import { CompatibilityResultList } from "@/components/compatibility/compatibility-result-list";
import { CompatibilitySummary } from "@/components/compatibility/compatibility-summary";
import { CompatibilityValidationList } from "@/components/compatibility/compatibility-validation-list";
import { UpgradeSuggestions } from "@/components/compatibility/upgrade-suggestions";
import { ContentPage } from "@/components/pages/content-page";
import { StatusPill } from "@/components/ui/status-pill";
import {
  getCompatibilityValidationResults
} from "@/data/compatibility/validation-fixtures";
import type { CompatibilityStatus } from "@/types/compatibility";

const statusTone: Record<CompatibilityStatus, "accent" | "neutral" | "warning"> = {
  Compatible: "accent",
  "Compatible with Warning": "warning",
  Incompatible: "warning"
};

export const metadata: Metadata = {
  title: "Compatibility Report",
  description: "Review deterministic JETS hardware compatibility fixtures and upgrade suggestions."
};

export default function CompatibilityReportPage() {
  const validationResults = getCompatibilityValidationResults();
  const featuredReport = validationResults.find(
    (result) => result.name === "workstation upgrade"
  )?.report ?? validationResults[0]!.report;

  return (
    <ContentPage
      eyebrow="Version 0.6"
      title="Compatibility Report"
      description="Deterministic compatibility checks for physical fit, electrical headroom, thermal risk, BIOS risk, platform age, memory, storage, and upgrade paths."
    >
      <div className="grid gap-6">
        <CompatibilitySummary report={featuredReport} />
        <UpgradeSuggestions suggestions={featuredReport.suggestions} />
        <CompatibilityResultList report={featuredReport} />

        <article className="rounded-lg border border-border bg-panel p-5">
          <h2 className="text-lg font-semibold">Fixture overview</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            These deterministic fixtures cover known-valid and known-problem
            compatibility cases before any live marketplace data enters the app.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {validationResults.map((fixture) => {
              const report = fixture.report;

              return (
                <div
                  key={fixture.name}
                  className="rounded-lg border border-border bg-background p-4"
                >
                  <h3 className="text-sm font-semibold">{fixture.name}</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusPill tone={statusTone[report.summary.status]}>
                      {report.summary.status}
                    </StatusPill>
                    <StatusPill>{report.summary.platformHealthScore}/100 health</StatusPill>
                    <StatusPill>{report.summary.incompatibleCount} blockers</StatusPill>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <CompatibilityValidationList results={validationResults} />
      </div>
    </ContentPage>
  );
}
