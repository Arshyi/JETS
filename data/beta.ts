export const betaSetupChecklist = [
  {
    title: "Install dependencies",
    description: "Run npm install from the JETS project folder."
  },
  {
    title: "Create Supabase project",
    description: "Create a Supabase project for beta testing and keep the project URL and anon key ready."
  },
  {
    title: "Add environment variables",
    description:
      "Set NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, and JETS_ADMIN_EMAILS according to the beta workflow being tested. NEXT_PUBLIC_VERCEL_URL is an optional preview fallback."
  },
  {
    title: "Configure Supabase redirects",
    description:
      "Set the Supabase Site URL to the deployed app URL and allow the local, production /auth/callback, and Vercel preview redirect URLs before testing email confirmation."
  },
  {
    title: "Apply migrations in order",
    description:
      "Run the v0.3, v0.4, v0.8, v0.9, v2.1, v2.2, v2.3, production hardening, v3.2 evidence review, v3.3 listing intelligence, and v3.4 importer fixture SQL migrations in Supabase before testing persistence."
  },
  {
    title: "Create a beta account",
    description:
      "Use /signup, confirm the account, and verify the success path lands on /onboarding or routes back through /login with a clear message."
  },
  {
    title: "Run verification",
    description: "Run npm run build and npm run lint -- --max-warnings=0 before sharing a beta build."
  }
] as const;

export const betaDemoWorkflow = [
  {
    title: "Inventory and save",
    description:
      "Open /inventory, filter mock/demo inventory, save one item, favorite one item, then check /saved-builds and /favorites."
  },
  {
    title: "Generate a decision snapshot",
    description:
      "Open /build-generator, set budget and preferences, save a snapshot, then confirm it appears on /build-snapshots."
  },
  {
    title: "Review decision evolution",
    description:
      "Rename the snapshot, add notes, change status to Accepted or Rejected, favorite it, then inspect /activity."
  },
  {
    title: "Compare snapshots",
    description:
      "Save at least two generator snapshots, select them on /build-snapshots, then compare score changes."
  },
  {
    title: "Inspect ingestion dry run",
    description:
      "Open /sources to review local dry-run source health and normalized listing examples without live scraping."
  },
  {
    title: "Admin dry-run check",
    description:
      "If JETS_ADMIN_EMAILS and SUPABASE_SERVICE_ROLE_KEY are configured, open /admin/ingestion and persist a mock dry-run log."
  },
  {
    title: "Evidence review check",
    description:
      "Open /evidence, submit a pending evidence record, then use /evidence/review with admin/service-role setup to change its verification state."
  },
  {
    title: "Listing Intelligence check",
    description:
      "Open /listing-intelligence, submit a manual listing, then use /listing-intelligence/review with admin/service-role setup to review parsed fields."
  },
  {
    title: "Importer fixture check",
    description:
      "Open /admin/importer-fixtures, run a dry-run preview, then seed core demo listings with admin/service-role setup and open a created listing review page."
  }
] as const;

export const betaSmokeTests = [
  "Homepage loads in light and dark mode.",
  "Signup confirmation redirects to /auth/callback and then to /onboarding with a clear success message.",
  "Header shows whether the visitor is signed in, signed out, or missing Supabase setup.",
  "Signed-in onboarding can create the first hardware project and opens the new project detail page.",
  "/beta/smoke-test reflects the current signed-in project, snapshot, research, and audit state.",
  "Inventory filters, category sections, compare selection, save, and favorite controls remain usable.",
  "Build Generator saves a snapshot and restores it from /build-generator?snapshot=<id>.",
  "Saved builds, favorites, history, snapshots, and activity show project-first empty states.",
  "Snapshot rename, notes, favorite, status, restore, compare, and delete actions record audit events.",
  "Missing Supabase env vars show setup guidance rather than a broken page.",
  "Vercel production and preview deployments use the expected NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_VERCEL_URL metadata base.",
  "Supabase Site URL and redirect URLs are configured for local, production, and Vercel preview beta testing.",
  "Sources and admin ingestion remain dry-run only.",
  "Evidence review shows setup, public records, pending submissions, conflicts, and service-role moderation states.",
  "Listing Intelligence shows setup, demo fallback, manual listing submission, field review, duplicate signals, and service-role moderation states.",
  "Importer fixtures show setup, dry-run preview, validation errors, seed result table, and created listing review links.",
  "npm run build and npm run lint -- --max-warnings=0 pass."
] as const;
