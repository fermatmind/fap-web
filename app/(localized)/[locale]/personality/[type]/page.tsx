import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildPersonalityFrontendUrl,
  buildDefaultPublicPersonalitySlug,
  getPersonalityProjectionDetailBySlugOrType,
  getPersonalitySeoBySlugOrType,
  isCanonicalPersonalityBaseSlug,
  normalizePersonalitySeoPayload,
} from "@/lib/cms/personality";
import { extractPersonalityFaqItems, renderPersonalitySections, renderProjectionSections } from "@/lib/cms/personality-sections";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { canonicalUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

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
  return buildPersonalityFrontendUrl(locale, slug);
}

function redirectLegacyBaseRouteIfNeeded(type: string, locale: Locale): void {
  if (!isCanonicalPersonalityBaseSlug(type)) {
    return;
  }

  permanentRedirect(buildPersonalityFrontendUrl(locale, buildDefaultPublicPersonalitySlug(type)));
}

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);
  redirectLegacyBaseRouteIfNeeded(type, locale);

  const [detail, seo] = await Promise.all([
    getPersonalityProjectionDetailBySlugOrType(type, locale),
    getPersonalitySeoBySlugOrType(type, locale),
  ]);

  if (!detail) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const normalizedSeo = normalizePersonalitySeoPayload(seo, detail, locale);
  const canonicalPath = pathFromCanonicalUrl(
    normalizedSeo.meta.canonical,
    buildCanonicalPath(detail.routeSlug, locale)
  );
  const noindex = !detail.isIndexable || shouldNoindex(normalizedSeo.meta.robots);
  const metadata = buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title: normalizedSeo.surface?.title || normalizedSeo.meta.title,
    description: normalizedSeo.surface?.description || normalizedSeo.meta.description,
    imagePath: normalizedSeo.surface?.og.image ?? normalizedSeo.meta.og.image ?? undefined,
    seoSurface: normalizedSeo.surface,
    noindex: !normalizedSeo.surface ? noindex : undefined,
    alternatesByLocale: {
      en: normalizedSeo.meta.alternates.en ?? buildPersonalityFrontendUrl("en", detail.routeSlug),
      zh: normalizedSeo.meta.alternates["zh-CN"] ?? buildPersonalityFrontendUrl("zh", detail.routeSlug),
      xDefault: "/",
    },
  });
  const canonical = normalizedSeo.surface?.canonicalUrl ?? normalizedSeo.meta.canonical ?? canonicalUrl(canonicalPath);
  const ogImage = normalizedSeo.surface?.og.image ?? normalizedSeo.meta.og.image ?? null;

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
    },
    openGraph: {
      type: "article",
      url: normalizedSeo.surface?.og.url ?? canonical,
      title: normalizedSeo.surface?.og.title || normalizedSeo.meta.og.title,
      description: normalizedSeo.surface?.og.description || normalizedSeo.meta.og.description,
      images: ogImage ? [ogImage] : undefined,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
    twitter: {
      card: resolveTwitterCard(normalizedSeo.surface?.twitter.card ?? normalizedSeo.meta.twitter.card),
      title: normalizedSeo.surface?.twitter.title || normalizedSeo.meta.twitter.title,
      description: normalizedSeo.surface?.twitter.description || normalizedSeo.meta.twitter.description,
      images: (normalizedSeo.surface?.twitter.image ?? normalizedSeo.meta.twitter.image ?? ogImage)
        ? [normalizedSeo.surface?.twitter.image ?? normalizedSeo.meta.twitter.image ?? ogImage]
        : undefined,
    },
  };
}

export default async function PersonalityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);
  redirectLegacyBaseRouteIfNeeded(type, locale);
  const [detail, seo] = await Promise.all([
    getPersonalityProjectionDetailBySlugOrType(type, locale),
    getPersonalitySeoBySlugOrType(type, locale),
  ]);

  if (!detail) {
    return notFound();
  }

  const normalizedSeo = normalizePersonalitySeoPayload(seo, detail, locale);
  const canonicalPath = pathFromCanonicalUrl(
    normalizedSeo.meta.canonical,
    buildCanonicalPath(detail.routeSlug, locale)
  );
  const faqItems = extractPersonalityFaqItems(detail.faqSections);
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: normalizedSeo.meta.title,
    description: normalizedSeo.meta.description,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "人格" : "Personality", path: localizedPath("/personality", locale) },
    { name: detail.displayType, path: canonicalPath },
  ]);
  const renderedProjectionSections = renderProjectionSections(detail.projection.sections, locale);
  const renderedSupplementalSections = renderPersonalitySections(
    [...detail.faqSections, ...detail.supplementalSections],
    locale
  );
  const hasRenderableContent = renderedProjectionSections.length > 0 || renderedSupplementalSections.length > 0;
  const landingSurface = detail.landingSurface;

  return (
    <Container as="main" className="space-y-6 py-10">
      <JsonLd id={`personality-jsonld-${detail.slug}`} data={normalizedSeo.jsonld} />
      <JsonLd id={`personality-webpage-${detail.slug}`} data={webPageJsonLd} />
      <JsonLd id={`personality-breadcrumb-${detail.slug}`} data={breadcrumbJsonLd} />
      {faqItems.length > 0 ? <JsonLd id={`personality-faq-${detail.slug}`} data={buildFAQPageJsonLd(faqItems)} /> : null}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "人格" : "Personality", href: localizedPath("/personality", locale) },
          { label: detail.displayType },
        ]}
      />

      <section
        id="answer-first"
        className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      >
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {detail.displayType}
        </p>
        {detail.heroKicker ? <p className="m-0 text-sm font-medium text-[var(--fm-text-muted)]">{detail.heroKicker}</p> : null}
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{detail.title}</h1>
        {detail.subtitle ? <p className="m-0 text-lg text-[var(--fm-text)]">{detail.subtitle}</p> : null}
        {detail.summary ? <p className="m-0 text-[var(--fm-text-muted)]">{detail.summary}</p> : null}
        {detail.heroSummary && detail.heroSummary !== detail.summary ? (
          <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{detail.heroSummary}</p>
        ) : null}
        {landingSurface?.summaryBlocks.length ? (
          <div className="space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4" data-testid="personality-detail-landing-summary">
            {landingSurface.summaryBlocks.slice(0, 2).map((block) => (
              <div key={block.key}>
                {block.title ? <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{block.title}</p> : null}
                {block.body ? <p className="m-0 mt-1 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
        {(detail.typeName || detail.nickname || detail.rarity || detail.keywords.length > 0) ? (
          <div className="space-y-3 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <div className="flex flex-wrap gap-3 text-sm text-[var(--fm-text-muted)]">
              {detail.typeName ? (
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Type name" : "Type name"}:</span>{" "}
                  {detail.typeName}
                </p>
              ) : null}
              {detail.nickname ? (
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Nickname" : "Nickname"}:</span>{" "}
                  {detail.nickname}
                </p>
              ) : null}
              {detail.rarity ? (
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Rarity" : "Rarity"}:</span>{" "}
                  {detail.rarity}
                </p>
              ) : null}
            </div>
            {detail.keywords.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {detail.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface)] px-3 py-1 text-xs font-medium text-[var(--fm-text)]"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
        {detail.heroQuote ? (
          <blockquote className="m-0 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm italic text-[var(--fm-text-muted)]">
            {detail.heroQuote}
          </blockquote>
        ) : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {hasRenderableContent ? (
            <>
              {renderedProjectionSections}
              {renderedSupplementalSections}
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "内容暂未同步" : "Content not yet available"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  {locale === "zh"
                    ? "该人格画像已接入 CMS，但当前语言下尚未同步可渲染的 sections。"
                    : "This personality profile is connected to the CMS, but no renderable sections are available for this locale yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "Profile summary" : "Profile summary"}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Type" : "Type"}:</span>{" "}
                  {detail.displayType}
                </p>
                {detail.displayType !== detail.canonicalTypeCode ? (
                  <p className="m-0">
                    <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Base type" : "Base type"}:</span>{" "}
                    {detail.canonicalTypeCode}
                  </p>
                ) : null}
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Locale" : "Locale"}:</span>{" "}
                  {detail.locale}
                </p>
                <p className="m-0">
                  <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Planned URL" : "Planned URL"}:</span>{" "}
                  {normalizedSeo.meta.canonical ?? canonicalUrl(canonicalPath)}
                </p>
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Indexing" : "Indexing"}:</span>{" "}
                {normalizedSeo.meta.robots}
              </p>
            </CardContent>
          </Card>

          {landingSurface?.ctaBundle.length ? (
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "继续探索" : "Continue exploring"}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2" data-testid="personality-detail-landing-cta">
                {landingSurface.ctaBundle.map((cta) => (
                  <Link key={cta.key} href={cta.href} className="fm-help-chip-link">
                    {cta.label}
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>{locale === "zh" ? "SEO snapshot" : "SEO snapshot"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
              <div>
                <p className="m-0 font-medium text-[var(--fm-text)]">{locale === "zh" ? "Title" : "Title"}</p>
                <p className="mb-0 mt-1">{normalizedSeo.meta.title || "-"}</p>
              </div>
              <div>
                <p className="m-0 font-medium text-[var(--fm-text)]">{locale === "zh" ? "Description" : "Description"}</p>
                <p className="mb-0 mt-1">{normalizedSeo.meta.description || "-"}</p>
              </div>
              <div>
                <p className="m-0 font-medium text-[var(--fm-text)]">Canonical</p>
                <p className="mb-0 mt-1 break-all">{normalizedSeo.meta.canonical || "-"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
