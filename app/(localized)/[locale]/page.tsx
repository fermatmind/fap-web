import { HeroSection } from "@/components/marketing/HeroSection";
import { HighlightedTestsSection } from "@/components/marketing/HighlightedTestsSection";
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
  const highlightedTests = getAllTests()
    .sort((a, b) => (b.highlight_priority ?? 0) - (a.highlight_priority ?? 0))
    .slice(0, 6);

  return (
    <main>
      <AnalyticsPageViewTracker eventName="view_landing" />

      <HeroSection dict={dict} locale={locale} />
      <ValuePropsSection dict={dict} />
      <SocialProofSection dict={dict} locale={locale} />
      <HighlightedTestsSection dict={dict} locale={locale} tests={highlightedTests} />
    </main>
  );
}
