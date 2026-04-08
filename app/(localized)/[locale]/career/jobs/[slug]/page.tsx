import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
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
import { buildPageMetadata, normalizeTwitterImages, resolveTwitterCard } from "@/lib/seo/metadata";
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

function resolveCareerExplicitIndexGate(
  job: Awaited<ReturnType<typeof getCareerJobFromCmsBySlug>>,
  seo: Awaited<ReturnType<typeof getCareerJobSeoFromCmsBySlug>>
) {
  return {
    indexEligible: seo?.surface?.indexEligible ?? job?.protocol.careerAsset?.seo_contract.index_eligible ?? null,
    indexState: seo?.surface?.indexState || job?.protocol.careerAsset?.seo_contract.index_state || null,
  };
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

function renderCareerJobProtocolStatus(
  job: NonNullable<Awaited<ReturnType<typeof getCareerJobFromCmsBySlug>>>,
  locale: Locale
) {
  if (job.renderState.careerDataStatus === "available") {
    return null;
  }

  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-950"
      data-testid="career-job-protocol-status"
      data-career-data-status={job.renderState.careerDataStatus}
    >
      <p className="m-0 font-medium">
        {job.renderState.careerDataStatus === "trust_limited"
          ? locale === "zh"
            ? "当前为 trust-limited 渲染"
            : "Rendering in trust-limited mode"
          : locale === "zh"
            ? "当前内容不可用"
            : "Career job data is currently unavailable"}
      </p>
      <p className="m-0 mt-2 leading-7">
        {locale === "zh"
          ? "Career job 页面现在只在显式 claim / trust / index gate 放行时渲染薪资、前景和性格适配等强结论内容。"
          : "This career job page now renders salary, outlook, and fit surfaces only when explicit claim, trust, and index gates allow them."}
      </p>
      {job.renderState.missingFields.length > 0 ? (
        <p className="m-0 mt-2 text-xs uppercase tracking-[0.08em] text-amber-900/80">
          {locale === "zh" ? "缺失字段" : "Missing fields"}: {job.renderState.missingFields.join(", ")}
        </p>
      ) : null}
    </div>
  );
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
  const explicitIndexGate = resolveCareerExplicitIndexGate(job, seo);
  const noindex =
    !job.isIndexable ||
    !job.renderState.canIndexPage ||
    shouldNoindex(seo?.meta.robots ?? job.seoMeta?.robots);
  const metadata = buildPageMetadata({
    locale,
    pathname: seoCanonicalPath,
    title,
    description,
    imagePath: seo?.surface?.og.image ?? seo?.meta.og.image ?? job.coverImageUrl ?? undefined,
    seoSurface: seo?.surface,
    explicitIndexGate,
    noindex,
    alternatesByLocale: {
      en: buildCareerJobFrontendUrl("en", job.slug),
      zh: buildCareerJobFrontendUrl("zh", job.slug),
      xDefault: "/",
    },
  });
  const canonical = seo?.surface?.canonicalUrl ?? canonicalUrl(canonicalPath);
  const ogImage = seo?.surface?.og.image ?? seo?.meta.og.image ?? job.coverImageUrl ?? null;
  const twitterImages = normalizeTwitterImages(
    seo?.surface?.twitter.image,
    seo?.meta.twitter.image,
    ogImage,
    metadata.twitter?.images,
  );

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
      images: twitterImages,
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
  const landingSurface = job.landingSurface;
  const renderState = job.renderState;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "职业" : "Career", path: localizedPath("/career", locale) },
    { name: locale === "zh" ? "职业库" : "Jobs", path: localizedPath("/career/jobs", locale) },
    { name: job.title, path: canonicalPath },
  ]);
  const showFitCard =
    renderState.canRenderFitSurface &&
    (job.fitPersonalityItems.length > 0 ||
      job.mbtiPrimary.length > 0 ||
      job.mbtiSecondary.length > 0 ||
      hasRiasecData(job.riasecVector) ||
      (renderState.canRenderOutlookSurface && Boolean(job.outlookText)));

  return (
    <Container as="main" className="space-y-6 py-10">
      {renderState.canRenderStructuredData && seo?.jsonld ? (
        <JsonLd id={`career-job-occupation-${job.slug}`} data={seo.jsonld} />
      ) : null}
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
        {renderCareerJobProtocolStatus(job, locale)}
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
        {renderState.canRenderSalarySurface ? (
          <Card data-testid="career-job-salary-surface">
            <CardHeader>
              <CardTitle>{locale === "zh" ? "薪资水平" : "Salary range"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">{job.salaryText || (locale === "zh" ? "暂未提供" : "Not available yet")}</p>
              {renderState.canRenderOutlookSurface && job.outlookText ? <p className="m-0">{job.outlookText}</p> : null}
            </CardContent>
          </Card>
        ) : (
          <Card data-testid="career-job-claim-gated-status">
            <CardHeader>
              <CardTitle>{locale === "zh" ? "职业结论闸门" : "Career claim gate"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">
                {locale === "zh"
                  ? "薪资、前景与适配性等强结论内容需要显式 claim permissions。当前页面保持保守，不显示未放行内容。"
                  : "Salary, outlook, and fit claims require explicit claim permissions. This page stays conservative until those gates are available."}
              </p>
            </CardContent>
          </Card>
        )}

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
            {renderState.canRenderOutlookSurface && job.outlookText ? (
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

      {renderState.canRenderAnswerSurface ? (
        <AnswerSurfaceSection
          surface={job.answerSurface}
          locale={locale}
          testId="career-job-answer-surface"
        />
      ) : null}

      {landingSurface?.ctaBundle.length ? (
        <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]" data-testid="career-job-landing-cta">
          <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "继续探索" : "Continue exploring"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {landingSurface.ctaBundle.map((cta) => (
              <Link key={cta.key} href={cta.href} className="fm-help-chip-link">
                {cta.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <Link href={localizedPath("/career/jobs", locale)} className="text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]">
        {locale === "zh" ? "返回职业库" : "Back to job library"}
      </Link>
    </Container>
  );
}
