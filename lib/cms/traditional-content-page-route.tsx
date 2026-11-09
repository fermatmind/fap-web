import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentPageTemplate, stripContentPageReaderMetadata } from "@/components/content-pages/ContentPageTemplate";
import { buildContentPagePath, getContentPageWithLastKnownGood } from "@/lib/cms/content-pages";
import { buildCmsHelpFaqItems, buildVisibleHelpFaqJsonLd } from "@/lib/cms/visible-help-faq";
import { SITE_URL } from "@/lib/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";

async function contentPage(slug: string) {
  const page = (await getContentPageWithLastKnownGood(slug, "zh-TW")).value;
  if (!page || page.locale !== "zh-TW" || page.slug !== slug) notFound();
  return page;
}

export async function generateTraditionalContentPageMetadata(slug: string): Promise<Metadata> {
  const page = await contentPage(slug);
  const canonicalPath = buildContentPagePath(slug, "zh-TW");
  return {
    title: page.seoTitle || page.title,
    description: page.metaDescription || page.summary,
    alternates: { canonical: `${SITE_URL}${canonicalPath}` },
    robots: page.isIndexable ? undefined : { index: false, follow: true },
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.metaDescription || page.summary,
      url: `${SITE_URL}${canonicalPath}`, locale: "zh_TW", type: "website",
    },
  };
}

export async function renderTraditionalContentPage(slug: string) {
  const page = await contentPage(slug);
  const canonicalPath = buildContentPagePath(slug, "zh-TW");
  const faqItems = buildCmsHelpFaqItems(page);
  return <>
    <JsonLd id={`content-page-webpage-${slug}`} data={buildWebPageJsonLd({
      path: canonicalPath, title: page.title, description: page.summary, locale: "zh-TW",
    })} />
    <JsonLd id={`content-page-breadcrumb-${slug}`} data={buildBreadcrumbJsonLd([
      { name: "首頁", path: "/zh-TW" }, { name: page.title, path: canonicalPath },
    ])} />
    {faqItems.length > 0 ? <JsonLd id={`help-faq-${slug}`} data={buildVisibleHelpFaqJsonLd(faqItems)} /> : null}
    <nav aria-label="頁面語言" className="mb-5 flex flex-wrap gap-5 text-sm">
      <span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span>
      <Link href={buildContentPagePath(slug, "zh")} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href={buildContentPagePath(slug, "en")} lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <ContentPageTemplate page={stripContentPageReaderMetadata(page)} locale="zh-TW" />
  </>;
}
