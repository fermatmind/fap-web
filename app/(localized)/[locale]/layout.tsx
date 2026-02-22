import type { Metadata } from "next";
import { Fraunces, JetBrains_Mono, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { Providers } from "@/app/providers";
import { isSupportedLocale, type Locale } from "@/lib/i18n/locales";
import { canonicalUrl, SITE_URL } from "@/lib/site";
import "../../globals.css";

const fmSans = Manrope({
  variable: "--font-fm-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "sans-serif"],
});

const fmSerif = Fraunces({
  variable: "--font-fm-serif",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const fmMono = JetBrains_Mono({
  variable: "--font-fm-mono",
  subsets: ["latin"],
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
  alternates: {
    canonical: "/en",
    languages: {
      en: canonicalUrl("/en"),
      zh: canonicalUrl("/zh"),
      "x-default": canonicalUrl("/en"),
    },
  },
  openGraph: {
    siteName: "FermatMind",
    type: "website",
    images: ["/share/mbti_wide_1200x630.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/share/mbti_wide_1200x630.png"],
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

  return (
    <html lang={resolvedLocale}>
      <body className={`${fmSans.variable} ${fmSerif.variable} ${fmMono.variable} antialiased`}>
        <Providers>
          <LocaleProvider locale={resolvedLocale}>
            <SiteChrome>{children}</SiteChrome>
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}
