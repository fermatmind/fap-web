import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentPageTemplate, stripContentPageReaderMetadata } from "@/components/content-pages/ContentPageTemplate";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildContentPagePath, getContentPageWithLastKnownGood } from "@/lib/cms/content-pages";
import { resolveLocale } from "@/lib/i18n/getDict";
import { buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

type PolicySlug = "methodology" | "source-review-policy";
type RouteInput = { params: Promise<{ locale: string }>; slug: PolicySlug };

export async function generateBigFivePolicyMetadata({ params, slug }: RouteInput): Promise<Metadata> {
  const { locale: requested } = await params;
  const locale = resolveLocale(requested);
  const [zhResult, enResult] = await Promise.allSettled([
    getContentPageWithLastKnownGood(slug, "zh"),
    getContentPageWithLastKnownGood(slug, "en"),
  ]);
  const selected = locale === "zh" ? zhResult : enResult;
  if (selected.status === "rejected") throw selected.reason;
  const page = selected.value.value;
  const zh = zhResult.status === "fulfilled" ? zhResult.value.value : null;
  const en = enResult.status === "fulfilled" ? enResult.value.value : null;
  if (!page) notFound();
  const path = buildContentPagePath(slug, locale);
  return buildPageMetadata({
    locale,
    pathname: path,
    canonicalCandidate: page.path,
    title: page.seoTitle || page.title,
    description: page.metaDescription || page.summary,
    noindex: !page.isIndexable,
    explicitIndexGate: { indexEligible: page.isIndexable, indexState: page.isIndexable ? "indexed" : "noindex" },
    omitLanguageAlternates: !(zh?.isIndexable && en?.isIndexable),
    alternatesByLocale: {
      zh: buildContentPagePath(slug, "zh"),
      en: buildContentPagePath(slug, "en"),
    },
  });
}

export async function renderBigFivePolicyPage({ params, slug }: RouteInput) {
  const { locale: requested } = await params;
  const locale = resolveLocale(requested);
  const [original, taiwan] = await Promise.allSettled([
    getContentPageWithLastKnownGood(slug, locale),
    getContentPageWithLastKnownGood(slug, "zh-TW"),
  ]);
  if (original.status === "rejected") throw original.reason;
  const page = original.value.value;
  if (!page) notFound();
  const taiwanPage = taiwan.status === "fulfilled" ? taiwan.value.value : null;
  return <>
    {taiwanPage?.locale === "zh-TW" && taiwanPage.slug === slug ? (
      <nav aria-label={locale === "en" ? "Page language" : "页面语言"} className="mb-5 text-sm">
        <Link href={buildContentPagePath(slug, "zh-TW")} lang="zh-TW" className="inline-flex min-h-11 items-center underline">繁體中文（台灣）</Link>
      </nav>
    ) : null}
    {page.schemaEnabled ? <JsonLd id={`${slug}-webpage`} data={buildWebPageJsonLd({
      path: page.path, title: page.title, description: page.summary, locale,
    })} /> : null}
    <ContentPageTemplate page={stripContentPageReaderMetadata(page)} locale={locale} />
  </>;
}
