import type { Metadata } from "next";
import Link from "next/link";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";
import { listBig5RecommendationTraits } from "@/lib/content";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/career/recommendations" : "/en/career/recommendations",
    title: locale === "zh" ? "职业推荐" : "Career Recommendations",
    description:
      locale === "zh"
        ? "从测评结果进入职业方向建议，再下钻到候选职业。"
        : "Start from an assessment result, choose a direction, then drill into candidate roles.",
    alternatesByLocale: {
      en: "/en/career/recommendations",
      zh: "/zh/career/recommendations",
      xDefault: "/",
    },
  });
}

export default async function CareerRecommendationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);

  const payload = await fetchCareerRecommendationIndex({ locale });
  const recommendationItems = adaptCareerRecommendationIndex({ locale, payload });
  const big5Traits = listBig5RecommendationTraits();
  const canonicalPath = locale === "zh" ? "/zh/career/recommendations" : "/en/career/recommendations";
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: locale === "zh" ? "职业推荐" : "Career Recommendations",
    description:
      locale === "zh"
        ? "从测评结果进入职业方向建议，再下钻到候选职业。"
        : "Start from an assessment result, choose a direction, then drill into candidate roles.",
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "职业" : "Career", path: locale === "zh" ? "/zh/career" : "/en/career" },
    { name: locale === "zh" ? "职业推荐" : "Recommendations", path: canonicalPath },
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="div" className="space-y-12 py-12 md:space-y-16 md:py-20">
        <AnalyticsPageViewTracker
          eventName={CAREER_TRACKING_EVENTS.recommendationIndexView}
          properties={buildCareerAttributionPayload({
            locale,
            entrySurface: "career_recommendation_index",
            sourcePageType: "career_recommendation_index",
            targetAction: "view_surface",
            landingPath: canonicalPath,
            routeFamily: "recommendations",
          })}
        />
        <JsonLd id="career-recommendation-webpage" data={webPageJsonLd} />
        <JsonLd id="career-recommendation-breadcrumb" data={breadcrumbJsonLd} />

        <section className="mx-auto max-w-4xl space-y-4 text-center">
          <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            {locale === "zh" ? "从测评结果选择职业方向" : "Choose a career direction from your result"}
          </h1>
        </section>

        <section className="space-y-4" data-testid="career-recommendations-source-entry">
          <div className="space-y-2">
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "选择推荐来源" : "Choose a recommendation source"}
            </h2>
          </div>

          {recommendationItems.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recommendationItems.map((item) => {
                return (
                  <article key={item.recommendationSubjectMeta.publicRouteSlug} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="career-recommendation-index-card" data-career-data-status={item.dataStatus}>
                    <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                      {locale === "zh" ? "已测结果" : "Available result"}
                    </p>
                    <h3 className="m-0 mt-3 text-lg font-semibold tracking-tight text-slate-950">{item.recommendationSubjectMeta.displayTitle}</h3>
                    <p className="m-0 mt-2 text-sm leading-6 text-slate-500">
                      {locale === "zh" ? "适合已经拿到对应人格结果，想先看方向和取舍的人。" : "Use this when you already have the matching result and want direction and tradeoffs first."}
                    </p>
                    <TrackedCareerLink
                      href={item.href}
                      eventName={CAREER_TRACKING_EVENTS.recommendationResultClick}
                      eventPayload={{
                        locale,
                        entrySurface: "career_recommendation_index",
                        sourcePageType: "career_recommendation_index",
                        targetAction: "open_recommendation_detail",
                        landingPath: canonicalPath,
                        routeFamily: "recommendations",
                        subjectKind: "recommendation_type",
                        subjectKey: item.recommendationSubjectMeta.publicRouteSlug,
                      }}
                      className="mt-4 inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700"
                    >
                      {locale === "zh" ? "进入推荐方向" : "Open recommendation direction"}
                    </TrackedCareerLink>
                  </article>
                );
              })}
            </div>
          ) : (
            null
          )}

          {big5Traits.length > 0 ? (
            <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="career-recommendation-source-big5">
              <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Big Five</p>
              <h3 className="m-0 mt-3 text-lg font-semibold tracking-tight text-slate-950">
                {locale === "zh" ? "从大五特质看职业方向" : "Use Big Five traits for career direction"}
              </h3>
              <p className="m-0 mt-2 text-sm leading-6 text-slate-500">
                {locale === "zh" ? "适合已经知道自己的大五特质，想从稳定特质进入方向判断的人。" : "Use this when you know your Big Five trait signal and want a direction-first entry."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {big5Traits.map((trait) => (
                  <Link key={trait} href={withLocale(`/career/recommendations/big5/${trait}`)} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-600">
                    {trait}
                  </Link>
                ))}
              </div>
            </article>
          ) : null}

          {recommendationItems.length === 0 && big5Traits.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500" data-testid="career-recommendation-index-status" data-career-data-status="unavailable">
              {locale === "zh" ? "当前没有可公开展示的推荐入口。" : "No public recommendation sources are currently available."}
            </div>
          ) : null}
        </section>
      </Container>
    </main>
  );
}
