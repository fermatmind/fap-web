import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContentPageTemplate, stripContentPageReaderMetadata } from "@/components/content-pages/ContentPageTemplate";
import { getContentPageWithLastKnownGood } from "@/lib/cms/content-pages";
import { SITE_URL } from "@/lib/site";

async function about() {
  const page = (await getContentPageWithLastKnownGood("about", "zh-TW")).value;
  if (!page || page.locale !== "zh-TW") notFound();
  return page;
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await about();
  return {
    title: page.seoTitle || page.title,
    description: page.metaDescription || page.summary,
    alternates: { canonical: `${SITE_URL}/zh-TW/about` },
    robots: page.isIndexable ? undefined : { index: false, follow: true },
    openGraph: {
      title: page.seoTitle || page.title,
      description: page.metaDescription || page.summary,
      url: `${SITE_URL}/zh-TW/about`, locale: "zh_TW", type: "website",
    },
  };
}

export default async function TraditionalAboutPage() {
  const page = await about();
  return <>
    <nav aria-label="頁面語言" className="mb-5 flex flex-wrap gap-5 text-sm">
      <span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span>
      <Link href="/zh/about" lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href="/en/about" lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <ContentPageTemplate page={stripContentPageReaderMetadata(page)} locale="zh-TW" />
  </>;
}
