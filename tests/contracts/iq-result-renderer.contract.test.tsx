import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { ReportResponse } from "@/lib/api/v0_3";
import { IqResultShell } from "@/components/result/iq/IqResultShell";
import { IQ_BETA_50_BANK_ID } from "@/lib/iq/constants";
import { buildIqResultViewModel } from "@/lib/iq/result";

function createAccessView(overrides: Partial<AttemptReportAccessView> = {}): AttemptReportAccessView {
  return {
    attemptId: "iq-result-001",
    accessState: "ready",
    reportState: "ready",
    pdfState: "unavailable",
    unlockStage: null,
    unlockSource: null,
    reasonCode: null,
    accessLevel: "free",
    variant: "free",
    projectionVersion: 1,
    modulesAllowed: [],
    modulesPreview: [],
    actions: {
      pageHref: "/en/result/iq-result-001",
      pdfHref: null,
      waitHref: null,
      historyHref: null,
      lookupHref: null,
    },
    meta: {
      producedAt: null,
      refreshedAt: null,
    },
    ...overrides,
  };
}

function createReportData(): ReportResponse {
  return {
    ok: true,
    scale_code: "IQ_INTELLIGENCE_QUOTIENT",
    locked: false,
    variant: "full",
    summary: {
      raw_score: 29,
      iq_estimate: 118,
      percentile: 84,
      confidence_interval: {
        lower: 111,
        upper: 123,
        level: "90%",
      },
    },
    dimensions: {
      visual_spatial_insight: {
        raw_score: 10,
        scaled_score: 119,
        normalized_score: 84,
        percentile: 82,
        band: "Strong",
        insight: "Pattern extraction is one of the stronger areas in this result.",
      },
      visual_spatial_pattern_reasoning: {
        raw_score: 9,
        scaled_score: 116,
        normalized_score: 80,
        percentile: 78,
        band: "Solid",
      },
      numerical_pattern_reasoning: {
        raw_score: 10,
        scaled_score: 121,
        normalized_score: 86,
        percentile: 88,
        insight: "Numeric sequence recognition stayed stable across the set.",
      },
    },
    quality: {
      level: "beta",
      flags: ["norm_table_pending", "beta_bank"],
    },
    stability: {
      status: "preliminary",
      reason: "Norm table is still pending.",
    },
    report: {
      scale_code: "IQ_INTELLIGENCE_QUOTIENT",
    },
    iq_pro: {
      narrative_sections: [
        {
          section_id: "overview",
          title: "How to read this result",
          body: "Use the interval and quality markers together when interpreting the estimate.",
        },
      ],
    },
    meta: {
      scale_code: "IQ_INTELLIGENCE_QUOTIENT",
    },
  } as unknown as ReportResponse;
}

function createOwnerRawScoreOnlyReportData(): ReportResponse {
  return {
    ...createReportData(),
    summary: {
      raw_score: 24,
      question_count: 30,
      iq_estimate: null,
      percentile: null,
      confidence_interval: null,
      score_claim_level: "raw_score_only",
      claim_warnings: ["no_norm_table"],
      claim_policy: {
        claim_eligible: false,
        score_claim_level: "raw_score_only",
      },
    },
    scoring: {
      raw_score: 24,
      question_count: 30,
      score_claim_level: "raw_score_only",
      claim_warnings: ["no_norm_table"],
      claim_policy: {
        claim_eligible: false,
        score_claim_level: "raw_score_only",
      },
    },
    dimensions: {
      visual_spatial_insight: {
        raw_score: 8,
        scaled_score: 119,
        normalized_score: 84,
        percentile: 82,
        band: "raw",
      },
      visual_spatial_pattern_reasoning: {
        raw_score: 9,
        scaled_score: 116,
        normalized_score: 80,
        percentile: 78,
        band: "raw",
      },
      numerical_pattern_reasoning: {
        raw_score: 7,
        scaled_score: 121,
        normalized_score: 86,
        percentile: 88,
        band: "raw",
      },
    },
  } as unknown as ReportResponse;
}

function createOwnerClaimEligibleReportData(): ReportResponse {
  return {
    ...createReportData(),
    summary: {
      raw_score: 30,
      question_count: 30,
      iq_estimate: 145,
      percentile: 99.87,
      confidence_interval: {
        lower: 140.5,
        upper: 149.5,
        level: "90%",
      },
      score_claim_level: "iq_estimate",
      claim_warnings: [],
      claim_policy: {
        claim_eligible: true,
        score_claim_level: "iq_estimate",
      },
    },
    scoring: {
      raw_score: 30,
      question_count: 30,
      score_claim_level: "iq_estimate",
      claim_warnings: [],
      claim_policy: {
        claim_eligible: true,
        score_claim_level: "iq_estimate",
      },
    },
    dimensions: {
      visual_spatial_insight: {
        raw_score: 10,
        scaled_score: 145,
        normalized_score: 99,
        percentile: 99.8,
        band: "Exceptional",
      },
      visual_spatial_pattern_reasoning: {
        raw_score: 10,
        scaled_score: 143,
        normalized_score: 98,
        percentile: 99.5,
        band: "Exceptional",
      },
      numerical_pattern_reasoning: {
        raw_score: 10,
        scaled_score: 144,
        normalized_score: 99,
        percentile: 99.7,
        band: "Exceptional",
      },
    },
  } as unknown as ReportResponse;
}

function createNestedOwnerRawScoreOnlyReportData(): ReportResponse {
  const reportData = createOwnerRawScoreOnlyReportData() as unknown as Record<string, unknown>;

  return {
    ok: true,
    locked: false,
    variant: "full",
    quality: reportData.quality,
    stability: reportData.stability,
    dimensions: reportData.dimensions,
    report: {
      scale_code: "IQ_INTELLIGENCE_QUOTIENT",
      summary: {
        raw_score: 5,
        question_count: 30,
        iq_estimate: null,
        percentile: null,
        confidence_interval: null,
        score_claim_level: "raw_score_only",
        claim_warnings: ["no_norm_table"],
        claim_policy: {
          claim_eligible: false,
          score_claim_level: "raw_score_only",
        },
      },
      scoring: {
        raw_score: 5,
        question_count: 30,
        score_claim_level: "raw_score_only",
        claim_warnings: ["no_norm_table"],
        claim_policy: {
          claim_eligible: false,
          score_claim_level: "raw_score_only",
        },
      },
    },
  } as unknown as ReportResponse;
}

describe("IQ result renderer contract", () => {
  it("renders the canonical IQ title, summary metrics, and three dimension cards without exposing the legacy alias", () => {
    render(
      <IqResultShell
        locale="en"
        reportData={createReportData()}
        resultData={null}
        accessView={createAccessView()}
      />
    );

    expect(screen.getByTestId("iq-result-title")).toHaveTextContent("IQ Test");
    expect(screen.queryByText("IQ_RAVEN")).not.toBeInTheDocument();
    expect(screen.getByTestId("iq-iq-estimate-value")).toHaveTextContent("118");
    expect(screen.getByTestId("iq-confidence-interval")).toHaveTextContent("111 - 123 · 90%");
    expect(screen.getByTestId("iq-quality-flags")).toHaveTextContent("norm_table_pending");
    expect(screen.getByTestId("iq-stability-status")).toHaveTextContent("preliminary");
    expect(screen.getByTestId("iq-dimension-card-vsi")).toBeInTheDocument();
    expect(screen.getByTestId("iq-dimension-card-vspr")).toBeInTheDocument();
    expect(screen.getByTestId("iq-dimension-card-npr")).toBeInTheDocument();
    expect(screen.getByTestId("iq-report-module")).toBeInTheDocument();
    expect(screen.getByTestId("iq-report-sections")).toHaveTextContent("How to read this result");
    expect(screen.queryByText(/¥1\.99|¥5/)).not.toBeInTheDocument();
  });

  it("renders the safe unavailable state when iq_estimate is null", () => {
    const reportData = {
      ...createReportData(),
      summary: {
        ...(createReportData() as unknown as { summary: Record<string, unknown> }).summary,
        iq_estimate: null,
      },
    } as unknown as ReportResponse;

    render(
      <IqResultShell
        locale="en"
        reportData={reportData}
        resultData={null}
        accessView={createAccessView()}
      />
    );

    expect(screen.getByTestId("iq-iq-estimate-unavailable")).toHaveTextContent(
      "The IQ estimate is not available for this result yet"
    );
  });

  it("renders owner 30 raw-score-only claim policy without IQ estimate, percentile, or confidence interval claims", () => {
    render(
      <IqResultShell
        locale="zh"
        reportData={createOwnerRawScoreOnlyReportData()}
        resultData={null}
        accessView={createAccessView()}
      />
    );

    expect(screen.getByTestId("iq-raw-score-claim")).toHaveTextContent("30题推理得分：24/30");
    expect(screen.queryByText(/IQ 估计值/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("iq-iq-estimate-value")).not.toBeInTheDocument();
    expect(screen.queryByTestId("iq-iq-estimate-unavailable")).not.toBeInTheDocument();
    expect(screen.queryByText(/百分位/)).not.toBeInTheDocument();
    expect(screen.queryByText(/置信区间/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("iq-percentile")).not.toBeInTheDocument();
    expect(screen.queryByTestId("iq-confidence-interval")).not.toBeInTheDocument();
    expect(screen.getByTestId("iq-raw-score")).toHaveTextContent("24");
    expect(screen.getByTestId("iq-quality-level")).toHaveTextContent("beta");
    expect(screen.getByTestId("iq-stability-status")).toHaveTextContent("preliminary");
    expect(screen.getByTestId("iq-dimension-card-vsi")).toHaveTextContent("原始分");
    expect(screen.getByTestId("iq-dimension-card-vsi")).toHaveTextContent("8");
    expect(screen.getByTestId("iq-dimension-card-vsi")).not.toHaveTextContent("82%");
  });

  it("renders owner 30 IQ claims only when backend marks the report claim eligible", () => {
    render(
      <IqResultShell
        locale="zh"
        reportData={createOwnerClaimEligibleReportData()}
        resultData={null}
        accessView={createAccessView()}
      />
    );

    expect(screen.getByTestId("iq-iq-estimate-value")).toHaveTextContent("145");
    expect(screen.getByTestId("iq-percentile")).toHaveTextContent("99.9%");
    expect(screen.getByTestId("iq-confidence-interval")).toHaveTextContent("140.5 - 149.5 · 90%");
    expect(screen.getByTestId("iq-raw-score")).toHaveTextContent("30");
    expect(screen.queryByTestId("iq-raw-score-claim")).not.toBeInTheDocument();
    expect(screen.queryByTestId("iq-iq-estimate-unavailable")).not.toBeInTheDocument();
    expect(screen.getByTestId("iq-dimension-card-vsi")).toHaveTextContent("百分位");
    expect(screen.getByTestId("iq-dimension-card-vsi")).toHaveTextContent("99.8%");
    expect(screen.getByTestId("iq-report-dimension-detail-vsi")).toHaveTextContent("百分位");
    expect(screen.getByTestId("iq-report-dimension-detail-vsi")).toHaveTextContent("99.8%");
  });

  it("renders owner 30 raw score from nested production report summary", () => {
    render(
      <IqResultShell
        locale="zh"
        reportData={createNestedOwnerRawScoreOnlyReportData()}
        resultData={null}
        accessView={createAccessView()}
      />
    );

    expect(screen.getByTestId("iq-raw-score-claim")).toHaveTextContent("30题推理得分：5/30");
    expect(screen.getByTestId("iq-raw-score")).toHaveTextContent("5");
    expect(screen.queryByText(/IQ 估计值/)).not.toBeInTheDocument();
    expect(screen.queryByText(/百分位/)).not.toBeInTheDocument();
    expect(screen.queryByText(/置信区间/)).not.toBeInTheDocument();
    expect(screen.queryByTestId("iq-percentile")).not.toBeInTheDocument();
    expect(screen.queryByTestId("iq-confidence-interval")).not.toBeInTheDocument();
  });

  it("renders a neutral locked message without showing payment CTA or offers", () => {
    render(
      <IqResultShell
        locale="zh"
        reportData={createReportData()}
        resultData={null}
        accessView={createAccessView({
          accessState: "locked",
          unlockStage: "locked",
          unlockSource: "none",
        })}
      />
    );

    expect(screen.getByTestId("iq-report-locked-notice")).toHaveTextContent(
      "当前为免费预览。完整 IQ 报告详情需后端授权解锁后展示。"
    );
    expect(screen.queryByRole("button", { name: /unlock|购买|解锁/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/¥1\.99|¥5/)).not.toBeInTheDocument();
  });

  it("does not fabricate missing dimension data", () => {
    const baseReportData = createReportData() as unknown as { dimensions: Record<string, unknown> };
    const reportData = {
      ...createReportData(),
      dimensions: {
        ...baseReportData.dimensions,
      },
    } as unknown as ReportResponse;
    delete (reportData as unknown as { dimensions: Record<string, unknown> }).dimensions.numerical_pattern_reasoning;

    render(
      <IqResultShell
        locale="en"
        reportData={reportData}
        resultData={null}
        accessView={createAccessView()}
      />
    );

    const missingCard = screen.getByTestId("iq-dimension-card-npr");
    expect(missingCard).toHaveTextContent("Numerical Pattern Reasoning");
    expect(screen.getByTestId("iq-dimension-missing-npr")).toHaveTextContent(
      "This dimension is not available yet."
    );
    expect(missingCard).not.toHaveTextContent("88%");
  });

  it("ignores null IQ dimension array entries while preserving matched cards", () => {
    const reportData = {
      ...createReportData(),
      dimensions: [
        null,
        {
          dimension: "visual_spatial_insight",
          raw_score: 10,
          normalized_score: 84,
          percentile: 82,
          band: "Strong",
        },
        undefined,
        {
          code: "visual_spatial_pattern_reasoning",
          raw_score: 9,
          normalized_score: 80,
          percentile: 78,
          band: "Solid",
        },
        {
          id: "numerical_pattern_reasoning",
          raw_score: 10,
          normalized_score: 86,
          percentile: 88,
          band: "Strong",
        },
      ],
    } as unknown as ReportResponse;

    render(
      <IqResultShell
        locale="en"
        reportData={reportData}
        resultData={null}
        accessView={createAccessView()}
      />
    );

    expect(screen.getByTestId("iq-dimension-card-vsi")).toHaveTextContent("82");
    expect(screen.getByTestId("iq-dimension-card-vspr")).toHaveTextContent("78");
    expect(screen.getByTestId("iq-dimension-card-npr")).toHaveTextContent("88");
  });

  it("normalizes canonical and legacy IQ scale codes through the same view-model path", () => {
    const canonical = buildIqResultViewModel({
      locale: "en",
      reportData: createReportData(),
      resultData: null,
      accessView: createAccessView(),
    });

    const legacy = buildIqResultViewModel({
      locale: "en",
      reportData: {
        ...createReportData(),
        scale_code: "IQ_RAVEN",
        report: {
          scale_code: "IQ_RAVEN",
        },
        meta: {
          scale_code: "IQ_RAVEN",
        },
      },
      resultData: null,
      accessView: createAccessView(),
    });

    expect(canonical.title).toBe("IQ Test");
    expect(legacy.title).toBe("IQ Test");
    expect(legacy.scaleCode).toBe("IQ_RAVEN");
  });

  it("renders beta50 as a future placeholder without exposing a take entry", () => {
    const reportData = createReportData() as unknown as ReportResponse & {
      bank_id: string;
      meta: Record<string, unknown>;
    };
    reportData.bank_id = IQ_BETA_50_BANK_ID;
    reportData.meta = {
      ...(reportData.meta ?? {}),
      bank_id: IQ_BETA_50_BANK_ID,
    };

    render(
      <IqResultShell
        locale="en"
        reportData={reportData}
        resultData={null}
        accessView={createAccessView()}
      />
    );

    expect(screen.getByTestId("iq-bank-placeholder-notice")).toHaveTextContent("future 50-item beta placeholder");
    expect(screen.getByTestId("iq-bank-placeholder-notice")).toHaveAttribute("data-bank-id", IQ_BETA_50_BANK_ID);
    expect(screen.queryByRole("link", { name: /start|take/i })).not.toBeInTheDocument();
  });
});
