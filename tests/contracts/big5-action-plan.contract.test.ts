import { describe, expect, it } from "vitest";
import type { ReportResponse } from "@/lib/api/v0_3";
import { assembleBig5ResultViewModel } from "@/lib/big5/resultAssembler";
import actionBranchFixture from "@/tests/fixtures/big5/report_action_branch.projection.json";

function buildGate() {
  return {
    isFreeVariant: false,
    modulesAllowed: new Set(["big5_core", "big5_full", "big5_action_plan"]),
    modulesPreview: new Set(["big5_core"]),
    freeSections: null,
  };
}

describe("big5 action plan contract", () => {
  it("renders leverage, watch-out, and experiment groups with concrete next actions", () => {
    const assembled = assembleBig5ResultViewModel({
      locale: "en",
      reportData: structuredClone(actionBranchFixture) as ReportResponse,
      gate: buildGate(),
    });

    const section = assembled.plannedSections.find((item) => item.key === "action_plan");
    expect(section).toBeDefined();
    expect(section?.blocks.some((block) => String(block.title ?? "").includes("Keep amplifying"))).toBe(true);
    expect(section?.blocks.some((block) => String(block.title ?? "").includes("Watch closely"))).toBe(true);
    expect(section?.blocks.some((block) => String(block.title ?? "").includes("Try this next"))).toBe(true);
    expect(section?.blocks.some((block) => String(block.body ?? "").includes("reset ritual"))).toBe(true);
    expect(section?.blocks.some((block) => String(block.body ?? "").includes("protected recovery interval"))).toBe(true);
  });
});
