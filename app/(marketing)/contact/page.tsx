import { Mail, MessageSquare, Wrench } from "lucide-react";

import { ContentPage } from "@/components/pages/content-page";

const contactItems = [
  {
    title: "General contact",
    body: "A real support address or contact form can be added when the product is ready for external users.",
    icon: Mail
  },
  {
    title: "Feature ideas",
    body: "New ideas should be captured in docs/vision.md before they become tickets or implementation work.",
    icon: MessageSquare
  },
  {
    title: "Technical help",
    body: "Technician recommendations and service workflows belong in the long-term vision until their milestone is planned.",
    icon: Wrench
  }
];

export default function ContactPage() {
  return (
    <ContentPage
      eyebrow="Contact placeholder"
      title="Contact"
      description="This page reserves the future communication surface without adding a backend, form handler, or support workflow in v0.1."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        {contactItems.map((item) => {
          const Icon = item.icon;

          return (
            <article key={item.title} className="rounded-lg border border-border bg-panel p-5">
              <Icon className="h-5 w-5 text-accent-strong dark:text-accent" aria-hidden="true" />
              <h2 className="mt-4 text-lg font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{item.body}</p>
            </article>
          );
        })}
      </div>
    </ContentPage>
  );
}
