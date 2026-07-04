import { InventoryExperience } from "@/components/inventory/inventory-experience";
import { getComponentsForSlot } from "@/lib/component-inventory";
import { getHardwareFiltersFromSearchParams } from "@/lib/hardware-search";
import { isBuildSlotId } from "@/lib/solution-builder/projects";
import { getSlotInventoryContext } from "@/lib/solution-builder/workspace";
import { getSearchPersistenceState } from "@/lib/supabase/queries";

export type InventorySearchParams = {
  condition?: string;
  formFactor?: string;
  location?: string;
  maxBudget?: string;
  minBudget?: string;
  projectId?: string;
  query?: string;
  returnTo?: string;
  slot?: string;
  useCase?: string;
};

type InventoryPageShellProps = {
  routePath?: "/inventory" | "/search";
  searchParams?: Promise<InventorySearchParams>;
};

function getSafeInternalPath(value: string | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }

  return value;
}

export async function InventoryPageShell({
  routePath = "/inventory",
  searchParams
}: InventoryPageShellProps) {
  const params = searchParams ? await searchParams : {};
  const persistence = await getSearchPersistenceState();
  const initialFilters = getHardwareFiltersFromSearchParams(params);
  const slotId = params.slot && isBuildSlotId(params.slot) ? params.slot : null;
  const inventoryContext = getSlotInventoryContext(slotId ?? undefined);
  const componentInventory = slotId ? getComponentsForSlot(slotId) : undefined;
  const projectContext =
    slotId && params.projectId
      ? {
          projectId: params.projectId,
          returnTo:
            getSafeInternalPath(params.returnTo) ??
            `/solution-builder/projects/${params.projectId}`,
          slotId
        }
      : null;

  return (
    <InventoryExperience
      componentInventory={componentInventory}
      initialFilters={initialFilters}
      inventoryContext={inventoryContext}
      persistence={persistence}
      projectContext={projectContext}
      returnTo={routePath}
    />
  );
}
