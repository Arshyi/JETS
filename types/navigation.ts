export type NavItem = {
  title: string;
  href: string;
  description?: string;
  status?: string;
};

export type FeatureIcon = "search" | "ranking" | "compatibility" | "guardrails";

export type FeatureCard = {
  title: string;
  description: string;
  icon: FeatureIcon;
};

export type RoadmapStatus = "Done" | "Now" | "Next" | "Later";

export type RoadmapMilestone = {
  version: string;
  title: string;
  status: RoadmapStatus;
  description: string;
  items: string[];
};

export type PlaceholderPageContent = {
  eyebrow: string;
  title: string;
  description: string;
  planned: string[];
};
