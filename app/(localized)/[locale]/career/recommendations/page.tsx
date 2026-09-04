import type { Metadata } from "next";
import Link from "next/link";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";
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
  const canonicalPath = locale === "zh" ? "/zh/career/recommendations" : "/en/career/recommendations";
  const riasecTestPath = withLocale("/tests/holland-career-interest-test-riasec");
  const jobsPath = withLocale("/career/jobs");
  const industriesPath = withLocale("/career/industries");
  const guidesPath = withLocale("/career/guides");
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
        <Breadcrumb
          items={[
            { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
            { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
            { label: locale === "zh" ? "职业推荐" : "Recommendations" },
          ]}
        />

        <section className="mx-auto max-w-4xl text-center">
          <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            {locale === "zh" ? "找到适合你的职业方向" : "Find a career direction that fits you"}
          </h1>
        </section>

        <section className="grid gap-4 md:grid-cols-3" data-testid="career-recommendations-source-entry">
          <SourceCard
            title={locale === "zh" ? "已有测评结果" : "I have an assessment result"}
            description={
              locale === "zh"
                ? "查看与你的 MBTI 结果对应的职业建议。"
                : "Open the career guidance available for your MBTI result."
            }
            href="#recommendations"
          />
          <SourceCard
            title={locale === "zh" ? "还没有明确方向" : "I am not sure yet"}
            description={
              locale === "zh"
                ? "从职业兴趣出发，先缩小值得探索的领域。"
                : "Start with career interests to narrow the fields worth exploring."
            }
            href={riasecTestPath}
          />
          <SourceCard
            title={locale === "zh" ? "已有目标职业" : "I have a career in mind"}
            description={
              locale === "zh"
                ? "直接查看工作内容、任职要求与发展路径。"
                : "Go straight to responsibilities, requirements, and career paths."
            }
            href={jobsPath}
          />
        </section>

        <section
          id="recommendations"
          className="space-y-5 scroll-mt-24"
          data-testid="career-recommendation-source-mbti"
        >
          <div>
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "按测评结果查看职业建议" : "Browse career guidance by result"}
            </h2>
          </div>

          {recommendationItems.length === 0 ? (
            <div
              className="rounded-3xl border border-slate-200 bg-white px-6 py-10 text-center shadow-sm"
              data-testid="career-recommendations-unavailable"
              role="status"
            >
              <p className="m-0 text-lg font-semibold text-slate-950">
                {locale === "zh" ? "职业推荐暂不可用" : "Career recommendations are temporarily unavailable"}
              </p>
              <p className="mx-auto m-0 mt-2 max-w-xl text-sm leading-6 text-slate-500">
                {locale === "zh" ? "请稍后再试，或先浏览职业库。" : "Please try again later, or browse the job library for now."}
              </p>
            </div>
          ) : (
            <div className="grid gap-x-8 md:grid-cols-2">
              {recommendationItems.map((item) => (
                <TrackedCareerLink
                  key={item.recommendationSubjectMeta.publicRouteSlug}
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
                  className="group flex items-center justify-between gap-4 border-t border-slate-200 py-5 transition-colors hover:border-orange-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4"
                  data-testid="career-recommendation-index-card"
                  data-career-data-status={item.dataStatus}
                >
                  <span className="text-lg font-semibold tracking-tight text-slate-950 transition-colors group-hover:text-orange-700">
                    {item.recommendationSubjectMeta.displayTitle}
                  </span>
                  <span
                    aria-hidden="true"
                    className="text-xl text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-orange-600"
                  >
                    →
                  </span>
                </TrackedCareerLink>
              ))}
            </div>
          )}
        </section>

        <section className="border-t border-slate-200 pt-6">
          <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold">
            <Link href={jobsPath} className="text-orange-600 underline-offset-4 hover:underline">
              {locale === "zh" ? "浏览全部职业库" : "Browse all occupations"}
            </Link>
            <Link href={industriesPath} className="text-orange-600 underline-offset-4 hover:underline">
              {locale === "zh" ? "按行业浏览职业" : "Browse by industry"}
            </Link>
            <Link href={guidesPath} className="text-orange-600 underline-offset-4 hover:underline">
              {locale === "zh" ? "查看职业发展指南" : "Read career guides"}
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
}

function SourceCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-4 md:p-6"
    >
      <h2 className="m-0 text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <p className="m-0 mt-3 text-sm leading-6 text-slate-500">{description}</p>
    </Link>
  );
}
