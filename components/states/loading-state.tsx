type LoadingStateProps = {
  title?: string;
  rows?: number;
};

export function LoadingState({
  title = "Loading listings",
  rows = 3
}: LoadingStateProps) {
  return (
    <div
      className="rounded-lg border border-border bg-panel p-5"
      role="status"
      aria-live="polite"
      aria-label={title}
    >
      <p className="text-sm font-semibold text-muted">{title}</p>
      <div className="mt-5 grid gap-4">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-lg border border-border bg-background p-5"
          >
            <div className="h-4 w-2/3 rounded bg-subtle" />
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="h-16 rounded bg-subtle" />
              <div className="h-16 rounded bg-subtle" />
              <div className="h-16 rounded bg-subtle" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
