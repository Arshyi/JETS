import type {
  FeatureCard,
  NavItem,
  PlaceholderPageContent,
  RoadmapMilestone
} from "@/types/navigation";

export const siteConfig = {
  name: "JETS",
  fullName: "Just Enough Tech Solutions",
  description:
    "An AI-assisted hardware decision engine for finding better value in used PCs, laptops, workstations, servers, and components.",
  url: "https://jets.local"
};

export const mainNav: NavItem[] = [
  { title: "Home", href: "/" },
  { title: "Generator", href: "/build-generator", status: "v0.7" },
  { title: "Search", href: "/search", status: "v0.5" },
  { title: "Account", href: "/account", status: "v0.3" },
  { title: "Compatibility", href: "/compatibility", status: "v0.6" },
  { title: "Sources", href: "/sources", status: "v0.4" },
  { title: "Roadmap", href: "/roadmap" },
  { title: "About", href: "/about" }
];

export const workspaceNav: NavItem[] = [
  {
    title: "Build Generator",
    href: "/build-generator",
    description: "Complete recommendation workflow powered by deterministic decision and compatibility engines.",
    status: "v0.7"
  },
  {
    title: "Search",
    href: "/search",
    description: "Mock search with deterministic scoring and ranking explanations.",
    status: "v0.5"
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
    status: "Now",
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
    status: "Next",
    description:
      "Persist generated build recommendations so users can compare and annotate decisions over time.",
    items: [
      "Saved generator runs",
      "Recommendation snapshots",
      "User notes and decision outcomes",
      "Snapshot comparison"
    ]
  }
];

export const placeholderPages = {
  search: {
    eyebrow: "Future search workspace",
    title: "Search",
    description:
      "The search page is reserved for the v0.2 dummy data workflow: query input, filters, ranking controls, and listing results.",
    planned: [
      "Marketplace-style listing cards",
      "Filters for budget, form factor, CPU, GPU, memory, storage, and location",
      "Sort modes for value, performance, age, and upgrade potential"
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
