import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import {
  assessBig5ResultPageV2Payload,
  BIG5_RESULT_PAGE_V2_PAYLOAD_KEY,
} from "@/lib/big5/resultPageV2";
import routeEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_o59_canonical_pilot_payload_v0_1.payload.json";

type MutablePayload = {
  projection_v2: {
    domains: Record<string, { score: number; band: string }>;
  };
  modules: Array<{
    module_key: string;
    blocks: Array<{
      block_key: string;
      block_kind: string;
      content?: Record<string, unknown>;
      registry_refs?: string[];
    }>;
  }>;
};

const REAL_SCORES = { O: 50, C: 30, E: 25, A: 55, N: 70 } as const;

function createRecoverableCandidate(): MutablePayload {
  const payload = structuredClone(routeEnvelope).big5_result_page_v2 as MutablePayload;
  for (const [code, score] of Object.entries(REAL_SCORES)) {
    payload.projection_v2.domains[code].score = score;
  }
  return payload;
}

function reportWith(payload: unknown): ReportResponse {
  return {
    scale_code: "BIG5_OCEAN",
    report: { scale_code: "BIG5_OCEAN" },
    [BIG5_RESULT_PAGE_V2_PAYLOAD_KEY]: payload,
  } as ReportResponse;
}

function renderAndExpectCoreOnly(payload: MutablePayload, reason: string) {
  expect(assessBig5ResultPageV2Payload(payload)).toMatchObject({
    mode: "core_only",
    reasons: expect.arrayContaining([reason]),
  });

  render(<RichResultReport locale="zh" reportData={reportWith(payload)} />);

  expect(screen.getByTestId("big5-core-only-shell")).toHaveAttribute("data-core-source", "v2");
  expect(screen.getAllByRole("progressbar")).toHaveLength(5);
  expect(screen.queryByTestId("big5-result-page-v2-shell")).not.toBeInTheDocument();
  expect(screen.queryByTestId("big5-result-shell")).not.toBeInTheDocument();
  expect(screen.queryByText("此模块暂未启用")).not.toBeInTheDocument();
  expect(document.body.textContent).not.toContain("pending_asset_resolution");
}

describe("Big Five V2 semantic fail-closed production contract", () => {
  it("does not publish a registry candidate universe and keeps only five reliable scores", () => {
    const payload = createRecoverableCandidate();
    const application = payload.modules.find((module) => module.module_key === "module_06_application_matrix");
    expect(application?.blocks.length).toBeGreaterThan(1);

    renderAndExpectCoreOnly(payload, "duplicate_semantic_slot");

    expect(screen.getByTestId("big5-core-domain-O")).toHaveTextContent("50");
    expect(document.body.textContent).not.toContain("现实应用");
  });

  it("fails closed when the same facet contains both high and low assets", () => {
    const payload = createRecoverableCandidate();
    payload.modules[0].blocks[0].registry_refs = ["facet_registry:N1_high:asset"];
    payload.modules[1].blocks[0].registry_refs = ["facet_registry:N1_low:asset"];

    renderAndExpectCoreOnly(payload, "facet_polarity_conflict");
  });

  it("fails closed on duplicate visible content", () => {
    const payload = createRecoverableCandidate();
    const first = payload.modules[0].blocks[0];
    const second = payload.modules[1].blocks[0];
    first.content = { title_zh: "这是一段不应重复公开的生产结果正文" };
    second.content = { title_zh: "这是一段不应重复公开的生产结果正文" };

    renderAndExpectCoreOnly(payload, "duplicate_visible_content");
    expect(document.body.textContent).not.toContain("这是一段不应重复公开的生产结果正文");
  });

  it("fails closed on an empty method module", () => {
    const payload = createRecoverableCandidate();
    const method = payload.modules.find((module) => module.module_key === "module_10_method_privacy");
    expect(method).toBeDefined();
    if (method) {
      method.blocks[0].content = {};
    }

    renderAndExpectCoreOnly(payload, "empty_method_block");
  });

  it("rejects route-band ordinals pretending to be scores", () => {
    expect(assessBig5ResultPageV2Payload(structuredClone(routeEnvelope).big5_result_page_v2)).toMatchObject({
      mode: "reject",
      reasons: expect.arrayContaining(["core_projection_contains_route_band_scores"]),
    });
  });
});
