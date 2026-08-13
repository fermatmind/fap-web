import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { canRenderRichResultReport, RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import {
  BIG5_RESULT_PAGE_V2_PAYLOAD_KEY,
  getBig5ResultPageV2Payload,
} from "@/lib/big5/resultPageV2";
import pilotEnvelope from "@/tests/fixtures/big5/result_page_v2/pilot_o59_staging_payload_v0_1.payload.json";
import liveBridgeV2ReportFixture from "@/tests/fixtures/big5/report_live_bridge_v2.projection.json";

const PILOT_BODY_TERMS = [
  "你更像是在内部完成高强度扫描，再决定是否进入场景的人。",
  "当开放性处在中位时",
] as const;

const MUST_NOT_RENDER_TERMS = [
  "frontend_fallback",
  "internal_metadata",
  "selector_basis",
  "source_reference",
  "production_use_allowed",
  "runtime_use",
  "[object Object]",
  "A compact overview",
  "Norms Comparison",
  "Methodology and Access",
] as const;

function createPilotReport(overrides: Partial<ReportResponse> = {}): ReportResponse {
  return {
    scale_code: "BIG5_OCEAN",
    report: {
      scale_code: "BIG5_OCEAN",
      sections: [
        {
          key: "hero_summary",
          title: "Legacy fallback section",
          blocks: [
            {
              kind: "paragraph",
              body: "FRONTEND_FALLBACK_BODY_SHOULD_NOT_RENDER",
            },
          ],
        },
      ],
    },
    [BIG5_RESULT_PAGE_V2_PAYLOAD_KEY]: structuredClone(pilotEnvelope).big5_result_page_v2,
    ...overrides,
  } as ReportResponse;
}

function visibleText(): string {
  return document.body.textContent ?? "";
}

describe("Big Five V2 pilot payload-only renderer contract", () => {
  it("rejects the malformed pilot payload instead of publishing its candidate assets", () => {
    render(<RichResultReport locale="zh" reportData={createPilotReport()} />);

    expect(screen.getByTestId("big5-core-only-shell")).toHaveAttribute("data-core-source", "unavailable");
    expect(screen.getByTestId("big5-core-summary-unavailable")).toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();

    const text = visibleText();
    expect(text).not.toContain("敏锐的独立思考者");
    expect(text).not.toContain("FRONTEND_FALLBACK_BODY_SHOULD_NOT_RENDER");
  });

  it("fails closed even when a malformed V2 candidate accompanies a generating flag", () => {
    const report = createPilotReport({
      generating: true,
      meta: {
        generating: true,
        scale_code: "BIG5_OCEAN",
      },
      report: [],
    } as unknown as Partial<ReportResponse>);

    expect(canRenderRichResultReport(report)).toBe(true);

    render(<RichResultReport locale="zh" reportData={report} />);

    expect(screen.getByTestId("big5-core-only-shell")).toHaveAttribute("data-core-source", "unavailable");
    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
    expect(visibleText()).not.toContain("敏锐的独立思考者");
    expect(visibleText()).not.toContain("Report is generating");
    expect(visibleText()).not.toContain("报告生成中");
  });

  it("does not render metadata, staging flags, compact anti-target copy, or object string leaks", () => {
    render(<RichResultReport locale="zh" reportData={createPilotReport()} />);

    const text = visibleText();
    for (const term of MUST_NOT_RENDER_TERMS) {
      expect(text).not.toContain(term);
    }
  });

  it("does not render pending pilot modules or synthesize body copy", () => {
    render(<RichResultReport locale="zh" reportData={createPilotReport()} />);

    expect(screen.queryByTestId("big5-v2-deferred")).not.toBeInTheDocument();
    expect(visibleText()).not.toContain("此模块暂未启用");
    expect(visibleText()).not.toContain("pending_asset_resolution");
    expect(visibleText()).not.toContain("根据你的分数");
    expect(visibleText()).not.toContain("你的性格说明");
  });

  it("does not synthesize pilot body when the V2 payload is missing", () => {
    render(
      <RichResultReport
        locale="zh"
        reportData={{
          scale_code: "BIG5_OCEAN",
          report: {
            scale_code: "BIG5_OCEAN",
          },
        } as ReportResponse}
      />
    );

    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
    for (const term of PILOT_BODY_TERMS) {
      expect(visibleText()).not.toContain(term);
    }
  });

  it("rejects invalid V2 pilot payloads instead of manufacturing replacement V2 prose", () => {
    const invalidPayload = structuredClone(pilotEnvelope).big5_result_page_v2 as {
      modules: Array<{ blocks: Array<{ content: unknown }> }>;
    };
    invalidPayload.modules[0].blocks[0].content = {
      summary_zh: "SHOULD_NOT_RENDER_INVALID_V2_PAYLOAD",
      internal_metadata: {
        selector_basis: "forbidden",
      },
    };

    const report = createPilotReport({
      [BIG5_RESULT_PAGE_V2_PAYLOAD_KEY]: invalidPayload,
      report: {
        scale_code: "BIG5_OCEAN",
      },
    } as Partial<ReportResponse>);

    expect(getBig5ResultPageV2Payload(report)).toBeNull();

    render(<RichResultReport locale="zh" reportData={report} />);

    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
    expect(visibleText()).not.toContain("SHOULD_NOT_RENDER_INVALID_V2_PAYLOAD");
    for (const term of PILOT_BODY_TERMS) {
      expect(visibleText()).not.toContain(term);
    }
  });

  it("uses only the reliable legacy five-domain core when V2 is malformed", () => {
    const invalidPayload = structuredClone(pilotEnvelope).big5_result_page_v2 as {
      modules: Array<{ blocks: Array<{ content: unknown }> }>;
    };
    invalidPayload.modules[0].blocks[0].content = {
      body: "INVALID_V2_BODY_SHOULD_NOT_RENDER",
      internal_metadata: "forbidden",
    };
    const legacyReport = structuredClone(liveBridgeV2ReportFixture) as ReportResponse;
    const report = {
      ...legacyReport,
      [BIG5_RESULT_PAGE_V2_PAYLOAD_KEY]: invalidPayload,
    } as ReportResponse;

    expect(getBig5ResultPageV2Payload(report)).toBeNull();

    render(<RichResultReport locale="zh" reportData={report} />);

    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
    expect(screen.getByTestId("big5-core-only-shell")).toHaveAttribute("data-core-source", "legacy");
    expect(screen.getAllByRole("progressbar")).toHaveLength(5);
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();
    expect(visibleText()).not.toContain("INVALID_V2_BODY_SHOULD_NOT_RENDER");
    expect(visibleText()).toContain("五维核心摘要");
  });
});
