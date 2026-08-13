import type {
  CloneAssetSlot,
  ContentListBlock,
  ListItem,
  LockedListBlock,
  MbtiDesktopCloneAssetSlotId,
  MbtiDesktopCloneSlots,
  TraitSlot,
} from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

function asset(slotId: MbtiDesktopCloneAssetSlotId, label: string, aspectRatio: string): CloneAssetSlot {
  return { slotId, aspectRatio, status: "disabled", label };
}

function emptyItem(tone: ListItem["tone"] = "neutral"): ListItem {
  return { title: "", body: "", tone, isPlaceholder: true };
}

function structuralBlock(title: string, tone: ListItem["tone"]): ContentListBlock {
  return { title, items: [emptyItem(tone), emptyItem(tone), emptyItem(tone), emptyItem(tone), emptyItem(tone), emptyItem(tone)] };
}

function structuralLockedBlock(title: string): LockedListBlock {
  return {
    title,
    overlayTitle: "",
    overlayBody: "",
    overlayCtaLabel: "",
    blurredItems: [emptyItem(), emptyItem(), emptyItem(), emptyItem(), emptyItem(), emptyItem()],
  };
}

function structuralTrait(colorKey: TraitSlot["colorKey"]): TraitSlot {
  return { label: "", colorKey, isPlaceholder: true };
}

const structuralTraits = (): [TraitSlot, TraitSlot, TraitSlot, TraitSlot] => [
  structuralTrait("blue"),
  structuralTrait("gold"),
  structuralTrait("green"),
  structuralTrait("purple"),
];

// Structural test/dev shell only. Production zh-CN result routes require the
// published backend clone package and never render these empty values.
export const MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH: MbtiDesktopCloneSlots = {
  meta: {
    baseCode: "MBTI",
    fullCode: "MBTI",
    locale: "zh",
    authoringLevel: "placeholder",
    contentSource: "placeholder",
  },
  hero: {
    profileIdentity: { code: "MBTI", name: "", nickname: "", rarity: "", keywords: [] },
    eyebrow: "",
    title: "",
    typeCode: "MBTI",
    summary: "",
    asset: asset("hero-illustration", "人格类型插图", "236:160"),
  },
  intro: { paragraphs: ["", ""] },
  lettersIntro: null,
  overview: null,
  traits: {
    sectionLabel: "人格概览",
    title: "人格特质",
    asset: asset("traits-illustration", "偏好维度插图", "636:148"),
    summaryPane: {
      eyebrow: "",
      title: "",
      value: "",
      body: "",
      asset: asset("traits-summary-illustration", "维度摘要插图", "240:118"),
    },
    body: ["", ""],
  },
  chapters: {
    career: {
      step: "2",
      sectionLabel: "职业",
      title: "职业",
      asset: asset("career-illustration", "职业探索插图", "636:148"),
      intro: ["", ""],
      strengths: null,
      weaknesses: null,
      matchedJobs: null,
      matchedGuides: null,
      influentialTraits: structuralTraits(),
      visibleBlocks: [structuralBlock("", "positive"), structuralBlock("", "negative")],
      lockedBlocks: [structuralLockedBlock(""), structuralLockedBlock("")],
    },
    growth: {
      step: "3",
      sectionLabel: "成长",
      title: "成长",
      asset: asset("growth-illustration", "成长探索插图", "636:148"),
      intro: ["", ""],
      strengths: null,
      weaknesses: null,
      matchedJobs: null,
      matchedGuides: null,
      influentialTraits: structuralTraits(),
      visibleBlocks: [structuralBlock("", "positive"), structuralBlock("", "negative")],
      lockedBlocks: [structuralLockedBlock(""), structuralLockedBlock("")],
    },
    relationships: {
      step: "4",
      sectionLabel: "关系",
      title: "关系",
      asset: asset("relationships-illustration", "关系模式插图", "636:148"),
      intro: ["", ""],
      strengths: null,
      weaknesses: null,
      matchedJobs: null,
      matchedGuides: null,
      influentialTraits: structuralTraits(),
      visibleBlocks: [structuralBlock("", "positive"), structuralBlock("", "negative")],
      lockedBlocks: [structuralLockedBlock(""), structuralLockedBlock("")],
    },
  },
  finalOffer: {
    eyebrow: "",
    headline: "",
    body: "",
    priceLabel: "",
    ctaLabel: "",
    guarantee: "",
    asset: asset("final-offer-illustration", "报告插图", "252:220"),
  },
};
