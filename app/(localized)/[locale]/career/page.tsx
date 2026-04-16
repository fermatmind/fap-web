import type { Metadata } from "next";
import Link from "next/link";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import { adaptCareerLaunchGovernanceClosure } from "@/lib/career/adapters/adaptCareerLaunchGovernanceClosure";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { adaptCareerRuntimeConfig } from "@/lib/career/adapters/adaptCareerRuntimeConfig";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { fetchCareerLaunchGovernanceClosure } from "@/lib/career/api/fetchCareerLaunchGovernanceClosure";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";
import { fetchCareerRuntimeConfig } from "@/lib/career/api/fetchCareerRuntimeConfig";
import { buildCareerFamilyFrontendUrl } from "@/lib/career/urls";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

function formatUsdAnnual(value: number | null, locale: "en" | "zh"): string {
  if (value === null) {
    return locale === "zh" ? "暂未提供" : "Not available yet";
  }

  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return "—";
  }

  return `${value}%`;
}

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
        ? "统一进入职业库、别名解析、职业家族与人格推荐的探索入口。"
        : "Unified exploration entry for jobs browsing, alias resolution, family hubs, and MBTI career recommendations.",
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
  const jobsPrimary = explorerPrimaryVariant === "jobs_first";
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
  }).slice(0, 2);

  const landingPath = withLocale("/career");
  const canonicalPath = locale === "zh" ? "/zh/career" : "/en/career";
  const pageTitle = locale === "zh" ? "职业探索入口" : "Career Explorer Shell";
  const pageDescription =
    locale === "zh"
      ? "统一进入职业库、别名解析、职业家族与人格推荐的探索入口。"
      : "Unified exploration entry for jobs browsing, alias resolution, family hubs, and MBTI career recommendations.";
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
    <Container as="main" className="space-y-8 py-10">
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
      <Breadcrumb
        items={[
          { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
          { name: locale === "zh" ? "职业" : "Career", path: canonicalPath },
        ].map((item, index) => ({
          label: item.name,
          href: index === 0 ? item.path : undefined,
        }))}
      />

      <section
        className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)]"
        data-testid="career-landing-hero"
        data-authority-owner="editorial_local_wrapper"
      >
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          Career Explorer
        </p>
        <h1 className="m-0 font-serif text-4xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "把职业探索收敛到一个入口" : "One shell for all career exploration paths"}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "在这里选择最合适的探索路径：直接找职业、解析别名、按家族浏览，或从人格进入推荐。页面治理状态由 full-342 closure authority 提供。"
            : "Choose the right exploration path here: browse jobs, resolve aliases, explore by family, or start from personality-based recommendations. Governance posture is sourced from the full-342 closure authority."}
        </p>
        {governanceClosure ? (
          <p className="m-0 text-xs text-[var(--fm-text-muted)]" data-testid="career-governance-closure-summary">
            {governanceClosure.publicStatement.allowedExternalStatement}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3">
          <Link href={withLocale("/career/jobs")} className={buttonVariants({ size: "lg" })}>
            {jobsPrimary
              ? locale === "zh"
                ? "浏览职业库（主路径）"
                : "Browse jobs (Primary)"
              : locale === "zh"
                ? "浏览职业库"
                : "Browse jobs"}
          </Link>
          <Link href={withLocale("/career/resolve")} className={buttonVariants({ variant: "outline", size: "lg" })}>
            {locale === "zh" ? "解析别名/俗称" : "Resolve alias terms"}
          </Link>
        </div>
        <p className="m-0 text-xs uppercase tracking-[0.1em] text-[var(--fm-text-muted)]" data-testid="career-explorer-primary-path-variant">
          {locale === "zh" ? "入口强调" : "Entry emphasis"}: {explorerPrimaryVariant}
        </p>
        <form
          action={withLocale("/career/jobs")}
          method="get"
          className="flex flex-col gap-3 md:flex-row md:items-center"
          data-testid="career-landing-search-entry"
        >
          <input
            type="search"
            name="q"
            placeholder={locale === "zh" ? "输入职业标准名、别名或俗称" : "Enter role title, alias, or colloquial name"}
            className="h-12 w-full rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-4 text-sm text-[var(--fm-text)] outline-none ring-0 placeholder:text-[var(--fm-text-muted)] focus:border-[var(--fm-accent)]"
          />
          <div className="flex flex-wrap gap-2">
            <button type="submit" className={buttonVariants({ variant: "outline" })}>
              {locale === "zh" ? "直接搜索职业" : "Search jobs directly"}
            </button>
            <button
              type="submit"
              formAction={withLocale("/career/resolve")}
              className={buttonVariants({ variant: "ghost" })}
            >
              {locale === "zh" ? "按别名解析" : "Resolve alias instead"}
            </button>
          </div>
        </form>
      </section>

      <section
        className="space-y-3"
        data-testid="career-explorer-pathways"
        data-authority-owner="editorial_ia_shell"
      >
        <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">
          {locale === "zh" ? "选择你的探索路径" : "Choose your exploration path"}
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Card
            data-testid="career-pathway-jobs"
            className={jobsPrimary ? "ring-2 ring-[var(--fm-accent)]/25" : undefined}
          >
            <CardHeader>
              <CardTitle>{locale === "zh" ? "直接找职业（主路径）" : "Direct job browsing (Primary)"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">
                {locale === "zh"
                  ? "适合知道目标岗位、标准职业名或想先看职业库的人。"
                  : "Best when you know the role or want conservative search in the jobs library."}
              </p>
              <Link href={withLocale("/career/jobs")} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                {locale === "zh" ? "进入职业库 / 搜索" : "Open jobs library"}
              </Link>
            </CardContent>
          </Card>
          <Card
            data-testid="career-pathway-resolve"
            className={!jobsPrimary ? "ring-2 ring-[var(--fm-accent)]/25" : undefined}
          >
            <CardHeader>
              <CardTitle>{locale === "zh" ? "别名/俗称解析" : "Alias / colloquial resolution"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">
                {locale === "zh"
                  ? "适合输入模糊职业称呼，需要系统先做解析和分流。"
                  : "Use this when the query is fuzzy and needs alias resolution or disambiguation first."}
              </p>
              <Link href={withLocale("/career/resolve")} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                {locale === "zh" ? "进入解析页面" : "Open resolve page"}
              </Link>
            </CardContent>
          </Card>
          <Card data-testid="career-pathway-family">
            <CardHeader>
              <CardTitle>{locale === "zh" ? "按职业家族探索" : "Explore by career family"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">
                {locale === "zh"
                  ? "适合不知道具体岗位，但知道方向领域的人。"
                  : "Start broad with domain-level families before selecting specific jobs."}
              </p>
              <Link
                href={buildCareerFamilyFrontendUrl(locale, CURATED_FAMILY_PATHS[0].slug)}
                className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
              >
                {locale === "zh" ? "进入职业家族" : "Open family hub"}
              </Link>
            </CardContent>
          </Card>
          <Card data-testid="career-pathway-recommendation">
            <CardHeader>
              <CardTitle>{locale === "zh" ? "从人格进入职业方向" : "Enter from personality profile"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">
                {locale === "zh"
                  ? "适合从 MBTI 结果进入职业方向，再下钻到具体岗位。"
                  : "Use MBTI-based recommendation paths to move from profile to role direction."}
              </p>
              <Link href={withLocale("/career/recommendations")} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                {locale === "zh" ? "进入推荐入口" : "Open recommendations"}
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      <section
        className="space-y-3"
        data-testid="career-landing-jobs-preview"
        data-authority-owner="backend_lightweight_jobs"
      >
        <div className="space-y-1">
          <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">{locale === "zh" ? "职业库快速预览" : "Jobs quick preview"}</h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "这部分只显示后端 authority 放行的轻量职业卡片，用于入口预览，不替代职业详情页。"
              : "This lightweight preview only shows backend-approved cards as entry signals, not as a substitute for job detail pages."}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {topJobs.length > 0 ? (
            topJobs.map((job) => (
              <Card
                key={job.identity.canonicalSlug}
                data-testid="career-landing-job-card"
                data-career-data-status={job.dataStatus}
              >
                <CardHeader>
                  <div className="space-y-2">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                      {job.identity.canonicalSlug}
                    </p>
                    <CardTitle className="text-lg">{job.titles.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                  <p className="m-0">
                    {job.truthSummary.outlookDescription ||
                      (locale === "zh"
                        ? "仅展示后端 authority 放行的轻量摘要。"
                        : "Only lightweight summaries explicitly allowed by backend authority are shown.")}
                  </p>
                  <p className="m-0">
                    {locale === "zh" ? "薪资" : "Salary"}: {formatUsdAnnual(job.truthSummary.medianPayUsdAnnual, locale)}
                  </p>
                  <p className="m-0">
                    {locale === "zh" ? "十年增速" : "Ten-year outlook"}:{" "}
                    {formatPercent(job.truthSummary.outlookPct20242034)}
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
                    className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                  >
                    {locale === "zh" ? "查看职业详情" : "View role profile"}
                  </TrackedCareerLink>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="md:col-span-3" data-testid="career-landing-job-status" data-career-data-status="unavailable">
              <CardHeader>
                <CardTitle>{locale === "zh" ? "当前没有可公开展示的职业预览" : "No public job previews are currently available"}</CardTitle>
              </CardHeader>
            </Card>
          )}
        </div>
      </section>

      <section
        className="space-y-3"
        data-testid="career-family-exploration"
        data-authority-owner="editorial_curated_family_paths"
      >
        <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">
          {locale === "zh" ? "职业家族探索层" : "Career family exploration layer"}
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {CURATED_FAMILY_PATHS.map((family) => (
            <Link
              key={family.slug}
              href={buildCareerFamilyFrontendUrl(locale, family.slug)}
              className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 text-sm transition hover:border-[var(--fm-accent)]"
              data-testid="career-family-entry-link"
            >
              <p className="m-0 text-base font-semibold text-[var(--fm-text)]">{family.title[locale]}</p>
              <p className="mt-2 text-xs text-[var(--fm-text-muted)]">{family.summary[locale]}</p>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="space-y-3"
        data-testid="career-landing-recommendation-preview"
        data-authority-owner="backend_lightweight_recommendations"
      >
        <div className="space-y-1">
          <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">
            {locale === "zh" ? "人格推荐承接" : "Personality recommendation bridge"}
          </h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "推荐入口属于职业探索体系的一部分：先看人格方向，再下钻到职业页面。"
              : "Recommendation entry is part of the same exploration system: start from profile direction, then drill into job-level pages."}
          </p>
        </div>
        {recommendationPreviewItems.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {recommendationPreviewItems.map((item) => (
              <Card
                key={item.recommendationSubjectMeta.publicRouteSlug}
                data-testid="career-landing-recommendation-card"
                data-career-data-status={item.dataStatus}
              >
                <CardHeader>
                  <CardTitle className="text-lg">{item.recommendationSubjectMeta.displayTitle}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                  <p className="m-0">
                    {locale === "zh" ? "推荐路由" : "Recommendation route"}: /
                    {item.recommendationSubjectMeta.publicRouteSlug}
                  </p>
                  <TrackedCareerLink
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
                    className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                  >
                    {locale === "zh" ? "查看 recommendation detail" : "View recommendation detail"}
                  </TrackedCareerLink>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card data-testid="career-landing-recommendation-status" data-career-data-status="unavailable">
            <CardHeader>
              <CardTitle>
                {locale === "zh" ? "当前没有可公开展示的推荐预览" : "No public recommendation previews are currently available"}
              </CardTitle>
            </CardHeader>
          </Card>
        )}
        <div className="flex flex-wrap gap-3">
          <Link href={withLocale("/career/recommendations")} className={buttonVariants({ variant: "outline" })}>
            {locale === "zh" ? "进入推荐入口" : "Open recommendations"}
          </Link>
          <Link href={withLocale("/career/tests/riasec")} className={buttonVariants({ variant: "outline" })}>
            {locale === "zh" ? "先做职业测试" : "Start with a career test"}
          </Link>
        </div>
      </section>

      <section
        className="space-y-3 rounded-2xl border border-dashed border-[var(--fm-border)] bg-[var(--fm-surface)] p-5"
        data-testid="career-landing-trust-boundary"
        data-authority-owner="editorial_cta_only"
      >
        <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">
          {locale === "zh" ? "方法边界与信任说明" : "Method boundary and trust notes"}
        </h2>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "该入口页只负责探索路径分流；职业真值由后端 authority 页面提供。"
            : "This shell handles path selection only; authority truth stays in dedicated backend-backed pages."}
        </p>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "浏览、解析、推荐是三条独立语义路径，避免在一个页面混合承载。"
            : "Browsing, resolution, and recommendation are intentionally separated semantics, not mixed into one page contract."}
        </p>
      </section>
    </Container>
  );
}
