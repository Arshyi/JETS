import type { Metadata } from "next";
import { MessageSquare } from "lucide-react";

import { ContentPage } from "@/components/pages/content-page";

export const metadata: Metadata = {
  title: "Beta Feedback",
  description:
    "Private beta feedback placeholder for JETS testers before a production feedback backend exists."
};

export default function FeedbackPage() {
  return (
    <ContentPage
      eyebrow="Private beta"
      title="Beta Feedback"
      description="A placeholder feedback surface for small beta sessions. This form is intentionally static until a production support workflow is planned."
    >
      <div className="grid gap-6 lg:grid-cols-[0.75fr_1fr]">
        <article className="rounded-lg border border-border bg-panel p-5">
          <MessageSquare className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">What to capture</h2>
          <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted">
            <li>Which workflow was tested.</li>
            <li>What felt confusing or fragile.</li>
            <li>Whether the recommendation explanation was understandable.</li>
            <li>Any accessibility, mobile, or setup issues.</li>
          </ul>
        </article>

        <form className="rounded-lg border border-border bg-panel p-5">
          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              Tester name
              <input
                type="text"
                className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                placeholder="Optional"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Area tested
              <select className="h-11 rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25">
                <option>Inventory</option>
                <option>Solution Builder</option>
                <option>Build Generator</option>
                <option>Snapshots</option>
                <option>Activity</option>
                <option>Setup</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">
              Feedback
              <textarea
                rows={6}
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25"
                placeholder="What happened, what you expected, and whether you could recover."
              />
            </label>
            <button
              type="button"
              disabled
              className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-muted opacity-70"
              title="Feedback submission is intentionally not wired in v1.0."
            >
              Submission disabled for v1.0
            </button>
          </div>
        </form>
      </div>
    </ContentPage>
  );
}
