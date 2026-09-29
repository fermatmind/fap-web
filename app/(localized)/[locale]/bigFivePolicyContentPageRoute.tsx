import type { Metadata } from "next";
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
  const page = (await getContentPageWithLastKnownGood(slug, locale)).value;
  if (!page) notFound();
  return <>
    {page.schemaEnabled ? <JsonLd id={`${slug}-webpage`} data={buildWebPageJsonLd({
      path: page.path, title: page.title, description: page.summary, locale,
    })} /> : null}
    <ContentPageTemplate page={stripContentPageReaderMetadata(page)} locale={locale} />
  </>;
}
