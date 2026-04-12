"use client";

import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { ProductPriorityEnvSnapshot } from "@/lib/rollout/scaleRollout";

export function SiteChrome({
  children,
  productPriority,
}: {
  children: ReactNode;
  productPriority: ProductPriorityEnvSnapshot;
}) {
  return (
    <div className="min-h-screen bg-[var(--fm-bg)] text-[var(--fm-text)]">
      <Suspense fallback={null}>
        <SiteHeader productPriority={productPriority} />
      </Suspense>
      {children}
      <SiteFooter />
    </div>
  );
}
