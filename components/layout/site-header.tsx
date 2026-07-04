"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { StatusPill } from "@/components/ui/status-pill";
import { mainNav, workspaceNav } from "@/config/site";
import { cn } from "@/lib/utils";

export type HeaderAuthState = {
  displayName?: string | null;
  email?: string | null;
  isConfigured: boolean;
  isSignedIn: boolean;
};

function getAuthLabel(auth: HeaderAuthState) {
  if (!auth.isConfigured) {
    return "Auth setup";
  }

  if (!auth.isSignedIn) {
    return "Sign in";
  }

  return auth.displayName ?? auth.email ?? "Account";
}

export function SiteHeader({ auth }: { auth: HeaderAuthState }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const authLabel = getAuthLabel(auth);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/92 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted transition hover:bg-subtle hover:text-foreground",
                pathname === item.href && "bg-subtle text-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href={auth.isConfigured ? (auth.isSignedIn ? "/account" : "/login") : "/beta/setup"}
            className={cn(
              "hidden max-w-48 items-center gap-2 rounded-lg border border-border bg-panel px-3 py-2 text-sm font-semibold transition hover:bg-subtle focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background sm:inline-flex",
              auth.isSignedIn ? "text-foreground" : "text-muted"
            )}
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                auth.isSignedIn ? "bg-accent" : "bg-warning"
              )}
              aria-hidden="true"
            />
            <span className="truncate">
              {auth.isSignedIn ? `Signed in as ${authLabel}` : authLabel}
            </span>
          </Link>
          <ThemeToggle />
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-lg border border-border bg-panel text-muted transition hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background md:hidden"
            onClick={() => setIsOpen((value) => !value)}
            aria-label="Toggle navigation"
            aria-expanded={isOpen}
          >
            {isOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2" aria-label="Mobile navigation">
            <Link
              href={auth.isConfigured ? (auth.isSignedIn ? "/account" : "/login") : "/beta/setup"}
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between rounded-lg border border-border bg-panel px-3 py-3 text-sm font-medium text-muted hover:bg-subtle hover:text-foreground"
            >
              {auth.isSignedIn ? `Signed in as ${authLabel}` : authLabel}
              <StatusPill
                tone={
                  auth.isSignedIn ? "accent" : auth.isConfigured ? "neutral" : "warning"
                }
              >
                {auth.isSignedIn ? "active" : auth.isConfigured ? "signed out" : "setup"}
              </StatusPill>
            </Link>

            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium text-muted hover:bg-subtle hover:text-foreground",
                  pathname === item.href && "bg-subtle text-foreground"
                )}
              >
                {item.title}
                {item.status ? <StatusPill>{item.status}</StatusPill> : null}
              </Link>
            ))}

            <div className="mt-3 border-t border-border pt-3">
              <p className="px-3 pb-2 text-xs font-semibold uppercase text-muted">
                Future workspace
              </p>
              <div className="grid gap-1">
                {workspaceNav
                  .filter((item) => !mainNav.some((nav) => nav.href === item.href))
                  .map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-3 text-sm text-muted hover:bg-subtle hover:text-foreground"
                    >
                      {item.title}
                      {item.status ? <StatusPill>{item.status}</StatusPill> : null}
                    </Link>
                  ))}
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
