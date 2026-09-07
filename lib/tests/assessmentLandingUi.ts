import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

// Product UI authority for these six landing pages. CMS/registry text must not
// override their headings or version-button labels; runtime availability stays API-owned.
const ASSESSMENT_LANDING_UI: Partial<Record<string, Record<"zh" | "en", string>>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: { zh: "MBTI 性格免费测试", en: "Free MBTI Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: { zh: "大五人格免费测试（Big Five）", en: "Free Big Five Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: { zh: "九型人格免费测试（Enneagram）", en: "Free Enneagram Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: { zh: "IQ智商免费测试", en: "Free IQ Test" },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { zh: "情商免费测试（EQ）", en: "Free Emotional Intelligence Test (EQ)" },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: { zh: "霍兰德职业兴趣免费测试（RIASEC）", en: "Free Holland Career Interest Test (RIASEC)" },
};

const ZH_ENTRY_LABELS: Record<string, string> = {
  mbti_144: "开始 144 题完整版 · 免费测试",
  mbti_93: "开始 93 题精简版 · 免费测试",
  big5_120: "开始 120 题完整版 · 免费测试",
  big5_90: "开始 90 题精简版 · 免费测试",
  enneagram_likert_105: "开始 105 题 · 程度选择 · 免费测试",
  enneagram_forced_choice_144: "开始 144 题 · 二选一 · 免费测试",
  riasec_60: "开始 60 题标准版 · 免费测试",
  riasec_140: "开始 140 题扩展版 · 免费测试",
  owner_original_30: "开始 30 题免费测试",
  eq_60: "开始 60 题免费测试",
};

const EN_ENTRY_LABELS: Record<string, string> = {
  mbti_144: "Start free 144-question test",
  mbti_93: "Start free 93-question test",
  big5_120: "Start free 120-question test",
  big5_90: "Start free 90-question test",
  enneagram_likert_105: "Start free 105-question test",
  enneagram_forced_choice_144: "Start free 144-question test",
  riasec_60: "Start free 60-question test",
  riasec_140: "Start free 140-question test",
  owner_original_30: "Start free 30-question test",
  eq_60: "Start free 60-question test",
};

export type AssessmentArtwork = "mbti" | "big-five" | "enneagram" | "iq" | "eq" | "riasec";

const HERO_ARTWORK: Partial<Record<string, AssessmentArtwork>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: "mbti",
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: "big-five",
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: "enneagram",
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: "iq",
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: "eq",
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: "riasec",
};

export function getAssessmentLandingUi(slug: string, locale: "zh" | "en") {
  const names = Object.hasOwn(ASSESSMENT_LANDING_UI, slug) ? ASSESSMENT_LANDING_UI[slug] : undefined;
  return names ? {
    title: names[locale],
    entryLabels: locale === "zh" ? ZH_ENTRY_LABELS : EN_ENTRY_LABELS,
    heroArtwork: HERO_ARTWORK[slug],
  } : null;
}
