import { GlobalHistoryTypeFigures } from "@/components/entertainment/GlobalHistoryAtlasLinks";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { PersonalityCareerExploration } from "@/components/career/PersonalityCareerExploration";
import { getPersonalityCareerScene, readPersonalityCareerExamples } from "@/lib/career/personalityCareerExploration";
import {
  MbtiComparisonFaq,
  MbtiReaderAside,
  MbtiReaderColumns,
  MbtiReaderHero,
  MbtiReaderMobileNav,
  MbtiReaderPage,
  MbtiReaderSections,
  MbtiReaderToc,
  mbtiReaderDesktopLinkClass,
  mbtiReaderMobileLinkClass,
} from "@/components/personality/MbtiReaderLayout";
import { buttonVariants } from "@/components/ui/button";
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
          ? <MbtiComparisonFaq id="personality-faq" title="常見問題" items={faq ? extractPersonalityFaqItems([faq]) : []} />
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
    sections: sections.map((section) => {
      const title = section.key === "quick_answer" && (!section.title || section.title === section.key)
        ? "快速解答"
        : section.title;
      return {
        key: section.key,
        title,
        content: renderTraditionalPersonalityProjectionSections([{ ...section, title }]),
      };
    }),
  };
}

async function TraditionalIntjCareerExploration() {
  const scene = getPersonalityCareerScene("intj");
  if (!scene?.title["zh-TW"] || !scene.intro["zh-TW"]) return null;
  const cards = await readPersonalityCareerExamples("zh-TW", scene);
  return <PersonalityCareerExploration locale="zh-TW" type="INTJ" title={scene.title["zh-TW"]}
    intro={scene.intro["zh-TW"]} cards={cards} scene={scene} />;
}

export function TraditionalMbtiCurrentReader({ reader }: {
  reader: NonNullable<Awaited<ReturnType<typeof loadTraditionalMbtiCurrentReader>>>;
}) {
  const pageSchema = buildWebPageJsonLd({
    path: reader.canonical,
    title: reader.title,
    description: reader.metadata.description || reader.summary || "",
    locale: "zh-TW",
  });
  const slug = reader.canonical.split("/").at(-1);
  const kind = reader.authority === "comparison_public_projection_v1" ? "comparison" : "detail";
  const links = reader.sections.map(section => ({
    key: section.key,
    href: kind === "comparison" && section.key === "faq" ? "#personality-faq" : "#" + section.key,
    label: section.title,
  }));
  const testLink = (
    <Link
      href={`/zh/tests/${MBTI_ENTRY_TEST_SLUG}`}
      lang="zh-CN"
      className={kind === "comparison"
        ? "inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-[#5f447e] shadow-sm transition hover:bg-white/90"
        : buttonVariants({ variant: "outline", size: "sm", className: "h-auto max-w-full whitespace-normal text-center" })}
    >
      <span lang="zh-TW">開始免費 MBTI 測驗（簡體中文）</span>
    </Link>
  );

  return (
    <MbtiReaderPage kind={kind} data-authority-source={reader.authority}>
      {reader.indexEligible && <>
        <JsonLd
          id={`personality-webpage-${slug}`}
          data={reader.authority === "comparison_public_projection_v1"
            ? { ...pageSchema, "@type": "AboutPage", mainEntityOfPage: pageSchema.url }
            : pageSchema}
        />
        <JsonLd id={`personality-breadcrumb-${slug}`} data={buildBreadcrumbJsonLd([
          { name: "首頁", path: "/zh-TW" },
          { name: "人格", path: "/zh-TW/personality" },
          { name: reader.title, path: reader.canonical },
        ])} />
      </>}
      <Breadcrumb items={[{ label: "首頁", href: "/zh-TW" }, { label: "人格", href: "/zh-TW/personality" }, { label: reader.title }]} />
      <MbtiReaderHero
        kind={kind}
        id={kind === "comparison" ? "comparison-overview" : "answer-first"}
        title={reader.title}
        visual={reader.image ? (
          <div className="w-full max-w-[16rem] justify-self-center rounded-[2rem] border border-white/15 bg-white/10 p-4 md:mt-5 md:justify-self-end">
            <Image src={reader.image} width={160} height={160} alt="" className="mx-auto h-40 w-full object-contain md:h-52" />
          </div>
        ) : undefined}
        footer={kind === "detail" ? <div className="px-7 pb-7 sm:px-10 sm:pb-10 lg:px-14">{testLink}</div> : undefined}
      >
        {reader.summary ? <p className="m-0 max-w-3xl text-base leading-8 text-white/88">{reader.summary}</p> : null}
        {kind === "comparison" ? testLink : null}
      </MbtiReaderHero>

      <MbtiReaderMobileNav aria-label="閱讀目錄">
        {links.map(link => <a key={link.key} href={link.href} className={mbtiReaderMobileLinkClass}>{link.label}</a>)}
      </MbtiReaderMobileNav>

      <MbtiReaderColumns kind={kind}>
        <MbtiReaderAside>
          <MbtiReaderToc title="閱讀目錄" label="閱讀目錄">
            {links.map(link => (
              <li key={link.key}>
                <a href={link.href} className={mbtiReaderDesktopLinkClass}>
                  <span>{link.label}</span>
                  <span aria-hidden="true" className="text-[var(--fm-text-muted)] transition group-hover:text-[var(--fm-accent)]">→</span>
                </a>
              </li>
            ))}
          </MbtiReaderToc>
        </MbtiReaderAside>
        <MbtiReaderSections data-testid={kind === "comparison" ? "personality-comparison-primary-sections" : "personality-detail-v85-primary-sections"}>
          {reader.sections.map(section => <div key={section.key}>
            {section.content}
            {reader.canonical === "/zh-TW/personality/intj" && section.key === "work_style"
              ? <TraditionalIntjCareerExploration /> : null}
          </div>)}
          {slug && <GlobalHistoryTypeFigures locale="zh-TW" type={slug} />}
        </MbtiReaderSections>
      </MbtiReaderColumns>
    </MbtiReaderPage>
  );
}
