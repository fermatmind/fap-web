import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { canRenderRichResultReport, RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import {
  BIG5_RESULT_PAGE_V2_PAYLOAD_KEY,
  getBig5ResultPageV2Payload,
  parseBig5ResultPageV2Payload,
} from "@/lib/big5/resultPageV2";
import legacyReportFixture from "@/tests/fixtures/big5/report_live_bridge_v2_missing.projection.json";
import canonicalEnvelope from "@/tests/fixtures/big5/result_page_v2_canonical_mixed_signature.payload.json";
import lowQualityEnvelope from "@/tests/fixtures/big5/result_page_v2_low_quality.payload.json";

type MutableBig5ResultPageV2Fixture = {
  modules: Array<{
    module_key?: string;
    blocks: Array<{
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
  return structuredClone(canonicalEnvelope).big5_result_page_v2 as MutableBig5ResultPageV2Fixture;
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
    render(<RichResultReport locale="zh" reportData={withResultPageV2(createCanonicalPayload())} />);

    expect(screen.getByTestId("big5-result-page-v2-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();
    expect(screen.getByTestId("big5-v2-module-module_00_trust_bar")).toBeInTheDocument();
    expect(screen.getByTestId("big5-v2-block-trust_bar")).toHaveTextContent("fixture boundary");
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

  it("rejects unknown module keys and falls back without synthetic V2 copy", () => {
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
    expect(screen.getByTestId("big5-result-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
  });

  it("rejects unknown block kinds and falls back without synthetic V2 copy", () => {
    const payload = createCanonicalPayload();
    payload.modules[0].blocks[0].block_kind = "unsupported_interpretation";

    render(<RichResultReport locale="zh" reportData={withResultPageV2(payload)} />);

    expect(getBig5ResultPageV2Payload(withResultPageV2(payload))).toBeNull();
    expect(screen.getByTestId("big5-result-shell")).toBeInTheDocument();
    expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
  });

  it("renders deferred modules with neutral unavailable UI only", () => {
    const payload = createCanonicalPayload();
    payload.modules[5].blocks[0].content = {};

    render(<RichResultReport locale="zh" reportData={withResultPageV2(payload)} />);

    expect(screen.getAllByTestId("big5-v2-deferred").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("big5-v2-deferred")[0]).toHaveTextContent("此模块暂未启用");
    expect(screen.queryByText(/根据你的分数/)).not.toBeInTheDocument();
    expect(screen.queryByText(/你可能是/)).not.toBeInTheDocument();
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
    payload.modules[8].blocks[0].shareable = true;
    payload.modules[8].blocks[0].content = {
      summary_zh: "fixture share",
      raw_score: 68,
    };

    expect(parseBig5ResultPageV2Payload(payload)).toBeNull();
  });

  it("renders low-quality payloads through the V2 path without adding long-copy fallback", () => {
    render(<RichResultReport locale="zh" reportData={withResultPageV2(createLowQualityPayload())} />);

    expect(screen.getByTestId("big5-result-page-v2-shell")).toBeInTheDocument();
    expect(screen.getByTestId("big5-v2-module-module_00_trust_bar")).toBeInTheDocument();
    expect(screen.queryByText(/根据你的分数/)).not.toBeInTheDocument();
    expect(screen.queryByText(/你的性格说明/)).not.toBeInTheDocument();
  });
});
