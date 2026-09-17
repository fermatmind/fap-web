import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

// Product UI authority for these six landing pages. CMS/registry text must not
// override their headings or version-button labels; runtime availability stays API-owned.
const ASSESSMENT_LANDING_UI: Partial<Record<string, Record<"zh" | "en", string>>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: { zh: "MBTI 性格免费测试", en: "Free MBTI-Style Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: { zh: "大五人格免费测试（Big Five）", en: "Free Big Five Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: { zh: "九型人格免费测试（Enneagram）", en: "Free Enneagram Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: { zh: "IQ智商免费测试", en: "Free IQ Test" },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { zh: "情商免费测试（EQ）", en: "Free Emotional Intelligence Test (EQ)" },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: { zh: "霍兰德职业兴趣免费测试（RIASEC）", en: "Free Holland Career Interest Test (RIASEC)" },
};

// English search copy is distinct from the concise on-page heading.
const EN_SEARCH_COPY: Partial<Record<string, { title: string; description: string }>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: { title: "Free MBTI Personality Test: 16 Types & Preferences", description: "Explore your four-letter type and four preference pairs. Choose 93 questions (about 10 minutes) or 144 (about 15), with free results and explanations." },
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: { title: "Free Big Five Personality Test: OCEAN Traits", description: "Explore five OCEAN personality traits and 30 facets with a free 90- or 120-question Big Five test. Compare versions and understand scores and percentiles." },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: { title: "Free Enneagram Test: Explore Your 9-Type Profile", description: "Explore your nine-type profile with a free Enneagram test. Rate 105 statements in about 12 minutes, or make 144 paired choices in about 18 minutes." },
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: { title: "Free IQ Test: 30 Matrix Reasoning Questions", description: "Try 30 original visual reasoning questions for free. Review pattern-recognition performance and learn how raw scores differ from normed IQ results." },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { title: "Free EQ Test: Emotional Intelligence Self-Assessment", description: "Explore emotional awareness, regulation, empathy and relationship management with a free 60-question EQ self-assessment. Learn how to interpret your scores." },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: { title: "Free Holland Code Career Test: RIASEC Interests", description: "Explore the work activities you enjoy with a free Holland Code test. Choose 60 or 140 questions and view your six RIASEC scores and three-letter code." },
};

const ZH_SEARCH_COPY: Partial<Record<string, { title: string; description: string }>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: {
    title: "MBTI 免费测试：16 型人格与偏好解读",
    description: "免费完成 MBTI 性格测试，93 题约 10 分钟，144 题约 15 分钟。查看 16 型人格、四组偏好解释与后续探索建议，用于自我了解与沟通参考。",
  },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: {
    title: "霍兰德职业兴趣免费测试（RIASEC）",
    description: "免费霍兰德职业兴趣测试：60 题约 8 分钟，140 题约 18 分钟。查看 RIASEC 六维兴趣分布与三字代码，把兴趣线索用于了解具体活动和职业方向。",
  },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: {
    title: "九型人格免费测试（Enneagram）",
    description: "免费九型人格测试：105 题程度选择约 12 分钟，144 题二选一约 18 分钟。查看九型分布与候选类型解释，结合真实经历理解自己的动机与反应。",
  },
};

const HERO_DESCRIPTIONS: Partial<Record<string, Record<"zh" | "en", string>>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: {
    zh: "了解你的 16 型人格结果与四组偏好。93 题约 10 分钟，144 题约 15 分钟，两版均可免费完成并查看结果，用于自我了解与沟通参考。",
    en: "See your four-letter type and the preferences behind it. Choose 93 questions in about 10 minutes or 144 in about 15. Both provide free results and preference explanations.",
  },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: {
    zh: "了解你更喜欢哪些工作活动，查看六维兴趣分布与前三项代码。60 题约 8 分钟，140 题约 18 分钟，两版均可免费完成并查看结果。",
    en: "Explore the work activities you enjoy. Choose 60 questions in about 8 minutes or 140 in about 18. Both include free RIASEC results and a three-letter code.",
  },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: {
    zh: "了解你的九型分布与候选类型。105 题按程度作答，约 12 分钟；144 题每题二选一，约 18 分钟。两版均可免费完成并查看结果。",
    en: "Explore your nine-type profile and compare the patterns that fit your experience. Rate 105 statements or make 144 paired choices; both include free results.",
  },
};

export type AssessmentEditorialLayout = {
  itemOrder: string[];
  methodItemIds: string[];
};

const EDITORIAL_LAYOUTS: Partial<Record<string, AssessmentEditorialLayout>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: {
    itemOrder: ["free-results", "versions", "method", "interpretation", "applications", "mbti-scoring-method", "mbti-type-method"],
    methodItemIds: ["mbti-scoring-method", "mbti-type-method"],
  },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: {
    itemOrder: ["versions", "riasec-ranking", "riasec-scoring", "riasec-enhanced-method", "riasec-science"],
    methodItemIds: ["riasec-scoring", "riasec-enhanced-method", "riasec-science"],
  },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: {
    itemOrder: ["versions", "enneagram-model", "enneagram-application", "enneagram-likert-scoring", "enneagram-forced-scoring", "enneagram-science"],
    methodItemIds: ["enneagram-likert-scoring", "enneagram-forced-scoring", "enneagram-science"],
  },
};

const ZH_ENTRY_LABELS: Record<string, string> = {
  mbti_144: "144 题 · 约 15 分钟 · 免费测试",
  mbti_93: "93 题 · 约 10 分钟 · 免费测试",
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
    title: locale === "zh" && slug === SCALE_CANONICAL_SLUG_MAP.MBTI
      ? "MBTI 16 型人格免费测试"
      : names[locale],
    seoTitle: locale === "en" ? EN_SEARCH_COPY[slug]?.title : ZH_SEARCH_COPY[slug]?.title,
    seoDescription: locale === "en" ? EN_SEARCH_COPY[slug]?.description : ZH_SEARCH_COPY[slug]?.description,
    heroDescription: HERO_DESCRIPTIONS[slug]?.[locale],
    entryLabels: locale === "zh" ? ZH_ENTRY_LABELS : EN_ENTRY_LABELS,
    heroArtwork: HERO_ARTWORK[slug],
  } : null;
}

export function getAssessmentEditorialLayout(slug: string): AssessmentEditorialLayout | null {
  return EDITORIAL_LAYOUTS[slug] ?? null;
}
