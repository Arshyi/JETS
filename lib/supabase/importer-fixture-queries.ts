import {
  buildImporterFixtureResult,
  getImporterFixturePreviews
} from "@/lib/importer-fixtures/engine";
import { getAdminGate } from "@/lib/supabase/admin";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  createSupabaseServiceRoleClient,
  isSupabaseServiceRoleConfigured
} from "@/lib/supabase/service-role";
import { importerFixtureSets } from "@/data/importer-fixtures";
import type {
  ImporterFixtureRunItemView,
  ImporterFixtureRunView,
  ImporterFixtureSetId,
  ImporterFixtureState,
  ImporterResultStatus,
  ImporterRunMode,
  ImporterValidationErrorCode
} from "@/types/importer-fixtures";
import type {
  ImporterFixtureRunItemRow,
  ImporterFixtureRunRow,
  NormalizedMarketplaceListingRow
} from "@/types/database";

const fixtureSetIds = new Set<ImporterFixtureSetId>(
  importerFixtureSets.map((fixtureSet) => fixtureSet.id)
);
const runModes = new Set<ImporterRunMode>(["dry-run", "import"]);
const resultStatuses = new Set<ImporterResultStatus>([
  "created",
  "updated",
  "skipped",
  "error",
  "dry-run"
]);

function toFixtureSetId(value: string): ImporterFixtureSetId {
  return fixtureSetIds.has(value as ImporterFixtureSetId)
    ? (value as ImporterFixtureSetId)
    : "core-demo-listings";
}

function toRunMode(value: string): ImporterRunMode {
  return runModes.has(value as ImporterRunMode)
    ? (value as ImporterRunMode)
    : "dry-run";
}

function toResultStatus(value: string): ImporterResultStatus {
  return resultStatuses.has(value as ImporterResultStatus)
    ? (value as ImporterResultStatus)
    : "skipped";
}

function mapRun(row: ImporterFixtureRunRow): ImporterFixtureRunView {
  return {
    appVersion: row.app_version,
    createdAt: row.created_at,
    createdBy: row.created_by,
    createdCount: row.created_count,
    errorCount: row.error_count,
    fixtureCount: row.fixture_count,
    fixtureSetId: toFixtureSetId(row.fixture_set_id),
    id: row.id,
    mode: toRunMode(row.mode),
    skippedCount: row.skipped_count,
    status: row.status,
    updatedCount: row.updated_count
  };
}

function mapRunItem(row: ImporterFixtureRunItemRow): ImporterFixtureRunItemView {
  return {
    createdAt: row.created_at,
    errorCodes: row.error_codes as ImporterValidationErrorCode[],
    externalId: row.external_id,
    fixtureKey: row.fixture_key,
    id: row.id,
    listingKey: row.listing_key,
    marketplace: row.marketplace,
    message: row.message,
    normalizedListingId: row.normalized_listing_id,
    runId: row.run_id,
    status: toResultStatus(row.status)
  };
}

export async function getImporterFixtureState(): Promise<ImporterFixtureState> {
  const fallbackPreviews = getImporterFixturePreviews();

  if (!isSupabaseConfigured) {
    return {
      canRun: false,
      isConfigured: false,
      isServiceRoleConfigured: false,
      latestRunItems: [],
      latestRuns: [],
      message: supabaseSetupMessage,
      previews: fallbackPreviews
    };
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      canRun: false,
      isConfigured: false,
      isServiceRoleConfigured: false,
      latestRunItems: [],
      latestRuns: [],
      message: supabaseSetupMessage,
      previews: fallbackPreviews
    };
  }

  const adminGate = await getAdminGate();
  const serviceClient =
    adminGate.isAllowed && isSupabaseServiceRoleConfigured
      ? createSupabaseServiceRoleClient()
      : null;

  if (!serviceClient) {
    return {
      canRun: false,
      isConfigured: true,
      isServiceRoleConfigured: isSupabaseServiceRoleConfigured,
      latestRunItems: [],
      latestRuns: [],
      message: adminGate.isAllowed
        ? "Importer fixture runs require SUPABASE_SERVICE_ROLE_KEY."
        : "Importer fixture runs require an admin-allowed account.",
      previews: fallbackPreviews
    };
  }

  const [listingsResult, runsResult, itemsResult] = await Promise.all([
    serviceClient
      .from("normalized_marketplace_listings")
      .select("listing_key")
      .limit(400),
    serviceClient
      .from("importer_fixture_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8),
    serviceClient
      .from("importer_fixture_run_items")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(80)
  ]);
  const existingListingKeys = new Set(
    ((listingsResult.data ?? []) as Pick<
      NormalizedMarketplaceListingRow,
      "listing_key"
    >[]).map((listing) => listing.listing_key)
  );

  return {
    canRun: true,
    isConfigured: true,
    isServiceRoleConfigured: true,
    latestRunItems: ((itemsResult.data ?? []) as ImporterFixtureRunItemRow[]).map(
      mapRunItem
    ),
    latestRuns: ((runsResult.data ?? []) as ImporterFixtureRunRow[]).map(mapRun),
    message:
      listingsResult.error?.message ??
      runsResult.error?.message ??
      itemsResult.error?.message,
    previews: importerFixtureSets.map((fixtureSet) =>
      buildImporterFixtureResult({
        existingListingKeys,
        fixtureSetId: fixtureSet.id,
        mode: "dry-run"
      })
    )
  };
}
