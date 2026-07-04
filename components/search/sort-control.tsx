import { ArrowDownUp } from "lucide-react";

import { hardwareSortOptions, sortLabels } from "@/types/hardware";
import type { HardwareSortKey } from "@/types/hardware";

type SortControlProps = {
  sortKey: HardwareSortKey;
  onChange: (sortKey: HardwareSortKey) => void;
};

export function SortControl({ sortKey, onChange }: SortControlProps) {
  return (
    <label className="flex items-center gap-3 text-sm font-medium">
      <ArrowDownUp className="h-4 w-4 text-muted" aria-hidden="true" />
      <span className="sr-only">Sort inventory listings</span>
      <select
        value={sortKey}
        onChange={(event) => onChange(event.target.value as HardwareSortKey)}
        className="h-10 rounded-lg border border-border bg-panel px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
      >
        {hardwareSortOptions.map((option) => (
          <option key={option} value={option}>
            {sortLabels[option]}
          </option>
        ))}
      </select>
    </label>
  );
}
