import { describe, expect, it } from "vitest";
import { MBTI_DESKTOP_CLONE_CONTENT_ZH_32 } from "@/components/result/mbti/clone/content";
import { MBTI_BASE_CODES, MBTI_FULL_CODES, type MbtiBaseCode, type MbtiDesktopCloneContent, type MbtiFullCode } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

const DIVERGENCE_PATHS = [
  (content: MbtiDesktopCloneContent) => content.hero.summary,
  (content: MbtiDesktopCloneContent) => content.intro.paragraphs[1],
  (content: MbtiDesktopCloneContent) => content.traits.summaryPane.body,
  (content: MbtiDesktopCloneContent) => content.traits.body[0],
  (content: MbtiDesktopCloneContent) => content.traits.body[1],
  (content: MbtiDesktopCloneContent) => content.chapters.career.intro[1],
  (content: MbtiDesktopCloneContent) => content.chapters.growth.intro[1],
  (content: MbtiDesktopCloneContent) => content.chapters.relationships.intro[1],
  (content: MbtiDesktopCloneContent) => content.finalOffer.headline,
  (content: MbtiDesktopCloneContent) => content.finalOffer.body,
] as const;

function authoredDifferenceCount(left: MbtiDesktopCloneContent, right: MbtiDesktopCloneContent) {
  return DIVERGENCE_PATHS.reduce((count, pick) => count + (pick(left) !== pick(right) ? 1 : 0), 0);
}

function expectValidPair(baseCode: MbtiBaseCode) {
  const assertiveCode = `${baseCode}-A` as MbtiFullCode;
  const turbulentCode = `${baseCode}-T` as MbtiFullCode;
  const assertiveContent = MBTI_DESKTOP_CLONE_CONTENT_ZH_32[assertiveCode];
  const turbulentContent = MBTI_DESKTOP_CLONE_CONTENT_ZH_32[turbulentCode];

  expect(assertiveContent).toBeDefined();
  expect(turbulentContent).toBeDefined();
  expect(authoredDifferenceCount(assertiveContent, turbulentContent)).toBeGreaterThanOrEqual(2);
  expect(assertiveContent).not.toEqual(turbulentContent);
}

describe("MBTI desktop fullCode authoring model", () => {
  it("covers all 32 fullCodes", () => {
    expect(Object.keys(MBTI_DESKTOP_CLONE_CONTENT_ZH_32).sort()).toEqual([...MBTI_FULL_CODES].sort());
  });

  it("keeps all 16 A/T pairs meaningfully divergent", () => {
    MBTI_BASE_CODES.forEach((baseCode) => {
      expectValidPair(baseCode);
    });
  });

  it("contains authored routing for key sampled fullCodes", () => {
    const sampleCodes: MbtiFullCode[] = ["INFJ-A", "INFJ-T", "ENTJ-A", "ENTJ-T", "ISFJ-A", "ESTP-T"];

    sampleCodes.forEach((fullCode) => {
      const content = MBTI_DESKTOP_CLONE_CONTENT_ZH_32[fullCode];
      expect(content.hero.summary.length).toBeGreaterThan(0);
      expect(content.intro.paragraphs[1].length).toBeGreaterThan(0);
      expect(content.finalOffer.body.length).toBeGreaterThan(0);
    });
  });
});
