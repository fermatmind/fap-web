import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { canRenderRichResultReport, RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import {
  assessBig5ResultPageV2Payload,
  BIG5_RESULT_PAGE_V2_PAYLOAD_KEY,
  getBig5ResultPageV2SemanticDecision,
  getBig5ResultPageV2Payload,
  parseBig5ResultPageV2Payload,
} from "@/lib/big5/resultPageV2";
import legacyReportFixture from "@/tests/fixtures/big5/report_live_bridge_v2_missing.projection.json";
import lowQualityEnvelope from "@/tests/fixtures/big5/result_page_v2_low_quality.payload.json";
import { createRuntimeV2Payload } from "@/tests/fixtures/big5/runtimeV2Payload";

type MutableBig5ResultPageV2Fixture = {
  modules: Array<{
    module_key?: string;
    blocks: Array<{
      block_key?: string;
      block_kind?: string;
      content?: Record<string, unknown>;
      shareable?: boolean;
    }>;
  }>;
  projection_v2: {
    profile_signature: {
      is_fixed_type?: boolean;
    };
  };
  [key: string]: unknown;
};

function createLegacyReport(): ReportResponse {
  return structuredClone(legacyReportFixture) as ReportResponse;
}

function createCanonicalPayload() {
  return createRuntimeV2Payload() as MutableBig5ResultPageV2Fixture;
}

function createLowQualityPayload() {
  return structuredClone(lowQualityEnvelope).big5_result_page_v2 as MutableBig5ResultPageV2Fixture;
}

function withResultPageV2(payload: unknown): ReportResponse {
  return {
    ...createLegacyReport(),
    [BIG5_RESULT_PAGE_V2_PAYLOAD_KEY]: payload,
  };
}

describe("Big Five Result Page V2 frontend consumer", () => {
  it("keeps the legacy Big Five result path when no V2 payload is present", () => {
    render(<RichResultReport locale="zh" reportData={createLegacyReport()} />);

    expect(screen.getByTestId("big5-result-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
  });

  it("uses the V2 renderer path when a valid big5_result_page_v2 payload is present", () => {
    expect(assessBig5ResultPageV2Payload(createCanonicalPayload())).toMatchObject({ mode: "full", reasons: [] });
    render(<RichResultReport locale="zh" reportData={withResultPageV2(createCanonicalPayload())} />);

    expect(screen.getByTestId("big5-result-page-v2-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();
    expect(screen.getByTestId("big5-v2-module-module_00_trust_bar")).toBeInTheDocument();
    expect(screen.getByTestId("big5-v2-module-module_05_facet_reframe")).toBeInTheDocument();
    expect(screen.getByTestId("big5-v2-module-module_05_facet_reframe")).toHaveTextContent("细分维度信号");
    expect(screen.getByTestId("big5-v2-module-module_05_facet_reframe")).not.toHaveTextContent("Facet 信号");
    expect(screen.getByTestId("big5-v2-block-trust_bar")).toHaveTextContent("结果描述连续特质");
    expect(screen.getAllByRole("progressbar")).toHaveLength(5);
    expect(screen.getAllByTestId("big5-v2-block-trait_deep_dive")[0]).toHaveTextContent("正文只解释当前连续维度位置");
    expect(screen.getAllByText("优势").length).toBeGreaterThan(0);
    expect(screen.getAllByText("代价").length).toBeGreaterThan(0);
    expect(screen.getAllByText("行动").length).toBeGreaterThan(0);
    expect(screen.getByTestId("big5-v2-block-method_boundary")).toHaveTextContent("结果不是医疗或心理诊断");
    expect(screen.getByRole("button", { name: "分享安全链接" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "保存或打印" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "提交结果反馈" })).toHaveAttribute("href", "/support?topic=result-feedback");
    expect(screen.queryByText(/百分位/)).not.toBeInTheDocument();
  });

  it("filters paid V2 modules when Big5 access is locked", () => {
    render(
      <RichResultReport
        locale="zh"
        reportData={{
          ...withResultPageV2(createCanonicalPayload()),
          locked: true,
          variant: "free",
          access_level: "free",
          modules_allowed: ["big5_core"],
          modules_preview: ["big5_core"],
        }}
      />
    );

    expect(screen.getByTestId("big5-result-page-v2-shell")).toBeInTheDocument();
    expect(screen.getByText(/结果描述连续特质/)).toBeInTheDocument();
    expect(screen.getByText(/非固定类型的画像正文/)).toBeInTheDocument();
    expect(screen.getByText(/短摘要只保留当前最重要/)).toBeInTheDocument();
    expect(screen.queryByTestId("big5-v2-module-module_03_trait_deep_dive")).not.toBeInTheDocument();
    expect(screen.queryByTestId("big5-v2-module-module_05_facet_reframe")).not.toBeInTheDocument();
    expect(screen.queryByText(/开放性正文只解释/)).not.toBeInTheDocument();
    expect(screen.queryByText(/细分信号来自有限题项/)).not.toBeInTheDocument();
  });

  it("can render from the additive V2 payload without treating legacy sections as required", () => {
    const reportData: ReportResponse = {
      scale_code: "BIG5_OCEAN",
      report: {
        scale_code: "BIG5_OCEAN",
      },
      [BIG5_RESULT_PAGE_V2_PAYLOAD_KEY]: createCanonicalPayload(),
    };

    expect(canRenderRichResultReport(reportData)).toBe(true);
    render(<RichResultReport locale="zh" reportData={reportData} />);

    expect(screen.getByTestId("big5-result-page-v2-shell")).toBeInTheDocument();
  });

  it("rejects unknown module keys and exposes only the reliable legacy five-domain core", () => {
    const payload = createCanonicalPayload();
    payload.modules = [
      ...payload.modules,
      {
        module_key: "module_99_unknown",
        blocks: [],
      },
    ];

    render(<RichResultReport locale="zh" reportData={withResultPageV2(payload)} />);

    expect(getBig5ResultPageV2Payload(withResultPageV2(payload))).toBeNull();
    expect(getBig5ResultPageV2SemanticDecision(withResultPageV2(payload)).mode).toBe("reject");
    expect(screen.getByTestId("big5-core-only-shell")).toHaveAttribute("data-core-source", "legacy");
    expect(screen.getAllByRole("progressbar")).toHaveLength(5);
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
  });

  it("rejects unknown block kinds and exposes only the reliable legacy five-domain core", () => {
    const payload = createCanonicalPayload();
    payload.modules[0].blocks[0].block_kind = "unsupported_interpretation";

    render(<RichResultReport locale="zh" reportData={withResultPageV2(payload)} />);

    expect(getBig5ResultPageV2Payload(withResultPageV2(payload))).toBeNull();
    expect(getBig5ResultPageV2SemanticDecision(withResultPageV2(payload)).mode).toBe("reject");
    expect(screen.getByTestId("big5-core-only-shell")).toHaveAttribute("data-core-source", "legacy");
    expect(screen.getAllByRole("progressbar")).toHaveLength(5);
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
  });

  it("fails closed when a method block is empty and never publishes placeholder UI", () => {
    const payload = createCanonicalPayload();
    const method = payload.modules.find((module) => module.module_key === "module_10_method_privacy");
    expect(method).toBeDefined();
    if (method) method.blocks[0].content = {};

    render(<RichResultReport locale="zh" reportData={withResultPageV2(payload)} />);

    expect(getBig5ResultPageV2SemanticDecision(withResultPageV2(payload)).mode).toBe("core_only");
    expect(screen.getByTestId("big5-core-only-shell")).toHaveAttribute("data-core-source", "v2");
    expect(screen.getAllByRole("progressbar")).toHaveLength(5);
    expect(screen.queryByTestId("big5-v2-deferred")).not.toBeInTheDocument();
    expect(screen.queryByText("此模块暂未启用")).not.toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
    expect(screen.queryByText(/根据你的分数/)).not.toBeInTheDocument();
    expect(screen.queryByText(/你可能是/)).not.toBeInTheDocument();
  });

  it("does not expose V2 payload internals as visible UI labels", () => {
    render(<RichResultReport locale="zh" reportData={withResultPageV2(createCanonicalPayload())} />);

    expect(screen.getByTestId("big5-result-page-v2-shell")).toBeInTheDocument();
    expect(screen.queryByText("big5_result_page_v2")).not.toBeInTheDocument();
    expect(screen.queryByText("fap.big5.result_page.v2")).not.toBeInTheDocument();
    expect(screen.queryByText("module_00_trust_bar")).not.toBeInTheDocument();
    expect(screen.queryByText("trust_bar")).not.toBeInTheDocument();
    expect(screen.queryByText(/backend V2 payload/i)).not.toBeInTheDocument();
  });

  it("does not render profile_signature as a fixed type", () => {
    render(<RichResultReport locale="zh" reportData={withResultPageV2(createCanonicalPayload())} />);

    expect(screen.queryByText("signature.fixture.sensitive_independent")).not.toBeInTheDocument();
    expect(screen.queryByText("sensitive_independent_fixture")).not.toBeInTheDocument();
  });

  it("rejects public fixed-type profile signatures", () => {
    const payload = createCanonicalPayload();
    payload.projection_v2.profile_signature.is_fixed_type = true;

    expect(parseBig5ResultPageV2Payload(payload)).toBeNull();
  });

  it("rejects shareable blocks with raw score fields", () => {
    const payload = createCanonicalPayload();
    const share = payload.modules.find((module) => module.module_key === "module_08_share_save");
    expect(share).toBeDefined();
    if (!share) return;
    share.blocks[0].shareable = true;
    share.blocks[0].content = {
      summary_zh: "fixture share",
      raw_score: 68,
    };

    expect(parseBig5ResultPageV2Payload(payload)).toBeNull();
  });

  it("renders authorized percentiles only when the projection explicitly allows them", () => {
    render(<RichResultReport locale="en" reportData={withResultPageV2(createRuntimeV2Payload({ percentileAllowed: true }))} />);

    expect(screen.getAllByRole("progressbar")).toHaveLength(5);
    expect(screen.getByTestId("big5-v2-percentile-O")).toHaveTextContent("Percentile 59");
    expect(screen.getByText(/This non-type profile body/)).toBeInTheDocument();
    expect(screen.getAllByText("Strength").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Trade-off").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Action").length).toBeGreaterThan(0);
    expect(screen.getByTestId("big5-v2-block-method_boundary")).toHaveTextContent("not a medical or psychological diagnosis");
  });

  it("rejects low-quality payloads and exposes only the reliable legacy five-domain core", () => {
    render(<RichResultReport locale="zh" reportData={withResultPageV2(createLowQualityPayload())} />);

    expect(getBig5ResultPageV2SemanticDecision(withResultPageV2(createLowQualityPayload())).mode).toBe("reject");
    expect(screen.getByTestId("big5-core-only-shell")).toHaveAttribute("data-core-source", "legacy");
    expect(screen.getAllByRole("progressbar")).toHaveLength(5);
    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();
    expect(screen.queryByText(/根据你的分数/)).not.toBeInTheDocument();
    expect(screen.queryByText(/你的性格说明/)).not.toBeInTheDocument();
  });

  it("rejects a missing core dimension and an unrecoverable candidate", () => {
    const missingDimension = createCanonicalPayload() as MutableBig5ResultPageV2Fixture & {
      projection_v2: { domains?: Record<string, unknown> };
    };
    const projection = missingDimension.projection_v2 as unknown as { domains: Record<string, unknown> };
    delete projection.domains.N;

    expect(assessBig5ResultPageV2Payload(missingDimension)).toMatchObject({
      mode: "reject",
      reasons: expect.arrayContaining(["core_projection_cardinality_invalid"]),
    });
    expect(assessBig5ResultPageV2Payload({ schema_version: "broken" })).toEqual({
      mode: "reject",
      payload: null,
      reasons: ["v2_shape_invalid"],
    });
  });
});
