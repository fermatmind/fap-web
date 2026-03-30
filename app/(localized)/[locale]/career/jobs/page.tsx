import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listCareerJobsFromCms } from "@/lib/cms/career-jobs";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { normalizePublicHref } from "@/lib/navigation/publicLinking";
import { buildSeoMetadata, buildStructuredDataBundle } from "@/lib/seo/pageInfrastructure";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildSeoMetadata({
    pageType: "hub",
    locale,
    pathname: locale === "zh" ? "/zh/career/jobs" : "/en/career/jobs",
    title: locale === "zh" ? "职业库" : "Career Job Library",
    description:
      locale === "zh" ? "浏览职业介绍、能力要求、薪资水平与发展路径。" : "Browse job introductions, skills, salary ranges, and growth paths.",
    alternatesByLocale: {
      en: "/en/career/jobs",
      zh: "/zh/career/jobs",
      xDefault: "/",
    },
  });
}

export default async function CareerJobsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const jobs = await listCareerJobsFromCms({ locale });
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: "career-jobs-index",
    pageType: "hub",
    locale,
    canonicalPath: withLocale("/career/jobs"),
    title: locale === "zh" ? "职业库" : "Career Job Library",
    description:
      locale === "zh" ? "浏览职业介绍、能力要求、薪资水平与发展路径。" : "Browse job introductions, skills, salary ranges, and growth paths.",
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: withLocale("/") },
      { name: locale === "zh" ? "职业" : "Career", path: withLocale("/career") },
      { name: locale === "zh" ? "职业库" : "Jobs", path: withLocale("/career/jobs") },
    ],
  });

  return (
    <Container as="main" className="space-y-6 py-10">
      {schemaNodes.map((node) => (
        <JsonLd key={node.id} id={node.id} data={node.data} />
      ))}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: withLocale("/") },
          { label: locale === "zh" ? "职业" : "Career", href: withLocale("/career") },
          { label: locale === "zh" ? "职业库" : "Jobs" },
        ]}
      />
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">Career Jobs</p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{locale === "zh" ? "职业库" : "Job library"}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">
          {locale === "zh" ? "覆盖 30 个核心职业的结构化职业画像。" : "Structured role profiles across 30 core career options."}
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <Card key={job.slug}>
              <CardHeader>
                <CardTitle className="text-lg">{job.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">{job.summary || (locale === "zh" ? "暂无摘要。" : "Summary not available yet.")}</p>
                <p className="m-0">
                  {locale === "zh" ? "薪资" : "Salary"}: {job.salaryText || (locale === "zh" ? "暂未提供" : "Not available yet")}
                </p>
                <Link
                  href={normalizePublicHref(job.href, locale)}
                  className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
                >
                  {locale === "zh" ? "查看详情" : "View details"}
                </Link>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="md:col-span-2 xl:col-span-3">
            <CardHeader>
              <CardTitle>{locale === "zh" ? "暂无已发布职业内容" : "No published career jobs yet"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">
                {locale === "zh"
                  ? "CMS 当前语言下还没有返回可公开显示的职业条目。"
                  : "The CMS did not return any public career jobs for this locale."}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  );
}
