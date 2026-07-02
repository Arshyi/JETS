import { Boxes, Clock, ListChecks } from "lucide-react";

import { StatusPill } from "@/components/ui/status-pill";
import type { PlaceholderPageContent } from "@/types/navigation";

type PlaceholderPageProps = {
  page: PlaceholderPageContent;
};

export function PlaceholderPage({ page }: PlaceholderPageProps) {
  return (
    <main className="bg-background">
      <section className="border-b border-border bg-panel">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
          <div>
            <div className="flex items-center gap-3">
              <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
                {page.eyebrow}
              </p>
              <StatusPill>Placeholder</StatusPill>
            </div>
            <h1 className="mt-3 max-w-3xl text-4xl font-bold">{page.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
              {page.description}
            </p>
          </div>

          <div className="rounded-lg border border-border bg-background p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent/10 text-accent-strong dark:text-accent">
                <Clock className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold">Not implemented yet</p>
                <p className="text-sm text-muted">Reserved for a later milestone.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <article className="rounded-lg border border-border bg-panel p-5">
          <div className="flex items-center gap-3">
            <Boxes className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Reserved area</h2>
          </div>
          <div className="mt-5 grid min-h-56 place-items-center rounded-lg border border-dashed border-border bg-background p-6 text-center">
            <p className="max-w-sm text-sm leading-6 text-muted">
              This is clean product space for future components. No mock scraping,
              no authentication, no database calls, and no fake AI decisions live here.
            </p>
          </div>
        </article>

        <article className="rounded-lg border border-border bg-panel p-5">
          <div className="flex items-center gap-3">
            <ListChecks className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Planned for later</h2>
          </div>
          <ul className="mt-5 grid gap-3">
            {page.planned.map((item) => (
              <li
                key={item}
                className="rounded-lg border border-border bg-background px-4 py-3 text-sm text-muted"
              >
                {item}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
