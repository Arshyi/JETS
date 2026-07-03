import type { Metadata } from "next";
import { Suspense } from "react";

import { CompareExperience } from "@/components/search/compare-experience";
import { LoadingState } from "@/components/states/loading-state";

export const metadata: Metadata = {
  title: "Compare",
  description: "Compare selected JETS mock listings side by side."
};

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <LoadingState title="Preparing comparison" />
        </main>
      }
    >
      <CompareExperience />
    </Suspense>
  );
}
