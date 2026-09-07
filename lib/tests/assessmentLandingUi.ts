import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

// Product UI authority for these six landing pages. CMS/registry text must not
// override their headings or version-button labels; runtime availability stays API-owned.
const ASSESSMENT_LANDING_UI: Partial<Record<string, Record<"zh" | "en", string>>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: { zh: "MBTI 性格测试", en: "MBTI Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: { zh: "大五人格测试（Big Five）", en: "Big Five Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: { zh: "九型人格测试（Enneagram）", en: "Enneagram Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: { zh: "IQ 推理能力测试", en: "IQ Reasoning Test" },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { zh: "情商测试（EQ）", en: "Emotional Intelligence Test (EQ)" },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: { zh: "霍兰德职业兴趣测试（RIASEC）", en: "Holland Career Interest Test (RIASEC)" },
};

const ZH_ENTRY_LABELS: Record<string, string> = {
  mbti_144: "开始 144 题完整版",
  mbti_93: "开始 93 题精简版",
  big5_120: "开始 120 题完整版",
  big5_90: "开始 90 题精简版",
  enneagram_likert_105: "开始 105 题 · 程度选择",
  enneagram_forced_choice_144: "开始 144 题 · 二选一",
  riasec_60: "开始 60 题标准版",
  riasec_140: "开始 140 题扩展版",
  owner_original_30: "开始 30 题测试",
  eq_60: "开始 60 题测试",
};

export function getAssessmentLandingUi(slug: string, locale: "zh" | "en") {
  const names = Object.hasOwn(ASSESSMENT_LANDING_UI, slug) ? ASSESSMENT_LANDING_UI[slug] : undefined;
  return names ? { title: names[locale], entryLabels: locale === "zh" ? ZH_ENTRY_LABELS : {} as Record<string, string> } : null;
}
