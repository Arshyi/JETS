import type { Metadata } from "next";

import { ContentPage } from "@/components/pages/content-page";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Private beta privacy placeholder for JETS account-backed persistence."
};

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Policy placeholder"
      title="Privacy"
      description="This placeholder explains the private beta data posture while leaving room for a reviewed policy before public launch."
    >
      <div className="grid gap-4">
        {[
          [
            "Current state",
            "Version 1.0 uses Supabase-backed accounts and persistence for beta testing. It does not implement live scraping, checkout, analytics, or AI requests."
          ],
          [
            "Future state",
            "Before public launch, this page should be rewritten to describe collected data, retention, deletion, and user controls."
          ],
          [
            "Product standard",
            "JETS should collect only the data needed to deliver the feature a user asked for and should explain that plainly."
          ]
        ].map(([title, body]) => (
          <article key={title} className="rounded-lg border border-border bg-panel p-5">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
          </article>
        ))}
      </div>
    </ContentPage>
  );
}
