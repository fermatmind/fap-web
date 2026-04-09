import type { Metadata } from "next";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Container } from "@/components/layout/Container";
import { SbtiTestClient } from "@/components/sbti/SbtiTestClient";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const pathname = locale === "zh" ? "/zh/fun/sbti" : "/en/fun/sbti";

  return buildPageMetadata({
    locale,
    pathname,
    title: locale === "zh" ? "SBTI 人格测试｜娱乐实验" : "SBTI Personality Test | Fun Experiment",
    description:
      locale === "zh"
        ? "31 题、3-5 分钟的轻量人格画像娱乐实验。"
        : "A lightweight 31-question personality experiment for fun.",
    noindex: true,
    alternatesByLocale: {
      en: "/en/fun/sbti",
      zh: "/zh/fun/sbti",
      xDefault: "/",
    },
  });
}

export default async function SbtiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return (
    <Container as="main" className="space-y-6 py-8 md:py-10">
      <AnalyticsPageViewTracker
        eventName="landing_view"
        properties={{
          slug: "sbti-fun",
          entry_surface: "fun_page",
          landing_path: locale === "zh" ? "/zh/fun/sbti" : "/en/fun/sbti",
          locale,
        }}
      />
      <SbtiTestClient locale={locale} />
    </Container>
  );
}
