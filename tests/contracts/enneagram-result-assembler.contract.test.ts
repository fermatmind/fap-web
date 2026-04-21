import { describe, expect, it } from "vitest";
import type { ReportResponse } from "@/lib/api/v0_3";
import { assembleEnneagramResultViewModel, hasEnneagramProjection } from "@/lib/enneagram/resultAssembler";
import forcedChoice144Fixture from "@/tests/fixtures/enneagram/report_forced_choice_144.projection.json";
import likert105Fixture from "@/tests/fixtures/enneagram/report_likert_105.projection.json";

function asReport(fixture: unknown): ReportResponse {
  return structuredClone(fixture) as ReportResponse;
}

describe("enneagram result assembler contract", () => {
  it("consumes the persisted 105 projection without deriving score fields in the frontend", () => {
    const reportData = asReport(likert105Fixture);
    const assembled = assembleEnneagramResultViewModel({
      reportData,
      locale: "en",
      gate: { isFreeVariant: false },
    });

    expect(hasEnneagramProjection(reportData)).toBe(true);
    expect(assembled.formCode).toBe("enneagram_likert_105");
    expect(assembled.formSummaryLabel).toBe("Enneagram · 105-question Likert");
    expect(assembled.estimatedMinutes).toBe(12);
    expect(assembled.primaryType).toEqual({
      code: "T1",
      label: "Type 1",
      score: 88,
      rank: 1,
    });
    expect(assembled.topTypes.map((type) => type.code)).toEqual(["T1", "T5", "T6"]);
    expect(assembled.typeVector).toHaveLength(9);
    expect(assembled.visibleSections.map((section) => section.key)).toEqual(["overview", "growth"]);
    expect(assembled.lockedSections).toHaveLength(0);
  });

  it("keeps the forced-choice projection as the same scale result contract with a distinct form summary", () => {
    const assembled = assembleEnneagramResultViewModel({
      reportData: asReport(forcedChoice144Fixture),
      locale: "en",
      gate: { isFreeVariant: false },
    });

    expect(assembled.formCode).toBe("enneagram_forced_choice_144");
    expect(assembled.formSummaryLabel).toBe("Enneagram · 144-question Forced-Choice");
    expect(assembled.estimatedMinutes).toBe(18);
    expect(assembled.primaryType?.code).toBe("T5");
    expect(assembled.topTypes.map((type) => type.code)).toEqual(["T5", "T1", "T9"]);
    expect(assembled.summary).toContain("forced-choice primary result is Type 5");
  });

  it("preserves retake form identity from persisted projection metadata when the form summary is absent", () => {
    const reportData = asReport(forcedChoice144Fixture);
    delete reportData.enneagram_form_v1;

    const assembled = assembleEnneagramResultViewModel({
      reportData,
      locale: "en",
      gate: { isFreeVariant: false },
    });

    expect(assembled.formCode).toBe("enneagram_forced_choice_144");
    expect(assembled.formSummaryLabel).toBe("Enneagram · 144-question Forced-Choice");
    expect(assembled.estimatedMinutes).toBe(18);
  });

  it("splits paid sections only by report access gate, not by recalculating Enneagram scores", () => {
    const assembled = assembleEnneagramResultViewModel({
      reportData: asReport(likert105Fixture),
      locale: "en",
      gate: { isFreeVariant: true },
    });

    expect(assembled.visibleSections.map((section) => section.key)).toEqual(["overview"]);
    expect(assembled.lockedSections.map((section) => section.key)).toEqual(["growth"]);
  });
});
