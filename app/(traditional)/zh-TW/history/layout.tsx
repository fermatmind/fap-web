import HistoryLanguageLinks from "@/app/(localized)/[locale]/(app)/history/HistoryLanguageLinks";
import { Suspense, type ReactNode } from "react";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";

export const metadata = { robots: NOINDEX_ROBOTS };
export const dynamic = "force-dynamic";

export default function TraditionalHistoryLayout({ children }: { children: ReactNode }) {
  return <LocaleProvider locale="zh">
    <Suspense fallback={null}><HistoryLanguageLinks /></Suspense>
    {children}
  </LocaleProvider>;
}
