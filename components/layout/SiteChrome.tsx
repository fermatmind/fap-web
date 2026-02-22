"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { stripLocalePrefix } from "@/lib/i18n/locales";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

function isImmersivePath(pathname: string): boolean {
  if (pathname.startsWith("/result/")) return true;
  if (pathname.startsWith("/share/")) return true;
  if (pathname.startsWith("/orders/")) return true;

  const isTestsTake = pathname.startsWith("/tests/") && pathname.includes("/take");
  const isLegacyTestTake = pathname.startsWith("/test/") && pathname.includes("/take");

  return isTestsTake || isLegacyTestTake;
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = stripLocalePrefix(usePathname() ?? "");

  if (isImmersivePath(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen text-[var(--fm-text)]">
      <SiteHeader />
      {children}
      <SiteFooter />
      <CookieBanner />
    </div>
  );
}
