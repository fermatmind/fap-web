import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { PersonalityFaq } from "@/components/personality/PersonalityFaq";
import {
  getPersonalityComparisonBySlug,
  getPersonalityProjectionDetailBySlugOrType,
  getPersonalitySeoBySlugOrType,
} from "@/lib/cms/personality";
import {
  extractPersonalityFaqItems,
  renderTraditionalPersonalityProjectionSections,
  renderTraditionalPersonalityRichSections,
} from "@/lib/cms/personality-sections";
import { MBTI_ENTRY_TEST_SLUG } from "@/lib/mbti/entryTracking";
import { isPersonalityComparisonSlug } from "@/lib/mbti/personalityComparison";

export async function loadTraditionalMbtiCurrentReader(slug: string) {
  const canonical = "/zh-TW/personality/" + slug;
  if (isPersonalityComparisonSlug(slug)) {
    const comparison = await getPersonalityComparisonBySlug(slug, "zh-TW");
    if (!comparison) return null;
    const { sections, seoSurface, seoMeta } = comparison;
    if (!sections.some(section => section.sectionKey === "sources_and_method")) {
      throw new Error("Missing native MBTI comparison reader sections");
    }
    const faq = sections.find(section => section.sectionKey === "faq");
    return {
      canonical,
      title: comparison.title,
      summary: comparison.summary,
      image: null,
      authority: "comparison_public_projection_v1",
      traditionalLanguageAlternates: comparison.traditionalLanguageAlternates,
      indexEligible: seoMeta?.robots === "index,follow" &&
        seoSurface?.indexabilityState === "indexable" && seoSurface.robotsPolicyExplicit && seoSurface.robotsPolicy === "index,follow",
      metadata: {
        title: seoSurface?.title || seoMeta?.seoTitle,
        description: seoSurface?.description || seoMeta?.seoDescription,
        openGraph: {
          title: seoSurface?.og.title || seoMeta?.ogTitle || undefined,
          description: seoSurface?.og.description || seoMeta?.ogDescription || undefined,
          locale: "zh_TW",
        },
      } satisfies Metadata,
      sections: sections.filter(section => section.isEnabled).map(section => ({
        key: section.sectionKey,
        title: section.sectionKey === "faq" ? "常見問題" : section.title,
        content: section.sectionKey === "faq"
          ? <PersonalityFaq locale="zh-TW" items={faq ? extractPersonalityFaqItems([faq]) : []} />
          : renderTraditionalPersonalityRichSections([section]),
      })),
    };
  }

  const [detail, seo] = await Promise.all([
    getPersonalityProjectionDetailBySlugOrType(slug, "zh-TW"),
    getPersonalitySeoBySlugOrType(slug, "zh-TW"),
  ]);
  if (!detail || !seo) return null;
  const { sections } = detail.projection;
  if (!sections.some(section => section.key === "sources_and_method") ||
    sections.some(section => section.render !== "rich_text" && section.render !== "faq")) {
    throw new Error("Missing or unsupported native MBTI profile reader sections");
  }
  const name = (detail.projection.seo.jsonld as { name?: unknown } | null)?.name;
  return {
    canonical,
    title: typeof name === "string" && name.trim() ? name : detail.title,
    summary: detail.heroSummary,
    image: detail.heroImageUrl,
    authority: "mbti_public_projection_v1",
    traditionalLanguageAlternates: detail.traditionalLanguageAlternates,
    indexEligible: detail.seoMeta?.robots === "index,follow" && seo.meta.robots === "index,follow" &&
      seo.surface?.indexabilityState === "indexable" && seo.surface.robotsPolicyExplicit && seo.surface.robotsPolicy === "index,follow",
    metadata: {
      title: seo.meta.title,
      description: seo.meta.description,
      openGraph: {
        title: seo.meta.og.title,
        description: seo.meta.og.description,
        images: seo.meta.og.image ? [seo.meta.og.image] : undefined,
        locale: "zh_TW",
      },
    } satisfies Metadata,
    sections: sections.map(section => ({
      key: section.key,
      title: section.title,
      content: renderTraditionalPersonalityProjectionSections([section]),
    })),
  };
}

export function TraditionalMbtiCurrentReader({ reader }: {
  reader: NonNullable<Awaited<ReturnType<typeof loadTraditionalMbtiCurrentReader>>>;
}) {
  return (
    <article className="space-y-8 [&_[id]]:scroll-mt-24" data-authority-source={reader.authority}>
      <Breadcrumb items={[{ label: "首頁", href: "/zh-TW" }, { label: "人格", href: "/zh-TW/personality" }, { label: reader.title }]} />
      <header className="flex flex-wrap items-center justify-between gap-6 rounded-3xl bg-[#77608d] p-7 text-white sm:p-10">
        <div className="min-w-0 flex-1 space-y-4">
          <h1 className="m-0 text-3xl font-semibold text-white sm:text-4xl">{reader.title}</h1>
          {reader.summary ? <p className="m-0 leading-8">{reader.summary}</p> : null}
          <Link href={`/zh/tests/${MBTI_ENTRY_TEST_SLUG}`} lang="zh-CN" className="inline-flex min-h-11 items-center underline">
            <span lang="zh-TW">開始免費 MBTI 測驗（簡體中文）</span>
          </Link>
        </div>
        {reader.image ? <Image src={reader.image} width={160} height={160} alt="" className="h-32 w-32 object-contain sm:h-40 sm:w-40" /> : null}
      </header>
      <nav aria-label="閱讀目錄" className="rounded-2xl border border-[var(--fm-border)] p-4">
        <ul className="m-0 flex list-none flex-wrap gap-x-4 p-0">
          {reader.sections.map(section => (
            <li key={section.key}>
              <a href={section.key === "faq" && reader.authority === "comparison_public_projection_v1" ? "#personality-faq" : "#" + section.key} className="inline-flex min-h-11 items-center underline">
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {reader.sections.map(section => <div key={section.key}>{section.content}</div>)}
    </article>
  );
}
