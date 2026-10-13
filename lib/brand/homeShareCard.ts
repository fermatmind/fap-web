import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/locales";
import { SITE_URL } from "@/lib/site";

export function withHomeShareCard(metadata: Metadata, locale: Locale): Metadata {
  const isZh = locale === "zh";
  const title = isZh
    ? "费马测试｜免费人格、职业与能力测评"
    : "FermatMind | Free personality and career tests";
  const description = isZh
    ? "看清自己，走好每一步。免费探索人格、职业兴趣与能力，获得清晰易懂的结果解读。"
    : "Know yourself, move with clarity. Explore your personality, career interests and abilities with free tests and clear results.";
  const image = {
    url: new URL(`/brand/share-home-${locale}-20261014.png`, process.env.NEXT_PUBLIC_SITE_URL || SITE_URL).href,
    width: 1200,
    height: 630,
    alt: isZh ? "费马测试：看清自己，走好每一步。人格测评、职业探索与能力成长。" : "FermatMind: Know yourself, move with clarity. Personality, careers and skills.",
  };
  return {
    ...metadata,
    openGraph: { ...metadata.openGraph, title, description, images: [image] },
    twitter: { ...metadata.twitter, card: "summary_large_image", site: "@FermatMind", title, description, images: [image] },
  };
}
