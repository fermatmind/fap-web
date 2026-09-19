import { describe, expect, it } from "vitest";
import { assembleEnneagramResultViewModel, hasEnneagramProjection } from "@/lib/enneagram/resultAssembler";
import { createSevenChapterReport } from "@/tests/contracts/helpers/enneagramSevenChapterFixture";

describe("ENNEAGRAM seven-chapter result assembler", () => {
  it.each(["clear", "close_call", "diffuse", "low_quality"] as const)("normalizes the %s state without changing scores", (scope) => {
    const report = createSevenChapterReport({ scope });
    const view = assembleEnneagramResultViewModel({ reportData: report, locale: "en", gate: { isFreeVariant: false } });
    expect(hasEnneagramProjection(report, "en")).toBe(true);
    expect(view.interpretationScope).toBe(scope);
    expect(view.pages).toHaveLength(7);
    expect(view.distribution).toHaveLength(9);
    expect(view.candidates).toHaveLength(3);
    expect(view.candidates.every((candidate) => candidate.sections.length === 20)).toBe(true);
    expect(view.candidates.every((candidate) => candidate.growthActions.length === 5)).toBe(true);
    expect(view.candidates[0].sectionMap["6.4"].levels).toHaveLength(9);
    expect(view.candidates[0].sectionMap["6.4"].assignmentAllowed).toBe(false);
  });

  it.each(["enneagram_likert_105", "enneagram_forced_choice_144"] as const)("keeps the %s score space backend-owned", (formCode) => {
    const view = assembleEnneagramResultViewModel({ reportData: createSevenChapterReport({ formCode }), locale: "en", gate: { isFreeVariant: false } });
    expect(view.formCode).toBe(formCode);
    expect(view.formVariant).toBe(formCode === "enneagram_likert_105" ? "e105" : "fc144");
    expect(view.distribution.every((row) => row.scoreSource === "form_local")).toBe(true);
  });

  it("supports all types in each Top 3 role", () => {
    for (let type = 1; type <= 9; type += 1) {
      for (let rank = 0; rank < 3; rank += 1) {
        const others = Array.from({ length: 9 }, (_, index) => index + 1).filter((value) => value !== type).slice(0, 2);
        const top = [...others]; top.splice(rank, 0, type);
        const view = assembleEnneagramResultViewModel({ reportData: createSevenChapterReport({ top }), locale: "en", gate: { isFreeVariant: false } });
        expect(view.candidates[rank].typeId).toBe(String(type));
      }
    }
  });

  it("fails closed on missing canonical content, wrong locale, and unknown sections", () => {
    const missing = createSevenChapterReport();
    const missingCandidates = (missing.enneagram_report_v2 as unknown as { candidates: Array<{ sections: unknown[] }> }).candidates;
    missingCandidates[0].sections.pop();
    expect(hasEnneagramProjection(missing, "en")).toBe(false);
    const wrongLocale = createSevenChapterReport({ locale: "zh-CN" });
    expect(hasEnneagramProjection(wrongLocale, "en")).toBe(false);
    const unknown = createSevenChapterReport();
    const unknownCandidates = (unknown.enneagram_report_v2 as unknown as { candidates: Array<{ sections: Array<{ section_id: string }> }> }).candidates;
    unknownCandidates[0].sections[0].section_id = "internal.unknown";
    expect(hasEnneagramProjection(unknown, "en")).toBe(false);
  });

  it("renders localized Chinese and English canonical bodies", () => {
    expect(assembleEnneagramResultViewModel({ reportData: createSevenChapterReport({ locale: "zh-CN" }), locale: "zh", gate: { isFreeVariant: false } }).candidates[0].typeName).toContain("类型");
    expect(assembleEnneagramResultViewModel({ reportData: createSevenChapterReport({ locale: "en" }), locale: "en", gate: { isFreeVariant: false } }).candidates[0].typeName).toContain("Type");
  });

  it("keeps previewed Enneagram V2 modules hidden without unlocking adjacent paid modules", () => {
    const view = assembleEnneagramResultViewModel({
      reportData: createSevenChapterReport(),
      locale: "en",
      gate: { isFreeVariant: true, modulesAllowed: new Set(["enneagram_core"]) },
    });
    expect(view.reportV2).toBeNull();
    expect(view.candidates).toEqual([]);
  });
});
