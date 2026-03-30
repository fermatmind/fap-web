import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { BoundaryNoteBlock, ConclusionSummaryBlock, MethodologyBlock } from "@/components/seo/CitationBlocks";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCareerIndustryBySlug,
  getCareerJobBySlug,
  listCareerIndustrySlugs,
} from "@/lib/content";
import { renderVeliteMdx } from "@/lib/content/renderVeliteMdx";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildSeoMetadata, buildStructuredDataBundle } from "@/lib/seo/pageInfrastructure";

export function generateStaticParams() {
  return listCareerIndustrySlugs().flatMap((slug) => [{ locale: "en", slug }, { locale: "zh", slug }]);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const industry = getCareerIndustryBySlug(slug, locale);

  if (!industry) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  return buildSeoMetadata({
    pageType: "guide",
    locale,
    pathname: locale === "zh" ? `/zh/career/industries/${slug}` : `/en/career/industries/${slug}`,
    title: industry.title,
    description: industry.summary,
    alternatesByLocale: {
      en: `/en/career/industries/${slug}`,
      zh: `/zh/career/industries/${slug}`,
      xDefault: "/",
    },
  });
}

export default async function CareerIndustryDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const industry = getCareerIndustryBySlug(slug, locale);

  if (!industry) return notFound();

  const canonicalPath = locale === "zh" ? `/zh/career/industries/${slug}` : `/en/career/industries/${slug}`;
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: `career-industry-${slug}`,
    pageType: "guide",
    locale,
    canonicalPath,
    title: industry.title,
    description: industry.summary,
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
      { name: locale === "zh" ? "职业" : "Career", path: locale === "zh" ? "/zh/career" : "/en/career" },
      {
        name: locale === "zh" ? "行业指南" : "Industries",
        path: locale === "zh" ? "/zh/career/industries" : "/en/career/industries",
      },
      { name: industry.title, path: canonicalPath },
    ],
  });

  const hotJobs = industry.hot_jobs
    .map((jobSlug) => getCareerJobBySlug(jobSlug, locale))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <Container as="main" className="space-y-6 py-10">
      {schemaNodes.map((node) => (
        <JsonLd key={node.id} id={node.id} data={node.data} />
      ))}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
          { label: locale === "zh" ? "行业指南" : "Industries", href: localizedPath("/career/industries", locale) },
          { label: industry.title },
        ]}
      />
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{industry.title}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">{industry.summary}</p>
      </section>

      <ConclusionSummaryBlock
        title={locale === "zh" ? "结论摘要" : "Conclusion summary"}
        body={industry.summary}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <MethodologyBlock
        title={locale === "zh" ? "行业页口径" : "Industry page scope"}
        body={locale === "zh"
          ? "行业页优先说明行业概览、薪资、趋势和热门岗位，帮助用户从行业层理解职业机会，而不是把结论压缩成单一标签。"
          : "Industry pages prioritize sector overview, salary context, trends, and popular roles so users understand opportunity from the industry layer rather than a single label."}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "行业介绍" : "Industry overview"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
            <p className="m-0">{industry.overview}</p>
            <p className="m-0">{industry.growth_outlook}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "行业薪资" : "Salary overview"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--fm-text-muted)]">
            <p className="m-0">{industry.salary_overview}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{locale === "zh" ? "热门职业" : "Popular jobs"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
          {hotJobs.map((job) => (
            <p key={job.slug} className="m-0">
              <Link href={withLocale(`/career/jobs/${job.slug}`)} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                {job.title}
              </Link>
            </p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{locale === "zh" ? "行业趋势" : "Industry trends"}</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--fm-text-muted)]">
          <ul className="space-y-1 pl-5">
            {industry.trends.map((trend) => (
              <li key={trend}>{trend}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <article className="prose max-w-none prose-slate">{renderVeliteMdx(industry.body)}</article>

      <BoundaryNoteBlock
        title={locale === "zh" ? "边界说明" : "Boundary note"}
        body={locale === "zh"
          ? "行业页描述的是行业层面的机会、趋势和典型岗位，不等于对单个岗位或个体决策的直接承诺。"
          : "Industry pages describe sector-level opportunities, trends, and representative roles. They are not direct promises about a specific job or an individual's final decision."}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <Link href={withLocale("/career/industries")} className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
        {locale === "zh" ? "返回行业指南" : "Back to industries"}
      </Link>
    </Container>
  );
}
