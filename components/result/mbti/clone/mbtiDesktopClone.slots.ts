export const MBTI_BASE_CODES = [
  "INTJ",
  "INTP",
  "ENTJ",
  "ENTP",
  "INFJ",
  "INFP",
  "ENFJ",
  "ENFP",
  "ISTJ",
  "ISFJ",
  "ESTJ",
  "ESFJ",
  "ISTP",
  "ISFP",
  "ESTP",
  "ESFP",
] as const;

export const MBTI_FULL_CODES = [
  "INTJ-A",
  "INTJ-T",
  "INTP-A",
  "INTP-T",
  "ENTJ-A",
  "ENTJ-T",
  "ENTP-A",
  "ENTP-T",
  "INFJ-A",
  "INFJ-T",
  "INFP-A",
  "INFP-T",
  "ENFJ-A",
  "ENFJ-T",
  "ENFP-A",
  "ENFP-T",
  "ISTJ-A",
  "ISTJ-T",
  "ISFJ-A",
  "ISFJ-T",
  "ESTJ-A",
  "ESTJ-T",
  "ESFJ-A",
  "ESFJ-T",
  "ISTP-A",
  "ISTP-T",
  "ISFP-A",
  "ISFP-T",
  "ESTP-A",
  "ESTP-T",
  "ESFP-A",
  "ESFP-T",
] as const;

export type MbtiBaseCode = typeof MBTI_BASE_CODES[number];
export type MbtiFullCode = typeof MBTI_FULL_CODES[number];
export type MbtiDesktopCloneAuthoringLevel = "fullCode" | "placeholder";
export type MbtiDesktopCloneContentSource = "storage" | "placeholder";

export const MBTI_DESKTOP_CLONE_ASSET_SLOT_IDS = [
  "hero-illustration",
  "traits-illustration",
  "traits-summary-illustration",
  "career-illustration",
  "growth-illustration",
  "relationships-illustration",
  "final-offer-illustration",
] as const;

export type MbtiDesktopCloneAssetSlotId = typeof MBTI_DESKTOP_CLONE_ASSET_SLOT_IDS[number];

export type CloneAssetSlot = {
  slotId: MbtiDesktopCloneAssetSlotId;
  aspectRatio: string;
  status: "placeholder" | "ready" | "disabled";
  label: string;
};

export type TraitSlot = {
  label: string;
  body?: string;
  colorKey?: "blue" | "gold" | "green" | "purple" | "red";
  isPlaceholder?: boolean;
};

export type ListItem = {
  title: string;
  body: string;
  tone?: "positive" | "negative" | "neutral";
  isPlaceholder?: boolean;
};

export type ContentListBlock = {
  title: string;
  items: [ListItem, ListItem, ListItem, ListItem, ListItem, ListItem];
};

export type LockedListBlock = {
  title: string;
  overlayTitle: string;
  overlayBody: string;
  overlayCtaLabel: string;
  blurredItems: [ListItem, ListItem, ListItem, ListItem, ListItem, ListItem];
};

export type NarrativeChapterSlots = {
  step: string;
  sectionLabel: string;
  title: string;
  asset: CloneAssetSlot;
  intro: [string, string];
  influentialTraits: [TraitSlot, TraitSlot, TraitSlot, TraitSlot];
  visibleBlocks: [ContentListBlock, ContentListBlock?];
  lockedBlocks: [LockedListBlock, LockedListBlock];
};

export type MbtiDesktopCloneSlots = {
  meta: {
    baseCode: string;
    fullCode: string;
    locale: string;
    authoringLevel: MbtiDesktopCloneAuthoringLevel;
    contentSource: MbtiDesktopCloneContentSource;
  };
  hero: {
    eyebrow: string;
    title: string;
    typeCode: string;
    summary: string;
    asset: CloneAssetSlot;
  };
  intro: {
    paragraphs: [string, string];
  };
  traits: {
    sectionLabel: string;
    title: string;
    asset: CloneAssetSlot;
    summaryPane: {
      eyebrow: string;
      title: string;
      value: string;
      body: string;
      asset: CloneAssetSlot;
    };
    body: [string, string];
  };
  chapters: {
    career: NarrativeChapterSlots;
    growth: NarrativeChapterSlots;
    relationships: NarrativeChapterSlots;
  };
  finalOffer: {
    eyebrow: string;
    headline: string;
    body: string;
    priceLabel: string;
    ctaLabel: string;
    guarantee: string;
    asset: CloneAssetSlot;
  };
};

export type MbtiDesktopCloneContent = {
  hero: Pick<MbtiDesktopCloneSlots["hero"], "summary">;
  intro: MbtiDesktopCloneSlots["intro"];
  traits: {
    summaryPane: Pick<MbtiDesktopCloneSlots["traits"]["summaryPane"], "eyebrow" | "title" | "value" | "body">;
    body: MbtiDesktopCloneSlots["traits"]["body"];
  };
  chapters: {
    career: Pick<NarrativeChapterSlots, "intro" | "influentialTraits" | "visibleBlocks" | "lockedBlocks">;
    growth: Pick<NarrativeChapterSlots, "intro" | "influentialTraits" | "visibleBlocks" | "lockedBlocks">;
    relationships: Pick<NarrativeChapterSlots, "intro" | "influentialTraits" | "visibleBlocks" | "lockedBlocks">;
  };
  finalOffer: Omit<MbtiDesktopCloneSlots["finalOffer"], "asset">;
};

export type TextTuplePatch = [string | undefined, string | undefined];
export type TraitSlotPatch = Partial<TraitSlot>;
export type ListItemPatch = Partial<ListItem>;

export type ContentListBlockPatch = {
  title?: string;
  items?: [
    ListItemPatch | undefined,
    ListItemPatch | undefined,
    ListItemPatch | undefined,
    ListItemPatch | undefined,
    ListItemPatch | undefined,
    ListItemPatch | undefined,
  ];
};

export type LockedListBlockPatch = {
  title?: string;
  overlayTitle?: string;
  overlayBody?: string;
  overlayCtaLabel?: string;
  blurredItems?: [
    ListItemPatch | undefined,
    ListItemPatch | undefined,
    ListItemPatch | undefined,
    ListItemPatch | undefined,
    ListItemPatch | undefined,
    ListItemPatch | undefined,
  ];
};

export type NarrativeChapterContentPatch = {
  intro?: TextTuplePatch;
  influentialTraits?: [
    TraitSlotPatch | undefined,
    TraitSlotPatch | undefined,
    TraitSlotPatch | undefined,
    TraitSlotPatch | undefined,
  ];
  visibleBlocks?: [ContentListBlockPatch | undefined, ContentListBlockPatch | undefined];
  lockedBlocks?: [LockedListBlockPatch | undefined, LockedListBlockPatch | undefined];
};

export type MbtiDesktopCloneContentPatch = {
  hero?: Partial<MbtiDesktopCloneContent["hero"]>;
  intro?: {
    paragraphs?: TextTuplePatch;
  };
  traits?: {
    summaryPane?: Partial<MbtiDesktopCloneContent["traits"]["summaryPane"]>;
    body?: TextTuplePatch;
  };
  chapters?: {
    career?: NarrativeChapterContentPatch;
    growth?: NarrativeChapterContentPatch;
    relationships?: NarrativeChapterContentPatch;
  };
  finalOffer?: Partial<MbtiDesktopCloneContent["finalOffer"]>;
};
