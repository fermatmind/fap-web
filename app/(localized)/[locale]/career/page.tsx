import type { Metadata } from "next";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { DecisionPathCard } from "@/components/career/v1/DecisionPathCard";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
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
    pathname: locale === "zh" ? "/zh/career" : "/en/career",
    title: locale === "zh" ? "找到适合你的职业方向" : "Find the career direction worth exploring next",
    description:
      locale === "zh"
        ? "搜索职业，或从测评结果和职业发展指南出发，找到下一步方向。"
        : "Search roles, start from your assessment result, or use practical career guides to choose your next direction.",
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
  const canonicalPath = locale === "zh" ? "/zh/career" : "/en/career";
  const pageTitle = locale === "zh" ? "找到适合你的职业方向" : "Find the career direction worth exploring next";
  const pageDescription =
    locale === "zh"
      ? "搜索职业，或从测评结果和职业发展指南出发，找到下一步方向。"
      : "Search roles, start from your assessment result, or use practical career guides to choose your next direction.";

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
          landingPath: withLocale("/career"),
          routeFamily: "landing",
        })}
      />
      <JsonLd id="career-center-webpage" data={webPageJsonLd} />
      <JsonLd id="career-center-breadcrumb" data={breadcrumbJsonLd} />

      <Container as="div" className="space-y-12 pb-16 pt-8 md:space-y-16 md:pb-20 md:pt-12">
        <Breadcrumb
          items={[
            { label: locale === "zh" ? "首页" : "Home", href: locale === "zh" ? "/zh" : "/en" },
            { label: locale === "zh" ? "职业" : "Career" },
          ]}
        />

        <section className="mx-auto max-w-4xl space-y-8 pt-4 text-center md:pt-8" data-testid="career-landing-hero">
          <div className="space-y-5">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-orange-600">Career Center</p>
            <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{pageTitle}</h1>
            <p className="mx-auto m-0 max-w-2xl text-base leading-7 text-slate-500">
              {locale === "zh"
                ? "搜索一个具体职业，或先从推荐方向与职业发展方法开始。"
                : "Search for a role, or begin with recommendation paths and practical career guidance."}
            </p>
          </div>

          <form
            action={withLocale("/career/jobs")}
            method="get"
            className="mx-auto flex max-w-3xl flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center"
            data-testid="career-landing-search-entry"
          >
            <label htmlFor="career-search" className="sr-only">
              {locale === "zh" ? "搜索职业" : "Search jobs"}
            </label>
            <input
              id="career-search"
              type="search"
              name="q"
              placeholder={locale === "zh" ? "输入职业名称" : "Enter a job title"}
              className="h-12 min-w-0 flex-1 rounded-full border border-transparent bg-slate-50 px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-orange-200"
            />
            <button
              type="submit"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-slate-950 px-6 text-sm font-medium text-white transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
            >
              {locale === "zh" ? "搜索职业" : "Search jobs"}
            </button>
          </form>
        </section>

        <section className="space-y-5" aria-labelledby="career-pathways-title" data-testid="career-explorer-pathways">
          <div className="mx-auto max-w-2xl text-center">
            <h2 id="career-pathways-title" className="m-0 text-2xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "选择你的下一步" : "Choose your next step"}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <DecisionPathCard
              eyebrow={locale === "zh" ? "职业库" : "Job library"}
              title={locale === "zh" ? "了解具体职业" : "Explore specific roles"}
              summary={locale === "zh" ? "搜索工作内容、发展前景与现实要求。" : "Compare role content, outlook, and practical requirements."}
              ctaLabel={locale === "zh" ? "进入职业库" : "Open job library"}
              href={withLocale("/career/jobs")}
            />
            <DecisionPathCard
              eyebrow={locale === "zh" ? "职业推荐" : "Recommendations"}
              title={locale === "zh" ? "从测评结果选方向" : "Start from your result"}
              summary={locale === "zh" ? "先看方向和取舍，再进入候选职业。" : "Review direction and tradeoffs before candidate roles."}
              ctaLabel={locale === "zh" ? "查看职业推荐" : "View recommendations"}
              href={withLocale("/career/recommendations")}
            />
            <DecisionPathCard
              eyebrow={locale === "zh" ? "职业发展" : "Career development"}
              title={locale === "zh" ? "把方向变成行动" : "Turn direction into action"}
              summary={locale === "zh" ? "用实用指南推进选择、成长与转型。" : "Use practical guides for decisions, growth, and transitions."}
              ctaLabel={locale === "zh" ? "阅读职业指南" : "Read career guides"}
              href={withLocale("/career/guides")}
            />
          </div>
        </section>
      </Container>
    </main>
  );
}
