import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { cache } from "react";
import { TraditionalPilotTests } from "@/components/i18n/zh-TW/TraditionalPilotTests";
import { HomePageExperience } from "@/components/marketing/HomePageExperience";
import { ApiError } from "@/lib/api-client";
import { loadBlogArchive } from "@/lib/content/blogArchive";
import { traditionalUi } from "@/lib/i18n/zh-TW/chiikawa";
import { getHomePageContent } from "@/lib/marketing/homepageContent";
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
    alternates: {
      canonical: `${SITE_URL}/zh-TW`,
      languages: copy ? {
        en: `${SITE_URL}/en`,
        "zh-CN": `${SITE_URL}/`,
        "zh-TW": `${SITE_URL}/zh-TW`,
        "x-default": `${SITE_URL}/`,
      } : undefined,
    },
  };
}

export default async function TraditionalHome() {
  const copy = await loadHome();
  if (!copy) return <Container as="main" className="py-10"><TraditionalPilotTests /></Container>;

  const [supplementalTests, archive] = await Promise.all([
    listVisibleTestsHubCards("zh-TW").catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 404) return [];
      throw error;
    }),
    loadBlogArchive("zh-TW", 1),
  ]);
  const blog = archive.data?.blog;
  const publishedBlog = !archive.failed && !archive.stale && blog?.configurationState === "published";
  const articles = publishedBlog ? archive.data?.items ?? [] : [];

  return (
    <main className="fm-homepage">
      <HomePageExperience locale="zh-TW" copy={copy} articles={articles}
        archiveTitle={publishedBlog ? blog.title : null} supplementalTests={supplementalTests} />
    </main>
  );
}
