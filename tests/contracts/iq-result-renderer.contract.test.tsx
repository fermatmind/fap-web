import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { axe } from "jest-axe";
import { IqResultShell } from "@/components/result/iq/IqResultShell";
import { buildIqResultPresentation, isIqReportResponse } from "@/lib/iq/presentation";
import { buildIqResultViewModel } from "@/lib/iq/result";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { ReportResponse, ResultResponse } from "@/lib/api/v0_3";
import { IQ_BETA_50_BANK_ID } from "@/lib/iq/constants";

// Synthetic rendering fixture, not calibrated FermatMind parameters or norms.
function fixture(overrides: Record<string, unknown> = {}): ReportResponse {
  return {
    ok: true,
    scale_code: "IQ_INTELLIGENCE_QUOTIENT",
    summary: { raw_score: 17, question_count: 30 },
    scoring: { status: "scored" },
    dimensions: {
      visual_spatial_pattern_reasoning: { dimension_code: "VSPR", correct_count: 8, item_count: 14 },
      visual_spatial_insight: { dimension_code: "VSI", correct_count: 7, item_count: 13 },
      numerical_pattern_reasoning: { dimension_code: "NPR", correct_count: 2, item_count: 3 },
    },
    duration_ms: 192000,
    ...overrides,
  } as unknown as ReportResponse;
}

function syntheticNorm(overrides: Record<string, unknown> = {}) {
  return {
    status: "available", eligible: true,
    standard_score: 110.1173, percentile: 75,
    reference_population: { label_zh: "合成测试参考样本", label_en: "Synthetic reference sample" },
    norm_table_version: "synthetic-norm-v1", model_version: "synthetic-model-v1",
    ...overrides,
  };
}

function presentation(report: ReportResponse | null, result: ResultResponse | null = null) {
  return buildIqResultPresentation({ locale: "zh", reportData: report, resultData: result, locked: false });
}

function show(report: ReportResponse | null, locale: "zh" | "en" = "zh", result: ResultResponse | null = null, access: AttemptReportAccessView | null = null) {
  return render(<IqResultShell locale={locale} reportData={report} resultData={result} accessView={access} />);
}

describe("IQ three-module result presentation", () => {
  it("recognizes only the dedicated IQ report schema with a summary and IQ identity", () => {
    expect(isIqReportResponse(fixture({ schema_version: "iq.report.v1" }))).toBe(true);
    expect(isIqReportResponse({ report: fixture({ schema_version: "iq.report.v1" }) } as unknown as ReportResponse)).toBe(true);
    expect(isIqReportResponse(fixture({ schema_version: "iq.report.v1", scale_code: "MBTI" }))).toBe(false);
    expect(isIqReportResponse(fixture({ schema_version: "iq.report.v1", summary: null }))).toBe(false);
    expect(isIqReportResponse(fixture())).toBe(false);
  });
  it.each(["zh", "en"] as const)("renders the three approved modules in %s", (locale) => {
    show(fixture({ normative_reasoning: syntheticNorm() }), locale);
    expect(screen.getByTestId("iq-standard-score-module")).toBeInTheDocument();
    expect(screen.getByTestId("iq-result-overview")).toBeInTheDocument();
    expect(screen.getByTestId("iq-performance-radar-module")).toBeInTheDocument();
    expect(screen.getByTestId("iq-standard-score-value")).toHaveTextContent("110");
    expect(screen.getByTestId("iq-percentile")).toHaveTextContent("75%");
    expect(screen.getByTestId("iq-accuracy")).toHaveTextContent("56.7%");
    expect(screen.getByTestId("iq-correct-count")).toHaveTextContent("17/30");
    expect(screen.getByTestId("iq-duration")).toHaveTextContent("03:12");
    expect(screen.getByTestId("iq-reference-population")).toHaveTextContent(locale === "zh" ? "合成测试参考样本" : "Synthetic reference sample");
    expect(screen.getAllByRole("img")).toHaveLength(2);
    expect(screen.queryByTestId("iq-report-module")).not.toBeInTheDocument();
    expect(screen.queryByText(/¥1\.99|¥5|certified|Mensa|IQ 估计值/i)).not.toBeInTheDocument();
  });

  it.each([[54, 55], [55, 55], [99.49, 99], [99.5, 100], [144.5, 145], [145, 145], [160, 145]])("displays unrounded score %s as %s", (score, expected) => {
    expect(presentation(fixture({ normative_reasoning: syntheticNorm({ standard_score: score }) })).standardScore).toBe(expected);
  });

  it("preserves percentiles on a 0–100 scale, including below one", () => {
    show(fixture({ normative_reasoning: syntheticNorm({ standard_score: 61.36, percentile: 0.5 }) }));
    expect(screen.getByTestId("iq-percentile")).toHaveTextContent("0.5%");
    expect(screen.getByTestId("iq-standard-score-value")).toHaveTextContent("61");
  });

  it.each([[0.001, "<0.01%"], [99.999, ">99.99%"]])("does not round supported tail percentile %s to zero or 100", (value, expected) => {
    show(fixture({ normative_reasoning: syntheticNorm({ percentile: value }) }));
    expect(screen.getByTestId("iq-percentile")).toHaveTextContent(expected);
  });

  it("does not relabel random-baseline Beta or legacy IQ scores as reasoning standard scores", () => {
    show(fixture({ summary: { raw_score: 17, question_count: 30, beta_standard_score: 145, iq_estimate: 110, percentile: 75, claim_eligible: true } }));
    expect(screen.getByTestId("iq-standard-score-value")).toHaveTextContent("—");
    expect(screen.queryByTestId("iq-percentile")).not.toBeInTheDocument();
    expect(screen.getByTestId("iq-correct-count")).toHaveTextContent("17/30");
    expect(screen.queryByTestId("iq-beta-standard-score-value")).not.toBeInTheDocument();
    expect(screen.queryByTestId("iq-iq-estimate-value")).not.toBeInTheDocument();
  });

  it.each([
    { eligible: false }, { status: "pending" }, { percentile: 0 }, { percentile: 100 },
    { standard_score: "NaN" }, { norm_table_version: null }, { model_version: null },
    { reference_population: {} },
  ])("suppresses unsupported norm output for %j", (norm) => {
    const model = presentation(fixture({ normative_reasoning: syntheticNorm(norm) }));
    expect(model.standardScore).toBeNull();
    expect(model.percentile).toBeNull();
  });

  it("uses one authoritative report norm snapshot instead of filling it from result norms", () => {
    const result = { result: { normed_json: { normative_reasoning: syntheticNorm({ standard_score: 130 }) } } } as unknown as ResultResponse;
    expect(presentation(fixture({ normative_reasoning: null }), result).standardScore).toBeNull();
    expect(presentation(fixture({ normative_reasoning: syntheticNorm({ eligible: false }) }), result).standardScore).toBeNull();
  });

  it("reads an existing result snapshot's counts, time and dimensions when no report is available", () => {
    const result = { result: { normed_json: {
      status: "scored", expected_item_count: 30, correct_count: 17,
      normative_reasoning: syntheticNorm(),
      dimension_scores: {
        VSPR: { correct_count: 8, item_count: 14 }, VSI: { correct_count: 7, item_count: 13 }, NPR: { correct_count: 2, item_count: 3 },
      },
    }, breakdown_json: { duration_ms: 192000 } } } as unknown as ResultResponse;
    show(null, "en", result);
    expect(screen.getByTestId("iq-correct-count")).toHaveTextContent("17/30");
    expect(screen.getByTestId("iq-duration")).toHaveTextContent("03:12");
    expect(screen.getByTestId("iq-radar-values")).toBeInTheDocument();
  });

  it("renders dimension accuracy from counts, never from dimension percentile or scaled scores", () => {
    const report = fixture();
    const record = report as unknown as { dimensions: Record<string, unknown> };
    record.dimensions.numerical_pattern_reasoning = { correct_count: 2, item_count: 3, percentile: 99.9, normalized_score: 145 };
    show(report);
    expect(screen.getByTestId("iq-performance-npr")).toHaveTextContent("66.7%");
    expect(screen.getByTestId("iq-performance-npr")).toHaveTextContent("2/3");
    expect(screen.getByTestId("iq-performance-npr")).not.toHaveTextContent("99.9%");
  });

  it("keeps missing dimensions missing and does not draw a zero-filled radar polygon", () => {
    show(fixture({ dimensions: { visual_spatial_insight: { correct_count: 7, item_count: 13 } } }));
    expect(screen.getByTestId("iq-performance-npr")).toHaveTextContent("数据暂缺");
    expect(screen.queryByTestId("iq-radar-values")).not.toBeInTheDocument();
  });

  it("shows genuine zero correct answers but never treats blocked_unscored as a zero score", () => {
    expect(presentation(fixture({ summary: { raw_score: 0, question_count: 30 } })).percentCorrect).toBe(0);
    const blocked = fixture({ scoring: { status: "blocked_unscored" }, summary: { raw_score: 0, question_count: 30 }, normative_reasoning: syntheticNorm() });
    show(blocked);
    expect(screen.getByTestId("iq-correct-count")).toHaveTextContent("—");
    expect(screen.getByTestId("iq-accuracy")).toHaveTextContent("—");
    expect(screen.getByTestId("iq-standard-score-value")).toHaveTextContent("—");
    expect(screen.queryByTestId("iq-radar-values")).not.toBeInTheDocument();
  });

  it("suppresses normative output after an explicit technical failure", () => {
    const model = presentation(fixture({ technical_failure: true, normative_reasoning: syntheticNorm() }));
    expect(model.blocked).toBe(true);
    expect(model.standardScore).toBeNull();
    expect(model.percentile).toBeNull();
  });

  it.each([0, null, -1])("does not present missing/invalid duration %s as elapsed time", (duration_ms) => {
    show(fixture({ duration_ms }));
    expect(screen.getByTestId("iq-duration")).toHaveTextContent("—");
  });

  it("keeps a locked notice and does not expose normative output or commerce calls to action", () => {
    const access = { accessState: "locked" } as AttemptReportAccessView;
    show(fixture({ normative_reasoning: syntheticNorm() }), "zh", null, access);
    expect(screen.getByTestId("iq-report-locked-notice")).toBeInTheDocument();
    expect(screen.getByTestId("iq-standard-score-value")).toHaveTextContent("—");
    expect(screen.queryByRole("button", { name: /购买|解锁|buy|unlock/i })).not.toBeInTheDocument();
  });

  it("keeps the future bank unavailable", () => {
    show(fixture({ bank_id: IQ_BETA_50_BANK_ID, normative_reasoning: syntheticNorm() }), "en");
    expect(screen.getByTestId("iq-bank-placeholder-notice")).toHaveAttribute("data-bank-id", IQ_BETA_50_BANK_ID);
    expect(screen.queryByRole("link", { name: /start|take/i })).not.toBeInTheDocument();
    expect(screen.getByTestId("iq-standard-score-value")).toHaveTextContent("—");
  });

  it("has named charts and no automated accessibility violations", async () => {
    const { container } = show(fixture({ normative_reasoning: syntheticNorm() }));
    expect(within(screen.getByTestId("iq-performance-radar-module")).getByRole("img")).toHaveAccessibleName(/正确率/);
    expect((await axe(container)).violations).toEqual([]);
  });

  it("preserves legacy view-model normalization for other report consumers", () => {
    const model = buildIqResultViewModel({ locale: "en", reportData: fixture({ scale_code: "IQ_RAVEN", summary: { raw_score: 9, beta_standard_score: 77 } }), resultData: null, accessView: null });
    expect(model.scaleCode).toBe("IQ_RAVEN");
    expect(model.betaStandardScore).toBe(77);
    expect(model.primaryDisplayScore).toBe(77);
  });
});
