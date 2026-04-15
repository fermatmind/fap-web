import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CareerAliasResolutionCandidates } from "@/components/career/CareerAliasResolutionCandidates";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { adaptCareerAliasResolution } from "@/lib/career/adapters/adaptCareerAliasResolution";
import { fetchCareerAliasResolution } from "@/lib/career/api/fetchCareerAliasResolution";
import { buildCareerFamilyFrontendUrl, buildCareerJobFrontendUrl } from "@/lib/career/urls";
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
  const submittedQuery = normalizeSearchQuery(resolvedSearchParams.q);
  const pathname = locale === "zh" ? "/zh/career/resolve" : "/en/career/resolve";

  return buildPageMetadata({
    locale,
    pathname: submittedQuery ? `${pathname}?q=${encodeURIComponent(submittedQuery)}` : pathname,
    canonicalPathname: pathname,
    title: locale === "zh" ? "职业解析" : "Career Resolve",
    description:
      locale === "zh"
        ? "基于 backend alias-resolution authority 进行职业别名解析与歧义候选分流。"
        : "Resolve career aliases and disambiguation candidates from backend alias-resolution authority.",
    noindex: true,
    alternatesByLocale: {
      en: "/en/career/resolve",
      zh: "/zh/career/resolve",
      xDefault: "/",
    },
  });
}

export default async function CareerResolvePage({
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
  const hasQuery = submittedQuery.length > 0;
  const resolvePath = localizedPath("/career/resolve", locale);

  const aliasResolutionPayload = hasQuery
    ? await fetchCareerAliasResolution({ q: submittedQuery, locale })
    : null;
  const aliasResolution = hasQuery
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
  const isAliasResolutionNoResult = aliasResolution?.resolution.resolvedKind === "none";
  const ambiguousCandidates = ambiguousResolution?.candidates ?? [];

  return (
    <Container as="main" className="space-y-6 py-10">
      {hasQuery ? (
        <AnalyticsPageViewTracker
          eventName={CAREER_TRACKING_EVENTS.aliasResolutionSubmit}
          properties={buildCareerAttributionPayload({
            locale,
            entrySurface: "career_alias_disambiguation",
            sourcePageType: "career_alias_disambiguation",
            targetAction: "submit_alias_resolution",
            landingPath: resolvePath,
            routeFamily: "alias_resolution",
            subjectKind: "none",
            queryMode: "query",
          })}
          trackingKey={`alias-resolution-submit:${submittedQuery}`}
        />
      ) : null}
      {isAliasResolutionNoResult ? (
        <AnalyticsPageViewTracker
          eventName={CAREER_TRACKING_EVENTS.aliasResolutionNoResult}
          properties={buildCareerAttributionPayload({
            locale,
            entrySurface: "career_alias_disambiguation",
            sourcePageType: "career_alias_disambiguation",
            targetAction: "no_alias_resolution_match",
            landingPath: resolvePath,
            routeFamily: "alias_resolution",
            subjectKind: "none",
            queryMode: "query",
          })}
          trackingKey={`alias-resolution-no-result:${submittedQuery}`}
        />
      ) : null}

      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          Career Resolve
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "职业别名解析" : "Career alias resolution"}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "该页面只承载 backend alias-resolution authority 的解析结果，不承担 jobs index 或 conservative search 语义。"
            : "This page only renders backend alias-resolution authority outcomes and does not act as a jobs index or conservative search surface."}
        </p>
        <form
          action={resolvePath}
          method="get"
          className="flex flex-col gap-3 md:flex-row md:items-center"
          data-testid="career-resolve-form"
        >
          <input
            type="search"
            name="q"
            defaultValue={submittedQuery}
            placeholder={locale === "zh" ? "输入职业别名或标题" : "Enter an alias or title"}
            className="h-12 w-full rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-4 text-sm text-[var(--fm-text)] outline-none ring-0 placeholder:text-[var(--fm-text-muted)] focus:border-[var(--fm-accent)]"
            data-testid="career-resolve-input"
          />
          <div className="flex gap-3">
            <Button type="submit">{locale === "zh" ? "解析职业" : "Resolve career"}</Button>
            {hasQuery ? (
              <Link
                href={resolvePath}
                className="inline-flex h-12 min-h-[48px] items-center justify-center rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface)] px-4 text-sm font-semibold text-[var(--fm-text)] hover:border-[var(--fm-accent)]"
              >
                {locale === "zh" ? "清除解析" : "Clear"}
              </Link>
            ) : null}
          </div>
        </form>
      </section>

      {hasAmbiguousResolution ? (
        <CareerAliasResolutionCandidates locale={locale} landingPath={resolvePath} candidates={ambiguousCandidates} />
      ) : null}

      {isAliasResolutionNoResult ? (
        <Card data-testid="career-resolve-no-result" data-career-data-status="unavailable">
          <CardHeader>
            <CardTitle>{locale === "zh" ? "未找到可解析目标" : "No resolvable target found"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--fm-text-muted)]">
            <p className="m-0">
              {locale === "zh"
                ? "当前 alias-resolution authority 没有返回 occupation/family/ambiguous 目标。你可以调整输入后重试。"
                : "The alias-resolution authority did not return occupation, family, or ambiguous targets for this query. Try a different query."}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {!hasQuery ? (
        <Card data-testid="career-resolve-idle-state">
          <CardHeader>
            <CardTitle>{locale === "zh" ? "输入关键词开始解析" : "Enter a query to resolve"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--fm-text-muted)]">
            <p className="m-0">
              {locale === "zh"
                ? "该页用于 alias/disambiguation 结果分流。职业索引与搜索结果请使用职业库页面。"
                : "Use this page for alias/disambiguation resolution. Use the jobs page for index browsing and conservative search results."}
            </p>
          </CardContent>
        </Card>
      ) : null}
    </Container>
  );
}
