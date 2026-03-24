import type { Locale } from "@/lib/i18n/locales";

export type HomePathId = "self" | "career" | "wellbeing";

export type HomeTestId = "mbti" | "big5" | "clinical" | "sds20" | "iq" | "eq";

export type QuickBrowseFilterId =
  | "all"
  | "personality"
  | "career"
  | "wellbeing"
  | "cognitive"
  | "emotion_relationships";

export type RouteKey =
  | "tests"
  | "help"
  | "articles"
  | "mbtiBasics"
  | "business"
  | "mbtiDetail";

export type HeroSectionContent = {
  eyebrow: string;
  title: string;
  supporting: string;
  chips: string[];
  primaryCta: string;
  secondaryCta: string;
  trustStrip: string[];
  visual: {
    summaryTitle: string;
    summaryText: string;
    dimensionsTitle: string;
    dimensions: Array<{
      label: string;
      value: string;
    }>;
    actionsTitle: string;
    actionItems: string[];
  };
};

export type PathCardContent = {
  title: string;
  body: string;
  meta: string;
  cta: string;
};

export type PathSectionContent = {
  title: string;
  supporting: string;
  cards: Record<HomePathId, PathCardContent>;
  recommendationTitle: string;
  featuredLabel: string;
  secondaryLabel: string;
  recommendationPrefix: string;
  allTestsHeading: string;
};

export type PathRecommendation = {
  featured: HomeTestId;
  secondary: HomeTestId[];
  support?: {
    title: string;
    body: string;
    cta: string;
    routeKey: Extract<RouteKey, "help">;
  };
};

export type TestCatalogItem = {
  id: HomeTestId;
  slug: string;
  name: string;
  desc: string;
  filterTags: QuickBrowseFilterId[];
  primaryCta: string;
  secondaryCta: string;
  duration?: string;
};

export type AllTestsQuickBrowse = {
  title: string;
  supporting: string;
  filters: Array<{
    id: QuickBrowseFilterId;
    label: string;
  }>;
};

export type ValueProofCard = {
  title: string;
  body: string;
};

export type ValuePropsContent = {
  eyebrow: string;
  title: string;
  supporting: string;
  cards: ValueProofCard[];
};

export type ReportFeature = {
  title: string;
  body: string;
};

export type ReportPreviewContent = {
  title: string;
  supporting: string;
  features: ReportFeature[];
  primaryCta: string;
  secondaryCta: string;
  mockup: {
    summaryTitle: string;
    summaryText: string;
    dimensionsTitle: string;
    dimensions: Array<{
      label: string;
      value: string;
    }>;
    actionsTitle: string;
    actionItems: string[];
  };
  primaryRoute: Exclude<RouteKey, "help"> | "mbtiDetail";
  secondaryRoute: "help" | "articles";
};

export type UseCaseCard = {
  title: string;
  body: string;
};

export type TestimonialCard = {
  id: string;
  author: string;
  role: string;
  quote: string;
  testLabel: string;
};

export type SocialProofContent = {
  title: string;
  supporting: string;
  ratingTitle: string;
  ratingValue: string;
  ratingBody: string;
  articlesCta: string;
  useCasesTitle: string;
  useCasesSupporting: string;
  useCaseCards: UseCaseCard[];
  testimonials: TestimonialCard[];
};

export type KnowledgeCard = {
  label: string;
  title: string;
  body: string;
  cta: string;
  routeKey: Extract<RouteKey, "help" | "articles" | "mbtiBasics">;
};

export type KnowledgeMethodsContent = {
  title: string;
  supporting: string;
  cards: KnowledgeCard[];
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqContent = {
  title: string;
  items: [FaqItem, FaqItem, FaqItem, FaqItem, FaqItem];
  helpText: string;
  helpLinkText?: string;
};

export type FinalCtaContent = {
  title: string;
  supporting: string;
  primaryCta: string;
  secondaryCta: string;
  enterpriseText: string;
  enterpriseRoute: "business";
};

export type HomepageRouteMap = Record<RouteKey, string>;

export type HomepageContent = {
  locale: Locale;
  hero: HeroSectionContent;
  paths: PathSectionContent;
  testCatalog: TestCatalogItem[];
  pathRecommendations: Record<HomePathId, PathRecommendation>;
  quickBrowse: AllTestsQuickBrowse;
  valueProps: ValuePropsContent;
  reportPreview: ReportPreviewContent;
  socialProof: SocialProofContent;
  knowledge: KnowledgeMethodsContent;
  faq: FaqContent;
  finalCta: FinalCtaContent;
  routes: HomepageRouteMap;
};

export const HOME_CONTENT: Record<Locale, HomepageContent> = {
  zh: {
    locale: "zh",
    hero: {
      eyebrow: "循证测评体系",
      title: "先找到你的问题，再开始正确的测试",
      supporting: "用人格、职业与状态测评，把模糊的自我感觉，变成可解释、可行动的结果。",
      chips: ["我想更了解自己", "我在做职业选择", "我想判断当前状态"],
      primaryCta: "开始测试",
      secondaryCta: "浏览全部测试",
      trustStrip: ["结果可解释", "隐私默认保护", "支持个人与团队"],
      visual: {
        summaryTitle: "结果摘要",
        summaryText: "当前你可能更偏向“讨论与规划导向”，适合先明确职业目标。",
        dimensionsTitle: "维度条",
        dimensions: [
          { label: "外向-内向", value: "E 68%" },
          { label: "感知-判断", value: "P 54%" },
        ],
        actionsTitle: "行动建议",
        actionItems: [
          "先写一条“近7天明显变化”。",
          "再选一个角色关系做复盘。",
          "把结果贴到下周行动清单。",
        ],
      },
    },
    paths: {
      title: "从最接近你的问题开始",
      supporting: "我们先帮你缩小范围，再进入具体测试。",
      recommendationTitle: "推荐测试路径",
      featuredLabel: "主推荐",
      secondaryLabel: "副推荐",
      recommendationPrefix: "为你推荐：",
      allTestsHeading: "全部测评轻量浏览",
      cards: {
        self: {
          title: "认识自己",
          body: "了解人格倾向、关系风格与沟通方式。",
          meta: "推荐：MBTI · Big Five",
          cta: "从人格测试开始",
        },
        career: {
          title: "找方向",
          body: "为职业选择、角色匹配与成长规划找到更清楚的路径。",
          meta: "推荐：Big Five · MBTI · IQ · EQ",
          cta: "查看职业相关测试",
        },
        wellbeing: {
          title: "看状态",
          body: "先判断近期的压力、情绪负荷与自我照顾需求。",
          meta: "推荐：SDS-20 · Clinical Combo",
          cta: "先做状态检测",
        },
      },
    },
    pathRecommendations: {
      self: {
        featured: "mbti",
        secondary: ["big5", "eq"],
      },
      career: {
        featured: "big5",
        secondary: ["mbti", "iq"],
        support: {
          title: "先确认测评边界",
          body: "了解结果用于自我判断与讨论，不替代医疗咨询。",
          cta: "先看帮助中心",
          routeKey: "help",
        },
      },
      wellbeing: {
        featured: "sds20",
        secondary: ["clinical"],
        support: {
          title: "先查看方法边界",
          body: "评估当前支持范围，明确这类测试的适用场景。",
          cta: "查看帮助中心",
          routeKey: "help",
        },
      },
    },
    testCatalog: [
      {
        id: "mbti",
        slug: "mbti-personality-test-16-personality-types",
        name: "MBTI 性格测试",
        desc: "理解性格偏好、沟通风格与更适合的成长路径。",
        filterTags: ["personality", "career", "emotion_relationships"],
        primaryCta: "开始此测试",
        secondaryCta: "查看详情",
        duration: "12 分钟",
      },
      {
        id: "big5",
        slug: "big-five-personality-test-ocean-model",
        name: "大五人格测试",
        desc: "从五大维度理解稳定的人格特征与长期行为倾向。",
        filterTags: ["personality", "career", "emotion_relationships"],
        primaryCta: "开始此测试",
        secondaryCta: "查看详情",
        duration: "10 分钟",
      },
      {
        id: "clinical",
        slug: "clinical-depression-anxiety-assessment-professional-edition",
        name: "抑郁焦虑综合检测",
        desc: "识别近期的心理与情绪负荷，更早看见压力信号。",
        filterTags: ["wellbeing", "career"],
        primaryCta: "开始此测试",
        secondaryCta: "查看详情",
        duration: "8 分钟",
      },
      {
        id: "sds20",
        slug: "depression-screening-test-standard-edition",
        name: "抑郁测评（标准版）",
        desc: "快速检查近期情绪基线与疲劳状态。",
        filterTags: ["wellbeing", "emotion_relationships"],
        primaryCta: "开始此测试",
        secondaryCta: "查看详情",
        duration: "5 分钟",
      },
      {
        id: "iq",
        slug: "iq-test-intelligence-quotient-assessment",
        name: "智商 IQ 测试",
        desc: "了解你的逻辑与空间推理表现。",
        filterTags: ["career", "cognitive"],
        primaryCta: "开始此测试",
        secondaryCta: "查看详情",
        duration: "15 分钟",
      },
      {
        id: "eq",
        slug: "eq-test-emotional-intelligence-assessment",
        name: "情商 EQ 测试",
        desc: "理解自我觉察、共情与情绪管理能力。",
        filterTags: ["emotion_relationships", "career"],
        primaryCta: "开始此测试",
        secondaryCta: "查看详情",
        duration: "14 分钟",
      },
    ],
    quickBrowse: {
      title: "全部测评，按方向浏览",
      supporting: "如果你已经知道要找什么，可以直接进入具体测试。",
      filters: [
        { id: "all", label: "全部测评" },
        { id: "personality", label: "人格测评" },
        { id: "career", label: "职业相关" },
        { id: "wellbeing", label: "状态筛查" },
        { id: "cognitive", label: "认知能力" },
        { id: "emotion_relationships", label: "情绪与关系" },
      ],
    },
    valueProps: {
      eyebrow: "为什么信任",
      title: "为什么大家愿意把第一份测试交给 Fermat",
      supporting: "我们关注的不是给你一个标签，而是给你一份可以被解释、被复盘、被使用的结果。",
      cards: [
        { title: "透明评分逻辑", body: "结果可解释、可复核，不是只有一个标签。" },
        { title: "隐私默认保护", body: "最小化数据采集，匿名标识与同意机制优先。" },
        {
          title: "为完成而设计",
          body: "面向个人、教练与团队的高完成率流程体验。",
        },
      ],
    },
    reportPreview: {
      title: "你拿到的不只是分数，而是一份可使用的结果",
      supporting: "先看结论，再看结构，再把结果转成下一步行动。",
      features: [
        { title: "结果摘要", body: "先看结论，再看重点。" },
        { title: "维度解释", body: "知道为什么会这样，而不只是看到一个标签。" },
        { title: "行动建议", body: "把结果转成职业、沟通与成长的下一步。" },
      ],
      mockup: {
        summaryTitle: "结果摘要",
        summaryText: "核心倾向：偏向结构化决策与关系协作的成长路径。",
        dimensionsTitle: "维度解释",
        dimensions: [
          { label: "外向-内向", value: "38% 偏向外向" },
          { label: "感知-判断", value: "54% 偏向判断" },
          { label: "情绪表达", value: "61% 倾向稳定" },
        ],
        actionsTitle: "行动建议",
        actionItems: [
          "先选 3 条可执行建议。",
          "为下周目标绑定一项测评结论。",
          "与团队共享结果后再补充讨论。",
        ],
      },
      primaryCta: "了解结果结构",
      secondaryCta: "查看帮助中心",
      primaryRoute: "mbtiDetail",
      secondaryRoute: "help",
    },
      socialProof: {
        title: "真实用户如何使用这些结果",
        supporting: "从个人探索到团队讨论，结果的价值在于它能被拿来使用。",
      ratingTitle: "综合评分",
        ratingValue: "4.8 / 5",
        ratingBody: "来自真实用户与推荐方的公开反馈",
        articlesCta: "查看全部文章",
        useCasesTitle: "谁在使用 Fermat",
        useCasesSupporting: "不是只做一次测试，而是把结果带进讨论、辅导与决策。",
      useCaseCards: [
          { title: "个人探索", body: "认识自己、做决定、做复盘。" },
          { title: "教练 / 导师", body: "快速建立共同语言，把特质结果转成下一步讨论。" },
          { title: "团队 / People Ops", body: "用于沟通复盘、角色理解与协作反馈。" },
          { title: "企业 / 组织", body: "用于培训、团队对话与人才发展场景入口。" },
        ],
        testimonials: [
          {
            id: "review_1",
            author: "陈昕",
            role: "产品经理",
            quote: "结构很清晰，生成的结论能直接用于团队讨论，效率比我以前看报告快很多。",
            testLabel: "Big Five 测试",
          },
          {
            id: "review_2",
            author: "高铭",
            role: "职业教练",
            quote: "客户完成得很快，结果能直接映射到行动目标，不会停留在“知道了”这一层。",
            testLabel: "MBTI 测试",
          },
          {
            id: "review_3",
            author: "李珂",
            role: "团队负责人",
            quote: "报告语言容易统一团队理解，尤其在角色分工和沟通复盘时非常好用。",
            testLabel: "SDS-20 结果",
          },
        {
            id: "review_4",
            author: "王琛",
            role: "运营分析师",
            quote: "没有复杂界面，没有无效留白，能快速拿到能执行的结论。",
            testLabel: "抑郁筛查（标准版）",
          },
        ],
      },
    knowledge: {
      title: "在开始之前，先理解方法与边界",
      supporting: "不只是做测试，也要读懂测试。",
      cards: [
        {
          label: "工具说明",
          title: "工具说明",
          body: "这份测评测什么，不测什么。",
          cta: "查看帮助中心",
          routeKey: "help",
        },
        {
          label: "成长引导",
          title: "成长引导",
          body: "如何把结果变成下一步，而不只停在‘知道了’。",
          cta: "浏览全部文章",
          routeKey: "articles",
        },
        {
          label: "MBTI Basics",
          title: "MBTI Basics",
          body: "给第一次接触人格测评的人，一份更稳妥的起点。",
          cta: "阅读 MBTI Basics",
          routeKey: "mbtiBasics",
        },
      ],
    },
    faq: {
      title: "常见问题",
      helpText: "前往帮助中心查看更多问题",
      helpLinkText: "前往帮助中心",
      items: [
        {
          question: "测试需要多久？",
          answer:
            "不同测试时长不同，开始前会在测试卡片或详情页明确显示。第一次进入，优先选择与你当前问题最接近的那项。",
        },
        {
          question: "结果是否免费？",
          answer:
            "开始前会清楚说明哪些内容可直接查看，哪些属于扩展内容；不要把不确定的收费信息写成绝对承诺。",
        },
        {
          question: "是否匿名？",
          answer:
            "默认以最小化数据采集与匿名标识优先；如需登录、保存或后续服务，会在对应环节明确提示。",
        },
        {
          question: "报告包含什么？",
          answer: "通常包含结果摘要、维度解释，以及进一步阅读或行动入口。具体结构以测试类型为准。",
        },
        {
          question: "临床类是否等于诊断？",
          answer:
            "不是。临床相关测评用于自我观察与风险识别，不能替代专业诊断或治疗建议。",
        },
      ],
    },
    finalCta: {
      title: "从最适合你的那一项开始",
      supporting: "不知道该选哪项也没关系，先从问题入口进入，我们会帮你缩小范围。",
      primaryCta: "开始测试",
      secondaryCta: "浏览全部测试",
      enterpriseText: "为团队使用？查看企业版",
      enterpriseRoute: "business",
    },
    routes: {
      tests: "/tests",
      help: "/help",
      articles: "/articles",
      mbtiBasics: "/articles/mbti-basics",
      business: "/business",
      mbtiDetail: "/tests/mbti-personality-test-16-personality-types",
    },
  },
  en: {
    locale: "en",
    hero: {
      eyebrow: "Evidence-based assessments",
      title: "Start with the right test for the question you’re actually trying to answer",
      supporting:
        "Use personality, career, and wellbeing assessments to turn vague self-perception into interpretable, actionable results.",
      chips: [
        "I want to understand myself better",
        "I’m making a career decision",
        "I want to check my current state",
      ],
      primaryCta: "Start a test",
      secondaryCta: "Browse all tests",
      trustStrip: ["Interpretable results", "Privacy by default", "Built for individuals and teams"],
      visual: {
        summaryTitle: "Result summary",
        summaryText: "You may currently have a stronger tendency toward planning and collaboration, so clarify your next concrete goal first.",
        dimensionsTitle: "Dimension bars",
        dimensions: [
          { label: "Extraversion - Introversion", value: "E 68%" },
          { label: "Perception - Judgment", value: "P 54%" },
        ],
        actionsTitle: "Action suggestions",
        actionItems: [
          "Write down one clearly changed behavior in the last 7 days.",
          "Pick one role relationship to review.",
          "Attach one result signal to your weekly action plan.",
        ],
      },
    },
    paths: {
      title: "Start with the question that feels most like yours",
      supporting: "Narrow the path first, then choose the specific assessment.",
      recommendationTitle: "Recommended test path",
      featuredLabel: "Featured",
      secondaryLabel: "Secondary",
      recommendationPrefix: "Recommended path: ",
      allTestsHeading: "All tests quick browse",
      cards: {
        self: {
          title: "Know yourself",
          body: "Understand personality patterns, relationship style, and the way you communicate.",
          meta: "Recommended: MBTI · Big Five",
          cta: "Start with personality tests",
        },
        career: {
          title: "Find direction",
          body: "Get clearer signals for career decisions, role fit, and growth planning.",
          meta: "Recommended: Big Five · MBTI · IQ · EQ",
          cta: "See career-related tests",
        },
        wellbeing: {
          title: "Check your current state",
          body: "Look at recent stress, emotional load, and what kind of support you may need.",
          meta: "Recommended: SDS-20 · Clinical Combo",
          cta: "Start with a wellbeing check",
        },
      },
    },
    pathRecommendations: {
      self: {
        featured: "mbti",
        secondary: ["big5", "eq"],
      },
      career: {
        featured: "big5",
        secondary: ["mbti", "iq"],
        support: {
          title: "Review the boundary first",
          body: "Understand where test interpretations can help and when to seek professional support.",
          cta: "Read Help Center",
          routeKey: "help",
        },
      },
      wellbeing: {
        featured: "sds20",
        secondary: ["clinical"],
        support: {
          title: "Check test boundaries",
          body: "Know where this result is useful, and what it does not cover as a clinical diagnosis.",
          cta: "Read Help Center",
          routeKey: "help",
        },
      },
    },
    testCatalog: [
      {
        id: "mbti",
        slug: "mbti-personality-test-16-personality-types",
        name: "MBTI Personality Test",
        desc: "Understand personality preferences, communication style, and a growth path that fits you better.",
        filterTags: ["personality", "career", "emotion_relationships"],
        primaryCta: "Start this test",
        secondaryCta: "View details",
        duration: "Approx. 12 min",
      },
      {
        id: "big5",
        slug: "big-five-personality-test-ocean-model",
        name: "Big Five Personality Test",
        desc: "See stable personality traits and long-term behavioral tendencies across five dimensions.",
        filterTags: ["personality", "career", "emotion_relationships"],
        primaryCta: "Start this test",
        secondaryCta: "View details",
        duration: "Approx. 10 min",
      },
      {
        id: "clinical",
        slug: "clinical-depression-anxiety-assessment-professional-edition",
        name: "Depression & Anxiety Combo",
        desc: "Identify recent emotional load and notice pressure signals earlier.",
        filterTags: ["wellbeing", "career"],
        primaryCta: "Start this test",
        secondaryCta: "View details",
        duration: "Approx. 8 min",
      },
      {
        id: "sds20",
        slug: "depression-screening-test-standard-edition",
        name: "Depression Screening (Standard)",
        desc: "Quickly check your recent emotional baseline and fatigue state.",
        filterTags: ["wellbeing", "emotion_relationships"],
        primaryCta: "Start this test",
        secondaryCta: "View details",
        duration: "Approx. 5 min",
      },
      {
        id: "iq",
        slug: "iq-test-intelligence-quotient-assessment",
        name: "IQ Test",
        desc: "Understand your logical and spatial reasoning performance.",
        filterTags: ["career", "cognitive"],
        primaryCta: "Start this test",
        secondaryCta: "View details",
        duration: "Approx. 15 min",
      },
      {
        id: "eq",
        slug: "eq-test-emotional-intelligence-assessment",
        name: "EQ Test",
        desc: "Understand self-awareness, empathy, and emotional regulation.",
        filterTags: ["emotion_relationships", "career"],
        primaryCta: "Start this test",
        secondaryCta: "View details",
        duration: "Approx. 14 min",
      },
    ],
    quickBrowse: {
      title: "All assessments, browsed by direction",
      supporting: "If you already know what you’re looking for, jump straight into a specific assessment.",
      filters: [
        { id: "all", label: "All" },
        { id: "personality", label: "Personality" },
        { id: "career", label: "Career" },
        { id: "wellbeing", label: "Wellbeing" },
        { id: "cognitive", label: "Cognitive" },
        { id: "emotion_relationships", label: "Emotion & relationships" },
      ],
    },
    valueProps: {
      eyebrow: "Why people trust us",
      title: "Why people trust Fermat with their first test",
      supporting:
        "We’re not trying to hand out labels. We’re trying to give you a result that can be interpreted, discussed, and used.",
      cards: [
        {
          title: "Transparent scoring logic",
          body: "Results should be interpretable and reviewable, not just a label.",
        },
        {
          title: "Privacy by default",
          body: "Minimal data collection, anonymous identifiers, and explicit consent first.",
        },
        {
          title: "Designed for completion",
          body: "Flows shaped for individuals, coaches, and teams to actually finish.",
        },
      ],
    },
    reportPreview: {
      title: "You get more than a score — you get a result you can use",
      supporting:
        "Start with the conclusion, understand the structure, then turn it into a next step.",
      features: [
        { title: "Result summary", body: "See the conclusion first, then the important signals." },
        {
          title: "Dimension breakdown",
          body: "Understand why the result looks the way it does — not just the label.",
        },
        { title: "Action guidance", body: "Turn the result into the next step for career, communication, and growth." },
      ],
      mockup: {
        summaryTitle: "Result summary",
        summaryText: "Core tendency: a structured, growth-oriented decision and collaboration path.",
        dimensionsTitle: "Dimension breakdown",
        dimensions: [
          { label: "Extraversion - Introversion", value: "38% Extraversion" },
          { label: "Perception - Judgment", value: "54% Judging" },
          { label: "Emotional regulation", value: "61% Balanced" },
        ],
        actionsTitle: "Action guidance",
        actionItems: [
          "Pick three actions you can execute this week.",
          "Tie the finding to one concrete goal.",
          "Discuss the result with your team before moving on.",
        ],
      },
      primaryCta: "See result structure",
      secondaryCta: "Visit Help Center",
      primaryRoute: "mbtiDetail",
      secondaryRoute: "help",
    },
      socialProof: {
        title: "How real users use these results",
        supporting:
          "From personal exploration to team discussion, a result matters when people can actually use it.",
        ratingTitle: "Overall rating",
      ratingValue: "4.8 / 5",
      ratingBody: "Based on real user and recommender feedback",
      articlesCta: "Browse all articles",
      useCasesTitle: "Who uses Fermat",
      useCasesSupporting:
        "This is not just about taking a test once. It’s about bringing the result into reflection, coaching, and decisions.",
      useCaseCards: [
        {
          title: "Individual exploration",
          body: "Know yourself, make decisions, and reflect with more structure.",
        },
        {
          title: "Coaches / mentors",
          body: "Create shared language quickly and turn trait breakdowns into next-step conversations.",
        },
        {
          title: "Teams / People Ops",
          body: "Use results for communication retros, role understanding, and collaboration feedback.",
        },
        {
          title: "Organizations",
          body: "Use them in training, team dialogue, and talent development contexts.",
        },
      ],
      testimonials: [
        {
          id: "review_1",
          author: "A. Chen",
          role: "Product Manager",
          quote: "The structure is clear and the final explanation is practical enough to discuss with my team immediately.",
          testLabel: "Big Five test",
        },
        {
          id: "review_2",
          author: "M. Carter",
          role: "Career Coach",
          quote: "Clients finish it quickly and we can directly use the trait breakdown to plan next actions.",
          testLabel: "MBTI test",
        },
        {
          id: "review_3",
          author: "S. Li",
          role: "Team Lead",
          quote:
            "The report language is easy to align around, especially for communication and role-fit discussions.",
          testLabel: "SDS-20 result",
        },
        {
          id: "review_4",
          author: "R. Gomez",
          role: "Operations Analyst",
          quote: "I like the no-friction flow and the way it keeps focus on useful decisions rather than labels.",
          testLabel: "Depression screening",
        },
      ],
    },
    knowledge: {
      title: "Before you start, understand the method and the boundary",
      supporting: "Taking a test is only part of the experience. Understanding it matters too.",
      cards: [
        {
          label: "How it works",
          title: "How the tool works",
          body: "What the assessment is designed to measure — and what it is not.",
          cta: "Visit Help Center",
          routeKey: "help",
        },
        {
          label: "Growth guidance",
          title: "Growth guidance",
          body: "How to turn the result into a next step instead of stopping at now I know.",
          cta: "Browse all articles",
          routeKey: "articles",
        },
        {
          label: "MBTI Basics",
          title: "MBTI Basics",
          body: "A steadier starting point for people new to personality assessments.",
          cta: "Read MBTI Basics",
          routeKey: "mbtiBasics",
        },
      ],
    },
    faq: {
      title: "FAQ",
      helpText: "Visit Help Center for more questions",
      helpLinkText: "Visit Help Center",
      items: [
        {
          question: "How long do the tests take?",
          answer:
            "Different tests take different amounts of time. Show the duration clearly on the card or detail page before the user starts.",
        },
        {
          question: "Are the results free?",
          answer:
            "Make it clear before starting which parts are directly viewable and which are extended content. Do not make absolute promises you cannot support.",
        },
        {
          question: "Is it anonymous?",
          answer:
            "Default to minimal data collection and anonymous identifiers first. If login, saving, or follow-up service is required, state it clearly at that step.",
        },
        {
          question: "What does the report include?",
          answer:
            "Usually a result summary, dimension breakdown, and further reading or action entry points. The exact structure depends on the assessment type.",
        },
        {
          question: "Are clinical assessments the same as a diagnosis?",
          answer:
            "No. Clinical-style assessments are for self-observation and risk awareness. They do not replace diagnosis or treatment advice.",
        },
      ],
    },
    finalCta: {
      title: "Start with the one that fits your question best",
      supporting:
        "If you’re not sure where to begin, start from the problem path and let us narrow the choice down for you.",
      primaryCta: "Start a test",
      secondaryCta: "Browse all tests",
      enterpriseText: "Using this for a team? See Business",
      enterpriseRoute: "business",
    },
    routes: {
      tests: "/tests",
      help: "/help",
      articles: "/articles",
      mbtiBasics: "/articles/mbti-basics",
      business: "/business",
      mbtiDetail: "/tests/mbti-personality-test-16-personality-types",
    },
  },
};

export function getHomepageContent(locale: Locale): HomepageContent {
  return HOME_CONTENT[locale];
}
