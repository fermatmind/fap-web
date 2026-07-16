import type { Metadata } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { CookieBanner } from "@/components/legal/CookieBanner";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { Providers } from "@/app/providers";
import { isSupportedLocale, type Locale } from "@/lib/i18n/locales";
import { DEFAULT_SHARE_IMAGE_URL } from "@/lib/cms/media";
import { createProductPriorityEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { SITE_URL, isConfiguredStagingSiteUrl } from "@/lib/site";
import { PRIVATE_ANALYTICS_SUPPRESSION_HEADER } from "@/lib/tracking/browserAnalyticsSuppression";
import "../../globals.css";

const RESULT_PAGE_SNAPSHOT_SHELL_HEADER = "x-fermat-result-print-snapshot-shell";

const fmSans = localFont({
  src: [{ path: "../../../public/fonts/manrope/Manrope-Variable.woff2", weight: "200 800", style: "normal" }],
  variable: "--font-fm-sans",
  display: "swap",
  fallback: ["Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"],
});

const fmSerif = localFont({
  src: [{ path: "../../../public/fonts/fraunces/Fraunces-Variable.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-fm-serif",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const fmMono = localFont({
  src: [
    {
      path: "../../../public/fonts/jetbrains-mono/JetBrainsMono-Variable.woff2",
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
    default: "FermatMind",
    template: "%s | FermatMind",
  },
  description: "FermatMind assessments and personality tests.",
  robots: isConfiguredStagingSiteUrl()
    ? {
        index: false,
        follow: false,
        nocache: true,
      }
    : undefined,
  openGraph: {
    siteName: "FermatMind",
    type: "website",
    images: [DEFAULT_SHARE_IMAGE_URL],
  },
  twitter: {
    card: "summary_large_image",
    images: [DEFAULT_SHARE_IMAGE_URL],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION
      ? {
          "baidu-site-verification": process.env.NEXT_PUBLIC_BAIDU_SITE_VERIFICATION,
        }
      : undefined,
  },
};

export function generateStaticParams() {
  return [{ locale: "en" }, { locale: "zh" }];
}

export default async function LocalizedRootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }
  const requestHeaders = await headers();
  const nonce = requestHeaders.get("x-nonce") ?? undefined;
  const suppressAnalyticsBootstrap = requestHeaders.get(PRIVATE_ANALYTICS_SUPPRESSION_HEADER) === "true";
  const useResultPrintSnapshotShell = requestHeaders.get(RESULT_PAGE_SNAPSHOT_SHELL_HEADER) === "true";
  const resolvedLocale: Locale = locale;
  const productPriority = createProductPriorityEnvSnapshot();

  return (
    <html lang={resolvedLocale}>
      <body
        className={`${fmSans.variable} ${fmSerif.variable} ${fmMono.variable} antialiased`}
        data-pdf-snapshot-shell={useResultPrintSnapshotShell ? "true" : undefined}
      >
        <AnalyticsScripts nonce={nonce} suppressServerBootstrap={suppressAnalyticsBootstrap} />
        <Providers>
          <LocaleProvider locale={resolvedLocale}>
            {useResultPrintSnapshotShell ? (
              children
            ) : (
              <>
                <SiteChrome locale={resolvedLocale} productPriority={productPriority}>{children}</SiteChrome>
                <CookieBanner />
              </>
            )}
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}
