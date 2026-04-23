export const BIG5_V1_MICROCOPY_SECTION_KEYS = [
  "hero_summary",
  "domains_overview",
  "domain_deep_dive",
  "facet_details",
  "core_portrait",
  "norms_comparison",
  "action_plan",
  "methodology_and_access",
] as const;

export type Big5V1MicrocopySectionKey = (typeof BIG5_V1_MICROCOPY_SECTION_KEYS)[number];

type SectionCopy = {
  title: string;
  subtitle: string;
};

export const BIG5_V1_SECTION_MICROCOPY: Record<Big5V1MicrocopySectionKey, SectionCopy> = {
  hero_summary: {
    title: "Profile Summary",
    subtitle: "A compact overview of your Big Five profile and headline signals.",
  },
  domains_overview: {
    title: "Domains Overview",
    subtitle: "Five-domain distribution with percentile-oriented context.",
  },
  domain_deep_dive: {
    title: "Domain Deep Dive",
    subtitle: "Focused read on domain-level strengths and potential trade-offs.",
  },
  facet_details: {
    title: "Facet Details",
    subtitle: "Facet-level signals arranged for quick interpretation and follow-up.",
  },
  core_portrait: {
    title: "Core Portrait",
    subtitle: "Dominant trait structure and calibrated profile framing.",
  },
  norms_comparison: {
    title: "Norms Comparison",
    subtitle: "Norming and comparative context for percentile-based reading.",
  },
  action_plan: {
    title: "Action Plan",
    subtitle: "Near-term actions derived from your current trait profile.",
  },
  methodology_and_access: {
    title: "Methodology and Access",
    subtitle: "Method boundaries, quality notes, and module access state.",
  },
};

export const BIG5_V1_SECTION_MICROCOPY_ZH: Record<Big5V1MicrocopySectionKey, SectionCopy> = {
  hero_summary: {
    title: "结果摘要",
    subtitle: "用主轴、维度信号和报告入口快速进入这份结果。",
  },
  domains_overview: {
    title: "五维总览",
    subtitle: "按五个维度查看你的百分位位置与基础解释。",
  },
  domain_deep_dive: {
    title: "五维深解",
    subtitle: "逐维展开优势、代价和日常表现。",
  },
  facet_details: {
    title: "细分维度焦点",
    subtitle: "用 facet 异常与完整目录解释结构性偏离。",
  },
  core_portrait: {
    title: "人格总览",
    subtitle: "把主导维度与维度对撞组合成核心动力图。",
  },
  norms_comparison: {
    title: "相对参照",
    subtitle: "把当前分数放回常模和参考样本中理解。",
  },
  action_plan: {
    title: "行动建议",
    subtitle: "按工作、关系、恢复和成长场景落到下一步动作。",
  },
  methodology_and_access: {
    title: "方法与边界",
    subtitle: "说明测量边界、质量状态与结果使用方式。",
  },
};

export function getBig5SectionDisplayCopy(
  sectionKey: Big5V1MicrocopySectionKey,
  locale: "en" | "zh"
): SectionCopy {
  return locale === "zh" ? BIG5_V1_SECTION_MICROCOPY_ZH[sectionKey] : BIG5_V1_SECTION_MICROCOPY[sectionKey];
}

export const BIG5_V1_STATE_MICROCOPY = {
  locked_preview: {
    title: "Unlock Full Insight",
    subtitle: "Upgrade to open the full section content and recommendations.",
    cta: "Unlock full report",
  },
  norms: {
    missing: "Percentile views are temporarily unavailable because current norms status is MISSING.",
    calibrated: "Norms are calibrated for percentile interpretation.",
  },
  quality: {
    a: "Quality level A: response quality is stable.",
    b: "Quality level B: interpretation remains usable with moderate caution.",
    c: "Quality level C: interpret with caution due to lower response quality.",
  },
} as const;

export const BIG5_V1_AUX_MICROCOPY = {
  access_label: "Access status",
  compare_label: "Comparison context",
  method_label: "Method boundary",
  method_note: "Use this report as structured decision support, not as an identity verdict.",
} as const;

export const BIG5_V1_SHELL_MICROCOPY = {
  hero: {
    preview_label_en: "Preview",
    preview_label_zh: "预览版",
    full_label_en: "Full report",
    full_label_zh: "完整报告",
    preview_summary_en:
      "You can already read your core profile and domain overview. Unlock to continue into deeper domain, facet, and action interpretation.",
    preview_summary_zh:
      "你已可查看核心画像与五维总览。解锁后可继续阅读更深入的维度解释、facet 细节与行动计划。",
    full_summary_en:
      "Your full Big Five report is ready. Continue through the core portrait, domain interpretation, facet details, and action plan.",
    full_summary_zh:
      "你的完整 Big Five 报告已就绪。可继续阅读核心画像、维度解释、facet 细节与行动计划。",
    unlocked_now_title_en: "You can read now",
    unlocked_now_title_zh: "当前可读",
    unlock_more_title_en: "Unlock to continue",
    unlock_more_title_zh: "解锁后可继续",
    full_now_title_en: "Included in this report",
    full_now_title_zh: "本报告包含",
  },
  section_step_prefix_en: "Step",
  section_step_prefix_zh: "第",
  section_slot_prefix_en: "Page",
  section_slot_prefix_zh: "页",
  section_locked_policy: {
    none_description_en: "This section is available in the full report.",
    none_description_zh: "该章节在完整报告中可查看。",
    teaser_description_en: "Unlock to continue from this section preview into the full interpretation.",
    teaser_description_zh: "解锁后可从当前预览继续阅读完整解读。",
    mask_description_en: "Unlock to reveal the full section and practical guidance.",
    mask_description_zh: "解锁后可查看该章节完整内容与可执行建议。",
  },
  methodology: {
    title_en: "How to read this report",
    title_zh: "如何阅读这份报告",
    preview_scope_en:
      "The preview keeps your foundation visible and withholds deeper interpretation modules until unlock.",
    preview_scope_zh: "预览版会保留基础画像，并将更深入的解释模块放在解锁后查看。",
    full_scope_en: "The full report keeps all eight sections available in one continuous reading path.",
    full_scope_zh: "完整报告会将 8 个章节全部开放，形成连续阅读路径。",
    method_note_en: "Use this report as structured decision support, not as an identity verdict.",
    method_note_zh: "将这份结果用于结构化决策支持，而不是对自我的单一定义。",
  },
  offer: {
    eyebrow_en: "Continue with full interpretation",
    eyebrow_zh: "继续阅读完整解读",
    title_en: "Unlock deeper trait interpretation and action guidance",
    title_zh: "解锁更深入的特质解释与行动建议",
    summary_en: "Unlock to continue from your current profile into deeper sections and actionable next steps.",
    summary_zh: "解锁后可在当前画像基础上继续阅读更深入的章节，并获得可执行的下一步建议。",
  },
} as const;
