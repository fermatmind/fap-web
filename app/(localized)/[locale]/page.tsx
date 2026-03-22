import type { Metadata } from "next";
import Link from "next/link";
import { HeroSection } from "@/components/marketing/HeroSection";
import {
  HighlightedTestsSection,
  type HomeHighlightedCard,
} from "@/components/marketing/HighlightedTestsSection";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { ValuePropsSection } from "@/components/marketing/ValuePropsSection";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { getAllTests, resolveTestTitleByLocale } from "@/lib/content";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { getHomeGatewaySurface } from "@/lib/publicGateway";
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
  const withLocale = (path: string) => localizedPath(path, locale);
  const gatewaySurface = await getHomeGatewaySurface(locale);
  const landingSurface = gatewaySurface?.landingSurface ?? null;
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

  const gatewayHighlights = landingSurface?.discoverabilityItems ?? [];
  const highlightedSeedSlugs = gatewayHighlights.length > 0
    ? gatewayHighlights.map((item) => item.key)
    : [...preferredLiveSlugs];

  const highlightedCards: HomeHighlightedCard[] = highlightedSeedSlugs
    .map((slug) => bySlug.get(slug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => {
      const gatewayItem = gatewayHighlights.find((candidate) => candidate.key === item.slug);
      const excerptSource = item.highlight_excerpt_i18n;
      const localizedExcerpt = gatewayItem?.summary
        || (excerptSource
          ? locale === "zh"
            ? excerptSource.zh ?? excerptSource["zh-CN"] ?? item.description
            : excerptSource.en ?? item.description
          : item.description);

      return {
        kind: "live",
        slug: item.slug,
        title: gatewayItem?.title ?? resolveTestTitleByLocale(item, locale),
        scaleCode: item.scale_code,
        excerpt: localizedExcerpt,
        rating: item.highlight_rating ?? 5,
        isClinical: item.scale_code === "SDS_20" || item.scale_code === "CLINICAL_COMBO_68",
      };
    });

  return (
    <main className="fm-home-page">
      <AnalyticsPageViewTracker eventName="view_landing" />

      <HeroSection dict={dict} locale={locale} />
      <ValuePropsSection dict={dict} />
      <HighlightedTestsSection dict={dict} locale={locale} cards={highlightedCards} />
      <SocialProofSection dict={dict} locale={locale} />

      <section className="fm-home-closer" aria-labelledby="home-final-cta-title">
        <Container className="relative">
          <div className="fm-home-closer-panel">
            <p className="fm-home-section-kicker">{dict.home.hero.kicker}</p>
            <h2 id="home-final-cta-title" className="fm-home-closer-title">
              {dict.home.hero.title}
            </h2>
            <p className="fm-home-closer-copy">{dict.home.hero.subtitle}</p>
            <div className="fm-home-closer-actions">
              <a href="#home-highlighted-tests-section" className={buttonVariants({ size: "lg" })}>
                {dict.home.hero.ctaPrimary}
              </a>
              <Link
                href={withLocale("/tests")}
                className={buttonVariants({
                  variant: "outline",
                  size: "lg",
                  className: "bg-white/85 backdrop-blur",
                })}
              >
                {dict.home.hero.ctaSecondary}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
