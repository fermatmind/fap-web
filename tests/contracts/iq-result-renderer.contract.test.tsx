import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { ReportResponse } from "@/lib/api/v0_3";
import { IqResultShell } from "@/components/result/iq/IqResultShell";
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
    meta: {
      scale_code: "IQ_INTELLIGENCE_QUOTIENT",
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
      "完整报告解锁功能暂未开放。当前可查看已生成的基础结果。"
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
});
