import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { CanonicalLinkCluster } from "@/components/content/CanonicalLinkCluster";
import { Container } from "@/components/layout/Container";
import { BoundaryNoteBlock, ConclusionSummaryBlock, MethodologyBlock, SampleInfoBlock } from "@/components/seo/CitationBlocks";
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
import { mergeGraphLinks, requiredGraphLinks } from "@/lib/navigation/contentGraph";
import { normalizePublicHref } from "@/lib/navigation/publicLinking";
import { buildSeoMetadata, buildStructuredDataBundle } from "@/lib/seo/pageInfrastructure";
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
  return buildSeoMetadata({
    pageType: "entity",
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
    canonical: seo?.surface?.canonicalUrl ?? canonicalUrl(canonicalPath),
    metaAlternates: {
      en: seo?.meta.alternates.en ?? canonicalUrl(buildCareerJobFrontendUrl("en", job.slug)),
      "zh-CN": seo?.meta.alternates["zh-CN"] ?? canonicalUrl(buildCareerJobFrontendUrl("zh", job.slug)),
    },
    ogType: "article",
  });
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
  const landingSurface = job.landingSurface;
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: `career-job-${job.slug}`,
    pageType: "entity",
    locale,
    canonicalPath,
    title: seo?.meta.title ?? job.title,
    description: seo?.meta.description ?? job.summary,
    primary: seo?.jsonld,
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
      { name: locale === "zh" ? "职业" : "Career", path: localizedPath("/career", locale) },
      { name: locale === "zh" ? "职业库" : "Jobs", path: localizedPath("/career/jobs", locale) },
      { name: job.title, path: canonicalPath },
    ],
  });
  const showFitCard =
    job.fitPersonalityItems.length > 0 ||
    job.mbtiPrimary.length > 0 ||
    job.mbtiSecondary.length > 0 ||
    hasRiasecData(job.riasecVector) ||
    Boolean(job.outlookText);
  const graphLinks = mergeGraphLinks(
    locale,
    (landingSurface?.ctaBundle ?? []).map((cta) => ({ href: cta.href, label: cta.label })),
    requiredGraphLinks("career", locale)
  );

  return (
    <Container as="main" className="space-y-6 py-10">
      {schemaNodes.map((node) => (
        <JsonLd key={node.id} id={node.id} data={node.data} />
      ))}
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
        {landingSurface?.summaryBlocks.length ? (
          <div className="space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4" data-testid="career-job-landing-summary">
            {landingSurface.summaryBlocks.slice(0, 2).map((block) => (
              <div key={block.key}>
                {block.title ? <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{block.title}</p> : null}
                {block.body ? <p className="m-0 mt-1 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
        {job.heroQuote ? (
          <blockquote className="m-0 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm italic text-[var(--fm-text-muted)]">
            {job.heroQuote}
          </blockquote>
        ) : null}
      </section>

      <ConclusionSummaryBlock
        title={locale === "zh" ? "结论摘要" : "Conclusion summary"}
        body={job.summary}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <MethodologyBlock
        title={locale === "zh" ? "岗位口径" : "Method and scope"}
        body={
          locale === "zh"
            ? "岗位页优先把职责、技能、薪资与匹配线索以 HTML 文本输出，避免把核心信息只留在卡片或交互组件里。"
            : "Job pages prioritize HTML text for responsibilities, skills, salary, and fit signals, so core facts are not trapped inside cards or interactive UI only."
        }
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <SampleInfoBlock
        title={locale === "zh" ? "页面事实摘要" : "Fact summary"}
        items={[
          { label: locale === "zh" ? "岗位代码" : "Job code", value: job.jobCode || job.slug },
          { label: locale === "zh" ? "语言" : "Locale", value: job.locale },
          { label: locale === "zh" ? "Canonical" : "Canonical", value: canonicalUrl(canonicalPath) },
          { label: locale === "zh" ? "索引策略" : "Robots", value: seo?.meta.robots ?? (job.isIndexable ? "index,follow" : "noindex,follow") },
        ]}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

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

      <BoundaryNoteBlock
        title={locale === "zh" ? "边界说明" : "Boundary note"}
        body={
          locale === "zh"
            ? "岗位匹配用于解释群体层面的倾向与能力要求，不代表个人录用结果，也不能替代真实岗位 JD 与面试判断。"
            : "Job fit signals explain group-level tendencies and role requirements. They do not predict individual hiring outcomes or replace real job descriptions and interviews."
        }
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

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

      <AnswerSurfaceSection
        surface={job.answerSurface}
        locale={locale}
        testId="career-job-answer-surface"
      />

      {landingSurface?.ctaBundle.length ? (
        <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]" data-testid="career-job-landing-cta">
          <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "继续探索" : "Continue exploring"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {landingSurface.ctaBundle.map((cta) => (
              <Link key={cta.key} href={normalizePublicHref(cta.href, locale)} className="fm-help-chip-link">
                {cta.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <CanonicalLinkCluster
        title={locale === "zh" ? "图谱必连页面" : "Required graph links"}
        items={graphLinks}
        locale={locale}
        testId="career-job-required-graph-links"
      />

      <Link href={normalizePublicHref(localizedPath("/career/jobs", locale), locale)} className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
        {locale === "zh" ? "返回职业库" : "Back to job library"}
      </Link>
    </Container>
  );
}
