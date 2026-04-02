import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveMbtiDesktopCloneSlots } from "@/components/result/mbti/clone/mbtiDesktopClone.resolve";
import { MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH } from "@/components/result/mbti/clone/mbtiDesktopClone.placeholders";
import type { MbtiDesktopCloneContent } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import type { MbtiSectionUnlock, RichResultHeadline } from "@/components/result/RichResultReport";
import type { Locale } from "@/lib/i18n/locales";
import type { MbtiResultProjectionViewModel } from "@/lib/mbti/publicProjection";

function createHeadline(typeCode: string, typeName: string): RichResultHeadline {
  return {
    badge: "MBTI",
    typeCode,
    displayName: typeName,
    supportingLine: `${typeCode} supporting line`,
    summary: `${typeName} headline summary`,
    rarity: "test rarity",
  };
}

function createSectionUnlocks(): Record<string, MbtiSectionUnlock> {
  return {
    traits: { teaser: "traits teaser", benefits: ["benefit one"], offer: null },
    career: { teaser: "career teaser", benefits: ["career benefit"], offer: null },
    growth: { teaser: "growth teaser", benefits: ["growth benefit"], offer: null },
    relationships: { teaser: "relationships teaser", benefits: ["relationships benefit"], offer: null },
  };
}

function createStorageContent(tag: string): MbtiDesktopCloneContent {
  return {
    hero: {
      summary: `hero summary ${tag}`,
      profileIdentity: {
        code: tag.toUpperCase(),
        name: `name ${tag}`,
        nickname: `nickname ${tag}`,
        rarity: `rarity ${tag}`,
        keywords: [
          `keyword 1 ${tag}`,
          `keyword 2 ${tag}`,
          `keyword 3 ${tag}`,
          `keyword 4 ${tag}`,
          `keyword 5 ${tag}`,
          `keyword 6 ${tag}`,
        ],
      },
    },
    intro: {
      paragraphs: [`intro one ${tag}`, `intro two ${tag}`],
    },
    lettersIntro: {
      headline: `letters headline ${tag}`,
      letters: [
        { letter: "E", title: `letter E ${tag}`, description: `letter E body ${tag}` },
        { letter: "I", title: `letter I ${tag}`, description: `letter I body ${tag}` },
      ],
    },
    overview: {
      title: `overview title ${tag}`,
      paragraphs: [`overview one ${tag}`, `overview two ${tag}`],
    },
    traits: {
      summaryPane: {
        eyebrow: `eyebrow ${tag}`,
        title: `title ${tag}`,
        value: `value ${tag}`,
        body: `body ${tag}`,
      },
      body: [`traits one ${tag}`, `traits two ${tag}`],
    },
    chapters: {
      career: {
        intro: [`career intro one ${tag}`, `career intro two ${tag}`],
        strengths: {
          title: `career strengths ${tag}`,
          items: [
            { title: `career strengths item ${tag}`, description: `career strengths body ${tag}` },
          ],
        },
        weaknesses: {
          title: `career weaknesses ${tag}`,
          items: [
            { title: `career weaknesses item ${tag}`, description: `career weaknesses body ${tag}` },
          ],
        },
        matchedJobs: {
          title: `matched jobs ${tag}`,
          fitBucket: "primary",
          summary: `matched jobs summary ${tag}`,
          fitReason: `matched jobs reason ${tag}`,
          jobExamples: [`job one ${tag}`, `job two ${tag}`],
        },
        matchedGuides: {
          title: `matched guides ${tag}`,
          summary: `matched guides summary ${tag}`,
          fitReason: `matched guides reason ${tag}`,
        },
        careerIdeas: {
          title: `career ideas ${tag}`,
          items: [
            { title: `career ideas item ${tag}`, description: `career ideas body ${tag}` },
          ],
        },
        workStyles: {
          title: `work styles ${tag}`,
          items: [
            { title: `work styles item ${tag}`, description: `work styles body ${tag}` },
          ],
        },
        influentialTraits: [
          { label: `career trait 1 ${tag}`, body: "body 1", colorKey: "blue" },
          { label: `career trait 2 ${tag}`, body: "body 2", colorKey: "gold" },
          { label: `career trait 3 ${tag}`, body: "body 3", colorKey: "green" },
          { label: `career trait 4 ${tag}`, body: "body 4", colorKey: "purple" },
        ],
        visibleBlocks: [
          {
            title: `career visible ${tag}`,
            items: [
              { title: "item 1", body: "body 1" },
              { title: "item 2", body: "body 2" },
              { title: "item 3", body: "body 3" },
              { title: "item 4", body: "body 4" },
              { title: "item 5", body: "body 5" },
              { title: "item 6", body: "body 6" },
            ],
          },
        ],
        lockedBlocks: [
          {
            title: `career locked 1 ${tag}`,
            overlayTitle: "overlay 1",
            overlayBody: "overlay body 1",
            overlayCtaLabel: "unlock",
            blurredItems: [
              { title: "item 1", body: "body 1" },
              { title: "item 2", body: "body 2" },
              { title: "item 3", body: "body 3" },
              { title: "item 4", body: "body 4" },
              { title: "item 5", body: "body 5" },
              { title: "item 6", body: "body 6" },
            ],
          },
          {
            title: `career locked 2 ${tag}`,
            overlayTitle: "overlay 2",
            overlayBody: "overlay body 2",
            overlayCtaLabel: "unlock",
            blurredItems: [
              { title: "item 1", body: "body 1" },
              { title: "item 2", body: "body 2" },
              { title: "item 3", body: "body 3" },
              { title: "item 4", body: "body 4" },
              { title: "item 5", body: "body 5" },
              { title: "item 6", body: "body 6" },
            ],
          },
        ],
      },
      growth: {
        intro: [`growth intro one ${tag}`, `growth intro two ${tag}`],
        strengths: {
          title: `growth strengths ${tag}`,
          items: [
            { title: `growth strengths item ${tag}`, description: `growth strengths body ${tag}` },
          ],
        },
        weaknesses: {
          title: `growth weaknesses ${tag}`,
          items: [
            { title: `growth weaknesses item ${tag}`, description: `growth weaknesses body ${tag}` },
          ],
        },
        whatEnergizes: {
          title: `what energizes ${tag}`,
          items: [
            { title: `what energizes item ${tag}`, description: `what energizes body ${tag}` },
          ],
        },
        whatDrains: {
          title: `what drains ${tag}`,
          items: [
            { title: `what drains item ${tag}`, description: `what drains body ${tag}` },
          ],
        },
        influentialTraits: [
          { label: `growth trait 1 ${tag}`, body: "body 1", colorKey: "blue" },
          { label: `growth trait 2 ${tag}`, body: "body 2", colorKey: "gold" },
          { label: `growth trait 3 ${tag}`, body: "body 3", colorKey: "green" },
          { label: `growth trait 4 ${tag}`, body: "body 4", colorKey: "purple" },
        ],
        visibleBlocks: [
          {
            title: `growth visible ${tag}`,
            items: [
              { title: "item 1", body: "body 1" },
              { title: "item 2", body: "body 2" },
              { title: "item 3", body: "body 3" },
              { title: "item 4", body: "body 4" },
              { title: "item 5", body: "body 5" },
              { title: "item 6", body: "body 6" },
            ],
          },
        ],
        lockedBlocks: [
          {
            title: `growth locked 1 ${tag}`,
            overlayTitle: "overlay 1",
            overlayBody: "overlay body 1",
            overlayCtaLabel: "unlock",
            blurredItems: [
              { title: "item 1", body: "body 1" },
              { title: "item 2", body: "body 2" },
              { title: "item 3", body: "body 3" },
              { title: "item 4", body: "body 4" },
              { title: "item 5", body: "body 5" },
              { title: "item 6", body: "body 6" },
            ],
          },
          {
            title: `growth locked 2 ${tag}`,
            overlayTitle: "overlay 2",
            overlayBody: "overlay body 2",
            overlayCtaLabel: "unlock",
            blurredItems: [
              { title: "item 1", body: "body 1" },
              { title: "item 2", body: "body 2" },
              { title: "item 3", body: "body 3" },
              { title: "item 4", body: "body 4" },
              { title: "item 5", body: "body 5" },
              { title: "item 6", body: "body 6" },
            ],
          },
        ],
      },
      relationships: {
        intro: [`relationships intro one ${tag}`, `relationships intro two ${tag}`],
        strengths: {
          title: `relationships strengths ${tag}`,
          items: [
            { title: `relationships strengths item ${tag}`, description: `relationships strengths body ${tag}` },
          ],
        },
        weaknesses: {
          title: `relationships weaknesses ${tag}`,
          items: [
            { title: `relationships weaknesses item ${tag}`, description: `relationships weaknesses body ${tag}` },
          ],
        },
        superpowers: {
          title: `superpowers ${tag}`,
          items: [
            { title: `superpowers item ${tag}`, description: `superpowers body ${tag}` },
          ],
        },
        pitfalls: {
          title: `pitfalls ${tag}`,
          items: [
            { title: `pitfalls item ${tag}`, description: `pitfalls body ${tag}` },
          ],
        },
        influentialTraits: [
          { label: `relationships trait 1 ${tag}`, body: "body 1", colorKey: "blue" },
          { label: `relationships trait 2 ${tag}`, body: "body 2", colorKey: "gold" },
          { label: `relationships trait 3 ${tag}`, body: "body 3", colorKey: "green" },
          { label: `relationships trait 4 ${tag}`, body: "body 4", colorKey: "purple" },
        ],
        visibleBlocks: [
          {
            title: `relationships visible ${tag}`,
            items: [
              { title: "item 1", body: "body 1" },
              { title: "item 2", body: "body 2" },
              { title: "item 3", body: "body 3" },
              { title: "item 4", body: "body 4" },
              { title: "item 5", body: "body 5" },
              { title: "item 6", body: "body 6" },
            ],
          },
        ],
        lockedBlocks: [
          {
            title: `relationships locked 1 ${tag}`,
            overlayTitle: "overlay 1",
            overlayBody: "overlay body 1",
            overlayCtaLabel: "unlock",
            blurredItems: [
              { title: "item 1", body: "body 1" },
              { title: "item 2", body: "body 2" },
              { title: "item 3", body: "body 3" },
              { title: "item 4", body: "body 4" },
              { title: "item 5", body: "body 5" },
              { title: "item 6", body: "body 6" },
            ],
          },
          {
            title: `relationships locked 2 ${tag}`,
            overlayTitle: "overlay 2",
            overlayBody: "overlay body 2",
            overlayCtaLabel: "unlock",
            blurredItems: [
              { title: "item 1", body: "body 1" },
              { title: "item 2", body: "body 2" },
              { title: "item 3", body: "body 3" },
              { title: "item 4", body: "body 4" },
              { title: "item 5", body: "body 5" },
              { title: "item 6", body: "body 6" },
            ],
          },
        ],
      },
    },
    finalOffer: {
      eyebrow: `offer eyebrow ${tag}`,
      headline: `offer headline ${tag}`,
      body: `offer body ${tag}`,
      priceLabel: `offer price label ${tag}`,
      ctaLabel: `offer cta label ${tag}`,
      guarantee: `offer guarantee ${tag}`,
    },
  };
}

function resolveSlotsForType({
  typeCode,
  typeName,
  locale = "zh",
  storageContent = null,
  dimensions = [],
}: {
  typeCode: string;
  typeName: string;
  locale?: Locale;
  storageContent?: MbtiDesktopCloneContent | null;
  dimensions?: Array<Record<string, unknown>>;
}) {
  return resolveMbtiDesktopCloneSlots({
    locale,
    headline: createHeadline(typeCode, typeName),
    dimensions,
    highlights: [],
    sections: [],
    sectionUnlocks: createSectionUnlocks(),
    offers: [],
    projectionViewModel: null as MbtiResultProjectionViewModel | null,
    storageContent,
  });
}

describe("MBTI desktop storage cutover contract", () => {
  it("uses storage content for INFJ-A and ENTJ-T under zh while retaining compatibility fields in resolver slots", () => {
    const infjStorage = createStorageContent("infj-a");
    const entjStorage = createStorageContent("entj-t");

    const infjSlots = resolveSlotsForType({
      typeCode: "INFJ-A",
      typeName: "INFJ 类型",
      storageContent: infjStorage,
    });
    const entjSlots = resolveSlotsForType({
      typeCode: "ENTJ-T",
      typeName: "ENTJ 类型",
      storageContent: entjStorage,
    });

    expect(infjSlots.meta.fullCode).toBe("INFJ-A");
    expect(infjSlots.meta.authoringLevel).toBe("fullCode");
    expect(infjSlots.meta.contentSource).toBe("storage");
    expect(infjSlots.hero.summary).toBe(infjStorage.hero.summary);
    expect(infjSlots.lettersIntro?.headline).toBe(infjStorage.lettersIntro?.headline);
    expect(infjSlots.overview?.title).toBe(infjStorage.overview?.title);
    expect(infjSlots.finalOffer.headline).toBe(infjStorage.finalOffer.headline);
    expect(infjSlots.chapters.career.strengths).toEqual(infjStorage.chapters.career.strengths);
    expect(infjSlots.chapters.career.weaknesses).toEqual(infjStorage.chapters.career.weaknesses);
    expect(infjSlots.chapters.career.matchedJobs).toEqual(infjStorage.chapters.career.matchedJobs);
    expect(infjSlots.chapters.career.matchedGuides).toEqual(infjStorage.chapters.career.matchedGuides);
    // Deprecated transition fields remain in resolver slots for compatibility.
    expect(infjSlots.chapters.career.careerIdeas).toEqual(infjStorage.chapters.career.careerIdeas);
    expect(infjSlots.chapters.career.workStyles).toEqual(infjStorage.chapters.career.workStyles);

    expect(entjSlots.meta.fullCode).toBe("ENTJ-T");
    expect(entjSlots.meta.authoringLevel).toBe("fullCode");
    expect(entjSlots.meta.contentSource).toBe("storage");
    expect(entjSlots.hero.summary).toBe(entjStorage.hero.summary);
    expect(entjSlots.chapters.growth.strengths).toEqual(entjStorage.chapters.growth.strengths);
    expect(entjSlots.chapters.growth.weaknesses).toEqual(entjStorage.chapters.growth.weaknesses);
    expect(entjSlots.chapters.growth.whatEnergizes).toEqual(entjStorage.chapters.growth.whatEnergizes);
    expect(entjSlots.chapters.growth.whatDrains).toEqual(entjStorage.chapters.growth.whatDrains);
    expect(entjSlots.chapters.relationships.strengths).toEqual(entjStorage.chapters.relationships.strengths);
    expect(entjSlots.chapters.relationships.weaknesses).toEqual(entjStorage.chapters.relationships.weaknesses);
    expect(entjSlots.chapters.relationships.superpowers).toEqual(entjStorage.chapters.relationships.superpowers);
    expect(entjSlots.chapters.relationships.pitfalls).toEqual(entjStorage.chapters.relationships.pitfalls);
    expect(entjSlots.chapters.growth.visibleBlocks).toEqual(entjStorage.chapters.growth.visibleBlocks);
  });

  it("falls back to placeholder for non-zh locales and for storage misses", () => {
    const infjStorage = createStorageContent("infj-a");
    const enSlots = resolveSlotsForType({
      typeCode: "INFJ-A",
      typeName: "INFJ 类型",
      locale: "en",
      storageContent: infjStorage,
    });
    const missSlots = resolveSlotsForType({
      typeCode: "INFJ-A",
      typeName: "INFJ 类型",
      storageContent: null,
    });

    expect(enSlots.meta.contentSource).toBe("placeholder");
    expect(enSlots.hero.summary).toBe(MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.hero.summary);
    expect(enSlots.finalOffer.headline).toBe(MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.finalOffer.headline);
    expect(enSlots.lettersIntro).toBeNull();
    expect(enSlots.overview).toBeNull();
    expect(enSlots.chapters.career.strengths).toBeNull();
    expect(enSlots.chapters.career.matchedJobs).toBeNull();
    expect(enSlots.chapters.career.careerIdeas).toBeNull();
    expect(enSlots.chapters.growth.whatEnergizes).toBeNull();
    expect(enSlots.chapters.relationships.superpowers).toBeNull();

    expect(missSlots.meta.contentSource).toBe("placeholder");
    expect(missSlots.hero.summary).toBe(MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.hero.summary);
    expect(missSlots.lettersIntro).toBeNull();
    expect(missSlots.overview).toBeNull();
    expect(missSlots.chapters.growth.strengths).toBeNull();
    expect(missSlots.chapters.growth.whatDrains).toBeNull();
    expect(missSlots.chapters.relationships.pitfalls).toBeNull();
    expect(missSlots.chapters.relationships.lockedBlocks).toEqual(
      MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH.chapters.relationships.lockedBlocks,
    );
  });

  it("keeps canonical runtime axis summary values on placeholder path", () => {
    const slots = resolveSlotsForType({
      typeCode: "INFJ-A",
      typeName: "INFJ 类型",
      storageContent: null,
      dimensions: [
        {
          axisTitle: "Mind",
          dominantLabel: "Intuitive",
          dominantPct: 75,
          summary: "Runtime summary",
        },
      ],
    });

    expect(slots.meta.contentSource).toBe("placeholder");
    expect(slots.traits.summaryPane.eyebrow).toBe("Mind");
    expect(slots.traits.summaryPane.title).toBe("Intuitive");
    expect(slots.traits.summaryPane.value).toBe("75%");
    expect(slots.traits.summaryPane.body).toBe("Runtime summary");
  });

  it("does not import the local 32-type registry in runtime resolver path", () => {
    const resolverSource = fs.readFileSync(
      path.join(process.cwd(), "components/result/mbti/clone/mbtiDesktopClone.resolve.ts"),
      "utf8",
    );

    expect(resolverSource).not.toContain('from "@/components/result/mbti/clone/content"');
    expect(resolverSource).not.toContain("MBTI_DESKTOP_CLONE_CONTENT_ZH_32");
  });
});
