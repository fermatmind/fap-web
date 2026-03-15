import type { Metadata } from "next";
import Link from "next/link";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { listCareerGuidesFromCms } from "@/lib/cms/career-guides";
import {
  listCareerIndustries,
  listCareerJobs,
} from "@/lib/content";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const topJobs = listCareerJobs(locale).slice(0, 10);
  const industries = listCareerIndustries(locale).slice(0, 12);
  const guides = (await listCareerGuidesFromCms(locale, { perPage: 4 })).slice(0, 4);
  const pathRecommendations = topJobs.slice(0, 3);
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

      <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)]">
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
      </section>

      <section className="space-y-3">
        <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">{locale === "zh" ? "热门职业" : "Popular jobs"}</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {topJobs.map((job) => (
            <Card key={job.slug}>
              <CardHeader>
                <CardTitle className="text-lg">{job.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">{job.summary}</p>
                <Link href={withLocale(`/career/jobs/${job.slug}`)} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                  {locale === "zh" ? "查看职业详情" : "View role profile"}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
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

      <section className="space-y-3">
        <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">{locale === "zh" ? "职业发展文章" : "Career development guides"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {guides.map((guide) => (
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

      <section className="space-y-3">
        <h2 className="m-0 font-serif text-2xl text-[var(--fm-text)]">{locale === "zh" ? "推荐职业路径" : "Recommended career paths"}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {pathRecommendations.map((job) => (
            <Card key={`path-${job.slug}`}>
              <CardHeader>
                <CardTitle className="text-lg">{job.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">{job.growth_path[0]}</p>
                <Link href={withLocale(`/career/jobs/${job.slug}`)} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                  {locale === "zh" ? "查看成长路径" : "See growth path"}
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </Container>
  );
}
