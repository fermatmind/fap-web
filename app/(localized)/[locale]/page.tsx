import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { HeroSection } from "@/components/marketing/HeroSection";
import { HighlightedTestsSection } from "@/components/marketing/HighlightedTestsSection";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { ValuePropsSection } from "@/components/marketing/ValuePropsSection";
import { ReportPreviewSection } from "@/components/marketing/ReportPreviewSection";
import { KnowledgeMethodsSection } from "@/components/marketing/KnowledgeMethodsSection";
import { FinalCtaSection } from "@/components/marketing/FinalCtaSection";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { resolveLocale } from "@/lib/i18n/getDict";
import { getHomepageContent } from "@/components/marketing/homepageContent";
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
  const content = getHomepageContent(locale);

  return (
    <main className="fm-home-page">
      <AnalyticsPageViewTracker eventName="view_landing" />

      <HeroSection
        locale={locale}
        content={content.hero}
        routes={{ tests: content.routes.tests }}
        pathRecommendations={content.pathRecommendations}
        testCatalog={content.testCatalog}
      />
      <HighlightedTestsSection locale={locale} content={content} />
      <ReportPreviewSection locale={locale} content={content.reportPreview} routes={content.routes} />
      <section className="fm-home-section-shell" data-testid="home-proof-section">
        <Container className="max-w-[1200px] space-y-8">
          <ValuePropsSection content={content.valueProps} />
          <SocialProofSection
            locale={locale}
            content={content.socialProof}
            routes={{ articles: content.routes.articles }}
          />
        </Container>
      </section>
      <KnowledgeMethodsSection
        locale={locale}
        content={content.knowledge}
        faq={content.faq}
        routes={content.routes}
      />
      <FinalCtaSection
        locale={locale}
        content={content.finalCta}
        routes={{
          tests: content.routes.tests,
          business: content.routes.business,
          mbtiDetail: content.routes.mbtiDetail,
        }}
      />
    </main>
  );
}
