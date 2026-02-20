import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { LocaleProvider } from "@/components/i18n/LocaleContext";
import { Providers } from "@/app/providers";
import { resolveRequestLocale } from "@/lib/i18n/resolveRequestLocale";
import { canonicalUrl, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FermatMind",
    template: "%s | FermatMind",
  },
  description: "FermatMind assessments and personality tests.",
  alternates: {
    canonical: "/",
    languages: {
      en: canonicalUrl("/"),
      zh: canonicalUrl("/zh"),
      "x-default": canonicalUrl("/"),
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const locale = resolveRequestLocale(requestHeaders);

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <LocaleProvider locale={locale}>
            <SiteChrome>{children}</SiteChrome>
          </LocaleProvider>
        </Providers>
      </body>
    </html>
  );
}
