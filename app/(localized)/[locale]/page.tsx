import { HeroSection } from "@/components/marketing/HeroSection";
import {
  HighlightedTestsSection,
  type HomeHighlightedCard,
} from "@/components/marketing/HighlightedTestsSection";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { ValuePropsSection } from "@/components/marketing/ValuePropsSection";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { getAllTests } from "@/lib/content";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);
  const allTests = getAllTests();
  const byScaleCode = new Map<string, (typeof allTests)[number]>();
  for (const item of allTests) {
    if (typeof item.scale_code === "string" && item.scale_code.trim().length > 0) {
      byScaleCode.set(item.scale_code, item);
    }
  }

  const preferredLiveScaleCodes = ["MBTI", "BIG5_OCEAN", "SDS_20", "CLINICAL_COMBO_68"] as const;
  const liveCards: HomeHighlightedCard[] = preferredLiveScaleCodes
    .map((scaleCode) => byScaleCode.get(scaleCode))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => {
      const source = item.card_tagline_i18n;
      const localizedTagline =
        source
          ? locale === "zh"
            ? source.zh ?? source["zh-CN"] ?? item.scale_code ?? "Assessment"
            : source.en ?? item.scale_code ?? "Assessment"
          : item.scale_code ?? "Assessment";
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
        title: item.title,
        scaleCode: item.scale_code,
        tagline: localizedTagline,
        excerpt: localizedExcerpt,
        rating: item.highlight_rating ?? 5,
        isClinical: item.scale_code === "SDS_20" || item.scale_code === "CLINICAL_COMBO_68",
      };
    });

  const comingSoonCards: HomeHighlightedCard[] = dict.home.highlighted.comingSoonCards.slice(0, 2).map((item, index) => ({
    kind: "coming_soon",
    id: `coming-${index + 1}`,
    title: item.title,
    description: item.description,
  }));
  const highlightedCards = [...liveCards, ...comingSoonCards];

  return (
    <main>
      <AnalyticsPageViewTracker eventName="view_landing" />

      <HeroSection dict={dict} locale={locale} />
      <ValuePropsSection dict={dict} />
      <SocialProofSection dict={dict} locale={locale} />
      <HighlightedTestsSection dict={dict} locale={locale} cards={highlightedCards} />
    </main>
  );
}
