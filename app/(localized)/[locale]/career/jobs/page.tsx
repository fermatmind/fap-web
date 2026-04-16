import type { Metadata } from "next";
import Link from "next/link";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { adaptCareerSearch } from "@/lib/career/adapters/adaptCareerSearch";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import { adaptCareerLaunchGovernanceClosure } from "@/lib/career/adapters/adaptCareerLaunchGovernanceClosure";
import { fetchCareerLaunchGovernanceClosure } from "@/lib/career/api/fetchCareerLaunchGovernanceClosure";
import { fetchCareerSearch } from "@/lib/career/api/fetchCareerSearch";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { buildCareerFamilyFrontendUrl } from "@/lib/career/urls";
import { localizedPath } from "@/lib/i18n/locales";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

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

function formatPercent(value: number | null, locale: "en" | "zh"): string {
  if (value === null) {
    return locale === "zh" ? "暂未提供" : "Not available yet";
  }

  return locale === "zh" ? `${value}%` : `${value}%`;
}

function renderLightweightJobStatusNotice(dataStatus: "available" | "trust_limited" | "unavailable", locale: "en" | "zh") {
  if (dataStatus === "available") {
    return null;
  }

  return (
    <p className="m-0">
      {dataStatus === "trust_limited"
        ? locale === "zh"
          ? "当前卡片处于 trust-limited 模式，仅显示后端明确放行的轻量状态信息。"
          : "This card is currently in trust-limited mode and only shows the lightweight status information explicitly allowed by the backend."
        : locale === "zh"
          ? "当前卡片不可用，页面不会本地合成职业事实。"
          : "This card is currently unavailable, and the page does not synthesize local career facts."}
    </p>
  );
}

function firstQueryValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return String(value[0] ?? "");
  }

  return String(value ?? "");
}

function normalizeSearchQuery(value: string | string[] | undefined): string {
  return firstQueryValue(value).trim();
}

function renderSearchStatusNotice(dataStatus: "available" | "trust_limited" | "unavailable", locale: "en" | "zh") {
  if (dataStatus === "available") {
    return null;
  }

  return (
    <p className="m-0">
      {dataStatus === "trust_limited"
        ? locale === "zh"
          ? "当前搜索结果处于 trust-limited 模式，仅显示后端明确放行的轻量状态。"
          : "This search result is in trust-limited mode and only shows the lightweight status explicitly allowed by the backend."
        : locale === "zh"
          ? "当前搜索结果不可用，页面不会本地合成职业事实。"
          : "This search result is unavailable, and the page does not synthesize local career facts."}
    </p>
  );
}

const SEARCH_FAMILY_FALLBACK_CATALOG = [
  {
    slug: "software-engineering",
    title: {
      en: "Software Engineering",
      zh: "软件工程",
    },
    summary: {
      en: "Explore backend, frontend, platform, and product engineering paths.",
      zh: "先从后端、前端、平台与产品工程方向探索。",
    },
    queryTerms: ["software", "backend", "frontend", "fullstack", "full-stack", "developer", "engineer", "platform"],
  },
  {
    slug: "data-science",
    title: {
      en: "Data Science",
      zh: "数据科学",
    },
    summary: {
      en: "Explore analytics, machine learning, and data decision-support roles.",
      zh: "先从分析、机器学习与数据决策支持方向探索。",
    },
    queryTerms: ["data", "analytics", "ai", "ml", "machine", "algorithm", "science"],
  },
  {
    slug: "compliance",
    title: {
      en: "Compliance",
      zh: "合规与治理",
    },
    summary: {
      en: "Explore governance, policy, risk, and audit-oriented tracks.",
      zh: "先从治理、政策、风险与审计方向探索。",
    },
    queryTerms: ["compliance", "audit", "risk", "policy", "governance"],
  },
] as const;

type SearchFamilyFallbackSuggestion = {
  slug: string;
  title: string;
  summary: string;
  href: string;
};

function deriveFamilyFallbackSuggestions(
  query: string,
  locale: "en" | "zh"
): SearchFamilyFallbackSuggestion[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  const queryTokens = normalizedQuery
    .split(/[^a-z0-9]+/g)
    .map((token) => token.trim())
    .filter(Boolean);

  const matchesTerm = (term: string) => {
    const normalizedTerm = term.trim().toLowerCase();
    if (!normalizedTerm) {
      return false;
    }

    if (normalizedTerm.length <= 2) {
      return queryTokens.includes(normalizedTerm);
    }

    return normalizedQuery.includes(normalizedTerm);
  };

  return SEARCH_FAMILY_FALLBACK_CATALOG.filter((item) =>
    item.queryTerms.some((term) => matchesTerm(term))
  ).map((item) => ({
    slug: item.slug,
    title: item.title[locale],
    summary: item.summary[locale],
    href: buildCareerFamilyFrontendUrl(locale, item.slug),
  }));
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = resolveLocale(localeParam);
  const pathname = locale === "zh" ? "/zh/career/jobs" : "/en/career/jobs";
  const submittedQuery = normalizeSearchQuery(resolvedSearchParams.q);

  return buildPageMetadata({
    locale,
    pathname: submittedQuery ? `${pathname}?q=${encodeURIComponent(submittedQuery)}` : pathname,
    canonicalPathname: pathname,
    title: locale === "zh" ? "职业库" : "Career Job Library",
    description:
      locale === "zh"
        ? "基于 backend authority 轻量索引浏览职业事实、评分摘要与信任边界。"
        : "Browse job facts, compact score summaries, and trust boundaries from the backend authority index.",
    noindex: submittedQuery.length > 0,
    alternatesByLocale: {
      en: "/en/career/jobs",
      zh: "/zh/career/jobs",
      xDefault: "/",
    },
  });
}

export default async function CareerJobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = resolveLocale(localeParam);
  const submittedQuery = normalizeSearchQuery(resolvedSearchParams.q);
  const hasSearchQuery = submittedQuery.length > 0;
  const jobsPath = localizedPath("/career/jobs", locale);
  const resolvePath = localizedPath("/career/resolve", locale);
  const [governanceClosurePayload, jobIndexPayload, searchPayload] = await Promise.all([
    fetchCareerLaunchGovernanceClosure({ locale }),
    hasSearchQuery ? Promise.resolve(null) : fetchCareerJobIndex({ locale }),
    hasSearchQuery ? fetchCareerSearch({ q: submittedQuery, locale, limit: 12, mode: "auto" }) : Promise.resolve(null),
  ]);
  const governanceClosure = adaptCareerLaunchGovernanceClosure({
    payload: governanceClosurePayload,
  });

  const filterByGovernance = <T extends { identity: { canonicalSlug: string } }>(items: T[]): T[] =>
    items.filter((item) => {
      const member = governanceClosure?.membersBySlug[item.identity.canonicalSlug];
      if (!member) {
        return true;
      }

      return member.governanceState !== "not_yet_mature";
    });

  const jobs = hasSearchQuery
    ? []
    : filterByGovernance(adaptCareerJobIndex({ locale, payload: jobIndexPayload }));
  const searchResults = hasSearchQuery
    ? filterByGovernance(adaptCareerSearch({ locale, payload: searchPayload }))
    : [];
  const familyFallbackSuggestions = hasSearchQuery
    ? deriveFamilyFallbackSuggestions(submittedQuery, locale)
    : [];
  const hasSearchResults = searchResults.length > 0;
  const hasFamilyFallback = familyFallbackSuggestions.length > 0;
  const showResolveHandoffAssist = hasSearchQuery && (!hasSearchResults || hasFamilyFallback);
  const shouldTrackSearchSubmitPageView = hasSearchQuery;
  const pageViewEventName = hasSearchQuery
    ? CAREER_TRACKING_EVENTS.jobSearchSubmit
    : CAREER_TRACKING_EVENTS.jobIndexView;
  const pageViewPayload = buildCareerAttributionPayload({
    locale,
    entrySurface: shouldTrackSearchSubmitPageView ? "career_job_search" : "career_job_index",
    sourcePageType: shouldTrackSearchSubmitPageView ? "career_job_search" : "career_job_index",
    targetAction: shouldTrackSearchSubmitPageView ? "submit_job_search" : "view_surface",
    landingPath: jobsPath,
    routeFamily: shouldTrackSearchSubmitPageView ? "jobs_search" : "jobs",
    queryMode: shouldTrackSearchSubmitPageView ? "query" : "non_query",
  });
  const readyExposureCards = hasSearchQuery ? searchResults : jobs;
  const readyExposureSurface = hasSearchQuery ? "career_job_search_results" : "career_job_index";
  const readyExposureRouteFamily = hasSearchQuery ? "jobs_search" : "jobs";
  const readyExposureTargetAction = hasSearchQuery
    ? "render_ready_search_result"
    : "render_ready_job_card";
  const readyExposureQueryMode = hasSearchQuery ? "query" : "non_query";

  return (
    <Container as="main" className="space-y-6 py-10">
      <AnalyticsPageViewTracker
        eventName={pageViewEventName}
        properties={pageViewPayload}
        trackingKey={hasSearchQuery ? `query:${submittedQuery}` : "non_query"}
        enabled={!hasSearchQuery || shouldTrackSearchSubmitPageView}
      />
      {readyExposureCards.map((item) => (
        <AnalyticsPageViewTracker
          key={`career-ready-exposure:${item.identity.canonicalSlug}:${readyExposureSurface}`}
          eventName={CAREER_TRACKING_EVENTS.readySurfaceExposed}
          properties={buildCareerAttributionPayload({
            locale,
            entrySurface: readyExposureSurface,
            sourcePageType: hasSearchQuery ? "career_job_search" : "career_job_index",
            targetAction: readyExposureTargetAction,
            landingPath: jobsPath,
            routeFamily: readyExposureRouteFamily,
            subjectKind: "job_slug",
            subjectKey: item.identity.canonicalSlug,
            queryMode: readyExposureQueryMode,
          })}
        />
      ))}
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">Career Jobs</p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "职业库" : "Job library"}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "当前列表消费 full-342 backend authority，并遵循 unified governance closure 的公开分层。"
            : "This list consumes full-342 backend authority and follows the unified governance closure public-state layering."}
        </p>
        {governanceClosure ? (
          <p className="m-0 text-xs text-[var(--fm-text-muted)]" data-testid="career-jobs-governance-summary">
            {governanceClosure.publicStatement.allowedExternalStatement}
          </p>
        ) : null}
        <form
          action={jobsPath}
          method="get"
          className="flex flex-col gap-3 md:flex-row md:items-center"
          data-testid="career-job-search-form"
        >
          <input
            type="search"
            name="q"
            defaultValue={submittedQuery}
            placeholder={locale === "zh" ? "搜索职业 slug、标题或别名" : "Search slug, title, or alias"}
            className="h-12 w-full rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-4 text-sm text-[var(--fm-text)] outline-none ring-0 placeholder:text-[var(--fm-text-muted)] focus:border-[var(--fm-accent)]"
            data-testid="career-job-search-input"
          />
          <div className="flex gap-3">
            <Button type="submit">{locale === "zh" ? "搜索职业" : "Search jobs"}</Button>
            {hasSearchQuery ? (
              <Link
                href={jobsPath}
                className="inline-flex h-12 min-h-[48px] items-center justify-center rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface)] px-4 text-sm font-semibold text-[var(--fm-text)] hover:border-[var(--fm-accent)]"
              >
                {locale === "zh" ? "清除搜索" : "Clear search"}
              </Link>
            ) : null}
          </div>
        </form>
        <p className="m-0 text-xs text-[var(--fm-text-muted)]" data-testid="career-job-search-helper">
          {locale === "zh"
            ? "标准职业名建议直接搜索；俗称或模糊称呼可转到职业解析页。"
            : "Use standard role names for direct search; colloquial aliases can be handed off to career resolve."}
        </p>
      </section>

      {hasSearchQuery ? (
        <section className="space-y-3" data-testid="career-job-search-results">
          <div className="space-y-1">
            <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">
              {locale === "zh" ? "搜索结果" : "Search results"}
            </h2>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">
              {locale === "zh"
                ? `当前结果来自 backend conservative search，并按 unified governance closure 过滤： “${submittedQuery}”。`
                : `These results come from backend conservative search and are filtered by the unified governance closure: “${submittedQuery}”.`}
            </p>
            {hasSearchResults && hasFamilyFallback ? (
              <p
                className="m-0 text-sm text-[var(--fm-text-muted)]"
                data-testid="career-job-search-state-results-with-family-fallback"
              >
                {locale === "zh"
                  ? "已找到职业结果，同时提供职业家族作为补充探索路径。"
                  : "Direct job results were found, with family exploration offered as a secondary path."}
              </p>
            ) : hasSearchResults ? (
              <p
                className="m-0 text-sm text-[var(--fm-text-muted)]"
                data-testid="career-job-search-state-results"
              >
                {locale === "zh"
                  ? "已找到可公开展示的职业结果。"
                  : "Direct public job matches were found."}
              </p>
            ) : hasFamilyFallback ? (
              <p
                className="m-0 text-sm text-[var(--fm-text-muted)]"
                data-testid="career-job-search-state-family-fallback-only"
              >
                {locale === "zh"
                  ? "当前没有直接职业结果，推荐先按职业家族继续探索。"
                  : "No direct jobs were found; explore by family as the next step."}
              </p>
            ) : (
              <p
                className="m-0 text-sm text-[var(--fm-text-muted)]"
                data-testid="career-job-search-state-no-result"
              >
                {locale === "zh"
                  ? "当前没有职业结果，也没有匹配的家族建议。"
                  : "No direct jobs or family suggestions were found for this query."}
              </p>
            )}
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {hasSearchResults ? (
              searchResults.map((result) => (
                <Card
                  key={`${result.identity.canonicalSlug}:${result.matchKind}:${result.matchedText ?? ""}`}
                  data-testid="career-job-search-card"
                  data-career-data-status={result.dataStatus}
                >
                  <CardHeader>
                    <div className="space-y-2">
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                        {result.identity.canonicalSlug}
                      </p>
                      <CardTitle className="text-lg">{result.titles.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                    <p className="m-0">
                      {locale === "zh" ? "匹配类型" : "Match kind"}: {result.matchKind}
                    </p>
                    {result.matchedText ? (
                      <p className="m-0">
                        {locale === "zh" ? "匹配文本" : "Matched text"}: {result.matchedText}
                      </p>
                    ) : null}
                    {renderSearchStatusNotice(result.dataStatus, locale)}
                    <p className="m-0">
                      {locale === "zh" ? "Reviewer" : "Reviewer"}:{" "}
                      {result.trustSummary.reviewerStatus ?? "unknown"}
                    </p>
                    <TrackedCareerLink
                      href={result.href}
                      eventName={CAREER_TRACKING_EVENTS.jobSearchResultClick}
                      eventPayload={{
                        locale,
                        entrySurface: "career_job_search_results",
                        sourcePageType: "career_job_search",
                        targetAction: "open_job_detail",
                        landingPath: jobsPath,
                        routeFamily: "jobs_search",
                        subjectKind: "job_slug",
                        subjectKey: result.identity.canonicalSlug,
                        queryMode: "query",
                      }}
                      className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                    >
                      {locale === "zh" ? "查看详情" : "View details"}
                    </TrackedCareerLink>
                  </CardContent>
                </Card>
              ))
            ) : (
                <Card
                  className="md:col-span-2 xl:col-span-3"
                  data-testid="career-job-search-empty-state"
                  data-career-data-status="unavailable"
                >
                  <CardHeader>
                    <CardTitle>
                      {locale === "zh"
                        ? "没有找到直接匹配的可公开职业结果"
                        : "No direct public matching jobs were found"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
                    <p className="m-0">
                      {locale === "zh"
                        ? "当前搜索不会回退到 CMS 职业列表，也不会在本地扩展成解析逻辑。"
                        : "This search does not fall back to the CMS job list and does not expand into local resolution logic."}
                    </p>
                    <div className="flex flex-wrap gap-3" data-testid="career-job-search-no-result-actions">
                      <Link
                        href={`${resolvePath}?q=${encodeURIComponent(submittedQuery)}`}
                        className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-full bg-[var(--fm-accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--fm-accent-strong)]"
                      >
                        {locale === "zh" ? "去职业解析" : "Try career resolve"}
                      </Link>
                      <Link
                        href={jobsPath}
                        className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-full border border-[var(--fm-border)] px-4 text-sm font-semibold text-[var(--fm-text)] hover:border-[var(--fm-accent)]"
                      >
                        {locale === "zh" ? "返回职业库" : "Back to job library"}
                      </Link>
                    </div>
                  </CardContent>
                </Card>
            )}
          </div>
          {hasFamilyFallback ? (
            <Card
              data-testid="career-job-search-family-fallback"
              className="border-[var(--fm-border)] bg-[var(--fm-surface)]"
            >
              <CardHeader>
                <CardTitle>
                  {locale === "zh"
                    ? "可尝试的职业家族方向（补充探索）"
                    : "Career family directions to explore (Secondary)"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="m-0 text-sm text-[var(--fm-text-muted)]">
                  {locale === "zh"
                    ? "这是补充探索路径，不代表已完成职业解析。"
                    : "This is a secondary exploration path, not an alias-resolution outcome."}
                </p>
                <div className="grid gap-3 md:grid-cols-2">
                  {familyFallbackSuggestions.map((family) => (
                    <article
                      key={family.slug}
                      className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
                      data-testid="career-job-search-family-fallback-card"
                    >
                      <p className="m-0 text-sm font-semibold text-[var(--fm-text)]">{family.title}</p>
                      <p className="mt-2 text-xs text-[var(--fm-text-muted)]">{family.summary}</p>
                      <Link
                        href={family.href}
                        className="mt-3 inline-flex items-center text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                      >
                        {locale === "zh" ? "查看职业家族" : "Open family hub"}
                      </Link>
                    </article>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
          {showResolveHandoffAssist ? (
            <Card data-testid="career-job-search-resolve-handoff-assist">
              <CardHeader>
                <CardTitle>{locale === "zh" ? "模糊称呼可交给职业解析" : "Use career resolve for fuzzy aliases"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  {locale === "zh"
                    ? "如果你输入的是俗称、行业黑话或模糊称呼，建议交给解析页面做职业/家族分流。"
                    : "If the query is colloquial or ambiguous, use resolve to disambiguate into job or family targets."}
                </p>
                <Link
                  href={`${resolvePath}?q=${encodeURIComponent(submittedQuery)}`}
                  className="inline-flex items-center font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {locale === "zh" ? "转到职业解析" : "Go to career resolve"}
                </Link>
              </CardContent>
            </Card>
          ) : null}
        </section>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {jobs.length > 0 ? (
          jobs.map((job) => (
            <Card
              key={job.identity.canonicalSlug}
              data-testid="career-job-index-card"
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
              <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  {job.truthSummary.outlookDescription ||
                    (locale === "zh"
                      ? "当前卡片只显示 backend authority 明确提供的轻量摘要。"
                      : "This card only shows the lightweight summary explicitly provided by the backend authority.")}
                </p>
                {job.dataStatus === "available" ? (
                  <div className="space-y-1">
                    <p className="m-0">
                      {locale === "zh" ? "薪资" : "Salary"}:{" "}
                      {formatUsdAnnual(job.truthSummary.medianPayUsdAnnual, locale)}
                    </p>
                    <p className="m-0">
                      {locale === "zh" ? "十年增速" : "Ten-year outlook"}:{" "}
                      {formatPercent(job.truthSummary.outlookPct20242034, locale)}
                    </p>
                    <p className="m-0">
                      {locale === "zh" ? "Fit 分数" : "Fit score"}:{" "}
                      {job.scoreSummary.fitScore.value ?? "—"}
                    </p>
                    <p className="m-0">
                      {locale === "zh" ? "Confidence 分数" : "Confidence score"}:{" "}
                      {job.scoreSummary.confidenceScore.value ?? "—"}
                    </p>
                    <p className="m-0">
                      {locale === "zh" ? "Reviewer" : "Reviewer"}:{" "}
                      {job.trustSummary.reviewerStatus ?? "unknown"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {renderLightweightJobStatusNotice(job.dataStatus, locale)}
                    <p className="m-0">
                      {locale === "zh" ? "Reviewer" : "Reviewer"}:{" "}
                      {job.trustSummary.reviewerStatus ?? "unknown"}
                    </p>
                  </div>
                )}
                <TrackedCareerLink
                  href={job.href}
                  eventName={CAREER_TRACKING_EVENTS.jobIndexResultClick}
                  eventPayload={{
                    locale,
                    entrySurface: "career_job_index",
                    sourcePageType: "career_job_index",
                    targetAction: "open_job_detail",
                    landingPath: jobsPath,
                    routeFamily: "jobs",
                    subjectKind: "job_slug",
                    subjectKey: job.identity.canonicalSlug,
                    queryMode: "non_query",
                  }}
                  className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {locale === "zh" ? "查看详情" : "View details"}
                </TrackedCareerLink>
              </CardContent>
            </Card>
          ))
          ) : (
            <Card
              className="md:col-span-2 xl:col-span-3"
              data-testid="career-job-index-status"
              data-career-data-status="unavailable"
            >
              <CardHeader>
                <CardTitle>{locale === "zh" ? "当前没有可公开展示的职业索引项" : "No public job index items are currently available"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  {locale === "zh"
                    ? "backend lightweight job index 当前未返回可渲染条目，因此页面不会回退到 CMS 职业列表。"
                    : "The backend lightweight job index did not return renderable items, so this page does not fall back to the CMS job list."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </Container>
  );
}
