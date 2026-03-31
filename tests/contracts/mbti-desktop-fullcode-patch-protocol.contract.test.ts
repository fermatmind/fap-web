import { describe, expect, it } from "vitest";
import { MBTI_DESKTOP_CLONE_VARIANT_PATCHES_ZH_32 } from "@/components/result/mbti/clone/content";
import { MBTI_FULL_CODES, type MbtiDesktopCloneContentPatch, type MbtiFullCode } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

function countTouchedAuthoringFields(patch: MbtiDesktopCloneContentPatch) {
  let count = 0;

  if (patch.hero?.summary) {
    count += 1;
  }

  if (patch.intro?.paragraphs?.some(Boolean)) {
    count += 1;
  }

  if (patch.traits?.summaryPane?.body) {
    count += 1;
  }

  if (patch.traits?.body?.some(Boolean)) {
    count += 1;
  }

  if (patch.chapters?.career?.intro?.some(Boolean)) {
    count += 1;
  }

  if (patch.chapters?.growth?.intro?.some(Boolean)) {
    count += 1;
  }

  if (patch.chapters?.relationships?.intro?.some(Boolean)) {
    count += 1;
  }

  if (patch.finalOffer?.headline || patch.finalOffer?.body) {
    count += 1;
  }

  return count;
}

function collectPatchTexts(patch: MbtiDesktopCloneContentPatch): string[] {
  return [
    patch.hero?.summary,
    ...(patch.intro?.paragraphs ?? []),
    patch.traits?.summaryPane?.body,
    ...(patch.traits?.body ?? []),
    ...(patch.chapters?.career?.intro ?? []),
    ...(patch.chapters?.growth?.intro ?? []),
    ...(patch.chapters?.relationships?.intro ?? []),
    patch.finalOffer?.headline,
    patch.finalOffer?.body,
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

describe("MBTI desktop fullCode patch protocol", () => {
  it("covers all 32 fullCodes with explicit variant patches", () => {
    expect(Object.keys(MBTI_DESKTOP_CLONE_VARIANT_PATCHES_ZH_32).sort()).toEqual([...MBTI_FULL_CODES].sort());
  });

  it("requires every fullCode patch to touch at least two allowed divergence fields", () => {
    MBTI_FULL_CODES.forEach((fullCode) => {
      const patch = MBTI_DESKTOP_CLONE_VARIANT_PATCHES_ZH_32[fullCode];

      expect(countTouchedAuthoringFields(patch), `${fullCode} should modify at least two divergence fields`).toBeGreaterThanOrEqual(2);
    });
  });

  it("keeps authored patch text free of placeholder markers", () => {
    MBTI_FULL_CODES.forEach((fullCode: MbtiFullCode) => {
      const patch = MBTI_DESKTOP_CLONE_VARIANT_PATCHES_ZH_32[fullCode];
      const texts = collectPatchTexts(patch);

      texts.forEach((text, index) => {
        expect(text.includes("占位"), `${fullCode} patch text[${index}] should not include placeholder markers`).toBe(false);
        expect(text.toLowerCase().includes("placeholder"), `${fullCode} patch text[${index}] should not include placeholder markers`).toBe(false);
      });
    });
  });
});
