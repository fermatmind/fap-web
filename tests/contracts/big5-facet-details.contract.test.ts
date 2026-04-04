import { describe, expect, it } from "vitest";
import type { ReportResponse } from "@/lib/api/v0_3";
import { assembleBig5ResultViewModel } from "@/lib/big5/resultAssembler";
import facetDenseFixture from "@/tests/fixtures/big5/report_facet_dense.projection.json";

function buildGate() {
  return {
    isFreeVariant: false,
    modulesAllowed: new Set(["big5_core", "big5_full", "big5_action_plan"]),
    modulesPreview: new Set(["big5_core"]),
    freeSections: null,
  };
}

describe("big5 facet details contract", () => {
  it("separates standout facets from the full glossary and keeps hint text visible", () => {
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData: structuredClone(facetDenseFixture) as ReportResponse,
      gate: buildGate(),
    });

    const section = assembled.plannedSections.find((item) => item.key === "facet_details");
    expect(section).toBeDefined();
    expect(section?.blocks.some((block) => String(block.title ?? "").includes("Standout facets"))).toBe(true);
    expect(section?.blocks.some((block) => String(block.title ?? "").includes("Complete glossary"))).toBe(true);
    expect(section?.blocks.filter((block) => block.kind === "metric_card").length).toBeGreaterThanOrEqual(5);
    expect(section?.blocks.filter((block) => block.kind === "table_row").length).toBeGreaterThanOrEqual(8);
    expect(section?.blocks.some((block) => String(block.body ?? "").includes("Use it to notice whether"))).toBe(true);
  });
});
