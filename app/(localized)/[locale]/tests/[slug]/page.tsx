import type { Metadata } from "next";
import Link from "next/link";
import { cookies, headers } from "next/headers";
import { notFound, permanentRedirect } from "next/navigation";
import { DataGlyph } from "@/components/assessment-cards/DataGlyph";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { CTASticky } from "@/components/business/CTASticky";
import { FAQAccordion, type FAQItem } from "@/components/business/FAQAccordion";
import { MbtiSceneEntrySection } from "@/components/content/MbtiSceneEntrySection";
import { Container } from "@/components/layout/Container";
import { CiteableSection } from "@/components/seo/CiteableSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { resolveCanonicalSlug } from "@/lib/assessmentSlugMap";
import { computeManifestHash } from "@/lib/big5/manifest";
import {
  getAllTests,
  getTestBySlug,
  listRelatedBlogPosts,
  resolveTestTitleByLocale,
} from "@/lib/content";
import { resolveCardSpec } from "@/lib/design/card-resolver";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildApiUrl } from "@/lib/api-base";
import { PUBLIC_API_CACHE_OPTIONS } from "@/lib/publicApiCache";
import type { LandingSurfaceRaw } from "@/lib/api/v0_3";
import {
  buildBig5TakeHref,
  getBig5DurationSummary,
  getBig5QuestionSummary,
  getBig5StartLabel,
  getBig5VariantLabel,
  getBig5VariantSummary,
  isBig5ScaleCode,
  listBig5FormMetas,
} from "@/lib/big5/forms";
import {
  DEFAULT_MBTI_FORM_CODE,
  buildMbtiTakeHref,
  getMbtiDurationSummary,
  getMbtiQuestionSummary,
  getMbtiStartLabel,
  getMbtiVariantLabel,
  getMbtiVariantSummary,
  isMbtiScaleCode,
  listMbtiFormMetas,
} from "@/lib/mbti/forms";
import { buildMbtiEntryHref, buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
import { buildMbtiTestLandingContinuityItems } from "@/lib/mbti/sceneDeepContent";
import {
  createScaleRolloutEnvSnapshot,
  resolveScaleRollout,
  type SupportedScaleCode,
} from "@/lib/rollout/scaleRollout";
import { findLandingCta, normalizeLandingSurface } from "@/lib/landing/landingSurface";
import {
  buildBreadcrumbJsonLd,
  buildFAQPageJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { formatCardTitleForUi } from "@/lib/ui/testTitleDisplay";

type LookupResponse = {
  seo_title?: string | null;
  seo_description?: string | null;
  og_image_url?: string | null;
  is_indexable?: boolean;
  pack_id?: string | null;
  dir_version?: string | null;
  content_package_version?: string | null;
  manifest_hash?: string | null;
  norms_version?: string | null;
  quality_level?: string | null;
  capabilities?: Record<string, unknown> | null;
  content_i18n_json?: Record<string, unknown> | null;
  report_summary_i18n_json?: Record<string, unknown> | null;
  landing_surface_v1?: LandingSurfaceRaw | null;
};

function toRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function toStringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function firstQueryValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }
  return value ?? "";
}

function appendQuery(path: string, query: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined) {
          params.append(key, String(item));
        }
      }
      continue;
    }
    if (value !== undefined) {
      params.append(key, String(value));
    }
  }
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

function parseFaq(value: unknown): FAQItem[] {
  if (!Array.isArray(value)) return [];

  const out: FAQItem[] = [];
  for (const item of value) {
    const node = toRecord(item);
    const q = toStringValue(node.q ?? node.question);
    const a = toStringValue(node.a ?? node.answer);
    if (q && a) {
      out.push({ q, a });
    }
  }
  return out;
}

async function resolveRequestAnonId(): Promise<string | undefined> {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  const fromCookie = cookieStore.get("fap_anonymous_id_v1")?.value?.trim();
  if (fromCookie) return fromCookie;

  const fromHeader = headerStore.get("x-anon-id")?.trim() ?? "";
  return fromHeader || undefined;
}

async function fetchLookup(slug: string, locale: "en" | "zh"): Promise<LookupResponse | null> {
  try {
    const response = await fetch(
      buildApiUrl(`/v0.3/scales/lookup?slug=${encodeURIComponent(slug)}&locale=${locale}`),
      {
        headers: {
          Accept: "application/json",
          "X-FAP-Locale": locale === "zh" ? "zh-CN" : "en",
        },
        ...PUBLIC_API_CACHE_OPTIONS,
      }
    );

    if (!response.ok) return null;
    const payload = (await response.json()) as Record<string, unknown>;
    if (payload.ok === false) return null;

    return {
      seo_title: payload.seo_title as string | null | undefined,
      seo_description: payload.seo_description as string | null | undefined,
      og_image_url: payload.og_image_url as string | null | undefined,
      is_indexable: typeof payload.is_indexable === "boolean" ? payload.is_indexable : undefined,
      pack_id: (payload.pack_id as string | null | undefined) ?? null,
      dir_version: (payload.dir_version as string | null | undefined) ?? null,
      content_package_version: (payload.content_package_version as string | null | undefined) ?? null,
      manifest_hash: (payload.manifest_hash as string | null | undefined) ?? null,
      norms_version: (payload.norms_version as string | null | undefined) ?? null,
      quality_level: (payload.quality_level as string | null | undefined) ?? null,
      capabilities: (payload.capabilities as Record<string, unknown> | null | undefined) ?? null,
      content_i18n_json: (payload.content_i18n_json as Record<string, unknown> | null | undefined) ?? null,
      report_summary_i18n_json:
        (payload.report_summary_i18n_json as Record<string, unknown> | null | undefined) ?? null,
      landing_surface_v1: (payload.landing_surface_v1 as LandingSurfaceRaw | null | undefined) ?? null,
    };
  } catch {
    return null;
  }
}

function buildFallbackFaq(testTitle: string, minutes: number, questions: number, locale: "en" | "zh"): FAQItem[] {
  if (locale === "zh") {
    return [
      { q: `${testTitle} 需要多久？`, a: `大多数用户会在 ${minutes} 分钟左右完成。` },
      { q: "每道题都要回答吗？", a: `是的，完整结果依赖全部 ${questions} 题。` },
      { q: "可以重复测试吗？", a: "可以，你可以对比不同时间的结果变化。" },
      { q: "这是医疗诊断吗？", a: "不是。本测评仅用于自我认知，不替代专业医疗意见。" },
    ];
  }

  return [
    { q: `How long does ${testTitle} take?`, a: `Most people finish this test in about ${minutes} minutes.` },
    { q: "Do I need to answer every question?", a: `Yes. This assessment uses all ${questions} items for a complete profile.` },
    { q: "Can I retake the test?", a: "Yes. You can retake the test to compare results over time." },
    { q: "Is this a medical diagnosis?", a: "No. This is for self-discovery and does not replace medical advice." },
  ];
}

function buildFlagshipVariantFaq(kind: "mbti" | "big5", locale: "en" | "zh"): FAQItem[] {
  if (locale === "zh") {
    if (kind === "mbti") {
      return [
        {
          q: "MBTI 93Q 和 144Q 有什么区别？",
          a: "93Q 更适合先快速读懂人格轮廓与协作风格；144Q 会给出更完整的偏好结构与场景化解释。",
        },
        {
          q: "我应该先做哪一个版本？",
          a: "如果你是第一次进入、想先建立一个容易讨论的人格框架，先做 93Q；如果你已经准备好更完整地看自己的偏好分布，再做 144Q。",
        },
        {
          q: "两个版本都会给出什么？",
          a: "两个版本都会给出 MBTI 类型语言与基础解释；144Q 会提供更完整的画像、协作提示与延伸阅读线索。",
        },
        {
          q: "结果会定义我吗？",
          a: "不会。结果只用于支持判断、讨论和复盘，不替代对一个人的完整理解。",
        },
      ];
    }

    return [
      {
        q: "Big Five 90Q 和 120Q 有什么区别？",
        a: "90Q 适合先快速看五维轮廓与主要差异；120Q 会给出更完整的维度分布、特质解释与应用建议。",
      },
      {
        q: "我应该先做哪一个版本？",
        a: "如果你想先用更轻的成本判断自己是否适合 Big Five，先做 90Q；如果你已经明确要看更完整的特质档案，直接做 120Q。",
      },
      {
        q: "两个版本都会给出什么？",
        a: "两个版本都会给出五大特质的基础分布与解释；120Q 会提供更完整的结构细节，更适合放进职业、关系和压力情境里阅读。",
      },
      {
        q: "这是不是临床或诊断工具？",
        a: "不是。Big Five 用于结构化理解人格特质，不替代临床诊断、治疗或法律判断。",
      },
    ];
  }

  if (kind === "mbti") {
    return [
      {
        q: "What is the difference between MBTI 93Q and 144Q?",
        a: "93Q is the faster read for overall type pattern and collaboration style. 144Q gives a fuller profile with deeper scene-based interpretation.",
      },
      {
        q: "Which version should I start with?",
        a: "Start with 93Q if this is your first pass and you want a discussable personality frame quickly. Choose 144Q when you want the fuller profile up front.",
      },
      {
        q: "What do both versions include?",
        a: "Both versions provide MBTI type language and core interpretation. 144Q goes further with a fuller profile, collaboration cues, and richer follow-through guidance.",
      },
      {
        q: "Does the result define who I am?",
        a: "No. The result supports judgment, discussion, and reflection. It should not be treated as a final definition of a person.",
      },
    ];
  }

  return [
    {
      q: "What is the difference between Big Five 90Q and 120Q?",
      a: "90Q is the faster read for the five-factor outline and the main differences. 120Q gives a fuller trait distribution with deeper interpretation and application notes.",
    },
    {
      q: "Which version should I start with?",
      a: "Start with 90Q if you want a lighter first pass. Choose 120Q when you already know you want the fuller trait profile immediately.",
    },
    {
      q: "What do both versions include?",
      a: "Both versions provide the core five-factor read. 120Q goes deeper on structure and is better for career, relationship, and stress-context interpretation.",
    },
    {
      q: "Is this a clinical or diagnostic tool?",
      a: "No. Big Five is for structured personality understanding and does not replace clinical diagnosis, treatment, or legal judgment.",
    },
  ];
}

function getDetailPageLensCopy(scaleCode: string | undefined, locale: "en" | "zh") {
  switch (String(scaleCode ?? "").trim().toUpperCase()) {
    case "MBTI":
    case "BIG5_OCEAN":
      return {
        eyebrow: locale === "zh" ? "人格与风格测评" : "Personality & Style Assessment",
        whenToUseBody:
          locale === "zh"
            ? "适用于希望理解人格偏好、稳定特质、协作风格与成长方向的场景。"
            : "Use this when you want clearer personality, trait, and collaboration signals that can support growth and decision-making.",
      };
    case "EQ_60":
      return {
        eyebrow: locale === "zh" ? "关系与协作测评" : "Relationship & Collaboration Assessment",
        whenToUseBody:
          locale === "zh"
            ? "适用于希望理解沟通方式、共情能力、反馈模式与协作摩擦的场景。"
            : "Use this when the main question is communication style, empathy, feedback patterns, and collaboration friction.",
      };
    case "SDS_20":
    case "CLINICAL_COMBO_68":
      return {
        eyebrow: locale === "zh" ? "情绪与状态测评" : "Emotion & State Assessment",
        whenToUseBody:
          locale === "zh"
            ? "适用于先确认近期情绪基线、压力信号与是否需要进一步支持的场景。若你处于急性危机状态，请优先联系专业帮助。"
            : "Use this when you need a clearer read on recent emotional baseline, pressure signals, and whether further support is needed. For acute crisis situations, seek professional help first.",
      };
    case "IQ_RAVEN":
      return {
        eyebrow: locale === "zh" ? "认知与能力测评" : "Cognition & Ability Assessment",
        whenToUseBody:
          locale === "zh"
            ? "适用于希望了解推理、抽象识别与能力线索，并把它们放回学习和职业判断中的场景。"
            : "Use this when you want clearer reasoning and ability signals to support learning and career decisions.",
      };
    default:
      return {
        eyebrow: locale === "zh" ? "结构化测评" : "Structured Assessment",
        whenToUseBody:
          locale === "zh"
            ? "适用于希望通过结构化问卷获得更清晰判断参考的场景。"
            : "Use this when you want a more structured reference for interpretation and decision-making.",
      };
  }
}

function alternatesForSlug(slug: string) {
  const en = `/en/tests/${slug}`;
  const zh = `/zh/tests/${slug}`;
  return {
    en,
    zh,
    "x-default": en,
  } as const;
}

type FlagshipVariantChoice = {
  key: string;
  label: string;
  summary: string;
  href: string;
  ctaLabel: string;
  testId: string;
};

function FlagshipVariantChooser({
  title,
  subtitle,
  choices,
}: {
  title: string;
  subtitle: string;
  choices: FlagshipVariantChoice[];
}) {
  return (
    <section className="rounded-[1.7rem] border border-[var(--fm-border)] bg-[rgba(248,250,252,0.92)] p-4 shadow-[var(--fm-shadow-sm)] md:p-5">
      <div className="space-y-2">
        <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.03em] text-slate-950">{title}</h2>
        <p className="m-0 max-w-[42rem] text-sm leading-7 text-slate-600">{subtitle}</p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {choices.map((choice) => (
          <article key={choice.key} className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
            <div className="space-y-2">
              <h3 className="m-0 text-[1rem] font-semibold tracking-[-0.02em] text-slate-950">{choice.label}</h3>
              <p className="m-0 text-sm leading-7 text-slate-600">{choice.summary}</p>
            </div>
            <Link
              href={choice.href}
              prefetch
              data-testid={choice.testId}
              className={buttonVariants({ size: "sm", className: "mt-4 w-full justify-center" })}
            >
              {choice.ctaLabel}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export function generateStaticParams() {
  return getAllTests().flatMap((test) => [{ locale: "en", slug: test.slug }, { locale: "zh", slug: test.slug }]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug: requestedSlug } = await params;
  const slug = resolveCanonicalSlug(requestedSlug);
  const test = getTestBySlug(slug);

  if (!test) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const locale = resolveLocale(localeParam);
  const lookup = await fetchLookup(slug, locale);
  const alternates = alternatesForSlug(test.slug);
  const canonical = localizedPath(`/tests/${test.slug}`, locale);
  const localizedTestTitle = resolveTestTitleByLocale(test, locale);

  const title = toStringValue(lookup?.seo_title) || localizedTestTitle;
  const description = toStringValue(lookup?.seo_description) || test.description;
  const ogImage = toStringValue(lookup?.og_image_url) || test.cover_image;
  const forcedNoindex = lookup?.is_indexable === false;

  return buildPageMetadata({
    locale,
    pathname: canonical,
    title,
    description,
    imagePath: ogImage,
    noindex: forcedNoindex,
    alternatesByLocale: {
      en: alternates.en,
      zh: alternates.zh,
      xDefault: "/",
    },
  });
}

export default async function TestLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ maintenance?: string | string[] }>;
}) {
  const { locale: localeParam, slug: requestedSlug } = await params;
  const query = await searchParams;

  const locale = resolveLocale(localeParam);
  const slug = resolveCanonicalSlug(requestedSlug);
  const withLocale = (path: string) => localizedPath(path, locale);
  if (slug !== requestedSlug) {
    permanentRedirect(appendQuery(withLocale(`/tests/${slug}`), query));
  }

  const test = getTestBySlug(slug);
  if (!test) return notFound();

  const dict = getDictSync(locale);
  const lookup = await fetchLookup(slug, locale);
  const landingSurface = normalizeLandingSurface(lookup?.landing_surface_v1 ?? null);
  const localizedTestTitle = resolveTestTitleByLocale(test, locale);
  const langNode = toRecord(toRecord(lookup?.content_i18n_json)[locale]);
  const reportNode = toRecord(toRecord(lookup?.report_summary_i18n_json)[locale]);
  const anonId = await resolveRequestAnonId();

  const landingCopy = toStringValue(langNode.landing_copy);
  const disclaimer = toStringValue(langNode.disclaimer);
  const reportSummary = toStringValue(reportNode.summary);
  const faqItems = parseFaq(langNode.faq);
  const rollout = resolveScaleRollout({
    scaleCode: test.scale_code as SupportedScaleCode | undefined,
    capabilities: lookup?.capabilities,
    anonId,
    envSnapshot: createScaleRolloutEnvSnapshot(),
  });
  const testDisabled = !rollout.assessmentEnabled;
  const maintenanceRequested = ["1", "true", "yes"].includes(firstQueryValue(query.maintenance).toLowerCase());
  const startTestHref = landingSurface?.startTestTarget || withLocale(`/tests/${test.slug}/take`);
  const showsMbtiActions = isMbtiScaleCode(test.scale_code);
  const showsBig5Actions = isBig5ScaleCode(test.scale_code);
  const isFlagshipDualVariant = showsMbtiActions || showsBig5Actions;
  const mergedFaq = isFlagshipDualVariant
    ? buildFlagshipVariantFaq(showsMbtiActions ? "mbti" : "big5", locale)
    : faqItems.length > 0
      ? faqItems
      : buildFallbackFaq(localizedTestTitle, test.time_minutes, test.questions_count, locale);
  const backToTestsCta = findLandingCta(landingSurface, "back_to_tests");
  const continuePublicContentCta = findLandingCta(landingSurface, "continue_public_content");
  const flagshipVariantChoices: FlagshipVariantChoice[] = showsMbtiActions
    ? listMbtiFormMetas().map((form) => ({
        key: form.formCode,
        label: getMbtiVariantLabel(form.formCode, locale),
        summary: getMbtiVariantSummary(form.formCode, locale),
        href: buildMbtiTakeHref(test.slug, locale, form.formCode),
        ctaLabel: getMbtiStartLabel(form.formCode, locale),
        testId: `test-detail-landing-cta-${form.formCode}`,
      }))
    : showsBig5Actions
      ? listBig5FormMetas().map((form) => ({
          key: form.formCode,
          label: getBig5VariantLabel(form.formCode, locale),
          summary: getBig5VariantSummary(form.formCode, locale),
          href: buildBig5TakeHref(test.slug, locale, form.formCode),
          ctaLabel: getBig5StartLabel(form.formCode, locale),
          testId: `test-detail-landing-cta-${form.formCode}`,
        }))
      : [];
  const mbtiPrimaryChoice = showsMbtiActions
    ? flagshipVariantChoices.find((choice) => choice.key === DEFAULT_MBTI_FORM_CODE) ?? flagshipVariantChoices[0] ?? null
    : null;
  const mbtiSecondaryChoice = showsMbtiActions
    ? flagshipVariantChoices.find((choice) => choice.key !== (mbtiPrimaryChoice?.key ?? DEFAULT_MBTI_FORM_CODE)) ?? null
    : null;
  const mbtiLandingPath = withLocale(`/tests/${test.slug}`);
  const mbtiPrimaryHref = mbtiPrimaryChoice
    ? buildMbtiEntryHref({
        locale,
        testSlug: test.slug,
        formCode: mbtiPrimaryChoice.key,
        entrySurface: "mbti_test_landing",
        sourcePageType: "test_landing",
        targetAction: "start_mbti_test_primary",
        sourcePath: mbtiLandingPath,
      })
    : null;
  const mbtiSecondaryHref = mbtiSecondaryChoice
    ? buildMbtiEntryHref({
        locale,
        testSlug: test.slug,
        formCode: mbtiSecondaryChoice.key,
        entrySurface: "mbti_test_landing",
        sourcePageType: "test_landing",
        targetAction: "start_mbti_test_secondary",
        sourcePath: mbtiLandingPath,
      })
    : null;
  const mbtiEntryViewTrackingProps = showsMbtiActions
    ? buildMbtiEntryTrackingPayload({
        locale,
        testSlug: test.slug,
        formCode: mbtiPrimaryChoice?.key ?? DEFAULT_MBTI_FORM_CODE,
        entrySurface: "mbti_test_landing",
        sourcePageType: "test_landing",
        targetAction: "entry_view",
        sourcePath: mbtiLandingPath,
      })
    : null;
  const mbtiPrimaryClickTrackingProps = mbtiPrimaryChoice
    ? buildMbtiEntryTrackingPayload({
        locale,
        testSlug: test.slug,
        formCode: mbtiPrimaryChoice.key,
        entrySurface: "mbti_test_landing",
        sourcePageType: "test_landing",
        targetAction: "start_mbti_test_primary",
        sourcePath: mbtiLandingPath,
      })
    : null;
  const mbtiSecondaryClickTrackingProps = mbtiSecondaryChoice
    ? buildMbtiEntryTrackingPayload({
        locale,
        testSlug: test.slug,
        formCode: mbtiSecondaryChoice.key,
        entrySurface: "mbti_test_landing",
        sourcePageType: "test_landing",
        targetAction: "start_mbti_test_secondary",
        sourcePath: mbtiLandingPath,
      })
    : null;

  const packId = toStringValue(lookup?.pack_id) || test.scale_code || "BIG5_OCEAN";
  const dirVersion = toStringValue(lookup?.dir_version);
  const contentPackageVersion = toStringValue(lookup?.content_package_version);
  const manifestHash = await computeManifestHash({
    manifestHash: toStringValue(lookup?.manifest_hash) || null,
    packId,
    dirVersion: dirVersion || null,
    contentPackageVersion: contentPackageVersion || null,
  });

  const landingTrackingProps = {
    slug: test.slug,
    locale,
    scale_code: test.scale_code || "BIG5_OCEAN",
    pack_version: contentPackageVersion || dirVersion || packId,
    manifest_hash: manifestHash,
    norms_version: toStringValue(lookup?.norms_version) || "unavailable",
    quality_level: toStringValue(lookup?.quality_level) || "unrated",
    locked: true,
    variant: "free",
    sku_id: "",
    ...(mbtiEntryViewTrackingProps ?? {}),
  };

  const cardSpec = resolveCardSpec({
    slug: test.slug,
    scale_code: test.scale_code,
    card_visual: test.card_visual,
    card_tone: test.card_tone,
    card_seed: test.card_seed,
    card_density: test.card_density,
  });
  const landingRating =
    typeof test.highlight_rating === "number" ? Math.max(0, Math.min(5, Math.round(test.highlight_rating))) : null;
  const detailLensCopy = getDetailPageLensCopy(test.scale_code, locale);
  const heroTitleDisplay = formatCardTitleForUi({
    title: localizedTestTitle,
    slug: test.slug,
    locale,
    surface: "tests_detail_hero",
  });
  const relatedPosts = listRelatedBlogPosts(test.slug, locale);
  const canonicalPath = localizedPath(`/tests/${test.slug}`, locale);
  const mbtiLandingContinuityItems = showsMbtiActions ? buildMbtiTestLandingContinuityItems(locale) : [];
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: toStringValue(lookup?.seo_title) || localizedTestTitle,
    description: toStringValue(lookup?.seo_description) || test.description,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "测评" : "Tests", path: locale === "zh" ? "/zh/tests" : "/en/tests" },
    { name: localizedTestTitle, path: canonicalPath },
  ]);
  const faqJsonLd = buildFAQPageJsonLd(
    mergedFaq.map((item) => ({
      question: item.q,
      answer: item.a,
    }))
  );

  return (
    <Container as="main" className="pb-[var(--fm-space-30)] pt-12 lg:pb-12">
      <JsonLd id={`test-webpage-${test.slug}`} data={webPageJsonLd} />
      <JsonLd id={`test-breadcrumb-${test.slug}`} data={breadcrumbJsonLd} />
      <JsonLd id={`test-faq-${test.slug}`} data={faqJsonLd} />
      <AnalyticsPageViewTracker eventName="landing_view" properties={landingTrackingProps} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section id="what-it-is" className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-gradient-to-br from-white via-white to-sky-50 p-6 shadow-[var(--fm-shadow-md)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
              {detailLensCopy.eyebrow}
            </p>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
              <div className="space-y-3">
                <h1 title={heroTitleDisplay.plain} className="font-serif text-3xl font-semibold tracking-tight text-[var(--fm-text)] md:text-4xl">
                  {heroTitleDisplay.multilineFallback ? (
                    <span className="inline-flex flex-col break-words">
                      <span>{heroTitleDisplay.line1}</span>
                      <span className="mt-1">{heroTitleDisplay.line2}</span>
                    </span>
                  ) : (
                    heroTitleDisplay.line1
                  )}
                </h1>
                {landingRating !== null ? (
                  <div className="flex items-center gap-1 text-[var(--fm-gold)]" aria-hidden>
                    {Array.from({ length: 5 }, (_, idx) => (
                      <span key={`landing-star-${idx}`} className={idx < landingRating ? "opacity-100" : "opacity-35"}>
                        ★
                      </span>
                    ))}
                  </div>
                ) : null}
                <p className="max-w-3xl text-[var(--fm-text-muted)]">{landingCopy || test.description}</p>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--fm-text-muted)]">
                  <span>
                    {showsMbtiActions
                      ? getMbtiQuestionSummary(locale)
                      : showsBig5Actions
                      ? getBig5QuestionSummary(locale)
                      : `${test.questions_count} ${locale === "zh" ? "题" : "questions"}`}
                  </span>
                  <span>•</span>
                  <span>
                    {showsMbtiActions
                      ? getMbtiDurationSummary(locale)
                      : showsBig5Actions
                      ? getBig5DurationSummary(locale)
                      : `${test.time_minutes} ${locale === "zh" ? "分钟" : "minutes"}`}
                  </span>
                  {test.scale_code ? (
                    <>
                      <span>•</span>
                      <span>{test.scale_code}</span>
                    </>
                  ) : null}
                </div>
              </div>
              <DataGlyph
                kind={cardSpec.visual}
                tone={cardSpec.tone}
                compact={cardSpec.density === "compact"}
                ariaLabel={dict.card.a11yVisualDescriptions[cardSpec.visual]}
                fallbackAriaLabel={dict.card.a11yVisualFallback}
                className="h-24 md:h-28"
              />
            </div>
            {testDisabled ? (
              <div className="pt-1">
                <span className={buttonVariants({ size: "lg", variant: "secondary" })}>
                  {locale === "zh" ? "维护中" : "Temporarily unavailable"}
                </span>
              </div>
            ) : showsMbtiActions ? (
              <div className="space-y-4 pt-2" data-testid="mbti-landing-entry-cta-group">
                <div className="rounded-[1.25rem] border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {locale === "zh" ? "主白名单页" : "Primary ad landing"}
                  </p>
                  <p className="m-0 mt-2 text-sm leading-7 text-slate-600">
                    {locale === "zh"
                      ? "先从深度版开始。快速版保留为次入口，只在你明确想要更轻量起步时使用。"
                      : "Start with the deep profile first. Quick Read remains available as a lighter secondary entry."}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3" data-testid="mbti-ads-primary-whitelist">
                  {mbtiPrimaryHref && mbtiPrimaryClickTrackingProps ? (
                    <TrackedEntryCtaLink
                      href={mbtiPrimaryHref}
                      prefetch
                      data-testid="mbti-landing-primary-cta"
                      eventProperties={mbtiPrimaryClickTrackingProps}
                      className={buttonVariants({ size: "lg" })}
                    >
                      {mbtiPrimaryChoice?.ctaLabel || (locale === "zh" ? "开始 MBTI 测试" : "Start MBTI test")}
                    </TrackedEntryCtaLink>
                  ) : (
                    <Link href={startTestHref} prefetch className={buttonVariants({ size: "lg" })} data-testid="mbti-landing-primary-cta">
                      {locale === "zh" ? "开始 MBTI 测试" : "Start MBTI test"}
                    </Link>
                  )}
                  {mbtiSecondaryHref && mbtiSecondaryClickTrackingProps ? (
                    <TrackedEntryCtaLink
                      href={mbtiSecondaryHref}
                      prefetch
                      data-testid="mbti-landing-secondary-cta"
                      eventProperties={mbtiSecondaryClickTrackingProps}
                      className={buttonVariants({ variant: "outline", size: "lg" })}
                    >
                      {mbtiSecondaryChoice?.ctaLabel || (locale === "zh" ? "开始快速版" : "Start Quick Read")}
                    </TrackedEntryCtaLink>
                  ) : null}
                </div>
                <p className="m-0 text-xs text-slate-500" data-testid="mbti-landing-cta-guidance">
                  {locale === "zh"
                    ? "广告冷流量默认优先进入主入口；次入口仅作为轻量备选。"
                    : "Cold traffic should default to the primary start path; the secondary entry stays as a lighter fallback."}
                </p>
              </div>
            ) : showsBig5Actions ? (
              <div className="space-y-4 pt-2">
                <FlagshipVariantChooser
                  title={locale === "zh" ? "选择更适合你的版本" : "Choose the version that fits best"}
                  subtitle={
                    locale === "zh"
                      ? "短版用于快速起步，长版用于更完整的人格或特质画像。"
                      : "Use the shorter version for a faster start, or the deeper version for a fuller profile."
                  }
                  choices={flagshipVariantChoices}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <Link href={backToTestsCta?.href || withLocale("/tests")} className={buttonVariants({ variant: "outline", size: "lg" })}>
                    {backToTestsCta?.label || (locale === "zh" ? "返回测评入口" : "Back to tests")}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link href={startTestHref} prefetch className={buttonVariants({ size: "lg" })}>
                  {locale === "zh" ? "开始测试" : "Start test"}
                </Link>
                <Link href={backToTestsCta?.href || withLocale("/tests")} className={buttonVariants({ variant: "outline", size: "lg" })}>
                  {backToTestsCta?.label || (locale === "zh" ? "返回测试列表" : "Back to tests")}
                </Link>
              </div>
            )}
          </section>

          {showsMbtiActions ? (
            <MbtiSceneEntrySection
              locale={locale}
              sourcePageType="test_landing"
              testId="mbti-test-landing-scene-entry"
            />
          ) : null}
          {showsMbtiActions && mbtiLandingContinuityItems.length > 0 ? (
            <section
              className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
              data-testid="mbti-landing-continuity-strip"
            >
              <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
                {locale === "zh" ? "开始前先看这四条路径" : "Four quick paths before you start"}
              </h2>
              <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">
                {locale === "zh"
                  ? "这是轻量回流区：帮助你在开始测试前先明确阅读路径，不替代主 CTA。"
                  : "This is a lightweight continuity strip. It clarifies reading paths before starting, without replacing the primary CTA."}
              </p>
              <div className="grid gap-3 md:grid-cols-4">
                {mbtiLandingContinuityItems.map((item) => (
                  <article
                    key={item.key}
                    className="space-y-2 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
                    data-testid={`mbti-landing-continuity-${item.key}`}
                  >
                    <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{item.title}</p>
                    <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{item.body}</p>
                    <Link href={item.href} className="fm-help-chip-link">
                      {locale === "zh" ? "继续查看" : "Continue"}
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}

          {rollout.paywallMode === "free_only" || !rollout.commerceEnabled ? (
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "当前开放模式" : "Current availability"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">
                {locale === "zh"
                  ? "当前仅开放免费报告预览，付费解锁暂未开放。"
                  : "Only the free report preview is available right now. Paid unlock is temporarily disabled."}
              </CardContent>
            </Card>
          ) : null}

          {maintenanceRequested ? (
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "当前维护中" : "Maintenance mode"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">
                {locale === "zh"
                  ? "该测评当前暂停开放，请稍后再试。"
                  : "This assessment is temporarily unavailable. Please try again later."}
              </CardContent>
            </Card>
          ) : null}

          <CiteableSection
            id="when-to-use"
            title={locale === "zh" ? "何时使用这份测评" : "When to use this assessment"}
            className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
          >
            <p className="m-0 text-sm text-slate-600">
              {detailLensCopy.whenToUseBody}
            </p>
          </CiteableSection>

          <Card id="how-it-works">
            <CardHeader>
              <CardTitle>{locale === "zh" ? "你将获得什么" : "What to expect"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>
                {locale === "zh"
                  ? isFlagshipDualVariant
                    ? "1. 先在短版与长版之间选一个更适合你的入口。"
                    : "1. 在一次完整会话中完成问卷。"
                  : isFlagshipDualVariant
                    ? "1. Choose the shorter or deeper version before you begin."
                    : "1. Complete the questionnaire in one focused sitting."}
              </p>
              <p>{locale === "zh" ? "2. 提交后立即查看结果摘要。" : "2. Submit answers and review the generated summary."}</p>
              <p>{locale === "zh" ? "3. 可按需解锁完整报告。" : "3. Optionally unlock the full report for deeper interpretation."}</p>
              <p>
                {locale === "zh"
                  ? "4. 免费版包含摘要与核心维度；完整版解锁刻面表、深度解读与行动建议。"
                  : "4. Free includes summary + core domains; full unlocks facet table, deep dive, and action plan."}
              </p>
            </CardContent>
          </Card>

          <Card data-testid="tests-related-articles-section">
            <CardHeader>
              <CardTitle>{dict.tests.relatedArticles.title}</CardTitle>
              <p className="m-0 text-sm text-slate-600">{dict.tests.relatedArticles.subtitle}</p>
            </CardHeader>
            <CardContent>
              {relatedPosts.length === 0 ? (
                <p className="m-0 text-sm text-slate-600">{dict.tests.relatedArticles.empty}</p>
              ) : (
                <ul className="space-y-3">
                  {relatedPosts.map((post) => (
                    <li key={post.slug} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4">
                      <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                        {dict.articles.voiceLabels[post.voice]}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">
                        <Link
                          href={withLocale(`/articles/${post.slug}`)}
                          data-testid={`tests-related-article-${post.slug}`}
                          className="hover:text-[var(--fm-accent)]"
                        >
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">{post.summary}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {!isFlagshipDualVariant && landingSurface?.ctaBundle.length ? (
            <Card data-testid="test-detail-landing-cta">
              <CardHeader>
                <CardTitle>{locale === "zh" ? "继续探索" : "Continue exploring"}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {landingSurface.ctaBundle.map((cta) => (
                  <Link key={cta.key} href={cta.href} className="fm-help-chip-link">
                    {cta.label}
                  </Link>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {!isFlagshipDualVariant && reportSummary ? (
            <Card>
              <CardHeader>
                <CardTitle>{locale === "zh" ? "报告摘要" : "Report summary"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">{reportSummary}</CardContent>
            </Card>
          ) : null}

          <section id="faq" className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">FAQ</h2>
            <FAQAccordion items={mergedFaq} />
          </section>

          {showsBig5Actions ? (
            <section className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
              <div className="space-y-5">
                <div className="space-y-2">
                  <h2 className="m-0 text-2xl font-bold tracking-tight text-slate-900">
                    {locale === "zh" ? "准备开始？再选一次版本。" : "Ready to begin? Choose the version once more."}
                  </h2>
                  <p className="m-0 text-sm leading-7 text-slate-600">
                    {locale === "zh"
                      ? "短版适合快速起步，长版适合想要更完整画像的人。"
                      : "The shorter version is for a faster start. The deeper version is for a fuller profile."}
                  </p>
                </div>
                <FlagshipVariantChooser
                  title={locale === "zh" ? "版本选择" : "Version chooser"}
                  subtitle={
                    locale === "zh"
                      ? "如果你已经看完介绍和 FAQ，这里直接进入更适合的版本。"
                      : "If you have reviewed the page and FAQ, start from the version that fits you best."
                  }
                  choices={flagshipVariantChoices}
                />
                <div className="flex flex-wrap gap-2">
                  <Link href={withLocale("/tests/category/personality")} className="fm-help-chip-link">
                    {locale === "zh" ? "返回人格与风格入口" : "Back to personality hub"}
                  </Link>
                  {continuePublicContentCta ? (
                    <Link href={continuePublicContentCta.href} className="fm-help-chip-link">
                      {continuePublicContentCta.label}
                    </Link>
                  ) : null}
                </div>
              </div>
            </section>
          ) : null}

          {disclaimer ? (
            <Card id="limitations">
              <CardHeader>
                <CardTitle>{locale === "zh" ? "免责声明" : "Disclaimer"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">{disclaimer}</CardContent>
            </Card>
          ) : null}

          {!isFlagshipDualVariant ? (
            <Card id="references">
              <CardHeader>
                <CardTitle>{locale === "zh" ? "参考与说明" : "References and Notes"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">
                {locale === "zh"
                  ? "请结合测评正文、FAQ 与专业建议综合解读结果。若你正在接受治疗或咨询，请以专业意见为准。"
                  : "Interpret the result with the page content, FAQ, and qualified professional guidance. If you are already in treatment, follow your clinician’s advice."}
              </CardContent>
            </Card>
          ) : null}
          {!isFlagshipDualVariant && continuePublicContentCta ? (
            <Link href={continuePublicContentCta.href} className="fm-help-chip-link">
              {continuePublicContentCta.label}
            </Link>
          ) : null}
        </div>

        <aside>
          <CTASticky
            slug={test.slug}
            title={localizedTestTitle}
            questions={test.questions_count}
            minutes={test.time_minutes}
            scaleCode={test.scale_code}
            locale={locale}
          />
        </aside>
      </div>
    </Container>
  );
}
