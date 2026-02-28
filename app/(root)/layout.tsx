import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_URL, canonicalUrl } from "@/lib/site";
import "../globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "FermatMind · 费马测试",
    template: "%s | FermatMind",
  },
  description: "Scientific self-assessments and personality insights in Chinese and English.",
  alternates: {
    canonical: "/",
    languages: {
      en: canonicalUrl("/en"),
      "zh-CN": canonicalUrl("/zh"),
      "x-default": canonicalUrl("/"),
    },
  },
};

export default function RootRouteLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
