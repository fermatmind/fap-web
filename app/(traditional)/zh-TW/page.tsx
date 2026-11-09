import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { TraditionalPilotTests } from "@/components/i18n/zh-TW/TraditionalPilotTests";
import { HomePageExperience } from "@/components/marketing/HomePageExperience";
import { ApiError } from "@/lib/api-client";
import { traditionalUi } from "@/lib/i18n/zh-TW/chiikawa";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
import { getHomepageRecommendedArticles } from "@/lib/marketing/homepageRecommendedArticles";
import { listVisibleTestsHubCards } from "@/lib/marketing/testsHubContent";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const loadHome = cache(async () => {
  try {
    return await getHomePageContent("zh-TW");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const copy = await loadHome();
  return {
    title: copy?.seo.title ?? traditionalUi.hub["zh-TW"],
    description: copy?.seo.description ?? traditionalUi.available["zh-TW"],
    alternates: { canonical: `${SITE_URL}/zh-TW` },
  };
}

export default async function TraditionalHome() {
  const copy = await loadHome();
  if (!copy) return <TraditionalPilotTests />;

  const [articles, supplementalTests] = await Promise.all([
    getHomepageRecommendedArticles("zh").catch(() => []),
    listVisibleTestsHubCards("zh-TW").catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) return [];
      throw error;
    }),
  ]);

  return <>
    <nav aria-label="頁面語言" className="mb-5 flex flex-wrap gap-5 text-sm">
      <span aria-current="page" className="min-h-11 py-2">繁體中文（台灣）</span>
      <Link href="/" lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
      <Link href="/en" lang="en" className="min-h-11 py-2 underline">English</Link>
    </nav>
    <HomePageExperience locale="zh-TW" copy={copy} articles={articles} supplementalTests={supplementalTests} />
  </>;
}
