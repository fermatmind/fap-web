import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { TraditionalPilotTests } from "@/components/i18n/zh-TW/TraditionalPilotTests";
import { TestsHubExperience } from "@/components/marketing/tests/TestsHubExperience";
import { ApiError } from "@/lib/api-client";
import { traditionalUi } from "@/lib/i18n/zh-TW/chiikawa";
import { getTestsHubContent } from "@/lib/marketing/testsHubContent";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const loadDirectory = cache(async () => {
  try {
    return await getTestsHubContent("zh-TW");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadDirectory();
  return {
    title: content?.seo.title ?? traditionalUi.hub["zh-TW"],
    description: content?.seo.description ?? traditionalUi.available["zh-TW"],
    alternates: { canonical: `${SITE_URL}/zh-TW/tests` },
  };
}

export default async function TraditionalTestsDirectory() {
  const content = await loadDirectory();
  if (!content) return <TraditionalPilotTests />;

  return <>
    <nav aria-label="頁面語言" className="mb-5 flex flex-wrap gap-5 text-sm">
      <span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span>
      <Link href="/zh/tests" lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href="/en/tests" lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <nav aria-label="測驗分類" className="mb-5 flex flex-wrap gap-5">
      <Link href="/zh-TW/tests/category/personality" className="inline-flex min-h-11 items-center underline">人格與風格</Link>
      <Link href="/zh-TW/tests/category/career" className="inline-flex min-h-11 items-center underline">職業與方向</Link>
    </nav>
    <TestsHubExperience content={content} locale="zh-TW" />
  </>;
}
