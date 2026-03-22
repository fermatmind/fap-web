import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildCareerJobFrontendUrl,
  getCareerJobFromCmsBySlug,
  getCareerJobSeoFromCmsBySlug,
  type CareerJobSectionViewModel,
} from "@/lib/cms/career-jobs";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { canonicalUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

function pathFromCanonicalUrl(value: string | null | undefined, fallbackPath: string): string {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    return fallbackPath;
  }

  try {
    return new URL(normalized).pathname || fallbackPath;
  } catch {
    return normalized.startsWith("/") ? normalized : fallbackPath;
  }
}

function shouldNoindex(robotsValue: string | null | undefined): boolean {
  return String(robotsValue ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes("noindex");
}

function resolveTwitterCard(value: string | null | undefined): "summary" | "summary_large_image" | "player" | "app" {
  if (value === "summary" || value === "player" || value === "app") {
    return value;
  }

  return "summary_large_image";
}

function buildCanonicalPath(slug: string, locale: Locale): string {
  return buildCareerJobFrontendUrl(locale, slug);
}

function hasRiasecData(vector: Record<string, number | null>): boolean {
  return Object.values(vector).some((value) => value !== null);
}

function hasSupplementalSections(sections: CareerJobSectionViewModel[]): boolean {
  return sections.some((section) => section.bodyMarkdown.trim() || section.bodyHtml.trim());
}

function renderSectionBody(section: CareerJobSectionViewModel) {
  if (section.bodyMarkdown.trim()) {
    return renderSimpleMarkdown(section.bodyMarkdown);
  }

  if (section.bodyHtml.trim()) {
    return <div dangerouslySetInnerHTML={{ __html: section.bodyHtml }} />;
  }

  return null;
}

function renderSectionTitle(section: CareerJobSectionViewModel): string {
  return section.title || section.sectionKey.replace(/_/g, " ");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const [job, seo] = await Promise.all([
    getCareerJobFromCmsBySlug({ slug, locale }),
    getCareerJobSeoFromCmsBySlug({ slug, locale }),
  ]);

  if (!job) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const canonicalPath = buildCanonicalPath(job.slug, locale);
  const seoCanonicalPath = pathFromCanonicalUrl(seo?.surface?.canonicalUrl ?? seo?.meta.canonical, canonicalPath);
  const title = seo?.surface?.title || seo?.meta.title || job.title;
  const description = seo?.surface?.description || seo?.meta.description || job.summary;
  const noindex = !job.isIndexable || shouldNoindex(seo?.meta.robots ?? job.seoMeta?.robots);
  const metadata = buildPageMetadata({
    locale,
    pathname: seoCanonicalPath,
    title,
    description,
    imagePath: seo?.surface?.og.image ?? seo?.meta.og.image ?? job.coverImageUrl ?? undefined,
    seoSurface: seo?.surface,
    noindex: !seo?.surface ? noindex : undefined,
    alternatesByLocale: {
      en: buildCareerJobFrontendUrl("en", job.slug),
      zh: buildCareerJobFrontendUrl("zh", job.slug),
      xDefault: "/",
    },
  });
  const canonical = seo?.surface?.canonicalUrl ?? canonicalUrl(canonicalPath);
  const ogImage = seo?.surface?.og.image ?? seo?.meta.og.image ?? job.coverImageUrl ?? null;

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
      languages: {
        ...metadata.alternates?.languages,
        en: seo?.meta.alternates.en ?? canonicalUrl(buildCareerJobFrontendUrl("en", job.slug)),
        "zh-CN": seo?.meta.alternates["zh-CN"] ?? canonicalUrl(buildCareerJobFrontendUrl("zh", job.slug)),
      },
    },
    openGraph: {
      type: "article",
      url: seo?.surface?.og.url ?? canonical,
      title: seo?.surface?.og.title || seo?.meta.og.title || title,
      description: seo?.surface?.og.description || seo?.meta.og.description || description,
      images: ogImage ? [ogImage] : undefined,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
    twitter: {
      card: resolveTwitterCard(seo?.surface?.twitter.card ?? seo?.meta.twitter.card),
      title: seo?.surface?.twitter.title || seo?.meta.twitter.title || title,
      description: seo?.surface?.twitter.description || seo?.meta.twitter.description || description,
      images: (seo?.surface?.twitter.image ?? seo?.meta.twitter.image ?? ogImage)
        ? [seo?.surface?.twitter.image ?? seo?.meta.twitter.image ?? ogImage]
        : undefined,
    },
  };
}

export default async function CareerJobDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const [job, seo] = await Promise.all([
    getCareerJobFromCmsBySlug({ slug, locale }),
    getCareerJobSeoFromCmsBySlug({ slug, locale }),
  ]);

  if (!job) {
    return notFound();
  }

  const canonicalPath = buildCanonicalPath(job.slug, locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "职业" : "Career", path: localizedPath("/career", locale) },
    { name: locale === "zh" ? "职业库" : "Jobs", path: localizedPath("/career/jobs", locale) },
    { name: job.title, path: canonicalPath },
  ]);
  const showFitCard =
    job.fitPersonalityItems.length > 0 ||
    job.mbtiPrimary.length > 0 ||
    job.mbtiSecondary.length > 0 ||
    hasRiasecData(job.riasecVector) ||
    Boolean(job.outlookText);

  return (
    <Container as="main" className="space-y-6 py-10">
      {seo?.jsonld ? <JsonLd id={`career-job-occupation-${job.slug}`} data={seo.jsonld} /> : null}
      <JsonLd id={`career-job-breadcrumb-${job.slug}`} data={breadcrumbJsonLd} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "职业" : "Career", href: localizedPath("/career", locale) },
          { label: locale === "zh" ? "职业库" : "Jobs", href: localizedPath("/career/jobs", locale) },
          { label: job.title },
        ]}
      />

      <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        {job.heroKicker ? (
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
            {job.heroKicker}
          </p>
        ) : null}
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{job.title}</h1>
        {job.summary ? <p className="m-0 text-[var(--fm-text-muted)]">{job.summary}</p> : null}
        {job.heroQuote ? (
          <blockquote className="m-0 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm italic text-[var(--fm-text-muted)]">
            {job.heroQuote}
          </blockquote>
        ) : null}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "主要工作内容" : "Main responsibilities"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--fm-text-muted)]">
            {job.workContents.length > 0 ? (
              <ul className="space-y-1 pl-5">
                {job.workContents.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="m-0">{locale === "zh" ? "暂未提供。" : "Not available yet."}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "技能要求" : "Required skills"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--fm-text-muted)]">
            {job.skills.length > 0 ? (
              <ul className="space-y-1 pl-5">
                {job.skills.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="m-0">{locale === "zh" ? "暂未提供。" : "Not available yet."}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "薪资水平" : "Salary range"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
            <p className="m-0">{job.salaryText || (locale === "zh" ? "暂未提供" : "Not available yet")}</p>
            {job.outlookText ? <p className="m-0">{job.outlookText}</p> : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "发展路径" : "Growth path"}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-[var(--fm-text-muted)]">
            {job.growthPathItems.length > 0 ? (
              <ul className="space-y-1 pl-5">
                {job.growthPathItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="m-0">{locale === "zh" ? "暂未提供。" : "Not available yet."}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {showFitCard ? (
        <Card>
          <CardHeader>
            <CardTitle>{locale === "zh" ? "适配性格与发展前景" : "Fit personality and outlook"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
            {job.fitPersonalityItems.length > 0 ? (
              <ul className="space-y-1 pl-5">
                {job.fitPersonalityItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {job.mbtiPrimary.length > 0 || job.mbtiSecondary.length > 0 ? (
              <p className="m-0">
                MBTI: {job.mbtiPrimary.join(", ") || "-"}
                {job.mbtiSecondary.length > 0 ? ` / ${job.mbtiSecondary.join(", ")}` : ""}
              </p>
            ) : null}
            {hasRiasecData(job.riasecVector) ? (
              <p className="m-0">
                RIASEC: R {job.riasecVector.R ?? "-"} · I {job.riasecVector.I ?? "-"} · A {job.riasecVector.A ?? "-"} ·
                {" "}S {job.riasecVector.S ?? "-"} · E {job.riasecVector.E ?? "-"} · C {job.riasecVector.C ?? "-"}
              </p>
            ) : null}
            {job.outlookText ? (
              <p className="m-0">
                {locale === "zh" ? "未来展望" : "Future outlook"}: {job.outlookText}
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {job.bodyMarkdown.trim() || job.bodyHtml.trim() ? (
        <article className="space-y-4 text-[var(--fm-text)] [&_a]:text-[var(--fm-accent)] [&_a]:underline-offset-2 [&_a:hover]:underline">
          {job.bodyMarkdown.trim()
            ? renderSimpleMarkdown(job.bodyMarkdown)
            : <div dangerouslySetInnerHTML={{ __html: job.bodyHtml }} />}
        </article>
      ) : null}

      {hasSupplementalSections(job.sections) ? (
        <section className="space-y-4">
          {job.sections
            .filter((section) => section.bodyMarkdown.trim() || section.bodyHtml.trim())
            .map((section) => (
              <Card key={section.sectionKey}>
                <CardHeader>
                  <CardTitle>{renderSectionTitle(section)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-[var(--fm-text-muted)]">
                  {renderSectionBody(section)}
                </CardContent>
              </Card>
            ))}
        </section>
      ) : null}

      <Link href={localizedPath("/career/jobs", locale)} className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
        {locale === "zh" ? "返回职业库" : "Back to job library"}
      </Link>
    </Container>
  );
}
