"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import { normalizeRecommendedReadHref } from "@/lib/access/reportActionUrls";
import type { ReportRecommendedRead } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { appendMbtiContinuityQuery, isInternalMbtiCarryoverHref } from "@/lib/mbti/continuity";
import type { MbtiResultPersonalizationViewModel } from "@/lib/mbti/publicProjection";
import {
  summarizeMbtiActionPriorityKeys,
  summarizeMbtiActionCompletionTendency,
  summarizeMbtiActionEffectWeights,
  summarizeMbtiAdaptiveContractVersion,
  summarizeMbtiAdaptiveFingerprint,
  summarizeMbtiAdaptiveRewriteReason,
  summarizeMbtiAxisBands,
  summarizeMbtiBoundaryFlags,
  summarizeMbtiCarryoverActionKeys,
  summarizeMbtiCarryoverResumeKeys,
  summarizeMbtiCarryoverSceneKeys,
  summarizeMbtiContentFeedbackWeights,
  summarizeMbtiCtaEffectWeights,
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
  summarizeMbtiDominantInterestKeys,
  summarizeMbtiNextBestActionKey,
  summarizeMbtiNextBestActionReason,
  summarizeMbtiNextBestActionSection,
  summarizeMbtiOrderedActionKeys,
  summarizeMbtiOrderedRecommendationKeys,
  summarizeMbtiRecommendationEffectWeights,
  summarizeMbtiRecommendationPriorityKeys,
  summarizeMbtiRecommendationSelectionKeys,
  summarizeMbtiOrderedSectionKeys,
  summarizeMbtiProfileSeedKey,
  summarizeMbtiResumeBiasKeys,
  summarizeMbtiSceneFingerprint,
  summarizeMbtiSectionHistoryKeys,
  summarizeMbtiSelectionFingerprint,
  summarizeMbtiSecondaryFocusKeys,
  summarizeMbtiSectionSelectionKeys,
  summarizeMbtiActionSelectionKeys,
  summarizeMbtiSameTypeDivergenceKeys,
  summarizeMbtiUserState,
  summarizeMbtiVariantKeys,
} from "@/lib/mbti/personalizationTelemetry";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MbtiRecommendedReadsSectionProps = {
  locale: Locale;
  reads: ReportRecommendedRead[];
  personalization?: MbtiResultPersonalizationViewModel | null;
};

type RecommendedReadEntry = {
  read: ReportRecommendedRead;
  key: string;
  originalIndex: number;
  priority: number;
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

function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values.map((value) => normalizeText(value)).filter(Boolean);
}

export function MbtiRecommendedReadsSection({
  locale,
  reads,
  personalization = null,
}: MbtiRecommendedReadsSectionProps) {
  const impressionTrackedRef = useRef(false);
  const readImpressionKeysRef = useRef<Set<string>>(new Set());
  const orderedRecommendationKeys = personalization?.orderedRecommendationKeys ?? [];
  const recommendationSelectionKeys = personalization?.recommendationSelectionKeys ?? [];
  const sortedReadEntries = sortRecommendedReads(reads, orderedRecommendationKeys, recommendationSelectionKeys);
  const orderedRecommendationKeysSummary = summarizeMbtiOrderedRecommendationKeys(personalization);
  const orderedActionKeysSummary = summarizeMbtiOrderedActionKeys(personalization);
  const recommendationPriorityKeysSummary = summarizeMbtiRecommendationPriorityKeys(personalization);
  const actionPriorityKeysSummary = summarizeMbtiActionPriorityKeys(personalization);
  const recommendationSelectionKeysSummary = summarizeMbtiRecommendationSelectionKeys(personalization);
  const sectionSelectionKeysSummary = summarizeMbtiSectionSelectionKeys(personalization);
  const actionSelectionKeysSummary = summarizeMbtiActionSelectionKeys(personalization);
  const sameTypeDivergenceKeysSummary = summarizeMbtiSameTypeDivergenceKeys(personalization);
  const profileSeedKey = summarizeMbtiProfileSeedKey(personalization);
  const selectionFingerprint = summarizeMbtiSelectionFingerprint(personalization);
  const memoryContractVersion = summarizeMbtiMemoryContractVersion(personalization);
  const memoryFingerprint = summarizeMbtiMemoryFingerprint(personalization);
  const memoryScope = summarizeMbtiMemoryScope(personalization);
  const memoryState = summarizeMbtiMemoryState(personalization);
  const memoryProgressionState = summarizeMbtiMemoryProgressionState(personalization);
  const sectionHistoryKeys = summarizeMbtiSectionHistoryKeys(personalization);
  const behaviorDeltaKeys = summarizeMbtiBehaviorDeltaKeys(personalization);
  const dominantInterestKeys = summarizeMbtiDominantInterestKeys(personalization);
  const resumeBiasKeys = summarizeMbtiResumeBiasKeys(personalization);
  const memoryRewriteKeys = summarizeMbtiMemoryRewriteKeys(personalization);
  const memoryRewriteReason = summarizeMbtiMemoryRewriteReason(personalization);
  const adaptiveContractVersion = summarizeMbtiAdaptiveContractVersion(personalization);
  const adaptiveFingerprint = summarizeMbtiAdaptiveFingerprint(personalization);
  const adaptiveRewriteReason = summarizeMbtiAdaptiveRewriteReason(personalization);
  const contentFeedbackWeights = summarizeMbtiContentFeedbackWeights(personalization);
  const actionEffectWeights = summarizeMbtiActionEffectWeights(personalization);
  const recommendationEffectWeights = summarizeMbtiRecommendationEffectWeights(personalization);
  const ctaEffectWeights = summarizeMbtiCtaEffectWeights(personalization);
  const nextBestActionKey = summarizeMbtiNextBestActionKey(personalization);
  const nextBestActionSection = summarizeMbtiNextBestActionSection(personalization);
  const nextBestActionReason = summarizeMbtiNextBestActionReason(personalization);
  const readingFocusKey = normalizeText(personalization?.readingFocusKey);
  const actionFocusKey = normalizeText(personalization?.actionFocusKey);

  useEffect(() => {
    if (sortedReadEntries.length === 0 || impressionTrackedRef.current) return;
    impressionTrackedRef.current = true;

    trackEvent("ui_card_impression", {
      slug: "mbti-result-shell",
      scale_code: "MBTI",
      visual_kind: "recommended_reads",
      variantKeys: summarizeMbtiVariantKeys(personalization),
      sceneFingerprint: summarizeMbtiSceneFingerprint(personalization),
      boundaryFlags: summarizeMbtiBoundaryFlags(personalization),
      axisBands: summarizeMbtiAxisBands(personalization),
      userState: summarizeMbtiUserState(personalization),
      feedbackSentiment: summarizeMbtiFeedbackSentiment(personalization),
      feedbackCoverage: summarizeMbtiFeedbackCoverage(personalization),
      actionCompletionTendency: summarizeMbtiActionCompletionTendency(personalization),
      lastDeepReadSection: summarizeMbtiLastDeepReadSection(personalization),
      currentIntentCluster: summarizeMbtiCurrentIntentCluster(personalization),
      primaryFocusKey: normalizeText(personalization?.orchestration?.primaryFocusKey),
      secondaryFocusKeys: summarizeMbtiSecondaryFocusKeys(personalization),
      orderedSectionKeys: summarizeMbtiOrderedSectionKeys(personalization),
      orderedRecommendationKeys: orderedRecommendationKeysSummary,
      orderedActionKeys: orderedActionKeysSummary,
      recommendationPriorityKeys: recommendationPriorityKeysSummary,
      recommendationSelectionKeys: recommendationSelectionKeysSummary,
      sectionSelectionKeys: sectionSelectionKeysSummary,
      actionSelectionKeys: actionSelectionKeysSummary,
      sameTypeDivergenceKeys: sameTypeDivergenceKeysSummary,
      profileSeedKey,
      selectionFingerprint,
      memoryContractVersion,
      memoryFingerprint,
      memoryScope,
      memoryState,
      memoryProgressionState,
      sectionHistoryKeys,
      behaviorDeltaKeys,
      dominantInterestKeys,
      resumeBiasKeys,
      memoryRewriteKeys,
      memoryRewriteReason,
      adaptiveContractVersion,
      adaptiveFingerprint,
      selectionRewriteReason: adaptiveRewriteReason,
      contentFeedbackWeights,
      actionEffectWeights,
      recommendationEffectWeights,
      ctaEffectWeights,
      nextBestActionKey,
      nextBestActionSection,
      nextBestActionReason,
      actionPriorityKeys: actionPriorityKeysSummary,
      readingFocusKey,
      actionFocusKey,
      ctaPriorityKeys: summarizeMbtiCtaPriorityKeys(personalization),
      carryoverFocusKey: normalizeText(personalization?.continuity?.carryoverFocusKey),
      carryoverReason: normalizeText(personalization?.continuity?.carryoverReason),
      recommendedResumeKeys: summarizeMbtiCarryoverResumeKeys(personalization),
      carryoverSceneKeys: summarizeMbtiCarryoverSceneKeys(personalization),
      carryoverActionKeys: summarizeMbtiCarryoverActionKeys(personalization),
      typeCode: normalizeText(personalization?.typeCode),
      identity: normalizeText(personalization?.identity),
      packId: normalizeText(personalization?.packId),
      engineVersion: normalizeText(personalization?.engineVersion),
      locale,
    });
  }, [
    actionFocusKey,
    actionPriorityKeysSummary,
    locale,
    orderedActionKeysSummary,
    orderedRecommendationKeysSummary,
    personalization,
    profileSeedKey,
    readingFocusKey,
    resumeBiasKeys,
    recommendationSelectionKeysSummary,
    recommendationPriorityKeysSummary,
    sameTypeDivergenceKeysSummary,
    sectionSelectionKeysSummary,
    actionSelectionKeysSummary,
    selectionFingerprint,
    sortedReadEntries.length,
    memoryContractVersion,
    memoryFingerprint,
    memoryScope,
    memoryState,
    memoryProgressionState,
    sectionHistoryKeys,
    behaviorDeltaKeys,
    dominantInterestKeys,
    memoryRewriteKeys,
    memoryRewriteReason,
    adaptiveContractVersion,
    adaptiveFingerprint,
    adaptiveRewriteReason,
    contentFeedbackWeights,
    actionEffectWeights,
    recommendationEffectWeights,
    ctaEffectWeights,
    nextBestActionKey,
    nextBestActionSection,
    nextBestActionReason,
  ]);

  useEffect(() => {
    for (const [index, entry] of sortedReadEntries.entries()) {
      const recommendationKey = entry.key;
      if (!recommendationKey || readImpressionKeysRef.current.has(recommendationKey)) {
        continue;
      }

      readImpressionKeysRef.current.add(recommendationKey);
      trackEvent("ui_card_impression", {
        slug: "mbti-result-shell",
        scale_code: "MBTI",
        visual_kind: "recommended_read_card",
        recommendationKey,
        recommendationRank: index + 1,
        userState: summarizeMbtiUserState(personalization),
        feedbackSentiment: summarizeMbtiFeedbackSentiment(personalization),
        feedbackCoverage: summarizeMbtiFeedbackCoverage(personalization),
        actionCompletionTendency: summarizeMbtiActionCompletionTendency(personalization),
        lastDeepReadSection: summarizeMbtiLastDeepReadSection(personalization),
        currentIntentCluster: summarizeMbtiCurrentIntentCluster(personalization),
        primaryFocusKey: normalizeText(personalization?.orchestration?.primaryFocusKey),
        secondaryFocusKeys: summarizeMbtiSecondaryFocusKeys(personalization),
        orderedSectionKeys: summarizeMbtiOrderedSectionKeys(personalization),
        orderedRecommendationKeys: orderedRecommendationKeysSummary,
        orderedActionKeys: orderedActionKeysSummary,
        recommendationPriorityKeys: recommendationPriorityKeysSummary,
        recommendationSelectionKeys: recommendationSelectionKeysSummary,
        sectionSelectionKeys: sectionSelectionKeysSummary,
        actionSelectionKeys: actionSelectionKeysSummary,
        sameTypeDivergenceKeys: sameTypeDivergenceKeysSummary,
        profileSeedKey,
        selectionFingerprint,
        memoryContractVersion,
        memoryFingerprint,
        memoryScope,
        memoryState,
        memoryProgressionState,
        sectionHistoryKeys,
        behaviorDeltaKeys,
        dominantInterestKeys,
        resumeBiasKeys,
        memoryRewriteKeys,
        memoryRewriteReason,
        adaptiveContractVersion,
        adaptiveFingerprint,
        selectionRewriteReason: adaptiveRewriteReason,
        contentFeedbackWeights,
        actionEffectWeights,
        recommendationEffectWeights,
        ctaEffectWeights,
        nextBestActionKey,
        nextBestActionSection,
        nextBestActionReason,
        actionPriorityKeys: actionPriorityKeysSummary,
        readingFocusKey,
        actionFocusKey,
        ctaPriorityKeys: summarizeMbtiCtaPriorityKeys(personalization),
        carryoverFocusKey: normalizeText(personalization?.continuity?.carryoverFocusKey),
        carryoverReason: normalizeText(personalization?.continuity?.carryoverReason),
        recommendedResumeKeys: summarizeMbtiCarryoverResumeKeys(personalization),
        carryoverSceneKeys: summarizeMbtiCarryoverSceneKeys(personalization),
        carryoverActionKeys: summarizeMbtiCarryoverActionKeys(personalization),
        variantKeys: summarizeMbtiVariantKeys(personalization),
        sceneFingerprint: summarizeMbtiSceneFingerprint(personalization),
        boundaryFlags: summarizeMbtiBoundaryFlags(personalization),
        axisBands: summarizeMbtiAxisBands(personalization),
        typeCode: normalizeText(personalization?.typeCode),
        identity: normalizeText(personalization?.identity),
        packId: normalizeText(personalization?.packId),
        engineVersion: normalizeText(personalization?.engineVersion),
        locale,
      });
    }
  }, [
    actionEffectWeights,
    actionFocusKey,
    actionPriorityKeysSummary,
    adaptiveContractVersion,
    adaptiveFingerprint,
    adaptiveRewriteReason,
    contentFeedbackWeights,
    ctaEffectWeights,
    locale,
    orderedActionKeysSummary,
    orderedRecommendationKeysSummary,
    personalization,
    profileSeedKey,
    readingFocusKey,
    resumeBiasKeys,
    recommendationSelectionKeysSummary,
    recommendationPriorityKeysSummary,
    sameTypeDivergenceKeysSummary,
    sectionSelectionKeysSummary,
    actionSelectionKeysSummary,
    selectionFingerprint,
    sortedReadEntries,
    memoryContractVersion,
    memoryFingerprint,
    memoryScope,
    memoryState,
    memoryProgressionState,
    sectionHistoryKeys,
    behaviorDeltaKeys,
    dominantInterestKeys,
    memoryRewriteKeys,
    memoryRewriteReason,
    nextBestActionKey,
    nextBestActionReason,
    nextBestActionSection,
    recommendationEffectWeights,
  ]);

  if (sortedReadEntries.length === 0) {
    return null;
  }

  return (
    <section
      data-testid="mbti-recommended-reads"
      data-profile-seed-key={profileSeedKey || undefined}
      data-selection-fingerprint={selectionFingerprint || undefined}
      data-recommendation-selection-keys={recommendationSelectionKeysSummary || undefined}
      data-memory-fingerprint={memoryFingerprint || undefined}
      data-memory-state={memoryState || undefined}
      data-memory-rewrite-reason={memoryRewriteReason || undefined}
      data-adaptive-fingerprint={adaptiveFingerprint || undefined}
      data-selection-rewrite-reason={adaptiveRewriteReason || undefined}
      data-next-best-action-key={nextBestActionKey || undefined}
      className="space-y-5 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
            {locale === "zh" ? "延伸阅读" : "Recommended reads"}
          </p>
          <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--fm-text)]">
            {locale === "zh" ? "继续往下看，但不打断当前阅读主线" : "Keep reading without breaking the current report flow"}
          </h2>
          <p className="m-0 text-sm leading-7 text-slate-600">
            {locale === "zh"
              ? "这一区域放在主解锁区之后，只负责补充延伸阅读和继续探索，不打断当前结果页的主解锁路径。"
              : "This section stays after the primary unlock area so it can extend the reading without interrupting the main upgrade path."}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 px-4 py-3">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
              {locale === "zh" ? "当前推荐数" : "Current picks"}
            </p>
            <p className="m-0 mt-2 text-sm font-semibold text-slate-900">
              {locale === "zh" ? `${sortedReadEntries.length} 条延伸阅读` : `${sortedReadEntries.length} reading paths`}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
            <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {locale === "zh" ? "推荐方式" : "Selection mode"}
            </p>
            <p className="m-0 mt-2 text-sm font-semibold text-slate-900">
              {readingFocusKey
                ? locale === "zh"
                  ? "已按当前阅读重点排序"
                  : "Sorted around the current reading focus"
                : locale === "zh"
                  ? "按当前结果上下文排序"
                  : "Sorted from the current result context"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sortedReadEntries.map(({ read, key: recommendationKey }, index) => {
          const tags = normalizeStringArray(read.tags);
          const linkLabel = normalizeText(read.cta, locale === "zh" ? "继续阅读" : "Continue reading");
          const minutes = typeof read.estimated_minutes === "number" ? read.estimated_minutes : null;
          const safeReadHref = normalizeRecommendedReadHref(read.url);
          const resolvedHref = safeReadHref && isInternalMbtiCarryoverHref(safeReadHref)
            ? appendMbtiContinuityQuery(safeReadHref, personalization?.continuity)
            : safeReadHref;
          const isInternal = resolvedHref ? isInternalMbtiCarryoverHref(resolvedHref) : false;
          const isReadingFocus = recommendationKey !== "" && recommendationKey === readingFocusKey;

          return (
            <Card
              key={normalizeText(recommendationKey, read.title, String(index))}
              data-testid={`mbti-recommended-read-card-${index + 1}`}
              data-recommendation-key={recommendationKey || undefined}
              data-recommendation-rank={String(index + 1)}
              data-reading-focus={isReadingFocus ? "true" : undefined}
              data-selected-by-divergence={
                recommendationSelectionKeys.length > 0 && recommendationSelectionKeys.includes(recommendationKey)
                  ? "true"
                  : undefined
              }
              className={`flex h-full flex-col border-slate-200 bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.06)] ${
                isReadingFocus ? "ring-1 ring-emerald-100 border-emerald-300" : ""
              }`}
            >
              <CardHeader className="space-y-3 pb-3">
                {isReadingFocus ? (
                  <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-700">
                    {locale === "zh" ? "建议先读" : "Start here"}
                  </p>
                ) : null}
                <CardTitle className="text-xl text-slate-900">{read.title}</CardTitle>
                {minutes !== null ? (
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                    {locale === "zh" ? `约 ${minutes} 分钟` : `About ${minutes} min`}
                  </p>
                ) : null}
              </CardHeader>
              <CardContent className="flex h-full flex-col space-y-4">
                {read.desc ? <p className="m-0 text-sm leading-7 text-slate-600">{read.desc}</p> : null}
                {tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                {resolvedHref ? (
                  <a
                    href={resolvedHref}
                    className={buttonVariants({ variant: "outline", className: "mt-auto" })}
                    onClick={() => {
                      trackEvent("ui_card_interaction", {
                        slug: "mbti-result-shell",
                        scale_code: "MBTI",
                        visual_kind: "recommended_read_card",
                        interaction: "click",
                        continueTarget: isInternal ? "recommended_read" : "",
                        recommendationKey,
                        recommendationRank: index + 1,
                        variantKeys: summarizeMbtiVariantKeys(personalization),
                        sceneFingerprint: summarizeMbtiSceneFingerprint(personalization),
                        boundaryFlags: summarizeMbtiBoundaryFlags(personalization),
                        axisBands: summarizeMbtiAxisBands(personalization),
                        userState: summarizeMbtiUserState(personalization),
                        feedbackSentiment: summarizeMbtiFeedbackSentiment(personalization),
                        feedbackCoverage: summarizeMbtiFeedbackCoverage(personalization),
                        actionCompletionTendency: summarizeMbtiActionCompletionTendency(personalization),
                        lastDeepReadSection: summarizeMbtiLastDeepReadSection(personalization),
                        currentIntentCluster: summarizeMbtiCurrentIntentCluster(personalization),
                        primaryFocusKey: normalizeText(personalization?.orchestration?.primaryFocusKey),
                        secondaryFocusKeys: summarizeMbtiSecondaryFocusKeys(personalization),
                        orderedSectionKeys: summarizeMbtiOrderedSectionKeys(personalization),
                        orderedRecommendationKeys: orderedRecommendationKeysSummary,
                        orderedActionKeys: orderedActionKeysSummary,
                        recommendationPriorityKeys: recommendationPriorityKeysSummary,
                        recommendationSelectionKeys: recommendationSelectionKeysSummary,
                        sectionSelectionKeys: sectionSelectionKeysSummary,
                        actionSelectionKeys: actionSelectionKeysSummary,
                        sameTypeDivergenceKeys: sameTypeDivergenceKeysSummary,
                        profileSeedKey,
                        selectionFingerprint,
                        adaptiveContractVersion,
                        adaptiveFingerprint,
                        selectionRewriteReason: adaptiveRewriteReason,
                        contentFeedbackWeights,
                        actionEffectWeights,
                        recommendationEffectWeights,
                        ctaEffectWeights,
                        nextBestActionKey,
                        nextBestActionSection,
                        nextBestActionReason,
                        actionPriorityKeys: actionPriorityKeysSummary,
                        readingFocusKey,
                        actionFocusKey,
                        ctaPriorityKeys: summarizeMbtiCtaPriorityKeys(personalization),
                        carryoverFocusKey: normalizeText(personalization?.continuity?.carryoverFocusKey),
                        carryoverReason: normalizeText(personalization?.continuity?.carryoverReason),
                        recommendedResumeKeys: summarizeMbtiCarryoverResumeKeys(personalization),
                        carryoverSceneKeys: summarizeMbtiCarryoverSceneKeys(personalization),
                        carryoverActionKeys: summarizeMbtiCarryoverActionKeys(personalization),
                        typeCode: normalizeText(personalization?.typeCode),
                        identity: normalizeText(personalization?.identity),
                        packId: normalizeText(personalization?.packId),
                        engineVersion: normalizeText(personalization?.engineVersion),
                        locale,
                      });
                    }}
                  >
                    {linkLabel}
                  </a>
                ) : null}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function resolveRecommendationKey(read: ReportRecommendedRead, index: number): string {
  return normalizeText(
    read.id,
    read.canonical_id,
    read.canonical_url,
    read.url,
    read.title,
    `recommended-read-${index + 1}`
  );
}

function sortRecommendedReads(
  reads: ReportRecommendedRead[],
  orderedRecommendationKeys: string[],
  recommendationSelectionKeys: string[]
): RecommendedReadEntry[] {
  let entries = reads.map((read, index) => ({
    read,
    key: resolveRecommendationKey(read, index),
    originalIndex: index,
    priority: typeof read.priority === "number" ? read.priority : 0,
  }));

  if (recommendationSelectionKeys.length > 0) {
    const selectionSet = new Set(recommendationSelectionKeys);
    const selectedEntries = entries.filter((entry) => selectionSet.has(entry.key));
    if (selectedEntries.length > 0) {
      entries = selectedEntries;
    }
  }

  if (entries.length <= 1 || orderedRecommendationKeys.length === 0) {
    return entries;
  }

  const orderMap = new Map(orderedRecommendationKeys.map((key, index) => [key, index] as const));

  return [...entries].sort((left, right) => {
    const leftRank = orderMap.get(left.key);
    const rightRank = orderMap.get(right.key);

    if (leftRank === undefined && rightRank === undefined) {
      if (left.priority !== right.priority) {
        return left.priority - right.priority;
      }

      return left.originalIndex - right.originalIndex;
    }

    if (leftRank === undefined) {
      return 1;
    }

    if (rightRank === undefined) {
      return -1;
    }

    return leftRank - rightRank;
  });
}
