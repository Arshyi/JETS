import { StatusPill } from "@/components/ui/status-pill";
import type { CompatibilityReport, CompatibilityStatus } from "@/types/compatibility";

type CompatibilityBadgesProps = {
  report: CompatibilityReport;
};

const statusTone: Record<CompatibilityStatus, "accent" | "neutral" | "warning"> = {
  Compatible: "accent",
  "Compatible with Warning": "warning",
  Incompatible: "warning"
};

export function CompatibilityBadges({ report }: CompatibilityBadgesProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <StatusPill tone={statusTone[report.summary.status]}>
        {report.summary.status}
      </StatusPill>
      <StatusPill>{report.summary.confidence}% confidence</StatusPill>
      <StatusPill tone={report.summary.incompatibleCount > 0 ? "warning" : "neutral"}>
        {report.summary.incompatibleCount} blockers
      </StatusPill>
      <StatusPill>{report.summary.upgradePathScore}/100 upgrade path</StatusPill>
    </div>
  );
}
