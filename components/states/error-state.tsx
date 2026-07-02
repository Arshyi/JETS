import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

type ErrorStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ErrorState({ title, description, action }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-warning/40 bg-warning/10 p-6">
      <div className="flex gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-warning/15 text-warning">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
          {action ? <div className="mt-5">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
