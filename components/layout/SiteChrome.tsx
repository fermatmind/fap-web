"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

function isImmersivePath(pathname: string): boolean {
  return (
    /^\/tests\/[^/]+\/take\/?$/.test(pathname) ||
    /^\/test\/[^/]+\/take\/?$/.test(pathname)
  );
}

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";

  if (isImmersivePath(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  );
}
