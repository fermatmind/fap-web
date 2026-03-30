import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { CanonicalLinkCluster } from "@/components/content/CanonicalLinkCluster";
import { Container } from "@/components/layout/Container";
import { BoundaryNoteBlock, ConclusionSummaryBlock, MethodologyBlock } from "@/components/seo/CitationBlocks";
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
import { mergeGraphLinks, requiredGraphLinks } from "@/lib/navigation/contentGraph";
import { normalizePublicHref } from "@/lib/navigation/publicLinking";
import { buildSeoMetadata, buildStructuredDataBundle } from "@/lib/seo/pageInfrastructure";
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
  const seoCanonicalPath = pathFromCanonicalUrl(
    normalizedSeo.surface?.canonicalUrl ?? normalizedSeo.meta.canonical,
    canonicalPath
  );

  return buildSeoMetadata({
    pageType: "hub",
    locale,
    pathname: seoCanonicalPath,
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
    canonical: normalizedSeo.surface?.canonicalUrl || canonicalUrl(canonicalPath),
    metaAlternates: {
      en: canonicalUrl(buildTopicFrontendUrl("en", topic.slug)),
      "zh-CN": canonicalUrl(buildTopicFrontendUrl("zh", topic.slug)),
    },
    ogType: "article",
  });
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
  const canonicalPath = pathFromCanonicalUrl(
    normalizedSeo.surface?.canonicalUrl ?? normalizedSeo.meta.canonical,
    buildCanonicalPath(topic.slug, locale)
  );
  const faqItems = topic.answerSurface?.faqBlocks.length
    ? topic.answerSurface.faqBlocks
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
    : extractTopicFaqItems(topic.sections);
  const landingSurface = topic.landingSurface;
  const schemaNodes = buildStructuredDataBundle({
    idPrefix: `topic-${topic.slug}`,
    pageType: "hub",
    locale,
    canonicalPath,
    title: normalizedSeo.meta.title,
    description: normalizedSeo.meta.description,
    primary: normalizedSeo.jsonld,
    breadcrumbItems: [
      { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
      { name: locale === "zh" ? "主题" : "Topics", path: localizedPath("/topics", locale) },
      { name: topic.title, path: canonicalPath },
    ],
    faqItems,
  });
  const renderedSections = renderTopicSections(topic.sections, locale);
  const renderedEntryGroups = renderTopicEntryGroups(topic.entryGroups, locale);
  const graphLinks = mergeGraphLinks(
    locale,
    (landingSurface?.ctaBundle ?? []).map((cta) => ({ href: cta.href, label: cta.label })),
    requiredGraphLinks("hub", locale)
  );

  return (
    <Container as="main" className="space-y-6 py-10">
      {schemaNodes.map((node) => (
        <JsonLd key={node.id} id={node.id} data={node.data} />
      ))}
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

      <ConclusionSummaryBlock
        title={locale === "zh" ? "结论摘要" : "Conclusion summary"}
        body={topic.excerpt || landingSurface?.summaryBlocks[0]?.body || normalizedSeo.meta.description}
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <MethodologyBlock
        title={locale === "zh" ? "专题口径" : "Hub scope"}
        body={
          locale === "zh"
            ? "Topic 页承担聚合与分发角色，正文会用可见 HTML 说明主题范围、相关入口与延伸阅读，结构化数据只辅助理解页面角色。"
            : "Topic pages act as hubs that aggregate and distribute related entry points. Visible HTML explains the scope, related routes, and follow-up reading, while structured data only supports page understanding."
        }
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

      <BoundaryNoteBlock
        title={locale === "zh" ? "边界说明" : "Boundary note"}
        body={
          locale === "zh"
            ? "专题页用于组织主题知识网络，不应被视为单一结论页。具体定义、方法和测试解释仍以关联实体页、方法页和测评页为准。"
            : "Hub pages organize a topical knowledge network and should not be treated as a single conclusion page. Specific definitions, methods, and testing guidance still live on the linked entity, method, and test pages."
        }
        className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      />

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
                    <Link key={cta.key} href={normalizePublicHref(cta.href, locale)} className="fm-help-chip-link">
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

          <CanonicalLinkCluster
            title={locale === "zh" ? "图谱必连页面" : "Required graph links"}
            items={graphLinks}
            locale={locale}
            testId="topic-required-graph-links"
          />

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
