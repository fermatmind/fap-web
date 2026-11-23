import { Suspense, type ReactNode } from "react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { DeferredSiteHeader } from "@/components/layout/DeferredSiteHeader";
import type { ProductPriorityEnvSnapshot } from "@/lib/rollout/scaleRollout";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { AssessmentSiteFrame } from "@/components/quiz/AssessmentSiteFrame";

export function SiteChrome({
  children,
  locale,
  productPriority,
  allowWebViewImageStyles,
}: {
  children: ReactNode;
  locale: DisplayLocale;
  productPriority: ProductPriorityEnvSnapshot;
  allowWebViewImageStyles?: boolean;
}) {
  return (
    <AssessmentSiteFrame
      locale={locale}
      header={<Suspense fallback={null}><DeferredSiteHeader locale={locale} productPriority={productPriority} /></Suspense>}
      footer={<SiteFooter locale={locale} allowWebViewImageStyles={allowWebViewImageStyles} />}
    >
      {children}
    </AssessmentSiteFrame>
  );
}
