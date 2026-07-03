import type { Metadata } from "next";

import { ContentPage } from "@/components/pages/content-page";

export const metadata: Metadata = {
  title: "Terms",
  description: "Private beta terms placeholder for JETS."
};

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Terms placeholder"
      title="Terms"
      description="This page is a plain-language private beta placeholder and should be replaced with reviewed terms before public launch."
    >
      <div className="grid gap-4">
        {[
          [
            "No production recommendations yet",
            "Version 1.0 is a private beta and does not provide live marketplace analysis, checkout, or purchase advice."
          ],
          [
            "Future marketplace data",
            "When ingestion is added, source compliance, data freshness, and user-facing limitations should be documented clearly."
          ],
          [
            "Future AI assistance",
            "Decision support should be presented as guidance, not as a guarantee about listing quality, seller behavior, compatibility, or price."
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
