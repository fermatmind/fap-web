import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildTopicFrontendUrl,
  getTopicBySlug,
  getTopicSeoBySlug,
  normalizeTopicSeoPayload,
} from "@/lib/cms/topics";
import { extractTopicFaqItems, renderTopicEntryGroups, renderTopicSections } from "@/lib/cms/topic-sections";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata, normalizeTwitterImages, resolveTwitterCard } from "@/lib/seo/metadata";
import { canonicalUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

function shouldNoindex(robotsValue: string | null | undefined): boolean {
  return String(robotsValue ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes("noindex");
}

function buildCanonicalPath(slug: string, locale: Locale): string {
  return buildTopicFrontendUrl(locale, slug);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const [topic, seo] = await Promise.all([
    getTopicBySlug(slug, locale),
    getTopicSeoBySlug(slug, locale),
  ]);

  if (!topic) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const canonicalPath = buildCanonicalPath(topic.slug, locale);
  const normalizedSeo = normalizeTopicSeoPayload(seo, topic, locale);
  const noindex = !topic.isIndexable || shouldNoindex(normalizedSeo.meta.robots);
  const metadata = buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title: normalizedSeo.surface?.title || normalizedSeo.meta.title,
    description: normalizedSeo.surface?.description || normalizedSeo.meta.description,
    imagePath: normalizedSeo.surface?.og.image ?? normalizedSeo.meta.og.image ?? undefined,
    seoSurface: normalizedSeo.surface,
    noindex: !normalizedSeo.surface ? noindex : undefined,
    alternatesByLocale: {
      en: buildTopicFrontendUrl("en", topic.slug),
      zh: buildTopicFrontendUrl("zh", topic.slug),
      xDefault: "/",
    },
  });
  const canonical = normalizedSeo.surface?.canonicalUrl || canonicalUrl(canonicalPath);
  const ogImage = normalizedSeo.surface?.og.image ?? normalizedSeo.meta.og.image ?? null;
  const twitterImages = normalizeTwitterImages(
    normalizedSeo.surface?.twitter.image,
    normalizedSeo.meta.twitter.image,
    ogImage,
    metadata.twitter?.images,
  );

  return {
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
    },
    openGraph: {
      type: "article",
      url: normalizedSeo.surface?.og.url || canonical,
      title: normalizedSeo.surface?.og.title || normalizedSeo.meta.og.title,
      description: normalizedSeo.surface?.og.description || normalizedSeo.meta.og.description,
      images: ogImage ? [ogImage] : undefined,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
    twitter: {
      card: resolveTwitterCard(normalizedSeo.surface?.twitter.card ?? normalizedSeo.meta.twitter.card),
      title: normalizedSeo.surface?.twitter.title || normalizedSeo.meta.twitter.title,
      description: normalizedSeo.surface?.twitter.description || normalizedSeo.meta.twitter.description,
      images: twitterImages,
    },
  };
}

export default async function TopicDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const [topic, seo] = await Promise.all([
    getTopicBySlug(slug, locale),
    getTopicSeoBySlug(slug, locale),
  ]);

  if (!topic) {
    return notFound();
  }

  const normalizedSeo = normalizeTopicSeoPayload(seo, topic, locale);
  const canonicalPath = buildCanonicalPath(topic.slug, locale);
  const faqItems = topic.answerSurface?.faqBlocks.length
    ? topic.answerSurface.faqBlocks
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
    : extractTopicFaqItems(topic.sections);
  const landingSurface = topic.landingSurface;
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: normalizedSeo.meta.title,
    description: normalizedSeo.meta.description,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "主题" : "Topics", path: localizedPath("/topics", locale) },
    { name: topic.title, path: canonicalPath },
  ]);
  const renderedSections = renderTopicSections(topic.sections, locale);
  const renderedEntryGroups = renderTopicEntryGroups(topic.entryGroups, locale);

  return (
    <Container as="main" className="space-y-6 py-10">
      <JsonLd id={`topic-jsonld-${topic.slug}`} data={normalizedSeo.jsonld} />
      <JsonLd id={`topic-webpage-${topic.slug}`} data={webPageJsonLd} />
      <JsonLd id={`topic-breadcrumb-${topic.slug}`} data={breadcrumbJsonLd} />
      {faqItems.length > 0 ? <JsonLd id={`topic-faq-${topic.slug}`} data={buildFAQPageJsonLd(faqItems)} /> : null}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "主题" : "Topics", href: localizedPath("/topics", locale) },
          { label: topic.title },
        ]}
      />

      <section
        id="answer-first"
        className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      >
        {topic.heroKicker ? (
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
            {topic.heroKicker}
          </p>
        ) : null}
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{topic.title}</h1>
        {topic.subtitle ? <p className="m-0 text-lg text-[var(--fm-text)]">{topic.subtitle}</p> : null}
        {topic.excerpt ? <p className="m-0 text-[var(--fm-text-muted)]">{topic.excerpt}</p> : null}
        {landingSurface?.summaryBlocks.length ? (
          <div className="space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4" data-testid="topic-detail-landing-summary">
            {landingSurface.summaryBlocks.slice(0, 2).map((block) => (
              <div key={block.key}>
                {block.title ? <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{block.title}</p> : null}
                {block.body ? <p className="m-0 mt-1 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
        {topic.heroQuote ? (
          <blockquote className="m-0 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm italic text-[var(--fm-text-muted)]">
            {topic.heroQuote}
          </blockquote>
        ) : null}
      </section>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          {renderedSections}
          <AnswerSurfaceSection
            surface={topic.answerSurface}
            locale={locale}
            testId="topic-detail-answer-surface"
          />
          {renderedEntryGroups}
          <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
            <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
              {locale === "zh" ? "继续延伸阅读" : "Continue with related public guides"}
            </h2>
            <div className="flex flex-wrap gap-2 text-sm">
              {landingSurface?.ctaBundle.length
                ? landingSurface.ctaBundle.map((cta) => (
                    <Link key={cta.key} href={cta.href} className="fm-help-chip-link">
                      {cta.label}
                    </Link>
                  ))
                : (
                    <>
                      <Link href={localizedPath("/personality", locale)} className="fm-help-chip-link">
                        {locale === "zh" ? "人格画像" : "Personality hub"}
                      </Link>
                      <Link href={localizedPath("/career/recommendations", locale)} className="fm-help-chip-link">
                        {locale === "zh" ? "职业推荐" : "Career recommendations"}
                      </Link>
                      <Link href={localizedPath("/help/faq", locale)} className="fm-help-chip-link">
                        {locale === "zh" ? "帮助与 FAQ" : "Help and FAQ"}
                      </Link>
                    </>
                  )}
            </div>
          </section>
          {renderedSections.length === 0 && renderedEntryGroups.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "内容暂未同步" : "Content not yet available"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-[var(--fm-text-muted)]">
                <p className="m-0">
                  {locale === "zh"
                    ? "该 topic 已接入 CMS，但当前语言下尚未同步可渲染的 sections 或 entry groups。"
                    : "This topic is connected to the CMS, but no renderable sections or entry groups are available for this locale yet."}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{locale === "zh" ? "Topic summary" : "Topic summary"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Topic code" : "Topic code"}:</span>{" "}
                {topic.topicCode || topic.slug}
              </p>
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Locale" : "Locale"}:</span>{" "}
                {topic.locale}
              </p>
              <p className="m-0">
                <span className="font-medium text-[var(--fm-text)]">{locale === "zh" ? "Canonical" : "Canonical"}:</span>{" "}
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
                <p className="m-0 font-medium text-[var(--fm-text)]">Title</p>
                <p className="mb-0 mt-1">{normalizedSeo.meta.title || "-"}</p>
              </div>
              <div>
                <p className="m-0 font-medium text-[var(--fm-text)]">Description</p>
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
