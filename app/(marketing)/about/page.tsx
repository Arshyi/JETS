import type { Metadata } from "next";

import { ContentPage } from "@/components/pages/content-page";

export const metadata: Metadata = {
  title: "About",
  description: "Learn how JETS helps users reason about used hardware value and risk."
};

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About JETS"
      title="A hardware decision engine, not a store."
      description="JETS exists to help people make better used hardware decisions by comparing value, performance, reliability, risk, and upgrade potential."
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {[
          [
            "Why",
            "Used hardware can be a great value, but the best choice is rarely obvious from price alone."
          ],
          [
            "How",
            "The product will grow from mock/demo inventory and saved research into compliant marketplace ingestion and transparent solution ranking."
          ],
          [
            "Principle",
            "Every recommendation should eventually show its work so users understand both the value and the tradeoffs."
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
