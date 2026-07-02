import { cn } from "@/lib/utils";

type StatusPillProps = {
  children: React.ReactNode;
  tone?: "accent" | "neutral" | "warning";
};

export function StatusPill({ children, tone = "neutral" }: StatusPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        tone === "accent" &&
          "border-accent/40 bg-accent/10 text-accent-strong dark:text-accent",
        tone === "warning" &&
          "border-warning/40 bg-warning/10 text-warning",
        tone === "neutral" && "border-border bg-subtle text-muted"
      )}
    >
      {children}
    </span>
  );
}
