import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { ProductPriorityEnvSnapshot } from "@/lib/rollout/scaleRollout";
import type { Locale } from "@/lib/i18n/locales";

export function SiteChrome({
  children,
  locale,
  productPriority,
}: {
  children: ReactNode;
  locale: Locale;
  productPriority: ProductPriorityEnvSnapshot;
}) {
  return (
    <div className="fm-page-background min-h-screen text-[var(--fm-text)]">
      <Suspense fallback={null}>
        <SiteHeader productPriority={productPriority} />
      </Suspense>
      {children}
      <SiteFooter locale={locale} />
    </div>
  );
}
