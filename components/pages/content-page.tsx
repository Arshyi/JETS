type ContentPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function ContentPage({ eyebrow, title, description, children }: ContentPageProps) {
  return (
    <main className="bg-background">
      <section className="border-b border-border bg-panel">
        <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase text-accent-strong dark:text-accent">
            {eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            {description}
          </p>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {children}
      </section>
    </main>
  );
}
