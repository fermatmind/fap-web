import type { Metadata } from "next";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { siteFontClassName } from "@/components/layout/siteFonts";
import { createProductPriorityEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { SITE_URL, isConfiguredStagingSiteUrl } from "@/lib/site";
import "../../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "費馬測試 — 繁體中文", template: "%s | 費馬測試" },
  robots: isConfiguredStagingSiteUrl() ? { index: false, follow: false } : undefined,
};

export default function TraditionalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body className={siteFontClassName}>
        <LocaleProvider locale="zh">
          <SiteChrome locale="zh-TW" productPriority={createProductPriorityEnvSnapshot()}>
            {children}
          </SiteChrome>
        </LocaleProvider>
      </body>
    </html>
  );
}
