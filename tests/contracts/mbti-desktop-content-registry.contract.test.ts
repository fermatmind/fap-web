import { describe, expect, it } from "vitest";
import { MBTI_DESKTOP_CLONE_CONTENT_ZH_32 } from "@/components/result/mbti/clone/content";
import { MBTI_FULL_CODES } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

function expectAuthoredText(value: string, context: string) {
  expect(value.trim().length, `${context} should not be empty`).toBeGreaterThan(0);
  expect(value.includes("占位"), `${context} should not contain placeholder markers`).toBe(false);
  expect(value.toLowerCase().includes("placeholder"), `${context} should not contain placeholder markers`).toBe(false);
}

describe("MBTI desktop fullCode content registry hygiene", () => {
  it("covers all 32 zh fullCodes with authored content only", () => {
    MBTI_FULL_CODES.forEach((fullCode) => {
      const content = MBTI_DESKTOP_CLONE_CONTENT_ZH_32[fullCode];

      expectAuthoredText(content.hero.summary, `${fullCode} hero.summary`);
      content.intro.paragraphs.forEach((paragraph, index) => {
        expectAuthoredText(paragraph, `${fullCode} intro.paragraphs[${index}]`);
      });

      expectAuthoredText(content.traits.summaryPane.eyebrow, `${fullCode} traits.summaryPane.eyebrow`);
      expectAuthoredText(content.traits.summaryPane.title, `${fullCode} traits.summaryPane.title`);
      expectAuthoredText(content.traits.summaryPane.value, `${fullCode} traits.summaryPane.value`);
      expectAuthoredText(content.traits.summaryPane.body, `${fullCode} traits.summaryPane.body`);
      content.traits.body.forEach((paragraph, index) => {
        expectAuthoredText(paragraph, `${fullCode} traits.body[${index}]`);
      });

      [content.chapters.career, content.chapters.growth, content.chapters.relationships].forEach((chapter, chapterIndex) => {
        chapter.intro.forEach((paragraph, introIndex) => {
          expectAuthoredText(paragraph, `${fullCode} chapters[${chapterIndex}].intro[${introIndex}]`);
        });

        expect(chapter.influentialTraits).toHaveLength(4);
        chapter.influentialTraits.forEach((trait, traitIndex) => {
          expectAuthoredText(trait.label, `${fullCode} chapters[${chapterIndex}].influentialTraits[${traitIndex}].label`);
          expect(trait.isPlaceholder).toBe(false);
        });

        chapter.visibleBlocks.forEach((block, blockIndex) => {
          if (!block) {
            return;
          }

          expectAuthoredText(block.title, `${fullCode} chapters[${chapterIndex}].visibleBlocks[${blockIndex}].title`);
          expect(block.items).toHaveLength(6);
          block.items.forEach((item, itemIndex) => {
            expectAuthoredText(item.title, `${fullCode} chapters[${chapterIndex}].visibleBlocks[${blockIndex}].items[${itemIndex}].title`);
            expectAuthoredText(item.body, `${fullCode} chapters[${chapterIndex}].visibleBlocks[${blockIndex}].items[${itemIndex}].body`);
            expect(item.isPlaceholder).toBe(false);
          });
        });

        chapter.lockedBlocks.forEach((block, blockIndex) => {
          expectAuthoredText(block.title, `${fullCode} chapters[${chapterIndex}].lockedBlocks[${blockIndex}].title`);
          expectAuthoredText(block.overlayTitle, `${fullCode} chapters[${chapterIndex}].lockedBlocks[${blockIndex}].overlayTitle`);
          expectAuthoredText(block.overlayBody, `${fullCode} chapters[${chapterIndex}].lockedBlocks[${blockIndex}].overlayBody`);
          expectAuthoredText(block.overlayCtaLabel, `${fullCode} chapters[${chapterIndex}].lockedBlocks[${blockIndex}].overlayCtaLabel`);
          expect(block.blurredItems).toHaveLength(6);
          block.blurredItems.forEach((item, itemIndex) => {
            expectAuthoredText(item.title, `${fullCode} chapters[${chapterIndex}].lockedBlocks[${blockIndex}].blurredItems[${itemIndex}].title`);
            expectAuthoredText(item.body, `${fullCode} chapters[${chapterIndex}].lockedBlocks[${blockIndex}].blurredItems[${itemIndex}].body`);
            expect(item.isPlaceholder).toBe(false);
          });
        });
      });

      expectAuthoredText(content.finalOffer.eyebrow, `${fullCode} finalOffer.eyebrow`);
      expectAuthoredText(content.finalOffer.headline, `${fullCode} finalOffer.headline`);
      expectAuthoredText(content.finalOffer.body, `${fullCode} finalOffer.body`);
      expectAuthoredText(content.finalOffer.priceLabel, `${fullCode} finalOffer.priceLabel`);
      expectAuthoredText(content.finalOffer.ctaLabel, `${fullCode} finalOffer.ctaLabel`);
      expectAuthoredText(content.finalOffer.guarantee, `${fullCode} finalOffer.guarantee`);
    });
  });
});
