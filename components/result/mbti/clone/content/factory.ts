import type {
  ContentListBlock,
  ListItem,
  LockedListBlock,
  MbtiDesktopCloneContent,
  NarrativeChapterSlots,
  TraitSlot,
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

export function createMbtiDesktopCloneContent(input: ContentInput): MbtiDesktopCloneContent {
  return {
    hero: {
      summary: input.heroSummary,
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
