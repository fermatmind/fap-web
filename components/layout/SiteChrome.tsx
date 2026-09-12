import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { ProductPriorityEnvSnapshot } from "@/lib/rollout/scaleRollout";
import type { Locale } from "@/lib/i18n/locales";
import { AssessmentSiteFrame } from "@/components/quiz/AssessmentSiteFrame";

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
    <AssessmentSiteFrame
      locale={locale}
      header={<Suspense fallback={null}><SiteHeader productPriority={productPriority} /></Suspense>}
      footer={<SiteFooter locale={locale} />}
    >
      {children}
    </AssessmentSiteFrame>
  );
}
