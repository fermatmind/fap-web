import type { Metadata } from "next";
import { HeroSection } from "@/components/marketing/HeroSection";
import {
  HighlightedTestsSection,
  type HomeHighlightedCard,
} from "@/components/marketing/HighlightedTestsSection";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { ValuePropsSection } from "@/components/marketing/ValuePropsSection";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { getAllTests, resolveTestTitleByLocale } from "@/lib/content";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";
  const pathname = isZh ? "/zh" : "/en";

  return buildPageMetadata({
    locale,
    pathname,
    title: "FermatMind",
    description: isZh
      ? "费马测试：科学自我测评与人格洞察。"
      : "FermatMind assessments and personality insights.",
    imagePath: "/share/mbti_wide_1200x630.png",
    alternatesByLocale: {
      en: "/en",
      zh: "/zh",
      xDefault: "/",
    },
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);
  const allTests = getAllTests();
  const bySlug = new Map<string, (typeof allTests)[number]>();
  for (const item of allTests) {
    bySlug.set(item.slug, item);
  }

  const preferredLiveSlugs = [
    "mbti-personality-test-16-personality-types",
    "big-five-personality-test-ocean-model",
    "clinical-depression-anxiety-assessment-professional-edition",
    "depression-screening-test-standard-edition",
    "iq-test-intelligence-quotient-assessment",
    "eq-test-emotional-intelligence-assessment",
  ] as const;

  const highlightedCards: HomeHighlightedCard[] = preferredLiveSlugs
    .map((slug) => bySlug.get(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => {
      const excerptSource = item.highlight_excerpt_i18n;
      const localizedExcerpt =
        excerptSource
          ? locale === "zh"
            ? excerptSource.zh ?? excerptSource["zh-CN"] ?? item.description
            : excerptSource.en ?? item.description
          : item.description;

      return {
        kind: "live",
        slug: item.slug,
        title: resolveTestTitleByLocale(item, locale),
        scaleCode: item.scale_code,
        excerpt: localizedExcerpt,
        rating: item.highlight_rating ?? 5,
        isClinical: item.scale_code === "SDS_20" || item.scale_code === "CLINICAL_COMBO_68",
      };
    });

  return (
    <main>
      <AnalyticsPageViewTracker eventName="view_landing" />

      <HeroSection dict={dict} locale={locale} />
      <ValuePropsSection dict={dict} />
      <HighlightedTestsSection dict={dict} locale={locale} cards={highlightedCards} />
      <SocialProofSection dict={dict} locale={locale} />
    </main>
  );
}
