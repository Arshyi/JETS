import type { Metadata } from "next";

import { SolutionBuilderOverview } from "@/components/solution-builder/solution-builder-overview";
import { solutionBuilderServiceDependencies } from "@/data/solution-builder";

export const metadata: Metadata = {
  title: "Solution Builder",
  description:
    "JETS Hardware Solution Builder with Build My Own and Let JETS Recommend workflows."
};

export default function SolutionBuilderPage() {
  return <SolutionBuilderOverview services={solutionBuilderServiceDependencies} />;
}
