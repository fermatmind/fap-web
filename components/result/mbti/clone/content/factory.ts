import type {
  ContentListBlock,
  ContentListBlockPatch,
  ListItem,
  ListItemPatch,
  LockedListBlock,
  LockedListBlockPatch,
  MbtiDesktopCloneContent,
  MbtiDesktopCloneContentPatch,
  NarrativeChapterContentPatch,
  NarrativeChapterSlots,
  TextTuplePatch,
  TraitSlot,
  TraitSlotPatch,
} from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

type ItemTone = ListItem["tone"];

type TraitEntry = {
  label: string;
  colorKey: NonNullable<TraitSlot["colorKey"]>;
  body?: string;
};

type ItemEntry = {
  title: string;
  body: string;
};

type ChapterInput = {
  intro: [string, string];
  influentialTraits: [TraitEntry, TraitEntry, TraitEntry, TraitEntry];
  strengths: [ItemEntry, ItemEntry, ItemEntry, ItemEntry, ItemEntry, ItemEntry];
  weaknesses: [ItemEntry, ItemEntry, ItemEntry, ItemEntry, ItemEntry, ItemEntry];
  lockedBlocks: [
    {
      title: string;
      overlayTitle: string;
      overlayBody: string;
      overlayCtaLabel?: string;
      items?: [ItemEntry, ItemEntry, ItemEntry, ItemEntry, ItemEntry, ItemEntry];
    },
    {
      title: string;
      overlayTitle: string;
      overlayBody: string;
      overlayCtaLabel?: string;
      items?: [ItemEntry, ItemEntry, ItemEntry, ItemEntry, ItemEntry, ItemEntry];
    },
  ];
};

type ContentInput = {
  heroSummary: string;
  intro: [string, string];
  traits: {
    eyebrow: string;
    title: string;
    value: string;
    body: string;
    paragraphs: [string, string];
  };
  chapters: {
    career: ChapterInput;
    growth: ChapterInput;
    relationships: ChapterInput;
  };
  finalOffer: {
    eyebrow: string;
    headline: string;
    body: string;
    priceLabel?: string;
    ctaLabel?: string;
    guarantee: string;
  };
};

function toListItem(entry: ItemEntry, tone: ItemTone): ListItem {
  return {
    title: entry.title,
    body: entry.body,
    tone,
    isPlaceholder: false,
  };
}

function toListBlock(
  title: string,
  entries: [ItemEntry, ItemEntry, ItemEntry, ItemEntry, ItemEntry, ItemEntry],
  tone: ItemTone,
): ContentListBlock {
  return {
    title,
    items: [
      toListItem(entries[0], tone),
      toListItem(entries[1], tone),
      toListItem(entries[2], tone),
      toListItem(entries[3], tone),
      toListItem(entries[4], tone),
      toListItem(entries[5], tone),
    ],
  };
}

function toLockedBlock(
  input: ChapterInput["lockedBlocks"][number],
  fallbackEntries: [ItemEntry, ItemEntry, ItemEntry, ItemEntry, ItemEntry, ItemEntry],
): LockedListBlock {
  const entries = input.items ?? fallbackEntries;
  return {
    title: input.title,
    overlayTitle: input.overlayTitle,
    overlayBody: input.overlayBody,
    overlayCtaLabel: input.overlayCtaLabel ?? "解锁完整报告",
    blurredItems: [
      toListItem(entries[0], "neutral"),
      toListItem(entries[1], "neutral"),
      toListItem(entries[2], "neutral"),
      toListItem(entries[3], "neutral"),
      toListItem(entries[4], "neutral"),
      toListItem(entries[5], "neutral"),
    ],
  };
}

function toTrait(entry: TraitEntry): TraitSlot {
  return {
    label: entry.label,
    body: entry.body,
    colorKey: entry.colorKey,
    isPlaceholder: false,
  };
}

function toChapter(input: ChapterInput): Pick<NarrativeChapterSlots, "intro" | "influentialTraits" | "visibleBlocks" | "lockedBlocks"> {
  return {
    intro: input.intro,
    influentialTraits: [
      toTrait(input.influentialTraits[0]),
      toTrait(input.influentialTraits[1]),
      toTrait(input.influentialTraits[2]),
      toTrait(input.influentialTraits[3]),
    ],
    visibleBlocks: [
      toListBlock("Strengths", input.strengths, "positive"),
      toListBlock("Weaknesses", input.weaknesses, "negative"),
    ],
    lockedBlocks: [
      toLockedBlock(input.lockedBlocks[0], input.strengths),
      toLockedBlock(input.lockedBlocks[1], input.weaknesses),
    ],
  };
}

function mergeTextTuple(base: [string, string], patch?: TextTuplePatch): [string, string] {
  if (!patch) {
    return base;
  }

  return [patch[0] ?? base[0], patch[1] ?? base[1]];
}

function mergeTrait(base: TraitSlot, patch?: TraitSlotPatch): TraitSlot {
  return patch ? { ...base, ...patch } : base;
}

function mergeListItem(base: ListItem, patch?: ListItemPatch): ListItem {
  return patch ? { ...base, ...patch } : base;
}

function mergeContentListBlock(base: ContentListBlock, patch?: ContentListBlockPatch): ContentListBlock {
  if (!patch) {
    return base;
  }

  return {
    title: patch.title ?? base.title,
    items: [
      mergeListItem(base.items[0], patch.items?.[0]),
      mergeListItem(base.items[1], patch.items?.[1]),
      mergeListItem(base.items[2], patch.items?.[2]),
      mergeListItem(base.items[3], patch.items?.[3]),
      mergeListItem(base.items[4], patch.items?.[4]),
      mergeListItem(base.items[5], patch.items?.[5]),
    ],
  };
}

function mergeLockedListBlock(base: LockedListBlock, patch?: LockedListBlockPatch): LockedListBlock {
  if (!patch) {
    return base;
  }

  return {
    title: patch.title ?? base.title,
    overlayTitle: patch.overlayTitle ?? base.overlayTitle,
    overlayBody: patch.overlayBody ?? base.overlayBody,
    overlayCtaLabel: patch.overlayCtaLabel ?? base.overlayCtaLabel,
    blurredItems: [
      mergeListItem(base.blurredItems[0], patch.blurredItems?.[0]),
      mergeListItem(base.blurredItems[1], patch.blurredItems?.[1]),
      mergeListItem(base.blurredItems[2], patch.blurredItems?.[2]),
      mergeListItem(base.blurredItems[3], patch.blurredItems?.[3]),
      mergeListItem(base.blurredItems[4], patch.blurredItems?.[4]),
      mergeListItem(base.blurredItems[5], patch.blurredItems?.[5]),
    ],
  };
}

function mergeChapter(
  base: MbtiDesktopCloneContent["chapters"]["career"],
  patch?: NarrativeChapterContentPatch,
): MbtiDesktopCloneContent["chapters"]["career"] {
  if (!patch) {
    return base;
  }

  return {
    intro: mergeTextTuple(base.intro, patch.intro),
    influentialTraits: [
      mergeTrait(base.influentialTraits[0], patch.influentialTraits?.[0]),
      mergeTrait(base.influentialTraits[1], patch.influentialTraits?.[1]),
      mergeTrait(base.influentialTraits[2], patch.influentialTraits?.[2]),
      mergeTrait(base.influentialTraits[3], patch.influentialTraits?.[3]),
    ],
    visibleBlocks: [
      mergeContentListBlock(base.visibleBlocks[0], patch.visibleBlocks?.[0]),
      base.visibleBlocks[1] ? mergeContentListBlock(base.visibleBlocks[1], patch.visibleBlocks?.[1]) : undefined,
    ],
    lockedBlocks: [
      mergeLockedListBlock(base.lockedBlocks[0], patch.lockedBlocks?.[0]),
      mergeLockedListBlock(base.lockedBlocks[1], patch.lockedBlocks?.[1]),
    ],
  };
}

export function createMbtiDesktopCloneContent(input: ContentInput): MbtiDesktopCloneContent {
  return {
    hero: {
      summary: input.heroSummary,
      profileIdentity: {
        code: "MBTI",
        name: "占位人格标题",
        nickname: "占位身份标签",
        rarity: "约 --",
        keywords: ["占位关键词1", "占位关键词2", "占位关键词3", "占位关键词4", "占位关键词5", "占位关键词6"],
      },
    },
    intro: {
      paragraphs: input.intro,
    },
    traits: {
      summaryPane: {
        eyebrow: input.traits.eyebrow,
        title: input.traits.title,
        value: input.traits.value,
        body: input.traits.body,
      },
      body: input.traits.paragraphs,
    },
    chapters: {
      career: toChapter(input.chapters.career),
      growth: toChapter(input.chapters.growth),
      relationships: toChapter(input.chapters.relationships),
    },
    finalOffer: {
      eyebrow: input.finalOffer.eyebrow,
      headline: input.finalOffer.headline,
      body: input.finalOffer.body,
      priceLabel: input.finalOffer.priceLabel ?? "当前价格",
      ctaLabel: input.finalOffer.ctaLabel ?? "解锁完整报告",
      guarantee: input.finalOffer.guarantee,
    },
  };
}

export function createMbtiDesktopCloneContentPatch(input: MbtiDesktopCloneContentPatch): MbtiDesktopCloneContentPatch {
  return input;
}

export function mergeMbtiDesktopCloneContent(
  base: MbtiDesktopCloneContent,
  patch?: MbtiDesktopCloneContentPatch,
): MbtiDesktopCloneContent {
  if (!patch) {
    return base;
  }

  return {
    hero: {
      summary: patch.hero?.summary ?? base.hero.summary,
      profileIdentity: patch.hero?.profileIdentity ?? base.hero.profileIdentity,
    },
    intro: {
      paragraphs: mergeTextTuple(base.intro.paragraphs, patch.intro?.paragraphs),
    },
    traits: {
      summaryPane: {
        eyebrow: patch.traits?.summaryPane?.eyebrow ?? base.traits.summaryPane.eyebrow,
        title: patch.traits?.summaryPane?.title ?? base.traits.summaryPane.title,
        value: patch.traits?.summaryPane?.value ?? base.traits.summaryPane.value,
        body: patch.traits?.summaryPane?.body ?? base.traits.summaryPane.body,
      },
      body: mergeTextTuple(base.traits.body, patch.traits?.body),
    },
    chapters: {
      career: mergeChapter(base.chapters.career, patch.chapters?.career),
      growth: mergeChapter(base.chapters.growth, patch.chapters?.growth),
      relationships: mergeChapter(base.chapters.relationships, patch.chapters?.relationships),
    },
    finalOffer: {
      eyebrow: patch.finalOffer?.eyebrow ?? base.finalOffer.eyebrow,
      headline: patch.finalOffer?.headline ?? base.finalOffer.headline,
      body: patch.finalOffer?.body ?? base.finalOffer.body,
      priceLabel: patch.finalOffer?.priceLabel ?? base.finalOffer.priceLabel,
      ctaLabel: patch.finalOffer?.ctaLabel ?? base.finalOffer.ctaLabel,
      guarantee: patch.finalOffer?.guarantee ?? base.finalOffer.guarantee,
    },
  };
}
