import { Container } from "@/components/layout/Container";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { CareerGuideBody } from "@/components/content/CareerGuideBody";
import { RelatedContent } from "@/components/content/RelatedContent";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildCareerGuideFrontendUrl,
  careerGuideAlternatePath,
  getCareerGuideFromCmsBySlug,
  getCareerGuideSeoFromCmsBySlug,
  normalizeCareerGuideSeoPayload,
  withoutUnreviewedCareerJobSteps,
} from "@/lib/cms/career-guides";
import { loadPublicDetailBundle } from "@/lib/cms/publicDetailBundle";
import { resolveCareerGuideMetadataTitle } from "@/lib/seo/careerGuideMetadataTitle";
import { canonicalUrl, isConfiguredStagingSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type RouteProps = { params: Promise<{ slug: string }> };
const locale = "zh-TW";

const loadGuide = cache(async (slug: string) => {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(slug)) notFound();
  const { detail: guide, seo } = await loadPublicDetailBundle({
    readDetail: async () => {
      const detail = await getCareerGuideFromCmsBySlug(slug, locale);
      return detail?.bodyMd.trim() || detail?.bodyHtml.trim() ? detail : null;
    },
    readSeo: () => getCareerGuideSeoFromCmsBySlug(slug, locale),
  });
  if (!guide) notFound();
  return { guide, seo, normalized: normalizeCareerGuideSeoPayload(seo, guide, locale) };
});

export async function generateMetadata({ params }: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const { normalized } = await loadGuide(slug);
  const canonical = canonicalUrl(buildCareerGuideFrontendUrl(locale, slug));
  const { meta } = normalized;
  const robots = meta.robots.toLowerCase().split(",").map((value) => value.trim());
  return {
    title: resolveCareerGuideMetadataTitle(meta.title),
    description: meta.description,
    alternates: { canonical },
    robots: { index: false, follow: !isConfiguredStagingSiteUrl() && !robots.includes("nofollow") && !robots.includes("none") },
    openGraph: {
      type: "article",
      locale: "zh_TW",
      url: canonical,
      title: meta.og.title,
      description: meta.og.description,
      images: meta.og.image ?? undefined,
    },
  };
}

export default async function TraditionalCareerGuidePage({ params }: RouteProps) {
  const { slug } = await params;
  const { guide, seo, normalized } = await loadGuide(slug);
  const zh = careerGuideAlternatePath(seo?.meta.alternates["zh-CN"], buildCareerGuideFrontendUrl("zh", slug));
  const en = careerGuideAlternatePath(seo?.meta.alternates.en, buildCareerGuideFrontendUrl("en", slug));
  return (
    <Container as="main" className="min-w-0 space-y-6 py-10">
      <JsonLd id={`career-guide-jsonld-${slug}`} data={normalized.jsonld} />
      <header className="space-y-4">
        <Link href="/zh-TW/career/guides" className="inline-flex min-h-11 items-center underline">返回職涯路徑指南</Link>
        {zh || en ? <nav aria-label="頁面語言" className="flex flex-wrap gap-5 text-sm">
          {zh ? <Link href={zh} lang="zh-CN" className="min-h-11 py-2 underline">简体中文</Link> : null}
          {en ? <Link href={en} lang="en" className="min-h-11 py-2 underline">English</Link> : null}
        </nav> : null}
        <h1 className="break-words font-serif text-3xl font-semibold leading-tight sm:text-4xl">{guide.title}</h1>
      </header>
      <article className="fm-content-page-prose min-w-0 break-words" data-testid="career-guide-body">
        <CareerGuideBody guide={guide} locale={locale} />
      </article>
      <div className={guide.relatedArticles.length > 0 ? "grid gap-5 lg:grid-cols-2" : "grid gap-5"}>
        <AnswerSurfaceSection
          surface={withoutUnreviewedCareerJobSteps(guide.answerSurface)}
          locale="zh"
          testId="career-guide-answer-surface"
          pageFamily="career_guide"
          appearance="career-guide"
          hideHeading
        />
        <RelatedContent title="相關文章" items={guide.relatedArticles} appearance="career-guide" />
      </div>
    </Container>
  );
}
