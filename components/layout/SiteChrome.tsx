"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { stripLocalePrefix } from "@/lib/i18n/locales";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { isCookieSuppressedPath } from "@/components/layout/siteChromeRules";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = stripLocalePrefix(usePathname() ?? "");
  const shouldShowCookie = !isCookieSuppressedPath(pathname);

  return (
    <div className="min-h-screen bg-[var(--fm-bg)] text-[var(--fm-text)]">
      <SiteHeader />
      {children}
      <SiteFooter />
      {shouldShowCookie ? <CookieBanner /> : null}
    </div>
  );
}
