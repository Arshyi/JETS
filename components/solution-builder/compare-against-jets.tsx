import { GitCompare } from "lucide-react";
import Link from "next/link";

import type { CompareAgainstJetsPreview } from "@/types/solution-builder";

type CompareAgainstJetsProps = {
  preview: CompareAgainstJetsPreview;
};

export function CompareAgainstJets({ preview }: CompareAgainstJetsProps) {
  return (
    <section className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-3">
        <GitCompare className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Compare Against JETS</h2>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm font-semibold text-muted">Your Build</p>
          <h3 className="mt-2 text-xl font-bold">{preview.yourBuild.title}</h3>
          <p className="mt-3 text-4xl font-bold text-accent-strong dark:text-accent">
            {preview.yourBuild.score}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-4">
          <p className="text-sm font-semibold text-muted">JETS Solution</p>
          <h3 className="mt-2 text-xl font-bold">{preview.jetsSolution.title}</h3>
          <p className="mt-3 text-4xl font-bold text-accent-strong dark:text-accent">
            {preview.jetsSolution.score}
          </p>
        </div>
      </div>

      <ul className="mt-5 grid gap-2 text-sm leading-6 text-muted">
        {preview.explanations.map((explanation) => (
          <li key={explanation}>{explanation}</li>
        ))}
      </ul>

      <Link
        href={preview.jetsSolution.href}
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
      >
        Open recommendation mode
      </Link>
    </section>
  );
}
