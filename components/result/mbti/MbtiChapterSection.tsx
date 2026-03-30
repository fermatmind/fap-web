"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { SectionRenderer } from "@/components/big5/report/SectionRenderer";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DimensionBars } from "@/components/result/DimensionBars";
import { trackEvent } from "@/lib/analytics";
import type { ReportIdentityLayer } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import type { MbtiSectionUnlock, ReportBlock, ReportSection } from "@/components/result/RichResultReport";
import type { TraitBridgeItem } from "@/components/result/mbti/MbtiDominantTraitsSection";
import type {
  CulturalCalibrationSectionViewModel,
  MbtiCrossAssessmentSectionEnhancementViewModel,
  MbtiResultPersonalizationViewModel,
  MbtiPublicProjectionDimensionViewModel,
  MbtiResultProjectionSectionViewModel,
} from "@/lib/mbti/publicProjection";
import type { MbtiPreviewCardViewModel, MbtiPreviewSectionViewModel } from "@/lib/mbti/preview";
import {
  summarizeMbtiActionPriorityKeys,
  summarizeMbtiActionCompletionTendency,
  summarizeMbtiActionEffectWeights,
  summarizeMbtiAdaptiveContractVersion,
  summarizeMbtiAdaptiveFingerprint,
  summarizeMbtiAdaptiveRewriteReason,
  summarizeMbtiAxisBands,
  summarizeMbtiBoundaryFlags,
  summarizeMbtiCareerActionPriorityKeys,
  summarizeMbtiCareerJourneyKeys,
  summarizeMbtiCareerReadingKeys,
  summarizeMbtiCarryoverActionKeys,
  summarizeMbtiCarryoverResumeKeys,
  summarizeMbtiCarryoverSceneKeys,
  summarizeMbtiCloseCallAxes,
  summarizeMbtiCtaPriorityKeys,
  summarizeMbtiCurrentIntentCluster,
  summarizeMbtiFeedbackCoverage,
  summarizeMbtiFeedbackSentiment,
  summarizeMbtiLastDeepReadSection,
  summarizeMbtiMemoryContractVersion,
  summarizeMbtiMemoryFingerprint,
  summarizeMbtiMemoryProgressionState,
  summarizeMbtiMemoryRewriteKeys,
  summarizeMbtiMemoryRewriteReason,
  summarizeMbtiMemoryScope,
  summarizeMbtiMemoryState,
  summarizeMbtiBehaviorDeltaKeys,
  summarizeMbtiContentFeedbackWeights,
  summarizeMbtiCtaEffectWeights,
  summarizeMbtiDominantInterestKeys,
  summarizeMbtiNeighborTypeKeys,
  summarizeMbtiNextBestActionKey,
  summarizeMbtiNextBestActionReason,
  summarizeMbtiNextBestActionSection,
  summarizeMbtiOrderedActionKeys,
  summarizeMbtiOrderedRecommendationKeys,
  summarizeMbtiOrderedSectionKeys,
  summarizeMbtiProfileSeedKey,
  summarizeMbtiRecommendationEffectWeights,
  summarizeMbtiRecommendationPriorityKeys,
  summarizeMbtiRecommendationSelectionKeys,
  summarizeMbtiActionSelectionKeys,
  summarizeMbtiSceneFingerprint,
  summarizeMbtiSectionSelectionKeys,
  summarizeMbtiSelectionFingerprint,
  summarizeMbtiSameTypeDivergenceKeys,
  summarizeMbtiSecondaryFocusKeys,
  summarizeMbtiSectionHistoryKeys,
  summarizeMbtiUserState,
  summarizeMbtiVariantKeys,
  summarizeMbtiResumeBiasKeys,
} from "@/lib/mbti/personalizationTelemetry";

type ChapterKey = "career" | "growth" | "traits" | "relationships";

type ChapterBridgeItem = {
  title: string;
  description: string;
};

type BulletItem = {
  title?: string;
  body?: string | null;
  description?: string | null;
  summary?: string | null;
};

type LettersIntroLetter = {
  letter: string;
  title: string;
  description: string;
};

type PreferredRoleGroup = {
  groupTitle: string;
  description: string;
  examples: string[];
};

type ProjectionContentBlock = {
  id: string;
  kind: string;
  label: string;
  text: string;
  contrastKey: string;
};

type CrossAssessmentSectionEnhancement = MbtiCrossAssessmentSectionEnhancementViewModel;

const EXPLAINABILITY_SECTION_KEYS = new Set([
  "traits.why_this_type",
  "traits.close_call_axes",
  "traits.adjacent_type_contrast",
  "growth.stability_confidence",
]);

const ACTION_SECTION_KEYS = new Set([
  "growth.next_actions",
  "growth.weekly_experiments",
  "relationships.try_this_week",
  "career.work_experiments",
  "growth.watchouts",
]);

type MbtiChapterSectionProps = {
  locale: Locale;
  attemptId: string;
  chapterKey: ChapterKey;
  legacySection?: ReportSection | null;
  projectionSections: MbtiResultProjectionSectionViewModel[];
  projectionDimensions: MbtiPublicProjectionDimensionViewModel[];
  globalTraits: TraitBridgeItem[];
  unlock: MbtiSectionUnlock | null;
  previewSection?: MbtiPreviewSectionViewModel | null;
  identityLayer?: ReportIdentityLayer | null;
  personalization?: MbtiResultPersonalizationViewModel | null;
  primaryFocusKey?: string;
};

const CHAPTER_COPY: Record<
  ChapterKey,
  {
    anchor: string;
    order: number;
    title: { en: string; zh: string };
    intro: { en: string; zh: string };
    summaryLine: { en: string; zh: string };
  }
> = {
  career: {
    anchor: "career",
    order: 2,
    title: { en: "Career path", zh: "职业路径" },
    intro: {
      en: "This chapter turns the result into role fit, work rhythm, and the environments where you are more likely to do strong work.",
      zh: "这一章把结果翻译成更具体的岗位方向、协作节奏与更适合你的工作环境。",
    },
    summaryLine: {
      en: "Read the scenario fit first, then check where behavior can break and what to adjust.",
      zh: "先看职业场景匹配，再确认行为容易失衡的边界并找到调整方向。",
    },
  },
  growth: {
    anchor: "growth",
    order: 3,
    title: { en: "Growth edges", zh: "成长提示" },
    intro: {
      en: "Growth is framed as leverage, friction, and the next repeatable step instead of abstract advice.",
      zh: "这一章不讲空泛建议，而是把你的成长重点拆成杠杆、阻力和下一步动作。",
    },
    summaryLine: {
      en: "One repeatable insight at a time to upgrade execution and reduce friction.",
      zh: "按一个可复用观点推进，逐步把成长动作从想法变成执行。",
    },
  },
  traits: {
    anchor: "traits",
    order: 1,
    title: { en: "Personality overview", zh: "人格概览" },
    intro: {
      en: "Read this chapter as the structural overview of how your current type tends to show up in everyday situations.",
      zh: "把这一章看作整份报告的总览层，用来理解你的类型在日常场景里通常会怎么出现。",
    },
    summaryLine: {
      en: "Keep the mental model short and map each signal back to real situations.",
      zh: "先建立清晰心智模型，再把每个信号对齐到真实场景。",
    },
  },
  relationships: {
    anchor: "relationships",
    order: 4,
    title: { en: "Relationships", zh: "人际与亲密关系" },
    intro: {
      en: "This chapter connects the result to communication needs, boundaries, and the moments where misunderstanding is most likely.",
      zh: "这一章把结果落到沟通需求、边界感和最容易出现误解的相处场景上。",
    },
    summaryLine: {
      en: "Use one boundary rule per cycle, and track communication recovery.",
      zh: "每个周期先锁定一个边界规则，再持续跟进沟通修复。",
    },
  },
};

const PROJECTION_SECTION_TITLES: Record<string, { zh: string; en: string }> = {
  "trait_overview": { zh: "维度总览", en: "Trait overview" },
  "letters_intro": { zh: "字母拆解", en: "Letter-by-letter introduction" },
  "overview": { zh: "类型骨架", en: "Overview" },
  "traits.why_this_type": { zh: "为什么会落在这个类型", en: "Why this type" },
  "traits.close_call_axes": { zh: "边界轴解释", en: "Closest-call axes" },
  "traits.adjacent_type_contrast": { zh: "相邻类型对照", en: "Why you can resemble a nearby type" },
  "traits.decision_style": { zh: "决策风格", en: "Decision style" },
  "career.summary": { zh: "职业映射总览", en: "Career summary" },
  "career.work_experiments": { zh: "工作实验", en: "Work experiments" },
  "career.work_environment": { zh: "工作环境匹配", en: "Work environment" },
  "career.collaboration_fit": { zh: "协作匹配", en: "Collaboration fit" },
  "career.advantages": { zh: "职业优势", en: "Career advantages" },
  "career.weaknesses": { zh: "职业风险", en: "Career weaknesses" },
  "career.preferred_roles": { zh: "偏好岗位簇", en: "Preferred roles" },
  "career.next_step": { zh: "下一步职业动作", en: "Career next step" },
  "career.upgrade_suggestions": { zh: "升级建议", en: "Upgrade suggestions" },
  "growth.summary": { zh: "成长总览", en: "Growth summary" },
  "growth.stability_confidence": { zh: "稳定度与置信区间", en: "Stability confidence" },
  "growth.next_actions": { zh: "下一步动作", en: "Next actions" },
  "growth.weekly_experiments": { zh: "本周实验", en: "Weekly experiments" },
  "growth.strengths": { zh: "成长杠杆", en: "Growth strengths" },
  "growth.weaknesses": { zh: "成长阻力", en: "Growth weaknesses" },
  "growth.stress_recovery": { zh: "压力与恢复", en: "Stress recovery" },
  "growth.watchouts": { zh: "风险提醒", en: "Watchouts" },
  "growth.motivators": { zh: "驱动因素", en: "Motivators" },
  "growth.drainers": { zh: "消耗因素", en: "Drainers" },
  "relationships.summary": { zh: "关系总览", en: "Relationships summary" },
  "relationships.strengths": { zh: "关系优势", en: "Relationships strengths" },
  "relationships.weaknesses": { zh: "关系风险", en: "Relationships weaknesses" },
  "relationships.communication_style": { zh: "沟通与协作", en: "Communication and collaboration" },
  "relationships.try_this_week": { zh: "本周关系动作", en: "Try this week" },
  "relationships.rel_advantages": { zh: "关系优势场景", en: "Relationship advantages" },
  "relationships.rel_risks": { zh: "关系风险场景", en: "Relationship risks" },
};

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function resolveBody(block: ReportBlock): string {
  const bullets = Array.isArray(block.bullets) ? block.bullets.filter((item): item is string => Boolean(item)) : [];
  return normalizeText(block.body, bullets[0]);
}

function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return Array.from(new Set(values.map((value) => normalizeText(value)).filter(Boolean)));
}

function resolveModuleLabel(moduleCode: string, locale: Locale): string {
  const normalized = moduleCode.trim().toLowerCase();
  const labels: Record<string, { zh: string; en: string }> = {
    core_free: { zh: "结果摘要", en: "Result summary" },
    core_full: { zh: "完整人格判读", en: "Full personality reading" },
    career: { zh: "职业映射", en: "Career mapping" },
    relationships: { zh: "关系映射", en: "Relationship mapping" },
  };

  return labels[normalized]?.[locale] ?? moduleCode;
}

function toProjectionSectionTestId(key: string): string {
  return key.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

function normalizeProjectionContentBlocks(
  section: MbtiResultProjectionSectionViewModel
): ProjectionContentBlock[] {
  const payload = asRecord(section.payload);
  const blocks = asArray<Record<string, unknown>>(payload?.blocks)
    .map((block, index) => ({
      id: normalizeText(block.id, `${section.key}-block-${index + 1}`),
      kind: normalizeText(block.kind, "rich_text"),
      label: normalizeText(block.label),
      text: normalizeText(block.text, block.body, block.description),
      contrastKey: normalizeText(block.contrast_key),
    }))
    .filter((block) => block.id && block.text);

  if (blocks.length === 0) {
    return [];
  }

  const selectedBlockIds = section.selectedBlocks.filter(Boolean);
  if (selectedBlockIds.length === 0) {
    return blocks;
  }

  const blockMap = new Map(blocks.map((block) => [block.id, block] as const));
  const typeSkeletonBlocks = blocks.filter((block) => block.kind === "type_skeleton");
  const selectedBlocks = selectedBlockIds
    .map((blockId) => blockMap.get(blockId))
    .filter((block): block is ProjectionContentBlock => Boolean(block));

  if (selectedBlocks.length === 0) {
    return blocks;
  }

  return [...typeSkeletonBlocks, ...selectedBlocks];
}

function resolveProjectionSectionTitle(section: MbtiResultProjectionSectionViewModel, locale: Locale): string {
  const localized = PROJECTION_SECTION_TITLES[section.key];
  if (localized) {
    return localized[locale];
  }

  return section.title;
}

function resolveProjectionSectionTone(
  section: MbtiResultProjectionSectionViewModel,
  locale: Locale
) {
  if (ACTION_SECTION_KEYS.has(section.key)) {
    return {
      label: locale === "zh" ? "行动坐标" : "Action coordinate",
      classes: "border-emerald-200 bg-emerald-50/70",
    };
  }

  if (EXPLAINABILITY_SECTION_KEYS.has(section.key)) {
    return {
      label: locale === "zh" ? "解释层" : "Explanation layer",
      classes: "border-sky-200 bg-sky-50/70",
    };
  }

  return {
    label: locale === "zh" ? "判读层" : "Reading layer",
    classes: "border-slate-200 bg-slate-50/70",
  };
}

function ProjectionFeedbackButtons({
  locale,
  isActionSection,
  onPositive,
  onNegative,
}: {
  locale: Locale;
  isActionSection: boolean;
  onPositive: () => void;
  onNegative: () => void;
}) {
  const [selection, setSelection] = useState<"positive" | "negative" | null>(null);

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      <button
        type="button"
        aria-pressed={selection === "positive"}
        className={`rounded-full border px-3 py-1 text-xs font-medium transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
          selection === "positive"
            ? "border-slate-950 bg-slate-950 text-white"
            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
        }`}
        onClick={() => {
          setSelection("positive");
          onPositive();
        }}
      >
        {isActionSection
          ? locale === "zh"
            ? "这条建议有帮助"
            : "This helps"
          : locale === "zh"
            ? "解释很像我"
            : "This fits me"}
      </button>
      <button
        type="button"
        aria-pressed={selection === "negative"}
        className={`rounded-full border px-3 py-1 text-xs font-medium transition motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${
          selection === "negative"
            ? "border-slate-950 bg-slate-950 text-white"
            : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
        }`}
        onClick={() => {
          setSelection("negative");
          onNegative();
        }}
      >
        {isActionSection
          ? locale === "zh"
            ? "这条暂时不适合"
            : "Not for now"
          : locale === "zh"
            ? "这块还不够像"
            : "This misses me"}
      </button>
    </div>
  );
}

function renderProjectionDynamicBlocks(section: MbtiResultProjectionSectionViewModel) {
  const blocks = normalizeProjectionContentBlocks(section);
  if (blocks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {blocks.map((block) => (
        <div
          key={block.id}
          data-testid={`mbti-projection-block-${toProjectionSectionTestId(block.id)}`}
          data-block-kind={block.kind}
          data-contrast-key={block.contrastKey || undefined}
          className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
        >
          {block.label ? (
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {block.label}
            </p>
          ) : null}
          <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {block.text}
          </p>
        </div>
      ))}
    </div>
  );
}

function renderCrossAssessmentEnhancement(
  enhancement: CrossAssessmentSectionEnhancement | null
) {
  if (!enhancement || (!enhancement.title && !enhancement.body)) {
    return null;
  }

  return (
    <div
      data-testid={`mbti-cross-assessment-${toProjectionSectionTestId(enhancement.sectionKey)}`}
      data-synthesis-key={enhancement.synthesisKey || undefined}
      data-supporting-scale={enhancement.supportingScale || undefined}
      className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4"
    >
      {enhancement.title ? (
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-indigo-700">
          {enhancement.title}
        </p>
      ) : null}
      {enhancement.body ? (
        <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {enhancement.body}
        </p>
      ) : null}
    </div>
  );
}

function renderCulturalCalibrationEnhancement(
  enhancement: CulturalCalibrationSectionViewModel | null,
  calibrationFingerprint: string
) {
  if (!enhancement || (!enhancement.title && !enhancement.body)) {
    return null;
  }

  return (
    <div
      data-testid={`mbti-cultural-calibration-${toProjectionSectionTestId(enhancement.sectionKey)}`}
      data-calibration-fingerprint={calibrationFingerprint || undefined}
      className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4"
    >
      {enhancement.title ? (
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700">
          {enhancement.title}
        </p>
      ) : null}
      {enhancement.body ? (
        <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-slate-700">
          {enhancement.body}
        </p>
      ) : null}
    </div>
  );
}

function buildSectionTelemetryPayload(
  section: MbtiResultProjectionSectionViewModel,
  locale: Locale,
  personalization?: MbtiResultPersonalizationViewModel | null,
  options?: {
    attemptId?: string;
    displayOrder?: number;
    isPrimaryFocus?: boolean;
  }
) {
  const payload = asRecord(section.payload);
  const personalizationPayload = asRecord(payload?.personalization);
  const overviewVariantKey =
    normalizeText(personalization?.variantKeys.overview, section.variantKey) || section.variantKey;
  const actionKey = normalizeText(personalizationPayload?.action_key);
  const orderedActionKeys = personalization?.orderedActionKeys ?? [];
  const actionRank = actionKey ? orderedActionKeys.findIndex((key) => key === actionKey) + 1 : 0;
  const crossAssessment = personalization?.crossAssessment ?? null;
  const enhancement = crossAssessment?.sectionEnhancements?.[section.key] ?? null;
  const culturalCalibration = personalization?.culturalCalibration ?? null;

  return {
    slug: "mbti-result-shell",
    scale_code: "MBTI",
    visual_kind: `mbti_section_${section.key}`,
    attempt_id: normalizeText(options?.attemptId),
    sectionKey: section.key,
    sceneKey: normalizeText(personalizationPayload?.scene_key, section.key.split(".")[0]),
    styleKey: normalizeText(personalizationPayload?.style_key),
    actionKey,
    actionRank,
    synthesisKey: normalizeText(enhancement?.synthesisKey),
    supportingScale: normalizeText(enhancement?.supportingScale),
    crossAssessmentVersion: normalizeText(crossAssessment?.version),
    localeContext: normalizeText(culturalCalibration?.localeContext),
    culturalContext: normalizeText(culturalCalibration?.culturalContext),
    calibratedSectionKeys: culturalCalibration?.calibratedSectionKeys.join("|") ?? "",
    calibrationFingerprint: normalizeText(culturalCalibration?.calibrationFingerprint),
    calibrationContractVersion: normalizeText(culturalCalibration?.calibrationContractVersion),
    variantKey: normalizeText(section.variantKey),
    sectionSelectionKey: normalizeText(
      section.sectionSelectionKey,
      personalization?.sectionSelectionKeys?.[section.key]
    ),
    selectedBlocks: section.selectedBlocks.join("|"),
    profileSeedKey: summarizeMbtiProfileSeedKey(personalization),
    sameTypeDivergenceKeys: summarizeMbtiSameTypeDivergenceKeys(personalization),
    sectionSelectionKeys: summarizeMbtiSectionSelectionKeys(personalization),
    actionSelectionKeys: summarizeMbtiActionSelectionKeys(personalization),
    recommendationSelectionKeys: summarizeMbtiRecommendationSelectionKeys(personalization),
    selectionFingerprint: summarizeMbtiSelectionFingerprint(personalization),
    memoryContractVersion: summarizeMbtiMemoryContractVersion(personalization),
    memoryFingerprint: summarizeMbtiMemoryFingerprint(personalization),
    memoryScope: summarizeMbtiMemoryScope(personalization),
    memoryState: summarizeMbtiMemoryState(personalization),
    memoryProgressionState: summarizeMbtiMemoryProgressionState(personalization),
    sectionHistoryKeys: summarizeMbtiSectionHistoryKeys(personalization),
    behaviorDeltaKeys: summarizeMbtiBehaviorDeltaKeys(personalization),
    dominantInterestKeys: summarizeMbtiDominantInterestKeys(personalization),
    resumeBiasKeys: summarizeMbtiResumeBiasKeys(personalization),
    memoryRewriteKeys: summarizeMbtiMemoryRewriteKeys(personalization),
    memoryRewriteReason: summarizeMbtiMemoryRewriteReason(personalization),
    adaptiveContractVersion: summarizeMbtiAdaptiveContractVersion(personalization),
    adaptiveFingerprint: summarizeMbtiAdaptiveFingerprint(personalization),
    selectionRewriteReason: summarizeMbtiAdaptiveRewriteReason(personalization),
    contentFeedbackWeights: summarizeMbtiContentFeedbackWeights(personalization),
    actionEffectWeights: summarizeMbtiActionEffectWeights(personalization),
    recommendationEffectWeights: summarizeMbtiRecommendationEffectWeights(personalization),
    ctaEffectWeights: summarizeMbtiCtaEffectWeights(personalization),
    nextBestActionKey: summarizeMbtiNextBestActionKey(personalization),
    nextBestActionSection: summarizeMbtiNextBestActionSection(personalization),
    nextBestActionReason: summarizeMbtiNextBestActionReason(personalization),
    contrastKey: normalizeText(
      personalizationPayload?.contrast_key,
      personalization?.contrastKeys?.[section.key]
    ),
    neighborTypeKeys: summarizeMbtiNeighborTypeKeys(personalization),
    closeCallAxes: summarizeMbtiCloseCallAxes(personalization),
    variantKeys: summarizeMbtiVariantKeys(personalization),
    sceneFingerprint: summarizeMbtiSceneFingerprint(personalization),
    boundaryFlags: summarizeMbtiBoundaryFlags(personalization),
    axisBands: summarizeMbtiAxisBands(personalization),
    typeCode: normalizeText(personalization?.typeCode),
    identity: normalizeText(personalization?.identity),
    packId: normalizeText(personalization?.packId),
    engineVersion: normalizeText(personalization?.engineVersion),
    userState: summarizeMbtiUserState(personalization),
    feedbackSentiment: summarizeMbtiFeedbackSentiment(personalization),
    feedbackCoverage: summarizeMbtiFeedbackCoverage(personalization),
    actionCompletionTendency: summarizeMbtiActionCompletionTendency(personalization),
    lastDeepReadSection: summarizeMbtiLastDeepReadSection(personalization),
    currentIntentCluster: summarizeMbtiCurrentIntentCluster(personalization),
    primaryFocusKey: normalizeText(personalization?.orchestration?.primaryFocusKey),
    secondaryFocusKeys: summarizeMbtiSecondaryFocusKeys(personalization),
    orderedSectionKeys: summarizeMbtiOrderedSectionKeys(personalization),
    orderedRecommendationKeys: summarizeMbtiOrderedRecommendationKeys(personalization),
    orderedActionKeys: summarizeMbtiOrderedActionKeys(personalization),
    recommendationPriorityKeys: summarizeMbtiRecommendationPriorityKeys(personalization),
    actionPriorityKeys: summarizeMbtiActionPriorityKeys(personalization),
    readingFocusKey: normalizeText(personalization?.readingFocusKey),
    actionFocusKey: normalizeText(personalization?.actionFocusKey),
    careerFocusKey: normalizeText(personalization?.workingLife?.careerFocusKey),
    careerJourneyKeys: summarizeMbtiCareerJourneyKeys(personalization),
    careerActionPriorityKeys: summarizeMbtiCareerActionPriorityKeys(personalization),
    careerReadingKeys: summarizeMbtiCareerReadingKeys(personalization),
    ctaPriorityKeys: summarizeMbtiCtaPriorityKeys(personalization),
    carryoverFocusKey: normalizeText(personalization?.continuity?.carryoverFocusKey),
    carryoverReason: normalizeText(personalization?.continuity?.carryoverReason),
    recommendedResumeKeys: summarizeMbtiCarryoverResumeKeys(personalization),
    carryoverSceneKeys: summarizeMbtiCarryoverSceneKeys(personalization),
    carryoverActionKeys: summarizeMbtiCarryoverActionKeys(personalization),
    displayOrder: options?.displayOrder ?? 0,
    isPrimaryFocus: options?.isPrimaryFocus === true,
    overviewVariantKey,
    locale,
  };
}

function parseIdentityBullet(
  bullet: string,
  locale: Locale,
  index: number
): ChapterBridgeItem | null {
  const normalized = normalizeText(bullet);
  if (!normalized) {
    return null;
  }

  const separatorIndex = normalized.search(/[:：]/);
  const candidateTitle =
    separatorIndex > 0 && separatorIndex < 12 ? normalizeText(normalized.slice(0, separatorIndex)) : "";
  const candidateDescription =
    separatorIndex > 0 && separatorIndex < normalized.length - 1
      ? normalizeText(normalized.slice(separatorIndex + 1))
      : "";

  return {
    title: candidateTitle || (locale === "zh" ? `人格线索 ${index + 1}` : `Identity cue ${index + 1}`),
    description: candidateDescription || normalized,
  };
}

function buildBridgeItems(
  chapterKey: ChapterKey,
  legacySection: ReportSection | null,
  unlock: MbtiSectionUnlock | null,
  globalTraits: TraitBridgeItem[],
  locale: Locale,
  hasPreviewContent: boolean,
  identityLayer?: ReportIdentityLayer | null
): ChapterBridgeItem[] {
  const items: ChapterBridgeItem[] = [];
  const seen = new Set<string>();
  const blocks = Array.isArray(legacySection?.blocks) ? legacySection.blocks : [];

  const pushItem = (item: ChapterBridgeItem | null) => {
    if (!item?.title || !item.description) {
      return;
    }

    const key = `${item.title.toLowerCase()}::${item.description.toLowerCase()}`;
    if (seen.has(key)) {
      return;
    }

    seen.add(key);
    items.push(item);
  };

  if (chapterKey === "traits" && identityLayer) {
    for (const [index, bullet] of normalizeStringArray(identityLayer.bullets).entries()) {
      pushItem(parseIdentityBullet(bullet, locale, index));
      if (items.length >= 4) {
        return items.slice(0, 4);
      }
    }
  }

  for (const block of blocks) {
    const accessLevel = normalizeText(block.access_level).toLowerCase();
    if (accessLevel === "paid") {
      continue;
    }

    pushItem({
      title: normalizeText(block.title),
      description: resolveBody(block),
    });

    if (items.length >= 4) {
      return items.slice(0, 4);
    }
  }

  if (!hasPreviewContent) {
    for (const benefit of unlock?.benefits ?? []) {
      pushItem({
        title: locale === "zh" ? "解锁后重点" : "Unlock focus",
        description: normalizeText(benefit),
      });

      if (items.length >= 4) {
        return items.slice(0, 4);
      }
    }
  }

  for (const trait of globalTraits) {
    pushItem({
      title: trait.title,
      description: trait.description,
    });

    if (items.length >= 4) {
      return items.slice(0, 4);
    }
  }

  return items.slice(0, 4);
}

function renderPlainMarkdown(body: string) {
  if (!body.trim()) {
    return null;
  }

  return <p className="m-0 whitespace-pre-wrap text-sm leading-7 text-slate-700">{body}</p>;
}

function renderBulletItems(items: BulletItem[]) {
  const visibleItems = items
    .map((item) => ({
      title: normalizeText(item.title),
      body: normalizeText(item.body ?? item.description ?? item.summary),
    }))
    .filter((item) => item.title || item.body);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <ul className="m-0 space-y-2 pl-5 text-sm leading-7 text-slate-700">
      {visibleItems.map((item, index) => {
        const label = item.title || item.body;
        if (!label) {
          return null;
        }

        return (
          <li key={`${label}-${index}`}>
            <span className="font-semibold text-slate-900">{item.title || label}</span>
            {item.body && item.body !== item.title ? <span className="text-slate-600"> - {item.body}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}

function renderProjectionBulletsSection(section: MbtiResultProjectionSectionViewModel) {
  const payload = asRecord(section.payload);
  const items = asArray<BulletItem>(payload?.items);
  const bulletItems = renderBulletItems(items);
  if (bulletItems) {
    return bulletItems;
  }

  const fallbackItems = [
    ...normalizeStringArray(payload?.bullets).map((item) => ({ title: item })),
    ...section.bodyMd
      .split("\n")
      .map((item) => item.replace(/^[\-\*\d\.\s]+/, "").trim())
      .filter(Boolean)
      .map((item) => ({ title: item })),
  ];

  return renderBulletItems(fallbackItems);
}

function renderProjectionRichTextBlocks(section: MbtiResultProjectionSectionViewModel) {
  const blocks = renderProjectionDynamicBlocks(section);
  if (!blocks) {
    return renderPlainMarkdown(section.bodyMd);
  }

  return blocks;
}

function renderLettersIntroSection(section: MbtiResultProjectionSectionViewModel) {
  const payload = asRecord(section.payload);
  const headline = normalizeText(payload?.headline, section.bodyMd);
  const letters = asArray<Record<string, unknown>>(payload?.letters)
    .map((item) => ({
      letter: normalizeText(item.letter) || "?",
      title: normalizeText(item.title, item.letter),
      description: normalizeText(item.description),
    }))
    .filter((item) => item.title || item.description) as LettersIntroLetter[];

  if (letters.length === 0) {
    return renderPlainMarkdown(section.bodyMd);
  }

  return (
    <div className="space-y-4">
      {headline ? <p className="m-0 leading-7 text-slate-700">{headline}</p> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {letters.map((item, index) => (
          <article
            key={`${item.letter}-${index}`}
            className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-semibold text-emerald-700">
                {item.letter}
              </div>
              <div className="space-y-1">
                {item.title ? <p className="m-0 font-semibold text-slate-900">{item.title}</p> : null}
                {item.description ? <p className="m-0 text-sm leading-7 text-slate-600">{item.description}</p> : null}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function normalizeFallbackTraitDimensions(
  payload: Record<string, unknown> | null
): MbtiPublicProjectionDimensionViewModel[] {
  return asArray<Record<string, unknown>>(payload?.dimensions)
    .map((item) => ({
      code: normalizeText(item.code, item.id).toUpperCase(),
      label: normalizeText(item.label, item.name, item.id, item.code),
      percent:
        typeof item.pct === "number"
          ? item.pct
          : typeof item.score_pct === "number"
            ? item.score_pct
            : typeof item.value_pct === "number"
              ? item.value_pct
              : 0,
      side: normalizeText(item.side),
      sideLabel: normalizeText(item.side_label, item.sideLabel),
      state: normalizeText(item.state),
      summary: normalizeText(item.summary, item.description),
    }))
    .filter((item) => item.code || item.label);
}

function renderTraitDimensionGridSection(
  section: MbtiResultProjectionSectionViewModel,
  projectionDimensions: MbtiPublicProjectionDimensionViewModel[]
) {
  const payload = asRecord(section.payload);
  const summary = normalizeText(payload?.summary, section.bodyMd);
  const dimensions = projectionDimensions.length > 0
    ? projectionDimensions
    : normalizeFallbackTraitDimensions(payload);

  if (dimensions.length === 0) {
    return renderPlainMarkdown(section.bodyMd);
  }

  return (
    <div className="space-y-4">
      {summary ? <p className="m-0 leading-7 text-slate-700">{summary}</p> : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {dimensions.map((dimension) => (
          <article
            key={dimension.code}
            className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="m-0 font-semibold text-slate-900">{dimension.label || dimension.code}</p>
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  {dimension.code}
                </span>
              </div>
              {dimension.sideLabel ? (
                <p className="m-0 text-xs uppercase tracking-[0.12em] text-slate-500">{dimension.sideLabel}</p>
              ) : null}
              {dimension.summary ? <p className="m-0 text-sm leading-7 text-slate-700">{dimension.summary}</p> : null}
              {typeof dimension.percent === "number" ? (
                <p className="m-0 text-sm font-medium text-slate-900">{Math.round(dimension.percent)}%</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function renderPreferredRoleListSection(section: MbtiResultProjectionSectionViewModel) {
  const payload = asRecord(section.payload);
  const groups = asArray<Record<string, unknown>>(payload?.groups)
    .map((group) => ({
      groupTitle: normalizeText(group.groupTitle, group.group_title, group.title),
      description: normalizeText(group.description),
      examples: normalizeStringArray(group.examples),
    }))
    .filter((group) => group.groupTitle || group.description || group.examples.length > 0) as PreferredRoleGroup[];

  const fallbackExamples = asArray<Record<string, unknown>>(payload?.items)
    .map((item) => normalizeText(item.title, item.name))
    .filter(Boolean);
  const visibleGroups = groups.length > 0
    ? groups
    : fallbackExamples.length > 0
      ? [{ groupTitle: "", description: "", examples: fallbackExamples }]
      : [];

  if (visibleGroups.length === 0) {
    return renderPlainMarkdown(section.bodyMd);
  }

  return (
    <div className="space-y-4">
      {normalizeText(payload?.title) ? <p className="m-0 font-medium text-slate-900">{normalizeText(payload?.title)}</p> : null}
      {normalizeText(payload?.intro) ? <p className="m-0 leading-7 text-slate-700">{normalizeText(payload?.intro)}</p> : null}
      <div className="grid gap-3 lg:grid-cols-2">
        {visibleGroups.map((group, index) => (
          <article
            key={`${group.groupTitle || "roles"}-${index}`}
            className="rounded-2xl border border-slate-200 bg-slate-50/90 p-4"
          >
            <div className="space-y-3">
              {group.groupTitle ? <p className="m-0 font-semibold text-slate-900">{group.groupTitle}</p> : null}
              {group.description ? <p className="m-0 text-sm leading-7 text-slate-600">{group.description}</p> : null}
              {group.examples.length > 0 ? (
                <ul className="m-0 space-y-2 pl-5 text-sm leading-7 text-slate-700">
                  {group.examples.map((example) => (
                    <li key={example}>
                      <span className="font-medium text-slate-900">{example}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function renderChapterVisualSlot(
  chapterKey: ChapterKey,
  locale: Locale,
  projectionSections: MbtiResultProjectionSectionViewModel[]
) {
  const toneMap: Record<ChapterKey, { zh: string; en: string }> = {
    traits: { zh: "人格骨架", en: "Type structure" },
    career: { zh: "职业映射", en: "Career mapping" },
    growth: { zh: "成长坐标", en: "Growth coordinates" },
    relationships: { zh: "关系映射", en: "Relationship mapping" },
  };
  const previewLabel = projectionSections.length > 0
    ? locale === "zh"
      ? "当前可见模块"
      : "Visible modules"
    : locale === "zh"
      ? "当前阅读层"
      : "Current layer";
  const layerLabel = chapterKey === "traits"
    ? locale === "zh"
      ? "骨架 / 边界 /决策"
      : "Structure / boundary / decision"
    : chapterKey === "career"
      ? locale === "zh"
        ? "环境 / 协作 /岗位"
        : "Environment / collaboration / roles"
      : chapterKey === "growth"
        ? locale === "zh"
          ? "阻力 / 恢复 /行动"
          : "Friction / recovery / action"
        : locale === "zh"
          ? "需求 / 边界 /修复"
          : "Needs / boundary / repair";

  return (
    <div className="overflow-hidden rounded-[26px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(241,245,249,0.96)_34%,rgba(236,253,245,0.88)_100%)] p-5 shadow-[0_18px_42px_rgba(15,23,42,0.08)]">
      <div className="pointer-events-none mb-5 h-px w-full bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            {locale === "zh" ? "章节坐标" : "Chapter coordinates"}
          </p>
          <p className="m-0 text-base font-semibold text-slate-950">{toneMap[chapterKey][locale]}</p>
          <p className="m-0 max-w-xl text-sm leading-6 text-slate-600">{layerLabel}</p>
        </div>
        <div className="rounded-2xl border border-white/80 bg-white/90 px-3 py-2 text-right shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
          <p className="m-0 text-[11px] uppercase tracking-[0.14em] text-slate-400">{previewLabel}</p>
          <p className="m-0 mt-1 text-base font-semibold text-slate-950">{projectionSections.length}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {projectionSections.slice(0, 3).map((section) => (
          <div key={section.key} className="rounded-2xl border border-slate-200 bg-white/90 px-3 py-3 shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {resolveProjectionSectionTone(section, locale).label}
            </p>
            <p className="m-0 mt-1 text-sm font-medium text-slate-900">{resolveProjectionSectionTitle(section, locale)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderPremiumTeaserSection(
  section: MbtiResultProjectionSectionViewModel,
  locale: Locale
) {
  const payload = asRecord(section.payload);
  const teaser = normalizeText(payload?.teaser, payload?.summary, section.bodyMd);
  if (!teaser) {
    return null;
  }

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50/90 p-4">
      <p className="m-0 text-sm leading-7 text-slate-700">{teaser}</p>
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
        {locale === "zh" ? "正式版预告" : "Premium section preview"}
      </p>
      <p className="m-0 text-sm text-slate-600">
        {locale === "zh" ? "完整章节会在正式解锁后开放。" : "Unlock the full section in the premium experience."}
      </p>
    </div>
  );
}

function buildPreviewSection(
  chapterKey: ChapterKey,
  locale: Locale,
  previewCards: MbtiPreviewCardViewModel[]
): ReportSection {
  return {
    key: `${chapterKey}-preview`,
    title: locale === "zh" ? "当前已开放的预览内容" : "Preview cards currently visible",
    access_level: "preview",
    module_code: chapterKey,
    blocks: previewCards.map((card) => ({
      id: card.id,
      kind: "card",
      title: card.title,
      body: card.body,
      bullets: card.bullets,
      tips: card.tips,
      tags: card.tags,
      access_level: card.accessLevel,
      module_code: card.moduleCode,
    })),
  };
}

function renderProjectionSection(
  section: MbtiResultProjectionSectionViewModel,
  locale: Locale,
  projectionDimensions: MbtiPublicProjectionDimensionViewModel[],
  personalization?: MbtiResultPersonalizationViewModel | null,
  options?: {
    attemptId?: string;
    displayOrder?: number;
    isPrimaryFocus?: boolean;
  }
) {
  let content: ReactNode = null;
  const telemetryPayload = buildSectionTelemetryPayload(section, locale, personalization, options);
  const buildAccuracyFeedbackPayload = (feedback: string) => ({
    feedback,
    sectionKey: section.key,
    actionKey: telemetryPayload.actionKey,
    actionRank: telemetryPayload.actionRank,
    contrastKey: telemetryPayload.contrastKey,
    neighborTypeKeys: telemetryPayload.neighborTypeKeys,
    closeCallAxes: telemetryPayload.closeCallAxes,
    typeCode: telemetryPayload.typeCode,
    identity: telemetryPayload.identity,
    variantKeys: telemetryPayload.variantKeys,
    sceneFingerprint: telemetryPayload.sceneFingerprint,
    boundaryFlags: telemetryPayload.boundaryFlags,
    axisBands: telemetryPayload.axisBands,
    packId: telemetryPayload.packId,
    engineVersion: telemetryPayload.engineVersion,
    userState: telemetryPayload.userState,
    primaryFocusKey: telemetryPayload.primaryFocusKey,
    secondaryFocusKeys: telemetryPayload.secondaryFocusKeys,
    orderedSectionKeys: telemetryPayload.orderedSectionKeys,
    orderedRecommendationKeys: telemetryPayload.orderedRecommendationKeys,
    orderedActionKeys: telemetryPayload.orderedActionKeys,
    recommendationPriorityKeys: telemetryPayload.recommendationPriorityKeys,
    actionPriorityKeys: telemetryPayload.actionPriorityKeys,
    readingFocusKey: telemetryPayload.readingFocusKey,
    actionFocusKey: telemetryPayload.actionFocusKey,
    ctaPriorityKeys: telemetryPayload.ctaPriorityKeys,
    carryoverFocusKey: telemetryPayload.carryoverFocusKey,
    carryoverReason: telemetryPayload.carryoverReason,
    recommendedResumeKeys: telemetryPayload.recommendedResumeKeys,
    carryoverSceneKeys: telemetryPayload.carryoverSceneKeys,
    carryoverActionKeys: telemetryPayload.carryoverActionKeys,
    displayOrder: telemetryPayload.displayOrder,
    isPrimaryFocus: telemetryPayload.isPrimaryFocus,
    locale,
  });

  switch (section.render) {
    case "letters_intro":
      content = renderLettersIntroSection(section);
      break;
    case "trait_dimension_grid":
      content = renderTraitDimensionGridSection(section, projectionDimensions);
      break;
    case "preferred_role_list":
      content = renderPreferredRoleListSection(section);
      break;
    case "premium_teaser":
      content = renderPremiumTeaserSection(section, locale);
      break;
    case "bullets":
      content = renderProjectionBulletsSection(section);
      break;
    case "rich_text":
    default:
      content = renderProjectionRichTextBlocks(section);
      break;
  }

  const dynamicBlocks =
    section.render === "rich_text" ? null : renderProjectionDynamicBlocks(section);
  const crossAssessmentEnhancement = personalization?.crossAssessment?.sectionEnhancements?.[section.key] ?? null;
  const crossAssessmentContent = renderCrossAssessmentEnhancement(crossAssessmentEnhancement);
  const culturalCalibrationEnhancement =
    personalization?.culturalCalibration?.sectionOverrides?.[section.key] ?? null;
  const culturalCalibrationContent = renderCulturalCalibrationEnhancement(
    culturalCalibrationEnhancement,
    normalizeText(personalization?.culturalCalibration?.calibrationFingerprint)
  );

  if (content && dynamicBlocks) {
    content = (
      <div className="space-y-4">
        {content}
        {dynamicBlocks}
      </div>
    );
  }

  if (content && crossAssessmentContent) {
    content = (
      <div className="space-y-4">
        {content}
        {crossAssessmentContent}
      </div>
    );
  }

  if (content && culturalCalibrationContent) {
    content = (
      <div className="space-y-4">
        {content}
        {culturalCalibrationContent}
      </div>
    );
  }

  if (!content) {
    return null;
  }

  const isExplainabilitySection = EXPLAINABILITY_SECTION_KEYS.has(section.key);
  const isActionSection = ACTION_SECTION_KEYS.has(section.key);
  const tone = resolveProjectionSectionTone(section, locale);

  return (
    <article
      key={section.key}
      data-testid={`mbti-projection-section-${toProjectionSectionTestId(section.key)}`}
      data-section-key={section.key}
      data-variant-key={section.variantKey || undefined}
      data-section-selection-key={normalizeText(telemetryPayload.sectionSelectionKey) || undefined}
      data-selected-blocks={normalizeText(telemetryPayload.selectedBlocks) || undefined}
      data-action-key={normalizeText(telemetryPayload.actionKey) || undefined}
      data-action-rank={telemetryPayload.actionRank > 0 ? String(telemetryPayload.actionRank) : undefined}
      data-contrast-key={normalizeText(telemetryPayload.contrastKey) || undefined}
      data-profile-seed-key={normalizeText(telemetryPayload.profileSeedKey) || undefined}
      data-selection-fingerprint={normalizeText(telemetryPayload.selectionFingerprint) || undefined}
      data-memory-fingerprint={normalizeText(telemetryPayload.memoryFingerprint) || undefined}
      data-memory-state={normalizeText(telemetryPayload.memoryState) || undefined}
      data-memory-rewrite-reason={normalizeText(telemetryPayload.memoryRewriteReason) || undefined}
      data-adaptive-fingerprint={normalizeText(telemetryPayload.adaptiveFingerprint) || undefined}
      data-selection-rewrite-reason={normalizeText(telemetryPayload.selectionRewriteReason) || undefined}
      data-next-best-action-key={normalizeText(telemetryPayload.nextBestActionKey) || undefined}
      data-synthesis-key={normalizeText(telemetryPayload.synthesisKey) || undefined}
      data-supporting-scale={normalizeText(telemetryPayload.supportingScale) || undefined}
      data-cross-assessment-version={normalizeText(telemetryPayload.crossAssessmentVersion) || undefined}
      data-locale-context={normalizeText(telemetryPayload.localeContext) || undefined}
      data-cultural-context={normalizeText(telemetryPayload.culturalContext) || undefined}
      data-calibration-fingerprint={normalizeText(telemetryPayload.calibrationFingerprint) || undefined}
      data-calibration-contract-version={normalizeText(telemetryPayload.calibrationContractVersion) || undefined}
      data-career-focus-key={normalizeText(telemetryPayload.careerFocusKey) || undefined}
      data-career-journey-keys={normalizeText(telemetryPayload.careerJourneyKeys) || undefined}
      data-career-action-priority-keys={normalizeText(telemetryPayload.careerActionPriorityKeys) || undefined}
      data-primary-focus={options?.isPrimaryFocus === true ? "true" : undefined}
      data-display-order={options?.displayOrder ?? undefined}
      className={`space-y-4 rounded-[26px] border bg-white/95 p-5 shadow-[0_16px_38px_rgba(15,23,42,0.06)] transition duration-200 motion-reduce:transform-none motion-reduce:transition-none hover:-translate-y-0.5 hover:shadow-[0_22px_50px_rgba(15,23,42,0.1)] focus-within:-translate-y-0.5 focus-within:shadow-[0_22px_50px_rgba(15,23,42,0.1)] ${
        options?.isPrimaryFocus === true
          ? "border-emerald-300 ring-1 ring-emerald-100"
          : tone.classes
      }`}
      onClickCapture={() => {
        trackEvent("ui_card_interaction", {
          ...telemetryPayload,
          interaction: "click",
        });
      }}
    >
      {options?.isPrimaryFocus === true ? (
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
          {locale === "zh" ? "建议先看" : "Start here"}
        </p>
      ) : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="m-0 text-lg font-semibold tracking-[-0.02em] text-slate-900">{resolveProjectionSectionTitle(section, locale)}</h3>
        <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {tone.label}
        </span>
      </div>
      {content}
      {isExplainabilitySection || isActionSection ? (
        <ProjectionFeedbackButtons
          locale={locale}
          isActionSection={isActionSection}
          onPositive={() => {
            trackEvent(
              "accuracy_feedback",
              buildAccuracyFeedbackPayload(isActionSection ? "helpful_action" : "accurate")
            );
          }}
          onNegative={() => {
            trackEvent(
              "accuracy_feedback",
              buildAccuracyFeedbackPayload(isActionSection ? "not_now" : "unclear")
            );
          }}
        />
      ) : null}
    </article>
  );
}

export function MbtiChapterSection({
  locale,
  attemptId,
  chapterKey,
  legacySection,
  projectionSections,
  projectionDimensions,
  globalTraits,
  unlock,
  previewSection = null,
  identityLayer,
  personalization,
  primaryFocusKey,
}: MbtiChapterSectionProps) {
  const copy = CHAPTER_COPY[chapterKey];
  const impressionKeysRef = useRef<Set<string>>(new Set());
  const dwellKeysRef = useRef<Set<string>>(new Set());
  const isOverviewChapter = chapterKey === "traits";
  const authoredOverview = isOverviewChapter && identityLayer
    ? {
        title: normalizeText(identityLayer.title),
        subtitle: normalizeText(identityLayer.subtitle),
        oneLiner: normalizeText(identityLayer.one_liner),
        bullets: normalizeStringArray(identityLayer.bullets),
      }
    : null;
  const previewCards = previewSection?.previewCards ?? [];
  const hasVisiblePreviewCards = previewSection?.hasPreviewContent === true && previewCards.length > 0;
  const bridgeItems = buildBridgeItems(
    chapterKey,
    legacySection ?? null,
    unlock,
    globalTraits,
    locale,
    hasVisiblePreviewCards,
    identityLayer
  );
  const hasProjectionContent = projectionSections.length > 0;
  const hasLegacyPublicContent = Array.isArray(legacySection?.blocks) && legacySection.blocks.length > 0;
  const isLocked = normalizeText(legacySection?.access_level).toLowerCase() === "paid";
  const previewReportSection = hasVisiblePreviewCards ? buildPreviewSection(chapterKey, locale, previewCards) : null;
  const isPreviewChapter = hasVisiblePreviewCards && !isLocked;
  const bridgeTitle = chapterKey === "traits"
    ? locale === "zh"
      ? "主导特质"
      : "Dominant traits"
    : locale === "zh"
      ? "关键特质"
      : "Key traits";
  const introCopy = isOverviewChapter
    ? normalizeText(authoredOverview?.subtitle, authoredOverview?.oneLiner, copy.intro[locale])
    : copy.intro[locale];
  const teaserText = isOverviewChapter
    ? normalizeText(authoredOverview?.oneLiner, authoredOverview?.subtitle, unlock?.teaser)
    : normalizeText(unlock?.teaser);
  const teaserBullets =
    isOverviewChapter && (authoredOverview?.bullets.length ?? 0) > 0
      ? authoredOverview?.bullets ?? []
      : unlock?.benefits ?? [];
  const orderedProjectionSections = [...projectionSections];
  const traitDimensionSectionIndex = orderedProjectionSections.findIndex((section) => section.render === "trait_dimension_grid");
  const hasTraitDimensionRender = traitDimensionSectionIndex > -1;

  if (isOverviewChapter && hasTraitDimensionRender && traitDimensionSectionIndex > 0) {
    const [traitDimensionSection] = orderedProjectionSections.splice(traitDimensionSectionIndex, 1);
    orderedProjectionSections.unshift(traitDimensionSection);
  }

  const traitsLeadEvidence =
    isOverviewChapter && !hasTraitDimensionRender && projectionDimensions.length > 0 ? (
      <Card className="border-slate-200 bg-[var(--fm-surface-muted)]/70 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-slate-900">
            {locale === "zh" ? "主导维度" : "Dominant dimensions"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-5">
          <DimensionBars dimensions={projectionDimensions} />
        </CardContent>
      </Card>
    ) : null;

  useEffect(() => {
    for (const section of projectionSections) {
      const impressionKey = `${section.key}::${normalizeText(section.variantKey)}`;
      if (!section.key || impressionKeysRef.current.has(impressionKey)) {
        continue;
      }

      impressionKeysRef.current.add(impressionKey);
      trackEvent("ui_card_impression", buildSectionTelemetryPayload(section, locale, personalization, {
        attemptId,
        displayOrder: projectionSections.findIndex((candidate) => candidate.key === section.key) + 1,
        isPrimaryFocus: section.key === primaryFocusKey,
      }));
    }
  }, [attemptId, locale, personalization, primaryFocusKey, projectionSections]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.IntersectionObserver !== "function" ||
      projectionSections.length === 0
    ) {
      return;
    }

    const timers = new Map<string, number>();
    const observer = new window.IntersectionObserver((entries) => {
      for (const entry of entries) {
        const element = entry.target as HTMLElement;
        const sectionKey = normalizeText(element.dataset.sectionKey);
        if (!sectionKey) {
          continue;
        }

        const signature = `${sectionKey}::${normalizeText(element.dataset.variantKey)}`;
        if (entry.isIntersecting) {
          if (dwellKeysRef.current.has(signature) || timers.has(signature)) {
            continue;
          }

          const timer = window.setTimeout(() => {
            if (dwellKeysRef.current.has(signature)) {
              return;
            }

            const section = projectionSections.find((candidate) => candidate.key === sectionKey);
            if (!section) {
              return;
            }

            dwellKeysRef.current.add(signature);
            trackEvent("ui_card_interaction", {
              ...buildSectionTelemetryPayload(section, locale, personalization, {
                attemptId,
                displayOrder: projectionSections.findIndex((candidate) => candidate.key === section.key) + 1,
                isPrimaryFocus: section.key === primaryFocusKey,
              }),
              interaction: "dwell_2500ms",
            });
          }, 2500);
          timers.set(signature, timer);
          continue;
        }

        const timer = timers.get(signature);
        if (timer !== undefined) {
          window.clearTimeout(timer);
          timers.delete(signature);
        }
      }
    }, { threshold: 0.7 });

    for (const section of projectionSections) {
      const selector = `[data-testid="mbti-projection-section-${toProjectionSectionTestId(section.key)}"]`;
      const element = document.querySelector(selector);
      if (element instanceof HTMLElement) {
        observer.observe(element);
      }
    }

    return () => {
      observer.disconnect();
      for (const timer of timers.values()) {
        window.clearTimeout(timer);
      }
      timers.clear();
    };
  }, [attemptId, locale, personalization, primaryFocusKey, projectionSections]);

  return (
    <section
      id={copy.anchor}
      data-testid={`mbti-chapter-${copy.anchor}`}
      className="scroll-mt-28 flex flex-col gap-6 rounded-2xl border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.96))] p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:gap-8 md:p-8"
    >
      <h2 className="m-0 text-2xl font-semibold tracking-[-0.03em] text-[var(--fm-text)]">
        {copy.title[locale]}
      </h2>
      <p className="m-0 max-w-3xl text-base text-neutral-400">{copy.summaryLine[locale]}</p>
      <div className="flex flex-col gap-6">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
              {locale === "zh" ? `章节 ${copy.order}` : `Chapter ${copy.order}`}
            </p>
            <span className="inline-flex rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
              {chapterKey === "traits"
                ? locale === "zh"
                  ? "结构总览"
                  : "Structure"
                : chapterKey === "career"
                  ? locale === "zh"
                    ? "场景映射"
                    : "Scenario mapping"
                  : chapterKey === "growth"
                    ? locale === "zh"
                      ? "行动坐标"
                      : "Action coordinates"
                    : locale === "zh"
                      ? "关系边界"
                      : "Relationship boundaries"}
            </span>
            {isLocked ? (
              <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-800">
                {locale === "zh" ? "预览章节" : "Preview chapter"}
              </span>
            ) : isPreviewChapter ? (
              <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-800">
                {locale === "zh" ? "部分预览已开放" : "Partial preview visible"}
              </span>
            ) : null}
          </div>
          <p className="m-0 max-w-3xl text-sm leading-7 text-[var(--fm-text-muted)]">{introCopy}</p>
        </header>

        <div className="flex flex-col gap-6">
          {renderChapterVisualSlot(chapterKey, locale, hasProjectionContent ? projectionSections : [])}
          {isOverviewChapter && authoredOverview && (authoredOverview.title || authoredOverview.subtitle || authoredOverview.oneLiner) ? (
            <Card
              data-testid="mbti-overview-authored-intro"
              className="border-slate-200 bg-white/90 shadow-[0_14px_34px_rgba(15,23,42,0.05)]"
            >
              <CardContent className="space-y-3 p-5">
                {authoredOverview.title ? (
                  <p className="m-0 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                    {authoredOverview.title}
                  </p>
                ) : null}
                {authoredOverview.subtitle ? (
                  <p className="m-0 text-lg font-semibold tracking-[-0.02em] text-slate-900">{authoredOverview.subtitle}</p>
                ) : null}
                {authoredOverview.oneLiner ? (
                  <p className="m-0 text-sm leading-7 text-slate-600">{authoredOverview.oneLiner}</p>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
          {traitsLeadEvidence}

          <Card className="border-slate-200 bg-slate-950 text-white shadow-[0_20px_44px_rgba(15,23,42,0.18)]">
            <CardHeader className="space-y-2 pb-3">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                {bridgeTitle}
              </p>
              <CardTitle className="text-lg text-white">
                {locale === "zh"
                  ? "这一章的判读抓手"
                  : "Reading handles for this chapter"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bridgeItems.map((item, index) => (
                <div
                  key={`${item.title}-${item.description}`}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 transition duration-200 motion-reduce:transition-none hover:border-white/20 hover:bg-white/[0.08]"
                >
                  <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                    {locale === "zh" ? `线索 ${index + 1}` : `Cue ${index + 1}`}
                  </p>
                  <p className="m-0 mt-2 text-sm font-semibold text-white">{item.title}</p>
                  <p className="m-0 mt-2 text-sm leading-7 text-slate-300">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {locale === "zh" ? "正文边界" : "Body boundary"}
            </p>
            <p className="m-0 mt-3 text-sm leading-7 text-slate-600">
              {isLocked
                ? locale === "zh"
                  ? "先浏览公开层；完整解锁后展示完整章节。"
                  : "Browse the public layer first, then unlock for the complete chapter."
                : isPreviewChapter
                  ? locale === "zh"
                    ? "本章已开放部分预览；完整报告补齐更深的边界解释与行动坐标。"
                    : "This chapter already has preview cards; the full report adds deeper interpretation and action coordinates."
                  : locale === "zh"
                    ? "当前章节支持完整正文阅读，可继续下滑。"
                    : "This chapter is fully available in full-body mode; continue reading."}
            </p>
          </div>
        </div>

        {hasProjectionContent ? (
          <div
            data-testid={`mbti-chapter-public-${copy.anchor}`}
            className="space-y-4"
          >
            {orderedProjectionSections.map((section, index) =>
              renderProjectionSection(section, locale, projectionDimensions, personalization, {
                attemptId,
                displayOrder: projectionSections.findIndex((candidate) => candidate.key === section.key) + 1 || index + 1,
                isPrimaryFocus: section.key === primaryFocusKey,
              })
            )}
          </div>
        ) : hasLegacyPublicContent && legacySection ? (
          <div
            data-testid={`mbti-chapter-public-${copy.anchor}`}
            className="rounded-[24px] border border-slate-200 bg-white/90 p-5 shadow-[0_16px_38px_rgba(15,23,42,0.05)] [&_section]:space-y-3 [&_section>h3]:sr-only [&_section>div]:space-y-3"
          >
            <SectionRenderer section={legacySection} locked={false} locale={locale} scaleCode="MBTI" />
          </div>
        ) : null}

        {previewReportSection ? (
          <div
            data-testid={`mbti-chapter-preview-${copy.anchor}`}
            className="rounded-[24px] border border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.8),rgba(255,255,255,0.98))] p-5 shadow-[0_16px_38px_rgba(15,23,42,0.05)] [&_section]:space-y-3 [&_section>h3]:sr-only [&_section>div]:space-y-3"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-2">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">
                  {locale === "zh" ? "章节预览内容" : "Chapter preview cards"}
                </p>
                <p className="m-0 text-sm leading-7 text-slate-600">
                  {locale === "zh"
                    ? "这里展示当前已经开放的部分预览卡片；完整解锁后会继续补齐整章正文。"
                    : "These cards are already open in preview mode. Unlocking the full report still completes the rest of the chapter."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(previewCards.map((card) => resolveModuleLabel(card.moduleCode, locale)))).map((label) => (
                  <span
                    key={label}
                    className="inline-flex rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium text-emerald-800"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
            <SectionRenderer section={previewReportSection} locked={false} locale={locale} scaleCode="MBTI" />
          </div>
        ) : null}

        {isLocked ? (
          <div className="relative">
            <div className="relative rounded-[24px] border border-dashed border-slate-300 bg-[linear-gradient(180deg,rgba(248,250,252,0.95),rgba(255,255,255,0.98))] p-5 blur-sm opacity-60">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                {locale === "zh" ? "完整章节预览" : "Full chapter preview"}
              </p>
              <p className="m-0 mt-3 text-lg font-semibold tracking-[-0.02em] text-slate-950">
                {teaserText || (locale === "zh" ? "解锁后可查看这一章的完整解读。" : "Unlock to view the full reading for this chapter.")}
              </p>
            </div>

            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-lg">
                <p className="m-0 mb-3 text-sm text-slate-700">解锁完整分析</p>
                <a
                  href="#offer-full"
                  className={buttonVariants({
                    className:
                      "inline-flex w-full min-h-[44px] items-center justify-center rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white",
                  })}
                >
                  {locale === "zh" ? "解锁完整报告" : "Unlock full report"}
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
