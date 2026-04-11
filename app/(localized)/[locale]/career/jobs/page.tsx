import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { CareerAliasResolutionCandidates } from "@/components/career/CareerAliasResolutionCandidates";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { adaptCareerAliasResolution } from "@/lib/career/adapters/adaptCareerAliasResolution";
import { adaptCareerFirstWaveReadinessSummary } from "@/lib/career/adapters/adaptCareerFirstWaveReadinessSummary";
import { adaptCareerSearch } from "@/lib/career/adapters/adaptCareerSearch";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import { fetchCareerAliasResolution } from "@/lib/career/api/fetchCareerAliasResolution";
import { fetchCareerFirstWaveReadinessSummary } from "@/lib/career/api/fetchCareerFirstWaveReadinessSummary";
import { fetchCareerSearch } from "@/lib/career/api/fetchCareerSearch";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { filterJobFacingCardsByFirstWaveSummary } from "@/lib/career/firstWaveReadinessExposurePolicy";
import { buildCareerFamilyFrontendUrl, buildCareerJobFrontendUrl } from "@/lib/career/urls";
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
  const aliasResolutionPayload = hasSearchQuery
    ? await fetchCareerAliasResolution({ q: submittedQuery, locale })
    : null;
  const aliasResolution = hasSearchQuery
    ? adaptCareerAliasResolution({ locale, payload: aliasResolutionPayload })
    : null;

  if (aliasResolution?.resolution.resolvedKind === "occupation") {
    redirect(buildCareerJobFrontendUrl(locale, aliasResolution.resolution.occupation.canonicalSlug));
  }

  if (aliasResolution?.resolution.resolvedKind === "family") {
    redirect(buildCareerFamilyFrontendUrl(locale, aliasResolution.resolution.family.canonicalSlug));
  }

  const ambiguousResolution =
    aliasResolution?.resolution.resolvedKind === "ambiguous" ? aliasResolution.resolution : null;
  const hasAmbiguousResolution = ambiguousResolution !== null;
  const ambiguousCandidates = ambiguousResolution?.candidates ?? [];
  const [readinessSummaryPayload, jobIndexPayload, searchPayload] = await Promise.all([
    fetchCareerFirstWaveReadinessSummary({ locale }),
    hasSearchQuery ? Promise.resolve(null) : fetchCareerJobIndex({ locale }),
    hasSearchQuery && !hasAmbiguousResolution
      ? fetchCareerSearch({ q: submittedQuery, locale, limit: 12, mode: "auto" })
      : Promise.resolve(null),
  ]);
  const firstWaveReadinessSummary = adaptCareerFirstWaveReadinessSummary({
    payload: readinessSummaryPayload,
  });
  const jobs = hasSearchQuery
    ? []
    : filterJobFacingCardsByFirstWaveSummary(
        firstWaveReadinessSummary,
        adaptCareerJobIndex({ locale, payload: jobIndexPayload })
      );
  const searchResults = hasSearchQuery
    ? filterJobFacingCardsByFirstWaveSummary(
        firstWaveReadinessSummary,
        adaptCareerSearch({ locale, payload: searchPayload })
      )
    : [];
  const pageViewEventName = hasSearchQuery
    ? CAREER_TRACKING_EVENTS.jobSearchSubmit
    : CAREER_TRACKING_EVENTS.jobIndexView;
  const pageViewPayload = buildCareerAttributionPayload({
    locale,
    entrySurface: hasSearchQuery ? "career_job_search" : "career_job_index",
    sourcePageType: hasSearchQuery ? "career_job_search" : "career_job_index",
    targetAction: hasSearchQuery ? "submit_job_search" : "view_surface",
    landingPath: jobsPath,
    routeFamily: hasSearchQuery ? "jobs_search" : "jobs",
    queryMode: hasSearchQuery ? "query" : "non_query",
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
            ? "当前列表直接消费 backend B5 lightweight job index，不再回退到 CMS 职业列表 authority。"
            : "This list now consumes the backend B5 lightweight job index directly and does not fall back to the CMS job list authority."}
        </p>
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
      </section>

      {hasSearchQuery ? (
        <section className="space-y-3" data-testid="career-job-search-results">
          <div className="space-y-1">
            <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">
              {locale === "zh" ? "搜索结果" : "Search results"}
            </h2>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">
              {hasAmbiguousResolution
                ? locale === "zh"
                  ? `当前候选目标来自 backend authority resolver: “${submittedQuery}”。`
                  : `These candidate targets come from the backend authority resolver for “${submittedQuery}”.`
                : locale === "zh"
                  ? `当前结果来自 backend B6 conservative search: “${submittedQuery}”。`
                  : `These results come from the backend B6 conservative search for “${submittedQuery}”.`}
            </p>
          </div>

          {hasAmbiguousResolution ? (
            <CareerAliasResolutionCandidates
              locale={locale}
              candidates={ambiguousCandidates}
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {searchResults.length > 0 ? (
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
                    <CardTitle>{locale === "zh" ? "没有找到可公开展示的匹配职业" : "No public matching jobs were found"}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-[var(--fm-text-muted)]">
                    <p className="m-0">
                      {locale === "zh"
                        ? "当前搜索不会回退到 CMS 职业列表，也不会做更宽泛的本地匹配。"
                        : "This search does not fall back to the CMS job list and does not broaden into local matching."}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
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
