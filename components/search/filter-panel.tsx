import { RotateCcw, Search } from "lucide-react";
import type { ChangeEvent } from "react";

import {
  conditionLabels,
  formFactorLabels,
  hardwareConditions,
  hardwareFormFactors,
  hardwareUseCases,
  useCaseLabels
} from "@/types/hardware";
import type { HardwareFilters } from "@/types/hardware";

type FilterPanelProps = {
  filters: HardwareFilters;
  locations: string[];
  resultCount: number;
  onChange: <Key extends keyof HardwareFilters>(
    key: Key,
    value: HardwareFilters[Key]
  ) => void;
  onReset: () => void;
};

function parseBudget(value: string) {
  if (value.trim() === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

export function FilterPanel({
  filters,
  locations,
  resultCount,
  onChange,
  onReset
}: FilterPanelProps) {
  const handleBudgetChange =
    (key: "minBudget" | "maxBudget") => (event: ChangeEvent<HTMLInputElement>) => {
      onChange(key, parseBudget(event.target.value));
    };

  return (
    <aside className="rounded-lg border border-border bg-panel p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Filters</h2>
          <p className="mt-1 text-sm text-muted">{resultCount} matching listings</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-background text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
          aria-label="Reset filters"
          title="Reset filters"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-6 grid gap-5">
        <label className="grid gap-2 text-sm font-medium">
          Search
          <span className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <input
              type="search"
              value={filters.query}
              onChange={(event) => onChange("query", event.target.value)}
              placeholder="RTX, ThinkStation, OptiPlex"
              className="h-11 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/25"
            />
          </span>
        </label>

        <div>
          <p className="text-sm font-medium">Budget range</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <label className="grid gap-2 text-xs text-muted">
              Min
              <input
                type="number"
                min="0"
                value={filters.minBudget ?? ""}
                onChange={handleBudgetChange("minBudget")}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
              />
            </label>
            <label className="grid gap-2 text-xs text-muted">
              Max
              <input
                type="number"
                min="0"
                value={filters.maxBudget ?? ""}
                onChange={handleBudgetChange("maxBudget")}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
              />
            </label>
          </div>
        </div>

        <label className="grid gap-2 text-sm font-medium">
          Use case
          <select
            value={filters.useCase}
            onChange={(event) =>
              onChange("useCase", event.target.value as HardwareFilters["useCase"])
            }
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          >
            <option value="all">All use cases</option>
            {hardwareUseCases.map((useCase) => (
              <option key={useCase} value={useCase}>
                {useCaseLabels[useCase]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Form factor
          <select
            value={filters.formFactor}
            onChange={(event) =>
              onChange("formFactor", event.target.value as HardwareFilters["formFactor"])
            }
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          >
            <option value="all">All form factors</option>
            {hardwareFormFactors.map((formFactor) => (
              <option key={formFactor} value={formFactor}>
                {formFactorLabels[formFactor]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Condition
          <select
            value={filters.condition}
            onChange={(event) =>
              onChange("condition", event.target.value as HardwareFilters["condition"])
            }
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          >
            <option value="all">All conditions</option>
            {hardwareConditions.map((condition) => (
              <option key={condition} value={condition}>
                {conditionLabels[condition]}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-medium">
          Location
          <select
            value={filters.location}
            onChange={(event) => onChange("location", event.target.value)}
            className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
          >
            <option value="all">All locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </label>
      </div>
    </aside>
  );
}
