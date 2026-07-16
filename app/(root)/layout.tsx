import type { Metadata } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import type { ReactNode } from "react";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { Providers } from "@/app/providers";
import { createProductPriorityEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { SITE_URL, canonicalUrl, isConfiguredStagingSiteUrl } from "@/lib/site";
import "../globals.css";
import "../mbti-career-cta.css";

const fmSans = localFont({
  src: [{ path: "../../public/fonts/manrope/Manrope-Variable.woff2", weight: "200 800", style: "normal" }],
  variable: "--font-fm-sans",
  display: "swap",
  fallback: ["Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"],
});

const fmSerif = localFont({
  src: [{ path: "../../public/fonts/fraunces/Fraunces-Variable.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-fm-serif",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const fmMono = localFont({
  src: [
    {
      path: "../../public/fonts/jetbrains-mono/JetBrainsMono-Variable.woff2",
      weight: "100 800",
      style: "normal",
    },
  ],
  variable: "--font-fm-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FermatMind · 费马测试",
    template: "%s | FermatMind",
  },
  description: "费马测试提供人格、能力与职业方向测评。",
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
      <body className={`${fmSans.variable} ${fmSerif.variable} ${fmMono.variable} antialiased`}>
        <AnalyticsScripts nonce={nonce} />
        <Providers>
          <LocaleProvider locale="zh">
            <SiteChrome locale="zh" productPriority={productPriority}>{children}</SiteChrome>
            <CookieBanner />
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}
