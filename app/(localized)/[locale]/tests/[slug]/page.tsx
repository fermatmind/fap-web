import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { DataGlyph } from "@/components/assessment-cards/DataGlyph";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { CTASticky } from "@/components/business/CTASticky";
import {
  isMentalHealthScreeningTest,
  MentalHealthDisclaimer,
} from "@/components/compliance/MentalHealthDisclaimer";
import { FAQAccordion, type FAQItem } from "@/components/business/FAQAccordion";
import { MbtiSceneEntrySection } from "@/components/content/MbtiSceneEntrySection";
import { CiteableSection } from "@/components/seo/CiteableSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { MbtiLandingSurfaceSections } from "@/components/tests/MbtiLandingSurfaceSections";
import { RiasecLandingSurfaceSections } from "@/components/tests/RiasecLandingSurfaceSections";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import { SCALE_CANONICAL_SLUG_MAP, resolveCanonicalSlug } from "@/lib/assessmentSlugMap";
import { computeManifestHash } from "@/lib/big5/manifest";
import { getCmsArticlesWithLastKnownGood, type CmsArticle } from "@/lib/cms/articles";
import {
  getCmsLandingSurfaceWithLastKnownGood,
  type CmsLandingSurface,
} from "@/lib/cms/landing-surfaces";
import {
  getAllTests,
  getTestBySlug,
  getTestLookup,
  resolveTestTitleByLocale,
} from "@/lib/content";
import { resolveCardSpec } from "@/lib/design/card-resolver";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import {
  buildBig5TakeHref,
  DEFAULT_BIG5_FORM_CODE,
  getBig5DurationSummary,
  getBig5QuestionSummary,
  getBig5StartLabel,
  getBig5VariantLabel,
  getBig5VariantSummary,
  isBig5ScaleCode,
  listBig5FormMetas,
} from "@/lib/big5/forms";
import {
  buildEnneagramTakeHref,
  DEFAULT_ENNEAGRAM_FORM_CODE,
  getEnneagramStartLabel,
  getEnneagramVariantLabel,
  getEnneagramVariantSummary,
  isEnneagramScaleCode,
  listEnneagramFormMetas,
} from "@/lib/enneagram/forms";
import {
  buildRiasecTakeHref,
  DEFAULT_RIASEC_FORM_CODE,
  getRiasecDurationSummary,
  getRiasecQuestionSummary,
  getRiasecStartLabel,
  getRiasecVariantLabel,
  getRiasecVariantSummary,
  isRiasecScaleCode,
  listRiasecFormMetas,
} from "@/lib/riasec/forms";
import {
  DEFAULT_MBTI_FORM_CODE,
  buildMbtiTakeHref,
  getMbtiDurationSummary,
  getMbtiStartLabel,
  getMbtiVariantLabel,
  getMbtiVariantSummary,
  isMbtiScaleCode,
  listMbtiFormMetas,
} from "@/lib/mbti/forms";
import { getIqBankLandingChoices, type IqBankLandingChoice } from "@/lib/iq/bankDisplay";
import { isIqScaleCode } from "@/lib/iq/constants";
import { buildMbtiEntryHref, buildMbtiEntryTrackingPayload } from "@/lib/mbti/entryTracking";
import { buildMbtiTestLandingContinuityItems } from "@/lib/mbti/sceneDeepContent";
import {
  appendAttributionParamsToHref,
  buildTrackingAttributionPayload,
  extractAttributionParamsFromRecord,
} from "@/lib/tracking/attribution";
import {
  appendSeoCtaContextParamsToHref,
  buildSeoCtaTrackingPayload,
  extractSeoCtaContextParamsFromRecord,
} from "@/lib/tracking/seoCtaAttribution";
import {
  createScaleRolloutEnvSnapshot,
  hasFreeFullReportCommercialAuthority,
  resolveScaleRollout,
  type SupportedScaleCode,
} from "@/lib/rollout/scaleRollout";
import { findLandingCta, normalizeLandingSurface } from "@/lib/landing/landingSurface";
import { getFreeTestStartLabel } from "@/lib/tests/freeTestLabels";
import { isRetryablePublicReadError } from "@/lib/public-content/readError";
import {
  buildBreadcrumbJsonLd,
  buildFAQPageJsonLd,
  buildTestSoftwareAppJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { isClinicalDepressionPendingSlug } from "@/lib/seo/seoHoldlistRoutes";
import {
  hasUnsafeIqLaunchClaim,
  resolveIqLaunchSeoGuard,
  resolveTestDetailAuthority,
} from "@/lib/seo/testDetailAuthority";
import { getIqSeoRampAuthorityForLocale } from "@/lib/seo/iqSeoRampAuthority";
import { formatCardTitleForUi } from "@/lib/ui/testTitleDisplay";

type TestDetailCmsLandingSurfacePayload = {
  seo_title?: string | null;
  seo_description?: string | null;
  h1_or_hero_title?: string | null;
  hero_copy?: string | null;
  primary_cta_label?: string | null;
  aeo_answer_block?: string | null;
  methodology_boundary_note?: string | null;
  approved_internal_link_targets?: unknown;
  claim_risk_notes?: unknown;
};

const TEST_DETAIL_CMS_LANDING_SURFACE_KEYS: Partial<Record<string, string>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: "test_detail_mbti_personality_test_16_personality_types",
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: "test_detail_holland_career_interest_test_riasec",
};

async function fetchRelatedArticles(testSlug: string, locale: "en" | "zh"): Promise<CmsArticle[]> {
  try {
    const { items } = await getCmsArticlesWithLastKnownGood({
      locale,
      page: 1,
      perPage: 3,
      relatedTestSlug: testSlug,
      allowLocalFallback: false,
    }).then((result) => result.value);

    return items;
  } catch {
    return [];
  }
}

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

function parseStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => toStringValue(item))
    .filter((item) => item.length > 0);
}

function uniqueVisibleFeatureList(items: string[]): string[] {
  return [...new Set(items.map((item) => item.trim()).filter(Boolean))];
}

function hasBlockedSoftwareApplicationClaim(value: string): boolean {
  const normalized = value.toLowerCase();

  return [
    ["precise career", "recommendation"].join(" "),
    ["best-career", "recommendation"].join(" "),
    ["best", "career"].join(" "),
    ["career", "matcher"].join(" "),
    ["career", "recommender"].join(" "),
    "guaranteed career",
    "career success",
    "diagnosis",
    "diagnostic",
    "medical diagnosis",
    "hiring suitability",
    "employment suitability",
    ["精准", "推荐"].join(""),
    ["精准", "职业推荐"].join(""),
    ["最", "适合职业"].join(""),
    ["精准", "匹配职业"].join(""),
    "职业成功",
    "诊断",
    "录用",
  ].some((phrase) => normalized.includes(phrase));
}

function isSoftwareApplicationSchemaScaleEligible({
  slug,
  scaleCode,
}: {
  slug: string;
  scaleCode?: string | null;
}): boolean {
  if (isMentalHealthScreeningTest({ slug, scaleCode })) {
    return false;
  }

  const normalizedScaleCode = String(scaleCode ?? "").trim().toUpperCase();
  if (normalizedScaleCode === "IQ_RAVEN" || slug === SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN) {
    return false;
  }

  return [
    "MBTI",
    "BIG5_OCEAN",
    "ENNEAGRAM",
    "RIASEC",
  ].includes(normalizedScaleCode);
}

async function getTestDetailCmsLandingSurface(
  slug: string,
  locale: "en" | "zh"
): Promise<CmsLandingSurface<TestDetailCmsLandingSurfacePayload> | null> {
  const surfaceKey = TEST_DETAIL_CMS_LANDING_SURFACE_KEYS[slug];
  if (!surfaceKey) {
    return null;
  }

  try {
    const surface = await getCmsLandingSurfaceWithLastKnownGood<TestDetailCmsLandingSurfacePayload>(surfaceKey, locale);
    return surface.value;
  } catch {
    return null;
  }
}

function resolveTestDetailCmsLandingSurfaceContent(
  surface: CmsLandingSurface<TestDetailCmsLandingSurfacePayload> | null
) {
  const payload = surface?.payloadJson;

  return {
    seoTitle: toStringValue(payload?.seo_title) || toStringValue(surface?.title),
    seoDescription: toStringValue(payload?.seo_description) || toStringValue(surface?.description),
    heroTitle: toStringValue(payload?.h1_or_hero_title),
    heroCopy: toStringValue(payload?.hero_copy),
    primaryCtaLabel: toStringValue(payload?.primary_cta_label),
    methodologyBoundaryNote: toStringValue(payload?.methodology_boundary_note),
  };
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

function buildFlagshipVariantFaq(kind: "mbti" | "big5" | "enneagram" | "riasec", locale: "en" | "zh"): FAQItem[] {
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

    if (kind === "enneagram") {
      return [
        {
          q: "九型人格 105 题和 144 题有什么区别？",
          a: "105 题是五点量表自评版，适合标准入口；144 题是二选一迫选版，每题在两个描述中选择更贴近自己的一个，更适合正式发布场景下的稳定比较。",
        },
        {
          q: "我应该先做哪一个版本？",
          a: "如果你想用更直接的自评方式开始，先做 105 题；如果你希望减少“都像我”的犹豫，选择 144 题二选一版。",
        },
        {
          q: "两个版本会给出不同类型体系吗？",
          a: "不会。两个版本属于同一个九型人格测评，只是答题方式不同，结果页会保留你选择的版本。",
        },
        {
          q: "重新测试会保留当前版本吗？",
          a: "会。结果页重新测试会回到同一个版本，不会把 144 题自动切回 105 题。",
        },
      ];
    }

    if (kind === "riasec") {
      return [
        {
          q: "RIASEC 60 题和 140 题有什么区别？",
          a: "60 题是默认公开标准版，用于快速建立六维职业兴趣轮廓；140 题是增强版，会进一步区分活动、环境与角色偏好。",
        },
        {
          q: "我应该先做哪一个版本？",
          a: "如果你想先快速了解职业兴趣结构，先做 60 题；如果你希望更完整地比较职业偏好层次，选择 140 题增强版。",
        },
        {
          q: "两个版本属于同一个测评吗？",
          a: "是。两个版本都属于同一个霍兰德 RIASEC 职业兴趣测试，结果会保留你选择的版本。",
        },
        {
          q: "结果能直接替我决定职业吗？",
          a: "不能。结果用于辅助职业探索和讨论，不替代真实经历、能力评估或专业咨询。",
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

  if (kind === "enneagram") {
    return [
      {
        q: "What is the difference between Enneagram 105Q and 144Q?",
        a: "105Q is the five-point self-report form. 144Q is the forced-choice pair form, where each item asks you to choose the closer statement.",
      },
      {
        q: "Which version should I start with?",
        a: "Start with 105Q if you want the standard rating-scale path. Choose 144Q if you prefer a forced-choice format that avoids rating both statements as equally true.",
      },
      {
        q: "Do both versions use the same Enneagram scale?",
        a: "Yes. They are two forms under the same Enneagram assessment, and the result keeps the form you selected.",
      },
      {
        q: "Will retaking preserve the current form?",
        a: "Yes. Retake from the result page returns to the same form instead of silently switching 144Q back to 105Q.",
      },
    ];
  }

  if (kind === "riasec") {
    return [
      {
        q: "What is the difference between RIASEC 60Q and 140Q?",
        a: "60Q is the default public standard form for a focused six-dimension interest profile. 140Q adds activity, environment, and role preference layers.",
      },
      {
        q: "Which version should I start with?",
        a: "Start with 60Q if you want a focused career-interest read. Choose 140Q if you want a fuller comparison across preference layers.",
      },
      {
        q: "Do both versions belong to the same assessment?",
        a: "Yes. Both forms belong to the same Holland RIASEC career interest test, and the result preserves the form you selected.",
      },
      {
        q: "Can the result choose a career for me?",
        a: "No. The result supports career exploration and discussion. It does not replace experience, skill assessment, or professional guidance.",
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
    case "ENNEAGRAM":
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
  eventProperties?: Record<string, string>;
};

type IqBankLandingChoiceWithTracking = IqBankLandingChoice & {
  eventProperties?: Record<string, string>;
};

type FlagshipFreeTestCopy = {
  h1: string;
  seoTitle: string;
  primaryCtaLabel: string;
  secondaryCtaLabelByFormCode: Record<string, string>;
  freeBoundary: string;
};

function getFlagshipFreeTestCopy(scaleCode: string | null | undefined, locale: "en" | "zh"): FlagshipFreeTestCopy | null {
  if (locale !== "zh") return null;

  const freeBoundary = "可免费开始，基础结果免费；高级报告如有付费需提前说明。";

  switch (String(scaleCode ?? "").trim().toUpperCase()) {
    case "MBTI":
      return {
        h1: "MBTI免费测试",
        seoTitle: "MBTI免费测试｜16型人格测试",
        primaryCtaLabel: "开始 MBTI 免费测试",
        secondaryCtaLabelByFormCode: {
          mbti_93: "开始 MBTI 快速版免费测试",
        },
        freeBoundary,
      };
    case "BIG5_OCEAN":
      return {
        h1: "大五人格免费测试",
        seoTitle: "大五人格免费测试｜Big Five人格测试",
        primaryCtaLabel: "开始大五人格免费测试",
        secondaryCtaLabelByFormCode: {
          big5_90: "开始大五人格快速版免费测试",
        },
        freeBoundary,
      };
    case "ENNEAGRAM":
      return {
        h1: "九型人格免费测试",
        seoTitle: "九型人格免费测试｜九型人格测试",
        primaryCtaLabel: "开始九型人格免费测试",
        secondaryCtaLabelByFormCode: {
          enneagram_forced_choice_144: "开始九型人格二选一版免费测试",
        },
        freeBoundary,
      };
    case "RIASEC":
      return {
        h1: "霍兰德职业兴趣免费测试",
        seoTitle: "霍兰德职业兴趣免费测试｜RIASEC职业测试",
        primaryCtaLabel: "开始霍兰德职业兴趣免费测试",
        secondaryCtaLabelByFormCode: {
          riasec_140: "开始霍兰德职业兴趣增强版免费测试",
        },
        freeBoundary,
      };
    default:
      return null;
  }
}

function getFlagshipFreeTestCtaLabel({
  scaleCode,
  formCode,
  locale,
  fallback,
  primaryCtaLabelOverride,
}: {
  scaleCode: string | null | undefined;
  formCode: string;
  locale: "en" | "zh";
  fallback: string;
  primaryCtaLabelOverride?: string | null;
}): string {
  const defaultFormByScaleCode: Record<string, string> = {
    MBTI: DEFAULT_MBTI_FORM_CODE,
    BIG5_OCEAN: DEFAULT_BIG5_FORM_CODE,
    ENNEAGRAM: DEFAULT_ENNEAGRAM_FORM_CODE,
    RIASEC: DEFAULT_RIASEC_FORM_CODE,
  };
  const normalizedScaleCode = String(scaleCode ?? "").trim().toUpperCase();
  if (formCode === defaultFormByScaleCode[normalizedScaleCode]) {
    const override = toStringValue(primaryCtaLabelOverride);
    if (override) {
      return override;
    }
  }

  const copy = getFlagshipFreeTestCopy(scaleCode, locale);
  if (!copy) return fallback;

  if (formCode === defaultFormByScaleCode[normalizedScaleCode]) {
    return copy.primaryCtaLabel;
  }

  return copy.secondaryCtaLabelByFormCode[formCode] ?? fallback;
}

function FlagshipVariantChooser({
  title,
  subtitle,
  choices,
}: {
  title?: string;
  subtitle?: string;
  choices: FlagshipVariantChoice[];
}) {
  const gridClassName = choices.length === 1 ? "grid gap-3" : "grid gap-3 md:grid-cols-2";

  return (
    <section className="rounded-[1.7rem] border border-[var(--fm-border)] bg-[rgba(248,250,252,0.92)] p-4 shadow-[var(--fm-shadow-sm)] md:p-5">
      {title || subtitle ? (
        <div className="space-y-2">
          {title ? <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.03em] text-slate-950">{title}</h2> : null}
          {subtitle ? <p className="m-0 max-w-[42rem] text-sm leading-7 text-slate-600">{subtitle}</p> : null}
        </div>
      ) : null}

      <div className={`${title || subtitle ? "mt-5" : ""} ${gridClassName}`}>
        {choices.map((choice) => (
          <article key={choice.key} className="flex h-full flex-col rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-[0_16px_44px_rgba(15,23,42,0.05)]">
            <div className="space-y-2">
              <h3 className="m-0 text-[1rem] font-semibold tracking-[-0.02em] text-slate-950">{choice.label}</h3>
              <p className="m-0 text-sm leading-7 text-slate-600">{choice.summary}</p>
            </div>
            {choice.eventProperties ? (
              choice.testId === "mbti-landing-primary-cta" ? (
                <TrackedEntryCtaLink
                  href={choice.href}
                  prefetch={false}
                  data-testid="mbti-landing-primary-cta"
                  eventProperties={choice.eventProperties}
                  className={buttonVariants({ size: "sm", className: "mt-auto w-full justify-center" })}
                >
                  {choice.ctaLabel}
                </TrackedEntryCtaLink>
              ) : choice.testId === "mbti-landing-secondary-cta" ? (
                <TrackedEntryCtaLink
                  href={choice.href}
                  prefetch={false}
                  data-testid="mbti-landing-secondary-cta"
                  eventProperties={choice.eventProperties}
                  className={buttonVariants({ size: "sm", className: "mt-auto w-full justify-center" })}
                >
                  {choice.ctaLabel}
                </TrackedEntryCtaLink>
              ) : (
                <TrackedEntryCtaLink
                  href={choice.href}
                  prefetch={false}
                  data-testid={choice.testId}
                  eventProperties={choice.eventProperties}
                  className={buttonVariants({ size: "sm", className: "mt-auto w-full justify-center" })}
                >
                  {choice.ctaLabel}
                </TrackedEntryCtaLink>
              )
            ) : (
              <Link
                href={choice.href}
                prefetch={false}
                data-testid={choice.testId}
                className={buttonVariants({ size: "sm", className: "mt-auto w-full justify-center" })}
              >
                {choice.ctaLabel}
              </Link>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function IqBankLandingChooser({
  locale,
  choices,
}: {
  locale: "en" | "zh";
  choices: IqBankLandingChoiceWithTracking[];
}) {
  return (
    <section
      className="rounded-[1.7rem] border border-[var(--fm-border)] bg-[rgba(248,250,252,0.92)] p-4 shadow-[var(--fm-shadow-sm)] md:p-5"
      data-testid="iq-bank-landing-chooser"
    >
      <div className="space-y-2">
        <h2 className="m-0 text-[1.15rem] font-semibold tracking-[-0.03em] text-slate-950">
          {locale === "zh" ? "选择 IQ 测试" : "Choose an IQ test"}
        </h2>
        <p className="m-0 max-w-[42rem] text-sm leading-7 text-slate-600">
          {locale === "zh"
            ? "当前只开放 FermatMind 原创 30 题 IQ 测评，题库交由后端私有评分。"
            : "The FermatMind owner-original 30-item IQ assessment is available now with private backend scoring."}
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {choices.map((choice) => (
          <article
            key={choice.key}
            className="flex h-full flex-col rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-[0_16px_44px_rgba(15,23,42,0.05)]"
            data-testid={`iq-bank-card-${choice.key}`}
          >
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="m-0 text-[1rem] font-semibold tracking-[-0.02em] text-slate-950">{choice.label}</h3>
                <span
                  className="rounded-full border border-[var(--fm-border)] px-2.5 py-1 text-xs font-semibold text-slate-600"
                  data-testid={`iq-bank-status-${choice.key}`}
                >
                  {choice.statusLabel}
                </span>
              </div>
              <p className="m-0 text-sm leading-7 text-slate-600">{choice.description}</p>
            </div>

            {choice.href && choice.eventProperties ? (
              <TrackedEntryCtaLink
                href={choice.href}
                prefetch={false}
                data-testid={choice.testId}
                eventProperties={choice.eventProperties}
                className={buttonVariants({ size: "sm", className: "mt-auto w-full justify-center" })}
              >
                {choice.ctaLabel}
              </TrackedEntryCtaLink>
            ) : (
              <span
                aria-disabled="true"
                data-testid={choice.testId}
                className={buttonVariants({ size: "sm", variant: "secondary", className: "mt-auto w-full justify-center cursor-not-allowed opacity-70" })}
              >
                {choice.ctaLabel}
              </span>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export async function generateStaticParams() {
  try {
    const tests = await getAllTests("en");
    return tests.flatMap((test) => [{ locale: "en", slug: test.slug }, { locale: "zh", slug: test.slug }]);
  } catch (error) {
    if (isRetryablePublicReadError(error)) {
      return [];
    }

    throw error;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug: requestedSlug } = await params;
  const slug = resolveCanonicalSlug(requestedSlug);
  const locale = resolveLocale(localeParam);
  const test = await getTestBySlug(slug, locale);

  if (!test) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }

  const [lookup, cmsLandingSurface] = await Promise.all([
    getTestLookup(slug, locale),
    getTestDetailCmsLandingSurface(slug, locale),
  ]);
  if (!lookup) {
    return {
      title: "Not Found",
      robots: { index: false, follow: false },
    };
  }
  const alternates = alternatesForSlug(test.slug);
  const canonical = localizedPath(`/tests/${test.slug}`, locale);
  const localizedTestTitle = resolveTestTitleByLocale(test, locale);
  const cmsLandingSurfaceContent = resolveTestDetailCmsLandingSurfaceContent(cmsLandingSurface);
  const seoTitle = toStringValue(lookup?.seo_title);
  const seoDescription = toStringValue(lookup?.seo_description);
  const ogImageAuthority = toStringValue(lookup?.og_image_url);
  const flagshipFreeTestCopy = getFlagshipFreeTestCopy(test.scale_code, locale);
  const iqSeoRampAuthority = await getIqSeoRampAuthorityForLocale(locale);
  const isClinicalDepressionPending = isClinicalDepressionPendingSlug(test.slug);
  const metadataAuthority = resolveTestDetailAuthority({
    slug: test.slug,
    hasSeoTitle: cmsLandingSurfaceContent.seoTitle.length > 0 || seoTitle.length > 0,
    hasSeoDescription: cmsLandingSurfaceContent.seoDescription.length > 0 || seoDescription.length > 0,
    hasOgImage: ogImageAuthority.length > 0,
    hasVisibleFaq: false,
    hasLandingSurface: false,
    hasStartTestTarget: false,
    hasCtaBundle: false,
  });

  const title =
    cmsLandingSurfaceContent.seoTitle
    || seoTitle
    || flagshipFreeTestCopy?.seoTitle
    || (metadataAuthority.metadata.allowed ? localizedTestTitle : test.slug);
  const description =
    cmsLandingSurfaceContent.seoDescription
    || seoDescription
    || (metadataAuthority.metadata.allowed ? test.description : "");
  const ogImage = ogImageAuthority || (metadataAuthority.metadata.allowed ? test.cover_image : "");
  const iqLaunchSeoGuard = resolveIqLaunchSeoGuard({
    slug: test.slug,
    scaleCode: test.scale_code,
    hasSeoTitle: seoTitle.length > 0,
    hasSeoDescription: seoDescription.length > 0,
    title,
    description,
    seoRampAuthority: iqSeoRampAuthority,
  });
  const forcedNoindex =
    isClinicalDepressionPending
    || lookup?.is_indexable === false
    || metadataAuthority.shouldNoindexMissingMetadataAuthority
    || iqLaunchSeoGuard.shouldNoindex;

  return buildPageMetadata({
    locale,
    pathname: canonical,
    canonicalPathname: canonical,
    canonicalRouteFamily: "test_detail",
    title,
    description,
    imagePath: ogImage,
    noindex: forcedNoindex,
    noindexFollow: isClinicalDepressionPending,
    omitLanguageAlternates: isClinicalDepressionPending,
    alternatesByLocale: {
      en: alternates.en,
      zh: alternates.zh,
      xDefault: alternates["x-default"],
    },
  });
}

export default async function TestLandingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: localeParam, slug: requestedSlug } = await params;
  const query = await searchParams;

  const locale = resolveLocale(localeParam);
  const slug = resolveCanonicalSlug(requestedSlug);
  const withLocale = (path: string) => localizedPath(path, locale);
  if (slug !== requestedSlug) {
    permanentRedirect(appendQuery(withLocale(`/tests/${slug}`), query));
  }

  const test = await getTestBySlug(slug, locale);
  if (!test) return notFound();

  const dict = getDictSync(locale);
  const [lookup, cmsLandingSurface] = await Promise.all([
    getTestLookup(slug, locale),
    getTestDetailCmsLandingSurface(slug, locale),
  ]);
  if (!lookup) return notFound();
  const cmsLandingSurfaceContent = resolveTestDetailCmsLandingSurfaceContent(cmsLandingSurface);
  const landingSurface = normalizeLandingSurface(lookup?.landing_surface_v1 ?? null);
  const localizedTestTitle = resolveTestTitleByLocale(test, locale);
  const langNode = toRecord(toRecord(lookup?.content_i18n_json)[locale]);
  const reportNode = toRecord(toRecord(lookup?.report_summary_i18n_json)[locale]);
  const landingCopy = toStringValue(langNode.landing_copy);
  const flagshipFreeTestCopy = getFlagshipFreeTestCopy(test.scale_code, locale);
  const whenToUse = toStringValue(langNode.when_to_use);
  const audienceItems = parseStringList(langNode.audience);
  const howItWorksItems = parseStringList(langNode.how_it_works);
  const disclaimer =
    cmsLandingSurfaceContent.methodologyBoundaryNote
    || toStringValue(langNode.disclaimer)
    || flagshipFreeTestCopy?.freeBoundary
    || "";
  const reportSummary = toStringValue(reportNode.summary);
  const faqItems = parseFaq(langNode.faq);
  const rollout = resolveScaleRollout({
    scaleCode: test.scale_code as SupportedScaleCode | undefined,
    capabilities: lookup?.capabilities,
    // This route is statically generated. Request-scoped headers would force a
    // dynamic render at serve time and make the prebuilt core entry fail.
    // The take route performs the request-specific rollout check before use.
    identitySeed: null,
    envSnapshot: createScaleRolloutEnvSnapshot(),
  });
  const hasFreeFullReportAuthority = hasFreeFullReportCommercialAuthority(lookup);
  const testDisabled = !rollout.assessmentEnabled;
  const maintenanceRequested = ["1", "true", "yes"].includes(firstQueryValue(query.maintenance).toLowerCase());
  const landingAttributionParams = extractAttributionParamsFromRecord(query);
  const landingSeoCtaContextParams = extractSeoCtaContextParamsFromRecord(query);
  const landingBasePath = withLocale(`/tests/${test.slug}`);
  const landingPath = appendAttributionParamsToHref(landingBasePath, landingAttributionParams);
  const landingAttributionPayload = buildTrackingAttributionPayload(landingAttributionParams, {
    landingPath,
    currentPath: landingPath,
  });
  const withAttribution = (href: string) =>
    appendSeoCtaContextParamsToHref(
      appendAttributionParamsToHref(href, landingAttributionParams),
      landingSeoCtaContextParams
    );
  const buildStartClickTrackingProps = ({
    formCode,
    targetAction,
  }: {
    formCode?: string;
    targetAction: string;
  }): Record<string, string> => buildSeoCtaTrackingPayload({
    locale,
    sourceRouteFamily: "test_detail",
    sourceSlug: test.slug,
    sourcePath: landingPath,
    href: withLocale(`/tests/${test.slug}/take`),
    ctaId: targetAction,
    targetAction,
    targetTestSlug: test.slug,
    formCode,
    scaleCode: test.scale_code,
    attributionPayload: landingAttributionPayload,
  });
  const testDetailAuthority = resolveTestDetailAuthority({
    slug: test.slug,
    hasSeoTitle: toStringValue(lookup?.seo_title).length > 0,
    hasSeoDescription: toStringValue(lookup?.seo_description).length > 0,
    hasOgImage: toStringValue(lookup?.og_image_url).length > 0,
    hasVisibleFaq: faqItems.length > 0,
    hasLandingSurface: landingSurface !== null,
    hasStartTestTarget: Boolean(landingSurface?.startTestTarget),
    hasCtaBundle: Boolean(landingSurface?.ctaBundle.length),
  });
  const startTestHref = withAttribution(
    landingSurface?.startTestTarget || (testDetailAuthority.cta.allowed ? withLocale(`/tests/${test.slug}/take`) : landingBasePath)
  );
  const canRenderStartCta = testDetailAuthority.cta.allowed || Boolean(landingSurface?.startTestTarget);
  const showsMbtiActions = isMbtiScaleCode(test.scale_code);
  const showsBig5Actions = isBig5ScaleCode(test.scale_code);
  const showsEnneagramActions = isEnneagramScaleCode(test.scale_code);
  const showsRiasecActions = isRiasecScaleCode(test.scale_code);
  const showsEqActions = String(test.scale_code ?? "").trim().toUpperCase() === "EQ_60" || test.slug === SCALE_CANONICAL_SLUG_MAP.EQ_60;
  const showsIqActions = isIqScaleCode(test.scale_code) || test.slug === SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN;
  const isSelfUnderstanding = showsMbtiActions || showsBig5Actions || showsEnneagramActions;
  const domainRole = showsMbtiActions ? "primary" : showsBig5Actions ? "primary" : showsEnneagramActions ? "supporting" : null;
  const questionSummary = showsMbtiActions
    ? locale === "zh" ? "93题/144题" : "93Q/144Q"
    : showsBig5Actions
    ? getBig5QuestionSummary(locale)
    : showsEnneagramActions
    ? locale === "zh" ? "144题/105题" : "144Q/105Q"
    : showsRiasecActions
    ? getRiasecQuestionSummary(locale)
    : showsIqActions
    ? locale === "zh" ? "30题" : "30Q"
    : `${test.questions_count} ${locale === "zh" ? "题" : "questions"}`;
  const durationSummary = showsMbtiActions
    ? getMbtiDurationSummary(locale)
    : showsBig5Actions
    ? getBig5DurationSummary(locale)
    : showsRiasecActions
    ? getRiasecDurationSummary(locale)
    : `${test.time_minutes} ${locale === "zh" ? "分钟" : "minutes"}`;
  const showsMentalHealthDisclaimer = isMentalHealthScreeningTest({
    slug: test.slug,
    scaleCode: test.scale_code,
  });
  const showsDepressionVersionActions = [
    "clinical-depression-anxiety-assessment-professional-edition",
    "depression-screening-test-standard-edition",
  ].includes(test.slug);
  const isFlagshipDualVariant = showsMbtiActions || showsBig5Actions || showsEnneagramActions || showsRiasecActions;
  const defaultHowItWorksItems = hasFreeFullReportAuthority
    ? [
        locale === "zh"
          ? isFlagshipDualVariant
            ? "先在短版与长版之间选一个更适合你的入口。"
            : "在一次完整会话中完成问卷。"
          : isFlagshipDualVariant
            ? "Choose the shorter or deeper version before you begin."
            : "Complete the questionnaire in one focused sitting.",
        locale === "zh" ? "提交后可查看完整结果报告。" : "Submit answers and review the full result report.",
        locale === "zh"
          ? "结果用于理解与探索，不作保证性结论。"
          : "Use the result for reflection and exploration, not as a guarantee.",
      ]
    : [
        locale === "zh"
          ? isFlagshipDualVariant
            ? "先在短版与长版之间选一个更适合你的入口。"
            : "在一次完整会话中完成问卷。"
          : isFlagshipDualVariant
            ? "Choose the shorter or deeper version before you begin."
            : "Complete the questionnaire in one focused sitting.",
        locale === "zh" ? "提交后立即查看结果摘要。" : "Submit answers and review the generated summary.",
        locale === "zh" ? "可按需解锁完整报告。" : "Optionally unlock the full report for deeper interpretation.",
        locale === "zh"
          ? "免费版包含摘要与核心维度；完整版解锁刻面表、深度解读与行动建议。"
          : "Free includes summary and core domains; full unlocks facet table, deep dive, and action plan.",
      ];
  const mergedFaq = faqItems.length > 0
    ? faqItems
    : testDetailAuthority.faq.allowed
      ? isFlagshipDualVariant
        ? buildFlagshipVariantFaq(
            showsMbtiActions ? "mbti" : showsBig5Actions ? "big5" : showsEnneagramActions ? "enneagram" : "riasec",
            locale
          )
        : buildFallbackFaq(localizedTestTitle, test.time_minutes, test.questions_count, locale)
      : [];
  const continuePublicContentCta = findLandingCta(landingSurface, "continue_public_content");
  const cmsPrimaryCtaLabel = cmsLandingSurfaceContent.primaryCtaLabel;
  const flagshipVariantChoices: FlagshipVariantChoice[] = showsMbtiActions
    ? listMbtiFormMetas().map((form) => ({
        key: form.formCode,
        label: getMbtiVariantLabel(form.formCode, locale),
        summary: getMbtiVariantSummary(form.formCode, locale),
        href: withAttribution(buildMbtiTakeHref(test.slug, locale, form.formCode)),
        ctaLabel: getFlagshipFreeTestCtaLabel({
          scaleCode: test.scale_code,
          formCode: form.formCode,
          locale,
          fallback: getMbtiStartLabel(form.formCode, locale),
          primaryCtaLabelOverride: cmsPrimaryCtaLabel,
        }),
        testId: `test-detail-landing-cta-${form.formCode}`,
        eventProperties: buildStartClickTrackingProps({
          formCode: form.formCode,
          targetAction: `start_${form.formCode}`,
        }),
      }))
    : showsBig5Actions
      ? listBig5FormMetas().map((form) => ({
          key: form.formCode,
          label: getBig5VariantLabel(form.formCode, locale),
          summary: getBig5VariantSummary(form.formCode, locale),
          href: withAttribution(buildBig5TakeHref(test.slug, locale, form.formCode)),
          ctaLabel: getFlagshipFreeTestCtaLabel({
            scaleCode: test.scale_code,
            formCode: form.formCode,
            locale,
            fallback: getBig5StartLabel(form.formCode, locale),
            primaryCtaLabelOverride: cmsPrimaryCtaLabel,
          }),
          testId: `test-detail-landing-cta-${form.formCode}`,
          eventProperties: buildStartClickTrackingProps({
            formCode: form.formCode,
            targetAction: `start_${form.formCode}`,
          }),
        }))
      : showsEnneagramActions
        ? listEnneagramFormMetas().map((form) => ({
            key: form.formCode,
            label: getEnneagramVariantLabel(form.formCode, locale),
            summary: getEnneagramVariantSummary(form.formCode, locale),
            href: buildEnneagramTakeHref(test.slug, locale, form.formCode),
            ctaLabel: getFlagshipFreeTestCtaLabel({
              scaleCode: test.scale_code,
              formCode: form.formCode,
              locale,
              fallback: getEnneagramStartLabel(form.formCode, locale),
              primaryCtaLabelOverride: cmsPrimaryCtaLabel,
            }),
            testId: `test-detail-landing-cta-${form.formCode}`,
            eventProperties: buildStartClickTrackingProps({
              formCode: form.formCode,
              targetAction: `start_${form.formCode}`,
            }),
          }))
        : showsRiasecActions
          ? listRiasecFormMetas(lookup?.forms).map((form) => ({
              key: form.formCode,
              label: getRiasecVariantLabel(form.formCode, locale),
              summary: getRiasecVariantSummary(form.formCode, locale),
              href: withAttribution(buildRiasecTakeHref(test.slug, locale, form.formCode)),
              ctaLabel: getFlagshipFreeTestCtaLabel({
                scaleCode: test.scale_code,
                formCode: form.formCode,
                locale,
                fallback: getRiasecStartLabel(form.formCode, locale),
                primaryCtaLabelOverride: cmsPrimaryCtaLabel,
              }),
              testId: `test-detail-landing-cta-${form.formCode}`,
              eventProperties: buildStartClickTrackingProps({
                formCode: form.formCode,
                targetAction: `start_${form.formCode}`,
              }),
            }))
      : [];
  const depressionVersionChoices: FlagshipVariantChoice[] = showsDepressionVersionActions
    ? [
        {
          key: "clinical_combo_68",
          label: locale === "zh" ? "抑郁焦虑综合检测【学术专业版】" : "Clinical depression & anxiety assessment",
          summary:
            locale === "zh"
              ? "68 题，约 12 分钟，同时查看抑郁与焦虑两个维度，并获得更完整的近期状态参考。"
              : "68 items, about 12 minutes, with a fuller recent-state reference across depression and anxiety.",
          href: withAttribution(withLocale("/tests/clinical-depression-anxiety-assessment-professional-edition/take")),
          ctaLabel: locale === "zh" ? "开始学术专业版" : "Start professional version",
          testId: "test-detail-landing-cta-clinical-combo-68",
          eventProperties: buildStartClickTrackingProps({
            targetAction: "start_clinical_combo_68",
          }),
        },
        {
          key: "depression_standard_20",
          label: locale === "zh" ? "抑郁症测试【标准版】" : "Depression screening test (Standard)",
          summary:
            locale === "zh"
              ? "20 题，约 5 分钟，快速了解近期情绪低落、兴趣下降与状态波动是否值得进一步关注。"
              : "20 items, about 5 minutes, for a faster screen of recent low mood, loss of interest, and state changes.",
          href: withAttribution(withLocale("/tests/depression-screening-test-standard-edition/take")),
          ctaLabel: locale === "zh" ? "开始标准版" : "Start standard version",
          testId: "test-detail-landing-cta-depression-standard-20",
          eventProperties: buildStartClickTrackingProps({
            targetAction: "start_depression_standard_20",
          }),
        },
      ]
    : [];
  const iqBankChoices: IqBankLandingChoiceWithTracking[] = showsIqActions
    ? getIqBankLandingChoices({
        locale,
        takeHref: startTestHref,
      }).map((choice) => ({
        ...choice,
        eventProperties: choice.href
          ? buildStartClickTrackingProps({
              formCode: choice.formCode,
              targetAction: choice.targetAction,
            })
          : undefined,
      }))
    : [];
  const mbtiPrimaryChoice = showsMbtiActions
    ? flagshipVariantChoices.find((choice) => choice.key === DEFAULT_MBTI_FORM_CODE) ?? flagshipVariantChoices[0] ?? null
    : null;
  const mbtiSecondaryChoice = showsMbtiActions
    ? flagshipVariantChoices.find((choice) => choice.key !== (mbtiPrimaryChoice?.key ?? DEFAULT_MBTI_FORM_CODE)) ?? null
    : null;
  const mbtiLandingPath = landingPath;
  const mbtiPrimaryHref = mbtiPrimaryChoice
    ? buildMbtiEntryHref({
        locale,
        testSlug: test.slug,
        formCode: mbtiPrimaryChoice.key,
        entrySurface: "mbti_test_landing",
        sourcePageType: "test_landing",
        targetAction: "start_mbti_test_primary",
        sourcePath: mbtiLandingPath,
        attributionParams: landingAttributionParams,
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
        attributionParams: landingAttributionParams,
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
        attributionPayload: landingAttributionPayload,
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
        attributionPayload: landingAttributionPayload,
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
        attributionPayload: landingAttributionPayload,
      })
    : null;
  const mbtiEntryVariantChoices: FlagshipVariantChoice[] = [
    ...(mbtiPrimaryChoice && mbtiPrimaryHref
      ? [{
          ...mbtiPrimaryChoice,
          href: mbtiPrimaryHref,
          testId: "mbti-landing-primary-cta",
          eventProperties: mbtiPrimaryClickTrackingProps ?? mbtiPrimaryChoice.eventProperties,
        }]
      : []),
    ...(mbtiSecondaryChoice && mbtiSecondaryHref
      ? [{
          ...mbtiSecondaryChoice,
          href: mbtiSecondaryHref,
          testId: "mbti-landing-secondary-cta",
          eventProperties: mbtiSecondaryClickTrackingProps ?? mbtiSecondaryChoice.eventProperties,
        }]
      : []),
  ];
  const eqVariantChoices: FlagshipVariantChoice[] = showsEqActions && canRenderStartCta
    ? [
        {
          key: "eq_60",
          label: locale === "zh" ? "EQ 60Q · 情绪智力档案" : "EQ 60Q · Emotional intelligence profile",
          summary:
            locale === "zh"
              ? "约 10 分钟，了解情绪觉察、调节、共情与人际沟通倾向。"
              : "About 10 minutes to review emotional awareness, regulation, empathy, and communication patterns.",
          href: startTestHref,
          ctaLabel: cmsPrimaryCtaLabel || getFreeTestStartLabel({
            locale,
            scaleCode: test.scale_code,
            slug: test.slug,
            title: localizedTestTitle,
            fallback: locale === "zh" ? "开始情商免费测试" : "Start the free EQ test",
          }),
          testId: "test-detail-landing-cta-eq-60",
          eventProperties: buildStartClickTrackingProps({ targetAction: "start_test" }),
        },
      ]
    : [];

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
    ...landingAttributionPayload,
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
  const resolvedSeoTitle =
    cmsLandingSurfaceContent.seoTitle
    || toStringValue(lookup?.seo_title)
    || flagshipFreeTestCopy?.seoTitle
    || (testDetailAuthority.metadata.allowed ? localizedTestTitle : test.slug);
  const resolvedSeoDescription =
    cmsLandingSurfaceContent.seoDescription
    || toStringValue(lookup?.seo_description)
    || (testDetailAuthority.metadata.allowed ? test.description : "");
  const heroTitle = cmsLandingSurfaceContent.heroTitle || flagshipFreeTestCopy?.h1 || localizedTestTitle;
  const heroCopy = cmsLandingSurfaceContent.heroCopy || landingCopy || test.description;
  const heroTitleDisplay = formatCardTitleForUi({
    title: heroTitle,
    slug: test.slug,
    locale,
    surface: "tests_detail_hero",
  });
  const relatedArticles = await fetchRelatedArticles(test.slug, locale);
  const iqSeoRampAuthority = await getIqSeoRampAuthorityForLocale(locale);
  const canonicalPath = localizedPath(`/tests/${test.slug}`, locale);
  const mbtiLandingContinuityItems = showsMbtiActions ? buildMbtiTestLandingContinuityItems(locale) : [];
  const softwareApplicationName = heroTitle;
  const softwareApplicationDescription = heroCopy;
  const softwareApplicationFeatureList = uniqueVisibleFeatureList([
    questionSummary,
    durationSummary,
    ...flagshipVariantChoices.map((choice) => choice.label),
  ]);
  const softwareApplicationClaimText = [
    softwareApplicationName,
    softwareApplicationDescription,
    ...softwareApplicationFeatureList,
  ].join(" ");
  const iqLaunchSeoGuard = resolveIqLaunchSeoGuard({
    slug: test.slug,
    scaleCode: test.scale_code,
    hasSeoTitle: toStringValue(lookup?.seo_title).length > 0,
    hasSeoDescription: toStringValue(lookup?.seo_description).length > 0,
    title: softwareApplicationName,
    description: softwareApplicationDescription,
    featureList: softwareApplicationFeatureList,
    seoRampAuthority: iqSeoRampAuthority,
  });
  const softwareApplicationJsonLd =
    test.is_public !== false &&
    test.is_active !== false &&
    lookup?.is_indexable !== false &&
    !testDetailAuthority.shouldNoindexMissingMetadataAuthority &&
    canonicalPath.length > 0 &&
    softwareApplicationName.length > 0 &&
    softwareApplicationDescription.length > 0 &&
    !iqLaunchSeoGuard.blocksSoftwareApplicationSchema &&
    !hasUnsafeIqLaunchClaim(softwareApplicationClaimText) &&
    (isSoftwareApplicationSchemaScaleEligible({ slug: test.slug, scaleCode: test.scale_code }) ||
      iqLaunchSeoGuard.jsonLdExpansionAllowed) &&
    !hasBlockedSoftwareApplicationClaim(softwareApplicationClaimText)
      ? buildTestSoftwareAppJsonLd({
          path: canonicalPath,
          name: softwareApplicationName,
          description: softwareApplicationDescription,
          locale,
          minutes: test.time_minutes,
          featureList: softwareApplicationFeatureList,
        })
      : null;
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: resolvedSeoTitle,
    description: resolvedSeoDescription,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: locale === "zh" ? "/zh" : "/en" },
    { name: locale === "zh" ? "测评" : "Tests", path: locale === "zh" ? "/zh/tests" : "/en/tests" },
    { name: localizedTestTitle, path: canonicalPath },
  ]);
  const faqJsonLd =
    mergedFaq.length > 0
      ? buildFAQPageJsonLd(
          mergedFaq.map((item) => ({
            question: item.q,
            answer: item.a,
          }))
        )
      : null;

  return (
    <main
      className="mx-auto w-full max-w-6xl px-[var(--fm-container-gutter)] pb-[var(--fm-space-30)] pt-12 lg:pb-12"
      {...(isSelfUnderstanding ? {
        "data-domain-id": "self_understanding",
        "data-domain-role": domainRole,
        "data-domain-envelope-state": "metadata_only",
      } : {})}
    >
      <JsonLd id={`test-webpage-${test.slug}`} data={webPageJsonLd} />
      <JsonLd id={`test-breadcrumb-${test.slug}`} data={breadcrumbJsonLd} />
      {softwareApplicationJsonLd ? (
        <JsonLd id={`test-software-application-${test.slug}`} data={softwareApplicationJsonLd} />
      ) : null}
      {faqJsonLd ? <JsonLd id={`test-faq-${test.slug}`} data={faqJsonLd} /> : null}
      <AnalyticsPageViewTracker eventName="landing_view" properties={landingTrackingProps} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section id="what-it-is" className="space-y-4 rounded-2xl border border-[var(--fm-border)] bg-gradient-to-br from-white via-white to-sky-50 p-6 shadow-[var(--fm-shadow-md)]">
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-start">
              <div className="space-y-3">
                <h1 title={heroTitleDisplay.plain} className="m-0 max-w-full text-balance break-words font-serif text-3xl font-semibold leading-tight tracking-tight text-[var(--fm-text)] md:text-[2.15rem] lg:text-[2.35rem]">
                  {heroTitleDisplay.multilineFallback ? (
                    <span className="inline-flex max-w-full flex-col break-words">
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
                <div className="max-w-3xl space-y-2 text-[var(--fm-text-muted)]">
                  <p className="m-0">{heroCopy}</p>
                  {disclaimer ? (
                    <p className="m-0" data-testid="test-detail-free-boundary">
                      {disclaimer}
                    </p>
                  ) : null}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-sm text-[var(--fm-text-muted)]">
                  <span>
                    {questionSummary}
                  </span>
                  <span>•</span>
                  <span>{durationSummary}</span>
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
                <div data-testid="mbti-ads-primary-whitelist">
                  <FlagshipVariantChooser
                    choices={mbtiEntryVariantChoices.length > 0 ? mbtiEntryVariantChoices : flagshipVariantChoices}
                  />
                </div>
              </div>
            ) : showsBig5Actions ? (
              <div className="space-y-4 pt-2">
                <FlagshipVariantChooser
                  choices={flagshipVariantChoices}
                />
              </div>
            ) : showsEnneagramActions ? (
              <div className="space-y-4 pt-2">
                <FlagshipVariantChooser
                  title={locale === "zh" ? "选择九型人格版本" : "Choose your Enneagram form"}
                  subtitle={
                    locale === "zh"
                      ? "105 题是五点量表自评版；144 题是二选一迫选版。两个版本属于同一个九型人格测评，结果与重新测试都会保留所选版本。"
                      : "105Q is the five-point Likert form; 144Q is the forced-choice pair form. Both belong to the same Enneagram assessment and preserve the selected form through result and retake."
                  }
                  choices={flagshipVariantChoices}
                />
              </div>
            ) : showsRiasecActions ? (
              <div className="space-y-4 pt-2">
                <FlagshipVariantChooser
                  title={locale === "zh" ? "选择霍兰德职业兴趣版本" : "Choose your Holland interest form"}
                  subtitle={
                    locale === "zh"
                      ? "60 题是默认公开标准版；140 题是增强版。两个版本属于同一个 RIASEC 测评，结果与重新测试都会保留所选版本。"
                      : "60Q is the default public standard form; 140Q is the enhanced form. Both belong to the same RIASEC assessment and preserve the selected form through result and retake."
                  }
                  choices={flagshipVariantChoices}
                />
              </div>
            ) : showsIqActions ? (
              <div className="space-y-4 pt-2">
                <IqBankLandingChooser locale={locale} choices={iqBankChoices} />
              </div>
            ) : showsDepressionVersionActions ? (
              <div className="space-y-4 pt-2">
                <FlagshipVariantChooser
                  title={locale === "zh" ? "选择更适合你的版本" : "Choose the version that fits best"}
                  subtitle={
                    locale === "zh"
                      ? "学术专业版用于完整查看抑郁与焦虑状态；标准版用于更快速的抑郁状态筛查。"
                      : "Use the professional version for a fuller depression-and-anxiety read, or the standard version for a faster depression screen."
                  }
                  choices={depressionVersionChoices}
                />
              </div>
            ) : showsEqActions && eqVariantChoices.length > 0 ? (
              <div className="space-y-4 pt-2">
                <FlagshipVariantChooser choices={eqVariantChoices} />
              </div>
            ) : canRenderStartCta ? (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <TrackedEntryCtaLink
                  href={startTestHref}
                  prefetch={false}
                  eventProperties={buildStartClickTrackingProps({ targetAction: "start_test" })}
                  className={buttonVariants({ size: "lg" })}
                >
                  {cmsPrimaryCtaLabel || getFreeTestStartLabel({
                    locale,
                    scaleCode: test.scale_code,
                    slug: test.slug,
                    title: localizedTestTitle,
                    fallback: locale === "zh" ? "开始测试" : "Start test",
                  })}
                </TrackedEntryCtaLink>
              </div>
            ) : null}
          </section>

          {showsMentalHealthDisclaimer ? <MentalHealthDisclaimer locale={locale} /> : null}

          {showsMbtiActions ? (
            <MbtiSceneEntrySection
              locale={locale}
              sourcePageType="test_landing"
              testId="mbti-test-landing-scene-entry"
            />
          ) : null}
          {showsMbtiActions && mbtiLandingContinuityItems.length > 0 ? (
            <section
              className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
              data-testid="mbti-landing-continuity-strip"
            >
              <div className="grid items-stretch gap-3 md:grid-cols-4">
                {mbtiLandingContinuityItems.map((item) => (
                  <article
                    key={item.key}
                    className="flex h-full flex-col rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
                    data-testid={`mbti-landing-continuity-${item.key}`}
                  >
                    <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{item.title}</p>
                    <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{item.body}</p>
                    <Link href={item.href} className="fm-help-chip-link mt-auto self-start">
                      {locale === "zh" ? "继续查看" : "Continue"}
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
          {showsMbtiActions ? <MbtiLandingSurfaceSections surface={landingSurface} /> : null}
          {showsRiasecActions ? <RiasecLandingSurfaceSections surface={landingSurface} /> : null}

          {!hasFreeFullReportAuthority && (rollout.paywallMode === "free_only" || !rollout.commerceEnabled) ? (
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
              {whenToUse || detailLensCopy.whenToUseBody}
            </p>
            {audienceItems.length > 0 ? (
              <ul className="mt-4 space-y-2 text-sm text-slate-600">
                {audienceItems.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden>•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </CiteableSection>

          <Card id="how-it-works">
            <CardHeader>
              <CardTitle>{locale === "zh" ? "你将获得什么" : "What to expect"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              {(howItWorksItems.length > 0
                ? howItWorksItems
                : defaultHowItWorksItems).map((item, index) => (
                <p key={`${index}-${item}`}>{index + 1}. {item}</p>
              ))}
            </CardContent>
          </Card>

          <Card data-testid="tests-related-articles-section">
            <CardHeader>
              <CardTitle>{dict.tests.relatedArticles.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {relatedArticles.length === 0 ? (
                <p className="m-0 text-sm text-slate-600">{dict.tests.relatedArticles.empty}</p>
              ) : (
                <ul className="space-y-3">
                  {relatedArticles.map((article) => (
                    <li key={article.slug} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4">
                      <h3 className="m-0 text-lg font-semibold text-slate-900">
                        <Link
                          href={withLocale(`/articles/${article.slug}`)}
                          data-testid={`tests-related-article-${article.slug}`}
                          className="hover:text-[var(--fm-accent)]"
                        >
                          {article.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">{article.excerpt}</p>
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

          {mergedFaq.length > 0 ? (
            <section
              id="faq"
              className="space-y-4"
              data-evidence-container="true"
              data-evidence-page-family="test_detail"
              data-evidence-source-type="visible_page_content"
              data-evidence-readiness="partial"
            >
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">FAQ</h2>
              <div data-evidence-block="faq">
                <FAQAccordion items={mergedFaq} />
              </div>
            </section>
          ) : null}

          {disclaimer ? (
            <Card id="limitations" data-evidence-block="caveat">
              <CardHeader>
                <CardTitle>{locale === "zh" ? "免责声明" : "Disclaimer"}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-slate-700">{disclaimer}</CardContent>
            </Card>
          ) : null}

          {!isFlagshipDualVariant ? (
            <Card id="references" data-evidence-block="evidence_facts">
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

        {testDetailAuthority.cta.allowed ? (
          <aside>
            <CTASticky
              slug={test.slug}
              title={localizedTestTitle}
              questions={test.questions_count}
              minutes={test.time_minutes}
              scaleCode={test.scale_code}
              locale={locale}
              primaryCtaLabel={cmsPrimaryCtaLabel}
              attributionParams={landingAttributionParams}
              attributionPayload={landingAttributionPayload}
            />
          </aside>
        ) : null}
      </div>
    </main>
  );
}
