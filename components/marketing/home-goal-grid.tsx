import {
  Boxes,
  BrainCircuit,
  BriefcaseBusiness,
  ClipboardCheck,
  Compass,
  Gamepad2,
  History,
  Server,
  Wrench
} from "lucide-react";
import Link from "next/link";

import {
  projectGoalTemplates,
  type ProjectGoalId,
  type ProjectGoalTemplate
} from "@/data/project-goals";

type HomeGoalGridProps = {
  recentProjectHref?: string | null;
};

const homeGoalIds: ProjectGoalId[] = [
  "gaming-pc",
  "cad-engineering-workstation",
  "upgrade-existing-computer",
  "home-server"
];

const goalIcons: Record<ProjectGoalId, typeof Gamepad2> = {
  "ai-workstation": BrainCircuit,
  "cad-engineering-workstation": Wrench,
  "custom-project": Wrench,
  "gaming-pc": Gamepad2,
  "home-server": Server,
  "office-pc": BriefcaseBusiness,
  "upgrade-existing-computer": Wrench
};

export function HomeGoalGrid({ recentProjectHref }: HomeGoalGridProps) {
  const goals = homeGoalIds
    .map((goalId) => projectGoalTemplates.find((template) => template.id === goalId))
    .filter((goal): goal is ProjectGoalTemplate => Boolean(goal));
  const supportCards = [
    {
      description:
        "Paste a real listing by hand, preview parsed fields, correct missing facts, compare purchase candidates, and decide whether to create a project.",
      href: "/acquire",
      icon: ClipboardCheck,
      title: "Acquire Hardware"
    },
    {
      description:
        "Compare build, buy, repair, upgrade, hybrid, and wait paths before you create a project.",
      href: "/strategy",
      icon: Compass,
      title: "Compare Strategies"
    },
    {
      description:
        "Use category-grouped mock/demo inventory when you need a component, base system, adapter, or complete system.",
      href: "/inventory",
      icon: Boxes,
      title: "Browse Inventory"
    },
    {
      description: recentProjectHref
        ? "Continue the most recently updated project."
        : "Sign in and open the project dashboard to continue your work.",
      href: recentProjectHref ?? "/solution-builder/projects",
      icon: History,
      title: "Resume Recent Project"
    }
  ];

  return (
    <section className="border-b border-border bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
          Hardware Solution Builder
        </p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
          What hardware are you evaluating today?
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
          Capture a listing, review what JETS can infer, then turn promising
          hardware into a project. The builder, inventory, validation,
          optimization, and branching systems now support the acquisition
          decision instead of asking you to reason alone.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal) => {
            const Icon = goalIcons[goal.id];

            return (
              <Link
                key={goal.id}
                href={`/solution-builder/projects/new?goal=${goal.id}`}
                className="rounded-lg border border-border bg-panel p-5 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                <Icon className="h-6 w-6 text-accent-strong dark:text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold">{goal.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {goal.description}
                </p>
              </Link>
            );
          })}

          {supportCards.map((card) => {
            const Icon = card.icon;

            return (
              <Link
                key={card.title}
                href={card.href}
                className="rounded-lg border border-border bg-panel p-5 transition hover:border-accent focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
              >
                <Icon className="h-6 w-6 text-accent-strong dark:text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-semibold">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {card.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
