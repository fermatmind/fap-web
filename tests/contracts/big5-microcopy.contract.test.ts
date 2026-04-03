import { describe, expect, it } from "vitest";
import {
  BIG5_V1_AUX_MICROCOPY,
  BIG5_V1_MICROCOPY_SECTION_KEYS,
  BIG5_V1_SECTION_MICROCOPY,
  BIG5_V1_STATE_MICROCOPY,
} from "@/lib/big5/microcopy";

const DIRTY_MARKERS = ["placeholder", "todo", "tbd", "xxx", "待补", "占位"];

function expectCleanCopy(value: string, context: string) {
  const normalized = value.trim();
  expect(normalized.length, `${context} should not be empty`).toBeGreaterThan(0);
  DIRTY_MARKERS.forEach((marker) => {
    expect(normalized.toLowerCase().includes(marker), `${context} should not contain ${marker}`).toBe(false);
  });
}

describe("big5 microcopy registry contract", () => {
  it("covers all eight section copy keys with non-empty title/subtitle", () => {
    expect(Object.keys(BIG5_V1_SECTION_MICROCOPY).sort()).toEqual([...BIG5_V1_MICROCOPY_SECTION_KEYS].sort());
    BIG5_V1_MICROCOPY_SECTION_KEYS.forEach((key) => {
      const sectionCopy = BIG5_V1_SECTION_MICROCOPY[key];
      expectCleanCopy(sectionCopy.title, `${key}.title`);
      expectCleanCopy(sectionCopy.subtitle, `${key}.subtitle`);
    });
  });

  it("keeps locked/norms/quality state copy complete and clean", () => {
    expectCleanCopy(BIG5_V1_STATE_MICROCOPY.locked_preview.title, "locked_preview.title");
    expectCleanCopy(BIG5_V1_STATE_MICROCOPY.locked_preview.subtitle, "locked_preview.subtitle");
    expectCleanCopy(BIG5_V1_STATE_MICROCOPY.locked_preview.cta, "locked_preview.cta");
    expectCleanCopy(BIG5_V1_STATE_MICROCOPY.norms.missing, "norms.missing");
    expectCleanCopy(BIG5_V1_STATE_MICROCOPY.norms.calibrated, "norms.calibrated");
    expectCleanCopy(BIG5_V1_STATE_MICROCOPY.quality.a, "quality.a");
    expectCleanCopy(BIG5_V1_STATE_MICROCOPY.quality.b, "quality.b");
    expectCleanCopy(BIG5_V1_STATE_MICROCOPY.quality.c, "quality.c");
  });

  it("keeps aux microcopy keys present and non-empty", () => {
    expectCleanCopy(BIG5_V1_AUX_MICROCOPY.access_label, "aux.access_label");
    expectCleanCopy(BIG5_V1_AUX_MICROCOPY.compare_label, "aux.compare_label");
    expectCleanCopy(BIG5_V1_AUX_MICROCOPY.method_label, "aux.method_label");
    expectCleanCopy(BIG5_V1_AUX_MICROCOPY.method_note, "aux.method_note");
  });
});
