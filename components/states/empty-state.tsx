import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  icon?: LucideIcon;
};

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = SearchX
}: EmptyStateProps) {
  return (
    <div
      className="grid min-h-72 place-items-center rounded-lg border border-dashed border-border bg-panel p-6 text-center sm:p-8"
      role="status"
    >
      <div className="max-w-md">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-subtle text-muted">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-xl font-semibold">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}
