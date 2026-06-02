"use client";

import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";
import {
  getIqBankDisplayModel,
  getIqBankDisplayText,
  type IqBankDisplayKey,
} from "@/lib/iq/bankDisplay";
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

export type IqReportNarrativeSectionViewModel = {
  key: string;
  title: string | null;
  body: string | null;
  bullets: string[];
};

export type IqReportEntitlementState = "free" | "paid" | "unauthorized" | "error";

export type IqBankStatusViewModel = {
  key: IqBankDisplayKey;
  bankId: string;
  label: string;
  shortLabel: string;
  description: string;
  itemCount: number;
  availability: "future_placeholder";
  isTakeEnabled: false;
  ctaLabel: string;
  statusLabel: string;
  notice: string;
};

export type IqReportModuleViewModel = {
  unlockStage: "locked" | "unlocked_adaptive" | "unlocked_pro" | "unknown";
  entitlementState: IqReportEntitlementState;
  stateLabel: string;
  stateMessage: string;
  locked: boolean;
  lockedMessage: string | null;
  boundaryMessage: string;
  interpretationMessage: string;
  detailedReportMessage: string | null;
  sections: IqReportNarrativeSectionViewModel[];
  dimensions: IqDimensionCardViewModel[];
  bankStatus: IqBankStatusViewModel | null;
  pdfPlaceholder: string | null;
  certificatePlaceholder: string | null;
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
  bankStatus: IqBankStatusViewModel | null;
  locked: boolean;
  lockedMessage: string | null;
  reportModule: IqReportModuleViewModel;
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

function resolveIqBankStatus(
  locale: Locale,
  reportData: ReportResponse | null,
  resultData: ResultResponse | null
): IqBankStatusViewModel | null {
  const reportPayload = asRecord(reportData?.report);
  const resultPayload = asRecord(resultData?.result);
  const topResult = asRecord(resultData);
  const candidates = [
    normalizeText((reportData as Record<string, unknown> | null)?.bank_id),
    normalizeText((reportData as Record<string, unknown> | null)?.bankId),
    normalizeText((reportData as Record<string, unknown> | null)?.form_code),
    normalizeText((reportData as Record<string, unknown> | null)?.formCode),
    normalizeText(reportData?.meta?.bank_id),
    normalizeText(reportData?.meta?.form_code),
    normalizeText(reportPayload?.bank_id),
    normalizeText(reportPayload?.form_code),
    normalizeText(topResult?.bank_id),
    normalizeText(topResult?.form_code),
    normalizeText(resultData?.meta?.bank_id),
    normalizeText(resultData?.meta?.form_code),
    normalizeText(resultPayload?.bank_id),
    normalizeText(resultPayload?.form_code),
  ].filter((value): value is string => Boolean(value));

  const model = candidates.map((candidate) => getIqBankDisplayModel(candidate)).find(Boolean);
  if (!model || model.availability !== "future_placeholder" || model.isTakeEnabled) {
    return null;
  }

  const text = getIqBankDisplayText(model, locale);

  return {
    key: model.key,
    bankId: model.bankId,
    label: text.label,
    shortLabel: text.shortLabel,
    description: text.description,
    itemCount: model.itemCount,
    availability: "future_placeholder",
    isTakeEnabled: false,
    ctaLabel: text.ctaLabel,
    statusLabel: text.statusLabel,
    notice: locale === "zh"
      ? "该结果属于未来 50 题 beta 占位表单。后端题库、评分与常模 gate 完成前，前端不得开放答题入口。"
      : "This result belongs to the future 50-item beta placeholder. The frontend must not expose a take entry until backend item, scoring, and norm gates are complete.",
  };
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
      const record = asRecord(entry);
      if (!record) {
        return false;
      }

      const candidate = normalizeText(
        record.dimension,
        record.dimension_code,
        record.dimensionCode,
        record.code,
        record.key,
        record.id
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

export function getIqDeferredCommerceMessage(locale: Locale): string {
  return locale === "zh"
    ? "当前为免费预览。完整 IQ 报告详情需后端授权解锁后展示。"
    : "Free preview is active. Full IQ report details stay hidden until the backend entitlement unlocks this attempt.";
}

function resolveLockedMessage(
  locale: Locale,
  accessView: AttemptReportAccessView | null
): string | null {
  if (accessView?.accessState !== "locked") {
    return null;
  }

  return getIqDeferredCommerceMessage(locale);
}

function normalizeModuleCode(value: string): string {
  return value.trim().toLowerCase();
}

function reportModulesAllowed(reportData: ReportResponse | null): string[] {
  return Array.isArray(reportData?.modules_allowed) ? reportData.modules_allowed : [];
}

function hasIqFullEntitlement(accessView: AttemptReportAccessView | null, reportData: ReportResponse | null): boolean {
  const modules = [
    ...(accessView?.modulesAllowed ?? []),
    ...reportModulesAllowed(reportData),
  ].map(normalizeModuleCode);

  return modules.includes("iq_full");
}

function resolveIqPaidReportEntitlementState(
  accessView: AttemptReportAccessView | null,
  reportData: ReportResponse | null
): IqReportEntitlementState {
  if (!accessView) {
    return "error";
  }

  const reasonCode = (accessView.reasonCode ?? "").toLowerCase();
  if (/(unauthori[sz]ed|forbidden|ownership|owner|mismatch|permission)/.test(reasonCode)) {
    return "unauthorized";
  }

  if (
    accessView.accessState === "unavailable"
    || accessView.accessState === "expired"
    || accessView.accessState === "deleted"
    || accessView.reportState === "unavailable"
    || accessView.reportState === "expired"
    || accessView.reportState === "deleted"
  ) {
    return "error";
  }

  if (
    reportData?.locked === false
    && (
      accessView.unlockStage === "full"
      || accessView.accessLevel === "full"
      || accessView.variant === "full"
      || reportData.access_level === "full"
      || reportData.variant === "full"
      || hasIqFullEntitlement(accessView, reportData)
    )
  ) {
    return "paid";
  }

  if (accessView.accessState === "locked" || reportData?.locked === true || accessView.unlockStage === "locked") {
    return "free";
  }

  return "free";
}

function getIqReportStateCopy(locale: Locale, state: IqReportEntitlementState): { label: string; message: string } {
  if (locale === "zh") {
    return {
      free: {
        label: "免费预览",
        message: getIqDeferredCommerceMessage(locale),
      },
      paid: {
        label: "完整报告已解锁",
        message: "后端授权已确认，本页仅展示报告合约返回的完整报告内容。",
      },
      unauthorized: {
        label: "当前会话无权查看",
        message: "当前会话未获得该测评的完整报告授权，付费报告详情已隐藏。",
      },
      error: {
        label: "授权状态不可用",
        message: "报告授权状态暂不可用。恢复后才会展示完整报告详情。",
      },
    }[state];
  }

  return {
    free: {
      label: "Free preview",
      message: getIqDeferredCommerceMessage(locale),
    },
    paid: {
      label: "Full report unlocked",
      message: "Backend entitlement is active for this attempt. This page only renders full report content returned by the report contract.",
    },
    unauthorized: {
      label: "Not authorized for this session",
      message: "This session is not authorized for this attempt. Paid IQ report details are hidden.",
    },
    error: {
      label: "Entitlement state unavailable",
      message: "Report entitlement state is unavailable. Full IQ report details stay hidden until the backend contract recovers.",
    },
  }[state];
}

function resolveIqUnlockStage(
  accessView: AttemptReportAccessView | null,
  reportData: ReportResponse | null
): IqReportModuleViewModel["unlockStage"] {
  const reportPayload = asRecord(reportData?.report);
  const rawStage = normalizeText(
    reportData?.meta?.unlock_stage,
    (reportPayload?.meta as Record<string, unknown> | undefined)?.unlock_stage,
    reportData?.access_level,
    reportData?.variant
  )?.toLowerCase();

  if (accessView?.accessState === "locked" || accessView?.unlockStage === "locked" || reportData?.locked === true) {
    return "locked";
  }

  if (
    accessView?.unlockStage === "full"
    || rawStage === "unlocked_pro"
    || rawStage === "pro"
    || rawStage === "full"
  ) {
    return "unlocked_pro";
  }

  if (
    accessView?.unlockStage === "partial"
    || rawStage === "unlocked_adaptive"
    || rawStage === "adaptive"
    || rawStage === "partial"
  ) {
    return "unlocked_adaptive";
  }

  return "unknown";
}

function resolveReportNarrativeSource(reportData: ReportResponse | null): unknown[] {
  const topLevel = asRecord(reportData);
  const reportPayload = asRecord(reportData?.report);
  const topLevelIqPro = asRecord(topLevel?.iq_pro);
  const nestedIqPro = asRecord(reportPayload?.iq_pro);

  const candidates = [
    asArray(topLevelIqPro?.narrative_sections),
    asArray(nestedIqPro?.narrative_sections),
    asArray(reportPayload?.narrative_sections),
    asArray(reportPayload?.sections),
  ];

  return candidates.find((candidate) => candidate.length > 0) ?? [];
}

function resolveNarrativeSections(reportData: ReportResponse | null): IqReportNarrativeSectionViewModel[] {
  return resolveReportNarrativeSource(reportData)
    .map((entry, index) => {
      const record = asRecord(entry);
      if (!record) {
        return null;
      }

      const title = normalizeText(record.title, record.heading, record.label);
      const body = normalizeText(record.body, record.summary, record.text, record.content);
      const bullets = normalizeStringArray(record.bullets ?? record.points ?? record.takeaways);

      if (!title && !body && bullets.length === 0) {
        return null;
      }

      return {
        key: normalizeText(record.section_id, record.id, record.key, title) ?? `iq-section-${index + 1}`,
        title,
        body,
        bullets,
      } satisfies IqReportNarrativeSectionViewModel;
    })
    .filter((entry): entry is IqReportNarrativeSectionViewModel => Boolean(entry));
}

function hasPdfPayload(reportData: ReportResponse | null): boolean {
  const topLevel = asRecord(reportData);
  const reportPayload = asRecord(reportData?.report);
  const topLevelIqPro = asRecord(topLevel?.iq_pro);
  const nestedIqPro = asRecord(reportPayload?.iq_pro);
  return Boolean(
    asRecord(topLevelIqPro?.pdf_payload)
      ?? asRecord(nestedIqPro?.pdf_payload)
      ?? asRecord(reportPayload?.pdf_payload)
  );
}

function hasCertificatePayload(reportData: ReportResponse | null): boolean {
  const topLevel = asRecord(reportData);
  const reportPayload = asRecord(reportData?.report);
  const topLevelIqPro = asRecord(topLevel?.iq_pro);
  const nestedIqPro = asRecord(reportPayload?.iq_pro);
  return Boolean(
    asRecord(topLevelIqPro?.certificate_payload)
      ?? asRecord(nestedIqPro?.certificate_payload)
      ?? asRecord(reportPayload?.certificate_payload)
  );
}

function getIqMethodBoundaryMessage(locale: Locale): string {
  return locale === "zh"
    ? "本结果是在线认知能力估测，不是临床诊断。请结合置信区间和作答质量理解结果。"
    : "This result is an online cognitive ability estimate, not a clinical diagnosis. Interpret it together with the confidence interval and response quality.";
}

function getIqInterpretationMessage({
  locale,
  qualityLevel,
  qualityFlags,
  stabilityStatus,
  stabilityReason,
}: {
  locale: Locale;
  qualityLevel: string | null;
  qualityFlags: string[];
  stabilityStatus: string | null;
  stabilityReason: string | null;
}): string {
  const cautionSignals = [
    stabilityStatus?.toLowerCase() ?? "",
    stabilityReason?.toLowerCase() ?? "",
    qualityLevel?.toLowerCase() ?? "",
    ...qualityFlags.map((flag) => flag.toLowerCase()),
  ].join(" ");

  if (/(unstable|preliminary|caution|pending|review)/.test(cautionSignals)) {
    return locale === "zh"
      ? "当前结果仍应结合稳定性状态、质量标记和置信区间审慎理解。"
      : "Interpret this result with caution alongside its stability status, quality flags, and confidence interval.";
  }

  return locale === "zh"
    ? "各维度结果描述的是本次测验中的表现结构，不代表全部能力。"
    : "Dimension results describe the structure of performance in this test, not total human ability.";
}

function getDetailedReportUnavailableMessage(locale: Locale): string {
  return locale === "zh"
    ? "详细报告内容暂未开放。"
    : "Detailed report content is not available yet.";
}

function buildReportModuleViewModel({
  locale,
  reportData,
  accessView,
  dimensions,
  qualityLevel,
  qualityFlags,
  stabilityStatus,
  stabilityReason,
  bankStatus,
}: {
  locale: Locale;
  reportData: ReportResponse | null;
  accessView: AttemptReportAccessView | null;
  dimensions: IqDimensionCardViewModel[];
  qualityLevel: string | null;
  qualityFlags: string[];
  stabilityStatus: string | null;
  stabilityReason: string | null;
  bankStatus: IqBankStatusViewModel | null;
}): IqReportModuleViewModel {
  const entitlementState = resolveIqPaidReportEntitlementState(accessView, reportData);
  const stateCopy = getIqReportStateCopy(locale, entitlementState);
  const paidEntitlementActive = entitlementState === "paid";
  const sections = paidEntitlementActive ? resolveNarrativeSections(reportData) : [];
  const locked = entitlementState === "free" || entitlementState === "unauthorized" || entitlementState === "error";
  const unlockStage = resolveIqUnlockStage(accessView, reportData);
  const pdfReady = paidEntitlementActive && hasPdfPayload(reportData);
  const certificateReady = paidEntitlementActive && hasCertificatePayload(reportData);

  return {
    unlockStage,
    entitlementState,
    stateLabel: stateCopy.label,
    stateMessage: stateCopy.message,
    locked,
    lockedMessage: locked ? stateCopy.message : null,
    boundaryMessage: getIqMethodBoundaryMessage(locale),
    interpretationMessage: getIqInterpretationMessage({
      locale,
      qualityLevel,
      qualityFlags,
      stabilityStatus,
      stabilityReason,
    }),
    detailedReportMessage:
      locked || sections.length > 0 || pdfReady || certificateReady
        ? null
        : getDetailedReportUnavailableMessage(locale),
    sections,
    dimensions: paidEntitlementActive ? dimensions : dimensions.map((dimension) => ({
      ...dimension,
      rawScore: null,
      scaledScore: null,
      normalizedScore: null,
      percentile: null,
      band: null,
      insight: null,
      missing: true,
    })),
    bankStatus,
    pdfPlaceholder: pdfReady
      ? locale === "zh"
        ? "PDF 报告能力已生成，但当前前端版本暂不支持下载。"
        : "A PDF report payload is available, but this frontend version does not support downloads yet."
      : null,
    certificatePlaceholder: certificateReady
      ? locale === "zh"
        ? "证书能力已生成，但当前前端版本暂不支持下载。"
        : "A certificate payload is available, but this frontend version does not support downloads yet."
      : null,
  };
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
  const dimensions = IQ_DIMENSION_ORDER.map((descriptor) =>
    buildDimensionCard(locale, descriptor, reportData, resultData)
  );
  const bankStatus = resolveIqBankStatus(locale, reportData, resultData);

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
    dimensions,
    bankStatus,
    locked: accessView?.accessState === "locked",
    lockedMessage: resolveLockedMessage(locale, accessView),
    reportModule: buildReportModuleViewModel({
      locale,
      reportData,
      accessView,
      dimensions,
      qualityLevel: quality.level,
      qualityFlags: quality.flags,
      stabilityStatus: stability.status,
      stabilityReason: stability.reason,
      bankStatus,
    }),
  };
}
