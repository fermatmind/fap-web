import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import { fetchCareerJobBundle } from "@/lib/career/api/fetchCareerJobBundle";
import { fetchCareerLinkTargets } from "@/lib/career/api/fetchCareerLinkTargets";
import { normalizeCareerPage, validateCareerPageAuthority } from "@/lib/career/careerPage";
import { CAREER_RENDERER_RELEASE } from "@/lib/career/detailRuntime";
import { buildCareerDisplayCtaHref } from "@/lib/career/displaySurface";
import { buildCareerPageDisplaySurface, careerDisplayIdentity } from "@/lib/career/pageDisplay";
import { isSafeCareerJobSlug } from "@/lib/career/slugSafety";
import { PublicReadError } from "@/lib/public-content/readError";
import { canonicalUrl, isConfiguredStagingSiteUrl } from "@/lib/site";
import { extractAttributionParamsFromRecord } from "@/lib/tracking/attribution";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const loadPage = cache(async (slug: string) => {
  if (!isSafeCareerJobSlug(slug)) notFound();
  const response = await fetchCareerJobBundle({ locale: "zh-TW", slug });
  if (!response) notFound();
  const raw = typeof response.data === "object" && response.data !== null
    ? response.data as typeof response
    : response;
  const page = normalizeCareerPage(raw.career_page, "zh-TW", slug);
  if (!page || !page.display) {
    throw new PublicReadError({ kind: "contract", errorCode: "CAREER_PAGE_TRADITIONAL_PROJECTION_INVALID" });
  }
  validateCareerPageAuthority(raw, page, "zh-TW", slug);
  return { page, identity: careerDisplayIdentity(slug, raw.ontology) };
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { page } = await loadPage(slug);
  const canonical = canonicalUrl(`/zh-TW/career/jobs/${slug}`);
  const title = page.seo.title ?? page.content.subject.name;
  const description = page.seo.description ?? undefined;
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: false, follow: !isConfiguredStagingSiteUrl() },
    openGraph: { title, description, url: canonical, locale: "zh_TW" },
  };
}

export default async function TraditionalCareerJobPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page, identity } = await loadPage(slug);
  const path = `/career/jobs/${slug}`;
  const ctaHref = buildCareerDisplayCtaHref({
    locale: "zh",
    subjectSlug: slug,
    landingPath: `/zh-TW${path}`,
    attributionParams: extractAttributionParamsFromRecord(await searchParams ?? {}),
  });
  const surface = buildCareerPageDisplaySurface(page, identity, ctaHref);
  surface.cta.href = ctaHref.replace(/^\/zh\//u, "/zh-TW/");
  surface.careerLinkPaths = await fetchCareerLinkTargets();
  return (
    <div className="relative left-1/2 w-[calc(100vw-2rem)] max-w-[1440px] -translate-x-1/2" data-evidence-page-family="career_job_detail">
      <nav aria-label="頁面語言" className="flex flex-wrap gap-5 px-5 text-sm">
        <Link href={`/zh${path}`} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link>
        <Link href={`/en${path}`} lang="en" className="min-h-11 py-2 underline">English</Link>
      </nav>
      <CareerDisplaySurface
        surface={surface}
        rendererRelease={CAREER_RENDERER_RELEASE}
        breadcrumbItems={[
          { label: "首頁", href: "/zh-TW" },
          { label: "職涯探索", href: "/zh-TW/career" },
          { label: page.content.subject.name },
        ]}
      />
    </div>
  );
}
