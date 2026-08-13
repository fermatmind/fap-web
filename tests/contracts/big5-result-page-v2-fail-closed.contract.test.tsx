import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { RichResultReport } from "@/components/result/RichResultReport";
import type { ReportResponse } from "@/lib/api/v0_3";
import {
  assessBig5ResultPageV2Payload,
  BIG5_RESULT_PAGE_V2_PAYLOAD_KEY,
} from "@/lib/big5/resultPageV2";
import routeEnvelope from "@/tests/fixtures/big5/result_page_v2/route_driven_o59_canonical_pilot_payload_v0_1.payload.json";
import { createRuntimeV2Payload } from "@/tests/fixtures/big5/runtimeV2Payload";

type MutablePayload = {
  canonical_profile_key?: string;
  projection_v2: {
    domains: Record<string, { score: number; band: string }>;
    quality_status?: string;
    norm_status?: string;
    profile_signature?: { signature_key?: string };
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

function createRecoverableCandidate(): MutablePayload {
  return createRuntimeV2Payload() as MutablePayload;
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
    expect(application?.blocks).toHaveLength(1);
    if (application) {
      application.blocks.push({
        ...structuredClone(application.blocks[0]),
        block_key: `${application.blocks[0].block_key}.candidate_copy`,
      });
    }

    renderAndExpectCoreOnly(payload, "duplicate_semantic_slot");

    expect(screen.getByTestId("big5-core-domain-O")).toHaveTextContent("59");
    expect(document.body.textContent).not.toContain("现实应用");
  });

  it("fails closed when the same facet contains both high and low assets", () => {
    const payload = createRecoverableCandidate();
    const facetModule = payload.modules.find((module) => module.module_key === "module_05_facet_reframe");
    expect(facetModule?.blocks).toHaveLength(1);
    if (facetModule) {
      const low = structuredClone(facetModule.blocks[0]);
      low.block_key = "module_05_facet_reframe.n1_low.candidate_copy";
      low.content = { ...low.content, facet_direction: "low" };
      low.registry_refs = ["facet_registry:N1_low:asset"];
      facetModule.blocks.push(low);
    }

    renderAndExpectCoreOnly(payload, "facet_polarity_conflict");
  });

  it("fails closed on duplicate visible content", () => {
    const payload = createRecoverableCandidate();
    const first = payload.modules.find((module) => module.module_key === "module_03_trait_deep_dive")?.blocks[0];
    const second = payload.modules.find((module) => module.module_key === "module_04_coupling")?.blocks[0];
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    if (first?.content && second?.content) {
      first.content.title_zh = "这是一段不应重复公开的生产结果正文";
      second.content.title_zh = "这是一段不应重复公开的生产结果正文";
    }

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

  it("fails closed when an interaction module has no real action", () => {
    const payload = createRecoverableCandidate();
    const share = payload.modules.find((module) => module.module_key === "module_08_share_save");
    expect(share).toBeDefined();
    if (share?.blocks[0].content) {
      delete share.blocks[0].content.actions;
    }

    renderAndExpectCoreOnly(payload, "incomplete_block_content");
    expect(screen.queryByRole("button", { name: /分享|share/i })).not.toBeInTheDocument();
  });

  it("fails closed when an interaction module has no publishable body", () => {
    const payload = createRecoverableCandidate();
    const share = payload.modules.find((module) => module.module_key === "module_08_share_save");
    expect(share).toBeDefined();
    if (share?.blocks[0].content) {
      delete share.blocks[0].content.summary_zh;
      delete share.blocks[0].content.summary_en;
    }

    renderAndExpectCoreOnly(payload, "incomplete_block_content");
  });

  it("rejects unknown quality and norm states as unreliable core authority", () => {
    const unknownQuality = createRecoverableCandidate();
    unknownQuality.projection_v2.quality_status = "mystery";
    expect(assessBig5ResultPageV2Payload(unknownQuality)).toMatchObject({
      mode: "reject",
      reasons: expect.arrayContaining(["core_quality_unreliable"]),
    });

    const unknownNorm = createRecoverableCandidate();
    unknownNorm.projection_v2.norm_status = "mystery";
    expect(assessBig5ResultPageV2Payload(unknownNorm)).toMatchObject({
      mode: "reject",
      reasons: expect.arrayContaining(["core_norm_unreliable"]),
    });
  });

  it("fails closed when runtime profile routing identity is missing", () => {
    const payload = createRecoverableCandidate();
    delete payload.canonical_profile_key;
    delete payload.projection_v2.profile_signature?.signature_key;

    renderAndExpectCoreOnly(payload, "runtime_profile_route_missing");
  });

  it("fails closed when content tries to override projection score authority", () => {
    const payload = createRecoverableCandidate();
    const deepDive = payload.modules.find((module) => module.module_key === "module_03_trait_deep_dive");
    expect(deepDive).toBeDefined();
    if (deepDive?.blocks[0].content) {
      deepDive.blocks[0].content.score = 99;
    }

    renderAndExpectCoreOnly(payload, "content_score_authority_violation");
    expect(document.body.textContent).not.toContain("99");
  });

  it("rejects route-band ordinals pretending to be scores", () => {
    expect(assessBig5ResultPageV2Payload(structuredClone(routeEnvelope).big5_result_page_v2)).toMatchObject({
      mode: "reject",
      reasons: expect.arrayContaining(["core_projection_contains_route_band_scores"]),
    });
  });
});
