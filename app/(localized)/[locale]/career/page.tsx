import type { Metadata } from "next";
import Link from "next/link";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { ConfidenceBadge } from "@/components/career/v1/ConfidenceBoundary";
import { DecisionPathCard } from "@/components/career/v1/DecisionPathCard";
import { NextStepRail } from "@/components/career/v1/NextStepRail";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import { adaptCareerLaunchGovernanceClosure } from "@/lib/career/adapters/adaptCareerLaunchGovernanceClosure";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { adaptCareerRuntimeConfig } from "@/lib/career/adapters/adaptCareerRuntimeConfig";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { fetchCareerLaunchGovernanceClosure } from "@/lib/career/api/fetchCareerLaunchGovernanceClosure";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";
import { fetchCareerRuntimeConfig } from "@/lib/career/api/fetchCareerRuntimeConfig";
import { buildCareerFamilyFrontendUrl } from "@/lib/career/urls";
import { getCareerV1StateCopy } from "@/lib/career/ui/stateCopy";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";

const CURATED_FAMILY_PATHS = [
  {
    slug: "data-science",
    title: { en: "Data Science", zh: "数据科学" },
    summary: {
      en: "Start from analytics, ML, and decision-support roles.",
      zh: "从分析、机器学习与决策支持岗位开始探索。",
    },
  },
  {
    slug: "software-engineering",
    title: { en: "Software Engineering", zh: "软件工程" },
    summary: {
      en: "Explore product engineering, backend, and platform tracks.",
      zh: "探索产品工程、后端与平台方向。",
    },
  },
  {
    slug: "compliance",
    title: { en: "Compliance", zh: "合规与治理" },
    summary: {
      en: "Explore audit, policy, and risk-control career paths.",
      zh: "探索审计、政策与风控相关职业路径。",
    },
  },
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/career" : "/en/career",
    title: locale === "zh" ? "职业探索入口" : "Career Explorer Shell",
    description:
      locale === "zh"
        ? "搜索职业，解析别名，或从测评结果进入职业推荐。"
        : "Search jobs, resolve role aliases, or start from personality-based career recommendations.",
    alternatesByLocale: {
      en: "/en/career",
      zh: "/zh/career",
      xDefault: "/",
    },
  });
}

export default async function CareerCenterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);

  const [governanceClosurePayload, jobIndexPayload, recommendationIndexPayload, runtimeConfigPayload] = await Promise.all([
    fetchCareerLaunchGovernanceClosure({ locale }),
    fetchCareerJobIndex({ locale }),
    fetchCareerRecommendationIndex({ locale }),
    fetchCareerRuntimeConfig({ locale }),
  ]);

  const governanceClosure = adaptCareerLaunchGovernanceClosure({
    payload: governanceClosurePayload,
  });
  const runtimeConfig = adaptCareerRuntimeConfig(runtimeConfigPayload);
  const explorerPrimaryVariant = runtimeConfig.experiments.explorerPrimaryPath.enabled
    ? runtimeConfig.experiments.explorerPrimaryPath.variant
    : "jobs_first";
  const topJobs = adaptCareerJobIndex({ locale, payload: jobIndexPayload })
    .filter((job) => {
      const member = governanceClosure?.membersBySlug[job.identity.canonicalSlug];
      if (!member) {
        return true;
      }

      return member.governanceState !== "not_yet_mature";
    })
    .slice(0, 3);
  const recommendationPreviewItems = adaptCareerRecommendationIndex({
    locale,
    payload: recommendationIndexPayload,
  }).slice(0, 1);

  const landingPath = withLocale("/career");
  const canonicalPath = locale === "zh" ? "/zh/career" : "/en/career";
  const pageTitle = locale === "zh" ? "职业探索入口" : "Career Explorer Shell";
  const pageDescription =
    locale === "zh"
      ? "搜索职业，解析别名，或从测评结果进入职业推荐。"
      : "Search jobs, resolve role aliases, or start from personality-based career recommendations.";
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: pageTitle,
    description: pageDescription,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "职业" : "Career", path: canonicalPath },
  ]);

  return (
    <main className="min-h-screen bg-slate-50">
      <AnalyticsPageViewTracker
        eventName={CAREER_TRACKING_EVENTS.landingView}
        properties={buildCareerAttributionPayload({
          locale,
          entrySurface: "career_landing",
          sourcePageType: "career_landing",
          targetAction: "view_surface",
          landingPath,
          routeFamily: "landing",
        })}
      />
      {topJobs.map((job) => (
        <AnalyticsPageViewTracker
          key={`career-ready-exposure:${job.identity.canonicalSlug}`}
          eventName={CAREER_TRACKING_EVENTS.readySurfaceExposed}
          properties={buildCareerAttributionPayload({
            locale,
            entrySurface: "career_landing_jobs_preview",
            sourcePageType: "career_landing",
            targetAction: "render_ready_job_preview",
            landingPath,
            routeFamily: "landing",
            subjectKind: "job_slug",
            subjectKey: job.identity.canonicalSlug,
          })}
        />
      ))}
      <JsonLd id="career-center-webpage" data={webPageJsonLd} />
      <JsonLd id="career-center-breadcrumb" data={breadcrumbJsonLd} />
      <Container as="div" className="space-y-12 pb-16 pt-8 md:space-y-16 md:pb-20 md:pt-12">
        <Breadcrumb
          items={[
            { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
            { name: locale === "zh" ? "职业" : "Career", path: canonicalPath },
          ].map((item, index) => ({
            label: item.name,
            href: index === 0 ? item.path : undefined,
          }))}
        />

        <section className="mx-auto max-w-4xl space-y-8 pt-4 md:pt-8" data-testid="career-landing-hero" data-authority-owner="editorial_local_wrapper">
          <div className="space-y-5 text-center">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Career Explorer</p>
            <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              {locale === "zh" ? "找到适合你的职业方向" : "Find the career direction worth exploring next"}
            </h1>
            <p className="mx-auto m-0 max-w-2xl text-base leading-7 text-slate-500">
              {locale === "zh"
                ? "搜索职业，或从你的测评结果出发。"
                : "Search a role directly, or start from your assessment result when you are still comparing paths."}
            </p>
          </div>

          <form
            action={withLocale("/career/jobs")}
            method="get"
            className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:flex md:items-center md:gap-3"
            data-testid="career-landing-search-entry"
          >
            <input
              type="search"
              name="q"
              placeholder={locale === "zh" ? "输入职业名，例如 Software Engineer" : "Enter a role, e.g. Software Engineer"}
              className="h-12 w-full rounded-full border border-transparent bg-slate-50 px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-orange-200"
            />
            <div className="mt-3 flex flex-wrap gap-2 md:mt-0 md:shrink-0">
              <button type="submit" className={buttonVariants({ size: "lg" })}>
                {locale === "zh" ? "搜索职业" : "Search jobs"}
              </button>
              <button type="submit" formAction={withLocale("/career/resolve")} className="text-sm font-medium text-slate-500 underline underline-offset-4 hover:text-slate-950">
                {locale === "zh" ? "不确定叫法？试试别名解析" : "Not sure what it is called? Resolve an alias"}
              </button>
            </div>
          </form>

          <div className="flex justify-center">
            <Link href={withLocale("/career/recommendations")} className={buttonVariants({ variant: "outline", size: "lg" })}>
              {locale === "zh" ? "查看我的职业推荐" : "View my career recommendations"}
            </Link>
          </div>
          <p className="sr-only" data-testid="career-explorer-primary-path-variant">
            {explorerPrimaryVariant}
          </p>
        </section>

        <section className="space-y-4" data-testid="career-explorer-pathways" data-authority-owner="editorial_ia_shell">
          <div className="grid gap-4 md:grid-cols-2">
            <DecisionPathCard
              eyebrow={locale === "zh" ? "直接找职业" : "Direct search"}
              title={locale === "zh" ? "搜索职业库" : "Search the job library"}
              summary={locale === "zh" ? "适合已经知道岗位名，想快速查看职业资料的人。" : "Best when you already know a role name and want a focused profile."}
              ctaLabel={locale === "zh" ? "进入职业库" : "Open job library"}
              href={withLocale("/career/jobs")}
            />
            <DecisionPathCard
              eyebrow={locale === "zh" ? "从测评结果出发" : "Start from a result"}
              title={locale === "zh" ? "查看推荐方向" : "View recommendation paths"}
              summary={locale === "zh" ? "适合还在比较路径，想先看方向和取舍的人。" : "Best when you are comparing options and need a decision-first path."}
              ctaLabel={locale === "zh" ? "查看推荐" : "Open recommendations"}
              href={withLocale("/career/recommendations")}
            />
          </div>
        </section>

        <NextStepRail
          title={locale === "zh" ? "也可以从这里开始" : "Other quiet ways in"}
          description={locale === "zh" ? "这些入口不会抢主路径，只用于补充探索和方法说明。" : "Secondary paths for broad exploration and dataset context."}
          testId="career-v1-soft-exploration-row"
          items={[
            {
              title: locale === "zh" ? "按职业家族探索" : "Explore by family",
              description: locale === "zh" ? "先看方向，再进入具体职业。" : "Start broad, then choose a role.",
              href: buildCareerFamilyFrontendUrl(locale, CURATED_FAMILY_PATHS[0].slug),
            },
            {
              title: locale === "zh" ? "查看 342 职业数据库" : "View the 342-role dataset",
              description: locale === "zh" ? "了解公开职业覆盖范围。" : "See public coverage and boundaries.",
              href: withLocale("/datasets/occupations"),
            },
            {
              title: locale === "zh" ? "了解数据方法" : "Read the data method",
              description: locale === "zh" ? "查看来源、边界与使用方式。" : "Review sources, boundaries, and usage.",
              href: withLocale("/datasets/occupations/method"),
            },
          ]}
        />

        <section className="space-y-4" data-testid="career-landing-jobs-preview" data-authority-owner="backend_lightweight_jobs">
          <div className="space-y-2">
            <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "可以先看的职业" : "Roles you can inspect first"}
            </h2>
            <p className="m-0 max-w-2xl text-sm leading-6 text-slate-500">
              {locale === "zh" ? "这里只展示少量可公开参考的职业，不展示治理状态。" : "A small preview of public-safe roles, without exposing internal governance labels."}
            </p>
          </div>
          {topJobs.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-3">
              {topJobs.map((job) => {
                const stateCopy = getCareerV1StateCopy(governanceClosure?.membersBySlug[job.identity.canonicalSlug]?.governanceState ?? job.dataStatus);

                return (
                  <article key={job.identity.canonicalSlug} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="career-landing-job-card" data-career-data-status={job.dataStatus}>
                    <div className="space-y-3">
                      <ConfidenceBadge tone={stateCopy.tone}>{stateCopy.label}</ConfidenceBadge>
                      <h3 className="m-0 text-lg font-semibold tracking-tight text-slate-950">{job.titles.title}</h3>
                      <p className="m-0 text-sm leading-6 text-slate-500">
                        {job.truthSummary.outlookDescription || (locale === "zh" ? "职业资料已按可公开程度分层展示。" : "Profile information is shown according to public display boundaries.")}
                      </p>
                      <TrackedCareerLink
                        href={job.href}
                        eventName={CAREER_TRACKING_EVENTS.jobIndexResultClick}
                        eventPayload={{
                          locale,
                          entrySurface: "career_landing_jobs_preview",
                          sourcePageType: "career_landing",
                          targetAction: "open_job_detail",
                          landingPath,
                          routeFamily: "landing",
                          subjectKind: "job_slug",
                          subjectKey: job.identity.canonicalSlug,
                        }}
                        className="inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700"
                      >
                        {locale === "zh" ? "查看职业" : "View role"}
                      </TrackedCareerLink>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500" data-testid="career-landing-job-status" data-career-data-status="unavailable">
              {locale === "zh" ? "当前没有可公开展示的职业预览。" : "No public role previews are currently available."}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-500 md:p-6" data-testid="career-landing-trust-boundary" data-authority-owner="editorial_cta_only">
          <p className="m-0">
            {locale === "zh"
              ? "职业资料来自结构化职业数据库，并按可公开程度分层展示。"
              : "Career profiles come from a structured occupation dataset and are displayed according to public-readiness boundaries."}
          </p>
          <Link href={withLocale("/datasets/occupations/method")} className="mt-3 inline-flex font-semibold text-orange-600 hover:text-orange-700">
            {locale === "zh" ? "查看数据方法" : "View data method"}
          </Link>
        </section>

        {recommendationPreviewItems.length > 0 ? (
          <section className="sr-only" data-testid="career-landing-recommendation-preview" data-authority-owner="backend_lightweight_recommendations">
            {recommendationPreviewItems.map((item) => (
              <TrackedCareerLink
                key={item.recommendationSubjectMeta.publicRouteSlug}
                href={item.href}
                eventName={CAREER_TRACKING_EVENTS.recommendationResultClick}
                eventPayload={{
                  locale,
                  entrySurface: "career_landing_recommendation_preview",
                  sourcePageType: "career_landing",
                  targetAction: "open_recommendation_detail",
                  landingPath,
                  routeFamily: "landing",
                  subjectKind: "recommendation_type",
                  subjectKey: item.recommendationSubjectMeta.publicRouteSlug,
                }}
              >
                {item.recommendationSubjectMeta.displayTitle}
              </TrackedCareerLink>
            ))}
          </section>
        ) : null}
      </Container>
    </main>
  );
}
