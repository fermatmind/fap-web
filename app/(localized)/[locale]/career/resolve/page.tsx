import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CareerAliasResolutionCandidates } from "@/components/career/CareerAliasResolutionCandidates";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Button, buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { NextStepRail } from "@/components/career/v1/NextStepRail";
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
    title: locale === "zh" ? "职业别名解析" : "Career Alias Resolve",
    description:
      locale === "zh"
        ? "把职业别名、俗称或模糊称呼解析到职业或职业家族。"
        : "Resolve role aliases, colloquial titles, or fuzzy names into a role or career family.",
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
  const jobsPath = localizedPath("/career/jobs", locale);

  const aliasResolutionPayload = hasQuery ? await fetchCareerAliasResolution({ q: submittedQuery, locale }) : null;
  const aliasResolution = hasQuery ? adaptCareerAliasResolution({ locale, payload: aliasResolutionPayload }) : null;

  if (aliasResolution?.resolution.resolvedKind === "occupation") {
    redirect(buildCareerJobFrontendUrl(locale, aliasResolution.resolution.occupation.canonicalSlug));
  }

  if (aliasResolution?.resolution.resolvedKind === "family") {
    redirect(buildCareerFamilyFrontendUrl(locale, aliasResolution.resolution.family.canonicalSlug));
  }

  const ambiguousResolution = aliasResolution?.resolution.resolvedKind === "ambiguous" ? aliasResolution.resolution : null;
  const hasAmbiguousResolution = ambiguousResolution !== null;
  const isAliasResolutionNoResult = aliasResolution?.resolution.resolvedKind === "none";
  const ambiguousCandidates = ambiguousResolution?.candidates ?? [];

  return (
    <main className="min-h-screen bg-slate-50">
      <Container as="div" className="space-y-12 py-12 md:space-y-16 md:py-20">
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

        <section className="mx-auto max-w-4xl space-y-6" data-testid="career-resolve-hero">
          <div className="space-y-3 text-center">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Career Resolve</p>
            <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              {locale === "zh" ? "解析职业别名" : "Resolve a role alias"}
            </h1>
            <p className="mx-auto m-0 max-w-2xl text-base leading-7 text-slate-500">
              {locale === "zh" ? "把俗称、行业黑话或模糊称呼匹配到职业或职业家族。" : "Use this for colloquial titles, ambiguous labels, or names that are not standard role titles."}
            </p>
          </div>
          <form action={resolvePath} method="get" className="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm md:flex md:items-center md:gap-3" data-testid="career-resolve-form">
            <input
              type="search"
              name="q"
              defaultValue={submittedQuery}
              placeholder={locale === "zh" ? "输入职业别名或俗称" : "Enter an alias or colloquial title"}
              className="h-12 w-full rounded-full border border-transparent bg-slate-50 px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-orange-200"
              data-testid="career-resolve-input"
            />
            <div className="mt-3 flex gap-3 md:mt-0 md:shrink-0">
              <Button type="submit">{locale === "zh" ? "解析" : "Resolve"}</Button>
              {hasQuery ? (
                <Link href={resolvePath} className={buttonVariants({ variant: "outline" })}>
                  {locale === "zh" ? "清除" : "Clear"}
                </Link>
              ) : null}
            </div>
          </form>
        </section>

        {hasAmbiguousResolution ? (
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
                {locale === "zh" ? "可能的匹配" : "Possible matches"}
              </h2>
              <p className="m-0 text-sm leading-6 text-slate-500">
                {locale === "zh" ? "选择最接近你输入含义的职业或职业家族。" : "Choose the role or family closest to what you meant."}
              </p>
            </div>
            <CareerAliasResolutionCandidates locale={locale} landingPath={resolvePath} candidates={ambiguousCandidates} />
          </section>
        ) : null}

        {isAliasResolutionNoResult ? (
          <section className="rounded-3xl border border-dashed border-slate-200 bg-white p-6" data-testid="career-resolve-no-result" data-career-data-status="unavailable">
            <h2 className="m-0 text-lg font-semibold text-slate-950">
              {locale === "zh" ? "没有找到可解析目标" : "No resolvable target found"}
            </h2>
            <p className="m-0 mt-2 text-sm leading-6 text-slate-500">
              {locale === "zh" ? "可以换一个说法，或回到职业库直接搜索标准职业名。" : "Try another phrase, or search the job library with a standard role title."}
            </p>
          </section>
        ) : null}

        {!hasQuery ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-6" data-testid="career-resolve-idle-state">
            <h2 className="m-0 text-lg font-semibold text-slate-950">
              {locale === "zh" ? "适合输入模糊称呼" : "Best for fuzzy names"}
            </h2>
            <p className="m-0 mt-2 text-sm leading-6 text-slate-500">
              {locale === "zh" ? "如果你已经知道标准职业名，直接使用职业库搜索会更快。" : "If you already know the standard role name, the job library search is faster."}
            </p>
          </section>
        ) : null}

        <NextStepRail
          title={locale === "zh" ? "下一步" : "Next steps"}
          items={[
            {
              title: locale === "zh" ? "搜索职业库" : "Search job library",
              description: locale === "zh" ? "适合标准职业名。" : "Use for standard role names.",
              href: jobsPath,
            },
            {
              title: locale === "zh" ? "回到职业入口" : "Back to career home",
              description: locale === "zh" ? "重新选择探索路径。" : "Choose a different exploration path.",
              href: localizedPath("/career", locale),
            },
          ]}
        />
      </Container>
    </main>
  );
}
