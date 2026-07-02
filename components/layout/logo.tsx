import Link from "next/link";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
      aria-label="JETS home"
    >
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-accent/40 bg-accent/10 text-sm font-bold text-accent-strong dark:text-accent">
        JT
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-semibold text-foreground">JETS</span>
        <span className="hidden text-xs text-muted sm:block">
          Just Enough Tech Solutions
        </span>
      </span>
    </Link>
  );
}
