import { ContentPage } from "@/components/pages/content-page";

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Policy placeholder"
      title="Privacy"
      description="This v0.1 placeholder explains the current state of the app while leaving room for a full policy when accounts and persistence are introduced."
    >
      <div className="grid gap-4">
        {[
          [
            "Current state",
            "Version 0.1 does not implement accounts, databases, scraping, analytics, or AI requests."
          ],
          [
            "Future state",
            "When Supabase authentication and saved builds arrive, this page should be rewritten to describe collected data, retention, deletion, and user controls."
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
