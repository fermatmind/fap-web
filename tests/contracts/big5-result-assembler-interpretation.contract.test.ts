import { describe, expect, it } from "vitest";
import type { ReportResponse } from "@/lib/api/v0_3";
import { assembleBig5ResultViewModel } from "@/lib/big5/resultAssembler";
import { BIG5_V1_SAFE_BLOCK_KINDS } from "@/lib/big5/sectionBlueprint";
import profileAFixture from "@/tests/fixtures/big5/report_interpretation_profile_a.projection.json";
import profileBFixture from "@/tests/fixtures/big5/report_interpretation_profile_b.projection.json";
import actionBranchFixture from "@/tests/fixtures/big5/report_action_branch.projection.json";
import facetDenseFixture from "@/tests/fixtures/big5/report_facet_dense.projection.json";

function buildGate() {
  return {
    isFreeVariant: false,
    modulesAllowed: new Set(["big5_core", "big5_full", "big5_action_plan"]),
    modulesPreview: new Set(["big5_core"]),
    freeSections: null,
  };
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

describe("big5 result assembler interpretation wiring contract", () => {
  it("hydrates denser interpretation blocks for the core report sections", () => {
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData: clone(profileAFixture) as ReportResponse,
      gate: buildGate(),
    });

    const corePortrait = assembled.plannedSections.find((section) => section.key === "core_portrait");
    const domainDeepDive = assembled.plannedSections.find((section) => section.key === "domain_deep_dive");
    const actionPlan = assembled.plannedSections.find((section) => section.key === "action_plan");

    expect(corePortrait?.blocks.filter((block) => block.kind === "callout").length).toBeGreaterThanOrEqual(2);
    expect(corePortrait?.blocks.some((block) => String(block.title ?? "").includes("Default style"))).toBe(true);
    expect(corePortrait?.blocks.some((block) => String(block.title ?? "").includes("Where this structure helps"))).toBe(true);

    expect(domainDeepDive).toBeDefined();
    expect(domainDeepDive?.blocks.some((block) => block.kind === "metric_card")).toBe(true);
    expect(
      domainDeepDive?.blocks.some((block) =>
        Array.isArray(block.bullets) && block.bullets.some((item) => item.includes("In daily life:"))
      )
    ).toBe(true);

    expect(actionPlan).toBeDefined();
    expect(actionPlan?.blocks.some((block) => String(block.title ?? "").includes("Keep amplifying"))).toBe(true);
    expect(actionPlan?.blocks.some((block) => String(block.title ?? "").includes("Watch closely"))).toBe(true);
    expect(actionPlan?.blocks.some((block) => String(block.title ?? "").includes("Try this next"))).toBe(true);
  });

  it("densifies facet_details into standout facets plus a full glossary layer", () => {
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData: clone(facetDenseFixture) as ReportResponse,
      gate: buildGate(),
    });

    const facetDetails = assembled.plannedSections.find((section) => section.key === "facet_details");
    expect(facetDetails).toBeDefined();
    expect(facetDetails?.blocks.some((block) => String(block.title ?? "").includes("Standout facets"))).toBe(true);
    expect(facetDetails?.blocks.filter((block) => block.kind === "metric_card").length).toBeGreaterThanOrEqual(5);
    expect(facetDetails?.blocks.some((block) => String(block.title ?? "").includes("Complete glossary"))).toBe(true);
    expect(facetDetails?.blocks.filter((block) => block.kind === "table_row").length).toBeGreaterThanOrEqual(8);
    expect(
      facetDetails?.blocks.some((block) => String(block.body ?? "").includes("This is about cognitive preference"))
    ).toBe(true);
  });

  it("localizes zh facet helper text without exposing the English facet label", () => {
    const assembled = assembleBig5ResultViewModel({
      locale: "zh",
      reportData: clone(facetDenseFixture) as ReportResponse,
      gate: buildGate(),
    });

    const facetDetails = assembled.plannedSections.find((section) => section.key === "facet_details");
    expect(facetDetails).toBeDefined();
    const visibleText = JSON.stringify(facetDetails ?? {});
    expect(visibleText).toContain("重点细分维度");
    expect(visibleText).toContain("全部细分维度");
    expect(visibleText).not.toContain("facets");
    expect(visibleText).not.toContain("facet 百分位");
  });

  it("uses dominant trait plus trait band signals when action_plan_summary actions are sparse", () => {
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData: clone(actionBranchFixture) as ReportResponse,
      gate: buildGate(),
    });

    const actionPlan = assembled.plannedSections.find((section) => section.key === "action_plan");
    const experimentBlock = actionPlan?.blocks.find((block) => String(block.title ?? "").includes("Try this next"));
    const experimentBody = String(experimentBlock?.body ?? "");

    expect(experimentBody).toContain("protected recovery interval");
    expect(experimentBody).toContain("reset ritual");
  });

  it("keeps interpretation-generated blocks inside the blueprint safe block kind subset", () => {
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData: clone(profileAFixture) as ReportResponse,
      gate: buildGate(),
    });

    assembled.plannedSections.forEach((section) => {
      section.blocks.forEach((block) => {
        expect(BIG5_V1_SAFE_BLOCK_KINDS.includes(String(block.kind ?? "") as (typeof BIG5_V1_SAFE_BLOCK_KINDS)[number])).toBe(true);
      });
    });
  });

  it("still respects blueprint source field gates for interpretation-heavy sections", () => {
    const reportData = clone(profileBFixture) as ReportResponse;
    if (reportData.big5_public_projection_v1 && typeof reportData.big5_public_projection_v1 === "object") {
      reportData.big5_public_projection_v1.dominant_traits = [];
      reportData.big5_public_projection_v1.explainability_summary = undefined;
      reportData.big5_public_projection_v1.controlled_narrative_v1 = undefined;
      reportData.big5_public_projection_v1.cultural_calibration_v1 = undefined;
    }

    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData,
      gate: buildGate(),
    });

    expect(assembled.plannedSections.some((section) => section.key === "core_portrait")).toBe(false);
  });
});
