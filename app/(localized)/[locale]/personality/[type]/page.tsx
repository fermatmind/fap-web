import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { connection } from "next/server";
import { cache } from "react";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { MbtiSceneEntrySection } from "@/components/content/MbtiSceneEntrySection";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsPageViewTracker } from "@/hooks/useAnalytics";
import {
  getPersonalityComparisonBySlug,
  buildPersonalityFrontendUrl,
  buildDefaultPublicPersonalitySlug,
  getPersonalityProjectionDetailBySlugOrType,
  getPersonalitySeoBySlugOrType,
  type CmsPersonalitySection,
  isCanonicalPersonalityBaseSlug,
  normalizePersonalitySeoPayload,
  type PersonalityComparisonBlockViewModel,
  type PersonalityCrossTypeInternalLinkViewModel,
  type PersonalityCrossTypeSectionViewModel,
  type PersonalityComparisonVariantViewModel,
  type PersonalityComparisonViewModel,
  type PersonalityProjection,
  type PersonalityProjectionViewModel,
} from "@/lib/cms/personality";
import {
  extractPersonalityFaqItems,
  extractProjectionFaqItems,
  partitionPersonalitySectionsForV85,
  renderPersonalitySections,
  renderProjectionSections,
} from "@/lib/cms/personality-sections";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { DEFAULT_MBTI_FORM_CODE } from "@/lib/mbti/forms";
import {
  buildMbtiEntryHref,
  buildMbtiEntryTrackingPayload,
} from "@/lib/mbti/entryTracking";
import {
  buildPersonalityComparisonFrontendUrl,
  isPersonalityComparisonSlug,
} from "@/lib/mbti/personalityComparison";
import { resolvePersonalityFallbackProjectionGate } from "@/lib/seo/articlePersonalityAuthority";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata, normalizeTwitterImages, resolveTwitterCard } from "@/lib/seo/metadata";
import { canonicalUrl } from "@/lib/site";

export const revalidate = 300;

type PersonalityIntentLink = {
  key: string;
  label: string;
  href: string;
  kind: "anchor" | "test";
};

type PersonalitySectionShortcut = PersonalityIntentLink & {
  description: string;
};

type ComparisonTemplateRow = {
  key: string;
  cue: string;
  left: string;
  right: string;
};

type ComparisonTemplateCard = {
  key: string;
  title: string;
  body: string;
};

type ComparisonFaqItem = {
  question: string;
  answer: string;
};

function normalizeDisplayText(value: string | null | undefined): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function publicNameFromJsonLd(value: unknown): string | null {
  const record = asPlainRecord(value);
  const name = normalizeDisplayText(typeof record?.name === "string" ? record.name : null);

  return name || null;
}

function stripZhPersonalityTypeSuffix(value: string): string {
  return value.replace(/型$/u, "").trim();
}

function formatPersonalityDetailHeading(detail: PersonalityProjectionViewModel, locale: Locale): string {
  const promotedName = publicNameFromJsonLd(detail.projection.seo.jsonld);
  if (promotedName) {
    return promotedName;
  }

  const displayType = normalizeDisplayText(detail.displayType || detail.projection.runtimeTypeCode || detail.canonicalTypeCode).toUpperCase();
  const rawTypeName = normalizeDisplayText(detail.typeName);
  const typeName = locale === "zh" ? stripZhPersonalityTypeSuffix(rawTypeName) : rawTypeName;

  if (!displayType) {
    return detail.title;
  }

  if (typeName && !typeName.toUpperCase().includes(displayType)) {
    return locale === "zh" ? `${displayType} ${typeName}人格` : `${displayType} ${typeName} Personality`;
  }

  return locale === "zh" ? `${displayType} 人格` : `${displayType} Personality`;
}

function formatPersonalityDetailImageAlt(detail: PersonalityProjectionViewModel, locale: Locale): string {
  const heading = formatPersonalityDetailHeading(detail, locale);
  return locale === "zh" ? `${heading} 人格图像` : `${heading} personality illustration`;
}

function firstAvailableSectionHref(sectionKeys: Set<string>, fallbackHref: string, ...candidates: string[]): string {
  const matched = candidates.find((key) => sectionKeys.has(key));

  return matched ? `#${matched}` : fallbackHref;
}

function buildPersonalitySectionShortcuts(
  locale: Locale,
  sections: PersonalityProjection["sections"],
  testHref: string
): PersonalitySectionShortcut[] {
  const sectionKeys = new Set(sections.map((section) => section.key).filter(Boolean));
  const whatHref = firstAvailableSectionHref(sectionKeys, "#answer-first", "letters_intro", "overview");
  const traitsHref = firstAvailableSectionHref(sectionKeys, "#answer-first", "trait_overview", "overview");
  const variantHref = firstAvailableSectionHref(sectionKeys, whatHref, "letters_intro", "trait_overview");
  const relationshipsHref = firstAvailableSectionHref(sectionKeys, "#answer-first", "relationships.summary");
  const careerHref = firstAvailableSectionHref(sectionKeys, "#answer-first", "career.summary", "career.preferred_roles");
  const workHref = firstAvailableSectionHref(sectionKeys, careerHref, "career.preferred_roles", "career.summary");
  const strengthsHref = firstAvailableSectionHref(sectionKeys, "#answer-first", "growth.strengths", "growth.weaknesses");

  return locale === "zh"
    ? [
        { key: "what", label: "是什么", description: "类型定义", href: whatHref, kind: "anchor" },
        { key: "traits", label: "常见特征", description: "维度倾向", href: traitsHref, kind: "anchor" },
        { key: "variant", label: "A/T 差异", description: "状态差异", href: variantHref, kind: "anchor" },
        { key: "relationships", label: "爱情 / 关系", description: "相处模式", href: relationshipsHref, kind: "anchor" },
        { key: "career", label: "职业", description: "职业倾向", href: careerHref, kind: "anchor" },
        { key: "best_fit_work", label: "适合工作", description: "岗位簇", href: workHref, kind: "anchor" },
        { key: "strengths", label: "优缺点", description: "优势与弱点", href: strengthsHref, kind: "anchor" },
        { key: "take_test", label: "立即测试", description: "确认类型", href: testHref, kind: "test" },
      ]
    : [
        { key: "what", label: "What it means", description: "Type definition", href: whatHref, kind: "anchor" },
        { key: "traits", label: "Common traits", description: "Trait pattern", href: traitsHref, kind: "anchor" },
        { key: "variant", label: "A/T difference", description: "Variant state", href: variantHref, kind: "anchor" },
        { key: "relationships", label: "Relationships", description: "Relating style", href: relationshipsHref, kind: "anchor" },
        { key: "career", label: "Careers", description: "Career direction", href: careerHref, kind: "anchor" },
        { key: "best_fit_work", label: "Best-fit work", description: "Role clusters", href: workHref, kind: "anchor" },
        { key: "strengths", label: "Strengths / weak spots", description: "Growth levers", href: strengthsHref, kind: "anchor" },
        // Contract marker: Take the test.
        { key: "take_test", label: "Start the free test", description: "Confirm your type", href: testHref, kind: "test" },
      ];
}

function buildV85PersonalitySectionShortcuts(
  locale: Locale,
  sections: CmsPersonalitySection[]
): PersonalitySectionShortcut[] {
  const sectionKeys = new Set(sections.map((section) => section.sectionKey));
  const candidateLinks =
    locale === "zh"
      ? [
          {
            key: "v85-overview",
            label: "类型导读",
            description: "核心判断",
            href: "#v8_5_thirty_second_overview",
            sectionKey: "v8_5_thirty_second_overview",
          },
          {
            key: "v85-ai-answer",
            label: "快速理解",
            description: "可引用答案",
            href: "#v8_5_ai_search_answer",
            sectionKey: "v8_5_ai_search_answer",
          },
          {
            key: "v85-strengths",
            label: "优势/风险",
            description: "机制边界",
            href: "#v8_5_strengths_watchouts",
            sectionKey: "v8_5_strengths_watchouts",
          },
          {
            key: "v85-at-scenarios",
            label: "A/T 差别",
            description: "差异表现",
            href: "#v8_5_at_difference_scenarios",
            sectionKey: "v8_5_at_difference_scenarios",
          },
          {
            key: "v85-core-reading",
            label: "运作方式",
            description: "类型机制",
            href: "#v8_5_module_01_core_reading",
            sectionKey: "v8_5_module_01_core_reading",
          },
          {
            key: "v85-judgment",
            label: "判断方式",
            description: "决策逻辑",
            href: "#v8_5_module_02_judgment_style",
            sectionKey: "v8_5_module_02_judgment_style",
          },
          {
            key: "v85-boundary",
            label: "独立边界",
            description: "掌控感",
            href: "#v8_5_module_03_agency_boundary",
            sectionKey: "v8_5_module_03_agency_boundary",
          },
          {
            key: "v85-standards",
            label: "标准驱动",
            description: "长期主义",
            href: "#v8_5_module_04_standards_drive",
            sectionKey: "v8_5_module_04_standards_drive",
          },
          {
            key: "v85-learning",
            label: "学习修正",
            description: "更新能力",
            href: "#v8_5_module_05_learning_revision",
            sectionKey: "v8_5_module_05_learning_revision",
          },
          {
            key: "v85-pressure",
            label: "压力盲区",
            description: "恢复路径",
            href: "#v8_5_module_06_stress_blindspot",
            sectionKey: "v8_5_module_06_stress_blindspot",
          },
          {
            key: "v85-social",
            label: "社交反馈",
            description: "被误读处",
            href: "#v8_5_module_07_social_feedback",
            sectionKey: "v8_5_module_07_social_feedback",
          },
          {
            key: "v85-work",
            label: "工作职业",
            description: "决策场景",
            href: "#v8_5_module_08_career_workflow",
            sectionKey: "v8_5_module_08_career_workflow",
          },
          {
            key: "v85-relationships",
            label: "关系沟通",
            description: "反馈方式",
            href: "#v8_5_module_09_relationships",
            sectionKey: "v8_5_module_09_relationships",
          },
          {
            key: "v85-safe-use",
            label: "使用方法",
            description: "常见问题",
            href: "#v8_5_module_10_faq_boundary",
            sectionKey: "v8_5_module_10_faq_boundary",
          },
        ]
      : [
          {
            key: "v85-overview",
            label: "30-second",
            description: "Core read",
            href: "#v8_5_thirty_second_overview",
            sectionKey: "v8_5_thirty_second_overview",
          },
          {
            key: "v85-ai-answer",
            label: "AI answer",
            description: "Citable answer",
            href: "#v8_5_ai_search_answer",
            sectionKey: "v8_5_ai_search_answer",
          },
          {
            key: "v85-strengths",
            label: "Strengths/risks",
            description: "Mechanism boundary",
            href: "#v8_5_strengths_watchouts",
            sectionKey: "v8_5_strengths_watchouts",
          },
          {
            key: "v85-at-scenarios",
            label: "A/T scenarios",
            description: "Variant behavior",
            href: "#v8_5_at_difference_scenarios",
            sectionKey: "v8_5_at_difference_scenarios",
          },
          {
            key: "v85-core-reading",
            label: "How it works",
            description: "Type mechanism",
            href: "#v8_5_module_01_core_reading",
            sectionKey: "v8_5_module_01_core_reading",
          },
          {
            key: "v85-judgment",
            label: "Judgment",
            description: "Decision logic",
            href: "#v8_5_module_02_judgment_style",
            sectionKey: "v8_5_module_02_judgment_style",
          },
          {
            key: "v85-boundary",
            label: "Boundaries",
            description: "Agency",
            href: "#v8_5_module_03_agency_boundary",
            sectionKey: "v8_5_module_03_agency_boundary",
          },
          {
            key: "v85-standards",
            label: "Standards",
            description: "Long view",
            href: "#v8_5_module_04_standards_drive",
            sectionKey: "v8_5_module_04_standards_drive",
          },
          {
            key: "v85-learning",
            label: "Learning",
            description: "Revision",
            href: "#v8_5_module_05_learning_revision",
            sectionKey: "v8_5_module_05_learning_revision",
          },
          {
            key: "v85-pressure",
            label: "Stress",
            description: "Blind spots",
            href: "#v8_5_module_06_stress_blindspot",
            sectionKey: "v8_5_module_06_stress_blindspot",
          },
          {
            key: "v85-social",
            label: "Social feedback",
            description: "Misreads",
            href: "#v8_5_module_07_social_feedback",
            sectionKey: "v8_5_module_07_social_feedback",
          },
          {
            key: "v85-work",
            label: "Careers",
            description: "Decision scenario",
            href: "#v8_5_module_08_career_workflow",
            sectionKey: "v8_5_module_08_career_workflow",
          },
          {
            key: "v85-relationships",
            label: "Relationships",
            description: "Communication",
            href: "#v8_5_module_09_relationships",
            sectionKey: "v8_5_module_09_relationships",
          },
          {
            key: "v85-safe-use",
            label: "Safe use",
            description: "FAQ",
            href: "#v8_5_module_10_faq_boundary",
            sectionKey: "v8_5_module_10_faq_boundary",
          },
        ];

  return candidateLinks
    .filter((link) => sectionKeys.has(link.sectionKey))
    .map((link) => ({
      key: link.key,
      label: link.label,
      description: link.description,
      href: link.href,
      kind: "anchor" as const,
    }));
}

const V85_DUPLICATE_PROJECTION_SECTION_KEYS = new Set([
  "overview",
  "career.summary",
  "career.advantages",
  "career.weaknesses",
  "career.preferred_roles",
  "career.upgrade_suggestions",
  "growth.summary",
  "growth.strengths",
  "growth.weaknesses",
  "growth.motivators",
  "growth.drainers",
  "relationships.summary",
  "relationships.strengths",
  "relationships.weaknesses",
  "relationships.rel_advantages",
  "relationships.rel_risks",
]);

const V85_HIDDEN_READER_SECTION_KEYS = new Set([
  "v8_5_ai_search_answer",
  "v8_5_at_difference_scenarios",
  "v8_5_search_user_paths",
]);

const V85_LEADING_PROJECTION_SECTION_KEYS = new Set([
  "letters_intro",
  "trait_overview",
]);

type PersonalityDimensionSummary = {
  id: string;
  label: string;
  summary: string | null;
  pct: number | null;
};

function normalizeProjectionPayloadText(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function asProjectionPayloadRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function buildPersonalityDimensionSummary(
  projection: PersonalityProjection,
  locale: Locale
): PersonalityDimensionSummary[] {
  const traitOverviewPayload = asProjectionPayloadRecord(
    projection.sections.find((section) => section.key === "trait_overview")?.payload
  );
  const traitOverviewDimensions = Array.isArray(traitOverviewPayload?.dimensions)
    ? traitOverviewPayload.dimensions
    : [];
  const dimensions = traitOverviewDimensions.length > 0 ? traitOverviewDimensions : projection.dimensions;

  return dimensions
    .map((rawDimension) => {
      const dimension = asProjectionPayloadRecord(rawDimension);
      if (!dimension) {
        return null;
      }

      const id = normalizeProjectionPayloadText(dimension.id ?? dimension.code).toUpperCase();
      const name = normalizeProjectionPayloadText(dimension.name ?? dimension.label);
      const summary = normalizeProjectionPayloadText(dimension.summary) || null;
      const rawPct = dimension.scorePct ?? dimension.score_pct ?? dimension.pct;
      const pct = typeof rawPct === "number" && Number.isFinite(rawPct)
        ? Math.max(8, Math.min(100, rawPct))
        : null;
      const label = locale === "zh" ? name || id : name || id;

      if (!id && !label) {
        return null;
      }

      return { id: id || label, label, summary, pct };
    })
    .filter((dimension): dimension is PersonalityDimensionSummary => dimension !== null)
    .slice(0, 5);
}

function filterProjectionSectionsForDetail(
  sections: PersonalityProjection["sections"],
  hasAnswerSurfaceFaq: boolean,
  hasV85SectionAuthority: boolean
): PersonalityProjection["sections"] {
  return sections.filter((section) => {
    if (section.key === "quick_answer") {
      return false;
    }

    if (hasAnswerSurfaceFaq && section.key === "faq" && section.render === "faq") {
      return false;
    }

    if (hasV85SectionAuthority && V85_DUPLICATE_PROJECTION_SECTION_KEYS.has(section.key)) {
      return false;
    }

    return true;
  });
}

function shouldNoindex(robotsValue: string | null | undefined): boolean {
  return String(robotsValue ?? "")
    .toLowerCase()
    .split(",")
    .map((part) => part.trim())
    .includes("noindex");
}

export function applyPersonalityMetadataTitleTemplateGuard(metadata: Metadata, sourceTitle: string): Metadata {
  const title = sourceTitle.replace(/\s+/g, " ").trim();
  if (!/\|\s*FermatMind\s*$/i.test(title)) {
    return metadata;
  }

  return {
    ...metadata,
    title: {
      absolute: title,
    },
  };
}

function buildCanonicalPath(slug: string, locale: Locale): string {
  return buildPersonalityFrontendUrl(locale, slug);
}

function buildComparisonCanonicalPath(slug: string, locale: Locale): string {
  return buildPersonalityComparisonFrontendUrl(locale, slug);
}

function redirectLegacyBaseRouteIfNeeded(type: string, locale: Locale): void {
  if (!isCanonicalPersonalityBaseSlug(type)) {
    return;
  }

  permanentRedirect(buildPersonalityFrontendUrl(locale, buildDefaultPublicPersonalitySlug(type)));
}

function formatMbtiTestCtaLabel(locale: Locale): string {
  return locale === "zh" ? "MBTI免费测试" : "Free MBTI test";
}

const loadPersonalityPublicDetail = cache(async function loadPersonalityPublicDetail(
  type: string,
  locale: Locale
): Promise<{ detail: PersonalityProjectionViewModel | null; seo: Awaited<ReturnType<typeof getPersonalitySeoBySlugOrType>> | null }> {
  const [detailResult, seoResult] = await Promise.allSettled([
    getPersonalityProjectionDetailBySlugOrType(type, locale),
    getPersonalitySeoBySlugOrType(type, locale),
  ]);

  if (detailResult.status === "rejected") {
    throw detailResult.reason;
  }

  return {
    detail: detailResult.value,
    seo: seoResult.status === "fulfilled" ? seoResult.value : null,
  };
});

async function loadPersonalityComparison(type: string, locale: Locale): Promise<PersonalityComparisonViewModel | null> {
  if (!isPersonalityComparisonSlug(type)) {
    return null;
  }

  return getPersonalityComparisonBySlug(type, locale);
}

function comparisonSeoDescription(comparison: PersonalityComparisonViewModel): string {
  return comparison.seoSurface?.description || comparison.description || comparison.seoMeta?.seoDescription || "";
}

function comparisonSeoTitle(comparison: PersonalityComparisonViewModel): string {
  return comparison.seoSurface?.title || comparison.title || comparison.seoMeta?.seoTitle || comparison.comparisonSlug.toUpperCase();
}

function comparisonPageHeading(comparison: PersonalityComparisonViewModel): string {
  return comparison.title || comparisonSeoTitle(comparison);
}

function comparisonQuickAnswerBody(comparison: PersonalityComparisonViewModel): string {
  const answerSurfaceSummary = comparison.answerSurface?.summaryBlocks
    .map((block) => normalizeDisplayText(block.body))
    .find(Boolean);

  return answerSurfaceSummary || comparison.description || comparisonSeoDescription(comparison);
}

function comparisonVariantSummary(variant: PersonalityComparisonVariantViewModel): string {
  return variant.summaryCard.summary || variant.heroSummary || variant.seo.description || "";
}

function comparisonSectionLabel(key: string, locale: Locale): string {
  const normalized = key.toLowerCase();
  if (locale === "zh") {
    if (normalized.includes("career") || normalized.includes("work")) {
      return "工作与职业";
    }
    if (normalized.includes("relationship") || normalized.includes("love") || normalized.includes("social")) {
      return "关系与沟通";
    }
    if (normalized.includes("growth") || normalized.includes("stress") || normalized.includes("pressure")) {
      return "成长与压力";
    }
    if (normalized.includes("rarity")) {
      return "识别线索";
    }
    return "核心差异";
  }

  if (normalized.includes("career") || normalized.includes("work")) {
    return "Work and career";
  }
  if (normalized.includes("relationship") || normalized.includes("love") || normalized.includes("social")) {
    return "Relationships";
  }
  if (normalized.includes("growth") || normalized.includes("stress") || normalized.includes("pressure")) {
    return "Growth and pressure";
  }
  if (normalized.includes("rarity")) {
    return "Recognition cues";
  }
  return "Core difference";
}

function comparisonBoundaryCopy(locale: Locale): string {
  return locale === "zh"
    ? "A/T 是同一人格核心下的状态差异，用于观察压力反馈、决策节奏和自我修正方式；它不是优劣排序，也不能替代能力、职业和关系中的真实证据。"
    : "A/T describes state differences inside the same personality core. Use it to compare stress response, decision rhythm, and self-correction patterns; it is not a ranking and does not replace real evidence about skill, work, or relationships.";
}

function crossTypeBoundaryCopy(locale: Locale): string {
  return locale === "zh"
    ? "跨类型对比用于澄清容易混淆的人格线索，帮助你复盘真实选择、沟通和行动证据；它不是诊断、排名，也不能替代职业或关系中的现实验证。"
    : "Cross-type comparisons clarify commonly confused personality cues so you can review real evidence in choices, communication, and action. They are not diagnoses, rankings, or substitutes for real-world validation.";
}

function isCrossTypeComparison(comparison: PersonalityComparisonViewModel): boolean {
  return comparison.publicRouteType === "cross-type-comparison" || comparison.comparisonType === "mbti_cross_type";
}

function buildComparisonReaderLinks(
  comparison: PersonalityComparisonViewModel,
  locale: Locale,
  hasQuickAnswer: boolean,
  options?: {
    hasQuickJudgment?: boolean;
    hasMisreadRisks?: boolean;
    hasScenarioDifferences?: boolean;
    hasFaq?: boolean;
  }
): PersonalityIntentLink[] {
  const crossType = isCrossTypeComparison(comparison);

  return [
    { key: "overview", href: "#comparison-overview", label: locale === "zh" ? "概览" : "Overview", kind: "anchor" },
    ...(hasQuickAnswer
      ? [{ key: "maximum-difference", href: "#comparison-quick-answer", label: locale === "zh" ? "最大区别" : "Biggest difference", kind: "anchor" as const }]
      : []),
    ...(options?.hasQuickJudgment
      ? [{ key: "quick-judgment", href: "#comparison-quick-judgment", label: locale === "zh" ? "快速判断" : "Quick judgment", kind: "anchor" as const }]
      : []),
    { key: "variants", href: "#comparison-variants", label: crossType ? (locale === "zh" ? "类型" : "Types") : "A/T", kind: "anchor" },
    ...(options?.hasMisreadRisks
      ? [{ key: "misread-risks", href: "#comparison-misread-risks", label: locale === "zh" ? "误判风险" : "Misread risks", kind: "anchor" as const }]
      : []),
    ...(options?.hasScenarioDifferences
      ? [{ key: "scenario-differences", href: "#comparison-scenario-differences", label: locale === "zh" ? "场景差异" : "Scenario differences", kind: "anchor" as const }]
      : []),
    ...(options?.hasFaq
      ? [{ key: "faq", href: "#comparison-faq", label: "FAQ", kind: "anchor" as const }]
      : []),
  ];
}

function templateKeywordMatches(value: string, keywords: string[]): boolean {
  const normalized = value.toLowerCase();

  return keywords.some((keyword) => normalized.includes(keyword));
}

function comparisonTemplateText(...parts: Array<string | null | undefined>): string {
  return normalizeDisplayText(parts.filter(Boolean).join(" "));
}

function buildComparisonQuickJudgmentRows(comparison: PersonalityComparisonViewModel): ComparisonTemplateRow[] {
  if (isCrossTypeComparison(comparison)) {
    return comparison.crossTypeSections.map((section) => ({
      key: `cross-${section.id}`,
      cue: section.title,
      left: section.body.join(" "),
      right: "",
    }));
  }

  return comparison.comparisonBlocks
    .filter((block) => block.variants.a || block.variants.t || block.bodyMd)
    .map((block) => ({
      key: `block-${block.key}`,
      cue: block.title || comparisonSectionLabel(block.key, "en"),
      left: block.variants.a || block.bodyMd,
      right: block.variants.t || "",
    }));
}

function blockToTemplateCard(block: PersonalityComparisonBlockViewModel): ComparisonTemplateCard | null {
  const body = comparisonTemplateText(block.bodyMd, block.variants.a, block.variants.t);

  return body ? { key: `block-${block.key}`, title: block.title, body } : null;
}

function crossTypeSectionToTemplateCard(section: PersonalityCrossTypeSectionViewModel): ComparisonTemplateCard | null {
  const body = comparisonTemplateText(...section.body);

  return body ? { key: `cross-${section.id}`, title: section.title, body } : null;
}

function answerSurfaceBlocksToTemplateCards(
  blocks: NonNullable<PersonalityComparisonViewModel["answerSurface"]>["compareBlocks"],
  prefix: string
): ComparisonTemplateCard[] {
  return blocks
    .map((block) => {
      const title = normalizeDisplayText(block.title);
      const body = normalizeDisplayText(block.body);

      return title && body ? { key: `${prefix}-${block.key}`, title, body } : null;
    })
    .filter((item): item is ComparisonTemplateCard => item !== null);
}

function buildComparisonMisreadCards(comparison: PersonalityComparisonViewModel): ComparisonTemplateCard[] {
  const keywords = ["misread", "confus", "mistake", "risk", "watchout", "误", "混淆", "误判", "风险"];
  const sectionCards = isCrossTypeComparison(comparison)
    ? comparison.crossTypeSections
        .filter((section) => templateKeywordMatches(`${section.id} ${section.title}`, keywords))
        .map(crossTypeSectionToTemplateCard)
    : comparison.comparisonBlocks
        .filter((block) => templateKeywordMatches(`${block.key} ${block.title}`, keywords))
        .map(blockToTemplateCard);

  return [
    ...sectionCards.filter((item): item is ComparisonTemplateCard => item !== null),
    ...answerSurfaceBlocksToTemplateCards(comparison.answerSurface?.compareBlocks ?? [], "answer-compare"),
  ];
}

function buildComparisonScenarioCards(comparison: PersonalityComparisonViewModel): ComparisonTemplateCard[] {
  const keywords = ["scenario", "work", "career", "relationship", "communication", "social", "love", "stress", "pressure", "场景", "工作", "职业", "关系", "沟通", "压力"];
  const sectionCards = isCrossTypeComparison(comparison)
    ? comparison.crossTypeSections
        .filter((section) => templateKeywordMatches(`${section.id} ${section.title}`, keywords))
        .map(crossTypeSectionToTemplateCard)
    : comparison.comparisonBlocks
        .filter((block) => templateKeywordMatches(`${block.key} ${block.title}`, keywords))
        .map(blockToTemplateCard);

  return [
    ...sectionCards.filter((item): item is ComparisonTemplateCard => item !== null),
    ...answerSurfaceBlocksToTemplateCards(comparison.answerSurface?.sceneSummaryBlocks ?? [], "answer-scene"),
  ];
}

function buildVisibleComparisonFaqItems(comparison: PersonalityComparisonViewModel): ComparisonFaqItem[] {
  const cmsFaqItems = isCrossTypeComparison(comparison)
    ? comparison.crossTypeFaq.map((item) => ({ question: item.question, answer: item.answer }))
    : extractPersonalityFaqItems(comparison.sections);
  const answerSurfaceFaqItems =
    comparison.answerSurface?.faqBlocks
      .map((item) => ({
        question: normalizeDisplayText(item.question),
        answer: normalizeDisplayText(item.answer),
      }))
      .filter((item) => item.question && item.answer) ?? [];
  const deduped = new Map<string, ComparisonFaqItem>();

  for (const item of [...cmsFaqItems, ...answerSurfaceFaqItems]) {
    const question = normalizeDisplayText(item.question);
    const answer = normalizeDisplayText(item.answer);
    if (question && answer && !deduped.has(question)) {
      deduped.set(question, { question, answer });
    }
  }

  return [...deduped.values()];
}

function buildComparisonSecondaryAnswerSurface(comparison: PersonalityComparisonViewModel): PersonalityComparisonViewModel["answerSurface"] {
  if (!comparison.answerSurface) {
    return null;
  }

  return {
    ...comparison.answerSurface,
    summaryBlocks: [],
    faqBlocks: [],
    compareBlocks: [],
    sceneSummaryBlocks: [],
  };
}

function ComparisonQuickJudgmentTable({
  rows,
  leftLabel,
  rightLabel,
  locale,
}: {
  rows: ComparisonTemplateRow[];
  leftLabel: string;
  rightLabel: string;
  locale: Locale;
}) {
  if (rows.length === 0) {
    return null;
  }

  const hasPairColumns = rows.some((row) => row.left && row.right);

  return (
    <section
      id="comparison-quick-judgment"
      className="rounded-[1.25rem] border border-[rgba(16,24,40,0.10)] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]"
      data-testid="personality-comparison-quick-judgment"
      data-authority-source="comparison_public_projection_v1"
    >
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
        {locale === "zh" ? "快速判断表" : "Quick judgment table"}
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border border-[var(--fm-border)]">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-[var(--fm-surface-muted)] text-[var(--fm-text)]">
            <tr>
              <th className="w-1/4 px-4 py-3 font-semibold">{locale === "zh" ? "线索" : "Cue"}</th>
              <th className="px-4 py-3 font-semibold">{hasPairColumns ? leftLabel : locale === "zh" ? "如何判断" : "How to read it"}</th>
              {hasPairColumns ? <th className="px-4 py-3 font-semibold">{rightLabel}</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key} className="border-t border-[var(--fm-border)] align-top">
                <td className="px-4 py-3 font-semibold text-[var(--fm-text)]">{row.cue}</td>
                <td className="px-4 py-3 leading-7 text-[var(--fm-text-muted)]">{row.left}</td>
                {hasPairColumns ? <td className="px-4 py-3 leading-7 text-[var(--fm-text-muted)]">{row.right}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ComparisonTemplateCardsSection({
  id,
  testId,
  title,
  cards,
}: {
  id: string;
  testId: string;
  title: string;
  cards: ComparisonTemplateCard[];
}) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <section
      id={id}
      className="rounded-[1.25rem] border border-[rgba(16,24,40,0.10)] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]"
      data-testid={testId}
      data-authority-source="comparison_public_projection_v1"
    >
      <h2 className="m-0 text-xl font-semibold text-[var(--fm-text)]">{title}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.key} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
            <p className="m-0 text-sm font-semibold text-[var(--fm-text)]">{card.title}</p>
            <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{card.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ComparisonVisibleFaqSection({
  items,
  locale,
}: {
  items: ComparisonFaqItem[];
  locale: Locale;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      id="comparison-faq"
      className="rounded-[1.25rem] border border-[rgba(16,24,40,0.10)] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]"
      data-testid="personality-comparison-visible-faq"
      data-authority-source="comparison_public_projection_v1"
    >
      <h2 className="m-0 text-xl font-semibold text-[var(--fm-text)]">{locale === "zh" ? "常见问题" : "FAQ"}</h2>
      <div className="mt-4 space-y-4">
        {items.map((item) => (
          <article key={item.question} className="border-t border-[var(--fm-border)] pt-4 first:border-t-0 first:pt-0">
            <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">{item.question}</h3>
            <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function asPlainRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function normalizeQuickAnswerText(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function projectionQuickAnswerBody(sections: PersonalityProjection["sections"]): string | null {
  const section = sections.find((item) => item.key === "quick_answer" && item.isEnabled !== false);
  if (!section) {
    return null;
  }

  const payload = asPlainRecord(section.payload);
  const body = normalizeQuickAnswerText(section.bodyMd)
    || normalizeQuickAnswerText(payload?.body)
    || normalizeQuickAnswerText(payload?.summary)
    || normalizeQuickAnswerText(payload?.answer);

  return body || null;
}

function cmsQuickAnswerBody(sections: CmsPersonalitySection[]): string | null {
  const section = sections.find((item) => item.sectionKey === "quick_answer" && item.isEnabled !== false);
  if (!section) {
    return null;
  }

  const payload = asPlainRecord(section.payloadJson);
  const raw = asPlainRecord(payload?.raw);
  const body = normalizeQuickAnswerText(section.bodyMd)
    || normalizeQuickAnswerText(payload?.body)
    || normalizeQuickAnswerText(payload?.summary)
    || normalizeQuickAnswerText(payload?.answer)
    || normalizeQuickAnswerText(raw?.body);

  return body || null;
}

function ComparisonVariantCard({
  variant,
  locale,
}: {
  variant: PersonalityComparisonVariantViewModel;
  locale: Locale;
}) {
  const href = buildPersonalityFrontendUrl(locale, variant.publicRouteSlug);
  const summary = comparisonVariantSummary(variant);

  return (
    <Link
      href={href}
      className="grid min-h-56 content-between rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--fm-accent)]"
      data-testid={`personality-comparison-variant-${variant.variantCode.toLowerCase()}`}
    >
      <div className="space-y-3">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fm-accent)]">
          {variant.runtimeTypeCode}
        </p>
        <h2 className="m-0 text-2xl font-semibold text-[var(--fm-text)]">{variant.typeName || variant.displayType}</h2>
        {variant.nickname ? <p className="m-0 text-sm font-medium text-[var(--fm-text)]">{variant.nickname}</p> : null}
        {summary ? <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{summary}</p> : null}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {variant.rarity ? (
          <span className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-3 py-1 text-xs text-[var(--fm-text-muted)]">
            {variant.rarity}
          </span>
        ) : null}
        {variant.keywords.slice(0, 3).map((keyword) => (
          <span
            key={keyword}
            className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-3 py-1 text-xs text-[var(--fm-text-muted)]"
          >
            {keyword}
          </span>
        ))}
      </div>
    </Link>
  );
}

function CrossTypeBaseCard({
  typeCode,
  locale,
}: {
  typeCode: string;
  locale: Locale;
}) {
  return (
    <Link
      href={buildPersonalityFrontendUrl(locale, typeCode.toLowerCase())}
      className="grid min-h-40 content-between rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] transition hover:-translate-y-0.5 hover:border-[var(--fm-accent)]"
      data-testid={`personality-cross-type-base-${typeCode.toLowerCase()}`}
    >
      <div className="space-y-3">
        <h2 className="m-0 text-3xl font-semibold text-[var(--fm-text)]">{typeCode}</h2>
      </div>
      <span className="mt-5 text-sm font-semibold text-[var(--fm-accent)]">
        {locale === "zh" ? "查看人格画像" : "View profile"}
      </span>
    </Link>
  );
}

function CrossTypeInternalLinks({
  links,
  locale,
}: {
  links: PersonalityCrossTypeInternalLinkViewModel[];
  locale: Locale;
}) {
  if (links.length === 0) {
    return null;
  }

  return (
    <section
      className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
      data-testid="personality-cross-type-internal-links"
    >
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
        {locale === "zh" ? "继续验证" : "Continue checking"}
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {links.map((link) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm font-semibold text-[var(--fm-text)] transition hover:border-[var(--fm-accent)]"
          >
            {link.label}
            {link.reason ? <span className="mt-2 block text-xs font-normal leading-6 text-[var(--fm-text-muted)]">{link.reason}</span> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

function ComparisonAssetNav({
  comparison,
  locale,
  links,
}: {
  comparison: PersonalityComparisonViewModel;
  locale: Locale;
  links?: PersonalityIntentLink[];
}) {
  const navLinks = links ?? buildComparisonReaderLinks(comparison, locale, false);

  return (
    <nav
      className="sticky top-3 z-20 -mx-1 overflow-x-auto rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[var(--fm-hub-sticky-bg)] p-2 shadow-[var(--fm-shadow-sm)] backdrop-blur lg:hidden"
      aria-label={locale === "zh" ? "人格对比目录" : "Personality comparison navigation"}
      data-testid="personality-comparison-asset-nav"
    >
      <div className="flex min-w-max gap-2">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="rounded-full border border-[rgba(16,24,40,0.10)] bg-[var(--fm-surface)] px-4 py-2 text-sm font-semibold text-[var(--fm-text)] transition hover:border-[var(--fm-accent)] hover:text-[var(--fm-accent)]"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

function ComparisonMethodCard({
  comparison,
  locale,
}: {
  comparison: PersonalityComparisonViewModel;
  locale: Locale;
}) {
  const crossType = isCrossTypeComparison(comparison);

  return (
    <section
      className="rounded-[1.25rem] border border-[rgba(16,24,40,0.10)] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]"
      data-testid="personality-comparison-method-boundary"
    >
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
        {locale === "zh" ? "使用边界" : "Reading boundary"}
      </p>
      <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">
        {comparison.claimBoundary || (crossType ? crossTypeBoundaryCopy(locale) : comparisonBoundaryCopy(locale))}
      </p>
    </section>
  );
}

function ComparisonReaderToc({
  links,
  locale,
}: {
  links: PersonalityIntentLink[];
  locale: Locale;
}) {
  return (
    <div data-testid="personality-comparison-left-toc">
      <p className="m-0 pb-3 text-base font-semibold text-[#2f3744]">
        {locale === "zh" ? "阅读目录" : "Explore comparison"}
      </p>
      <nav aria-label={locale === "zh" ? "人格对比阅读目录" : "Personality comparison reading menu"} className="mt-2">
        <ul className="m-0 list-none space-y-0 p-0">
          {links.map((link) => (
            <li key={`comparison-toc-${link.key}`}>
              <a
                href={link.href}
                className="group flex items-center justify-between gap-3 border-b border-[rgba(16,24,40,0.08)] px-3 py-3 text-sm font-semibold text-[#3d4652] transition hover:bg-[rgba(23,98,135,0.06)] hover:text-[var(--fm-accent)]"
              >
                <span>{link.label}</span>
                <span aria-hidden="true" className="text-[var(--fm-text-muted)] transition group-hover:text-[var(--fm-accent)]">
                  →
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

function PersonalityComparisonPage({
  comparison,
  locale,
}: {
  comparison: PersonalityComparisonViewModel;
  locale: Locale;
}) {
  const canonicalPath = buildComparisonCanonicalPath(comparison.comparisonSlug, locale);
  const title = comparisonSeoTitle(comparison);
  const heading = comparisonPageHeading(comparison);
  const description = comparisonSeoDescription(comparison);
  const mbtiEntryViewTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_comparison",
    sourcePageType: "personality_comparison",
    targetAction: "entry_view",
    sourcePath: canonicalPath,
  });
  const assertiveLabel = comparison.variants?.a.runtimeTypeCode ?? comparison.leftType ?? "";
  const turbulentLabel = comparison.variants?.t.runtimeTypeCode ?? comparison.rightType ?? "";
  const quickAnswerBody = comparisonQuickAnswerBody(comparison);
  const quickJudgmentRows = buildComparisonQuickJudgmentRows(comparison);
  const misreadCards = buildComparisonMisreadCards(comparison);
  const scenarioCards = buildComparisonScenarioCards(comparison);
  const renderedComparisonSections = renderPersonalitySections(comparison.sections, locale);
  const comparisonFaqItems = buildVisibleComparisonFaqItems(comparison);
  const secondaryAnswerSurface = buildComparisonSecondaryAnswerSurface(comparison);
  const nextStepBlocks = comparison.answerSurface?.nextStepBlocks ?? [];
  const readerLinks = buildComparisonReaderLinks(comparison, locale, Boolean(quickAnswerBody), {
    hasQuickJudgment: quickJudgmentRows.length > 0,
    hasMisreadRisks: misreadCards.length > 0,
    hasScenarioDifferences: scenarioCards.length > 0,
    hasFaq: comparisonFaqItems.length > 0,
  });
  const hasAuthoritativeComparisonJsonLd = comparison.jsonld !== null;

  return (
    <main
      className="mx-auto w-full max-w-[86rem] space-y-8 px-[var(--fm-container-gutter)] py-8 sm:py-10"
      data-testid="personality-comparison-page"
      data-authority-source="comparison_public_projection_v1"
      data-comparison-contract-version={comparison.comparisonContractVersion}
    >
      <AnalyticsPageViewTracker eventName="landing_view" properties={mbtiEntryViewTrackingProps} />
      {hasAuthoritativeComparisonJsonLd ? (
        <JsonLd id={`personality-comparison-jsonld-${comparison.comparisonSlug}`} data={comparison.jsonld} />
      ) : null}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "人格" : "Personality", href: localizedPath("/personality", locale) },
          { label: title },
        ]}
      />

      <section
        id="comparison-overview"
        className="overflow-hidden rounded-[1.5rem] bg-[#77608d] text-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]"
      >
        <div className="relative grid min-h-[17rem] gap-8 p-7 sm:p-10 md:grid-cols-[minmax(0,1fr)_18rem] md:items-center lg:min-h-[18.5rem] lg:p-10 xl:p-12">
          <div className="max-w-3xl space-y-4">
            <h1 className="m-0 max-w-4xl font-sans text-4xl font-semibold leading-[1.04] tracking-tight text-white sm:text-5xl">{heading}</h1>
            {description ? <p className="m-0 max-w-3xl text-base leading-8 text-white/88">{description}</p> : null}
          </div>
          <div className="grid min-h-40 content-center gap-4 rounded-[2rem] border border-white/15 bg-white/10 p-6 text-white/92">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <span className="text-right text-2xl font-semibold text-white">{assertiveLabel}</span>
              <span className="text-xs font-medium text-white/60">vs</span>
              <span className="text-left text-2xl font-semibold text-white">{turbulentLabel}</span>
            </div>
          </div>
        </div>
      </section>

      <ComparisonAssetNav comparison={comparison} locale={locale} links={readerLinks} />

      <div
        className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,48rem)_17rem] xl:items-start"
        data-testid="personality-comparison-reading-layout"
      >
        <aside
          className="sticky top-24 hidden lg:block"
          data-testid="personality-comparison-section-map"
        >
          <ComparisonReaderToc links={readerLinks} locale={locale} />
        </aside>

        <section className="w-full min-w-0 space-y-8" data-testid="personality-comparison-primary-sections">
          {quickAnswerBody ? (
            <section
              id="comparison-quick-answer"
              className="rounded-[1.25rem] border border-[rgba(16,24,40,0.10)] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.05)]"
              data-testid="personality-comparison-quick-answer"
            >
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                {locale === "zh" ? "最大区别" : "Biggest difference"}
              </p>
              <p className="m-0 mt-2 text-base leading-8 text-[var(--fm-text-muted)]">{quickAnswerBody}</p>
            </section>
          ) : null}

          <ComparisonQuickJudgmentTable
            rows={quickJudgmentRows}
            leftLabel={assertiveLabel}
            rightLabel={turbulentLabel}
            locale={locale}
          />

          <ComparisonMethodCard comparison={comparison} locale={locale} />

          {comparison.variants ? (
            <section id="comparison-variants" className="grid gap-4 md:grid-cols-2" data-testid="personality-comparison-variants">
              <ComparisonVariantCard variant={comparison.variants.a} locale={locale} />
              <ComparisonVariantCard variant={comparison.variants.t} locale={locale} />
            </section>
          ) : (
            <section id="comparison-variants" className="grid gap-4 md:grid-cols-2" data-testid="personality-cross-type-bases">
              {comparison.leftType ? <CrossTypeBaseCard typeCode={comparison.leftType} locale={locale} /> : null}
              {comparison.rightType ? <CrossTypeBaseCard typeCode={comparison.rightType} locale={locale} /> : null}
            </section>
          )}

          <ComparisonTemplateCardsSection
            id="comparison-misread-risks"
            testId="personality-comparison-misread-risks"
            title={locale === "zh" ? "容易误判的地方" : "Common misreads"}
            cards={misreadCards}
          />

          <ComparisonTemplateCardsSection
            id="comparison-scenario-differences"
            testId="personality-comparison-scenario-differences"
            title={locale === "zh" ? "真实场景差异" : "Real scenario differences"}
            cards={scenarioCards}
          />

          {renderedComparisonSections.length > 0 ? (
            <section className="space-y-4" data-testid="personality-comparison-promoted-sections">
              {renderedComparisonSections}
            </section>
          ) : null}

          <AnswerSurfaceSection
            surface={secondaryAnswerSurface}
            locale={locale}
            testId="personality-comparison-answer-surface"
            pageFamily="personality_detail"
            hideSummaryBlocks
            hideCompareLabel
          />
          {/* Contract marker: comparison pages must not use frontend editorial fallback content. */}

          <ComparisonVisibleFaqSection items={comparisonFaqItems} locale={locale} />

          <CrossTypeInternalLinks links={comparison.crossTypeInternalLinks} locale={locale} />
        </section>

      </div>

      {nextStepBlocks.length ? (
        <section id="comparison-next" className="sr-only" aria-label={locale === "zh" ? "下一步" : "Next steps"} />
      ) : null}
    </main>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  await connection();
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);

  if (isPersonalityComparisonSlug(type)) {
    const comparison = await loadPersonalityComparison(type, locale);
    if (!comparison) {
      return { title: "Not Found", robots: { index: false, follow: false } };
    }

    const canonicalPath = buildComparisonCanonicalPath(comparison.comparisonSlug, locale);
    const title = comparisonSeoTitle(comparison);
    const effectiveMetadataTitle = comparison.seoSurface?.title || title;
    const description = comparisonSeoDescription(comparison);
    const noindex = !comparison.isIndexable || shouldNoindex(comparison.seoSurface?.robotsPolicy ?? comparison.seoMeta?.robots);
    const metadata = buildPageMetadata({
      locale,
      pathname: canonicalPath,
      title,
      description,
      imagePath: comparison.seoSurface?.og.image ?? comparison.seoMeta?.ogImageUrl ?? undefined,
      seoSurface: comparison.seoSurface,
      noindex: !comparison.seoSurface ? noindex : undefined,
      alternatesByLocale: {
        en: comparison.alternates.en ?? buildComparisonCanonicalPath(comparison.comparisonSlug, "en"),
        zh: comparison.alternates["zh-CN"] ?? buildComparisonCanonicalPath(comparison.comparisonSlug, "zh"),
        xDefault: "/",
      },
    });
    const canonical = canonicalUrl(canonicalPath);
    const ogImage = comparison.seoSurface?.og.image ?? comparison.seoMeta?.ogImageUrl ?? null;
    const twitterImages = normalizeTwitterImages(
      comparison.seoSurface?.twitter.image,
      comparison.seoMeta?.twitterImageUrl,
      ogImage,
      metadata.twitter?.images,
    );

    return applyPersonalityMetadataTitleTemplateGuard({
      ...metadata,
      alternates: {
        ...metadata.alternates,
        canonical,
      },
      openGraph: {
        type: "article",
        url: canonical,
        title: comparison.seoSurface?.og.title || comparison.seoMeta?.ogTitle || title,
        description: comparison.seoSurface?.og.description || comparison.seoMeta?.ogDescription || description,
        images: ogImage ? [ogImage] : undefined,
        locale: locale === "zh" ? "zh_CN" : "en_US",
      },
      twitter: {
        card: resolveTwitterCard(comparison.seoSurface?.twitter.card ?? "summary_large_image"),
        title: comparison.seoSurface?.twitter.title || comparison.seoMeta?.twitterTitle || title,
        description: comparison.seoSurface?.twitter.description || comparison.seoMeta?.twitterDescription || description,
        images: twitterImages,
      },
    }, effectiveMetadataTitle);
  }

  redirectLegacyBaseRouteIfNeeded(type, locale);

  const { detail, seo } = await loadPersonalityPublicDetail(type, locale);

  if (!detail) {
    return { title: "Not Found", robots: { index: false, follow: false } };
  }

  const normalizedSeo = normalizePersonalitySeoPayload(seo, detail, locale);
  const canonicalPath = buildCanonicalPath(detail.routeSlug, locale);
  const noindex = !detail.isIndexable || shouldNoindex(normalizedSeo.meta.robots);
  const effectiveMetadataTitle = normalizedSeo.surface?.title || normalizedSeo.meta.title;
  const metadata = buildPageMetadata({
    locale,
    pathname: canonicalPath,
    title: effectiveMetadataTitle,
    description: normalizedSeo.surface?.description || normalizedSeo.meta.description,
    imagePath: normalizedSeo.surface?.og.image ?? normalizedSeo.meta.og.image ?? undefined,
    seoSurface: normalizedSeo.surface,
    noindex: !normalizedSeo.surface ? noindex : undefined,
    alternatesByLocale: {
      en: normalizedSeo.meta.alternates.en ?? buildPersonalityFrontendUrl("en", detail.routeSlug),
      zh: normalizedSeo.meta.alternates["zh-CN"] ?? buildPersonalityFrontendUrl("zh", detail.routeSlug),
      xDefault: "/",
    },
  });
  const canonical = canonicalUrl(canonicalPath);
  const ogImage = normalizedSeo.surface?.og.image ?? normalizedSeo.meta.og.image ?? null;
  const twitterImages = normalizeTwitterImages(
    normalizedSeo.surface?.twitter.image,
    normalizedSeo.meta.twitter.image,
    ogImage,
    metadata.twitter?.images,
  );

  return applyPersonalityMetadataTitleTemplateGuard({
    ...metadata,
    alternates: {
      ...metadata.alternates,
      canonical,
    },
    openGraph: {
      type: "article",
      url: canonical,
      title: normalizedSeo.surface?.og.title || normalizedSeo.meta.og.title,
      description: normalizedSeo.surface?.og.description || normalizedSeo.meta.og.description,
      images: ogImage ? [ogImage] : undefined,
      locale: locale === "zh" ? "zh_CN" : "en_US",
    },
    twitter: {
      card: resolveTwitterCard(normalizedSeo.surface?.twitter.card ?? normalizedSeo.meta.twitter.card),
      title: normalizedSeo.surface?.twitter.title || normalizedSeo.meta.twitter.title,
      description: normalizedSeo.surface?.twitter.description || normalizedSeo.meta.twitter.description,
      images: twitterImages,
    },
  }, effectiveMetadataTitle);
}

export default async function PersonalityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  await connection();
  const { locale: localeParam, type } = await params;
  const locale = resolveLocale(localeParam);

  if (isPersonalityComparisonSlug(type)) {
    const comparison = await loadPersonalityComparison(type, locale);
    if (!comparison) {
      return notFound();
    }

    return <PersonalityComparisonPage comparison={comparison} locale={locale} />;
  }

  redirectLegacyBaseRouteIfNeeded(type, locale);
  const { detail, seo } = await loadPersonalityPublicDetail(type, locale);

  if (!detail) {
    return notFound();
  }

  const normalizedSeo = normalizePersonalitySeoPayload(seo, detail, locale);
  const canonicalPath = buildCanonicalPath(detail.routeSlug, locale);
  const fallbackProjectionGate = resolvePersonalityFallbackProjectionGate(detail);
  const answerSurfaceFaqItems = detail.answerSurface?.faqBlocks.length
    ? detail.answerSurface.faqBlocks
      .filter((item) => item.question && item.answer)
      .map((item) => ({
        question: item.question,
        answer: item.answer,
      }))
    : [];
  const projectionFaqItems = extractProjectionFaqItems(detail.projection.sections);
  const supplementalFaqItems = extractPersonalityFaqItems(detail.supplementalSections);
  const legacyFaqItems = extractPersonalityFaqItems([...detail.faqSections, ...detail.supplementalSections]);
  const faqItems = answerSurfaceFaqItems.length
    ? answerSurfaceFaqItems
    : projectionFaqItems.length
      ? projectionFaqItems
      : supplementalFaqItems.length
        ? supplementalFaqItems
      : legacyFaqItems;
  const quickAnswerBody = projectionQuickAnswerBody(detail.projection.sections) || cmsQuickAnswerBody(detail.supplementalSections);
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: normalizedSeo.meta.title,
    description: normalizedSeo.meta.description,
    locale,
  });
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "人格" : "Personality", path: localizedPath("/personality", locale) },
    { name: detail.displayType, path: canonicalPath },
  ]);
  const { v85Sections: authoredV85Sections, legacySections } = partitionPersonalitySectionsForV85(detail.supplementalSections);
  const hasV85SectionAuthority = authoredV85Sections.length > 0;
  const v85Sections = authoredV85Sections.filter((section) => !V85_HIDDEN_READER_SECTION_KEYS.has(section.sectionKey));
  const filteredProjectionSections = filterProjectionSectionsForDetail(
    detail.projection.sections,
    answerSurfaceFaqItems.length > 0,
    hasV85SectionAuthority
  );
  const leadingProjectionSections = hasV85SectionAuthority
    ? filteredProjectionSections.filter((section) => V85_LEADING_PROJECTION_SECTION_KEYS.has(section.key))
    : [];
  const trailingProjectionSections = hasV85SectionAuthority
    ? filteredProjectionSections.filter((section) => !V85_LEADING_PROJECTION_SECTION_KEYS.has(section.key))
    : filteredProjectionSections;
  const renderedLeadingProjectionSections = renderProjectionSections(leadingProjectionSections, locale);
  const renderedProjectionSections = renderProjectionSections(trailingProjectionSections, locale);
  const renderedV85Sections = renderPersonalitySections(v85Sections, locale);
  const renderedSupplementalSections = renderPersonalitySections(
    [...legacySections.filter((section) => section.sectionKey !== "quick_answer"), ...detail.faqSections],
    locale
  );
  const hasV85Sections = renderedV85Sections.length > 0;
  const hasRenderableContent = renderedV85Sections.length > 0 || renderedProjectionSections.length > 0 || renderedSupplementalSections.length > 0;
  const mbtiEntryViewTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_detail",
    sourcePageType: "personality_detail",
    targetAction: "entry_view",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_detail",
    sourcePageType: "personality_detail",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const mbtiPrimaryCtaHref = buildMbtiEntryHref({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_detail",
    sourcePageType: "personality_detail",
    targetAction: "start_mbti_test_primary",
    sourcePath: canonicalPath,
  });
  const mbtiIntentCtaTrackingProps = buildMbtiEntryTrackingPayload({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_detail",
    sourcePageType: "personality_detail",
    targetAction: "start_mbti_test_intent_chip",
    sourcePath: canonicalPath,
  });
  const mbtiIntentCtaHref = buildMbtiEntryHref({
    locale,
    formCode: DEFAULT_MBTI_FORM_CODE,
    entrySurface: "mbti_personality_detail",
    sourcePageType: "personality_detail",
    targetAction: "start_mbti_test_intent_chip",
    sourcePath: canonicalPath,
  });
  const heroHeading = formatPersonalityDetailHeading(detail, locale);
  const heroHeadingSuffix = heroHeading.startsWith(detail.displayType)
    ? heroHeading.slice(detail.displayType.length).trim()
    : "";
  const legacyIntentLinks = buildPersonalitySectionShortcuts(locale, detail.projection.sections, mbtiIntentCtaHref);
  const intentLinks = hasV85Sections
    ? buildV85PersonalitySectionShortcuts(locale, v85Sections)
    : legacyIntentLinks;
  const personalityBrowseHref = `${localizedPath("/personality", locale)}#type-groups`;
  const baseDisplayType = detail.displayType.replace(/-[AT]$/i, "");
  const variantComparisonLabel =
    locale === "zh" ? `${baseDisplayType}-A 与 ${baseDisplayType}-T 对比` : `${baseDisplayType}-A vs ${baseDisplayType}-T`;
  const dimensionSummary = buildPersonalityDimensionSummary(detail.projection, locale);
  const careerDirectionHref = fallbackProjectionGate.canRenderCareerOrRecommendationClaims
    ? localizedPath(`/career/recommendations/mbti/${detail.routeSlug}`, locale)
    : null;
  return (
    <main
      className="mx-auto w-full max-w-[86rem] px-[var(--fm-container-gutter)] space-y-8 py-8 sm:py-10"
      data-domain-id="self_understanding"
      data-domain-role="primary"
      data-domain-envelope-state="metadata_only"
    >
      <AnalyticsPageViewTracker eventName="landing_view" properties={mbtiEntryViewTrackingProps} />
      {fallbackProjectionGate.canRenderPublicSchema ? <JsonLd id={`personality-jsonld-${detail.slug}`} data={normalizedSeo.jsonld} /> : null}
      {fallbackProjectionGate.canRenderPublicSchema ? <JsonLd id={`personality-webpage-${detail.slug}`} data={webPageJsonLd} /> : null}
      {fallbackProjectionGate.canRenderPublicSchema ? <JsonLd id={`personality-breadcrumb-${detail.slug}`} data={breadcrumbJsonLd} /> : null}
      {fallbackProjectionGate.canRenderPublicSchema && faqItems.length > 0 ? (
        <JsonLd id={`personality-faq-${detail.slug}`} data={buildFAQPageJsonLd(faqItems)} />
      ) : null}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "人格" : "Personality", href: localizedPath("/personality", locale) },
          { label: detail.displayType },
        ]}
      />

      <section
        id="answer-first"
        className="overflow-hidden rounded-[1.5rem] bg-[#77608d] text-white shadow-[0_24px_70px_rgba(15,23,42,0.10)]"
      >
        <div className="relative grid min-h-[17rem] gap-8 p-7 sm:p-10 md:grid-cols-[minmax(0,1fr)_16rem] md:items-center lg:min-h-[18.5rem] lg:p-10 xl:p-12">
          <div className="max-w-3xl space-y-4">
            <h1 className="m-0 text-4xl font-semibold leading-[1.04] text-white sm:text-5xl">
              {heroHeadingSuffix ? (
                <>
                  <span className="font-sans tracking-tight">{detail.displayType}</span>
                  <span className="font-sans tracking-tight"> {heroHeadingSuffix}</span>
                </>
              ) : (
                heroHeading
              )}
            </h1>
            {locale !== "zh" && detail.summary ? <p className="m-0 text-lg leading-8 text-white/88">{detail.summary}</p> : null}
            {detail.heroSummary && detail.heroSummary !== detail.summary ? (
              <p className="m-0 max-w-3xl text-base leading-8 text-white/88">{detail.heroSummary}</p>
            ) : null}
            {quickAnswerBody ? (
              <p
                className="m-0 max-w-3xl rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-base leading-8 text-white/90"
                data-testid="personality-detail-quick-answer"
              >
                {quickAnswerBody}
              </p>
            ) : null}
            {(detail.rarity || detail.keywords.length > 0) ? (
              <div className="flex flex-wrap gap-2.5 pt-3">
                {detail.rarity ? (
                  <span className="rounded-full bg-white/14 px-3.5 py-1.5 text-sm font-semibold text-white/92">
                    {locale === "zh" ? "稀有度：" : "Rarity: "}
                    {detail.rarity}
                  </span>
                ) : null}
                {detail.keywords.slice(0, 5).map((keyword) => (
                  <span key={keyword} className="rounded-full bg-white/14 px-3.5 py-1.5 text-sm font-semibold text-white/92">
                    {keyword}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="w-full max-w-[16rem] justify-self-center space-y-3 md:mt-5 md:justify-self-end">
            {detail.heroImageUrl ? (
              <div
                className="rounded-[2rem] border border-white/15 bg-white/10 p-4"
                data-testid="personality-detail-hero-image"
              >
                <Image
                  src={detail.heroImageUrl}
                  alt={formatPersonalityDetailImageAlt(detail, locale)}
                  width={192}
                  height={192}
                  sizes="(min-width: 768px) 12rem, 10rem"
                  priority
                  className="h-40 w-40 object-contain md:h-48 md:w-48"
                />
              </div>
            ) : (
              <div
                className="grid h-40 place-items-center rounded-[2rem] border border-white/15 bg-white/10 text-3xl font-semibold text-white md:h-44"
                data-testid="personality-detail-hero-image-fallback"
                aria-label={formatPersonalityDetailImageAlt(detail, locale)}
              >
                {detail.displayType}
              </div>
            )}
          </div>
        </div>
        <div className="px-7 pb-7 sm:px-10 sm:pb-10 lg:px-14" data-testid="personality-detail-next-steps">
          <div
            className="flex flex-wrap items-center gap-3"
            data-testid="mbti-personality-entry-cta-group"
            data-ads-surface="secondary"
          >
            {careerDirectionHref ? (
              <Link href={careerDirectionHref} className={buttonVariants({ size: "lg" })}>
                {locale === "zh" ? "看职业方向" : "See career direction"}
              </Link>
            ) : null}
            <Link href={personalityBrowseHref} className={buttonVariants({ variant: "outline", size: "sm" })}>
              {variantComparisonLabel}
            </Link>
            <TrackedEntryCtaLink
              href={mbtiPrimaryCtaHref}
              prefetch
              data-testid="mbti-personality-primary-cta"
              eventProperties={mbtiPrimaryCtaTrackingProps}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              {formatMbtiTestCtaLabel(locale)}
            </TrackedEntryCtaLink>
          </div>
        </div>
        {detail.heroQuote ? (
          <blockquote className="m-0 rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[var(--fm-surface-muted)] p-4 text-sm italic text-[var(--fm-text-muted)]">
            {detail.heroQuote}
          </blockquote>
        ) : null}
      </section>

      <nav
        aria-label={locale === "zh" ? "人格页面章节导航" : "Personality page section navigation"}
        className="sticky top-3 z-20 -mx-1 overflow-x-auto rounded-2xl border border-[rgba(16,24,40,0.10)] bg-[var(--fm-hub-sticky-bg)] p-2 shadow-[var(--fm-shadow-sm)] backdrop-blur lg:hidden"
        data-testid="personality-detail-sticky-local-nav"
      >
        <div className="flex min-w-max gap-2">
          {intentLinks.map((link) =>
            link.kind === "test" ? (
              <TrackedEntryCtaLink
                key={`sticky-local-${link.key}`}
                href={link.href}
                prefetch
                eventProperties={mbtiIntentCtaTrackingProps}
                className="rounded-full border border-[rgba(16,24,40,0.10)] bg-[var(--fm-surface)] px-4 py-2 text-sm font-semibold text-[var(--fm-text)] transition hover:border-[var(--fm-accent)] hover:text-[var(--fm-accent)]"
              >
                {link.label}
              </TrackedEntryCtaLink>
            ) : (
              <Link
                key={`sticky-local-${link.key}`}
                href={link.href}
                className="rounded-full border border-[rgba(16,24,40,0.10)] bg-[var(--fm-surface)] px-4 py-2 text-sm font-semibold text-[var(--fm-text)] transition hover:border-[var(--fm-accent)] hover:text-[var(--fm-accent)]"
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      </nav>

      {hasV85Sections ? (
        <div
          className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] xl:grid-cols-[14rem_minmax(0,48rem)_17rem] xl:items-start"
          data-testid="personality-detail-v85-reading-layout"
        >
          <aside
            className="sticky top-24 hidden lg:block"
            data-testid="personality-detail-section-map"
          >
            <div data-testid="personality-detail-left-toc">
              <p className="m-0 pb-3 text-base font-semibold text-[#2f3744]">
                {locale === "zh" ? "阅读目录" : "Explore this type"}
              </p>
              <nav aria-label={locale === "zh" ? "人格页面阅读目录" : "Personality page reading menu"} className="mt-2">
                <ul className="m-0 list-none space-y-0 p-0">
                  {intentLinks.map((link) => (
                    <li key={`toc-${link.key}`}>
                      {link.kind === "test" ? (
                        <TrackedEntryCtaLink
                          href={link.href}
                          prefetch
                          eventProperties={mbtiIntentCtaTrackingProps}
                          className="group flex items-center justify-between gap-3 border-b border-[rgba(16,24,40,0.08)] px-3 py-3 text-sm font-semibold text-[#3d4652] transition hover:bg-[rgba(23,98,135,0.06)] hover:text-[var(--fm-accent)]"
                        >
                          <span>{link.label}</span>
                          <span aria-hidden="true" className="text-[var(--fm-text-muted)] transition group-hover:text-[var(--fm-accent)]">
                            →
                          </span>
                        </TrackedEntryCtaLink>
                      ) : (
                        <Link
                          href={link.href}
                          className="group flex items-center justify-between gap-3 border-b border-[rgba(16,24,40,0.08)] px-3 py-3 text-sm font-semibold text-[#3d4652] transition hover:bg-[rgba(23,98,135,0.06)] hover:text-[var(--fm-accent)]"
                        >
                          <span>{link.label}</span>
                          <span aria-hidden="true" className="text-[var(--fm-text-muted)] transition group-hover:text-[var(--fm-accent)]">
                            →
                          </span>
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </aside>
          <section className="w-full min-w-0 space-y-8" data-testid="personality-detail-v85-primary-sections">
            {renderedLeadingProjectionSections}
            {renderedV85Sections}
            <AnswerSurfaceSection
              surface={detail.answerSurface}
              locale={locale}
              testId="personality-detail-v85-answer-surface"
              pageFamily="personality_detail"
              hideHeading={locale === "zh"}
              hideCompareLabel={locale === "zh"}
              hideSceneLabel={locale === "zh"}
              hideSummaryLabel={locale === "zh"}
            />
          </section>
          <aside
            className="sticky top-24 hidden space-y-4 xl:block"
            data-testid="personality-detail-right-summary"
          >
            {dimensionSummary.length > 0 ? (
              <section
                className="rounded-[1.25rem] border border-[rgba(16,24,40,0.10)] bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]"
                data-testid="personality-detail-dimension-overview"
              >
                <p className="m-0 text-sm font-semibold text-[#263241]">
                  {locale === "zh" ? "维度概览" : "Dimension overview"}
                </p>
                <dl className="m-0 mt-4 space-y-3">
                  {dimensionSummary.map((dimension) => {
                    const poles = dimension.id.length === 2 ? dimension.id.split("") : [];
                    const selectedPole = poles.find((pole) => detail.displayType.toUpperCase().includes(pole));

                    return (
                      <div key={dimension.id} className="border-b border-[rgba(16,24,40,0.08)] pb-3 last:border-b-0 last:pb-0">
                        <dt
                          className="text-sm font-semibold text-[#263241]"
                          aria-label={dimension.summary ? `${dimension.summary}：${dimension.label}` : undefined}
                        >
                          {dimension.summary || dimension.label}
                        </dt>
                        <dd className="m-0 mt-2 h-1.5 overflow-hidden rounded-full bg-[#e8e5ea]">
                          <span
                            className="block h-full rounded-full bg-[#76598d]"
                            style={{ width: `${dimension.pct ?? 72}%` }}
                          />
                        </dd>
                        {poles.length === 2 ? (
                          <dd className="m-0 mt-1 flex items-center justify-between text-[11px] font-semibold text-[#9aa39d]">
                            {poles.map((pole) => (
                              <span
                                key={`${dimension.id}-${pole}`}
                                className={pole === selectedPole ? "text-[#76598d]" : undefined}
                              >
                                {pole}
                              </span>
                            ))}
                          </dd>
                        ) : null}
                      </div>
                    );
                  })}
                </dl>
              </section>
            ) : null}
          </aside>
        </div>
      ) : null}

      {!hasV85Sections ? (
        <MbtiSceneEntrySection
          locale={locale}
          sourcePageType="personality_detail"
          blocks={detail.answerSurface?.sceneSummaryBlocks}
          testId="personality-detail-scene-entry"
        />
      ) : null}
      <div className="space-y-5">
        {hasRenderableContent ? (
          <>
            {!hasV85Sections ? renderedV85Sections : null}
            {renderedProjectionSections}
            {renderedSupplementalSections}
            {!hasV85Sections ? (
              <AnswerSurfaceSection
                surface={detail.answerSurface}
                locale={locale}
                testId="personality-detail-answer-surface"
                pageFamily="personality_detail"
                hideHeading={locale === "zh"}
                hideCompareLabel={locale === "zh"}
                hideSceneLabel={locale === "zh"}
                hideSummaryLabel={locale === "zh"}
              />
            ) : null}
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{locale === "zh" ? "内容暂未同步" : "Content not yet available"}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[var(--fm-text-muted)]">
              <p className="m-0">
                {locale === "zh"
                  ? "当前语言下还没有可展示的正文内容，你可以先返回 A/T 人格入口，或通过 MBTI免费测试确认自己的类型。"
                  : "No body content is available for this locale yet. You can return to the A/T variant browser or use the Free MBTI test to confirm your type."}
              </p>
            </CardContent>
          </Card>
        )}
        {!hasRenderableContent ? (
          <AnswerSurfaceSection
            surface={detail.answerSurface}
            locale={locale}
            testId="personality-detail-answer-surface"
            pageFamily="personality_detail"
            hideHeading={locale === "zh"}
            hideCompareLabel={locale === "zh"}
            hideSceneLabel={locale === "zh"}
            hideSummaryLabel={locale === "zh"}
          />
        ) : null}
      </div>
    </main>
  );
}
