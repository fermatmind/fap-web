import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

// Product UI authority for these six landing pages. CMS/registry text must not
// override their headings or version-button labels; runtime availability stays API-owned.
const ASSESSMENT_LANDING_UI: Partial<Record<string, Record<"zh" | "en", string>>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: { zh: "MBTI 性格免费测试", en: "Free 16-Type MBTI-Style Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: { zh: "大五人格免费测试（Big Five）", en: "Free Big Five Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: { zh: "九型人格免费测试（Enneagram）", en: "Free Enneagram Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: { zh: "免费智商测试（IQ）", en: "Free IQ Test" },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { zh: "免费情商测试：60题情绪与关系自评", en: "Free EQ Test: 60-Item Emotion and Relationship Self-Report" },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: { zh: "霍兰德职业兴趣免费测试（RIASEC）", en: "Free Holland Code Career Interest Test (RIASEC)" },
};

// English search copy is distinct from the concise on-page heading.
const EN_SEARCH_COPY: Partial<Record<string, { title: string; description: string }>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: { title: "Free MBTI Personality Test: 16 Types & Preferences", description: "Free MBTI test: 93 questions (~10 min) or 144 (~15). Explore 16 types, four preference pairs and next steps for self-understanding and communication reference." },
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: { title: "Free Big Five Personality Test: OCEAN Traits", description: "Explore five OCEAN personality traits and 30 facets with a free 90- or 120-question Big Five test. Compare versions and understand scores and percentiles." },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: { title: "Free Enneagram Test: Explore Your 9-Type Profile", description: "Free Enneagram: 105 ratings (~12 min) or 144 two-option choices (~18). Read nine-type distributions and candidate explanations against real experiences, motivations and reactions." },
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: { title: "Free IQ Test: 30 Matrix Reasoning Questions & Free Results", description: "FermatMind IQ: 30 original visual matrix questions, ~20 min. Free test and results. Review reasoning, scores and limits; no substitute for professional IQ assessment." },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { title: "Free EQ Test: 60-Item Emotion and Relationship Self-Report", description: "FermatMind EQ-60: 60-item self-report (~10 min), currently free with results. Review four-dimensional tendencies, scoring, interim references and scientific limits before joining." },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: { title: "Free Holland Code Career Test: RIASEC Interests", description: "Free Holland Code interest test: 60 questions (~8 min) or 140 (~18). View six RIASEC interests and a three-letter code to explore specific activities and career directions." },
};

const ZH_SEARCH_COPY: Partial<Record<string, { title: string; description: string }>> = {
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { title: "免费情商测试：60题情绪与关系自评", description: "费马EQ-60为60题自评，约10分钟，当前测试与结果免费。了解四维倾向、计分、阶段性参照和科学边界，再决定是否参加。" },
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: {
    title: "免费智商测试（IQ）：30题图形推理，测试与结果免费",
    description: "在线完成费马30题原创图形与矩阵推理练习，预计约20分钟，测试与结果均免费。观察本次规律识别与抽象推理表现，了解成绩含义和使用边界；不替代专业智力评估。",
  },
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

const HERO_DESCRIPTIONS: Partial<Record<string, Partial<Record<"zh" | "en", string>>>> = {
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: {
    zh: "30道原创图形与矩阵推理题，预计约20分钟，测试与结果均免费。完成后了解自己在本次推理任务中的表现；这是推理练习，不替代专业智力评估。",
    en: "30 original visual matrix reasoning questions, about 20 minutes, with free results. Explore your performance on this form. This reasoning exercise does not replace a professional intelligence assessment.",
  },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { zh: "约10分钟完成60题自评，当前测试与结果免费。查看自我觉察、情绪调节、共情理解和关系管理的四维结果，再结合具体事件与反馈阅读；结果反映本次自我描述。", en: "Complete 60 self-report items in about 10 minutes. The current test and results are free. View four-dimensional results for Self-Awareness, Emotion Regulation, Empathy and Relationship Management, then read them alongside specific events and feedback. Results reflect your self-description in this response session." },
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: {
    zh: "大五人格测试观察 OCEAN 五个连续维度。120 题约 15 分钟，90 题约 11 分钟；两版均可免费完成并查看结果。按可投入时间选择版本，再结合具体情境阅读分数。",
    en: "The Big Five test examines five continuous OCEAN dimensions. The 120-question version takes about 15 minutes, and the 90-question version about 11. Both are free to complete and view results. Choose a version based on the time you can spend, then read scores in specific contexts.",
  },
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: {
    zh: "了解你的 16 型人格结果与四组偏好。93 题约 10 分钟，144 题约 15 分钟，两版均可免费完成并查看结果，用于自我了解与沟通参考。",
    en: "Learn about your 16-type personality result and four preference pairs. Choose 93 questions in about 10 minutes or 144 in about 15. Both versions are free to complete and view results, for self-understanding and communication reference.",
  },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: {
    zh: "了解你更喜欢哪些工作活动，查看六维兴趣分布与前三项代码。60 题约 8 分钟，140 题约 18 分钟，两版均可免费完成并查看结果。",
    en: "Explore the work activities you prefer, your six-dimensional interest distribution, and the code for your top three interests. Choose 60 questions in about 8 minutes or 140 in about 18. Both versions are free to complete and view results.",
  },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: {
    zh: "了解你的九型分布与候选类型。105 题按程度作答，约 12 分钟；144 题每题二选一，约 18 分钟。两版均可免费完成并查看结果。",
    en: "Explore your nine-type distribution and candidate types. Rate the degree to which 105 items apply to you in about 12 minutes, or choose between two options for each of 144 items in about 18 minutes. Both versions are free to complete and view results.",
  },
};

export type AssessmentEditorialLayout = {
  itemOrder: string[];
  methodItemIds: string[];
};

const EDITORIAL_LAYOUTS: Partial<Record<string, AssessmentEditorialLayout>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: {
    itemOrder: ["free-results", "versions", "method", "interpretation", "applications", "mbti-scoring-method", "mbti-type-method"],
    methodItemIds: ["method", "mbti-scoring-method", "mbti-type-method"],
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
  eq_60: "开始60题自评 · 约10分钟 · 免费",
};

const EN_ENTRY_LABELS: Record<string, string> = {
  mbti_144: "144 questions · About 15 minutes · Free test",
  mbti_93: "93 questions · About 10 minutes · Free test",
  big5_120: "Start 120-question Full Edition · Free test",
  big5_90: "Start 90-question Short Edition · Free test",
  enneagram_likert_105: "Start 105 items · Degree ratings · Free test",
  enneagram_forced_choice_144: "Start 144 items · Two-option choices · Free test",
  riasec_60: "Start 60-question Standard Edition · Free test",
  riasec_140: "Start 140-question Extended Edition · Free test",
  owner_original_30: "Start free 30-question test",
  eq_60: "Start 60-item self-report · About 10 minutes · Free",
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
