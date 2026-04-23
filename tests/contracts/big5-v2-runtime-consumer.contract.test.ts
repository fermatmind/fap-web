import { describe, expect, it } from "vitest";
import type { ReportResponse } from "@/lib/api/v0_3";
import {
  assembleBig5ResultViewModel,
  hasUsableBig5ReportEngineV2,
  type Big5ResultAssemblerGate,
} from "@/lib/big5/resultAssembler";
import { normalizeBig5CompareSnapshot } from "@/lib/big5/secondarySurfaceNormalizer";
import { BIG5_V1_SAFE_BLOCK_KINDS, BIG5_V1_SECTION_KEYS } from "@/lib/big5/sectionBlueprint";
import liveBridgeV2ReportFixture from "@/tests/fixtures/big5/report_live_bridge_v2.projection.json";
import liveBridgeV2MissingReportFixture from "@/tests/fixtures/big5/report_live_bridge_v2_missing.projection.json";

function buildGate(): Big5ResultAssemblerGate {
  return {
    isFreeVariant: false,
    modulesAllowed: new Set(["big5_core", "big5_full", "big5_action_plan"]),
    modulesPreview: new Set(["big5_core"]),
    freeSections: null,
  };
}

function createLiveBridgeV2Fixture(): ReportResponse {
  return structuredClone(liveBridgeV2ReportFixture) as ReportResponse;
}

function createLiveBridgeV2MissingFixture(): ReportResponse {
  return structuredClone(liveBridgeV2MissingReportFixture) as ReportResponse;
}

function assemble(reportData: ReportResponse) {
  return assembleBig5ResultViewModel({
    locale: "zh",
    reportData,
    gate: buildGate(),
  });
}

describe("Big Five v2 runtime consumer", () => {
  it("uses the additive v2 bridge as the main result page section source when usable", () => {
    const reportData = createLiveBridgeV2Fixture();
    const assembled = assemble(reportData);

    expect(hasUsableBig5ReportEngineV2(reportData)).toBe(true);
    expect(assembled.visibleSections.map((section) => section.key)).toEqual([...BIG5_V1_SECTION_KEYS]);
    expect(assembled.visibleSections.map((section) => section.title)).toEqual([
      "结果摘要",
      "五维总览",
      "五维深解",
      "细分维度焦点",
      "人格总览",
      "相对参照",
      "行动建议",
      "方法与边界",
    ]);
    expect(assembled.visibleSections.map((section) => section.title)).not.toContain("Profile Summary");
    expect(assembled.visibleSections.every((section) => section.module_code === "big5_report_engine_v2")).toBe(true);

    const safeKinds = new Set<string>(BIG5_V1_SAFE_BLOCK_KINDS);
    const allBlocks = assembled.visibleSections.flatMap((section) => section.blocks);
    expect(allBlocks.length).toBeGreaterThan(60);
    expect(allBlocks.every((block) => safeKinds.has(String(block.kind)))).toBe(true);
    expect(allBlocks.some((block) => block.kind === "trait_atomic" || block.kind === "methodology")).toBe(false);
    expect(allBlocks.every((block) => block.source_engine === "big5_report_engine_v2")).toBe(true);
  });

  it("preserves richer v2 facet, synergy, and action payload signals after normalization", () => {
    const assembled = assemble(createLiveBridgeV2Fixture());

    const facetDetails = assembled.visibleSections.find((section) => section.key === "facet_details");
    const corePortrait = assembled.visibleSections.find((section) => section.key === "core_portrait");
    const actionPlan = assembled.visibleSections.find((section) => section.key === "action_plan");

    expect(facetDetails?.blocks.filter((block) => block.kind === "metric_card")).toHaveLength(3);
    expect(facetDetails?.blocks.filter((block) => block.kind === "table_row")).toHaveLength(30);
    expect(corePortrait?.blocks.some((block) => {
      const provenance = block.provenance as { synergy_refs?: string[] } | undefined;
      return Array.isArray(provenance?.synergy_refs)
        && provenance.synergy_refs.some((ref) => ref.includes("n_high_x_e_low"));
    })).toBe(true);
    expect(actionPlan?.blocks.filter((block) => block.kind === "bullets").length).toBeGreaterThanOrEqual(4);
    expect(actionPlan?.blocks.some((block) => String(block.title ?? "").includes("工作场景"))).toBe(true);
  });

  it("falls back to the legacy path when v2 is missing", () => {
    const reportData = createLiveBridgeV2MissingFixture();
    const assembled = assemble(reportData);

    expect(hasUsableBig5ReportEngineV2(reportData)).toBe(false);
    expect(assembled.visibleSections.map((section) => section.key)).toEqual([...BIG5_V1_SECTION_KEYS]);
    expect(assembled.visibleSections.some((section) => section.module_code === "big5_report_engine_v2")).toBe(false);
    expect(assembled.visibleSections.flatMap((section) => section.blocks).some((block) => block.source_engine === "big5_report_engine_v2")).toBe(false);
  });

  it("falls back to the legacy path when v2 is malformed instead of failing the page", () => {
    const reportData = createLiveBridgeV2Fixture();
    reportData.big5_report_engine_v2 = {
      schema_version: "fap.big5.report.v1",
      scale_code: "BIG5_OCEAN",
      sections: [],
    };

    const assembled = assemble(reportData);

    expect(hasUsableBig5ReportEngineV2(reportData)).toBe(false);
    expect(assembled.visibleSections.map((section) => section.key)).toEqual([...BIG5_V1_SECTION_KEYS]);
    expect(assembled.visibleSections.flatMap((section) => section.blocks).some((block) => block.source_engine === "big5_report_engine_v2")).toBe(false);
  });

  it("does not make compare snapshots depend on the v2 bridge field", () => {
    const withV2 = normalizeBig5CompareSnapshot(createLiveBridgeV2Fixture());
    const missingV2 = normalizeBig5CompareSnapshot(createLiveBridgeV2MissingFixture());

    expect(withV2).toEqual(missingV2);
  });
});
