import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";

// Product UI authority for these six landing pages. CMS/registry text must not
// override their headings or version-button labels; runtime availability stays API-owned.
const ASSESSMENT_LANDING_UI: Partial<Record<string, Record<"zh" | "en", string>>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: { zh: "MBTI 性格免费测试", en: "Free 16-Type MBTI-Style Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: { zh: "大五人格免费测试（Big Five）", en: "Free Big Five Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: { zh: "九型人格测试（免费版）", en: "Free Enneagram Personality Test" },
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: { zh: "免费智商测试（IQ）", en: "Free IQ Test" },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { zh: "免费情商测试：60题情绪与关系自评", en: "Free Emotional Intelligence Test (EQ)" },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: { zh: "霍兰德职业兴趣测试（免费版）", en: "Free Holland Code Career Interest Test (RIASEC)" },
};

// English search copy is distinct from the concise on-page heading.
const EN_SEARCH_COPY: Partial<Record<string, { title: string; description: string }>> = {
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: { title: "Free MBTI Personality Test: 16 Types & Preferences", description: "Free MBTI test: 93 questions (~10 min) or 144 (~15). Explore 16 types, four preference pairs and next steps for self-understanding and communication reference." },
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: { title: "Free Big Five Personality Test: OCEAN Traits & Results", description: "Free Big Five test: 90 items (~11 min) or FermatMind’s adapted 120-item IPIP-NEO form (~15 min). Explore five OCEAN traits and 30 facets." },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: { title: "Free Enneagram Test: Explore Your 9-Type Profile", description: "Free Enneagram: 105 ratings (~12 min) or 144 two-option choices (~18). Read nine-type distributions and candidate explanations against real experiences, motivations and reactions." },
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: { title: "Free IQ Test: 30 Matrix Reasoning Questions & Free Results", description: "FermatMind IQ: 30 original visual matrix questions, ~20 min. Free test and results. Review reasoning, scores and limits; no substitute for professional IQ assessment." },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { title: "Free Emotional Intelligence Test (EQ) & Results", description: "Take a free 60-question EQ self-report in about 10 minutes. Explore emotional awareness, regulation, empathy and relationships, with results and practical next steps." },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: { title: "Free Career Interest Test: Holland Code (RIASEC)", description: "Take a free Holland Code test: 60 questions (~8 min) or 140 (~18). Get your six RIASEC interests and three-letter code to explore work activities and careers." },
};

const ZH_SEARCH_COPY: Partial<Record<string, { title: string; description: string }>> = {
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: { title: "免费大五人格测试：OCEAN 五维与30个侧面", description: "免费大五人格测试：90题约11分钟，费马改写的120题 IPIP-NEO 结构题本约15分钟。了解 OCEAN 五个连续维度与30个侧面；120题并非未经改动的 Johnson 原版。" },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { title: "免费情商测试（EQ）：60题自评与四维结果", description: "约10分钟完成60题情商自评，测试与结果免费。了解自我觉察、情绪调节、共情和关系管理，结合实际经历选择一个沟通练习；结果不等于能力评定。" },
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: {
    title: "免费智商测试（IQ）：30题图形推理，测试与结果免费",
    description: "在线完成费马30题原创图形与矩阵推理练习，预计约20分钟，测试与结果均免费。观察本次规律识别与抽象推理表现，了解成绩含义和使用边界；不替代专业智力评估。",
  },
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: {
    title: "MBTI 免费测试：16 型人格与偏好解读",
    description: "免费完成 MBTI 性格测试，93 题约 10 分钟，144 题约 15 分钟。查看 16 型人格、四组偏好解释与后续探索建议，用于自我了解与沟通参考。",
  },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: {
    title: "霍兰德职业兴趣测试免费版：60/140题与三字代码",
    description: "在线免费完成霍兰德职业兴趣测试：60题约8分钟，140题约18分钟，测试与结果均免费。查看 RIASEC 六维兴趣与三字代码，结合结果示例探索工作活动和职业方向；兴趣不等于能力或职业适配结论。",
  },
  [SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM]: {
    title: "九型人格测试免费版：105/144题与结果解读",
    description: "在线免费完成九型人格测试：105题程度选择约12分钟，144题二选一约18分钟，测试与结果均免费。查看九型分布与候选类型解释，再按结果解读步骤对照自己的动机和具体经历。",
  },
};

const HERO_DESCRIPTIONS: Partial<Record<string, Partial<Record<"zh" | "en", string>>>> = {
  [SCALE_CANONICAL_SLUG_MAP.IQ_RAVEN]: {
    zh: "30道原创图形与矩阵推理题，预计约20分钟，测试与结果均免费。查看答对题数、正确率和题组表现，并保存TXT或Markdown摘要。这是推理练习，不替代专业智力评估。",
    en: "30 original visual matrix reasoning questions, estimated at about 20 minutes. The test and results are free. Review correct-answer count, accuracy and performance by item group, then save a TXT or Markdown summary. This reasoning exercise does not replace a professional intelligence assessment.",
  },
  [SCALE_CANONICAL_SLUG_MAP.EQ_60]: { zh: "约10分钟完成60题情商自评，测试与结果免费。了解自我觉察、情绪调节、共情理解和关系管理，再选择一个沟通习惯练习。结果反映本次自我描述，应结合具体事件和他人反馈阅读。", en: "Take a free 60-question emotional intelligence self-report in about 10 minutes. Explore self-awareness, emotion regulation, empathy and relationship management, then choose one communication habit to practice. Your results describe this session’s answers; read them alongside real events and feedback." },
  [SCALE_CANONICAL_SLUG_MAP.BIG5_OCEAN]: {
    zh: "观察开放性、尽责性、外向性、宜人性与神经质五个连续维度。120题为费马按 IPIP-NEO-120 五维、30侧面结构改写的题本，并非未经改动的 Johnson 原版；原版的效度与常模不能直接套用于本改写版。90题约11分钟，120题约15分钟，两版均可免费完成并查看结果；侧面明细以实际展示为准。",
    en: "Explore five continuous personality traits: openness, conscientiousness, extraversion, agreeableness and neuroticism. The 120-item form is FermatMind’s adaptation using the IPIP-NEO-120 structure of five traits and 30 facets, not the unmodified Johnson form. Original-form validation and norms do not automatically apply to this adaptation. Choose 90 items (~11 minutes) or 120 (~15); both are free to complete and view results. Facet detail depends on the selected version.",
  },
  [SCALE_CANONICAL_SLUG_MAP.MBTI]: {
    zh: "了解你的 16 型人格结果与四组偏好。93 题约 10 分钟，144 题约 15 分钟，两版均可免费完成并查看结果，用于自我了解与沟通参考。",
    en: "Learn about your 16-type personality result and four preference pairs. Choose 93 questions in about 10 minutes or 144 in about 15. Both versions are free to complete and view results, for self-understanding and communication reference.",
  },
  [SCALE_CANONICAL_SLUG_MAP.RIASEC]: {
    zh: "了解你更喜欢哪些工作活动。60题约8分钟，140题约18分钟，两版均可免费完成并查看六维兴趣与三字代码。用结果比较实际岗位任务、课程和小项目；兴趣不等于能力，也不能保证某个职业适合你。",
    en: "Find work activities you would like to explore with this free Holland Code career interest test. Choose 60 questions in about 8 minutes or 140 in about 18. Both include your six RIASEC scores and three-letter code. Use them to compare real job tasks, courses and projects; interests do not measure ability or guarantee a career match.",
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
  big5_120: "开始 120 题改写版 · 免费测试",
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
  big5_120: "Start 120-item adapted form · Free test",
  big5_90: "Start 90-question Short Edition · Free test",
  enneagram_likert_105: "Start 105 items · Degree ratings · Free test",
  enneagram_forced_choice_144: "Start 144 items · Two-option choices · Free test",
  riasec_60: "Start 60-question Standard Edition · Free test",
  riasec_140: "Start 140-question Extended Edition · Free test",
  owner_original_30: "Start free 30-question test",
  eq_60: "Start 60-item self-report · About 10 minutes · Free",
};

export type AssessmentArtwork = "mbti" | "big-five" | "enneagram" | "iq" | "eq" | "riasec";

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
