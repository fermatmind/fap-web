"use client";

import Link from "next/link";
import { DimensionBars } from "@/components/result/DimensionBars";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { OfferCard } from "@/components/big5/paywall/OfferCard";
import { PdfDownloadButton } from "@/components/big5/pdf/PdfDownloadButton";
import { SectionRenderer } from "@/components/big5/report/SectionRenderer";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { Big5PublicProjection, OfferPayload } from "@/lib/api/v0_3";
import { BIG5_V1_SHELL_MICROCOPY } from "@/lib/big5/microcopy";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { SelfUnderstandingDomainBadge } from "@/components/domains/SelfUnderstandingDomainBadge";

type Headline = {
  badge: string;
  typeCode: string;
  displayName: string;
  supportingLine: string;
  summary: string;
  rarity: string;
};

type ReportBlock = {
  id?: string;
  kind?: string;
  title?: string;
  body?: string;
  bullets?: string[];
  tips?: string[];
  tags?: string[];
  access_level?: string;
  module_code?: string;
  [key: string]: unknown;
};

type ReportSection = {
  key?: string;
  title?: string;
  access_level?: string;
  module_code?: string;
  blocks?: ReportBlock[];
  [key: string]: unknown;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

type SceneFingerprintEntry = {
  key: string;
  label: string;
  value: string;
  valueLabel: string;
};

function getSceneFingerprintDimensionLabel(key: string, locale: Locale): string {
  switch (key) {
    case "novelty":
      return locale === "zh" ? "变化节奏" : "Novelty rhythm";
    case "structure":
      return locale === "zh" ? "结构偏好" : "Structure preference";
    case "social_energy":
      return locale === "zh" ? "社交能量" : "Social energy";
    case "cooperation":
      return locale === "zh" ? "合作方式" : "Cooperation style";
    case "stress_posture":
      return locale === "zh" ? "压力姿态" : "Stress posture";
    default:
      return locale === "zh" ? "场景线索" : "Scene cue";
  }
}

function getSceneFingerprintValueLabel(value: string, locale: Locale): string {
  switch (value) {
    case "exploratory":
      return locale === "zh" ? "更探索" : "more exploratory";
    case "grounded":
      return locale === "zh" ? "更务实" : "more grounded";
    case "structured":
      return locale === "zh" ? "更有序" : "more structured";
    case "adaptive":
      return locale === "zh" ? "更灵活" : "more adaptive";
    case "outward":
      return locale === "zh" ? "更外放" : "more outward";
    case "reserved":
      return locale === "zh" ? "更克制" : "more reserved";
    case "harmonizing":
      return locale === "zh" ? "更体谅" : "more harmonizing";
    case "direct":
      return locale === "zh" ? "更直接" : "more direct";
    case "sensitive":
      return locale === "zh" ? "更敏感" : "more sensitive";
    case "steady":
      return locale === "zh" ? "更稳定" : "more steady";
    case "responsive":
      return locale === "zh" ? "相对敏感" : "responsive";
    case "balanced":
      return locale === "zh" ? "相对平衡" : "balanced";
    default:
      return locale === "zh" ? "相对平衡" : "balanced";
  }
}

function buildSceneFingerprintEntries(projection: Big5PublicProjection, locale: Locale): SceneFingerprintEntry[] {
  if (Array.isArray(projection.scene_fingerprint_display)) {
    return projection.scene_fingerprint_display
      .map((entry, index) => {
        const record = asRecord(entry);
        const key = normalizeText(record?.key, `scene-${index}`);
        const value = normalizeText(record?.value);
        return {
          key,
          label: normalizeText(record?.label, getSceneFingerprintDimensionLabel(key, locale)),
          value,
          valueLabel: normalizeText(record?.value_label, getSceneFingerprintValueLabel(value, locale)),
        };
      })
      .filter((entry) => entry.label.length > 0 && entry.valueLabel.length > 0);
  }

  if (!projection.scene_fingerprint || typeof projection.scene_fingerprint !== "object") {
    return [];
  }

  return Object.entries(projection.scene_fingerprint)
    .map(([key, value]) => {
      const rawValue = normalizeText(value);
      return {
        key,
        label: getSceneFingerprintDimensionLabel(key, locale),
        value: rawValue,
        valueLabel: getSceneFingerprintValueLabel(rawValue, locale),
      };
    })
    .filter((entry) => entry.valueLabel.length > 0);
}

function resolveVariantLabel(locale: Locale, locked: boolean): string {
  if (!locked) {
    return locale === "zh" ? "完整版" : "Full report";
  }

  return locale === "zh" ? "免费预览" : "Free preview";
}

function pickSectionTitles(sections: ReportSection[], limit = 3): string[] {
  const result: string[] = [];
  for (const section of sections) {
    const title = normalizeText(section.title, section.key);
    if (!title || result.includes(title)) {
      continue;
    }
    result.push(title);
    if (result.length >= limit) {
      break;
    }
  }
  return result;
}

function getSectionAnchorId(sectionKey: unknown): string {
  const normalized = normalizeText(sectionKey, "section").replace(/[^a-z0-9_-]+/gi, "-").toLowerCase();
  return `big5-section-${normalized || "section"}`;
}

function getFirstSentence(value: string): string {
  const normalized = normalizeText(value);
  if (!normalized) {
    return "";
  }

  const match = normalized.match(/^(.{1,120}?[。！？.!?])\s*/);
  return match?.[1] ?? normalized.slice(0, 120);
}

function getBig5CompareHref(locale: Locale): string {
  return localizedPath("/history/big5/compare", locale);
}

function Big5ProjectionSummary({
  locale,
  projection,
}: {
  locale: Locale;
  projection: Big5PublicProjection;
}) {
  const dominantTraits = Array.isArray(projection.dominant_traits) ? projection.dominant_traits : [];
  const variantKeys = Array.isArray(projection.variant_keys) ? projection.variant_keys : [];
  const explainability = asRecord(projection.explainability_summary);
  const actionPlan = asRecord(projection.action_plan_summary);
  const comparative = asRecord(projection.comparative_v1);
  const controlledNarrative = asRecord(projection.controlled_narrative_v1);
  const culturalCalibration = asRecord(projection.cultural_calibration_v1);
  const comparativePercentile = asRecord(comparative?.percentile);
  const comparativePosition = asRecord(comparative?.cohort_relative_position);
  const comparativeSameType = asRecord(comparative?.same_type_contrast);
  const comparativePercentileLabel = normalizeText(comparativePercentile?.metric_label);
  const comparativePercentileValue = normalizeNumber(comparativePercentile?.value);
  const comparativePositionLabel = normalizeText(comparativePosition?.label);
  const comparativePositionSummary = normalizeText(comparativePosition?.summary);
  const comparativeSameTypeLabel = normalizeText(comparativeSameType?.label);
  const comparativeSameTypeSummary = normalizeText(comparativeSameType?.summary);
  const comparativeFingerprint = normalizeText(comparative?.comparative_fingerprint);
  const normingVersion = normalizeText(comparative?.norming_version);
  const normingScope = normalizeText(comparative?.norming_scope);
  const normingSource = normalizeText(comparative?.norming_source);
  const narrativeIntro = normalizeText(controlledNarrative?.narrative_intro);
  const narrativeSummary = normalizeText(controlledNarrative?.narrative_summary);
  const narrativeRuntimeMode = normalizeText(controlledNarrative?.runtime_mode);
  const calibrationIntro = normalizeText(asRecord(culturalCalibration?.narrative_overrides)?.intro);
  const calibrationSummary = normalizeText(asRecord(culturalCalibration?.narrative_overrides)?.summary);
  const calibrationFingerprint = normalizeText(culturalCalibration?.calibration_fingerprint);
  const localeContext = normalizeText(culturalCalibration?.locale_context);
  const culturalContext = normalizeText(culturalCalibration?.cultural_context);
  const sceneFingerprint = buildSceneFingerprintEntries(projection, locale);

  return (
    <Card data-testid="big5-foundation-summary" className="border-slate-200 bg-white shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {locale === "zh" ? "Big Five 基础画像" : "Big Five Foundation"}
          </p>
          {narrativeIntro || narrativeSummary ? (
            <div
              data-testid="big5-controlled-narrative"
              data-runtime-mode={narrativeRuntimeMode || undefined}
              className="rounded-xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-sky-900"
            >
              {narrativeIntro ? <p className="m-0 font-semibold uppercase tracking-[0.12em] text-sky-700">{narrativeIntro}</p> : null}
              {narrativeSummary ? <p className="m-0 mt-2 leading-7">{narrativeSummary}</p> : null}
            </div>
          ) : null}
          {comparativePercentileValue !== null ? (
            <div
              data-testid="big5-comparative"
              data-comparative-fingerprint={comparativeFingerprint || undefined}
              data-norming-version={normingVersion || undefined}
              data-norming-scope={normingScope || undefined}
              data-norming-source={normingSource || undefined}
              className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-900"
            >
              <p className="m-0 font-semibold uppercase tracking-[0.12em] text-violet-700">
                {locale === "zh" ? "相对参照" : "Comparative reference"}
              </p>
              <p className="m-0 mt-2 leading-7">
                {locale === "zh"
                  ? `${comparativePercentileLabel || "主特质"} 位于第 ${comparativePercentileValue} 百分位。${comparativePositionLabel || comparativePositionSummary}`
                  : `${comparativePercentileLabel || "Lead trait"} lands at the ${comparativePercentileValue}th percentile. ${comparativePositionLabel || comparativePositionSummary}`}
              </p>
              {comparativeSameTypeLabel || comparativeSameTypeSummary ? (
                <p className="m-0 mt-2 text-xs leading-6 text-violet-800">
                  {[comparativeSameTypeLabel, comparativeSameTypeSummary].filter(Boolean).join(" · ")}
                </p>
              ) : null}
            </div>
          ) : null}
          {calibrationIntro || calibrationSummary ? (
            <div
              data-testid="big5-cultural-calibration"
              data-locale-context={localeContext || undefined}
              data-cultural-context={culturalContext || undefined}
              data-calibration-fingerprint={calibrationFingerprint || undefined}
              className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900"
            >
              {calibrationIntro ? (
                <p className="m-0 font-semibold uppercase tracking-[0.12em] text-amber-700">{calibrationIntro}</p>
              ) : null}
              {calibrationSummary ? <p className="m-0 mt-2 leading-7">{calibrationSummary}</p> : null}
            </div>
          ) : null}
          {typeof explainability?.headline === "string" && explainability.headline.trim().length > 0 ? (
            <p className="m-0 text-base leading-7 text-slate-700">{explainability.headline}</p>
          ) : null}
        </div>

        {dominantTraits.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {dominantTraits.map((trait, index) => {
              const traitRecord = asRecord(trait);
              const label = normalizeText(traitRecord?.label, traitRecord?.key, `Trait ${index + 1}`);
              const percentile = normalizeNumber(traitRecord?.percentile);
              return (
                <span
                  key={`${label}-${index}`}
                  className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                >
                  {label}
                  {percentile !== null ? ` · ${percentile}` : ""}
                </span>
              );
            })}
          </div>
        ) : null}

        {sceneFingerprint.length > 0 ? (
          <div className="grid gap-2 sm:grid-cols-2" data-testid="big5-scene-fingerprint">
            {sceneFingerprint.map((entry) => (
              <div key={entry.key} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">{entry.label}</span>
                <span className="text-slate-500"> · </span>
                <span>{entry.valueLabel}</span>
              </div>
            ))}
          </div>
        ) : null}

        {typeof actionPlan?.headline === "string" && actionPlan.headline.trim().length > 0 ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900" data-testid="big5-action-plan-summary">
            {actionPlan.headline}
          </div>
        ) : null}

        {variantKeys.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {variantKeys.slice(0, 6).map((key) => (
              <span
                key={key}
                className="inline-flex rounded-full border border-white/80 bg-white px-2.5 py-1 text-xs text-slate-600 shadow-[0_6px_14px_rgba(15,23,42,0.05)]"
              >
                {key}
              </span>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function Big5ResultShell({
  locale,
  attemptId,
  reportLocked,
  accessProjection,
  headline,
  formSummaryLabel,
  tags,
  dimensions,
  projection,
  normsStatus,
  qualityLevel,
  visibleSections,
  lockedSections,
  recommendedOffers,
}: {
  locale: Locale;
  attemptId: string;
  reportLocked: boolean;
  accessProjection?: AttemptReportAccessView | null;
  headline: Headline;
  formSummaryLabel?: string | null;
  tags: string[];
  dimensions: Array<Record<string, unknown>>;
  projection: Big5PublicProjection | null;
  normsStatus: string;
  qualityLevel: string;
  visibleSections: ReportSection[];
  lockedSections: ReportSection[];
  recommendedOffers: OfferPayload[];
}) {
  const isZh = locale === "zh";
  const retakeHref = localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN}/take`, locale);
  const historyHref = accessProjection?.actions.historyHref ?? localizedPath("/history/big5", locale);
  const compareHref = getBig5CompareHref(locale);
  const actionPlanHref = `#${getSectionAnchorId("action_plan")}`;
  const toolsHref = "#big5-tools";
  const pdfAttemptId = accessProjection?.attemptId ?? attemptId;
  const visibleTitles = pickSectionTitles(visibleSections, 4);
  const lockedTitles = pickSectionTitles(lockedSections, 4);
  const tocSections = visibleSections.filter((section) => normalizeText(section.key, section.title));
  const conciseHeroSummary = getFirstSentence(headline.summary);
  const previewSummary = isZh
    ? BIG5_V1_SHELL_MICROCOPY.hero.preview_summary_zh
    : BIG5_V1_SHELL_MICROCOPY.hero.preview_summary_en;
  const fullSummary = isZh
    ? "本页已按摘要、五维、facet、相对参照与行动建议组织成连续阅读路径。"
    : "This page now organizes the summary, domains, facets, comparison, and actions into one reading path.";

  return (
    <div
      data-testid="big5-result-shell"
      data-domain-id="self_understanding"
      data-domain-role="primary"
      data-domain-envelope-state="metadata_only"
      className="space-y-8"
    >
      <SelfUnderstandingDomainBadge locale={locale} />
      <Card className="overflow-hidden border-slate-200 bg-gradient-to-br from-white via-sky-50/70 to-emerald-50/60 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">
              {headline.badge || (isZh ? "Big Five" : "Big Five")}
            </span>
            {formSummaryLabel ? (
              <span
                data-testid="big5-form-summary"
                className="inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-600"
              >
                {formSummaryLabel}
              </span>
            ) : null}
            <span className="inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              {resolveVariantLabel(locale, reportLocked)}
            </span>
            {qualityLevel ? (
              <span className="inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {isZh ? "质量" : "Quality"} · {qualityLevel.toUpperCase()}
              </span>
            ) : null}
            {normsStatus ? (
              <span className="inline-flex rounded-full border border-white/80 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                {isZh ? "常模" : "Norms"} · {normsStatus.toUpperCase()}
              </span>
            ) : null}
          </div>

          <div className="space-y-3">
            <h2 className="m-0 text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
              {headline.typeCode}
              {headline.displayName ? <span className="text-slate-600"> · {headline.displayName}</span> : null}
            </h2>
            {headline.supportingLine ? (
              <p className="m-0 text-lg font-medium text-slate-700">{headline.supportingLine}</p>
            ) : null}
            {conciseHeroSummary ? (
              <p data-testid="big5-shell-concise-summary" className="m-0 max-w-3xl text-base leading-8 text-slate-700">
                {conciseHeroSummary}
              </p>
            ) : null}
            {headline.rarity ? (
              <p className="m-0 text-sm text-slate-500">
                {isZh ? "稀有度：" : "Rarity: "}
                {headline.rarity}
              </p>
            ) : null}
            <p className="m-0 text-sm leading-7 text-slate-700">{reportLocked ? previewSummary : fullSummary}</p>
          </div>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full border border-white/80 bg-white/90 px-3 py-1 text-sm text-slate-700 shadow-[0_8px_18px_rgba(15,23,42,0.05)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          <div data-testid="big5-dimensions">
            <DimensionBars dimensions={dimensions} />
          </div>

          <div data-testid="big5-access-summary" className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {isZh ? BIG5_V1_SHELL_MICROCOPY.hero.unlocked_now_title_zh : BIG5_V1_SHELL_MICROCOPY.hero.unlocked_now_title_en}
              </p>
              {visibleTitles.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {visibleTitles.map((title) => (
                    <span
                      key={title}
                      className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="m-0 mt-2 text-sm text-slate-600">
                  {isZh ? "当前已展示基础画像与关键摘要。" : "The profile foundation and key summary are already visible."}
                </p>
              )}
            </div>

            <div className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                {reportLocked
                  ? (isZh ? BIG5_V1_SHELL_MICROCOPY.hero.unlock_more_title_zh : BIG5_V1_SHELL_MICROCOPY.hero.unlock_more_title_en)
                  : (isZh ? BIG5_V1_SHELL_MICROCOPY.hero.full_now_title_zh : BIG5_V1_SHELL_MICROCOPY.hero.full_now_title_en)}
              </p>
              {lockedTitles.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {lockedTitles.map((title) => (
                    <span
                      key={title}
                      className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="m-0 mt-2 text-sm text-slate-600">
                  {reportLocked
                    ? (isZh ? "完整报告还包含更深入的维度解释与行动建议。" : "The full report also includes deeper domain interpretation and action guidance.")
                    : (isZh ? "你已进入完整阅读路径，可继续逐节展开。": "You already have the full reading path unlocked.")}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {projection ? <Big5ProjectionSummary locale={locale} projection={projection} /> : null}

      <section id="big5-tools" data-testid="big5-actions-card" className="scroll-mt-24 space-y-4">
        <div className="space-y-1">
          <h3 className="m-0 text-2xl font-semibold text-slate-950">
            {isZh ? "继续怎么用这份结果" : "What to do next"}
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div data-testid="big5-pdf-entry" className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="m-0 text-sm font-semibold text-slate-950">{isZh ? "保存报告" : "Save report"}</p>
            <p className="m-0 mt-1 min-h-10 text-sm leading-6 text-slate-600">
              {isZh
                ? "PDF 导出已安全暂停，避免私有结果链接进入文件页脚。"
                : "PDF export is paused to keep private result links out of file footers."}
            </p>
            {pdfAttemptId ? (
              <div className="mt-3">
                <PdfDownloadButton
                  attemptId={pdfAttemptId}
                  locked={reportLocked}
                  accessProjection={accessProjection}
                  locale={locale}
                  safetyDisabled
                  safetyDisabledLabel={isZh ? "PDF 暂不可用" : "PDF unavailable"}
                  safetyDisabledReason={
                    isZh
                      ? "我们会在安全 PDF 导出路径恢复后重新开放下载。"
                      : "Download will return after the safe PDF export path is restored."
                  }
                />
              </div>
            ) : null}
          </div>
          <div data-testid="big5-history-entry" className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="m-0 text-sm font-semibold text-slate-950">{isZh ? "查看历史" : "View history"}</p>
            <p className="m-0 mt-1 min-h-10 text-sm leading-6 text-slate-600">
              {isZh ? "把这次结果放回你的 Big Five 记录里看。" : "Review this result alongside your Big Five history."}
            </p>
            <Link href={historyHref} className={`${buttonVariants({ variant: "outline" })} mt-3`}>
              {isZh ? "历史记录" : "History"}
            </Link>
          </div>
          <div data-testid="big5-compare-entry" className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="m-0 text-sm font-semibold text-slate-950">{isZh ? "对比变化" : "Compare changes"}</p>
            <p className="m-0 mt-1 min-h-10 text-sm leading-6 text-slate-600">
              {isZh ? "对比近两次结果，观察稳定项与变化项。" : "Compare recent results to separate stable signals from change."}
            </p>
            <Link href={compareHref} className={`${buttonVariants({ variant: "outline" })} mt-3`}>
              {isZh ? "对比近两次" : "Compare"}
            </Link>
          </div>
          <div data-testid="big5-retake-entry" className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="m-0 text-sm font-semibold text-slate-950">{isZh ? "重新测一次" : "Retake"}</p>
            <p className="m-0 mt-1 min-h-10 text-sm leading-6 text-slate-600">
              {isZh ? "当状态或阶段变化后，用同一入口更新结果。" : "Use the same entry when your context has changed."}
            </p>
            <Link href={retakeHref} className={`${buttonVariants({ variant: "outline" })} mt-3`}>
              {isZh ? "重新测试" : "Retake test"}
            </Link>
          </div>
        </div>
      </section>

      {tocSections.length > 0 ? (
        <nav
          id="big5-on-this-page"
          data-testid="big5-on-this-page"
          aria-label={isZh ? "本页目录" : "On this page"}
          className="sticky top-3 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.08)] backdrop-blur"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <p className="m-0 shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {isZh ? "本页目录" : "On this page"}
            </p>
            <div className="flex flex-wrap gap-2">
              {tocSections.map((section) => (
                <Link
                  key={`${section.key ?? section.title}-toc`}
                  href={`#${getSectionAnchorId(section.key ?? section.title)}`}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800"
                >
                  {normalizeText(section.title, section.key)}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      ) : null}

      {visibleSections.length > 0 ? (
        <div data-testid="big5-sections" className="space-y-4">
          {visibleSections.map((section) => (
            <SectionRenderer
              key={section.key ?? section.title ?? "section"}
              section={section}
              locked={false}
              locale={locale}
              scaleCode="BIG5_OCEAN"
              normsStatus={normsStatus}
            />
          ))}
        </div>
      ) : null}

      <section data-testid="big5-continuation-strip" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="space-y-1">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            {isZh ? "下一步路径" : "Next steps"}
          </p>
          <h3 className="m-0 text-2xl font-semibold text-slate-950">
            {isZh ? "把结果带回真实场景" : "Carry the result into real contexts"}
          </h3>
          <p className="m-0 text-sm leading-7 text-slate-600">
            {isZh
              ? "这不是新的业务入口，而是把已有 PDF、历史、对比和行动建议组织成连续使用路径。"
              : "This uses the existing PDF, history, comparison, and action anchors as one continuation path."}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          <Link data-testid="big5-action-anchor-entry" href={actionPlanHref} className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950 transition hover:border-emerald-300 hover:bg-emerald-100">
            <span className="text-sm font-semibold">{isZh ? "回到行动建议" : "Return to actions"}</span>
            <span className="mt-2 block text-sm leading-6 text-emerald-900">
              {isZh ? "从工作、关系、恢复和成长的场景动作开始。" : "Start from workplace, relationships, recovery, and growth actions."}
            </span>
          </Link>
          <Link href={historyHref} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900 transition hover:border-slate-300 hover:bg-white">
            <span className="text-sm font-semibold">{isZh ? "历史轨迹" : "History"}</span>
            <span className="mt-2 block text-sm leading-6 text-slate-600">
              {isZh ? "查看本次结果在历史记录中的位置。" : "See where this result sits in your history."}
            </span>
          </Link>
          <Link href={compareHref} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900 transition hover:border-slate-300 hover:bg-white">
            <span className="text-sm font-semibold">{isZh ? "对比近两次" : "Compare recent results"}</span>
            <span className="mt-2 block text-sm leading-6 text-slate-600">
              {isZh ? "用对比判断哪些信号稳定、哪些可能受阶段影响。" : "Separate stable signals from stage-specific movement."}
            </span>
          </Link>
          <Link href={toolsHref} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-slate-900 transition hover:border-slate-300 hover:bg-white">
            <span className="text-sm font-semibold">{isZh ? "保存与复测" : "Save and retake"}</span>
            <span className="mt-2 block text-sm leading-6 text-slate-600">
              {isZh ? "回到工具区查看报告操作，或在阶段变化后重新测试。" : "Return to tools for report actions or a later retake."}
            </span>
          </Link>
        </div>
      </section>

      {lockedSections.length > 0 ? (
        <div data-testid="big5-locked-sections" className="space-y-4">
          {lockedSections.map((section) => (
            <SectionRenderer
              key={section.key ?? section.title ?? "locked-section"}
              section={section}
              locked
              locale={locale}
              scaleCode="BIG5_OCEAN"
              ctaLabel={isZh ? "解锁完整报告" : "Unlock full report"}
              normsStatus={normsStatus}
            />
          ))}
        </div>
      ) : null}

      {recommendedOffers.length > 0 ? (
        <section data-testid="big5-offer-surface" className="space-y-4">
          <div className="space-y-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              {isZh ? BIG5_V1_SHELL_MICROCOPY.offer.eyebrow_zh : BIG5_V1_SHELL_MICROCOPY.offer.eyebrow_en}
            </p>
            <h3 className="m-0 text-2xl font-semibold text-slate-950">
              {isZh ? BIG5_V1_SHELL_MICROCOPY.offer.title_zh : BIG5_V1_SHELL_MICROCOPY.offer.title_en}
            </h3>
            <p className="m-0 text-sm leading-7 text-slate-600">
              {isZh ? BIG5_V1_SHELL_MICROCOPY.offer.summary_zh : BIG5_V1_SHELL_MICROCOPY.offer.summary_en}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {recommendedOffers.map((offer, index) => (
              <OfferCard key={`${offer.sku ?? offer.title ?? "offer"}-${index}`} offer={offer} locale={locale} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
