import type { Metadata } from "next";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Atom,
  BriefcaseBusiness,
  ClipboardCheck,
  Compass,
  Crown,
  DraftingCompass,
  Drama,
  Feather,
  FlaskConical,
  Handshake,
  HeartHandshake,
  Lightbulb,
  Megaphone,
  MessagesSquare,
  Network,
  Palette,
  Rocket,
  Sparkles,
  Star,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { PersonalityFaq } from "@/components/personality/PersonalityFaq";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import {
  listPersonalityComparisons,
  listPersonalityProfiles,
  type PersonalityComparisonListGroupViewModel,
  type GetCmsPersonalityProfilesResult,
} from "@/lib/cms/personality";
import { renderPersonalitySections } from "@/lib/cms/personality-sections";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import { buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";
import type { PersonalityHubFamilyGroup } from "@/lib/mbti/personalityHub.types";
import { applyPersonalityMetadataTitleTemplateGuard } from "@/lib/personality/metadataTitleTemplateGuard";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

const getHubContent = cache(async (locale: Locale): Promise<GetCmsPersonalityProfilesResult> =>
  listPersonalityProfiles({ locale, includeVariants: true, perPage: 100 }).catch(() => ({
    items: [], sections: [], seoMeta: null, landingSurface: null,
    pagination: { currentPage: 1, perPage: 100, total: 0, lastPage: 1 },
  }))
);

function getPersonalityPageSeoCopy(locale: Locale, content: GetCmsPersonalityProfilesResult) {
  const answer = content.sections?.find((section) => section.sectionKey === "quick_answer");
  const hero = content.landingSurface?.summaryBlocks.find((block) => block.key === "hero");
  return {
    title: content.seoMeta?.seoTitle ?? (locale === "zh" ? "人格目录暂不可用" : "Personality directory unavailable"),
    description: content.seoMeta?.seoDescription ?? "",
    h1: hero?.title ?? (locale === "zh" ? "人格目录" : "Personality directory"),
    summary: answer?.bodyMd ?? hero?.body ?? "",
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const content = await getHubContent(locale);
  const seoCopy = getPersonalityPageSeoCopy(locale, content);

  return applyPersonalityMetadataTitleTemplateGuard(buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/personality" : "/en/personality",
    noindex: !content.seoMeta || content.items.length === 0,
    title: seoCopy.title,
    description: seoCopy.description,
    alternatesByLocale: {
      en: "/en/personality",
      zh: "/zh/personality",
      xDefault: "/",
    },
  }), seoCopy.title);
}

const GROUP_TONES: Record<
  string,
  {
    tile: string;
    eyebrow: string;
    icon: string;
    chip: string;
    cta: string;
  }
> = {
  NT: {
    tile: "border-[#cfe7eb] bg-[#eef9fb]",
    eyebrow: "text-[#21778c]",
    icon: "bg-[#d9f0f4] text-[#21778c]",
    chip: "border-[#b9dfe6] bg-white text-[#21778c]",
    cta: "text-[#21778c]",
  },
  NF: {
    tile: "border-[#d5eadf] bg-[#edf8f2]",
    eyebrow: "text-[#2f7d5f]",
    icon: "bg-[#dcf1e6] text-[#2f7d5f]",
    chip: "border-[#c2e2d1] bg-white text-[#2f7d5f]",
    cta: "text-[#2f7d5f]",
  },
  SJ: {
    tile: "border-[#d7e3f0] bg-[#eef5fd]",
    eyebrow: "text-[#3b638f]",
    icon: "bg-[#dfeaf8] text-[#3b638f]",
    chip: "border-[#c6d7eb] bg-white text-[#3b638f]",
    cta: "text-[#3b638f]",
  },
  SP: {
    tile: "border-[#ecdcae] bg-[#fff4d9]",
    eyebrow: "text-[#a36d13]",
    icon: "bg-[#fae6b6] text-[#a36d13]",
    chip: "border-[#ead49d] bg-white text-[#8a620f]",
    cta: "text-[#a36d13]",
  },
};

const TYPE_ICONS: Record<string, LucideIcon> = {
  INTJ: DraftingCompass,
  INTP: FlaskConical,
  ENTJ: Crown,
  ENTP: MessagesSquare,
  INFJ: Lightbulb,
  INFP: Feather,
  ENFJ: Megaphone,
  ENFP: Sparkles,
  ISTJ: ClipboardCheck,
  ISFJ: HeartHandshake,
  ESTJ: BriefcaseBusiness,
  ESFJ: Handshake,
  ISTP: Wrench,
  ISFP: Palette,
  ESTP: Rocket,
  ESFP: Drama,
};

type TypeVariantCard = PersonalityHubFamilyGroup["cards"][number];
type ComparisonListItem = PersonalityComparisonListGroupViewModel["items"][number];

function TypeGroupBrowse({
  groups,
  comparisonGroups,
  locale,
  mbtiTestHref,
  content,
}: {
  groups: PersonalityHubFamilyGroup[];
  comparisonGroups: PersonalityComparisonListGroupViewModel[];
  locale: Locale;
  mbtiTestHref: string;
  content: GetCmsPersonalityProfilesResult;
}) {
  const formatTypeLabel = (type: TypeVariantCard) => {
    return type.title.startsWith(type.typeCode) ? type.title : `${type.typeCode} - ${type.title}`;
  };
  const getDisplayName = (type: TypeVariantCard) =>
    formatTypeLabel(type)
      .replace(new RegExp(`^${type.typeCode}\\s*[-—–]\\s*`, "i"), "")
      .replace(new RegExp(`^${type.baseTypeCode}\\s*[-—–]\\s*`, "i"), "")
      .trim();
  const formatDisplayNameText = (displayName: string) =>
    locale === "zh" ? Array.from(displayName).join(" ") : displayName;
  const displayNameClassName =
    locale === "zh"
      ? "m-0 mt-2 w-full text-center font-sans text-base font-semibold tracking-[0.08em] text-[#17112f]"
      : "m-0 mt-2 w-full text-center font-sans text-[0.95rem] font-semibold tracking-[0.03em] text-[#17112f]";
  const clickablePillMotion =
    "transition-transform duration-150 ease-out hover:scale-110 hover:shadow-[0_8px_18px_rgba(33,119,140,0.18)] focus-visible:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current";
  const getTone = (groupKey: string) => GROUP_TONES[groupKey] ?? GROUP_TONES.NT;
  const comparisonLabel = (item: ComparisonListItem) =>
    item.leftType && item.rightType ? `${item.leftType} VS ${item.rightType}` : item.title;
  const allComparisonItems = comparisonGroups.flatMap((group) => group.items);
  const popularComparisons = allComparisonItems.slice(0, 8);
  const comparisonHrefByBaseType = new Map(
    allComparisonItems
      .filter((item) => item.comparisonType === "mbti_at_comparison" && item.baseTypeCode)
      .map((item) => [item.baseTypeCode.toUpperCase(), item.href])
  );
  const crossComparisonsByBaseType = comparisonGroups
    .flatMap((group) => group.items)
    .filter((item) => item.comparisonType === "mbti_cross_type")
    .reduce((map, item) => {
      const codes = new Set(
        [...item.baseTypeCodes, item.leftType, item.rightType]
          .filter((code): code is string => Boolean(code))
          .map((code) => code.toUpperCase())
      );

      for (const code of codes) {
        const existing = map.get(code) ?? [];
        if (!existing.some((entry) => entry.slug === item.slug)) {
          existing.push(item);
          map.set(code, existing);
        }
      }

      return map;
    }, new Map<string, ComparisonListItem[]>());
  const groupCardsByBaseType = (cards: TypeVariantCard[]) => {
    const grouped = new Map<
      string,
      {
        baseTypeCode: string;
        displayName: string;
        variants: TypeVariantCard[];
      }
    >();

    for (const card of cards) {
      const baseTypeCode = card.baseTypeCode.toUpperCase();
      const existing = grouped.get(baseTypeCode);
      if (existing) {
        existing.variants.push(card);
        continue;
      }

      grouped.set(baseTypeCode, {
        baseTypeCode,
        displayName: getDisplayName(card),
        variants: [card],
      });
    }

    return Array.from(grouped.values()).map((entry) => ({
      ...entry,
      variants: entry.variants.sort((left, right) => {
        const leftRank = left.variantCode === "A" || left.typeCode.endsWith("-A") ? 0 : 1;
        const rightRank = right.variantCode === "A" || right.typeCode.endsWith("-A") ? 0 : 1;
        return leftRank - rightRank;
      }),
    }));
  };
  const featureItems = [
    {
      icon: Sparkles,
      title: locale === "zh" ? "人格描述" : "Model",
      body: locale === "zh" ? "参考四组偏好" : "Four preference pairs",
    },
    {
      icon: Network,
      title: locale === "zh" ? "32 个变体" : "32 variants",
      body: locale === "zh" ? "A/T 阅读变体" : "A/T variant inventory",
    },
    {
      icon: Compass,
      title: locale === "zh" ? "阅读提示" : "Deep reading",
      body: locale === "zh" ? "结合经历与反例" : "Read the full profile",
    },
    {
      icon: Star,
      title: locale === "zh" ? "实用指引" : "Practical guide",
      body: locale === "zh" ? "提出探索问题" : "Questions for self-observation",
    },
  ];
  const variantCount = groups.reduce((count, group) => count + group.cards.length, 0);
  const baseTypeCount = groups.reduce((count, group) => count + groupCardsByBaseType(group.cards).length, 0);
  const seoCopy = getPersonalityPageSeoCopy(locale, content);

  return (
    <section id="type-groups" className="space-y-8" data-testid="personality-type-group-browse">
      <section className="relative overflow-hidden rounded-[1.75rem] border border-[#e7e3ec] bg-[#fbfafc] px-6 py-10 shadow-[0_18px_70px_rgba(38,28,54,0.08)] md:px-10 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(126,96,160,0.13),transparent_32%),radial-gradient(circle_at_88%_18%,rgba(47,125,95,0.12),transparent_28%)]" />
        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="max-w-3xl space-y-4">
              <h1 className="m-0 text-4xl font-semibold leading-tight tracking-normal text-[#17112f] md:text-[2.75rem] xl:text-5xl">
                {seoCopy.h1}
              </h1>
              <p className="m-0 max-w-2xl text-base leading-8 text-[#586271]">
                {seoCopy.summary}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href={mbtiTestHref}
                className="inline-flex items-center gap-2 rounded-full bg-[#5f447e] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#4f376d]"
              >
                {locale === "zh" ? "开始 MBTI 免费测试" : "Start the free MBTI test"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="#type-directory"
                className="inline-flex items-center gap-2 rounded-full border border-[#ded7e8] bg-white/80 px-6 py-3 text-sm font-semibold text-[#17112f] transition hover:-translate-y-0.5 hover:border-[#5f447e] hover:text-[#5f447e]"
              >
                {locale === "zh" ? "选择基础人格" : "Choose a base type"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {featureItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="flex min-h-32 items-center gap-4 rounded-2xl border border-[#e8e2ee] bg-white/70 p-5 shadow-sm"
                >
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#f0eaf7] text-[#5f447e] shadow-sm ring-1 ring-[#e4dbea]">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-base font-semibold text-[#17112f]">{item.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-[#6d7480]">{item.body}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="grid gap-5 rounded-[1.75rem] border border-[#e7e3ec] bg-white px-5 py-7 shadow-[0_18px_70px_rgba(38,28,54,0.06)] lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.9fr)]"
        data-testid="personality-hub-seo-overview"
      >
        <div className="space-y-4">
          <h2 className="m-0 text-2xl font-semibold tracking-normal text-[#17112f]">
            {locale === "zh" ? "先看 16 型，再进入 32 个 A/T 人格" : "Start with 16 types, then open 32 A/T variants"}
          </h2>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-[#ded7e8] bg-[#fbfafc] px-3 py-1.5 text-xs font-semibold text-[#5f447e]">
              {locale === "zh" ? `${baseTypeCount} 个基础人格` : `${baseTypeCount} base types`}
            </span>
            <span className="rounded-full border border-[#ded7e8] bg-[#fbfafc] px-3 py-1.5 text-xs font-semibold text-[#5f447e]">
              {locale === "zh" ? `${variantCount} 个 A/T 变体` : `${variantCount} A/T variants`}
            </span>
            <span className="rounded-full border border-[#ded7e8] bg-[#fbfafc] px-3 py-1.5 text-xs font-semibold text-[#5f447e]">
              {locale === "zh" ? "人格解释与对比入口" : "Profile and comparison paths"}
            </span>
          </div>
        </div>

        {popularComparisons.length > 0 ? (
          <div className="rounded-2xl border border-[#e7e3ec] bg-[#fbfafc] p-4" data-testid="personality-popular-comparisons">
            <h2 className="m-0 text-base font-semibold text-[#17112f]">
              {locale === "zh" ? "人格对比入口" : "Featured personality comparisons"}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {popularComparisons.map((item) => (
                <Link
                  key={item.slug}
                  href={item.href}
                  className="inline-flex items-center gap-1 rounded-full border border-[#b9dfe6] bg-white px-3 py-1.5 text-xs font-semibold text-[#21778c] transition-transform duration-150 ease-out hover:scale-105 focus-visible:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                >
                  {comparisonLabel(item)}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      {renderPersonalitySections(content.sections?.filter((section) => ["meaning", "growth_edges"].includes(section.sectionKey)) ?? [], locale, true)}

      <section
        id="type-directory"
        className="rounded-[1.75rem] border border-[#e7e3ec] bg-white px-5 py-7 shadow-[0_18px_70px_rgba(38,28,54,0.07)] md:px-6 md:py-8"
        data-testid="personality-type-directory"
      >
        <div className="space-y-12">
          {groups.map((group, groupIndex) => {
            const tone = getTone(group.groupKey);

            return (
              <section key={`${group.groupKey}-types`} id={group.groupKey.toLowerCase()} className="scroll-mt-24">
                <div className="grid auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {groupCardsByBaseType(group.cards).map((typeGroup, typeIndex) => {
                    const TypeIcon = TYPE_ICONS[typeGroup.baseTypeCode] ?? Atom;
                    const variantA = typeGroup.variants.find(
                      (variant) => variant.variantCode === "A" || variant.typeCode.endsWith("-A")
                    );
                    const variantT = typeGroup.variants.find(
                      (variant) => variant.variantCode === "T" || variant.typeCode.endsWith("-T")
                    );
                    const type = variantA ?? variantT ?? typeGroup.variants[0];
                    const isPriorityImage = groupIndex === 0 && typeIndex < 4;
                    const comparisonHref =
                      comparisonHrefByBaseType.get(typeGroup.baseTypeCode) ??
                      (variantA && variantT
                        ? localizedPath(
                            `/personality/${variantA.typeCode.toLowerCase()}-vs-${variantT.typeCode.toLowerCase()}`,
                            locale
                          )
                        : null);

                    return (
                      <div key={typeGroup.baseTypeCode} className="flex h-full flex-col gap-2">
                        <p className={displayNameClassName}>
                          {formatDisplayNameText(typeGroup.displayName)}
                        </p>
                        <article className="flex min-h-[8.75rem] flex-1 flex-col rounded-xl border border-[#e6e4ea] bg-white p-4 text-[#17112f] shadow-sm">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                            {type?.imageUrl ? (
                              <Image
                                src={type.imageUrl}
                                alt={formatTypeLabel(type)}
                                width={112}
                                height={112}
                                sizes="112px"
                                className="h-9 w-9 object-contain"
                                data-testid="personality-type-image"
                                data-loading-strategy={isPriorityImage ? "priority" : "lazy"}
                                {...(isPriorityImage ? { priority: true } : { loading: "lazy" as const })}
                              />
                            ) : (
                              <span
                                className={`grid h-9 w-9 place-items-center rounded-xl ${tone.icon}`}
                                data-testid="personality-type-code-fallback"
                              >
                                <TypeIcon className="h-[18px] w-[18px]" aria-hidden="true" />
                              </span>
                            )}
                          </span>
                          <div className="flex min-w-0 flex-1 flex-col items-center">
                            <div
                              className="inline-flex w-fit max-w-full flex-nowrap items-center gap-2 whitespace-nowrap"
                            >
                              {variantA ? (
                                <Link
                                  href={variantA.href}
                                  className={`inline-flex h-11 w-[4.75rem] shrink-0 items-center justify-center rounded-full border text-sm font-semibold leading-none ${clickablePillMotion} ${tone.chip}`}
                                >
                                  {variantA.typeCode}
                                </Link>
                              ) : null}
                              {variantT ? (
                                <Link
                                  href={variantT.href}
                                  className={`inline-flex h-11 w-[4.75rem] shrink-0 items-center justify-center rounded-full border text-sm font-semibold leading-none ${clickablePillMotion} ${tone.chip}`}
                                >
                                  {variantT.typeCode}
                                </Link>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className="mt-auto flex flex-wrap gap-2 pt-5">
                          <Link
                            href={localizedPath(`/personality/${typeGroup.baseTypeCode.toLowerCase()}`, locale)}
                            className={`inline-flex items-center justify-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${clickablePillMotion} ${tone.chip}`}
                          >
                            {typeGroup.baseTypeCode} {locale === "zh" ? "基础人格" : "base profile"}
                            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                          </Link>
                          {(crossComparisonsByBaseType.get(typeGroup.baseTypeCode) ?? []).slice(0, 2).map((item) => (
                            <Link
                              key={item.slug}
                              href={item.href}
                              className={`inline-flex items-center justify-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${clickablePillMotion} ${tone.chip}`}
                            >
                              {comparisonLabel(item)}
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          ))}
                          {comparisonHref && variantA && variantT ? (
                            <Link
                              href={comparisonHref}
                              className={`inline-flex items-center justify-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${clickablePillMotion} ${tone.chip}`}
                            >
                              {variantA.typeCode} VS {variantT.typeCode}
                              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                          ) : null}
                        </div>
                        </article>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </section>

    </section>
  );
}

export default async function PersonalityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (path: string) => localizedPath(path, locale);
  const [content, comparisonList] = await Promise.all([
    getHubContent(locale),
    listPersonalityComparisons(locale).catch(() => ({
      comparisonListContractVersion: "mbti.comparison_list.v1",
      locale,
      scaleCode: "MBTI",
      groups: [],
      atComparisons: [],
      crossTypeComparisons: [],
    })),
  ]);
  const canonicalPath = locale === "zh" ? "/zh/personality" : "/en/personality";
  const { items: personalities, landingSurface } = content;
  const seoCopy = getPersonalityPageSeoCopy(locale, content);
  const hubPayload = buildPersonalityHubPayload({
    locale,
    canonicalPath,
    personalities,
    landingSurface,
  });
  const mbtiEntryViewTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_index",
    sourcePageType: "personality_index",
    targetAction: "entry_view",
    sourcePath: canonicalPath,
  });
  const typeItemList = hubPayload.jsonLdInputs?.typeItemList ?? [];
  const faqSection = content.sections?.find((section) => section.sectionKey === "faq");
  const faqPayload = faqSection?.payloadJson as { items?: { question: string; answer: string }[] } | null;
  const faqItems = faqPayload?.items ?? [];
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: seoCopy.title,
    description: seoCopy.description,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "人格" : "Personality", path: canonicalPath },
  ]);
  const itemListJsonLd =
    typeItemList.length
      ? buildItemListJsonLd({
          path: canonicalPath,
          title: locale === "zh" ? "32 个 A/T 人格入口目录" : "32 A/T personality variant inventory",
          description:
            locale === "zh"
              ? "32 个 A/T 人格变体内容页目录。"
              : "Published 32 A/T personality variant profile directory.",
          locale,
          idSuffix: "personality-inventory",
          items: typeItemList.map((item) => ({
            name: item.name,
            path: item.url,
            description: item.description,
          })),
        })
      : null;
  return (
    <Container as="main" className="max-w-7xl space-y-10 py-10 pb-24 [&_[id]]:scroll-mt-24 [&_table]:min-w-[36rem]">
      <AnalyticsPageViewTracker eventName="landing_view" properties={mbtiEntryViewTrackingProps} />
      <JsonLd id="personality-webpage" data={webPageJsonLd} />
      <JsonLd id="personality-breadcrumb" data={breadcrumbJsonLd} />
      {itemListJsonLd ? <JsonLd id="personality-itemlist-jsonld" data={itemListJsonLd} /> : null}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: withLocale("/") },
          { label: locale === "zh" ? "人格" : "Personality" },
        ]}
      />

      <TypeGroupBrowse
        groups={hubPayload.familyGroups}
        comparisonGroups={comparisonList.groups}
        locale={locale}
        mbtiTestHref={withLocale("/tests/mbti-personality-test-16-personality-types")}
        content={content}
      />
      <PersonalityFaq locale={locale} items={faqItems} />
      {renderPersonalitySections(content.sections?.filter((section) => section.sectionKey === "sources_and_method") ?? [], locale, true)}
    </Container>
  );
}
