import { describe, expect, it } from "vitest";
import { assembleBig5ResultViewModel, hasUsableBig5ReportEngineV2 } from "@/lib/big5/resultAssembler";
import { canonicalPrivateReport } from "@/tests/fixtures/big5/canonicalPrivateResult";

const gate = { isFreeVariant: false, modulesAllowed: new Set<string>(), modulesPreview: new Set<string>(), freeSections: null };

describe("Big Five canonical runtime consumer", () => {
  it("accepts only an authority-bound immutable compiler payload", () => {
    const report = canonicalPrivateReport();
    expect(hasUsableBig5ReportEngineV2(report)).toBe(true);
    const blocks = assembleBig5ResultViewModel({ locale: "zh", reportData: report, gate }).visibleSections.flatMap((section) => section.blocks);
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.every((block) => block.source_engine === "canonical_private_result")).toBe(true);
    expect(blocks.every((block) => typeof block.block_id === "string" && typeof block.block_uid === "string")).toBe(true);
  });

  it("does not fall back when canonical content is missing or malformed", () => {
    const missing = canonicalPrivateReport();
    delete missing.big5_report_engine_v2;
    expect(hasUsableBig5ReportEngineV2(missing)).toBe(false);
    expect(assembleBig5ResultViewModel({ locale: "zh", reportData: missing, gate }).visibleSections).toEqual([]);

    const malformed = canonicalPrivateReport();
    malformed.big5_report_engine_v2 = { schema_version: "fap.big5.report.v1", scale_code: "BIG5_OCEAN", sections: [] };
    expect(assembleBig5ResultViewModel({ locale: "zh", reportData: malformed, gate }).visibleSections).toEqual([]);
  });
});
