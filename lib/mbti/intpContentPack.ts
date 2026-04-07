import type { Locale } from "@/lib/i18n/locales";

type LocaleText = {
  zh: string;
  en: string;
};

type LocalizedLink = {
  key: string;
  label: LocaleText;
  href: string;
};

type RenderedLink = {
  key: string;
  label: string;
  href: string;
};

type SceneCopy = {
  summary: LocaleText;
  strengths: LocaleText[];
  risks: LocaleText[];
  why: LocaleText;
  variantDeltaA: LocaleText;
  variantDeltaT: LocaleText;
  nextLinks: LocalizedLink[];
};

type BasePersonalityCopy = {
  heroPositioning: LocaleText;
  heroSummary: LocaleText;
  heroCoreStrength: LocaleText;
  heroRealWorldFriction: LocaleText;
  heroNextStepHint: LocaleText;
  variantDeltaA: LocaleText;
  variantDeltaT: LocaleText;
  careerDirection: SceneCopy;
  teamCollaboration: SceneCopy;
  growthPlanning: SceneCopy;
  topicBacklink: LocalizedLink;
  recommendationBacklink: LocalizedLink;
  testEntryLink: LocalizedLink;
  linkedGuides?: RenderedLink[];
  linkedArticles?: RenderedLink[];
};

type VariantPersonalityCopy = Omit<BasePersonalityCopy, "topicBacklink" | "recommendationBacklink" | "linkedGuides" | "linkedArticles" | "testEntryLink">;

type RecommendationCopy = {
  heroSummary: LocaleText;
  fitWhy: LocaleText;
  costWhy: LocaleText;
  jobStructure: LocaleText;
  variantRiskA: LocaleText;
  variantRiskT: LocaleText;
  nextSteps: LocalizedLink[];
  linkedGuides: LocalizedLink[];
  linkedArticles: LocalizedLink[];
  topicBacklink: LocalizedLink;
};

type IntpCopyMap = {
  a: VariantPersonalityCopy;
  t: VariantPersonalityCopy;
};

type RenderedSceneCopy = {
  summary: string;
  strengths: string[];
  risks: string[];
  why: string;
  variantDelta: string;
  nextLinks: { key: string; label: string; href: string }[];
};

export type IntpPersonalityRenderCopy = {
  heroPositioning: string;
  heroSummary: string;
  heroCoreStrength: string;
  heroRealWorldFriction: string;
  heroNextStepHint: string;
  variantDelta: string;
  careerDirection: RenderedSceneCopy;
  teamCollaboration: RenderedSceneCopy;
  growthPlanning: RenderedSceneCopy;
  topicBacklink: { key: string; label: string; href: string };
  recommendationBacklink: { key: string; label: string; href: string };
  testEntryLink: { key: string; label: string; href: string };
  linkedGuides: { key: string; label: string; href: string }[];
  linkedArticles: { key: string; label: string; href: string }[];
};

export type IntpRecommendationRenderCopy = {
  heroSummary: string;
  fitWhy: string;
  costWhy: string;
  jobStructure: string;
  variantRisk: string;
  nextSteps: { key: string; label: string; href: string }[];
  linkedGuides: { key: string; label: string; href: string }[];
  linkedArticles: { key: string; label: string; href: string }[];
  topicBacklink: { key: string; label: string; href: string };
};

function localizeText(locale: Locale, value: LocaleText): string {
  return locale === "zh" ? value.zh : value.en;
}

function localizeLink(locale: Locale, link: LocalizedLink): { key: string; label: string; href: string } {
  return {
    key: link.key,
    label: localizeText(locale, link.label),
    href: link.href,
  };
}

function localizeLinks(locale: Locale, links: LocalizedLink[]): { key: string; label: string; href: string }[] {
  return links.map((link) => localizeLink(locale, link));
}

const INTP_SCENARIO_LINKS = {
  personalityBase: {
    topicBacklink: {
      zh: "返回 MBTI 主题页",
      en: "Back to MBTI topic",
      href: "/topics/mbti",
    },
    recommendationBacklink: {
      zh: "查看 INTP 职业推荐",
      en: "View INTP recommendation",
      href: "/career/recommendations/mbti/intp-a",
    },
    testEntryLink: {
      zh: "开始 MBTI 深度测试",
      en: "Start MBTI deep test",
      href: "/tests/mbti-personality-test-16-personality-types",
    },
    guides: [
      {
        key: "mbti-basics",
        label: { zh: "MBTI 基础指南", en: "MBTI basics guide" },
        href: "/articles/mbti-basics",
      },
      {
        key: "mbti-growth-guide",
        label: { zh: "成长建议指南", en: "MBTI growth guide" },
        href: "/articles/mbti-growth-guide",
      },
      {
        key: "mbti-narrative-portrait",
        label: { zh: "类型叙事画像", en: "Narrative portrait" },
        href: "/articles/mbti-narrative-portrait",
      },
      {
        key: "mbti-job-fit-guide",
        label: { zh: "职业匹配指南", en: "MBTI job fit guide" },
        href: "/career/guides/from-mbti-to-job-fit",
      },
    ],
  } as const,
  recommendationA: {
    recommendationBacklink: {
      zh: "INTP-A 职业建议",
      en: "INTP-A career recommendations",
      href: "/career/recommendations/mbti/intp-a",
    },
  },
  recommendationT: {
    recommendationBacklink: {
      zh: "INTP-T 职业建议",
      en: "INTP-T career recommendations",
      href: "/career/recommendations/mbti/intp-t",
    },
  },
} as const;

const COMMON_PERSONALITY_BASE: Omit<BasePersonalityCopy, "topicBacklink" | "recommendationBacklink" | "testEntryLink"> = {
  heroPositioning: {
    zh: "独立的系统架构师。倾向于在抽象逻辑中建立可运行的模型，用最少假设解释复杂问题。",
    en: "An independent systems architect who builds runnable models from abstract logic with minimal assumptions.",
  },
  heroSummary: {
    zh: "INTP 最强的不是“知道更多”，而是把复杂问题快速拆成可解释的结构。",
    en: "The INTP advantage is not knowing more, but quickly decomposing complex problems into clear structures.",
  },
  heroCoreStrength: {
    zh: "以结构化推理为先，能快速重建问题边界，并从中导出决策路径。",
    en: "Structured reasoning comes first; they quickly rebuild a problem boundary and derive decision paths.",
  },
  heroRealWorldFriction: {
    zh: "常见的摩擦不是能力不足，而是“先想透再行动”与“还不够完美”之间反复拉扯。",
    en: "Common friction is not lack of ability, but repeated hesitation between fully understanding and feeling ready to start.",
  },
  heroNextStepHint: {
    zh: "这页不是给你贴标签，而是帮你看清职业、协作和成长里同一类能力为什么会变成双刃剑。",
    en: "This page is not a label; it helps map why the same strengths can become both leverage and friction across career, collaboration, and growth.",
  },
  variantDeltaA: {
    zh: "A 型更稳、推进更快，能更早把判断变成行动，但容易低估关系与政治摩擦。",
    en: "A variants are steadier and faster to move, and can convert judgments into action earlier, but can underestimate social and political friction.",
  },
  variantDeltaT: {
    zh: "T 型更敏锐也更高标准，洞察更细，却更容易因为“是否够完美”而拖住启动。",
    en: "T variants are sharper and hold higher standards; they read subtleties better but often delay launch because perfection feels necessary.",
  },
  careerDirection: {
    summary: {
      zh: "INTP 通常会被高自由度、低社交磨损、允许深度思考的工作吸引。",
      en: "INTPs are usually attracted to roles with high autonomy, low social drag, and room for deep analysis.",
    },
    strengths: [
      { zh: "抽象建模", en: "Abstract modeling" },
      { zh: "问题拆解", en: "Problem decomposition" },
      { zh: "在混乱中识别底层结构", en: "Identifying structure in messy contexts" },
      { zh: "快速形成框架", en: "Rapidly forming an execution framework" },
    ],
    risks: [
      { zh: "行动启动慢", en: "Slower action initiation" },
      { zh: "高估“再想一想”的收益", en: "Overestimating the value of delaying decisions" },
      { zh: "对低质量沟通和重复流程耐受度低", en: "Low tolerance for low-quality communication and repetitive processes" },
    ],
    why: {
      zh: "优势在于思维深度，但在需要快速同步和高情绪协作的环境中，推理成本会被放大。",
      en: "Strength comes from cognitive depth, but in high-communication environments the cognitive cost can become amplified and expensive.",
    },
    variantDeltaA: {
      zh: "INTP-A 更容易在判断成立后推进，职业路径更像连续迭代，但容易低估组织关系成本。",
      en: "INTP-A tends to move after judgment is enough, making career progress feel iterative, but may underestimate relational costs.",
    },
    variantDeltaT: {
      zh: "INTP-T 更容易在交付前反复校验，路径决策准确率高，但启动成本更高。",
      en: "INTP-T verifies repeatedly before delivery, achieving high decision accuracy but at a higher activation cost.",
    },
    nextLinks: [],
  },
  teamCollaboration: {
    summary: {
      zh: "INTP 在团队里常是最先发现逻辑漏洞的人，但不会总是把“问题发现”转成即时表述。",
      en: "INTPs are often the first to spot logical holes in teams, but not always the first to verbalize them.",
    },
    strengths: [
      { zh: "发现逻辑漏洞", en: "Identifying logical inconsistencies" },
      { zh: "拆解复杂议题", en: "Decomposing complex topics" },
      { zh: "保持客观视角", en: "Maintaining objectivity" },
      { zh: "不轻易跟随表面共识", en: "Avoiding shallow consensus" },
    ],
    risks: [
      { zh: "表达偏抽象，易被误读为冷淡", en: "Abstract expression may be read as detached" },
      { zh: "不愿参与低价值协同", en: "Low appetite for low-value collaboration" },
      { zh: "容易忽略情绪变量", en: "May under-weight emotional variables" },
    ],
    why: {
      zh: "默认先判断“事是否成立”，再讨论“关系如何推进”，这在逻辑题有效，在情绪协作里会被放大。",
      en: "The default is to validate whether the work is sound before discussing relationship flow, which is effective for logic but costly in emotional collaboration.",
    },
    variantDeltaA: {
      zh: "INTP-A 往往先指出问题并快速推进修正，是高精度纠偏器，但也更容易被感知为“推进太硬”。",
      en: "INTP-A often points out issues and pushes correction quickly, acting as a precision stabilizer but sometimes feeling too blunt.",
    },
    variantDeltaT: {
      zh: "INTP-T 倾向先内审再表达，通常更稳重，但反馈节奏慢，团队可见度不足。",
      en: "INTP-T tends to self-audit before speaking, which is careful but slows feedback timing and reduces team visibility.",
    },
    nextLinks: [],
  },
  growthPlanning: {
    summary: {
      zh: "INTP 的成长不是再多看一遍，而是从持续分析转到可验证行动。",
      en: "Growth for INTP is not endless analysis; it is translating continuous analysis into verified action.",
    },
    strengths: [
      { zh: "建立高质量决策模型", en: "Building high-quality decision models" },
      { zh: "识别系统风险", en: "Identifying system-level risks" },
      { zh: "用数据和推理推进自己", en: "Advancing through reasoning and data" },
    ],
    risks: [
      { zh: "容易停留在‘已理解’阶段", en: "Can stay in the ‘already understood’ stage" },
      { zh: "把不确定误判为错误", en: "Mistake uncertainty for failure" },
      { zh: "分析替代反馈", en: "Replacing real feedback with analysis" },
    ],
    why: {
      zh: "当问题定义清楚却缺执行节奏时，成长会卡在“正确但停滞”。",
      en: "Growth stalls when the problem is clear but execution rhythm is missing, leading to “correct but stuck.”",
    },
    variantDeltaA: {
      zh: "INTP-A 更缺的是将推进力和现实摩擦一起建模：把执行、关系与环境约束纳入框架。",
      en: "INTP-A needs to model execution, relationships, and context constraints together, not only cognitive correctness.",
    },
    variantDeltaT: {
      zh: "INTP-T 更缺的是“放心开始”：把第一版当实验，而不是追求首版完美。",
      en: "INTP-T needs permission to start, treating the first version as an experiment rather than demanding perfection.",
    },
    nextLinks: [],
  },
};

const INTP_PERSONALITY_COPY: IntpCopyMap = {
  a: {
    heroPositioning: {
      zh: "更稳更果断的逻辑架构者，能在不确定里推进并形成可执行决策。",
      en: "A steadier and more decisive logic architect who can move under uncertainty and produce actionable decisions.",
    },
    heroSummary: {
      zh: "INTP-A 更容易在判断成立后快速推进，不会长期停在内部模拟。",
      en: "INTP-A is more likely to move forward once reasoning reaches a high level of confidence.",
    },
    heroCoreStrength: {
      zh: "你更擅长把“足够对”转成行动。",
      en: "You are stronger at turning ‘good enough’ into action.",
    },
    heroRealWorldFriction: {
      zh: "风险在于过度低估组织关系与沟通节奏，容易把‘逻辑正确’当作‘别人会接受’。",
      en: "The risk is underestimating relational dynamics and communication pace; assuming logic implies acceptance can be costly.",
    },
    heroNextStepHint: {
      zh: "这页重点在于解释：你明明能推进，但推进质量会受协作与执行摩擦影响。",
      en: "This page explains why execution may still lose quality when collaboration and execution friction are ignored.",
    },
    variantDeltaA: {
      zh: "A 版优先保持推进力和稳定性，核心是把逻辑优势落到现实执行。",
      en: "A variant keeps momentum and stability, with the key challenge of translating cognitive advantage into execution reality.",
    },
    variantDeltaT: COMMON_PERSONALITY_BASE.variantDeltaT,
    careerDirection: {
      ...COMMON_PERSONALITY_BASE.careerDirection,
      nextLinks: [
        {
          key: "career_a_recommendation",
          label: { zh: "查看 INTP-A 职业推荐", en: "View INTP-A career recommendations" },
          href: "/career/recommendations/mbti/intp-a",
        },
        {
          key: "career_a_guide",
          label: { zh: "职业匹配建议", en: "Job-fit guidance" },
          href: "/career/guides/from-mbti-to-job-fit",
        },
        {
          key: "career_a_depth_test",
          label: { zh: "开始深度测试校准", en: "Validate with deep MBTI test" },
          href: "/tests/mbti-personality-test-16-personality-types",
        },
      ],
    },
    teamCollaboration: {
      ...COMMON_PERSONALITY_BASE.teamCollaboration,
      nextLinks: [
        {
          key: "team_a_recommendation",
          label: { zh: "查看职业推荐", en: "View career recommendations" },
          href: "/career/recommendations/mbti/intp-a",
        },
        {
          key: "team_a_topic",
          label: { zh: "回到 MBTI 主题中心", en: "Back to MBTI topic" },
          href: "/topics/mbti",
        },
        {
          key: "team_a_test",
          label: { zh: "开始深度测试", en: "Start deep MBTI test" },
          href: "/tests/mbti-personality-test-16-personality-types",
        },
      ],
    },
    growthPlanning: {
      ...COMMON_PERSONALITY_BASE.growthPlanning,
      nextLinks: [
        {
          key: "growth_a_recommendation",
          label: { zh: "查看职业推荐", en: "View career recommendations" },
          href: "/career/recommendations/mbti/intp-a",
        },
        {
          key: "growth_a_topic",
          label: { zh: "成长与协作场景", en: "Growth and collaboration scenes" },
          href: "/topics/mbti",
        },
        {
          key: "growth_a_test",
          label: { zh: "开始深度测试", en: "Start deep MBTI test" },
          href: "/tests/mbti-personality-test-16-personality-types",
        },
      ],
    },
  },
  t: {
    heroPositioning: {
      zh: "更敏锐、更高精度的逻辑审计者，能看到别人忽略的漏洞，也会对行动门槛更敏感。",
      en: "A sharper and high-precision logic auditor who notices hidden flaws and sets a higher bar before taking action.",
    },
    heroSummary: {
      zh: "你不是看不懂，而是因为高标准反复校验，导致起步变慢。",
      en: "You can understand clearly; it is your high standards and repeated checks that slow starts.",
    },
    heroCoreStrength: {
      zh: "你对逻辑漏洞与假设风险比大多数人更早更敏锐。",
      en: "You detect logical assumptions and risks earlier and more sensitively than most people.",
    },
    heroRealWorldFriction: {
      zh: "真正阻滞的不是能力，而是“还不够好”这个门槛把开始许可拖死了。",
      en: "The main block is not ability but a threshold of ‘not good enough yet’ that blocks initiation.",
    },
    heroNextStepHint: {
      zh: "这页重点是解释：高精度洞察如何变成优势，而不再长期消耗为行动迟缓。",
      en: "This page explains how high-precision insight can stay an advantage without turning into prolonged inaction.",
    },
    variantDeltaA: COMMON_PERSONALITY_BASE.variantDeltaA,
    variantDeltaT: {
      zh: "T 型会把错误担忧与启动焦虑放大，真正瓶颈是“先观察再表达再行动”的节奏过慢。",
      en: "T variants amplify error anxiety and startup dread, creating a slow observe-then-express-then-act rhythm.",
    },
    careerDirection: {
      ...COMMON_PERSONALITY_BASE.careerDirection,
      nextLinks: [
        {
          key: "career_t_recommendation",
          label: { zh: "查看 INTP-T 职业推荐", en: "View INTP-T career recommendations" },
          href: "/career/recommendations/mbti/intp-t",
        },
        {
          key: "career_t_guide",
          label: { zh: "职业匹配建议", en: "Job-fit guidance" },
          href: "/career/guides/from-mbti-to-job-fit",
        },
        {
          key: "career_t_depth_test",
          label: { zh: "开始深度测试校准", en: "Validate with deep MBTI test" },
          href: "/tests/mbti-personality-test-16-personality-types",
        },
      ],
    },
    teamCollaboration: {
      ...COMMON_PERSONALITY_BASE.teamCollaboration,
      nextLinks: [
        {
          key: "team_t_recommendation",
          label: { zh: "查看职业推荐", en: "View career recommendations" },
          href: "/career/recommendations/mbti/intp-t",
        },
        {
          key: "team_t_topic",
          label: { zh: "回到 MBTI 主题中心", en: "Back to MBTI topic" },
          href: "/topics/mbti",
        },
        {
          key: "team_t_test",
          label: { zh: "开始深度测试", en: "Start deep MBTI test" },
          href: "/tests/mbti-personality-test-16-personality-types",
        },
      ],
    },
    growthPlanning: {
      ...COMMON_PERSONALITY_BASE.growthPlanning,
      nextLinks: [
        {
          key: "growth_t_recommendation",
          label: { zh: "查看职业推荐", en: "View career recommendations" },
          href: "/career/recommendations/mbti/intp-t",
        },
        {
          key: "growth_t_topic",
          label: { zh: "成长与协作场景", en: "Growth and collaboration scenes" },
          href: "/topics/mbti",
        },
        {
          key: "growth_t_test",
          label: { zh: "开始深度测试", en: "Start deep MBTI test" },
          href: "/tests/mbti-personality-test-16-personality-types",
        },
      ],
    },
  },
};

const INTP_RECOMMENDATION_COPY_COMMON: Omit<RecommendationCopy, "topicBacklink"> = {
  heroSummary: {
    zh: "INTP 的推荐不是“会做什么题目”，而是“在什么系统里能持续稳定地产出复杂成果”。",
    en: "For INTP, recommendations describe what kinds of systems allow stable production of complex outcomes over time.",
  },
  fitWhy: {
    zh: "INTP 的职业吸引力来自三件事：问题结构复杂、社交摩擦较低、能持续优化系统。",
    en: "INTP-fit jobs are usually appealing because they combine complex structures, low social drag, and room for continuous optimization.",
  },
  costWhy: {
    zh: "真正消耗 INTP 的工作往往高频协调、政治性强、重复执行且价值判断依赖权势，而非推理质量。",
    en: "Roles that drain INTP often involve high coordination overhead, strong politics, repetitive execution, and legitimacy by influence rather than reasoning quality.",
  },
  jobStructure: {
    zh: "这些岗位共性是：允许抽象推演、支持问题建模，并以结果质量胜过过程表演进行协作。",
    en: "Common structure is clear: space for abstract modeling, support for problem architecture, and valuation by outcome quality over performance ritual.",
  },
  nextSteps: [
    {
      key: "rec_next_career_deep",
      label: { zh: "查看职业深度指南", en: "Read career deep guidance" },
      href: "/career/guides/from-mbti-to-job-fit",
    },
    {
      key: "rec_next_team",
      label: { zh: "先看团队协作建议", en: "Review team collaboration guidance" },
      href: "/personality/intp-a",
    },
    {
      key: "rec_next_growth",
      label: { zh: "先看成长建议", en: "Review growth guidance" },
      href: "/personality/intp-a",
    },
    {
      key: "rec_next_test",
      label: { zh: "重新验证 144 题结果", en: "Re-validate with 144-question test" },
      href: "/tests/mbti-personality-test-16-personality-types",
    },
  ],
  variantRiskA: {
    zh: "A 型更容易把推理优势快速转成可执行框架，但也更容易高估团队共识形成速度，导致推进后出现协作摩擦。",
    en: "INTP-A turns reasoning advantage into structure quickly, but can overestimate how fast team consensus catches up, creating execution friction.",
  },
  variantRiskT: {
    zh: "T 型更容易把“再校验一次”当成默认动作，真实风险往往是错过节奏窗口而丢失职业路径。",
    en: "INTP-T tends to treat repeated validation as the default, and the real risk is missing timing windows in career execution.",
  },
  linkedGuides: INTP_SCENARIO_LINKS.personalityBase.guides.slice(0, 2).map((guide) => guide as LocalizedLink),
  linkedArticles: [
    {
      key: "rec-article-growth",
      label: { zh: "成长实践指南", en: "Growth practice guide" },
      href: "/articles/mbti-growth-guide",
    },
    {
      key: "rec-article-basics",
      label: { zh: "MBTI 基础", en: "MBTI basics" },
      href: "/articles/mbti-basics",
    },
  ],
};

function resolveIntpVariantFromSlug(value: string | null | undefined): "a" | "t" | null {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (!normalized.endsWith("-a") && !normalized.endsWith("-t")) {
    return null;
  }
  return normalized.endsWith("-a") ? "a" : "t";
}

export function getIntpPersonalityContent(slug: string, locale: Locale): IntpPersonalityRenderCopy | null {
  const variant = resolveIntpVariantFromSlug(slug);
  if (!variant) return null;
  const normalized = slug.toLowerCase();
  if (!normalized.startsWith("intp-")) return null;
  const raw: BasePersonalityCopy = {
    ...COMMON_PERSONALITY_BASE,
    ...INTP_PERSONALITY_COPY[variant],
    topicBacklink: {
      key: "mbti_topic",
      label: INTP_SCENARIO_LINKS.personalityBase.topicBacklink,
      href: INTP_SCENARIO_LINKS.personalityBase.topicBacklink.href,
    },
    recommendationBacklink: {
      key: `intp-${variant}-recommendation`,
      label: {
        zh: variant === "a" ? "INTP-A 职业推荐" : "INTP-T 职业推荐",
        en: variant === "a" ? "INTP-A career recommendations" : "INTP-T career recommendations",
      },
      href:
        variant === "a"
          ? INTP_SCENARIO_LINKS.recommendationA.recommendationBacklink.href
          : INTP_SCENARIO_LINKS.recommendationT.recommendationBacklink.href,
    },
    testEntryLink: {
      key: "mbti-test-landing",
      label: INTP_SCENARIO_LINKS.personalityBase.testEntryLink,
      href: INTP_SCENARIO_LINKS.personalityBase.testEntryLink.href,
    },
    linkedGuides: localizeLinks(locale, INTP_SCENARIO_LINKS.personalityBase.guides),
    linkedArticles: [
      { key: "mbti-basic", label: localizeText(locale, { zh: "MBTI 基础", en: "MBTI basics" }), href: "/articles/mbti-basics" },
      { key: "mbti-growth", label: localizeText(locale, { zh: "成长建议", en: "Growth guidance" }), href: "/articles/mbti-growth-guide" },
      { key: "mbti-narrative", label: localizeText(locale, { zh: "类型叙事画像", en: "Type narrative portrait" }), href: "/articles/mbti-narrative-portrait" },
    ],
  };

  const variantDelta = variant === "a" ? raw.variantDeltaA : raw.variantDeltaT;

  return {
    heroPositioning: localizeText(locale, raw.heroPositioning),
    heroSummary: localizeText(locale, raw.heroSummary),
    heroCoreStrength: localizeText(locale, raw.heroCoreStrength),
    heroRealWorldFriction: localizeText(locale, raw.heroRealWorldFriction),
    heroNextStepHint: localizeText(locale, raw.heroNextStepHint),
    variantDelta: localizeText(locale, variantDelta),
    careerDirection: {
      summary: localizeText(locale, raw.careerDirection.summary),
      strengths: raw.careerDirection.strengths.map((item) => localizeText(locale, item)),
      risks: raw.careerDirection.risks.map((item) => localizeText(locale, item)),
      why: localizeText(locale, raw.careerDirection.why),
      variantDelta: localizeText(locale, variant === "a" ? raw.careerDirection.variantDeltaA : raw.careerDirection.variantDeltaT),
      nextLinks: localizeLinks(locale, raw.careerDirection.nextLinks),
    },
    teamCollaboration: {
      summary: localizeText(locale, raw.teamCollaboration.summary),
      strengths: raw.teamCollaboration.strengths.map((item) => localizeText(locale, item)),
      risks: raw.teamCollaboration.risks.map((item) => localizeText(locale, item)),
      why: localizeText(locale, raw.teamCollaboration.why),
      variantDelta: localizeText(locale, variant === "a" ? raw.teamCollaboration.variantDeltaA : raw.teamCollaboration.variantDeltaT),
      nextLinks: localizeLinks(locale, raw.teamCollaboration.nextLinks),
    },
    growthPlanning: {
      summary: localizeText(locale, raw.growthPlanning.summary),
      strengths: raw.growthPlanning.strengths.map((item) => localizeText(locale, item)),
      risks: raw.growthPlanning.risks.map((item) => localizeText(locale, item)),
      why: localizeText(locale, raw.growthPlanning.why),
      variantDelta: localizeText(locale, variant === "a" ? raw.growthPlanning.variantDeltaA : raw.growthPlanning.variantDeltaT),
      nextLinks: localizeLinks(locale, raw.growthPlanning.nextLinks),
    },
    topicBacklink: localizeLink(locale, raw.topicBacklink),
    recommendationBacklink: localizeLink(locale, raw.recommendationBacklink),
    testEntryLink: localizeLink(locale, raw.testEntryLink),
    linkedGuides: raw.linkedGuides ?? [],
    linkedArticles: raw.linkedArticles ?? [],
  };
}

export function getIntpRecommendationContent(slug: string, locale: Locale): IntpRecommendationRenderCopy | null {
  const variant = resolveIntpVariantFromSlug(slug);
  if (!variant) return null;
  const normalized = slug.toLowerCase();
  if (!normalized.startsWith("intp-")) return null;

  const variantRisk = variant === "a" ? INTP_RECOMMENDATION_COPY_COMMON.variantRiskA : INTP_RECOMMENDATION_COPY_COMMON.variantRiskT;
  const copy = {
    ...INTP_RECOMMENDATION_COPY_COMMON,
    variantRisk,
  };

  return {
    heroSummary: localizeText(locale, copy.heroSummary),
    fitWhy: localizeText(locale, copy.fitWhy),
    costWhy: localizeText(locale, copy.costWhy),
    jobStructure: localizeText(locale, copy.jobStructure),
    variantRisk: localizeText(locale, variantRisk),
    nextSteps: localizeLinks(locale, copy.nextSteps).map((link) => {
      if (link.key === "rec_next_team") {
        return {
          ...link,
          label: locale === "zh" ? `查看 ${variant === "a" ? "INTP-A" : "INTP-T"} 团队协作建议` : `Review ${variant === "a" ? "INTP-A" : "INTP-T"} team collaboration`,
          href: `/personality/intp-${variant}#intp-personality-scene-team`,
        };
      }

      if (link.key === "rec_next_growth") {
        return {
          ...link,
          label: locale === "zh" ? `查看 ${variant === "a" ? "INTP-A" : "INTP-T"} 成长建议` : `Review ${variant === "a" ? "INTP-A" : "INTP-T"} growth guidance`,
          href: `/personality/intp-${variant}#intp-personality-scene-growth`,
        };
      }

      return link;
    }),
    linkedGuides: localizeLinks(locale, copy.linkedGuides),
    linkedArticles: localizeLinks(locale, [
      { key: "rec-guide", label: { zh: "职业匹配指南", en: "Job fit guide" }, href: "/career/guides/from-mbti-to-job-fit" },
      { key: "rec-growth", label: { zh: "成长建议", en: "Growth guidance" }, href: "/articles/mbti-growth-guide" },
    ]),
    topicBacklink: localizeLink(locale, {
      key: "mbti-topic",
      label: INTP_SCENARIO_LINKS.personalityBase.topicBacklink,
      href: INTP_SCENARIO_LINKS.personalityBase.topicBacklink.href,
    }),
  };
}
