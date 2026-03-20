"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";
import type { ReportRecommendedRead } from "@/lib/api/v0_3";
import type { Locale } from "@/lib/i18n/locales";
import { appendMbtiContinuityQuery, isInternalMbtiCarryoverHref } from "@/lib/mbti/continuity";
import type { MbtiResultPersonalizationViewModel } from "@/lib/mbti/publicProjection";
import {
  summarizeMbtiActionPriorityKeys,
  summarizeMbtiAxisBands,
  summarizeMbtiBoundaryFlags,
  summarizeMbtiCarryoverActionKeys,
  summarizeMbtiCarryoverResumeKeys,
  summarizeMbtiCarryoverSceneKeys,
  summarizeMbtiCtaPriorityKeys,
  summarizeMbtiOrderedActionKeys,
  summarizeMbtiOrderedRecommendationKeys,
  summarizeMbtiRecommendationPriorityKeys,
  summarizeMbtiOrderedSectionKeys,
  summarizeMbtiSceneFingerprint,
  summarizeMbtiSecondaryFocusKeys,
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
  const sortedReadEntries = sortRecommendedReads(reads, orderedRecommendationKeys);
  const orderedRecommendationKeysSummary = summarizeMbtiOrderedRecommendationKeys(personalization);
  const orderedActionKeysSummary = summarizeMbtiOrderedActionKeys(personalization);
  const recommendationPriorityKeysSummary = summarizeMbtiRecommendationPriorityKeys(personalization);
  const actionPriorityKeysSummary = summarizeMbtiActionPriorityKeys(personalization);
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
      primaryFocusKey: normalizeText(personalization?.orchestration?.primaryFocusKey),
      secondaryFocusKeys: summarizeMbtiSecondaryFocusKeys(personalization),
      orderedSectionKeys: summarizeMbtiOrderedSectionKeys(personalization),
      orderedRecommendationKeys: orderedRecommendationKeysSummary,
      orderedActionKeys: orderedActionKeysSummary,
      recommendationPriorityKeys: recommendationPriorityKeysSummary,
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
    readingFocusKey,
    recommendationPriorityKeysSummary,
    sortedReadEntries.length,
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
        primaryFocusKey: normalizeText(personalization?.orchestration?.primaryFocusKey),
        secondaryFocusKeys: summarizeMbtiSecondaryFocusKeys(personalization),
        orderedSectionKeys: summarizeMbtiOrderedSectionKeys(personalization),
        orderedRecommendationKeys: orderedRecommendationKeysSummary,
        orderedActionKeys: orderedActionKeysSummary,
        recommendationPriorityKeys: recommendationPriorityKeysSummary,
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
    actionFocusKey,
    actionPriorityKeysSummary,
    locale,
    orderedActionKeysSummary,
    orderedRecommendationKeysSummary,
    personalization,
    readingFocusKey,
    recommendationPriorityKeysSummary,
    sortedReadEntries,
  ]);

  if (sortedReadEntries.length === 0) {
    return null;
  }

  return (
    <section
      data-testid="mbti-recommended-reads"
      className="space-y-4 rounded-[28px] border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:p-6"
    >
      <div className="space-y-2">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "延伸阅读" : "Recommended reads"}
        </p>
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-[var(--fm-text)]">
          {locale === "zh" ? "继续往下看，但不打断当前阅读主线" : "Keep reading without breaking the current report flow"}
        </h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {sortedReadEntries.map(({ read, key: recommendationKey }, index) => {
          const tags = normalizeStringArray(read.tags);
          const linkLabel = normalizeText(read.cta, locale === "zh" ? "继续阅读" : "Continue reading");
          const minutes = typeof read.estimated_minutes === "number" ? read.estimated_minutes : null;
          const resolvedHref = isInternalMbtiCarryoverHref(normalizeText(read.url))
            ? appendMbtiContinuityQuery(normalizeText(read.url), personalization?.continuity)
            : normalizeText(read.url);
          const isInternal = isInternalMbtiCarryoverHref(resolvedHref);
          const isReadingFocus = recommendationKey !== "" && recommendationKey === readingFocusKey;

          return (
            <Card
              key={normalizeText(recommendationKey, read.title, String(index))}
              data-testid={`mbti-recommended-read-card-${index + 1}`}
              data-recommendation-key={recommendationKey || undefined}
              data-recommendation-rank={String(index + 1)}
              data-reading-focus={isReadingFocus ? "true" : undefined}
              className={`border-slate-200 bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.06)] ${
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
              <CardContent className="space-y-4">
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
                {read.url ? (
                  <a
                    href={resolvedHref}
                    target={isInternal ? undefined : "_blank"}
                    rel={isInternal ? undefined : "noreferrer"}
                    className={buttonVariants({ variant: "outline" })}
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
                        primaryFocusKey: normalizeText(personalization?.orchestration?.primaryFocusKey),
                        secondaryFocusKeys: summarizeMbtiSecondaryFocusKeys(personalization),
                        orderedSectionKeys: summarizeMbtiOrderedSectionKeys(personalization),
                        orderedRecommendationKeys: orderedRecommendationKeysSummary,
                        orderedActionKeys: orderedActionKeysSummary,
                        recommendationPriorityKeys: recommendationPriorityKeysSummary,
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
  orderedRecommendationKeys: string[]
): RecommendedReadEntry[] {
  const entries = reads.map((read, index) => ({
    read,
    key: resolveRecommendationKey(read, index),
    originalIndex: index,
    priority: typeof read.priority === "number" ? read.priority : 0,
  }));

  if (reads.length <= 1 || orderedRecommendationKeys.length === 0) {
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
