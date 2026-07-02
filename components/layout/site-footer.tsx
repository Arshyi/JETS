import Link from "next/link";

import { Logo } from "@/components/layout/logo";
import { footerNav, siteConfig, workspaceNav } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-panel">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div className="max-w-md">
          <Logo />
          <p className="mt-4 text-sm leading-6 text-muted">
            {siteConfig.description}
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Workspace</h2>
          <div className="mt-4 grid gap-2">
            {workspaceNav.slice(0, 4).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold">Company</h2>
          <div className="mt-4 grid gap-2">
            {footerNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition hover:text-foreground"
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
