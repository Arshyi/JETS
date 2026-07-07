import { buildWorkspaceSlotDefinitions } from "@/data/solution-builder";
import { getComponentById, toWorkspaceSelection } from "@/lib/component-inventory";
import {
  countryCurrencyDefaults,
  defaultBuildGeneratorPreferences,
  defaultOwnedItems
} from "@/lib/build-generator/config";
import {
  buildGeneratorCountries,
  buildGeneratorCurrencies
} from "@/types/build-generator";
import { hardwareUseCases } from "@/types/hardware";
import type {
  BuildGeneratorCountry,
  BuildGeneratorCurrency,
  BuildGeneratorPreferences,
  OwnedItems
} from "@/types/build-generator";
import type {
  BuildProjectAuditEventRow,
  AcquisitionProjectLinkRow,
  AcquisitionRecordRow,
  BuildProjectNoteRow,
  BuildProjectOptimizationRunRow,
  BuildProjectRow,
  BuildProjectSlotRow,
  Json
} from "@/types/database";
import type { ComponentInventoryItem } from "@/types/component-inventory";
import type {
  BuildProjectBranchSource,
  BuildProjectStatus,
  BuildSlotId,
  BuildWorkspaceModel,
  BuildWorkspaceProject,
  BuildWorkspaceSlot,
  WorkspaceHardwareSelection
} from "@/types/solution-builder";
import type { HardwareUseCase } from "@/types/hardware";

export type BuildProjectDetailData = {
  auditEvents: BuildProjectAuditEventRow[];
  branches: BuildProjectRow[];
  linkedAcquisitions: Array<{
    acquisition: AcquisitionRecordRow | null;
    link: AcquisitionProjectLinkRow;
  }>;
  model: BuildWorkspaceModel;
  notes: BuildProjectNoteRow[];
  optimizationRuns: BuildProjectOptimizationRunRow[];
  projectRow: BuildProjectRow;
  slotRows: BuildProjectSlotRow[];
};

function isRecord(value: Json | null): value is Record<string, Json | undefined> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function parseCountry(value: string): BuildGeneratorCountry {
  return buildGeneratorCountries.includes(value as BuildGeneratorCountry)
    ? (value as BuildGeneratorCountry)
    : "United States";
}

function parseCurrency(
  value: string,
  country: BuildGeneratorCountry
): BuildGeneratorCurrency {
  return buildGeneratorCurrencies.includes(value as BuildGeneratorCurrency)
    ? (value as BuildGeneratorCurrency)
    : countryCurrencyDefaults[country];
}

function parseUseCase(value: string): HardwareUseCase {
  return hardwareUseCases.includes(value as HardwareUseCase)
    ? (value as HardwareUseCase)
    : "general";
}

function parseStatus(value: string): BuildProjectStatus {
  return value === "archived" ? "archived" : "active";
}

function parseBranchSource(value: string): BuildProjectBranchSource {
  if (value === "optimization" || value === "import") {
    return value;
  }

  return "manual";
}

function parseBooleanRecord<T extends Record<string, boolean>>(
  value: Json,
  fallback: T
): T {
  if (!isRecord(value)) {
    return fallback;
  }

  return Object.fromEntries(
    Object.entries(fallback).map(([key, defaultValue]) => [
      key,
      typeof value[key] === "boolean" ? value[key] : defaultValue
    ])
  ) as T;
}

function readComponentSnapshot(value: Json | null) {
  if (!isRecord(value)) {
    return null;
  }

  const id = typeof value.id === "string" ? value.id : null;
  const title = typeof value.title === "string" ? value.title : null;
  const category = typeof value.category === "string" ? value.category : null;

  if (!id || !title || !category) {
    return null;
  }

  return value as unknown as ComponentInventoryItem;
}

function slotRowToSelection(
  row: BuildProjectSlotRow
): WorkspaceHardwareSelection | undefined {
  const snapshot = readComponentSnapshot(row.component_snapshot);

  if (snapshot) {
    return toWorkspaceSelection(snapshot);
  }

  const currentComponent = getComponentById(row.component_id);

  return currentComponent ? toWorkspaceSelection(currentComponent) : undefined;
}

export function buildWorkspaceProjectFromRows(
  projectRow: BuildProjectRow,
  slotRows: BuildProjectSlotRow[]
): BuildWorkspaceProject {
  const country = parseCountry(projectRow.country);
  const currency = parseCurrency(projectRow.currency, country);
  const slotsById = new Map(slotRows.map((slot) => [slot.slot_id, slot]));
  const slots: BuildWorkspaceSlot[] = buildWorkspaceSlotDefinitions.map(
    (definition) => {
      const row = slotsById.get(definition.id);

      return {
        definitionId: definition.id,
        notes: row?.notes || undefined,
        selectedHardware: row ? slotRowToSelection(row) : undefined
      };
    }
  );

  return {
    branchDepth: projectRow.branch_depth,
    branchName: projectRow.branch_name,
    branchNotes: projectRow.branch_notes,
    branchSource: parseBranchSource(projectRow.branch_source),
    budget: Number(projectRow.budget),
    country,
    createdAt: projectRow.created_at,
    currency,
    id: projectRow.id,
    ownedItems: parseBooleanRecord(projectRow.owned_items, defaultOwnedItems),
    parentProjectId: projectRow.parent_project_id,
    preferences: parseBooleanRecord(
      projectRow.preferences,
      defaultBuildGeneratorPreferences
    ) as BuildGeneratorPreferences,
    purpose: parseUseCase(projectRow.purpose),
    rootProjectId: projectRow.root_project_id,
    slots,
    status: parseStatus(projectRow.status),
    strategyId: projectRow.strategy_id,
    strategyTitle: projectRow.strategy_title,
    title: projectRow.title,
    updatedAt: projectRow.updated_at
  };
}

export function getDefaultProjectInput() {
  return {
    budget: 850,
    country: "United States" as const,
    currency: "USD" as const,
    ownedItems: defaultOwnedItems as OwnedItems,
    preferences: defaultBuildGeneratorPreferences,
    purpose: "engineering" as const,
    title: "Engineering Workstation"
  };
}

export function isBuildSlotId(value: string): value is BuildSlotId {
  return buildWorkspaceSlotDefinitions.some((definition) => definition.id === value);
}
