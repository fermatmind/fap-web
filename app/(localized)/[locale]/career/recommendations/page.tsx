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
import { MBTI_TYPE_GROUPS } from "@/lib/mbti/mbtiTypeContentPack";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

const GROUP_LABELS: Record<keyof typeof MBTI_TYPE_GROUPS, { en: string; zh: string }> = {
  NT: { en: "Analysts", zh: "分析家" },
  NF: { en: "Diplomats", zh: "外交家" },
  SJ: { en: "Sentinels", zh: "守护者" },
  SP: { en: "Explorers", zh: "探索者" },
};

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
  const recommendationByType = new Map(
    recommendationItems.map((item) => [
      String(item.recommendationSubjectMeta.canonicalTypeCode ?? item.recommendationSubjectMeta.publicRouteSlug)
        .slice(0, 4)
        .toUpperCase(),
      item,
    ])
  );
  const canonicalPath = locale === "zh" ? "/zh/career/recommendations" : "/en/career/recommendations";
  const mbtiTestPath = withLocale("/tests/mbti-personality-test-16-personality-types");
  const big5TestPath = withLocale("/tests/big-five-personality-test-ocean-model");
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

        <section className="mx-auto max-w-4xl space-y-4 text-center">
          <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            {locale === "zh" ? "青年人的认知成长与决策平台" : "A decision platform for young adults"}
          </h1>
        </section>

        <section className="grid gap-4 md:grid-cols-3" data-testid="career-recommendations-source-entry">
          <SourceCard
            title={locale === "zh" ? "从 MBTI 看职业方向" : "Start from MBTI"}
            description={
              locale === "zh"
                ? "适合已经知道 16 型人格，想先看职业倾向、主推荐路径和候选职业的人。"
                : "For users who know their 16-type result and want direction, path, and candidate roles."
            }
            href="#mbti"
            cta={locale === "zh" ? "选择 MBTI 类型" : "Choose MBTI type"}
          />
          <SourceCard
            title={locale === "zh" ? "从大五人格看职业方向" : "Start from Big Five"}
            description={
              locale === "zh"
                ? "大五职业推荐页暂不作为前端本地内容发布；先完成测评，再进入后端开放的职业库与指南。"
                : "Big Five career recommendations are not published as local frontend content; use the test, then continue into backend-owned jobs and guides."
            }
            href="#start"
            cta={locale === "zh" ? "先做大五人格" : "Take Big Five first"}
          />
          <SourceCard
            title={locale === "zh" ? "先完成一个测评" : "Take an assessment first"}
            description={
              locale === "zh"
                ? "如果还没有明确结果，先用兴趣、MBTI 或大五建立一个可讨论的起点。"
                : "If you do not have a result yet, create a starting point with interest, MBTI, or Big Five."
            }
            href="#start"
            cta={locale === "zh" ? "选择测评" : "Choose assessment"}
          />
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
          <p className="m-0 text-sm leading-7 text-slate-600">
            {locale === "zh"
              ? "职业推荐用于缩小方向，不是替你决定职业。建议先看推荐方向，再进入职业详情页比较工作内容、压力来源、转型难度和长期成长空间。"
              : "Career recommendations narrow the field; they do not decide for you. Start with a direction, then compare job content, pressure, transition difficulty, and long-term growth."}
          </p>
        </section>

        <section id="mbti" className="space-y-5 scroll-mt-24" data-testid="career-recommendation-source-mbti">
          <div>
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "选择你的 MBTI 类型" : "Choose your MBTI type"}
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-4">
            {(Object.entries(MBTI_TYPE_GROUPS) as Array<[keyof typeof MBTI_TYPE_GROUPS, readonly string[]]>).map(
              ([groupKey, typeCodes]) => (
                <div key={groupKey} className="border-t border-slate-200 pt-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <h3 className="m-0 text-lg font-semibold text-slate-950">{GROUP_LABELS[groupKey][locale]}</h3>
                    <span className="text-xs font-semibold text-slate-400">{groupKey}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {typeCodes.map((typeCode) => {
                      const item = recommendationByType.get(typeCode);
                      return item ? (
                        <TrackedCareerLink
                          key={typeCode}
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
                          className="rounded-2xl border border-emerald-100 bg-emerald-50 px-3 py-3 text-sm font-semibold text-emerald-800 hover:border-emerald-200"
                        >
                          {typeCode}
                          <span className="mt-1 block text-xs font-medium text-emerald-700">
                            {locale === "zh" ? "可看推荐" : "Available"}
                          </span>
                        </TrackedCareerLink>
                      ) : (
                        <Link
                          key={typeCode}
                          href={withLocale(`/personality/${typeCode.toLowerCase()}-a`)}
                          className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 hover:border-orange-200 hover:text-orange-600"
                        >
                          {typeCode}
                          <span className="mt-1 block text-xs font-medium text-slate-400">
                            {locale === "zh" ? "先看画像" : "Profile first"}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </div>

          {recommendationItems.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recommendationItems.map((item) => (
                <article
                  key={item.recommendationSubjectMeta.publicRouteSlug}
                  className="border-t border-slate-200 py-5"
                  data-testid="career-recommendation-index-card"
                  data-career-data-status={item.dataStatus}
                >
                  <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    {locale === "zh" ? "已开放推荐" : "Available recommendation"}
                  </p>
                  <h3 className="m-0 mt-3 text-lg font-semibold tracking-tight text-slate-950">
                    {item.recommendationSubjectMeta.displayTitle}
                  </h3>
                  <p className="m-0 mt-2 text-sm leading-6 text-slate-500">
                    {locale === "zh"
                      ? "适合已经拿到对应人格结果，想先看方向和取舍的人。"
                      : "Use this when you already have the matching result and want direction and tradeoffs first."}
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
              ))}
            </div>
          ) : null}
        </section>

        <section id="start" className="space-y-5 scroll-mt-24">
          <div>
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "还没有测评结果？" : "No assessment result yet?"}
            </h2>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <ActionLink href={riasecTestPath} title={locale === "zh" ? "先做职业兴趣测试" : "Career interest test"} description={locale === "zh" ? "从兴趣与活动偏好建立职业方向。" : "Use interest and activity preference as a starting point."} />
            <ActionLink href={mbtiTestPath} title={locale === "zh" ? "先做 MBTI" : "Take MBTI"} description={locale === "zh" ? "适合想从人格类型进入推荐的人。" : "For users who want to start from type."} />
            <ActionLink href={big5TestPath} title={locale === "zh" ? "先做大五人格" : "Take Big Five"} description={locale === "zh" ? "适合想从稳定特质进入职业判断的人。" : "For users who want trait-based direction."} />
          </div>
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
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <a href={href} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200 md:p-6">
      <h2 className="m-0 text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
      <p className="m-0 mt-3 text-sm leading-6 text-slate-500">{description}</p>
      <p className="m-0 mt-6 text-sm font-semibold text-orange-600">{cta}</p>
    </a>
  );
}

function ActionLink({
  href,
  title,
  description,
}: {
  href: string;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="border-t border-slate-200 py-5 hover:border-orange-300">
      <span className="block text-lg font-semibold text-slate-950">{title}</span>
      <span className="mt-2 block text-sm leading-6 text-slate-500">{description}</span>
    </Link>
  );
}
