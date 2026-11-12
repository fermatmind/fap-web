import type { Metadata } from "next";
import { siteFontClassName } from "@/components/layout/siteFonts";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { Providers } from "@/app/providers";
import { createProductPriorityEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { SITE_URL, canonicalUrl, isConfiguredStagingSiteUrl } from "@/lib/site";
import "../globals.css";
import "../mbti-career-cta.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "费马测试 — 免费人格测评、职业测试与智商检测 | FermatMind",
    template: "%s | FermatMind",
  },
  description:
    "科学的人格测评平台。MBTI十六型人格测试、大五人格、九型人格、智商测试、职业兴趣测评。获取详细分析报告和个性化职业推荐。免费在线测试。",
  robots: isConfiguredStagingSiteUrl()
    ? {
        index: false,
        follow: false,
        nocache: true,
      }
    : undefined,
  alternates: {
    canonical: "/",
    languages: {
      en: canonicalUrl("/en"),
      "zh-CN": canonicalUrl("/"),
      "x-default": canonicalUrl("/"),
    },
  },
};

export default async function RootRouteLayout({ children }: { children: ReactNode }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const productPriority = createProductPriorityEnvSnapshot();

  return (
    <html lang="zh">
      <head>
        <meta name="google-adsense-account" content="ca-pub-4177231401395141" />
        <link rel="preconnect" href="https://static.lingcecdn.com" />
        <link rel="dns-prefetch" href="https://static.lingcecdn.com" />
        <link rel="preload" as="image" href="https://static.lingcecdn.com/www/myfunquizcom/assets/img/home/top.png" fetchPriority="high" />
      </head>
      <body className={siteFontClassName}>
        <AnalyticsScripts nonce={nonce} />
        <Providers>
          <LocaleProvider locale="zh">
            <AnalyticsPageViewTracker eventName="landing_pv" />
            <SiteChrome locale="zh" productPriority={productPriority}>{children}</SiteChrome>
            <CookieBanner />
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}
