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

// English search copy is distinct from the concise on-page heading.
const EN_SEARCH_COPY: Partial<Record<string, { title: string; description: string }>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: { title: "Free MBTI Personality Test: 16 Types & Preferences", description: "Take a free 93- or 144-question personality test. Explore 16 MBTI types, four preference pairs, scoring methods and practical ways to read your results." },
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: { title: "Free Big Five Personality Test: OCEAN Traits", description: "Explore five OCEAN personality traits and 30 facets with a free 90- or 120-question Big Five test. Compare versions and understand scores and percentiles." },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: { title: "Free Enneagram Test: Explore Your 9-Type Profile", description: "Compare all nine Enneagram types with a free 105- or 144-question test. Learn how scores, motivations and wings are interpreted, with evidence and limits." },
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: { title: "Free IQ Test: 30 Matrix Reasoning Questions", description: "Try 30 original visual reasoning questions for free. Review pattern-recognition performance and learn how raw scores differ from normed IQ results." },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { title: "Free EQ Test: Emotional Intelligence Self-Assessment", description: "Explore emotional awareness, regulation, empathy and relationship management with a free 60-question EQ self-assessment. Learn how to interpret your scores." },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: { title: "Free Holland Code Career Test: RIASEC Interests", description: "Find your RIASEC interest profile with a free 60- or 140-question Holland Code test. Understand your three-letter code and explore work activities and careers." },
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
    seoTitle: locale === "en" ? EN_SEARCH_COPY[slug]?.title : undefined,
    seoDescription: locale === "en" ? EN_SEARCH_COPY[slug]?.description : undefined,
    entryLabels: locale === "zh" ? ZH_ENTRY_LABELS : EN_ENTRY_LABELS,
    heroArtwork: HERO_ARTWORK[slug],
  } : null;
}
