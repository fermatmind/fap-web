import { describe, expect, it } from "vitest";
import type { ReportResponse } from "@/lib/api/v0_3";
import { assembleBig5ResultViewModel } from "@/lib/big5/resultAssembler";
import normsRichFixture from "@/tests/fixtures/big5/report_norms_rich.projection.json";

function buildGate() {
  return {
    isFreeVariant: false,
    modulesAllowed: new Set(["big5_core", "big5_full", "big5_action_plan"]),
    modulesPreview: new Set(["big5_core"]),
    freeSections: null,
  };
}

describe("big5 norms comparison contract", () => {
  it("renders the section as readable explanation blocks instead of a single thin callout", () => {
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData: structuredClone(normsRichFixture) as ReportResponse,
      gate: buildGate(),
    });

    const section = assembled.plannedSections.find((item) => item.key === "norms_comparison");
    expect(section).toBeDefined();
    expect(section?.blocks.filter((block) => block.kind === "paragraph").length).toBeGreaterThanOrEqual(2);
    expect(section?.blocks.some((block) => block.kind === "metric_card")).toBe(true);
    expect(section?.blocks.some((block) => block.kind === "callout")).toBe(true);
    expect(section?.blocks.some((block) => String(block.body ?? "").includes("not a grade"))).toBe(true);
    expect(section?.blocks.some((block) => String(block.body ?? "").includes("Openness"))).toBe(true);
  });
});
