import { runMockIngestionDryRun } from "@/lib/ingestion/dry-run";
import { isSupabaseConfigured, supabaseSetupMessage } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { IngestionRunRow } from "@/types/database";

export async function getSourceStatusState() {
  const report = await runMockIngestionDryRun();

  return {
    isConfigured: isSupabaseConfigured,
    message: isSupabaseConfigured ? undefined : supabaseSetupMessage,
    report
  };
}

export async function getRecentIngestionRuns(limit = 12) {
  if (!isSupabaseConfigured) {
    return {
      data: [] as IngestionRunRow[],
      isConfigured: false,
      message: supabaseSetupMessage
    };
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      data: [] as IngestionRunRow[],
      isConfigured: false,
      message: supabaseSetupMessage
    };
  }

  const { data, error } = await client
    .from("ingestion_runs")
    .select("*")
    .order("started_at", { ascending: false })
    .limit(limit);

  return {
    data: data ?? [],
    isConfigured: true,
    message: error?.message
  };
}
