import type {
  FeatureCard,
  NavItem,
  PlaceholderPageContent,
  RoadmapMilestone
} from "@/types/navigation";

function toAbsoluteSiteUrl(value: string | undefined) {
  if (!value) {
    return null;
  }

  const candidate = value.startsWith("http") ? value : `https://${value}`;

  try {
    return new URL(candidate).origin;
  } catch {
    return null;
  }
}

const deployedSiteUrl =
  toAbsoluteSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
  toAbsoluteSiteUrl(process.env.NEXT_PUBLIC_VERCEL_URL) ??
  "https://jets.local";

export const siteConfig = {
  name: "JETS",
  fullName: "Just Enough Tech Solutions",
  description:
    "A hardware solution builder for planning, validating, and comparing complete used-hardware paths.",
  url: deployedSiteUrl
};

export const mainNav: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Acquire", href: "/acquire" },
  { title: "Strategy", href: "/strategy" },
  { title: "Projects", href: "/solution-builder/projects" },
  { title: "Builder", href: "/solution-builder" },
  { title: "Inventory", href: "/inventory" },
  { title: "Account", href: "/account" }
];

export const workspaceNav: NavItem[] = [
  {
    title: "Acquire Hardware",
    href: "/acquire",
    description: "Manual listing capture workflow for evaluating hardware before it becomes a project.",
    status: "v4.0"
  },
  {
    title: "Strategy Engine",
    href: "/strategy",
    description: "Deterministic pre-project strategy comparison for build, buy, repair, upgrade, or walk-away decisions.",
    status: "v4.3"
  },
  {
    title: "Solution Builder",
    href: "/solution-builder",
    description: "Problem-first v2 workspace with Build My Own and Let JETS Recommend modes.",
    status: "v2.0"
  },
  {
    title: "Build Projects",
    href: "/solution-builder/projects",
    description: "Persisted slot projects with component-aware inventory, validation, notes, and audit history.",
    status: "v2.1"
  },
  {
    title: "Build My Own Preview",
    href: "/solution-builder/build-my-own",
    description: "Static slot-based architecture preview retained from v2.0.",
    status: "v2.0"
  },
  {
    title: "Let JETS Recommend",
    href: "/solution-builder/recommend",
    description: "Recommendation workflow that synthesizes complete solution paths from shared services.",
    status: "v2.0"
  },
  {
    title: "Build Generator",
    href: "/build-generator",
    description: "Supporting deterministic recommendation service used by Solution Builder.",
    status: "service"
  },
  {
    title: "Build Snapshots",
    href: "/build-snapshots",
    description: "Persisted generator decisions with restore, compare, notes, activity, and outcome states.",
    status: "v0.9"
  },
  {
    title: "Decision Activity",
    href: "/activity",
    description: "Unified audit timeline for saved builds, favorites, snapshots, notes, and decision outcomes.",
    status: "v0.9"
  },
  {
    title: "Evidence Review",
    href: "/evidence",
    description: "Provenance, verification, conflicts, and moderation state for JETS knowledge claims.",
    status: "v3.2"
  },
  {
    title: "Listing Intelligence",
    href: "/listing-intelligence",
    description: "Normalized listing review, parsed field corrections, duplicate signals, and recommendation readiness.",
    status: "v3.3"
  },
  {
    title: "Post-Auth Onboarding",
    href: "/onboarding",
    description: "Signed-in first-run page for creating the first hardware project and testing persistence.",
    status: "beta"
  },
  {
    title: "Private Beta",
    href: "/beta",
    description: "Onboarding, setup checklist, demo workflow, and smoke-test guidance for v1.0 beta sessions.",
    status: "v1.0"
  },
  {
    title: "Beta Smoke Test",
    href: "/beta/smoke-test",
    description: "Signed-in checklist for auth, project persistence, snapshots, activity, and session recovery.",
    status: "beta"
  },
  {
    title: "Beta Feedback",
    href: "/feedback",
    description: "Static feedback placeholder for private beta testers.",
    status: "v1.0"
  },
  {
    title: "Inventory",
    href: "/inventory",
    description: "Shared mock/demo inventory service for slot searches, comparison, saves, and favorites.",
    status: "service"
  },
  {
    title: "Legacy Search URL",
    href: "/search",
    description: "Backward-compatible alias that now renders the Inventory experience.",
    status: "alias"
  },
  {
    title: "Saved Builds",
    href: "/saved-builds",
    description: "Supabase-backed collection of saved mock hardware plans.",
    status: "v0.3"
  },
  {
    title: "Favorites",
    href: "/favorites",
    description: "Supabase-backed shortlist of listings and components.",
    status: "v0.3"
  },
  {
    title: "History",
    href: "/history",
    description: "Supabase-backed research trail for saved and favorited items.",
    status: "v0.3"
  },
  {
    title: "Compare",
    href: "/compare",
    description: "Side-by-side comparison for selected mock listings.",
    status: "v0.2"
  },
  {
    title: "Compatibility",
    href: "/compatibility",
    description: "Deterministic hardware fit, power, thermal, memory, storage, and upgrade checks.",
    status: "v0.6"
  },
  {
    title: "Sources",
    href: "/sources",
    description: "Dry-run marketplace source health, freshness, and duplicate checks.",
    status: "v0.4"
  },
  {
    title: "Admin Ingestion",
    href: "/admin/ingestion",
    description: "Admin-only dry-run controls for mock source adapters.",
    status: "v0.4"
  },
  {
    title: "Importer Fixtures",
    href: "/admin/importer-fixtures",
    description: "Admin-only fixture validation, dry-run preview, and demo listing seeding for Listing Intelligence.",
    status: "v3.4"
  },
  {
    title: "Settings",
    href: "/settings",
    description: "Supabase-backed user, theme, and preference controls.",
    status: "v0.3"
  }
];

export const footerNav: NavItem[] = [
  { title: "Privacy", href: "/privacy" },
  { title: "Terms", href: "/terms" },
  { title: "Contact", href: "/contact" },
  { title: "Beta", href: "/beta" },
  { title: "Feedback", href: "/feedback" },
  { title: "Account", href: "/account" },
  { title: "Roadmap", href: "/roadmap" }
];

export const featureCards: FeatureCard[] = [
  {
    title: "Value-first discovery",
    description:
      "Designed for finding the machine or component that makes the most sense after price, performance, age, upgrade path, and risk are considered.",
    icon: "search"
  },
  {
    title: "Transparent rankings",
    description:
      "Rankings expose score breakdowns and why-this-ranks notes instead of hiding the reasoning behind a black box score.",
    icon: "ranking"
  },
  {
    title: "Compatibility aware",
    description:
      "The architecture leaves room for later checks around platforms, power, memory, storage, GPU fit, thermals, and operating system support.",
    icon: "compatibility"
  },
  {
    title: "Milestone discipline",
    description:
      "Ideas go into docs/vision.md until the current version is ready. That keeps the product ambitious without letting scope drift run the project.",
    icon: "guardrails"
  }
];

export const roadmap: RoadmapMilestone[] = [
  {
    version: "0.1",
    title: "Foundation",
    status: "Done",
    description:
      "Built the durable shell: routes, layout, theme, docs, and placeholder pages.",
    items: [
      "Responsive homepage, navigation, and footer",
      "Light and dark mode",
      "Roadmap, about, privacy, terms, and contact pages",
      "Future workspace placeholders"
    ]
  },
  {
    version: "0.2",
    title: "Search experience",
    status: "Done",
    description:
      "Search, filter, rank, and compare local mock hardware listings only.",
    items: [
      "Typed mock marketplace listings",
      "Budget, use case, form factor, condition, and location filters",
      "Ranking cards with value, performance, reliability, aesthetic, and upgrade scores",
      "Compare selection using URL query params",
      "No scraping and no real accounts"
    ]
  },
  {
    version: "0.3",
    title: "Accounts and saved builds",
    status: "Done",
    description:
      "Connect Supabase-ready auth, saved builds, favorites, history, and settings.",
    items: [
      "Supabase authentication",
      "Saved builds and favorites persistence",
      "Build history with clear action",
      "User settings",
      "Graceful setup states when Supabase env vars are missing"
    ]
  },
  {
    version: "0.4",
    title: "Ingestion foundation",
    status: "Done",
    description:
      "Create source adapters, normalized listing contracts, dry-run logs, and compliance boundaries without live scraping.",
    items: [
      "Mock adapters for Dubizzle, Amazon.ae, Computer Plaza, and Manual Upload",
      "Normalized listing schema",
      "Freshness and duplicate detection utilities",
      "Admin-only dry-run logs",
      "Rate limit and compliance documentation"
    ]
  },
  {
    version: "0.5",
    title: "Decision engine",
    status: "Done",
    description:
      "Rank hardware with transparent deterministic scoring before adding AI assistance.",
    items: [
      "Use-case presets including homelab",
      "Performance, value, reliability, risk, freshness, upgrade, aesthetic, shipping, and fit scores",
      "Weight-class assignment",
      "Why-this-ranks explanations",
      "Deterministic validation fixtures"
    ]
  },
  {
    version: "0.6",
    title: "Compatibility review",
    status: "Done",
    description:
      "Evaluate physical, electrical, thermal, memory, storage, BIOS, platform, and upgrade compatibility with deterministic rules.",
    items: [
      "CPU and motherboard compatibility",
      "GPU PCIe, length, height, and thickness checks",
      "PSU wattage and connector checks",
      "RAM and storage expansion checks",
      "Thermal risk, airflow, BIOS risk, and platform age indicators"
    ]
  },
  {
    version: "0.7",
    title: "Build generator",
    status: "Done",
    description:
      "Generate complete hardware recommendations from mock listings using deterministic decision and compatibility engines.",
    items: [
      "Budget, country, currency, use-case, preference, and owned-gear inputs",
      "Best overall, value, performance, engineering, AI, gaming, workstation, and sleeper recommendations",
      "Why-this-build explanations",
      "Closest alternatives",
      "Setup cost, shipping weight, lifetime, risk, platform health, and compatibility metrics"
    ]
  },
  {
    version: "0.8",
    title: "Decision snapshots",
    status: "Done",
    description:
      "Persist generated build recommendations so users can compare and annotate decisions over time.",
    items: [
      "Saved generator runs",
      "Recommendation snapshots with preserved inputs, scores, and explanations",
      "Accepted, rejected, purchased, and archived outcome states",
      "Snapshot restore and comparison"
    ]
  },
  {
    version: "0.9",
    title: "Decision audit foundation",
    status: "Done",
    description:
      "Create durable audit trails and shared event models before expanding more user workflows.",
    items: [
      "Shared activity/event schema",
      "Snapshot and saved-build notes",
      "Per-snapshot activity",
      "Account and activity timelines"
    ]
  },
  {
    version: "1.0",
    title: "Private beta hardening",
    status: "Done",
    description:
      "Prepare the current deterministic product for a small real-user beta before adding AI or live scraping.",
    items: [
      "End-to-end Supabase migration rehearsal",
      "Error handling and analytics baseline",
      "Accessibility and responsive QA",
      "Seeded beta data and user onboarding"
    ]
  },
  {
    version: "2.0",
    title: "Solution Builder redesign",
    status: "Done",
    description:
      "Redesign JETS around solving hardware problems with two distinct workflows and shared service infrastructure.",
    items: [
      "Build My Own slot-based project workspace",
      "Let JETS Recommend recommendation workflow",
      "Search repositioned as inventory",
      "Decision, compatibility, snapshots, audit, and sources reused across workflows"
    ]
  },
  {
    version: "2.1",
    title: "Project persistence and slot inventory",
    status: "Done",
    description:
      "Persist user-created build projects and mature inventory from listing-level mock data toward component-aware slot candidates.",
    items: [
      "Supabase build project, slot, note, and audit tables",
      "Slot save and clear workflow",
      "Component-aware mock inventory",
      "Compare saved project against generated JETS solutions"
    ]
  },
  {
    version: "2.2",
    title: "Optimization Engine Foundation",
    status: "Done",
    description:
      "Analyze user-built projects, respect locked slots, and propose deterministic improvements before comparison.",
    items: [
      "Optimization goals and depth controls",
      "Locked-slot optimization runs",
      "Persisted suggestions and score deltas",
      "Explainable Build -> Analyze -> Optimize -> Compare flow"
    ]
  },
  {
    version: "2.3",
    title: "Project Branching & Optimization Workspace",
    status: "Now",
    description:
      "Treat hardware ideas like branches so optimization can create safe project variants without mutating the original.",
    items: [
      "Manual project branches",
      "Optimized branches from selected suggestions",
      "Parent/root branch lineage",
      "Branch workspace on project detail"
    ]
  },
  {
    version: "2.4",
    title: "Branch comparison and merge preview",
    status: "Next",
    description:
      "Compare project branches, inspect slot-level diffs, and preview merge-style changes before applying them.",
    items: [
      "Branch diff viewer",
      "Original vs optimized score comparison",
      "Merge preview for slot changes",
      "Rollback and branch audit events"
    ]
  }
];

export const placeholderPages = {
  search: {
    eyebrow: "Inventory support workspace",
    title: "Inventory",
    description:
      "Inventory is the supporting surface for project slots, component candidates, adapters, base systems, and mock listings.",
    planned: [
      "Category-grouped inventory cards",
      "Slot-driven component filters",
      "Future live ingestion after compliance and quality gates"
    ]
  },
  savedBuilds: {
    eyebrow: "Future authenticated workspace",
    title: "Saved Builds",
    description:
      "Saved builds will become the place where signed-in users keep complete hardware plans and candidate configurations.",
    planned: [
      "Build summaries",
      "Component lists",
      "Notes and decision history"
    ]
  },
  favorites: {
    eyebrow: "Future shortlist",
    title: "Favorites",
    description:
      "Favorites will hold listings, parts, and sellers that users want to revisit during research.",
    planned: [
      "Favorite listing cards",
      "Availability state",
      "Saved search context"
    ]
  },
  history: {
    eyebrow: "Future research trail",
    title: "History",
    description:
      "History will help users retrace searches, comparisons, and decisions without starting from zero.",
    planned: [
      "Recent searches",
      "Viewed listings",
      "Comparison snapshots"
    ]
  },
  compare: {
    eyebrow: "Future decision table",
    title: "Compare",
    description:
      "Compare will become the side-by-side view for weighing multiple machines, components, or builds.",
    planned: [
      "Comparison columns",
      "Normalized specs",
      "Value and risk score rows"
    ]
  },
  settings: {
    eyebrow: "Future preferences",
    title: "Settings",
    description:
      "Settings is reserved for account preferences, search defaults, notification choices, and theme behavior.",
    planned: [
      "Profile preferences",
      "Default budget and location",
      "Theme and accessibility options"
    ]
  }
} satisfies Record<string, PlaceholderPageContent>;
