import type { Metadata } from "next";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ThemeScript } from "@/components/layout/theme-script";
import { siteConfig } from "@/config/site";
import { getAuthContext } from "@/lib/supabase/session";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} | ${siteConfig.fullName}`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url)
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthContext();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground">
        <ThemeScript />
        <div className="flex min-h-screen flex-col">
          <SiteHeader
            auth={{
              displayName: auth.profile?.display_name,
              email: auth.user?.email,
              isConfigured: auth.isConfigured,
              isSignedIn: Boolean(auth.user)
            }}
          />
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
