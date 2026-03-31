export type CloneAssetSlot = {
  slotId: string;
  aspectRatio: string;
  status: "placeholder" | "ready";
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
    isPilot: boolean;
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

export type MbtiDesktopClonePilotContent = {
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
