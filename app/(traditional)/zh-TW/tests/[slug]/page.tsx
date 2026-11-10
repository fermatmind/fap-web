import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TestLandingPage, { generateMetadata as sourceMetadata } from "@/app/(localized)/[locale]/tests/[slug]/page";
import { resolveCanonicalSlug } from "@/lib/assessmentSlugMap";
import { NOINDEX_ROBOTS } from "@/lib/seo/noindex";
import { isCoreAssessmentSlug } from "@/lib/tests/coreAssessmentSlugs";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isCoreAssessmentSlug(slug)) return { robots: NOINDEX_ROBOTS };
  const source = await sourceMetadata({ params: Promise.resolve({ locale: "zh", slug }) });
  const translate = await loadTraditionalAssessmentText();
  const title = typeof source.title === "string" ? source.title : source.title && "absolute" in source.title ? source.title.absolute : undefined;
  return {
    title: title ? translate(title) : undefined,
    description: typeof source.description === "string" ? translate(source.description) : undefined,
    alternates: { canonical: `/zh-TW/tests/${resolveCanonicalSlug(slug)}` },
    robots: NOINDEX_ROBOTS,
  };
}

export default async function TraditionalAssessmentLandingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  if (!isCoreAssessmentSlug(slug)) return notFound();
  return TestLandingPage({ params: Promise.resolve({ locale: "zh-TW", slug }), searchParams });
}
