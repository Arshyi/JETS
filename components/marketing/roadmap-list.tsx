import { StatusPill } from "@/components/ui/status-pill";
import { roadmap } from "@/config/site";

function toneForStatus(status: string) {
  if (status === "Now") {
    return "accent" as const;
  }

  if (status === "Next") {
    return "warning" as const;
  }

  return "neutral" as const;
}

export function RoadmapList() {
  return (
    <div className="grid gap-4">
      {roadmap.map((milestone) => (
        <article
          key={milestone.version}
          className="rounded-lg border border-border bg-panel p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-accent-strong dark:text-accent">
                Version {milestone.version}
              </p>
              <h2 className="mt-2 text-2xl font-bold">{milestone.title}</h2>
            </div>
            <StatusPill tone={toneForStatus(milestone.status)}>
              {milestone.status}
            </StatusPill>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-6 text-muted">
            {milestone.description}
          </p>

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {milestone.items.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
