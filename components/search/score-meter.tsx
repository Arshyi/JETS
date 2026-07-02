import { cn } from "@/lib/utils";

type ScoreMeterProps = {
  label: string;
  value: number;
  tone?: "accent" | "warning" | "neutral";
};

export function ScoreMeter({ label, value, tone = "accent" }: ScoreMeterProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-semibold text-foreground">{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-subtle">
        <div
          className={cn(
            "h-full rounded-full",
            tone === "accent" && "bg-accent",
            tone === "warning" && "bg-warning",
            tone === "neutral" && "bg-muted"
          )}
          style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
        />
      </div>
    </div>
  );
}
