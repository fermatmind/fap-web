import type { Metadata } from "next";
import Link from "next/link";
import { TrackedCareerLink } from "@/components/analytics/TrackedCareerLink";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Button, buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { ConfidenceBadge } from "@/components/career/v1/ConfidenceBoundary";
import { DecisionPathCard } from "@/components/career/v1/DecisionPathCard";
import { NextStepRail } from "@/components/career/v1/NextStepRail";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { adaptCareerSearch } from "@/lib/career/adapters/adaptCareerSearch";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import { adaptCareerLaunchGovernanceClosure } from "@/lib/career/adapters/adaptCareerLaunchGovernanceClosure";
import { fetchCareerLaunchGovernanceClosure } from "@/lib/career/api/fetchCareerLaunchGovernanceClosure";
import { fetchCareerSearch } from "@/lib/career/api/fetchCareerSearch";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { buildCareerFamilyFrontendUrl } from "@/lib/career/urls";
import { getCareerV1StateCopy } from "@/lib/career/ui/stateCopy";
import { localizedPath } from "@/lib/i18n/locales";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

function firstQueryValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return String(value[0] ?? "");
  }

  return String(value ?? "");
}

function normalizeSearchQuery(value: string | string[] | undefined): string {
  return firstQueryValue(value).trim();
}

const SEARCH_FAMILY_FALLBACK_CATALOG = [
  {
    slug: "software-engineering",
    title: { en: "Software Engineering", zh: "软件工程" },
    summary: {
      en: "Explore backend, frontend, platform, and product engineering paths.",
      zh: "先从后端、前端、平台与产品工程方向探索。",
    },
    queryTerms: ["software", "backend", "frontend", "fullstack", "full-stack", "developer", "engineer", "platform"],
  },
  {
    slug: "data-science",
    title: { en: "Data Science", zh: "数据科学" },
    summary: {
      en: "Explore analytics, machine learning, and data decision-support roles.",
      zh: "先从分析、机器学习与数据决策支持方向探索。",
    },
    queryTerms: ["data", "analytics", "ai", "ml", "machine", "algorithm", "science"],
  },
  {
    slug: "compliance",
    title: { en: "Compliance", zh: "合规与治理" },
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

function deriveFamilyFallbackSuggestions(query: string, locale: "en" | "zh"): SearchFamilyFallbackSuggestion[] {
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

  return SEARCH_FAMILY_FALLBACK_CATALOG.filter((item) => item.queryTerms.some((term) => matchesTerm(term))).map((item) => ({
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
        ? "搜索职业库，查看可公开参考的职业资料和下一步路径。"
        : "Search the job library and open public-safe role profiles with clear next steps.",
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
  const governanceClosure = adaptCareerLaunchGovernanceClosure({ payload: governanceClosurePayload });

  const filterByGovernance = <T extends { identity: { canonicalSlug: string } }>(items: T[]): T[] =>
    items.filter((item) => {
      const member = governanceClosure?.membersBySlug[item.identity.canonicalSlug];
      if (!member) {
        return true;
      }

      return member.governanceState !== "not_yet_mature";
    });

  const jobs = hasSearchQuery ? [] : filterByGovernance(adaptCareerJobIndex({ locale, payload: jobIndexPayload }));
  const searchResults = hasSearchQuery ? filterByGovernance(adaptCareerSearch({ locale, payload: searchPayload })) : [];
  const familyFallbackSuggestions = hasSearchQuery ? deriveFamilyFallbackSuggestions(submittedQuery, locale) : [];
  const hasSearchResults = searchResults.length > 0;
  const hasFamilyFallback = familyFallbackSuggestions.length > 0;
  const showResolveHandoffAssist = hasSearchQuery && (!hasSearchResults || hasFamilyFallback);
  const pageViewEventName = hasSearchQuery ? CAREER_TRACKING_EVENTS.jobSearchSubmit : CAREER_TRACKING_EVENTS.jobIndexView;
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
  const readyExposureTargetAction = hasSearchQuery ? "render_ready_search_result" : "render_ready_job_card";
  const readyExposureQueryMode = hasSearchQuery ? "query" : "non_query";

  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="div" className="space-y-12 py-12 md:space-y-16 md:py-20">
        <AnalyticsPageViewTracker
          eventName={pageViewEventName}
          properties={pageViewPayload}
          trackingKey={hasSearchQuery ? `query:${submittedQuery}` : "non_query"}
          enabled
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

        <section className="mx-auto max-w-4xl space-y-6" data-testid="career-job-search-form-shell">
          <div className="space-y-3 text-center">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Career Jobs</p>
            <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              {locale === "zh" ? "搜索职业库" : "Search the job library"}
            </h1>
            <p className="mx-auto m-0 max-w-2xl text-base leading-7 text-slate-500">
              {locale === "zh" ? "适合已经知道岗位名的人。俗称或模糊称呼请交给别名解析。" : "Use this when you know the role name. Send colloquial or fuzzy titles to resolve."}
            </p>
          </div>
          <form action={jobsPath} method="get" className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:flex md:items-center md:gap-3" data-testid="career-job-search-form">
            <input
              type="search"
              name="q"
              defaultValue={submittedQuery}
              placeholder={locale === "zh" ? "搜索职业名或标准标题" : "Search a role or standard title"}
              className="h-12 w-full rounded-full border border-transparent bg-slate-50 px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-orange-200"
              data-testid="career-job-search-input"
            />
            <div className="mt-3 flex gap-3 md:mt-0 md:shrink-0">
              <Button type="submit">{locale === "zh" ? "搜索职业" : "Search jobs"}</Button>
              {hasSearchQuery ? (
                <Link href={jobsPath} className={buttonVariants({ variant: "outline" })}>
                  {locale === "zh" ? "清除" : "Clear"}
                </Link>
              ) : null}
            </div>
          </form>
          <p className="m-0 text-center text-xs text-slate-500" data-testid="career-job-search-helper">
            {locale === "zh" ? "搜索结果页保持不被索引；职业详情页仍按自身展示边界决定。" : "Search result URLs stay noindex; role detail pages keep their own display boundaries."}
          </p>
        </section>

        {hasSearchQuery ? (
          <section className="space-y-6" data-testid="career-job-search-results">
            <div className="space-y-2">
              <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
                {locale === "zh" ? `“${submittedQuery}” 的搜索结果` : `Search results for “${submittedQuery}”`}
              </h2>
              <p className="m-0 text-sm leading-6 text-slate-500">
                {hasSearchResults
                  ? locale === "zh"
                    ? "找到可公开参考的职业结果。"
                    : "Public-safe role matches were found."
                  : locale === "zh"
                    ? "没有直接职业结果，可以尝试别名解析或从职业家族探索。"
                    : "No direct role matches were found. Try resolve or explore a career family."}
              </p>
              <p className="sr-only" data-testid={hasSearchResults && hasFamilyFallback ? "career-job-search-state-results-with-family-fallback" : hasSearchResults ? "career-job-search-state-results" : hasFamilyFallback ? "career-job-search-state-family-fallback-only" : "career-job-search-state-no-result"} />
            </div>

            {hasSearchResults ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {searchResults.map((result) => {
                  const stateCopy = getCareerV1StateCopy(result.dataStatus);

                  return (
                    <article key={`${result.identity.canonicalSlug}:${result.matchKind}:${result.matchedText ?? ""}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="career-job-search-card" data-career-data-status={result.dataStatus}>
                      <div className="space-y-3">
                        <ConfidenceBadge tone={stateCopy.tone}>{stateCopy.label}</ConfidenceBadge>
                        <h3 className="m-0 text-lg font-semibold tracking-tight text-slate-950">{result.titles.title}</h3>
                        <p className="m-0 text-sm leading-6 text-slate-500">
                          {result.matchedText
                            ? locale === "zh"
                              ? `匹配到：${result.matchedText}`
                              : `Matched text: ${result.matchedText}`
                            : locale === "zh"
                              ? "标准职业结果。"
                              : "Standard role result."}
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
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6" data-testid="career-job-search-empty-state" data-career-data-status="unavailable">
                <h2 className="m-0 text-lg font-semibold text-slate-950">
                  {locale === "zh" ? "暂无完整职业页" : "No direct public matching jobs were found"}
                </h2>
                <p className="m-0 mt-2 text-sm leading-6 text-slate-500">
                  {locale === "zh" ? "搜索不会本地补写职业资料，也不会把别名解析混进搜索结果。" : "Search does not synthesize role profiles or mix alias resolution into results."}
                </p>
              </div>
            )}

            {hasFamilyFallback ? (
              <section className="space-y-4" data-testid="career-job-search-family-fallback">
                <div className="space-y-1">
                  <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
                    {locale === "zh" ? "先从职业家族探索" : "Explore by career family first"}
                  </h2>
                  <p className="m-0 text-sm leading-6 text-slate-500">
                    {locale === "zh" ? "这是补充探索路径，不代表已完成职业解析。" : "This is a secondary exploration path, not an alias-resolution outcome."}
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {familyFallbackSuggestions.map((family) => (
                    <DecisionPathCard
                      key={family.slug}
                      eyebrow={locale === "zh" ? "职业家族" : "Career family"}
                      title={family.title}
                      summary={family.summary}
                      ctaLabel={locale === "zh" ? "查看职业家族" : "Open family hub"}
                      href={family.href}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {showResolveHandoffAssist ? (
              <NextStepRail
                title={locale === "zh" ? "下一步" : "Next steps"}
                description={locale === "zh" ? "如果这是俗称或模糊称呼，优先交给解析页。" : "If this is a fuzzy or colloquial title, resolve it before searching again."}
                testId="career-job-search-resolve-handoff-assist"
                items={[
                  {
                    title: locale === "zh" ? "去职业解析" : "Try career resolve",
                    description: locale === "zh" ? "把称呼匹配到职业或家族。" : "Match the title to a role or family.",
                    href: `${resolvePath}?q=${encodeURIComponent(submittedQuery)}`,
                  },
                  {
                    title: locale === "zh" ? "返回职业库" : "Back to job library",
                    description: locale === "zh" ? "重新浏览可公开职业。" : "Browse public-safe roles again.",
                    href: jobsPath,
                  },
                ]}
              />
            ) : null}
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" data-testid="career-job-index-results">
            {jobs.length > 0 ? (
              jobs.map((job) => {
                const stateCopy = getCareerV1StateCopy(governanceClosure?.membersBySlug[job.identity.canonicalSlug]?.governanceState ?? job.dataStatus);

                return (
                  <article key={job.identity.canonicalSlug} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="career-job-index-card" data-career-data-status={job.dataStatus}>
                    <div className="space-y-3">
                      <ConfidenceBadge tone={stateCopy.tone}>{stateCopy.label}</ConfidenceBadge>
                      <h2 className="m-0 text-lg font-semibold tracking-tight text-slate-950">{job.titles.title}</h2>
                      <p className="m-0 text-sm leading-6 text-slate-500">
                        {job.truthSummary.outlookDescription || (locale === "zh" ? "职业资料已按可公开程度展示。" : "Role information is displayed according to public readiness.")}
                      </p>
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
                        className="inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700"
                      >
                        {locale === "zh" ? "查看职业" : "View role"}
                      </TrackedCareerLink>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 md:col-span-2 xl:col-span-3" data-testid="career-job-index-status" data-career-data-status="unavailable">
                {locale === "zh" ? "当前没有可公开展示的职业索引项。" : "No public job index items are currently available."}
              </div>
            )}
          </section>
        )}
      </Container>
    </main>
  );
}
