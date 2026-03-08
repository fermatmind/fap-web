import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildPersonalityFrontendUrl,
  getPersonalityProfileBySlugOrType,
  getPersonalitySeoBySlugOrType,
  normalizePersonalitySeoPayload,
} from "@/lib/cms/personality";
import { renderPersonalitySections } from "@/lib/cms/personality-sections";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd } from "@/lib/seo/generateSchema";
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);
  const [profile, seo] = await Promise.all([
    getPersonalityProfileBySlugOrType(type, locale),
    getPersonalitySeoBySlugOrType(type, locale),
  ]);

  if (!profile) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const canonicalPath = buildCanonicalPath(profile.slug, locale);
  const normalizedSeo = normalizePersonalitySeoPayload(seo, profile, locale);
  const noindex = !profile.isIndexable || shouldNoindex(normalizedSeo.meta.robots);
  const metadata = buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title: normalizedSeo.meta.title,
    description: normalizedSeo.meta.description,
    imagePath: normalizedSeo.meta.og.image ?? undefined,
    noindex,
    alternatesByLocale: {
      en: buildPersonalityFrontendUrl("en", profile.slug),
      zh: buildPersonalityFrontendUrl("zh", profile.slug),
      xDefault: "/",
    },
  });

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical: canonicalUrl(canonicalPath),
    },
    openGraph: {
      type: "article",
      url: canonicalUrl(canonicalPath),
      title: normalizedSeo.meta.og.title,
      description: normalizedSeo.meta.og.description,
      images: normalizedSeo.meta.og.image ? [normalizedSeo.meta.og.image] : undefined,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
    twitter: {
      card: resolveTwitterCard(normalizedSeo.meta.twitter.card),
      title: normalizedSeo.meta.twitter.title,
      description: normalizedSeo.meta.twitter.description,
      images: normalizedSeo.meta.twitter.image ? [normalizedSeo.meta.twitter.image] : undefined,
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
  const [profile, seo] = await Promise.all([
    getPersonalityProfileBySlugOrType(type, locale),
    getPersonalitySeoBySlugOrType(type, locale),
  ]);

  if (!profile) {
    return notFound();
  }

  const normalizedSeo = normalizePersonalitySeoPayload(seo, profile, locale);
  const canonicalPath = buildCanonicalPath(profile.slug, locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "人格" : "Personality", path: localizedPath("/personality", locale) },
    { name: profile.typeCode, path: canonicalPath },
  ]);
  const renderedSections = renderPersonalitySections(profile.sections, locale);

  return (
    <Container as="main" className="space-y-6 py-10">
      <JsonLd id={`personality-jsonld-${profile.slug}`} data={normalizedSeo.jsonld} />
      <JsonLd id={`personality-breadcrumb-${profile.slug}`} data={breadcrumbJsonLd} />
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "人格" : "Personality", href: localizedPath("/personality", locale) },
          { label: profile.typeCode },
        ]}
      />

      <section className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {profile.heroKicker || profile.typeCode}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
          {profile.title}
        </h1>
        {profile.subtitle ? (
          <p className="m-0 text-lg text-[var(--fm-text)]">{profile.subtitle}</p>
        ) : null}
        {profile.excerpt ? (
          <p className="m-0 text-[var(--fm-text-muted)]">{profile.excerpt}</p>
        ) : null}
        {profile.heroQuote ? (
          <blockquote className="m-0 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm italic text-[var(--fm-text-muted)]">
            {profile.heroQuote}
          </blockquote>
        ) : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {renderedSections.length > 0 ? (
            renderedSections
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
                {profile.typeCode}
              </p>
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Locale" : "Locale"}:</span>{" "}
                {profile.locale}
              </p>
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Planned URL" : "Planned URL"}:</span>{" "}
                {canonicalUrl(canonicalPath)}
              </p>
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Indexing" : "Indexing"}:</span>{" "}
                {normalizedSeo.meta.robots}
              </p>
            </CardContent>
          </Card>

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
