import type { Big5V1SectionKey } from "@/lib/big5/sectionBlueprint";

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
type SectionCopy = { title: string; subtitle: string };

const EN_SECTION_LABELS: Record<Big5V1SectionKey, string> = {
  hero_summary: "Summary",
  domains_overview: "Five domains",
  domain_deep_dive: "Domain details",
  facet_details: "Facet details",
  core_portrait: "Profile",
  norms_comparison: "Norm reference",
  action_plan: "Actions",
  methodology_and_access: "Method and access",
};

const ZH_SECTION_LABELS: Record<Big5V1SectionKey, string> = {
  hero_summary: "结果摘要",
  domains_overview: "五维总览",
  domain_deep_dive: "维度详情",
  facet_details: "细分维度",
  core_portrait: "画像结构",
  norms_comparison: "常模参照",
  action_plan: "行动",
  methodology_and_access: "方法与权限",
};

function asSectionCopy(labels: Record<Big5V1SectionKey, string>): Record<Big5V1SectionKey, SectionCopy> {
  return Object.fromEntries(
    Object.entries(labels).map(([key, title]) => [key, { title, subtitle: "" }])
  ) as Record<Big5V1SectionKey, SectionCopy>;
}

export const BIG5_V1_SECTION_MICROCOPY = asSectionCopy(EN_SECTION_LABELS);
export const BIG5_V1_SECTION_MICROCOPY_ZH = asSectionCopy(ZH_SECTION_LABELS);

export function getBig5SectionDisplayCopy(sectionKey: Big5V1SectionKey, locale: "en" | "zh"): SectionCopy {
  return locale === "zh" ? BIG5_V1_SECTION_MICROCOPY_ZH[sectionKey] : BIG5_V1_SECTION_MICROCOPY[sectionKey];
}

export const BIG5_V1_STATE_MICROCOPY = {
  locked_preview: { title: "Locked", subtitle: "", cta: "Unlock full report" },
  norms: { missing: "Norm reference unavailable.", calibrated: "Norm reference available." },
  quality: { a: "A", b: "B", c: "C" },
} as const;

export const BIG5_V1_AUX_MICROCOPY = {
  access_label: "Access",
  compare_label: "Compare",
  method_label: "Method",
  method_note: "",
} as const;

export const BIG5_V1_SHELL_MICROCOPY = {
  hero: {
    preview_label_en: "Preview",
    preview_label_zh: "预览",
    full_label_en: "Full",
    full_label_zh: "完整",
    preview_summary_en: "",
    preview_summary_zh: "",
    full_summary_en: "",
    full_summary_zh: "",
    unlocked_now_title_en: "Available",
    unlocked_now_title_zh: "可查看",
    unlock_more_title_en: "Locked",
    unlock_more_title_zh: "待解锁",
    full_now_title_en: "Available",
    full_now_title_zh: "可查看",
  },
  section_step_prefix_en: "Section",
  section_step_prefix_zh: "章节",
  section_slot_prefix_en: "Page",
  section_slot_prefix_zh: "页",
  section_locked_policy: {
    none_description_en: "This section is locked.",
    none_description_zh: "该章节尚未解锁。",
    teaser_description_en: "This section is locked.",
    teaser_description_zh: "该章节尚未解锁。",
    mask_description_en: "This section is locked.",
    mask_description_zh: "该章节尚未解锁。",
  },
  methodology: {
    title_en: "Method",
    title_zh: "方法",
    preview_scope_en: "",
    preview_scope_zh: "",
    full_scope_en: "",
    full_scope_zh: "",
    method_note_en: "",
    method_note_zh: "",
  },
  offer: {
    eyebrow_en: "Report access",
    eyebrow_zh: "报告权限",
    title_en: "Unlock report",
    title_zh: "解锁报告",
    summary_en: "",
    summary_zh: "",
  },
} as const;
