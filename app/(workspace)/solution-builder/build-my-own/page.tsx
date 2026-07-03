import type { Metadata } from "next";

import { BuildWorkspaceExperience } from "@/components/solution-builder/build-workspace-experience";
import { getBuildWorkspaceModel } from "@/lib/solution-builder/workspace";

export const metadata: Metadata = {
  title: "Build My Own",
  description:
    "Create a slot-based JETS hardware project and validate compatibility, completion, platform health, and upgrade path."
};

export default function BuildMyOwnPage() {
  const model = getBuildWorkspaceModel();

  return <BuildWorkspaceExperience model={model} />;
}
