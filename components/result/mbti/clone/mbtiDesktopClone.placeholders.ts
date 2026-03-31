import type { CloneAssetSlot, ContentListBlock, ListItem, LockedListBlock, MbtiDesktopCloneSlots, TraitSlot } from "@/components/result/mbti/clone/mbtiDesktopClone.slots";

function asset(slotId: string, label: string, aspectRatio: string): CloneAssetSlot {
  return {
    slotId,
    aspectRatio,
    status: "placeholder",
    label,
  };
}

function item(title: string, body: string, tone: ListItem["tone"] = "neutral"): ListItem {
  return {
    title,
    body,
    tone,
    isPlaceholder: true,
  };
}

function contentBlock(title: string, prefix: string, tone: ListItem["tone"]): ContentListBlock {
  return {
    title,
    items: [
      item(`${prefix} 1`, "Placeholder slot: this item reserves a desktop content slot until a mapped or curated paragraph is ready.", tone),
      item(`${prefix} 2`, "Placeholder slot: this line preserves the six-item list rhythm without pretending to be final analysis.", tone),
      item(`${prefix} 3`, "Placeholder slot: this list entry exists for shell completeness, not to fabricate an interpretation.", tone),
      item(`${prefix} 4`, "Placeholder slot: this block remains explicit about missing content and keeps the clone grammar intact.", tone),
      item(`${prefix} 5`, "Placeholder slot: this row is intentionally protocolized so future content can replace it cleanly.", tone),
      item(`${prefix} 6`, "Placeholder slot: this final row keeps spacing and density stable for non-pilot types.", tone),
    ],
  };
}

function lockedBlock(title: string): LockedListBlock {
  return {
    title,
    overlayTitle: "Placeholder unlock overlay",
    overlayBody: "Placeholder slot: this locked overlay remains explicit until premium chapter content is supplied.",
    overlayCtaLabel: "Unlock full report",
    blurredItems: [
      item("Placeholder locked item 1", "Placeholder slot: hidden list content will be replaced by real premium detail later."),
      item("Placeholder locked item 2", "Placeholder slot: keep the blurred background list visible without inventing source-backed insight."),
      item("Placeholder locked item 3", "Placeholder slot: this reserved row supports the gate layout for non-pilot types."),
      item("Placeholder locked item 4", "Placeholder slot: this row exists only to maintain the list density of the desktop template."),
      item("Placeholder locked item 5", "Placeholder slot: this blurred row makes the gating state legible before real content arrives."),
      item("Placeholder locked item 6", "Placeholder slot: this last row closes the hidden list block without fake specifics."),
    ],
  };
}

function trait(label: string, colorKey: TraitSlot["colorKey"]): TraitSlot {
  return {
    label,
    colorKey,
    isPlaceholder: true,
  };
}

export const MBTI_DESKTOP_CLONE_PLACEHOLDER_SLOTS_ZH: MbtiDesktopCloneSlots = {
  meta: {
    baseCode: "MBTI",
    fullCode: "MBTI",
    locale: "zh",
    isPilot: false,
  },
  hero: {
    eyebrow: "你的人格类型是",
    title: "Placeholder Type Title",
    typeCode: "MBTI",
    summary: "Placeholder slot: hero summary will use curated pilot content or safe runtime text when available.",
    asset: asset("hero-illustration", "illustration-slot placeholder", "236:160"),
  },
  intro: {
    paragraphs: [
      "Placeholder slot: this first intro paragraph reserves the desktop overview position until mapped or curated content is ready.",
      "Placeholder slot: this second intro paragraph keeps the two-paragraph reading rhythm intact for non-pilot types.",
    ],
  },
  traits: {
    sectionLabel: "人格概览",
    title: "Personality Traits",
    asset: asset("traits-illustration", "traits illustration-slot placeholder", "636:148"),
    summaryPane: {
      eyebrow: "主导维度",
      title: "Placeholder trait summary",
      value: "00%",
      body: "Placeholder slot: the summary pane copy will be replaced by pilot content or safe runtime explanation.",
      asset: asset("traits-summary-asset", "illustration-slot placeholder", "240:118"),
    },
    body: [
      "Placeholder slot: this paragraph keeps the post-bars narrative block available for structured clone content.",
      "Placeholder slot: this paragraph prevents the desktop shell from collapsing before type-specific copy is supplied.",
    ],
  },
  chapters: {
    career: {
      step: "2",
      sectionLabel: "职业路径",
      title: "Your Career Path",
      asset: asset("career-illustration", "career illustration-slot placeholder", "636:148"),
      intro: [
        "Placeholder slot: this career intro paragraph remains explicit until either runtime mapping or pilot content fills it.",
        "Placeholder slot: this second career paragraph keeps the section cadence consistent for non-pilot types.",
      ],
      influentialTraits: [
        trait("Placeholder trait slot", "blue"),
        trait("Placeholder trait slot", "gold"),
        trait("Placeholder trait slot", "green"),
        trait("Placeholder trait slot", "purple"),
      ],
      visibleBlocks: [
        contentBlock("Strengths", "Placeholder strength item", "positive"),
        contentBlock("Weaknesses", "Placeholder weakness item", "negative"),
      ],
      lockedBlocks: [
        lockedBlock("Career roles you may love"),
        lockedBlock("Work styles that suit you"),
      ],
    },
    growth: {
      step: "3",
      sectionLabel: "个人成长",
      title: "Your Personal Growth",
      asset: asset("growth-illustration", "growth illustration-slot placeholder", "636:148"),
      intro: [
        "Placeholder slot: this growth intro paragraph is reserved for structured self-development copy.",
        "Placeholder slot: this second growth paragraph keeps the clone shell readable while content remains unfinished.",
      ],
      influentialTraits: [
        trait("Placeholder trait slot", "blue"),
        trait("Placeholder trait slot", "gold"),
        trait("Placeholder trait slot", "green"),
        trait("Placeholder trait slot", "purple"),
      ],
      visibleBlocks: [
        contentBlock("Strengths", "Placeholder growth strength", "positive"),
        contentBlock("Weaknesses", "Placeholder growth weakness", "negative"),
      ],
      lockedBlocks: [
        lockedBlock("What energizes you"),
        lockedBlock("What drains you"),
      ],
    },
    relationships: {
      step: "4",
      sectionLabel: "关系模式",
      title: "Your Relationships",
      asset: asset("relationships-illustration", "relationships illustration-slot placeholder", "636:148"),
      intro: [
        "Placeholder slot: this relationships intro paragraph reserves the communication summary area for future type content.",
        "Placeholder slot: this second relationships paragraph keeps the final chapter structure complete for non-pilot paths.",
      ],
      influentialTraits: [
        trait("Placeholder trait slot", "blue"),
        trait("Placeholder trait slot", "gold"),
        trait("Placeholder trait slot", "green"),
        trait("Placeholder trait slot", "purple"),
      ],
      visibleBlocks: [
        contentBlock("Strengths", "Placeholder relationship strength", "positive"),
        contentBlock("Weaknesses", "Placeholder relationship weakness", "negative"),
      ],
      lockedBlocks: [
        lockedBlock("Relationship superpowers"),
        lockedBlock("Relationship pitfalls"),
      ],
    },
  },
  finalOffer: {
    eyebrow: "最终解锁",
    headline: "Placeholder headline: full report offer slot",
    body: "Placeholder slot: this mint final-offer card will hold real unlock copy once curated or runtime content is available.",
    priceLabel: "价格",
    ctaLabel: "解锁完整报告",
    guarantee: "Placeholder slot: guarantee copy remains explicit until finalized.",
    asset: asset("final-offer-asset", "feature image placeholder", "252:220"),
  },
};
