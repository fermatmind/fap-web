import type { Metadata } from "next";
import Link from "next/link";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { adaptCareerFirstWaveReadinessSummary } from "@/lib/career/adapters/adaptCareerFirstWaveReadinessSummary";
import { adaptCareerJobIndex } from "@/lib/career/adapters/adaptCareerJobIndex";
import { adaptCareerRecommendationIndex } from "@/lib/career/adapters/adaptCareerRecommendationIndex";
import { fetchCareerFirstWaveReadinessSummary } from "@/lib/career/api/fetchCareerFirstWaveReadinessSummary";
import { fetchCareerJobIndex } from "@/lib/career/api/fetchCareerJobIndex";
import { fetchCareerRecommendationIndex } from "@/lib/career/api/fetchCareerRecommendationIndex";
import { filterJobFacingCardsByFirstWaveSummary } from "@/lib/career/firstWaveReadinessExposurePolicy";
import { listCareerGuidesFromCms } from "@/lib/cms/career-guides";
import {
  listCareerIndustries,
} from "@/lib/content";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";

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
    title: locale === "zh" ? "职业发展中心" : "Career Intelligence Center",
    description:
      locale === "zh"
        ? "基于人格、能力与兴趣，帮助你做出更高质量的职业决策。"
        : "Make better career decisions with personality, capability, and interest insights.",
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

  const [readinessSummaryPayload, jobIndexPayload, recommendationIndexPayload, guides] = await Promise.all([
    fetchCareerFirstWaveReadinessSummary({ locale }),
    fetchCareerJobIndex({ locale }),
    fetchCareerRecommendationIndex({ locale }),
    listCareerGuidesFromCms(locale, { perPage: 4 }),
  ]);
  const firstWaveReadinessSummary = adaptCareerFirstWaveReadinessSummary({
    payload: readinessSummaryPayload,
  });
  const topJobs = filterJobFacingCardsByFirstWaveSummary(
    firstWaveReadinessSummary,
    adaptCareerJobIndex({ locale, payload: jobIndexPayload })
  ).slice(0, 6);
  const recommendationPreviewItems = adaptCareerRecommendationIndex({
    locale,
    payload: recommendationIndexPayload,
  }).slice(0, 4);
  const industries = listCareerIndustries(locale).slice(0, 12);
  const topGuides = guides.slice(0, 4);
  const canonicalPath = locale === "zh" ? "/zh/career" : "/en/career";
  const pageTitle = locale === "zh" ? "职业发展中心" : "Career Intelligence Center";
  const pageDescription =
    locale === "zh"
      ? "基于人格、能力与兴趣，帮助你做出更高质量的职业决策。"
      : "Make better career decisions with personality, capability, and interest insights.";
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
      <AnalyticsPageViewTracker eventName="career_center_view" properties={{ locale }} />
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
          Career Center
        </p>
        <h1 className="m-0 font-serif text-4xl font-semibold text-[var(--fm-text)]">
          {locale === "zh" ? "职业发展中心" : "Find the career that fits you"}
        </h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "从性格、能力到职业路径，构建你的职业决策系统。"
            : "Build your career decision system from personality, capability, and development paths."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={withLocale("/career/tests/riasec")} className={buttonVariants({ size: "lg" })}>
            {locale === "zh" ? "开始职业测试" : "Start career test"}
          </Link>
          <Link href={withLocale("/career/recommendations")} className={buttonVariants({ variant: "outline", size: "lg" })}>
            {locale === "zh" ? "查看职业推荐" : "View recommendations"}
          </Link>
        </div>
        <form
          action={withLocale("/career/jobs")}
          method="get"
          className="flex flex-col gap-3 md:flex-row md:items-center"
          data-testid="career-landing-search-entry"
        >
          <input
            type="search"
            name="q"
            placeholder={locale === "zh" ? "搜索职业 slug、标题或别名" : "Search slug, title, or alias"}
            className="h-12 w-full rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-4 text-sm text-[var(--fm-text)] outline-none ring-0 placeholder:text-[var(--fm-text-muted)] focus:border-[var(--fm-accent)]"
          />
          <button type="submit" className={buttonVariants({ variant: "outline" })}>
            {locale === "zh" ? "去职业库搜索" : "Search in jobs"}
          </button>
        </form>
      </section>

      <section
        className="space-y-3"
        data-testid="career-landing-jobs-preview"
        data-authority-owner="backend_lightweight_jobs"
      >
        <div className="space-y-1">
          <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">
            {locale === "zh" ? "热门职业" : "Popular jobs"}
          </h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "这一组卡片直接消费 backend B5 lightweight job index。"
              : "These cards consume the backend B5 lightweight job index directly."}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
                        ? "当前卡片只显示 backend authority 明确提供的轻量摘要。"
                        : "This card only shows the lightweight summary explicitly provided by the backend authority.")}
                  </p>
                  {job.dataStatus === "available" ? (
                    <>
                      <p className="m-0">
                        {locale === "zh" ? "薪资" : "Salary"}:{" "}
                        {formatUsdAnnual(job.truthSummary.medianPayUsdAnnual, locale)}
                      </p>
                      <p className="m-0">
                        {locale === "zh" ? "十年增速" : "Ten-year outlook"}:{" "}
                        {formatPercent(job.truthSummary.outlookPct20242034, locale)}
                      </p>
                      <p className="m-0">
                        {locale === "zh" ? "Fit 分数" : "Fit score"}: {job.scoreSummary.fitScore.value ?? "—"}
                      </p>
                    </>
                  ) : (
                    <p className="m-0">
                      {job.dataStatus === "trust_limited"
                        ? locale === "zh"
                          ? "当前职位卡片处于 trust-limited 模式，仅显示后端明确放行的轻量状态。"
                          : "This job card is in trust-limited mode and only shows the lightweight status explicitly allowed by the backend."
                        : locale === "zh"
                          ? "当前职位卡片不可用，页面不会本地合成职业事实。"
                          : "This job card is unavailable, and the page does not synthesize local career facts."}
                    </p>
                  )}
                  <p className="m-0">
                    {locale === "zh" ? "Reviewer" : "Reviewer"}: {job.trustSummary.reviewerStatus ?? "unknown"}
                  </p>
                  <Link
                    href={job.href}
                    className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                  >
                    {locale === "zh" ? "查看职业详情" : "View role profile"}
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card
              className="md:col-span-2 xl:col-span-3"
              data-testid="career-landing-job-status"
              data-career-data-status="unavailable"
            >
              <CardHeader>
                <CardTitle>{locale === "zh" ? "当前没有可公开展示的职业预览" : "No public job previews are currently available"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  {locale === "zh"
                    ? "backend lightweight job index 当前未返回可渲染条目，因此 landing 不会回退到本地职业列表。"
                    : "The backend lightweight job index did not return renderable items, so the landing page does not fall back to the local job list."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
        <div>
          <Link href={withLocale("/career/jobs")} className={buttonVariants({ variant: "outline" })}>
            {locale === "zh" ? "查看全部职业" : "Browse all jobs"}
          </Link>
        </div>
      </section>

      <section
        className="space-y-3"
        data-testid="career-landing-recommendation-preview"
        data-authority-owner="backend_lightweight_recommendations"
      >
        <div className="space-y-1">
          <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">
            {locale === "zh" ? "推荐职业方向" : "Recommended directions"}
          </h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "这一组卡片直接消费 backend B5 lightweight recommendation index，并保持 recommendation 语义。"
              : "These cards consume the backend B5 lightweight recommendation index directly while staying recommendation-oriented."}
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
                  <div className="space-y-2">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                      {item.recommendationSubjectMeta.canonicalTypeCode ??
                        item.recommendationSubjectMeta.typeCode ??
                        item.recommendationSubjectMeta.publicRouteSlug.toUpperCase()}
                    </p>
                    <CardTitle className="text-lg">{item.recommendationSubjectMeta.displayTitle}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                  <p className="m-0">
                    {locale === "zh" ? "Authority route" : "Authority route"}: /
                    {item.recommendationSubjectMeta.publicRouteSlug}
                  </p>
                  {item.dataStatus === "available" ? (
                    <>
                      <p className="m-0">
                        {locale === "zh" ? "Fit 分数" : "Fit score"}: {item.scoreSummary.fitScore.value ?? "—"}
                      </p>
                      <p className="m-0">
                        {locale === "zh" ? "Confidence 分数" : "Confidence score"}:{" "}
                        {item.scoreSummary.confidenceScore.value ?? "—"}
                      </p>
                    </>
                  ) : (
                    <p className="m-0">
                      {item.dataStatus === "trust_limited"
                        ? locale === "zh"
                          ? "当前 recommendation 卡片处于 trust-limited 模式，仅显示后端明确放行的轻量状态。"
                          : "This recommendation card is in trust-limited mode and only shows the lightweight status explicitly allowed by the backend."
                        : locale === "zh"
                          ? "当前 recommendation 卡片不可用，页面不会本地合成推荐解释。"
                          : "This recommendation card is unavailable, and the page does not synthesize local recommendation explanations."}
                    </p>
                  )}
                  <p className="m-0">
                    {locale === "zh" ? "Reviewer" : "Reviewer"}: {item.trustSummary.reviewerStatus ?? "unknown"}
                  </p>
                  <Link href={item.href} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                    {locale === "zh" ? "查看 recommendation detail" : "View recommendation detail"}
                  </Link>
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
            <CardContent className="text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">
                {locale === "zh"
                  ? "backend recommendation index 当前不可用，因此 landing 不会回退到 CMS family / variant 列表。"
                  : "The backend recommendation index is currently unavailable, so the landing page does not fall back to the CMS family/variant list."}
              </p>
            </CardContent>
          </Card>
        )}
        <div>
          <Link href={withLocale("/career/recommendations")} className={buttonVariants({ variant: "outline" })}>
            {locale === "zh" ? "查看职业推荐" : "View recommendations"}
          </Link>
        </div>
      </section>

      <section
        className="space-y-3"
        data-testid="career-landing-industries"
        data-authority-owner="editorial_local_industries"
      >
        <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">{locale === "zh" ? "按行业浏览" : "Browse by industry"}</h2>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-4">
          {industries.map((industry) => (
            <Link
              key={industry.slug}
              href={withLocale(`/career/industries/${industry.slug}`)}
              className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 text-sm font-semibold text-[var(--fm-text)] transition hover:border-[var(--fm-accent)]"
            >
              <p className="m-0">{industry.title}</p>
              <p className="mt-2 text-xs font-normal text-[var(--fm-text-muted)]">{industry.summary}</p>
            </Link>
          ))}
        </div>
      </section>

      <section
        className="space-y-3"
        data-testid="career-landing-guides"
        data-authority-owner="editorial_cms_guides"
      >
        <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">{locale === "zh" ? "职业发展文章" : "Career development guides"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {topGuides.map((guide) => (
            <Card key={guide.slug}>
              <CardHeader>
                <CardTitle className="text-lg">{guide.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">{guide.summary}</p>
                <Link href={guide.href} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                  {locale === "zh" ? "阅读全文" : "Read guide"}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section
        className="space-y-3 rounded-2xl border border-dashed border-[var(--fm-border)] bg-[var(--fm-surface)] p-5"
        data-testid="career-landing-explore-strip"
        data-authority-owner="editorial_cta_only"
      >
        <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">
          {locale === "zh" ? "继续探索职业路径" : "Keep exploring career paths"}
        </h2>
        <p className="m-0 text-sm text-[var(--fm-text-muted)]">
          {locale === "zh"
            ? "这里不再把本地 job growth_path 派生内容当成 authority。继续探索时，请进入 backend-backed 的职业库与推荐页。"
            : "This section no longer treats locally derived job growth paths as authority. Continue exploring through the backend-backed jobs and recommendations pages."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href={withLocale("/career/jobs")} className={buttonVariants({ variant: "outline" })}>
            {locale === "zh" ? "浏览职业库" : "Browse job library"}
          </Link>
          <Link href={withLocale("/career/recommendations")} className={buttonVariants({ variant: "outline" })}>
            {locale === "zh" ? "浏览职业推荐" : "Browse recommendations"}
          </Link>
        </div>
      </section>
    </Container>
  );
}
