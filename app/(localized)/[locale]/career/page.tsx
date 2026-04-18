import type { Metadata } from "next";
import Link from "next/link";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { CAREER_TRACKING_EVENTS, buildCareerAttributionPayload } from "@/lib/career/attribution";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";

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
    title: locale === "zh" ? "职业库与职业探索" : "Career Library and Explorer",
    description:
      locale === "zh"
        ? "从全部职业库、行业目录和测评结果进入职业详情与职业推荐。"
        : "Enter career profiles through the full occupation library, industry directories, and personality-based recommendations.",
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
  const landingPath = withLocale("/career");
  const canonicalPath = locale === "zh" ? "/zh/career" : "/en/career";
  const pageTitle = locale === "zh" ? "职业库与职业探索" : "Career Library and Explorer";
  const pageDescription =
    locale === "zh"
      ? "从全部职业库、行业目录和测评结果进入职业详情与职业推荐。"
      : "Enter career profiles through the full occupation library, industry directories, and personality-based recommendations.";
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
      <JsonLd id="career-center-webpage" data={webPageJsonLd} />
      <JsonLd id="career-center-breadcrumb" data={breadcrumbJsonLd} />
      <Container as="div" className="space-y-10 pb-16 pt-8 md:space-y-12 md:pb-20 md:pt-12">
        <Breadcrumb
          items={[
            { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
            { name: locale === "zh" ? "职业" : "Career", path: canonicalPath },
          ].map((item, index) => ({
            label: item.name,
            href: index === 0 ? item.path : undefined,
          }))}
        />

        <section className="mx-auto max-w-4xl space-y-4 pt-4 text-center md:pt-8" data-testid="career-landing-hero" data-authority-owner="editorial_local_wrapper">
          <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
            {locale === "zh" ? "从职业库开始，逐层缩小选择" : "Start with the library, then narrow the path"}
          </h1>
        </section>

        <section className="grid gap-4 md:grid-cols-3" data-testid="career-explorer-pathways" data-authority-owner="editorial_ia_shell">
          <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="career-pathway-jobs">
            <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {locale === "zh" ? "全部职业库" : "All occupations"}
            </p>
            <h3 className="m-0 mt-3 text-xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "浏览 342 个职业" : "Browse 342 occupations"}
            </h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-600">
              {locale === "zh"
                ? "先看完整职业目录，再按行业或关键词缩小范围。"
                : "Start with the full directory, then narrow by industry or keyword."}
            </p>
            <form action={withLocale("/career/jobs")} method="get" className="mt-auto space-y-3 pt-9" data-testid="career-landing-search-entry">
              <input
                type="search"
                name="q"
                placeholder={locale === "zh" ? "输入职业名或方向" : "Enter a role or direction"}
                className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-orange-200"
              />
              <button type="submit" className={buttonVariants({ className: "w-full justify-center" })}>
                {locale === "zh" ? "搜索全部职业库" : "Search all occupations"}
              </button>
            </form>
          </article>

          <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="career-pathway-recommendation">
            <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {locale === "zh" ? "行业入口" : "Industry entry"}
            </p>
            <h3 className="m-0 mt-3 text-xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "按行业看职业裂变" : "Browse roles by industry"}
            </h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-600">
              {locale === "zh"
                ? "适合还不确定具体岗位，但知道大致行业方向的人。"
                : "Use this when you know the broad field but not the exact role."}
            </p>
            <Link href={withLocale("/career/industries")} className={buttonVariants({ className: "mt-auto w-full justify-center" })}>
              {locale === "zh" ? "查看行业目录" : "View industries"}
            </Link>
          </article>

          <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="career-pathway-tests">
            <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {locale === "zh" ? "基于测评" : "From assessment"}
            </p>
            <h3 className="m-0 mt-3 text-xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "用人格结果看推荐" : "Use personality results"}
            </h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-600">
              {locale === "zh"
                ? "如果已经有 MBTI 或大五结果，可以先看推荐方向。"
                : "If you already have MBTI or Big Five results, start with recommendation paths."}
            </p>
            <Link href={withLocale("/career/recommendations")} className={buttonVariants({ className: "mt-auto w-full justify-center" })}>
              {locale === "zh" ? "查看职业推荐" : "View recommendations"}
            </Link>
          </article>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-5 text-sm shadow-sm md:p-6" data-testid="career-quiet-library" data-authority-owner="editorial_support_links">
          <div className="space-y-5 text-center">
            <h2 className="m-0 text-lg font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "需要更多背景时再看" : "Support material for later"}
            </h2>
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-3">
            {[
              { label: locale === "zh" ? "职业发展文章" : "Career development articles", href: withLocale("/career/guides") },
              { label: locale === "zh" ? "职业测试" : "Career tests", href: withLocale("/career/tests") },
              { label: locale === "zh" ? "数据来源" : "Data source", href: withLocale("/datasets/occupations") },
              { label: locale === "zh" ? "方法说明" : "Method notes", href: withLocale("/datasets/occupations/method") },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="font-medium text-slate-500 underline underline-offset-4 hover:text-slate-950">
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
