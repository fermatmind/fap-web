import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

export const hollandLandingTitle = "霍兰德职业兴趣测试（60题免费版）";
export const mbtiLandingTitle = "MBTI 免费测试（93/144题完整版）：看清你的思维偏好与人格底色";

// Product UI authority for these six landing pages. CMS/registry text must not
// override their headings or version-button labels; runtime availability stays API-owned.
const ASSESSMENT_LANDING_UI: Partial<Record<string, Record<"zh" | "en", string>>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: { zh: mbtiLandingTitle, en: "Free 16-Type MBTI-Style Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: { zh: "大五人格免费测试（Big Five）", en: "Free Big Five Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: { zh: "九型人格测试（免费版）", en: "Free Enneagram Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: { zh: "免费智商测试（IQ）", en: "Free IQ Test" },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { zh: "免费情商测试：60题情绪与关系自评", en: "Free Emotional Intelligence Test (EQ)" },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: { zh: "霍兰德职业兴趣测试（免费版）", en: "Free Holland Code Career Interest Test (RIASEC)" },
};

// English search copy is distinct from the concise on-page heading.
const EN_SEARCH_COPY: Partial<Record<string, { title: string; description: string }>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: {
    title: "Free MBTI Personality Test with Results",
    description: "Take a free MBTI-style test: 93 questions (~10 min) or 144 (~15 min). Get your free 16-type result and four preference scores. See a scored example before you start.",
  },
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: { title: "Free Big Five Personality Test: OCEAN Traits & Results", description: "Free 90-item Big Five test, about 11 minutes. Explore five OCEAN traits and how 30 facets contribute to your results." },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: { title: "Free Enneagram Test: Explore Your 9-Type Profile", description: "Take the free 105-item Enneagram self-report in about 12 minutes. Compare the nine-type profile and leading candidates with your own experiences." },
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: { title: "Free IQ Test: 30 Matrix Reasoning Questions & Free Results", description: "30 original visual matrix questions (~20 min). Free basic results; optional paid full report. Practice only; no substitute for professional IQ assessment." },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { title: "Free Emotional Intelligence Test (EQ) & Results", description: "Take a free 60-question EQ self-report in about 10 minutes. Explore emotional awareness, regulation, empathy and relationships, with results and practical next steps." },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: { title: "Free Career Interest Test: Holland Code (RIASEC)", description: "Take a free Holland Code test: 60 questions (~8 min). Get your six RIASEC interests and three-letter code to explore work activities and careers." },
};

const ZH_SEARCH_COPY: Partial<Record<string, { title: string; description: string }>> = {
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: { title: "免费大五人格测试：OCEAN 五维与30个侧面", description: "免费大五人格测试，90 题约 11 分钟。了解 OCEAN 五个连续维度，以及如何解读自己的结果。" },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { title: "免费情商测试（EQ）：60题自评与四维结果", description: "约10分钟完成60题情商自评，作答与基础结果免费，完整报告获取方式以结果页为准。了解自我觉察、情绪调节、共情和关系管理，结合实际经历选择一个沟通练习；结果不等于能力评定。" },
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: {
    title: "免费智商测试（IQ）：原创30题图形推理与成绩解读",
    description: "免费完成费马原创30题图形推理练习，预计约20分钟，另有综合40题。查看答对题数和正确率，了解成绩与适用范围。完整报告查看方式以结果页提示为准。",
  },
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: {
    title: "MBTI测试免费版（93/144题完整版）：16型人格与荣格八维解析",
    description: "费马 MBTI 免费测试支持 93 题快速版与 144 题深度版，约 10–15 分钟。查看四维偏好百分比与 16 型人格，探索荣格八维、亲密关系及职场沟通案例。",
  },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: {
    title: "霍兰德职业兴趣测试免费版（60题）：RIASEC 三字代码与职业探索",
    description: "无需注册，约 8 分钟完成 60 题霍兰德职业兴趣测试。免费查看 RIASEC 六维分数、三字代码与结果解读，对照 1,046 个职业的日常任务。",
  },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: {
    title: "九型人格测试免费版：105 题与结果解读",
    description: "免费完成九型人格测试：105 题五点自评，约 12 分钟。查看九型分布与候选类型，对照自己的动机和具体经历。",
  },
};

const TRADITIONAL_MBTI_SEARCH_COPY = {
  title: "免費 MBTI 人格測驗｜查看 16 型結果與四組偏好",
  description: "93 題約 10 分鐘，144 題約 15 分鐘。交卷後可免費查看基本人格類型與四組偏好，也可先看實際計分的報告範例。",
};

const HERO_DESCRIPTIONS: Partial<Record<string, Partial<Record<"zh" | "en" | "zh-TW", string>>>> = {
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: {
    zh: "30道原创图形与矩阵推理题，预计约20分钟，作答与基础结果免费，完整报告可选付费解锁。查看答对题数、正确率和题组表现，并保存TXT或Markdown摘要。这是推理练习，不替代专业智力评估。",
    en: "30 original visual matrix reasoning questions, estimated at about 20 minutes. The test and basic results are free; the full report is an optional one-time purchase. Review correct-answer count, accuracy and performance by item group, then save a TXT or Markdown summary. This reasoning exercise does not replace a professional intelligence assessment.",
  },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { zh: "约10分钟完成60题情商自评，作答与基础结果免费，完整报告获取方式以结果页为准。了解自我觉察、情绪调节、共情理解和关系管理，再选择一个沟通习惯练习。结果反映本次自我描述，应结合具体事件和他人反馈阅读。", en: "Take a free 60-question emotional intelligence self-report in about 10 minutes. Explore self-awareness, emotion regulation, empathy and relationship management, then choose one communication habit to practice. Your results describe this session’s answers; read them alongside real events and feedback." },
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: {
    zh: "从开放性、尽责性、外向性、宜人性与情绪性五个连续维度读懂自己的作答。90 题约 11 分钟，可免费完成并查看结果。",
    en: "Explore five continuous personality traits: openness, conscientiousness, extraversion, agreeableness and neuroticism. The 90-item test takes about 11 minutes. You can take the test and view the results for free.",
  },
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: {
    zh: "了解你的 16 型人格结果与四组偏好。时间有限，可以先做 93 题版。想比较自己在更多情境下的选择，可以做 144 题版。两版均可免费完成并查看基础结果，供自我了解与沟通参考。",
    "zh-TW": "了解你的 16 型人格结果与四组偏好。93 题约 10 分钟，144 题约 15 分钟，两版均可免费完成并查看基础结果，完整报告可选付费解锁，用于自我了解与沟通参考。",
    en: "Take a free MBTI-style personality test and see your four-letter type and scores for the four preference pairs. Choose 93 questions (about 10 minutes) or 144 (about 15 minutes). Both versions include free basic results.",
  },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: {
    zh: "60 题约 8 分钟，作答与基础结果免费，完整报告可选付费解锁。结果会展示 RIASEC 六维兴趣，以及概括前三项的三字代码，帮助你找到想进一步体验的工作活动。",
    en: "Find work activities you would like to explore with this free Holland Code career interest test. Answer 60 questions in about 8 minutes to get your six RIASEC scores and three-letter code. Use them to compare real job tasks, courses and projects; interests do not measure ability or guarantee a career match.",
  },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: {
    zh: "了解你的九型分布与候选类型。105 题按程度作答，约 12 分钟。作答与基础结果免费，完整报告可选付费解锁。",
    en: "Explore your nine-type distribution and candidate types. Rate 105 statements on a five-point scale in about 12 minutes. The test and basic results are free, with an optional paid full report.",
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
    itemOrder: ["riasec-ranking", "riasec-scoring", "riasec-science"],
    methodItemIds: ["riasec-scoring", "riasec-science"],
  },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: {
    itemOrder: ["enneagram-model", "enneagram-application", "enneagram-likert-scoring", "enneagram-science"],
    methodItemIds: ["enneagram-likert-scoring", "enneagram-science"],
  },
};

const ZH_ENTRY_LABELS: Record<string, string> = {
  mbti_144: "144 题 · 约 15 分钟 · 免费测试",
  mbti_93: "93 题 · 约 10 分钟 · 免费测试",
  big5_90: "开始 90 题 · 免费测试",
  enneagram_likert_105: "开始 105 题 · 程度选择 · 免费测试",
  riasec_60: "开始 60 题标准版 · 免费测试",
  owner_original_30: "开始原创 30 题",
  merged_40: "开始综合 40 题",
  eq_60: "开始60题自评 · 约10分钟 · 免费",
};

const EN_ENTRY_LABELS: Record<string, string> = {
  mbti_144: "144 questions · About 15 minutes · Free test",
  mbti_93: "93 questions · About 10 minutes · Free test",
  big5_90: "Start 90-question test · Free test",
  enneagram_likert_105: "Start 105 items · Degree ratings · Free test",
  riasec_60: "Start 60-question Standard Edition · Free test",
  owner_original_30: "Start free 30-question test",
  eq_60: "Start 60-item self-report · About 10 minutes · Free",
};

const TRADITIONAL_ENTRY_LABELS: Partial<Record<string, string>> = {
  riasec_60: "開始 60 題標準版 · 免費測驗",
};

export type AssessmentArtwork = "mbti" | "big-five" | "enneagram" | "iq" | "eq" | "riasec" | "career" | "archetypes" | "functions";

export function resolveAssessmentLandingSocialImage(slug: string, locale: "zh" | "en", selectedImage: string) {
  const legacyMbtiImage = "https://api.fermatmind.com/static/share/mbti_square_600x600.png";
  return slug === "holland-career-interest-test-riasec"
    && (!selectedImage || selectedImage === legacyMbtiImage)
    ? `/og/page/holland-career-interest-test-riasec?locale=${locale}`
    : selectedImage;
}

const HERO_ARTWORK: Partial<Record<string, AssessmentArtwork>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: "mbti",
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: "big-five",
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: "enneagram",
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: "iq",
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: "eq",
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: "riasec",
};

export function getAssessmentLandingUi(slug: string, locale: "zh" | "en", displayLocale: "zh" | "en" | "zh-TW" = locale) {
  const names = Object.hasOwn(ASSESSMENT_LANDING_UI, slug) ? ASSESSMENT_LANDING_UI[slug] : undefined;
  return names ? {
    title: locale === "zh" && slug === SCALE_CANONICAL_SLUG_MAP.MBTI
      ? "MBTI 16 型人格免费测试"
      : names[locale],
    seoTitle: locale === "en" ? EN_SEARCH_COPY[slug]?.title : ZH_SEARCH_COPY[slug]?.title,
    seoDescription: locale === "en" ? EN_SEARCH_COPY[slug]?.description : ZH_SEARCH_COPY[slug]?.description,
    traditionalSearchCopy: slug === SCALE_CANONICAL_SLUG_MAP.MBTI ? TRADITIONAL_MBTI_SEARCH_COPY : undefined,
    heroDescription: HERO_DESCRIPTIONS[slug]?.[displayLocale] ?? HERO_DESCRIPTIONS[slug]?.[locale],
    entryLabels: locale === "zh" ? ZH_ENTRY_LABELS : EN_ENTRY_LABELS,
    traditionalEntryLabels: TRADITIONAL_ENTRY_LABELS,
    heroArtwork: HERO_ARTWORK[slug],
  } : null;
}

export function getAssessmentEditorialLayout(slug: string): AssessmentEditorialLayout | null {
  return EDITORIAL_LAYOUTS[slug] ?? null;
}
