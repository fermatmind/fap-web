"use client";

import Link from "next/link";
import { DimensionBars } from "@/components/result/DimensionBars";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OfferCard } from "@/components/big5/paywall/OfferCard";
import { PdfDownloadButton } from "@/components/big5/pdf/PdfDownloadButton";
import { SectionRenderer } from "@/components/big5/report/SectionRenderer";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { Big5PublicProjection, OfferPayload } from "@/lib/api/v0_3";
import { BIG5_V1_SHELL_MICROCOPY } from "@/lib/big5/microcopy";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

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
  const sceneFingerprint = projection.scene_fingerprint && typeof projection.scene_fingerprint === "object"
    ? Object.entries(projection.scene_fingerprint)
    : [];

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
            {sceneFingerprint.map(([key, value]) => (
              <div key={key} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">{key}</span>
                <span className="text-slate-500"> · </span>
                <span>{value}</span>
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
  const pdfAttemptId = accessProjection?.attemptId ?? attemptId;
  const visibleTitles = pickSectionTitles(visibleSections, 4);
  const lockedTitles = pickSectionTitles(lockedSections, 4);
  const previewSummary = isZh
    ? BIG5_V1_SHELL_MICROCOPY.hero.preview_summary_zh
    : BIG5_V1_SHELL_MICROCOPY.hero.preview_summary_en;
  const fullSummary = isZh
    ? BIG5_V1_SHELL_MICROCOPY.hero.full_summary_zh
    : BIG5_V1_SHELL_MICROCOPY.hero.full_summary_en;

  return (
    <div data-testid="big5-result-shell" className="space-y-8">
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
            {headline.summary ? (
              <p className="m-0 max-w-3xl whitespace-pre-wrap text-base leading-8 text-slate-700">{headline.summary}</p>
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

      <Card data-testid="big5-actions-card" className="border-slate-200 bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl text-slate-950">{isZh ? "继续使用这个结果" : "Continue with this result"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {pdfAttemptId ? (
            <div data-testid="big5-pdf-entry">
              <PdfDownloadButton
                attemptId={pdfAttemptId}
                locked={reportLocked}
                accessProjection={accessProjection}
                locale={locale}
              />
            </div>
          ) : null}
          <Link href={retakeHref} className={buttonVariants({ variant: "outline" })}>
            {isZh ? "重新测试" : "Retake test"}
          </Link>
        </CardContent>
      </Card>

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
