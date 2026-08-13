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
      item(`${prefix} 1`, "占位槽位：这里保留桌面内容位，等待后续映射或策划文案接入。", tone),
      item(`${prefix} 2`, "占位槽位：这一行只用于维持六项列表节奏，不伪装成真实分析。", tone),
      item(`${prefix} 3`, "占位槽位：该条目仅服务版式完整度，不代表已接入正式人格结论。", tone),
      item(`${prefix} 4`, "占位槽位：此块明确表示内容待补齐，同时保持 clone shell 的卡片语法。", tone),
      item(`${prefix} 5`, "占位槽位：这一行是协议化保留位，后续可以被真实内容整齐替换。", tone),
      item(`${prefix} 6`, "占位槽位：这一行用于维持完整页面的节奏、密度和整体结构。", tone),
    ],
  };
}

function lockedBlock(title: string): LockedListBlock {
  return {
    title,
    overlayTitle: "占位解锁浮层",
    overlayBody: "占位槽位：此锁定浮层会保持显式占位，直到后续高级章节内容接入为止。",
    overlayCtaLabel: "解锁完整报告",
    blurredItems: [
      item("占位锁定项 1", "占位槽位：隐藏列表内容将在后续被真实付费细节替换。"),
      item("占位锁定项 2", "占位槽位：模糊背景列表保持可见，但不凭空制造有来源感的洞察。"),
      item("占位锁定项 3", "占位槽位：这一保留行服务桌面锁定态的 gate 布局。"),
      item("占位锁定项 4", "占位槽位：这一行只用于维持桌面模板中的列表密度。"),
      item("占位锁定项 5", "占位槽位：这一模糊行帮助锁定态在真实内容缺席时仍然可读。"),
      item("占位锁定项 6", "占位槽位：最后一行用于完整收束隐藏列表，而不伪造具体结论。"),
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
    authoringLevel: "placeholder",
    contentSource: "placeholder",
  },
  hero: {
    profileIdentity: {
      code: "MBTI",
      name: "占位人格标题",
      nickname: "占位身份标签",
      rarity: "",
      keywords: ["占位关键词1", "占位关键词2", "占位关键词3", "占位关键词4", "占位关键词5", "占位关键词6"],
    },
    eyebrow: "你的人格类型是",
    title: "占位人格标题",
    typeCode: "MBTI",
    summary: "占位槽位：Hero 摘要会在类型专属文案或稳定 runtime 文本可用时替换。",
    asset: asset("hero-illustration", "人格类型插图", "236:160"),
  },
  intro: {
    paragraphs: [
      "占位槽位：第一段简介用于保留桌面概览位，等待后续映射或策划文案接入。",
      "占位槽位：第二段简介用于维持桌面双段阅读节奏，不伪装成真实测评内容。",
    ],
  },
  lettersIntro: null,
  overview: null,
  traits: {
    sectionLabel: "人格概览",
    title: "人格特质",
    asset: asset("traits-illustration", "偏好维度插图", "636:148"),
    summaryPane: {
      eyebrow: "主导维度",
      title: "占位维度摘要",
      value: "00%",
      body: "占位槽位：右侧摘要说明会由类型专属文案或稳定 runtime 解释替换。",
      asset: asset("traits-summary-illustration", "维度摘要插图", "240:118"),
    },
    body: [
      "占位槽位：这一段用于保留维度 bars 后的解释区，等待结构化 clone 内容接入。",
      "占位槽位：这一段用于避免在类型专属文案尚未准备好时桌面壳体塌缩。",
    ],
  },
  chapters: {
    career: {
      step: "2",
      sectionLabel: "职业路径",
      title: "职业路径",
      asset: asset("career-illustration", "职业探索插图", "636:148"),
      intro: [
        "占位槽位：职业章节第一段会保持显式占位，直到 runtime 映射或类型文案接入。",
        "占位槽位：职业章节第二段用于维持桌面 clone 壳的一致阅读节奏。",
      ],
      strengths: null,
      weaknesses: null,
      matchedJobs: null,
      matchedGuides: null,
      influentialTraits: [
        trait("待补充特质", "blue"),
        trait("待补充特质", "gold"),
        trait("待补充特质", "green"),
        trait("待补充特质", "purple"),
      ],
      visibleBlocks: [
        contentBlock("可能的优势", "占位优势条目", "positive"),
        contentBlock("需要留意", "占位弱项条目", "negative"),
      ],
      lockedBlocks: [
        lockedBlock("可能适合的职业角色"),
        lockedBlock("可能适合的工作方式"),
      ],
    },
    growth: {
      step: "3",
      sectionLabel: "个人成长",
      title: "个人成长",
      asset: asset("growth-illustration", "成长探索插图", "636:148"),
      intro: [
        "占位槽位：成长章节第一段用于保留结构化成长文案位置。",
        "占位槽位：成长章节第二段在内容未完成前维持 clone shell 的可读性。",
      ],
      strengths: null,
      weaknesses: null,
      matchedJobs: null,
      matchedGuides: null,
      influentialTraits: [
        trait("待补充特质", "blue"),
        trait("待补充特质", "gold"),
        trait("待补充特质", "green"),
        trait("待补充特质", "purple"),
      ],
      visibleBlocks: [
        contentBlock("可继续发展的部分", "占位成长优势", "positive"),
        contentBlock("需要留意的部分", "占位成长风险", "negative"),
      ],
      lockedBlocks: [
        lockedBlock("可能补充能量的情境"),
        lockedBlock("可能消耗能量的情境"),
      ],
    },
    relationships: {
      step: "4",
      sectionLabel: "关系模式",
      title: "关系模式",
      asset: asset("relationships-illustration", "关系模式插图", "636:148"),
      intro: [
        "占位槽位：关系章节第一段用于为未来类型文案保留沟通总结区域。",
        "占位槽位：关系章节第二段用于保持最后一章的结构完整。",
      ],
      strengths: null,
      weaknesses: null,
      matchedJobs: null,
      matchedGuides: null,
      influentialTraits: [
        trait("待补充特质", "blue"),
        trait("待补充特质", "gold"),
        trait("待补充特质", "green"),
        trait("待补充特质", "purple"),
      ],
      visibleBlocks: [
        contentBlock("关系中的可能优势", "占位关系优势", "positive"),
        contentBlock("关系中需要留意", "占位关系风险", "negative"),
      ],
      lockedBlocks: [
        lockedBlock("关系中的可能优势"),
        lockedBlock("关系中需要留意的模式"),
      ],
    },
  },
  finalOffer: {
    eyebrow: "最终解锁",
    headline: "占位标题：完整报告收口位",
    body: "占位槽位：这张浅绿色收口卡会在策划文案或稳定 runtime 内容可用后替换为真实解锁文案。",
    priceLabel: "价格",
    ctaLabel: "解锁完整报告",
    guarantee: "占位槽位：保障说明会保持显式占位，直到正式版本定稿。",
    asset: asset("final-offer-illustration", "完整报告插图", "252:220"),
  },
};
