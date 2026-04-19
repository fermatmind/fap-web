import type { Metadata } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { Providers } from "@/app/providers";
import { isSupportedLocale, type Locale } from "@/lib/i18n/locales";
import { DEFAULT_SHARE_IMAGE_URL } from "@/lib/cms/media";
import { createProductPriorityEnvSnapshot } from "@/lib/rollout/scaleRollout";
import { SITE_URL } from "@/lib/site";
import "../../globals.css";

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
  const resolvedLocale: Locale = locale;
  const productPriority = createProductPriorityEnvSnapshot();

  return (
    <html lang={resolvedLocale}>
      <body className={`${fmSans.variable} ${fmSerif.variable} ${fmMono.variable} antialiased`}>
        <Providers>
          <LocaleProvider locale={resolvedLocale}>
            <SiteChrome productPriority={productPriority}>{children}</SiteChrome>
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}
