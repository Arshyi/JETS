import { Cpu, HardDrive, MemoryStick, TrendingUp } from "lucide-react";

const specs = [
  { label: "CPU", value: "Xeon W-2135", icon: Cpu },
  { label: "Memory", value: "64 GB ECC", icon: MemoryStick },
  { label: "Storage", value: "1 TB NVMe", icon: HardDrive }
];

export function DecisionPreview() {
  return (
    <div className="rounded-lg border border-border bg-panel p-4 shadow-soft">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-xs font-semibold uppercase text-accent-strong dark:text-accent">
            Placeholder result
          </p>
          <h2 className="mt-2 text-xl font-semibold">Dell Precision 5820</h2>
          <p className="mt-1 text-sm text-muted">
            Workstation candidate for CAD, homelab, and GPU upgrade research.
          </p>
        </div>
        <div className="rounded-lg bg-accent/10 px-3 py-2 text-right">
          <p className="text-xs text-muted">Value score</p>
          <p className="text-2xl font-bold text-accent-strong dark:text-accent">86</p>
        </div>
      </div>

      <div className="grid gap-3 py-4 sm:grid-cols-3">
        {specs.map((spec) => {
          const Icon = spec.icon;

          return (
            <div key={spec.label} className="rounded-lg border border-border bg-subtle p-3">
              <Icon className="h-4 w-4 text-accent-strong dark:text-accent" aria-hidden="true" />
              <p className="mt-3 text-xs text-muted">{spec.label}</p>
              <p className="mt-1 text-sm font-semibold">{spec.value}</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-border bg-background p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-warning" aria-hidden="true" />
          <h3 className="text-sm font-semibold">Why it might rank well later</h3>
        </div>
        <div className="mt-4 grid gap-3">
          {[
            ["Price", "Below similar workstation listings"],
            ["Upgrade path", "Room for RAM, storage, and GPU changes"],
            ["Risk", "Needs seller verification before recommendation"]
          ].map(([label, value]) => (
            <div key={label} className="grid grid-cols-[96px_1fr] gap-3 text-sm">
              <span className="text-muted">{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
