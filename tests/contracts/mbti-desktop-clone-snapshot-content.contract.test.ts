import { describe, expect, it } from "vitest";
import {
  resolveMbtiDesktopCloneSlotsResult,
  type ResolveMbtiDesktopCloneSlotsArgs,
} from "@/components/result/mbti/clone/mbtiDesktopClone.resolve";
import type {
  ContentListBlock,
  LockedListBlock,
  MbtiDesktopCloneContent,
} from "@/components/result/mbti/clone/mbtiDesktopClone.slots";
import {
  validateMbtiSnapshotDesktopCloneContent,
  type MbtiSnapshotContentStatus,
} from "@/lib/result/mbtiSnapshotContent";
import type { PersonalityDesktopCloneContentPayload } from "@/lib/cms/personality-desktop-clone";

function createResolveArgs(storageContent: MbtiDesktopCloneContent | null = null): ResolveMbtiDesktopCloneSlotsArgs {
  return {
    locale: "zh",
    headline: {
      badge: "MBTI",
      typeCode: "INTJ-A",
      displayName: "建筑师",
      supportingLine: "supporting",
      summary: "summary",
      rarity: "rare",
    },
    dimensions: [],
    highlights: [],
    sections: [],
    sectionUnlocks: {},
    offers: [],
    projectionViewModel: null,
    storageContent,
  };
}

function listBlock(title: string, bodyPrefix: string): ContentListBlock {
  return {
    title,
    items: [
      { title: `${title} 1`, body: `${bodyPrefix} observation 1.` },
      { title: `${title} 2`, body: `${bodyPrefix} observation 2.` },
      { title: `${title} 3`, body: `${bodyPrefix} observation 3.` },
      { title: `${title} 4`, body: `${bodyPrefix} observation 4.` },
      { title: `${title} 5`, body: `${bodyPrefix} observation 5.` },
      { title: `${title} 6`, body: `${bodyPrefix} observation 6.` },
    ],
  };
}

function lockedBlock(title: string): LockedListBlock {
  return {
    title,
    overlayTitle: "Unlock",
    overlayBody: "Unlock details.",
    overlayCtaLabel: "Unlock",
    blurredItems: [
      { title: `${title} 1`, body: "Locked detail 1." },
      { title: `${title} 2`, body: "Locked detail 2." },
      { title: `${title} 3`, body: "Locked detail 3." },
      { title: `${title} 4`, body: "Locked detail 4." },
      { title: `${title} 5`, body: "Locked detail 5." },
      { title: `${title} 6`, body: "Locked detail 6." },
    ],
  };
}

function traits(labelPrefix: string): MbtiDesktopCloneContent["chapters"]["career"]["influentialTraits"] {
  return [
    { label: `${labelPrefix} 1`, body: "Body 1", colorKey: "blue" },
    { label: `${labelPrefix} 2`, body: "Body 2", colorKey: "gold" },
    { label: `${labelPrefix} 3`, body: "Body 3", colorKey: "green" },
    { label: `${labelPrefix} 4`, body: "Body 4", colorKey: "purple" },
  ];
}

function createContent(): MbtiDesktopCloneContent {
  return {
    hero: {
      summary: "A specific INTJ-A result summary.",
      profileIdentity: {
        code: "INTJ-A",
        name: "建筑师",
        nickname: "稳态规划者",
        rarity: "稀有",
        keywords: ["规划", "独立"],
      },
    },
    intro: {
      paragraphs: ["Intro paragraph one.", "Intro paragraph two."],
    },
    traits: {
      summaryPane: {
        eyebrow: "Core axis",
        title: "Strategic clarity",
        value: "82%",
        body: "A grounded trait body.",
      },
      body: ["Trait body one.", "Trait body two."],
    },
    chapters: {
      career: {
        intro: ["Career intro one.", "Career intro two."],
        influentialTraits: traits("Career trait"),
        visibleBlocks: [listBlock("Career", "Career")],
        lockedBlocks: [lockedBlock("Career locked A"), lockedBlock("Career locked B")],
      },
      growth: {
        intro: ["Growth intro one.", "Growth intro two."],
        influentialTraits: traits("Growth trait"),
        visibleBlocks: [listBlock("Growth", "Growth")],
        lockedBlocks: [lockedBlock("Growth locked A"), lockedBlock("Growth locked B")],
      },
      relationships: {
        intro: ["Relationship intro one.", "Relationship intro two."],
        influentialTraits: traits("Relationship trait"),
        visibleBlocks: [listBlock("Relationship", "Relationship")],
        lockedBlocks: [lockedBlock("Relationship locked A"), lockedBlock("Relationship locked B")],
      },
    },
    finalOffer: {
      eyebrow: "Full report",
      headline: "Continue",
      body: "Full report body.",
      priceLabel: "Price",
      ctaLabel: "Unlock",
      guarantee: "Guarantee",
    },
  };
}

function createPayload(content = createContent()): PersonalityDesktopCloneContentPayload {
  return {
    templateKey: "mbti_desktop_clone_v1",
    schemaVersion: "1.0.0",
    fullCode: "INTJ-A",
    baseCode: "INTJ",
    locale: "zh-CN",
    content,
    assetSlots: [],
    meta: null,
  };
}

describe("MBTI desktop clone snapshot content contract", () => {
  it("does not return placeholder slots in snapshot strict mode when storage content is missing", () => {
    const strictResult = resolveMbtiDesktopCloneSlotsResult(createResolveArgs(null), {
      mode: "snapshot",
      allowPlaceholder: false,
    });
    const normalResult = resolveMbtiDesktopCloneSlotsResult(createResolveArgs(null), {
      mode: "normal",
      allowPlaceholder: true,
    });

    expect(strictResult).toEqual({
      ok: false,
      code: "DESKTOP_CLONE_CONTENT_MISSING",
      missing: ["storageContent"],
    });
    expect(normalResult.ok).toBe(true);
    expect(normalResult.ok ? normalResult.slots.meta.contentSource : "").toBe("placeholder");
  });

  it("accepts complete server-prefetched desktop clone content for the matching locale and fullCode", () => {
    const status = validateMbtiSnapshotDesktopCloneContent({
      locale: "zh",
      fullCode: "INTJ-A",
      payload: createPayload(),
    });

    expect(status).toEqual({
      ok: true,
      source: "server-prefetched-desktop-clone",
      missing: [],
    } satisfies MbtiSnapshotContentStatus);
  });

  it("rejects placeholder trait copy in snapshot content", () => {
    const content = createContent();
    content.chapters.relationships.influentialTraits[0] = {
      label: "Placeholder trait slot",
      isPlaceholder: true,
    };

    const status = validateMbtiSnapshotDesktopCloneContent({
      locale: "zh",
      fullCode: "INTJ-A",
      payload: createPayload(content),
    });

    expect(status).toEqual({
      ok: false,
      code: "PDF_PLACEHOLDER_CONTENT",
      missing: ["placeholder_content"],
    });
  });

  it("fails closed for missing en desktop clone content instead of falling back to zh-CN", () => {
    const status = validateMbtiSnapshotDesktopCloneContent({
      locale: "en",
      fullCode: "INTJ-A",
      payload: null,
    });

    expect(status).toEqual({
      ok: false,
      code: "DESKTOP_CLONE_CONTENT_MISSING",
      missing: ["desktop_clone_content"],
    });
  });
});
