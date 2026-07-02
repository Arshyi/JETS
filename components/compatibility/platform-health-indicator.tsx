import { Activity } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import type { CompatibilityReport, CompatibilitySeverity } from "@/types/compatibility";

type PlatformHealthIndicatorProps = {
  report: CompatibilityReport;
};

const thermalTone: Record<CompatibilitySeverity, "accent" | "neutral" | "warning"> = {
  high: "warning",
  low: "accent",
  medium: "warning"
};

export function PlatformHealthIndicator({ report }: PlatformHealthIndicatorProps) {
  return (
    <section className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-2">
        <Activity className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h3 className="text-sm font-semibold">Platform health</h3>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Health</p>
          <p className="mt-1 text-2xl font-bold">{report.summary.platformHealthScore}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Platform age</p>
          <p className="mt-1 text-2xl font-bold">{report.summary.platformAgeScore}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Thermal risk</p>
          <div className="mt-2">
            <StatusPill tone={thermalTone[report.summary.thermalRisk]}>
              {report.summary.thermalRisk}
            </StatusPill>
          </div>
        </div>
      </div>
    </section>
  );
}
