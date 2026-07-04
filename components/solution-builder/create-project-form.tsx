import { Plus } from "lucide-react";

import { createBuildProjectAction } from "@/lib/supabase/project-actions";
import {
  buildGeneratorCountries,
  buildGeneratorCurrencies
} from "@/types/build-generator";
import { hardwareUseCases, useCaseLabels } from "@/types/hardware";

type CreateProjectFormProps = {
  compact?: boolean;
  heading?: string;
  submitLabel?: string;
};

export function CreateProjectForm({
  compact = false,
  heading = "New project",
  submitLabel = "Create project"
}: CreateProjectFormProps) {
  return (
    <form action={createBuildProjectAction} className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-center gap-3">
        <Plus className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
        <h2 className="text-lg font-semibold">{heading}</h2>
      </div>
      <div className={compact ? "mt-5 grid gap-4 sm:grid-cols-2" : "mt-5 grid gap-4"}>
        <label className="grid gap-2 text-sm font-medium sm:col-span-2">
          Title
          <input
            name="title"
            defaultValue="Engineering Workstation"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Purpose
          <select
            name="purpose"
            defaultValue="engineering"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          >
            {hardwareUseCases.map((useCase) => (
              <option key={useCase} value={useCase}>
                {useCaseLabels[useCase]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Budget
          <input
            name="budget"
            type="number"
            min="0"
            defaultValue="850"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Country
          <select
            name="country"
            defaultValue="United States"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          >
            {buildGeneratorCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Currency
          <select
            name="currency"
            defaultValue="USD"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          >
            {buildGeneratorCurrencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </label>
        <div className={compact ? "sm:col-span-2" : undefined}>
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
