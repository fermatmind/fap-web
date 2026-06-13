import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { listPersonalityProfiles } from "@/lib/cms/personality";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import { buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
import { buildPersonalityHubPayload } from "@/lib/mbti/personalityHub.adapter";
import type { PersonalityHubFamilyGroup } from "@/lib/mbti/personalityHub.types";
import { buildBreadcrumbJsonLd, buildItemListJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);

  return buildPageMetadata({
    locale,
    pathname: locale === "zh" ? "/zh/personality" : "/en/personality",
    title: locale === "zh" ? "人格类型" : "Personality Types",
    description:
      locale === "zh"
        ? "先做 MBTI 测试，或直接浏览 32 个 A/T 人格变体内容。"
        : "Start the MBTI test or browse the 32 A/T personality variant profiles directly.",
    alternatesByLocale: {
      en: "/en/personality",
      zh: "/zh/personality",
      xDefault: "/",
    },
  });
}

const GROUP_TONES: Record<
  string,
  {
    section: string;
    eyebrow: string;
    avatar: string;
    avatarShade: string;
    chip: string;
    cta: string;
  }
> = {
  NT: {
    section: "bg-[#e7f3f5]",
    eyebrow: "text-[#21778c]",
    avatar: "bg-[#2b8da0] text-white",
    avatarShade: "bg-[#1f6977]",
    chip: "border-[#a9d3dc] bg-white/55 text-[#1f6977]",
    cta: "text-[#21778c]",
  },
  NF: {
    section: "bg-[#e8f5ef]",
    eyebrow: "text-[#2f7d5f]",
    avatar: "bg-[#3e9a73] text-white",
    avatarShade: "bg-[#2f7458]",
    chip: "border-[#b7dccd] bg-white/55 text-[#2f7458]",
    cta: "text-[#2f7d5f]",
  },
  SJ: {
    section: "bg-[#eef3fa]",
    eyebrow: "text-[#3b638f]",
    avatar: "bg-[#47739f] text-white",
    avatarShade: "bg-[#334f73]",
    chip: "border-[#c0d2e8] bg-white/55 text-[#334f73]",
    cta: "text-[#3b638f]",
  },
  SP: {
    section: "bg-[#fbf2d8]",
    eyebrow: "text-[#a36d13]",
    avatar: "bg-[#c58a18] text-white",
    avatarShade: "bg-[#8a620f]",
    chip: "border-[#e8d199] bg-white/55 text-[#7b580e]",
    cta: "text-[#a36d13]",
  },
};

const TYPE_LETTER_LABELS: Record<Locale, Record<string, string>> = {
  zh: {
    I: "内倾",
    E: "外倾",
    N: "直觉",
    S: "实感",
    T: "思考",
    F: "情感",
    J: "判断",
    P: "感知",
  },
  en: {
    I: "Introvert",
    E: "Extravert",
    N: "Intuition",
    S: "Sensing",
    T: "Thinking",
    F: "Feeling",
    J: "Judging",
    P: "Perceiving",
  },
};

function TypeGroupBrowse({
  groups,
  locale,
  mbtiTestHref,
  careerHref,
}: {
  groups: PersonalityHubFamilyGroup[];
  locale: Locale;
  mbtiTestHref: string;
  careerHref: string;
}) {
  const formatTypeLabel = (type: PersonalityHubFamilyGroup["cards"][number]) => {
    return type.title.startsWith(type.typeCode) ? type.title : `${type.typeCode} - ${type.title}`;
  };
  const getDisplayName = (type: PersonalityHubFamilyGroup["cards"][number]) =>
    formatTypeLabel(type)
      .replace(new RegExp(`^${type.typeCode}\\s*[-—–]\\s*`, "i"), "")
      .replace(new RegExp(`^${type.baseTypeCode}\\s*[-—–]\\s*`, "i"), "")
      .trim();
  const getTone = (groupKey: string) => GROUP_TONES[groupKey] ?? GROUP_TONES.NT;
  const letterLabels = TYPE_LETTER_LABELS[locale];

  return (
    <section id="type-groups" className="space-y-10" data-testid="personality-type-group-browse">
      <section className="grid min-h-[420px] content-center gap-10 rounded-[2rem] border border-[var(--fm-border)] bg-[var(--fm-surface)] px-6 py-12 shadow-sm md:px-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-14">
        <div className="max-w-3xl space-y-7">
          <div className="space-y-4">
            <h1 className="m-0 text-5xl font-semibold leading-[0.95] tracking-normal text-[var(--fm-text)] md:text-7xl">
              {locale === "zh" ? "32 个 A/T 人格入口" : "32 A/T Personality Variants"}
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={mbtiTestHref}
              className="rounded-full bg-[var(--fm-text)] px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[var(--fm-accent)]"
            >
              {locale === "zh" ? "开始 MBTI 测试" : "Start MBTI test"}
            </Link>
            <Link
              href={careerHref}
              className="rounded-full border border-[var(--fm-border)] bg-white px-6 py-3 text-sm font-semibold text-[var(--fm-text)] transition hover:-translate-y-0.5 hover:border-[var(--fm-accent)] hover:text-[var(--fm-accent)]"
            >
              {locale === "zh" ? "看职业方向" : "Career directions"}
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 self-center">
          {groups.map((group) => {
            const tone = getTone(group.groupKey);

            return (
              <a
                key={`${group.groupKey}-summary`}
                href={`#${group.groupKey.toLowerCase()}`}
                className={`${tone.section} group rounded-2xl p-5 transition hover:-translate-y-1 hover:shadow-md`}
              >
                <p className={`m-0 text-xs font-semibold uppercase tracking-[0.28em] ${tone.eyebrow}`}>
                  {group.groupKey}
                </p>
                <p className="m-0 mt-3 text-2xl font-semibold text-[var(--fm-text)]">{group.title}</p>
                <p className="m-0 mt-8 text-sm text-[var(--fm-muted)]">
                  {group.cards.length} {locale === "zh" ? "种类型" : "types"}
                </p>
              </a>
            );
          })}
        </div>
      </section>

      <div className="space-y-8" data-testid="personality-type-directory">
        {groups.map((group) => (
          <section
            key={`${group.groupKey}-types`}
            id={group.groupKey.toLowerCase()}
            className={`${getTone(group.groupKey).section} overflow-hidden rounded-[2rem] px-5 py-8 md:px-8 lg:px-10`}
          >
            <div className="mb-8 grid gap-5 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)] md:items-end">
              <div>
                <p className={`m-0 text-xs font-semibold uppercase tracking-[0.34em] ${getTone(group.groupKey).eyebrow}`}>
                  {group.groupKey}
                </p>
                <h2 className="m-0 mt-3 text-4xl font-semibold text-[var(--fm-text)] md:text-6xl">
                  {group.title}
                </h2>
              </div>
              <p className="m-0 max-w-2xl text-base leading-7 text-[var(--fm-muted)] md:justify-self-end">
                {group.summary}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {group.cards.map((type) => {
                const tone = getTone(group.groupKey);

                return (
                  <Link
                    key={type.slug}
                    href={type.href}
                    className="group grid min-h-[310px] content-between rounded-2xl bg-white/80 p-5 text-[var(--fm-text)] shadow-sm ring-1 ring-black/5 transition duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-lg"
                    aria-label={formatTypeLabel(type)}
                  >
                    <div>
                      <div className="relative mb-8 flex h-32 items-end justify-center">
                        <div
                          className={`absolute bottom-0 h-20 w-20 rotate-45 rounded-2xl ${tone.avatarShade} opacity-15 transition group-hover:rotate-[52deg]`}
                        />
                        {type.imageUrl ? (
                          <div
                            className="relative h-28 w-28 overflow-hidden rounded-[1.75rem] bg-white shadow-sm ring-1 ring-black/5 transition group-hover:-translate-y-1"
                            data-testid="personality-type-image"
                          >
                            <Image
                              src={type.imageUrl}
                              alt={formatTypeLabel(type)}
                              fill
                              sizes="(min-width: 1280px) 7rem, 7rem"
                              className="object-contain p-2"
                            />
                          </div>
                        ) : (
                          <div
                            className={`relative grid h-24 w-24 place-items-center rounded-[1.75rem] ${tone.avatar} text-xl font-semibold shadow-sm transition group-hover:-translate-y-1`}
                            data-testid="personality-type-code-fallback"
                          >
                            {type.typeCode}
                          </div>
                        )}
                        <div className={`absolute right-8 top-2 h-6 w-6 rounded-full ${tone.avatarShade} opacity-40`} />
                        <div className={`absolute left-8 top-8 h-3 w-12 rounded-full ${tone.avatarShade} opacity-30`} />
                      </div>

                      <h3 className="m-0 text-2xl font-semibold leading-tight text-[var(--fm-text)]">
                        {type.typeCode}
                      </h3>
                      <p className="m-0 mt-2 text-base font-medium leading-6 text-[var(--fm-text)]">
                        {getDisplayName(type)}
                      </p>
                      <p className="m-0 mt-3 line-clamp-3 text-sm leading-6 text-[var(--fm-muted)]">
                        {type.excerpt}
                      </p>
                    </div>

                    <div className="mt-7 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {type.baseTypeCode.split("").map((letter) => (
                          <span
                            key={`${type.slug}-${letter}`}
                            className={`rounded-full border px-2.5 py-1 text-xs font-medium ${tone.chip}`}
                          >
                            {letterLabels[letter] ?? letter}
                          </span>
                        ))}
                        {type.variantCode ? (
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${tone.chip}`}>
                            {type.variantCode}
                          </span>
                        ) : null}
                      </div>
                      <span className={`inline-flex text-sm font-semibold ${tone.cta}`}>
                        {locale === "zh" ? "查看人格画像" : "View profile"}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
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
  const { items: personalities, landingSurface } = await listPersonalityProfiles({
    locale,
    includeVariants: true,
    perPage: 100,
  }).catch(() => ({
    items: [],
    landingSurface: null,
    pagination: {
      currentPage: 1,
      perPage: 20,
      total: 0,
      lastPage: 1,
    },
  }));
  const canonicalPath = locale === "zh" ? "/zh/personality" : "/en/personality";
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
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: locale === "zh" ? "人格类型" : "Personality Types",
    description:
      locale === "zh"
        ? "先做 MBTI 测试，或直接浏览 32 个 A/T 人格变体内容。"
        : "Start the MBTI test or browse the 32 A/T personality variant profiles directly.",
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
    <Container as="main" className="space-y-10 py-10 pb-24">
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
        locale={locale}
        mbtiTestHref={withLocale("/tests/mbti-personality-test-16-personality-types")}
        careerHref={withLocale("/career/recommendations")}
      />
    </Container>
  );
}
