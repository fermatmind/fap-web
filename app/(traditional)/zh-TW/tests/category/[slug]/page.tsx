import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache, Suspense } from "react";
import { Container } from "@/components/layout/Container";
import { TraditionalPersonalityCategoryLinks } from "@/components/personality/TraditionalPersonalityCategoryLinks";
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
  return <main>
    {content.slug === "personality" ? (
      <Suspense fallback={null}><Container className="pt-6"><TraditionalPersonalityCategoryLinks /></Container></Suspense>
    ) : null}
    <TestCategoryExperience locale="zh-TW" content={content} />
  </main>;
}
