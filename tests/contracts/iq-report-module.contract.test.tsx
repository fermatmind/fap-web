import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import type { ReportResponse } from "@/lib/api/v0_3";
import { IqReportModule } from "@/components/result/iq/IqReportModule";
import { buildIqResultViewModel } from "@/lib/iq/result";

function createAccessView(overrides: Partial<AttemptReportAccessView> = {}): AttemptReportAccessView {
  return {
    attemptId: "iq-report-001",
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
      pageHref: "/en/result/iq-report-001",
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

function createReportData(overrides: Record<string, unknown> = {}): ReportResponse {
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
        normalized_score: 84,
        percentile: 82,
        band: "Strong",
        insight: "Pattern extraction is one of the stronger areas in this result.",
      },
      visual_spatial_pattern_reasoning: {
        raw_score: 9,
        normalized_score: 80,
        percentile: 78,
        band: "Solid",
        insight: "Rule discovery remained stable across the sequence set.",
      },
      numerical_pattern_reasoning: {
        raw_score: 10,
        normalized_score: 86,
        percentile: 88,
        band: "Strong",
        insight: "Numeric sequence recognition stayed stable across the set.",
      },
    },
    quality: {
      level: "beta",
      flags: ["norm_table_pending", "review_with_caution"],
    },
    stability: {
      status: "preliminary",
      reason: "Norm table is still pending.",
    },
    iq_pro: {
      narrative_sections: [
        {
          section_id: "summary",
          title: "How to read this score",
          body: "Interpret the estimate alongside the interval and response quality.",
          bullets: ["Look at the confidence interval", "Treat this as an online estimate"],
        },
      ],
      pdf_payload: {
        schema_version: "iq.report.pdf.v0",
      },
      certificate_payload: {
        schema_version: "iq.certificate.v0",
      },
    },
    report: {
      scale_code: "IQ_INTELLIGENCE_QUOTIENT",
    },
    meta: {
      scale_code: "IQ_INTELLIGENCE_QUOTIENT",
    },
    ...overrides,
  } as unknown as ReportResponse;
}

function renderReportModule({
  locale = "en",
  reportData = createReportData(),
  accessView = createAccessView(),
}: {
  locale?: "en" | "zh";
  reportData?: ReportResponse | null;
  accessView?: AttemptReportAccessView | null;
}) {
  const viewModel = buildIqResultViewModel({
    locale,
    reportData,
    resultData: null,
    accessView,
  });

  return render(<IqReportModule locale={locale} viewModel={viewModel.reportModule} />);
}

describe("IQ report module contract", () => {
  it("renders the method boundary, deferred locked copy, and never shows payment CTA or prices", () => {
    renderReportModule({
      locale: "zh",
      accessView: createAccessView({
        accessState: "locked",
        unlockStage: "locked",
        unlockSource: "none",
      }),
    });

    expect(screen.getByTestId("iq-method-boundary")).toHaveTextContent(
      "本结果是在线认知能力估测，不是临床诊断。请结合置信区间和作答质量理解结果。"
    );
    expect(screen.getByTestId("iq-report-module-locked")).toHaveTextContent(
      "完整报告解锁功能暂未开放。当前可查看已生成的基础结果。"
    );
    expect(screen.queryByRole("button", { name: /购买|解锁|unlock|buy|checkout/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/¥1\.99|¥5|checkout|buy now|unlock now/i)).not.toBeInTheDocument();
  });

  it("renders narrative sections and preserves VSPR/VSI/NPR detail blocks when the backend provides them", () => {
    renderReportModule({});

    expect(screen.getByTestId("iq-report-sections")).toHaveTextContent("How to read this score");
    expect(screen.getByTestId("iq-report-section-summary")).toHaveTextContent(
      "Interpret the estimate alongside the interval and response quality."
    );
    expect(screen.getByTestId("iq-report-dimension-detail-vsi")).toHaveTextContent("Visual-Spatial Insight");
    expect(screen.getByTestId("iq-report-dimension-detail-vspr")).toHaveTextContent("Visual-Spatial Pattern Reasoning");
    expect(screen.getByTestId("iq-report-dimension-detail-npr")).toHaveTextContent("Numerical Pattern Reasoning");
  });

  it("ignores null IQ dimension array entries before rendering report detail blocks", () => {
    renderReportModule({
      reportData: createReportData({
        dimensions: [
          null,
          {
            dimension_code: "visual_spatial_insight",
            normalized_score: 84,
            percentile: 82,
            band: "Strong",
          },
          false,
          {
            key: "visual_spatial_pattern_reasoning",
            normalized_score: 80,
            percentile: 78,
            band: "Solid",
          },
          {
            id: "numerical_pattern_reasoning",
            normalized_score: 86,
            percentile: 88,
            band: "Strong",
          },
        ],
      }),
    });

    expect(screen.getByTestId("iq-report-dimension-detail-vsi")).toHaveTextContent("Strong");
    expect(screen.getByTestId("iq-report-dimension-detail-vspr")).toHaveTextContent("Solid");
    expect(screen.getByTestId("iq-report-dimension-detail-npr")).toHaveTextContent("88");
  });

  it("does not fabricate narrative sections when they are absent and instead shows a safe unavailable state", () => {
    const reportData = createReportData({
      iq_pro: {},
    });

    renderReportModule({ reportData });

    expect(screen.queryByTestId("iq-report-sections")).not.toBeInTheDocument();
    expect(screen.getByTestId("iq-report-module-unavailable")).toHaveTextContent(
      "Detailed report content is not available yet."
    );
  });

  it("renders PDF and certificate placeholders only when the payloads exist", () => {
    const { rerender } = renderReportModule({});

    expect(screen.getByTestId("iq-pdf-placeholder")).toHaveTextContent(
      "A PDF report payload is available, but this frontend version does not support downloads yet."
    );
    expect(screen.getByTestId("iq-certificate-placeholder")).toHaveTextContent(
      "A certificate payload is available, but this frontend version does not support downloads yet."
    );

    const withoutDownloads = buildIqResultViewModel({
      locale: "en",
      reportData: createReportData({
        iq_pro: {
          narrative_sections: [],
        },
      }),
      resultData: null,
      accessView: createAccessView(),
    });

    rerender(<IqReportModule locale="en" viewModel={withoutDownloads.reportModule} />);

    expect(screen.queryByTestId("iq-pdf-placeholder")).not.toBeInTheDocument();
    expect(screen.queryByTestId("iq-certificate-placeholder")).not.toBeInTheDocument();
  });
});
