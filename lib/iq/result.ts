"use client";

import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";
import {
  IQ_CANONICAL_SCALE_CODE,
  IQ_LEGACY_SCALE_CODE,
  type IqReportDimensionField,
} from "@/lib/iq/constants";
import type { Locale } from "@/lib/i18n/locales";

export type IqResultMetricValue = number | string | null;

export type IqConfidenceIntervalViewModel = {
  lower: IqResultMetricValue;
  upper: IqResultMetricValue;
  level: string | null;
};

export type IqDimensionCardViewModel = {
  key: IqReportDimensionField;
  code: "VSI" | "VSPR" | "NPR";
  label: string;
  rawScore: IqResultMetricValue;
  scaledScore: IqResultMetricValue;
  normalizedScore: IqResultMetricValue;
  percentile: IqResultMetricValue;
  band: string | null;
  insight: string | null;
  missing: boolean;
};

export type IqResultViewModel = {
  scaleCode: typeof IQ_CANONICAL_SCALE_CODE | typeof IQ_LEGACY_SCALE_CODE | null;
  title: string;
  summary: string | null;
  rawScore: IqResultMetricValue;
  iqEstimate: IqResultMetricValue;
  percentile: IqResultMetricValue;
  confidenceInterval: IqConfidenceIntervalViewModel | null;
  qualityLevel: string | null;
  qualityFlags: string[];
  stabilityStatus: string | null;
  stabilityReason: string | null;
  reasonCode: string | null;
  dimensions: IqDimensionCardViewModel[];
  locked: boolean;
  lockedMessage: string | null;
};

const IQ_DIMENSION_ORDER: Array<{
  key: IqReportDimensionField;
  code: "VSI" | "VSPR" | "NPR";
  label: {
    zh: string;
    en: string;
  };
}> = [
  {
    key: "visual_spatial_insight",
    code: "VSI",
    label: {
      zh: "视觉空间洞察",
      en: "Visual-Spatial Insight",
    },
  },
  {
    key: "visual_spatial_pattern_reasoning",
    code: "VSPR",
    label: {
      zh: "视觉空间模式推理",
      en: "Visual-Spatial Pattern Reasoning",
    },
  },
  {
    key: "numerical_pattern_reasoning",
    code: "NPR",
    label: {
      zh: "数字规律推理",
      en: "Numerical Pattern Reasoning",
    },
  },
];

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function asArray<T = unknown>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeText(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value !== "string") {
      continue;
    }

    const normalized = value.trim();
    if (normalized) {
      return normalized;
    }
  }

  return null;
}

function normalizeMetricValue(value: unknown): IqResultMetricValue {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized ? normalized : null;
  }

  return null;
}

function normalizeStringArray(value: unknown): string[] {
  return asArray(value)
    .map((item) => normalizeText(item))
    .filter((item): item is string => Boolean(item));
}

function resolveScaleCode(
  reportData: ReportResponse | null,
  resultData: ResultResponse | null
): typeof IQ_CANONICAL_SCALE_CODE | typeof IQ_LEGACY_SCALE_CODE | null {
  const reportPayload = asRecord(reportData?.report);
  const topResult = asRecord(resultData);
  const candidates = [
    normalizeText(reportData?.scale_code),
    normalizeText(reportData?.meta?.scale_code),
    normalizeText(reportPayload?.scale_code),
    normalizeText(topResult?.scale_code),
    normalizeText(resultData?.meta?.scale_code),
    normalizeText(asRecord(resultData?.result)?.scale_code),
  ]
    .map((value) => value?.toUpperCase() ?? "")
    .filter(Boolean);

  for (const candidate of candidates) {
    if (candidate === IQ_CANONICAL_SCALE_CODE || candidate === IQ_LEGACY_SCALE_CODE) {
      return candidate;
    }
  }

  return null;
}

function resolveSummaryText(
  reportData: ReportResponse | null,
  resultData: ResultResponse | null
): string | null {
  const reportPayload = asRecord(reportData?.report);
  const resultPayload = asRecord(resultData?.result);

  return normalizeText(
    reportData?.summary,
    reportPayload?.summary,
    resultPayload?.summary
  );
}

function resolveConfidenceInterval(
  reportData: ReportResponse | null,
  resultData: ResultResponse | null
): IqConfidenceIntervalViewModel | null {
  const reportSummary = asRecord(reportData?.summary);
  const resultPayload = asRecord(resultData?.result);
  const topResult = asRecord(resultData);
  const interval =
    asRecord(reportSummary?.confidence_interval) ??
    asRecord(topResult?.confidence_interval) ??
    asRecord(resultPayload?.confidence_interval);

  if (!interval) {
    return null;
  }

  const lower = normalizeMetricValue(interval.lower ?? interval.min);
  const upper = normalizeMetricValue(interval.upper ?? interval.max);
  const level = normalizeText(interval.level);

  if (lower === null && upper === null && level === null) {
    return null;
  }

  return {
    lower,
    upper,
    level,
  };
}

function resolveSummaryMetric(
  field: "raw_score" | "iq_estimate" | "percentile",
  reportData: ReportResponse | null,
  resultData: ResultResponse | null
): IqResultMetricValue {
  const reportSummary = asRecord(reportData?.summary);
  const reportPayload = asRecord(reportData?.report);
  const resultPayload = asRecord(resultData?.result);
  const topResult = asRecord(resultData);

  return normalizeMetricValue(
    reportSummary?.[field] ??
      topResult?.[field] ??
      resultPayload?.[field] ??
      reportPayload?.[field]
  );
}

function resolveQuality(
  reportData: ReportResponse | null,
  resultData: ResultResponse | null
): {
  level: string | null;
  flags: string[];
} {
  const reportPayload = asRecord(reportData?.report);
  const topResult = asRecord(resultData);
  const resultPayload = asRecord(resultData?.result);
  const quality =
    asRecord(reportData?.quality) ??
    asRecord(reportPayload?.quality) ??
    asRecord(topResult?.quality) ??
    asRecord(resultPayload?.quality);

  return {
    level: normalizeText(quality?.level),
    flags: normalizeStringArray(quality?.flags),
  };
}

function resolveStability(
  reportData: ReportResponse | null,
  resultData: ResultResponse | null
): {
  status: string | null;
  reason: string | null;
} {
  const topResult = asRecord(resultData);
  const resultPayload = asRecord(resultData?.result);
  const reportStability =
    asRecord(reportData?.stability) ??
    asRecord((reportData as Record<string, unknown> | null)?.result_stability);
  const resultStability =
    asRecord(topResult?.stability) ??
    asRecord(topResult?.result_stability) ??
    asRecord(resultPayload?.stability) ??
    asRecord(resultPayload?.result_stability);
  const stability = reportStability ?? resultStability;

  return {
    status: normalizeText(stability?.status),
    reason: normalizeText(stability?.reason),
  };
}

function resolveReasonCode(
  reportData: ReportResponse | null,
  resultData: ResultResponse | null
): string | null {
  const topResult = asRecord(resultData);
  const resultPayload = asRecord(resultData?.result);

  return normalizeText(
    topResult?.reason_code,
    resultPayload?.reason_code,
    reportData?.meta?.reason_code
  );
}

function resolveDimensionRecordByKey(
  key: IqReportDimensionField,
  reportData: ReportResponse | null,
  resultData: ResultResponse | null
): Record<string, unknown> | null {
  const reportPayload = asRecord(reportData?.report);
  const resultPayload = asRecord(resultData?.result);
  const reportDimensions =
    asRecord(reportData?.dimensions) ??
    asRecord(reportPayload?.dimensions);
  const resultDimensions =
    asRecord((resultData as Record<string, unknown> | null)?.dimensions) ??
    asRecord(resultPayload?.dimensions);

  const directMatch =
    asRecord(reportDimensions?.[key]) ??
    asRecord(resultDimensions?.[key]);
  if (directMatch) {
    return directMatch;
  }

  const dimensionArrays = [
    asArray<Record<string, unknown>>((resultData as Record<string, unknown> | null)?.dimensions),
    asArray<Record<string, unknown>>(resultPayload?.dimensions),
    asArray<Record<string, unknown>>(reportData?.dimensions),
    asArray<Record<string, unknown>>(reportPayload?.dimensions),
  ];

  const normalizedKey = key.toUpperCase();

  for (const dimensionArray of dimensionArrays) {
    const found = dimensionArray.find((entry) => {
      const candidate = normalizeText(
        entry.dimension,
        entry.dimension_code,
        entry.dimensionCode,
        entry.code,
        entry.key,
        entry.id
      )?.toUpperCase();

      return candidate === normalizedKey;
    });

    if (found) {
      return found;
    }
  }

  return null;
}

function buildDimensionCard(
  locale: Locale,
  descriptor: (typeof IQ_DIMENSION_ORDER)[number],
  reportData: ReportResponse | null,
  resultData: ResultResponse | null
): IqDimensionCardViewModel {
  const source = resolveDimensionRecordByKey(descriptor.key, reportData, resultData);

  return {
    key: descriptor.key,
    code: descriptor.code,
    label: descriptor.label[locale],
    rawScore: normalizeMetricValue(source?.raw_score ?? source?.rawScore ?? source?.score),
    scaledScore: normalizeMetricValue(source?.scaled_score ?? source?.scaledScore),
    normalizedScore: normalizeMetricValue(source?.normalized_score ?? source?.normalizedScore),
    percentile: normalizeMetricValue(source?.percentile),
    band: normalizeText(source?.band),
    insight: normalizeText(source?.insight, source?.summary, source?.description),
    missing: !source,
  };
}

function resolveLockedMessage(
  locale: Locale,
  accessView: AttemptReportAccessView | null
): string | null {
  if (accessView?.accessState !== "locked") {
    return null;
  }

  return locale === "zh"
    ? "完整报告解锁功能暂未开放。当前可查看已生成的基础结果。"
    : "Full report unlock is not available yet. You can view the available result summary.";
}

export function buildIqResultViewModel({
  locale,
  reportData,
  resultData,
  accessView,
}: {
  locale: Locale;
  reportData: ReportResponse | null;
  resultData: ResultResponse | null;
  accessView: AttemptReportAccessView | null;
}): IqResultViewModel {
  const quality = resolveQuality(reportData, resultData);
  const stability = resolveStability(reportData, resultData);

  return {
    scaleCode: resolveScaleCode(reportData, resultData),
    title: locale === "zh" ? "智商测试" : "IQ Test",
    summary: resolveSummaryText(reportData, resultData),
    rawScore: resolveSummaryMetric("raw_score", reportData, resultData),
    iqEstimate: resolveSummaryMetric("iq_estimate", reportData, resultData),
    percentile: resolveSummaryMetric("percentile", reportData, resultData),
    confidenceInterval: resolveConfidenceInterval(reportData, resultData),
    qualityLevel: quality.level,
    qualityFlags: quality.flags,
    stabilityStatus: stability.status,
    stabilityReason: stability.reason,
    reasonCode: resolveReasonCode(reportData, resultData),
    dimensions: IQ_DIMENSION_ORDER.map((descriptor) =>
      buildDimensionCard(locale, descriptor, reportData, resultData)
    ),
    locked: accessView?.accessState === "locked",
    lockedMessage: resolveLockedMessage(locale, accessView),
  };
}
