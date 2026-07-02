import { Cpu, Gauge, MemoryStick, Power, Thermometer } from "lucide-react";

import { CompatibilityBadges } from "@/components/compatibility/compatibility-badges";
import { PlatformHealthIndicator } from "@/components/compatibility/platform-health-indicator";
import { StatusPill } from "@/components/ui/status-pill";
import type { CompatibilityReport } from "@/types/compatibility";

type CompatibilitySummaryProps = {
  report: CompatibilityReport;
};

export function CompatibilitySummary({ report }: CompatibilitySummaryProps) {
  const profile = report.profile;

  return (
    <article className="rounded-lg border border-border bg-panel p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <CompatibilityBadges report={report} />
          <h2 className="mt-4 text-2xl font-semibold">{profile.title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            Compatibility report for physical fit, electrical headroom, thermal
            risk, storage expansion, memory support, BIOS risk, and platform age.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4 text-sm">
          <p className="text-xs font-semibold uppercase text-muted">Primary use</p>
          <p className="mt-2 font-semibold">{profile.primaryUseCase}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr]">
        <PlatformHealthIndicator report={report} />
        <section className="rounded-lg border border-border bg-background p-4">
          <div className="flex items-center gap-2">
            <Gauge className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h3 className="text-sm font-semibold">Core hardware</h3>
          </div>
          <div className="mt-4 grid gap-3 text-sm">
            {[
              [Cpu, "CPU", profile.cpu.model],
              [MemoryStick, "Memory", `${profile.memory.capacityGb}GB ${profile.memory.type}`],
              [Power, "PSU", `${profile.psu.wattage}W`],
              [Thermometer, "Chassis airflow", `${profile.chassis.airflowRating}/5`]
            ].map(([Icon, label, value]) => {
              const HardwareIcon = Icon as typeof Cpu;

              return (
                <div key={label as string} className="flex items-center gap-3">
                  <HardwareIcon className="h-4 w-4 text-muted" aria-hidden="true" />
                  <span className="w-28 text-muted">{label as string}</span>
                  <span className="font-semibold">{value as string}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill>{profile.motherboard.chipset}</StatusPill>
            <StatusPill>{profile.chassis.formFactor}</StatusPill>
            <StatusPill>{profile.gpu?.model ?? "Integrated graphics"}</StatusPill>
          </div>
        </section>
      </div>
    </article>
  );
}
