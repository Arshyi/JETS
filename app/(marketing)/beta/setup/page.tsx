import type { Metadata } from "next";
import Link from "next/link";
import { ClipboardCheck } from "lucide-react";

import { ContentPage } from "@/components/pages/content-page";
import { StatusPill } from "@/components/ui/status-pill";
import { siteConfig } from "@/config/site";
import { betaSetupChecklist } from "@/data/beta";
import {
  isSupabaseConfigured,
  supabaseEnv,
  supabaseSetupChecklistPath
} from "@/lib/supabase/config";
import { isSupabaseServiceRoleConfigured } from "@/lib/supabase/service-role";

export const metadata: Metadata = {
  title: "Beta Setup Checklist",
  description:
    "Supabase environment variable and migration checklist for the JETS private beta."
};

const migrations = [
  "202607020003_v0_3_auth_persistence.sql",
  "202607020004_v0_4_ingestion_foundation.sql",
  "202607030008_v0_8_build_snapshots.sql",
  "202607030009_v0_9_decision_audit.sql",
  "202607030011_v2_1_build_projects.sql",
  "202607030012_v2_2_optimization_engine.sql",
  "202607030013_v2_3_project_branching.sql",
  "202607030014_production_schema_hardening.sql",
  "202607060001_v3_2_evidence_review.sql",
  "202607060002_v3_3_listing_intelligence.sql"
];

const envRows = [
  {
    name: "NEXT_PUBLIC_SITE_URL",
    status: process.env.NEXT_PUBLIC_SITE_URL ? "Set" : "Missing",
    description: siteConfig.url
  },
  {
    name: "NEXT_PUBLIC_VERCEL_URL",
    status: process.env.NEXT_PUBLIC_VERCEL_URL ? "Set" : "Optional",
    description: "Optional preview URL fallback when the production site URL is not set."
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_URL",
    status: supabaseEnv.url ? "Set" : "Missing",
    description: "Required for Supabase auth and persistence."
  },
  {
    name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    status: supabaseEnv.anonKey ? "Set" : "Missing",
    description: "Required for user-scoped Supabase access."
  },
  {
    name: "SUPABASE_SERVICE_ROLE_KEY",
    status: isSupabaseServiceRoleConfigured ? "Set" : "Optional",
    description:
      "Required for admin ingestion persistence, evidence review moderation, and listing field review."
  },
  {
    name: "JETS_ADMIN_EMAILS",
    status: process.env.JETS_ADMIN_EMAILS ? "Set" : "Optional",
    description:
      "Comma-separated admin allowlist for /admin/ingestion, /evidence/review, and /listing-intelligence/review."
  }
];

export default function BetaSetupPage() {
  return (
    <ContentPage
      eyebrow="Private beta"
      title="Setup Checklist"
      description="Use this page before a beta session to confirm Supabase configuration, migrations, and local verification."
    >
      <div className="grid gap-6">
        <article className="rounded-lg border border-border bg-panel p-5">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill tone={isSupabaseConfigured ? "accent" : "warning"}>
              Supabase {isSupabaseConfigured ? "configured" : "not configured"}
            </StatusPill>
            <StatusPill tone={isSupabaseServiceRoleConfigured ? "accent" : "neutral"}>
              Service role {isSupabaseServiceRoleConfigured ? "set" : "optional"}
            </StatusPill>
          </div>
          <dl className="mt-5 grid gap-3 text-sm">
            {envRows.map((env) => (
              <div key={env.name} className="rounded-lg border border-border bg-background p-4">
                <dt className="font-semibold">{env.name}</dt>
                <dd className="mt-1 text-muted">{env.status}</dd>
                <dd className="mt-1 text-xs leading-5 text-muted">{env.description}</dd>
              </div>
            ))}
          </dl>
        </article>

        <article className="rounded-lg border border-border bg-panel p-5">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Checklist</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {betaSetupChecklist.map((item, index) => (
              <div key={item.title} className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm font-semibold">
                  {index + 1}. {item.title}
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-border bg-panel p-5">
          <h2 className="text-lg font-semibold">Migration order</h2>
          <ol className="mt-4 grid gap-2 text-sm text-muted">
            {migrations.map((migration) => (
              <li key={migration} className="rounded-lg border border-border bg-background px-3 py-2">
                {migration}
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={supabaseSetupChecklistPath}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Stay on checklist
            </Link>
            <Link
              href="/beta/demo-data"
              className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
            >
              Demo workflow
            </Link>
          </div>
        </article>
      </div>
    </ContentPage>
  );
}
