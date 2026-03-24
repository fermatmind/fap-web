import type { Metadata } from "next";
import { HeroSection } from "@/components/marketing/HeroSection";
import { HighlightedTestsSection } from "@/components/marketing/HighlightedTestsSection";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { ValuePropsSection } from "@/components/marketing/ValuePropsSection";
import { ReportPreviewSection } from "@/components/marketing/ReportPreviewSection";
import { KnowledgeMethodsSection } from "@/components/marketing/KnowledgeMethodsSection";
import { FaqSection } from "@/components/marketing/FaqSection";
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
      <HighlightedTestsSection locale={locale} content={content} routes={content.routes} />
      <ValuePropsSection content={content.valueProps} />
      <ReportPreviewSection locale={locale} content={content.reportPreview} routes={content.routes} />
      <SocialProofSection
        locale={locale}
        content={content.socialProof}
        routes={{ articles: content.routes.articles }}
      />
      <KnowledgeMethodsSection locale={locale} content={content.knowledge} routes={content.routes} />
      <FaqSection locale={locale} content={content.faq} routes={content.routes} />
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
