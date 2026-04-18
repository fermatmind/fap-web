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
    title: locale === "zh" ? "职业探索入口" : "Career Explorer",
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
  const landingPath = withLocale("/career");
  const canonicalPath = locale === "zh" ? "/zh/career" : "/en/career";
  const pageTitle = locale === "zh" ? "职业探索入口" : "Career Explorer";
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
            {locale === "zh" ? "找到适合你的职业方向" : "Find the right career direction for you"}
          </h1>
        </section>

        <section className="grid gap-4 md:grid-cols-3" data-testid="career-explorer-pathways" data-authority-owner="editorial_ia_shell">
          <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="career-pathway-jobs">
            <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {locale === "zh" ? "我知道职业名" : "I know the role name"}
            </p>
            <h3 className="m-0 mt-3 text-xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "搜索具体职业" : "Search a specific career"}
            </h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-600">
              {locale === "zh"
                ? "适合已经知道岗位名称，想快速查看职业资料的人。"
                : "Use this when you already know the role name and want to inspect the profile quickly."}
            </p>
            <form action={withLocale("/career/jobs")} method="get" className="mt-auto space-y-3 pt-9" data-testid="career-landing-search-entry">
              <input
                type="search"
                name="q"
                placeholder={locale === "zh" ? "输入职业名" : "Enter a role name"}
                className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none placeholder:text-slate-400 focus:border-orange-200"
              />
              <button type="submit" className={buttonVariants({ className: "w-full justify-center" })}>
                {locale === "zh" ? "搜索职业" : "Search career"}
              </button>
            </form>
          </article>

          <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="career-pathway-recommendation">
            <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {locale === "zh" ? "我已经测过性格了" : "I already have a personality result"}
            </p>
            <h3 className="m-0 mt-3 text-xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "查看推荐方向" : "View recommendation directions"}
            </h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-600">
              {locale === "zh"
                ? "适合已经拿到人格结果，想先看方向和取舍的人。"
                : "Use this when you already have a result and want direction and tradeoffs first."}
            </p>
            <Link href={withLocale("/career/recommendations")} className={buttonVariants({ className: "mt-auto w-full justify-center" })}>
              {locale === "zh" ? "浏览推荐方案" : "Browse recommendation options"}
            </Link>
          </article>

          <article className="flex flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6" data-testid="career-pathway-tests">
            <p className="m-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {locale === "zh" ? "我还不知道方向" : "I do not know the direction yet"}
            </p>
            <h3 className="m-0 mt-3 text-xl font-semibold tracking-tight text-slate-950">
              {locale === "zh" ? "先做职业兴趣测试" : "Start with a career interest test"}
            </h3>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-600">
              {locale === "zh"
                ? "花几分钟，先找到更适合你的职业兴趣方向。"
                : "Spend a few minutes to get a clearer starting direction."}
            </p>
            <Link href={withLocale("/career/tests")} className={buttonVariants({ className: "mt-auto w-full justify-center" })}>
              {locale === "zh" ? "开始测试" : "Start test"}
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
              { label: locale === "zh" ? "行业趋势指南" : "Industry trend guides", href: withLocale("/career/industries") },
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
