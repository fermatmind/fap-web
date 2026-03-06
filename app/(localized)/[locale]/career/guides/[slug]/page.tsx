import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { RelatedContent } from "@/components/content/RelatedContent";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  getCareerGuideBySlug,
  getCareerIndustryBySlug,
  getCareerJobBySlug,
  listRelatedArticlesForGuide,
  listRelatedTypesForGuide,
  listCareerGuideSlugs,
} from "@/lib/content";
import { renderVeliteMdx } from "@/lib/content/renderVeliteMdx";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export function generateStaticParams() {
  return listCareerGuideSlugs().flatMap((slug) => [{ locale: "en", slug }, { locale: "zh", slug }]);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const guide = getCareerGuideBySlug(slug, locale);

  if (!guide) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? `/zh/career/guides/${slug}` : `/en/career/guides/${slug}`,
    title: guide.title,
    description: guide.summary,
    alternatesByLocale: {
      en: `/en/career/guides/${slug}`,
      zh: `/zh/career/guides/${slug}`,
      xDefault: "/",
    },
  });
}

export default async function CareerGuideDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (pathname: string) => localizedPath(pathname, locale);
  const guide = getCareerGuideBySlug(slug, locale);

  if (!guide) return notFound();

  const canonicalPath = locale === "zh" ? `/zh/career/guides/${slug}` : `/en/career/guides/${slug}`;
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: guide.title,
    description: guide.summary,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "职业" : "Career", path: locale === "zh" ? "/zh/career" : "/en/career" },
    { name: locale === "zh" ? "职业发展" : "Guides", path: locale === "zh" ? "/zh/career/guides" : "/en/career/guides" },
    { name: guide.title, path: canonicalPath },
  ]);

  const relatedJobs = (guide.related_job_slugs ?? [])
    .map((jobSlug) => getCareerJobBySlug(jobSlug, locale))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const relatedIndustries = (guide.related_industry_slugs ?? [])
    .map((industrySlug) => getCareerIndustryBySlug(industrySlug, locale))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const relatedArticles = listRelatedArticlesForGuide(guide, locale);
  const relatedTypes = listRelatedTypesForGuide(guide, locale);

  return (
    <Container as="main" className="space-y-6 py-10">
      <JsonLd id={`career-guide-webpage-${slug}`} data={webPageJsonLd} />
      <JsonLd id={`career-guide-breadcrumb-${slug}`} data={breadcrumbJsonLd} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
          { label: locale === "zh" ? "职业发展" : "Guides", href: localizedPath("/career/guides", locale) },
          { label: guide.title },
        ]}
      />
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{guide.title}</h1>
        <p className="m-0 text-[var(--fm-text-muted)]">{guide.summary}</p>
        <p className="m-0 text-xs text-[var(--fm-text-muted)]">
          {locale === "zh" ? "分类" : "Category"}: {guide.category} · {locale === "zh" ? "更新于" : "Updated"}: {guide.updatedAt}
        </p>
      </section>

      <article className="prose max-w-none prose-slate">{renderVeliteMdx(guide.body)}</article>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "相关职业" : "Related jobs"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-[var(--fm-text-muted)]">
            {relatedJobs.map((job) => (
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
            <CardTitle>{locale === "zh" ? "相关行业" : "Related industries"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm text-[var(--fm-text-muted)]">
            {relatedIndustries.map((industry) => (
              <p key={industry.slug} className="m-0">
                <Link href={withLocale(`/career/industries/${industry.slug}`)} className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
                  {industry.title}
                </Link>
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <RelatedContent
          title={locale === "zh" ? "相关文章" : "Related articles"}
          items={relatedArticles}
        />
        <RelatedContent
          title={locale === "zh" ? "相关人格画像" : "Related personality profiles"}
          items={relatedTypes}
        />
      </div>

      <Link href={withLocale("/career/guides")} className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
        {locale === "zh" ? "返回职业发展" : "Back to career guides"}
      </Link>
    </Container>
  );
}
