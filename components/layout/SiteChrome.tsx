"use client";

import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export function SiteChrome({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--fm-bg)] text-[var(--fm-text)]">
      <Suspense fallback={null}>
        <SiteHeader />
      </Suspense>
      {children}
      <SiteFooter />
    </div>
  );
}
