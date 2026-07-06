import type { Metadata } from "next";
import Link from "next/link";

import { SignedOutState } from "@/components/auth/signed-out-state";
import { ImporterFixturesAdmin } from "@/components/importer-fixtures/importer-fixtures-ui";
import { ContentPage } from "@/components/pages/content-page";
import { ErrorState } from "@/components/states/error-state";
import { StatusPill } from "@/components/ui/status-pill";
import { getAdminGate } from "@/lib/supabase/admin";
import { getImporterFixtureState } from "@/lib/supabase/importer-fixture-queries";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Importer Fixtures",
  description:
    "Admin-only deterministic importer fixtures, dry-run previews, listing seeding, and fixture error reporting."
};

export default async function ImporterFixturesPage() {
  const [gate, state] = await Promise.all([
    getAdminGate(),
    getImporterFixtureState()
  ]);

  return (
    <ContentPage
      eyebrow="Version 3.4"
      title="Importer Fixtures"
      description="Controlled ingestion testbed for seeding representative listings into Listing Intelligence with evidence-backed parsed fields."
    >
      <div className="grid gap-6">
        {gate.isAllowed ? (
          <article className="rounded-lg border border-border bg-panel p-5">
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="accent">Admin verified</StatusPill>
              <StatusPill>{gate.userEmail}</StatusPill>
              <StatusPill>fixture-only</StatusPill>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              This page can dry-run fixture validation and seed demo/manual
              listings into Supabase when the v3.4 migration and service role
              key are configured.
            </p>
          </article>
        ) : gate.status === "signed-out" ? (
          <SignedOutState
            next="/admin/importer-fixtures"
            title={gate.title}
            description={gate.description}
          />
        ) : (
          <ErrorState title={gate.title} description={gate.description} />
        )}

        {gate.isAllowed && !isSupabaseServiceRoleConfigured ? (
          <ErrorState
            title="Service role key required"
            description="Set SUPABASE_SERVICE_ROLE_KEY before importer fixture dry-runs or seed imports can be persisted."
            action={
              <Link
                href="/beta/setup"
                className="inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                Open setup checklist
              </Link>
            }
          />
        ) : null}

        <ImporterFixturesAdmin state={state} />
      </div>
    </ContentPage>
  );
}
