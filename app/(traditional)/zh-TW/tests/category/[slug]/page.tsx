import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { TestCategoryExperience } from "@/components/marketing/tests/TestCategoryExperience";
import { ApiError } from "@/lib/api-client";
import { getTestsCategoryContent } from "@/lib/marketing/testsHubContent";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const loadCategory = cache(async (slug: string) => {
  if (slug !== "personality" && slug !== "career") notFound();

  try {
    return await getTestsCategoryContent("zh-TW", slug);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const content = await loadCategory((await params).slug);
  return {
    title: content.seo.title,
    description: content.seo.description,
    alternates: { canonical: `${SITE_URL}/zh-TW/tests/category/${content.slug}` },
    robots: { index: false, follow: true },
  };
}

export default async function TraditionalTestsCategory({ params }: Props) {
  const content = await loadCategory((await params).slug);
  const suffix = `/tests/category/${content.slug}`;
  return <>
    <nav aria-label="頁面語言" className="mb-5 flex flex-wrap gap-5 text-sm">
      <span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span>
      <Link href={`/zh${suffix}`} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href={`/en${suffix}`} lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <TestCategoryExperience locale="zh-TW" content={content} />
  </>;
}
