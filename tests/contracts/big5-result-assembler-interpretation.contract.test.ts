import { describe, expect, it } from "vitest";
import type { ReportResponse } from "@/lib/api/v0_3";
import { assembleBig5ResultViewModel } from "@/lib/big5/resultAssembler";
import { BIG5_V1_SAFE_BLOCK_KINDS } from "@/lib/big5/sectionBlueprint";
import profileAFixture from "@/tests/fixtures/big5/report_interpretation_profile_a.projection.json";
import profileBFixture from "@/tests/fixtures/big5/report_interpretation_profile_b.projection.json";

function buildGate() {
  return {
    isFreeVariant: false,
    modulesAllowed: new Set(["big5_core", "big5_full", "big5_action_plan"]),
    modulesPreview: new Set(["big5_core"]),
    freeSections: null,
  };
}

function createFixtureA(): ReportResponse {
  return structuredClone(profileAFixture) as ReportResponse;
}

function createFixtureB(): ReportResponse {
  return structuredClone(profileBFixture) as ReportResponse;
}

describe("big5 result assembler interpretation wiring contract", () => {
  it("hydrates interpretation blocks for core_portrait/domain_deep_dive/facet_details/action_plan", () => {
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData: createFixtureA(),
      gate: buildGate(),
    });

    const corePortrait = assembled.plannedSections.find((section) => section.key === "core_portrait");
    const domainDeepDive = assembled.plannedSections.find((section) => section.key === "domain_deep_dive");
    const facetDetails = assembled.plannedSections.find((section) => section.key === "facet_details");
    const actionPlan = assembled.plannedSections.find((section) => section.key === "action_plan");

    expect(corePortrait).toBeDefined();
    expect(corePortrait?.blocks.some((block) => block.kind === "paragraph")).toBe(true);
    expect(corePortrait?.blocks.some((block) => block.kind === "bullets")).toBe(true);

    expect(domainDeepDive).toBeDefined();
    expect(domainDeepDive?.blocks.some((block) => block.kind === "metric_card")).toBe(true);
    expect(domainDeepDive?.blocks.length).toBeGreaterThanOrEqual(5);

    expect(facetDetails).toBeDefined();
    expect(facetDetails?.blocks.some((block) => block.kind === "table_row")).toBe(true);
    expect(facetDetails?.blocks.some((block) => String(block.body ?? "").includes(" · "))).toBe(true);
    expect(
      facetDetails?.blocks.some((block) =>
        String(block.body ?? "").includes("Pair abstraction with concrete deliverables for team alignment.")
      )
    ).toBe(true);

    expect(actionPlan).toBeDefined();
    expect(actionPlan?.blocks.some((block) => block.kind === "bullets")).toBe(true);
    expect(String(actionPlan?.blocks.find((block) => block.kind === "bullets")?.body ?? "")).toContain(
      "Add one weekly collaboration checkpoint."
    );
  });

  it("uses dominant trait + trait band snippets when action_plan_summary actions are empty", () => {
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData: createFixtureB(),
      gate: buildGate(),
    });

    const actionPlan = assembled.plannedSections.find((section) => section.key === "action_plan");
    const actionBulletsBody = String(actionPlan?.blocks.find((block) => block.kind === "bullets")?.body ?? "");

    expect(actionBulletsBody).toContain("Set weekly completion thresholds and publish progress at a fixed cadence.");
    expect(actionBulletsBody).toContain("Maintain a weekly decompression routine protected like a core task.");
  });

  it("keeps interpretation-generated blocks inside the blueprint safe block kind subset", () => {
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData: createFixtureA(),
      gate: buildGate(),
    });

    assembled.plannedSections.forEach((section) => {
      section.blocks.forEach((block) => {
        expect(BIG5_V1_SAFE_BLOCK_KINDS.includes(String(block.kind ?? "") as (typeof BIG5_V1_SAFE_BLOCK_KINDS)[number])).toBe(true);
      });
    });
  });

  it("still respects blueprint source field gates for interpretation sections", () => {
    const reportData = createFixtureA();
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
