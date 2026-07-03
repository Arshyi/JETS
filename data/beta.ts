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
      "Set NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, and JETS_ADMIN_EMAILS according to the beta workflow being tested."
  },
  {
    title: "Configure Supabase redirects",
    description:
      "Set the Supabase Site URL to the deployed app URL and allow the local, production, and Vercel preview redirect URLs before testing email confirmation."
  },
  {
    title: "Apply migrations in order",
    description:
      "Run the v0.3, v0.4, v0.8, v0.9, v2.1, v2.2, and v2.3 SQL migrations in Supabase before testing persistence."
  },
  {
    title: "Create a beta account",
    description: "Use /signup, then confirm the account according to the Supabase auth settings."
  },
  {
    title: "Run verification",
    description: "Run npm run build and npm run lint -- --max-warnings=0 before sharing a beta build."
  }
] as const;

export const betaDemoWorkflow = [
  {
    title: "Search and save",
    description:
      "Open /search, filter the local mock listings, save one build, favorite one build, then check /saved-builds and /favorites."
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
  }
] as const;

export const betaSmokeTests = [
  "Homepage loads in light and dark mode.",
  "Search filters, sorting, compare selection, save, and favorite controls remain usable.",
  "Build Generator saves a snapshot and restores it from /build-generator?snapshot=<id>.",
  "Saved builds, favorites, history, snapshots, and activity show friendly empty states.",
  "Snapshot rename, notes, favorite, status, restore, compare, and delete actions record audit events.",
  "Missing Supabase env vars show setup guidance rather than a broken page.",
  "Vercel production and preview deployments use the expected NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_VERCEL_URL metadata base.",
  "Supabase Site URL and redirect URLs are configured for local, production, and Vercel preview beta testing.",
  "Sources and admin ingestion remain dry-run only.",
  "npm run build and npm run lint -- --max-warnings=0 pass."
] as const;
