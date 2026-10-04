import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";
import { IQ_BETA_50_BANK_ID, IQ_REPORT_DIMENSION_FIELD_MAP, isIqScaleCode, type IqDimensionCode } from "@/lib/iq/constants";
import type { Locale } from "@/lib/i18n/locales";

type RecordValue = Record<string, unknown>;
const DIMENSIONS: IqDimensionCode[] = ["VSPR", "VSI", "NPR"];

function record(value: unknown): RecordValue | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as RecordValue
    : null;
}

function number(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && !value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function count(value: unknown): number | null {
  const parsed = number(value);
  return parsed !== null && Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/** The dedicated IQ report is not part of the legacy rich-report renderer. */
export function isIqReportResponse(response: ReportResponse | null): boolean {
  const outer = record(response);
  const payload = record(outer?.report) ?? outer;
  return payload?.schema_version === "iq.report.v1"
    && isIqScaleCode(text(payload?.scale_code)) && record(payload?.summary) !== null;
}

export type IqPerformanceDimension = {
  code: IqDimensionCode;
  correct: number | null;
  total: number | null;
  percentCorrect: number | null;
};

export type IqResultPresentation = {
  standardScore: number | null;
  percentile: number | null;
  referencePopulation: string | null;
  correct: number | null;
  total: number | null;
  percentCorrect: number | null;
  durationMs: number | null;
  dimensions: IqPerformanceDimension[];
  blocked: boolean;
};

/** Rendering only: the backend owns calibration, norming and the unrounded score. */
export function buildIqResultPresentation({
  locale, reportData, resultData, locked,
}: {
  locale: Locale;
  reportData: ReportResponse | null;
  resultData: ResultResponse | null;
  locked: boolean;
}): IqResultPresentation {
  const report = record(reportData);
  const nestedReport = record(report?.report);
  const result = record(resultData);
  const nestedResult = record(result?.result);
  const normed = record(nestedResult?.normed_json) ?? record(result?.normed_json);
  const breakdown = record(nestedResult?.breakdown_json) ?? record(result?.breakdown_json);
  const scoreResult = record(breakdown?.score_result);
  const sources = [
    record(report?.summary), record(nestedReport?.summary),
    record(report?.scoring), record(nestedReport?.scoring),
    report, nestedReport, normed, scoreResult, nestedResult, result, breakdown,
  ].filter((source): source is RecordValue => source !== null);
  const blocked = sources.some((source) => source.status === "blocked_unscored"
    || source.technical_failure === true
    || source.bank_id === IQ_BETA_50_BANK_ID || source.form_code === IQ_BETA_50_BANK_ID);
  const metric = (field: string) => sources.find((source) => Object.hasOwn(source, field))?.[field];

  const dimensionSources = [report?.dimensions, nestedReport?.dimensions,
    normed?.dimension_scores, scoreResult?.dimension_scores,
    nestedResult?.dimensions, result?.dimensions];
  const dimensions = DIMENSIONS.map((code): IqPerformanceDimension => {
    let source: RecordValue | null = null;
    for (const candidate of dimensionSources) {
      const group = record(candidate);
      source = record(group?.[IQ_REPORT_DIMENSION_FIELD_MAP[code]]) ?? record(group?.[code]);
      if (!source && Array.isArray(candidate)) {
        source = record(candidate.find((row) => {
          const item = record(row);
          const identity = item?.dimension_code ?? item?.dimension ?? item?.code ?? item?.key;
          return identity === code || identity === IQ_REPORT_DIMENSION_FIELD_MAP[code];
        }));
      }
      if (source) break;
    }
    const total = blocked ? null : count(source?.item_count);
    const value = blocked ? null : count(source?.correct_count ?? source?.raw_score);
    const correct = value !== null && total !== null && total > 0 && value <= total ? value : null;
    return { code, correct, total, percentCorrect: correct !== null && total !== null ? correct / total * 100 : null };
  });

  const completeDimensions = dimensions.every((dimension) => dimension.correct !== null && dimension.total !== null);
  const dimensionTotal = completeDimensions ? dimensions.reduce((sum, dimension) => sum + dimension.total!, 0) : null;
  const dimensionCorrect = completeDimensions ? dimensions.reduce((sum, dimension) => sum + dimension.correct!, 0) : null;
  const total = blocked ? null : count(metric("expected_item_count") ?? metric("question_count") ?? metric("item_count")) ?? dimensionTotal;
  const value = blocked ? null : count(metric("correct_count") ?? metric("raw_score")) ?? dimensionCorrect;
  const correct = value !== null && total !== null && total > 0 && value <= total ? value : null;
  const duration = number(metric("duration_ms"));

  // One atomic norm snapshot. Do not reinterpret legacy IQ/random-baseline fields,
  // mix report/result versions, or use a lower-priority snapshot after explicit null.
  const normativeSource = sources.find((source) => Object.hasOwn(source, "normative_reasoning"));
  const normative = record(normativeSource?.normative_reasoning);
  const population = record(normative?.reference_population);
  const referencePopulation = text(population?.[locale === "zh" ? "label_zh" : "label_en"]);
  const percentile = number(normative?.percentile); // Explicit 0–100 scale, including values below 1.
  const standardScore = number(normative?.standard_score);
  const eligible = !blocked && !locked && normative?.status === "available"
    && normative?.eligible === true && referencePopulation !== null
    && text(normative?.norm_table_version) !== null && text(normative?.model_version) !== null
    && percentile !== null && percentile > 0 && percentile < 100 && standardScore !== null;

  return {
    standardScore: eligible ? Math.min(145, Math.max(55, Math.floor(standardScore! + 0.5))) : null,
    percentile: eligible ? percentile : null,
    referencePopulation: eligible ? referencePopulation : null,
    correct, total,
    percentCorrect: correct !== null && total !== null ? correct / total * 100 : null,
    durationMs: duration !== null && duration > 0 ? duration : null,
    dimensions, blocked,
  };
}
