import { describe, expect, it } from "vitest";
import { MBTI_DESKTOP_CLONE_CONTENT_ZH } from "@/components/result/mbti/clone/content";
import { MBTI_BASE_CODES } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

function expectAuthoredText(value: string, context: string) {
  expect(value.trim().length, `${context} should not be empty`).toBeGreaterThan(0);
  expect(value.includes("占位"), `${context} should not contain placeholder markers`).toBe(false);
  expect(value.toLowerCase().includes("placeholder"), `${context} should not contain placeholder markers`).toBe(false);
}

describe("MBTI desktop content registry", () => {
  it("covers all 16 zh base codes with authored content only", () => {
    MBTI_BASE_CODES.forEach((baseCode) => {
      const content = MBTI_DESKTOP_CLONE_CONTENT_ZH[baseCode];

      expectAuthoredText(content.hero.summary, `${baseCode} hero.summary`);
      content.intro.paragraphs.forEach((paragraph, index) => {
        expectAuthoredText(paragraph, `${baseCode} intro.paragraphs[${index}]`);
      });

      expectAuthoredText(content.traits.summaryPane.eyebrow, `${baseCode} traits.summaryPane.eyebrow`);
      expectAuthoredText(content.traits.summaryPane.title, `${baseCode} traits.summaryPane.title`);
      expectAuthoredText(content.traits.summaryPane.value, `${baseCode} traits.summaryPane.value`);
      expectAuthoredText(content.traits.summaryPane.body, `${baseCode} traits.summaryPane.body`);
      content.traits.body.forEach((paragraph, index) => {
        expectAuthoredText(paragraph, `${baseCode} traits.body[${index}]`);
      });

      [content.chapters.career, content.chapters.growth, content.chapters.relationships].forEach((chapter, chapterIndex) => {
        chapter.intro.forEach((paragraph, introIndex) => {
          expectAuthoredText(paragraph, `${baseCode} chapters[${chapterIndex}].intro[${introIndex}]`);
        });

        expect(chapter.influentialTraits).toHaveLength(4);
        chapter.influentialTraits.forEach((trait, traitIndex) => {
          expectAuthoredText(trait.label, `${baseCode} chapters[${chapterIndex}].influentialTraits[${traitIndex}].label`);
          expect(trait.isPlaceholder).toBe(false);
        });

        chapter.visibleBlocks.forEach((block, blockIndex) => {
          if (!block) {
            return;
          }

          expectAuthoredText(block.title, `${baseCode} chapters[${chapterIndex}].visibleBlocks[${blockIndex}].title`);
          expect(block.items).toHaveLength(6);
          block.items.forEach((item, itemIndex) => {
            expectAuthoredText(item.title, `${baseCode} chapters[${chapterIndex}].visibleBlocks[${blockIndex}].items[${itemIndex}].title`);
            expectAuthoredText(item.body, `${baseCode} chapters[${chapterIndex}].visibleBlocks[${blockIndex}].items[${itemIndex}].body`);
            expect(item.isPlaceholder).toBe(false);
          });
        });

        chapter.lockedBlocks.forEach((block, blockIndex) => {
          expectAuthoredText(block.title, `${baseCode} chapters[${chapterIndex}].lockedBlocks[${blockIndex}].title`);
          expectAuthoredText(block.overlayTitle, `${baseCode} chapters[${chapterIndex}].lockedBlocks[${blockIndex}].overlayTitle`);
          expectAuthoredText(block.overlayBody, `${baseCode} chapters[${chapterIndex}].lockedBlocks[${blockIndex}].overlayBody`);
          expectAuthoredText(block.overlayCtaLabel, `${baseCode} chapters[${chapterIndex}].lockedBlocks[${blockIndex}].overlayCtaLabel`);
          expect(block.blurredItems).toHaveLength(6);
          block.blurredItems.forEach((item, itemIndex) => {
            expectAuthoredText(item.title, `${baseCode} chapters[${chapterIndex}].lockedBlocks[${blockIndex}].blurredItems[${itemIndex}].title`);
            expectAuthoredText(item.body, `${baseCode} chapters[${chapterIndex}].lockedBlocks[${blockIndex}].blurredItems[${itemIndex}].body`);
            expect(item.isPlaceholder).toBe(false);
          });
        });
      });

      expectAuthoredText(content.finalOffer.eyebrow, `${baseCode} finalOffer.eyebrow`);
      expectAuthoredText(content.finalOffer.headline, `${baseCode} finalOffer.headline`);
      expectAuthoredText(content.finalOffer.body, `${baseCode} finalOffer.body`);
      expectAuthoredText(content.finalOffer.priceLabel, `${baseCode} finalOffer.priceLabel`);
      expectAuthoredText(content.finalOffer.ctaLabel, `${baseCode} finalOffer.ctaLabel`);
      expectAuthoredText(content.finalOffer.guarantee, `${baseCode} finalOffer.guarantee`);
    });
  });
});
