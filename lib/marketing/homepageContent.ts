import type { Locale } from "@/lib/i18n/locales";

export type HomeLinkItem = {
  title: string;
  description?: string;
  href: string;
  label?: string;
  hints?: string[];
};

type HomeFamily = {
  title: string;
  description: string;
  exploreLabel: string;
  exploreHref: string;
  links: HomeLinkItem[];
};

type HomeResultPreview = {
  eyebrow: string;
  title: string;
  summary: string;
  metrics: string[];
  tone: "traits" | "career" | "state";
};

type HomeTrustItem = {
  title: string;
  summary: string;
  paragraphs: string[];
  href?: string;
  hrefLabel?: string;
};

type HomeResource = {
  title: string;
  description: string;
  href: string;
  typeLabel: string;
};

type HomeFooterGroup = {
  title: string;
  links: Array<{ label: string; href: string }>;
};

type HomeLocaleContent = {
  hero: {
    eyebrow: string;
    brand: string;
    title: string;
    body: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
    trustRail: string[];
    visualEyebrow: string;
    visualTitle: string;
    visualSummary: string;
    visualPoints: string[];
  };
  quickStart: {
    kicker: string;
    title: string;
    body: string;
    items: HomeLinkItem[];
  };
  families: {
    kicker: string;
    title: string;
    body: string;
    items: HomeFamily[];
  };
  results: {
    kicker: string;
    title: string;
    body: string;
    previews: HomeResultPreview[];
    valuePoints: string[];
  };
  trust: {
    kicker: string;
    title: string;
    body: string;
    items: HomeTrustItem[];
  };
  resources: {
    kicker: string;
    title: string;
    body: string;
    items: HomeResource[];
  };
  finalCta: {
    title: string;
    body: string;
    primaryCta: string;
    primaryHref: string;
    secondaryCta: string;
    secondaryHref: string;
  };
  header: {
    testsLabel: string;
    testsTitle: string;
    testsBody: string;
    browseAllLabel: string;
    browseAllHref: string;
    groups: Array<{ title: string; links: HomeLinkItem[] }>;
  };
  footer: {
    groups: HomeFooterGroup[];
    supportEmailLabel: string;
    tailnote: string;
  };
  seo: {
    title: string;
    description: string;
    quickStartListTitle: string;
    quickStartListDescription: string;
    familyListTitle: string;
    familyListDescription: string;
    organizationDescription: string;
  };
};

const HOME_PAGE_CONTENT: Record<Locale, HomeLocaleContent> = {
  zh: {
    hero: {
      eyebrow: "识微，见远。",
      brand: "FermatMind / 费马测试",
      title: "更清晰地理解自己，让学习、职业与协作判断直接进入下一步。",
      body: "通过结构化测评与结果解释，把模糊感受整理成下一步判断参考。",
      primaryCta: "开始免费测评",
      primaryHref: "/tests",
      secondaryCta: "浏览测评入口",
      secondaryHref: "#home-quick-start",
      trustRail: ["免费开始", "约 15 分钟", "匿名可用", "结果支持判断，不定义一个人"],
      visualEyebrow: "结果预览",
      visualTitle: "从一个问题进入同一张结果面。",
      visualSummary: "入口、结构和下一步，在一张成熟的测评产品界面里连成一体。",
      visualPoints: ["特质结构", "方向线索", "状态解释"],
    },
    quickStart: {
      kicker: "Quick Start",
      title: "从你现在的问题直接开始。",
      body: "五个高意图入口，直接进入对应测评。",
      items: [
        {
          title: "我适合什么职业方向？",
          description: "先缩小方向，再看更值得继续探索的路径。",
          href: "/tests/category/career",
          label: "立即开始",
          hints: ["霍兰德", "Big Five 90Q", "MBTI 93Q"],
        },
        {
          title: "我的人格结构是什么？",
          description: "先看偏好与稳定特质，再决定读哪一版结果。",
          href: "/tests/category/personality",
          label: "立即开始",
          hints: ["MBTI 93Q", "MBTI 144Q", "Big Five 90Q"],
        },
        {
          title: "我现在的情绪或状态如何？",
          description: "先确认近期基线，再决定是否继续深入。",
          href: "/tests/depression-screening-test-standard-edition/take",
          label: "立即开始",
          hints: ["SDS-20", "抑郁焦虑", "状态基线"],
        },
        {
          title: "我的认知能力与优势在哪里？",
          description: "把能力线索放回学习与职业判断里看。",
          href: "/tests/iq-test-intelligence-quotient-assessment/take",
          label: "立即开始",
          hints: ["IQ 测评", "推理准备度", "能力线索"],
        },
        {
          title: "我在人际、协作与关系中是什么风格？",
          description: "从沟通、反馈与协作方式进入。",
          href: "/tests/eq-test-emotional-intelligence-assessment/take",
          label: "立即开始",
          hints: ["EQ", "沟通风格", "关系判断"],
        },
      ],
    },
    families: {
      kicker: "Featured Paths",
      title: "按家族浏览，找到更接近的问题域。",
      body: "当你知道方向、还没锁定具体测评时，从这里进入。",
      items: [
        {
          title: "人格与风格",
          description: "偏好、稳定倾向与表达方式。",
          exploreLabel: "浏览此类",
          exploreHref: "/tests/category/personality",
          links: [
            { title: "MBTI 性格测试", href: "/tests/mbti-personality-test-16-personality-types", description: "93Q / 144Q 双版本" },
            { title: "大五人格测试", href: "/tests/big-five-personality-test-ocean-model", description: "90Q / 120Q 双版本" },
            { title: "人格画像", href: "/personality" },
          ],
        },
        {
          title: "职业与方向",
          description: "把自我理解转成专业、岗位与长期路径判断。",
          exploreLabel: "浏览此类",
          exploreHref: "/tests/category/career",
          links: [
            { title: "职业兴趣测试", href: "/career/tests/riasec" },
            { title: "职业推荐", href: "/career/recommendations" },
            { title: "职业发展指南", href: "/career/guides" },
          ],
        },
        {
          title: "情绪与状态",
          description: "先看近期状态，再决定是否继续深入。",
          exploreLabel: "浏览此类",
          exploreHref: "/tests",
          links: [
            { title: "抑郁筛查", href: "/tests/depression-screening-test-standard-edition/take" },
            { title: "抑郁焦虑综合测评", href: "/tests/clinical-depression-anxiety-assessment-professional-edition/take" },
            { title: "帮助中心", href: "/help/faq" },
          ],
        },
        {
          title: "认知与能力",
          description: "推理、抽象与能力线索。",
          exploreLabel: "浏览此类",
          exploreHref: "/tests",
          links: [
            { title: "IQ 测评", href: "/tests/iq-test-intelligence-quotient-assessment/take" },
            { title: "职业测试", href: "/career/tests" },
            { title: "职业推荐中心", href: "/career/recommendations" },
          ],
        },
        {
          title: "关系与协作",
          description: "沟通、反馈与合作模式。",
          exploreLabel: "浏览此类",
          exploreHref: "/tests",
          links: [
            { title: "EQ 测评", href: "/tests/eq-test-emotional-intelligence-assessment/take" },
            { title: "ENTJ 人格", href: "/personality/entj" },
            { title: "ENFJ 人格", href: "/personality/enfj" },
          ],
        },
      ],
    },
    results: {
      kicker: "Results Preview",
      title: "结果不是终点，它把判断往前推一步。",
      body: "先看结果会把什么带回来。",
      previews: [
        {
          eyebrow: "特质结构图预览",
          title: "把稳定倾向看成结构，而不是单一标签。",
          summary: "在一个页面里看到维度分布、强弱轴与场景差异。",
          metrics: ["开放性", "尽责性", "外向能量"],
          tone: "traits",
        },
        {
          eyebrow: "职业方向预览",
          title: "把适配方向缩小到更值得继续看的范围。",
          summary: "把角色偏好、环境偏好和下一步阅读放在同一张结果面里。",
          metrics: ["角色匹配", "环境偏好", "下一步阅读"],
          tone: "career",
        },
        {
          eyebrow: "状态解释预览",
          title: "先看基线，再决定要不要进一步支持。",
          summary: "结果会给出状态解释、风险提醒与更稳的下一步建议。",
          metrics: ["情绪基线", "压力信号", "支持建议"],
          tone: "state",
        },
      ],
      valuePoints: [
        "看见结构，而不是只看到标签",
        "把结果放回学习、职业与协作场景",
        "帮你决定下一步，而不是替你定义人生",
      ],
    },
    trust: {
      kicker: "Trust & Boundaries",
      title: "值得信任的部分，说清楚；边界，也说清楚。",
      body: "方法、边界、隐私和使用场景，都公开说明。",
      items: [
        {
          title: "方法依据",
          summary: "基于结构化问卷、可读报告与持续校准，帮助你看懂结果从哪里来。",
          paragraphs: [
            "FermatMind 采用结构化问卷与清晰解释路径，让结果更容易被理解、讨论和回看。",
            "我们持续审查题项表达、完成体验与解释口径，优先修正会影响判断质量的部分。",
          ],
          href: "/help/about",
          hrefLabel: "查看方法说明",
        },
        {
          title: "结果边界",
          summary: "结果用于支持判断，不替代临床诊断，也不承诺确定性人生答案。",
          paragraphs: [
            "它更适合用于自我理解、学习方向、职业探索与协作讨论，而不是替代专业医疗或心理支持。",
            "我们避免把分数或类型包装成绝对真理，也不会让一个结果代替对人的完整理解。",
          ],
        },
        {
          title: "隐私与匿名",
          summary: "可以匿名开始；结果默认面向本人；隐私政策与支持渠道始终公开可见。",
          paragraphs: [
            "我们遵循最小必要原则处理数据，用于生成报告、保障稳定性与做脱敏质量优化。",
            "涉及隐私、条款与数据处理的细节，都通过公开页面明确说明。",
          ],
          href: "/privacy",
          hrefLabel: "查看隐私政策",
        },
        {
          title: "使用场景",
          summary: "适合用在学习方向、职业规划、成长复盘、团队沟通与关系判断等真实问题里。",
          paragraphs: [
            "常见使用场景包括个人自我认知、成长规划、教练或工作坊准备，以及团队沟通复盘。",
            "当问题更敏感或风险更高时，我们会采用更保守的表达和更明确的使用边界。",
          ],
          href: "/help/used-and-mentioned",
          hrefLabel: "查看使用场景",
        },
      ],
    },
    resources: {
      kicker: "Resources",
      title: "需要多看一点时，再从这里继续。",
      body: "只保留少量补充阅读，主动作仍然是开始测评。",
      items: [
        {
          title: "MBTI 入门",
          description: "理解 MBTI 的基础框架、使用边界与报告阅读方式。",
          href: "/articles/mbti-basics",
          typeLabel: "文章",
        },
        {
          title: "职业发展指南",
          description: "把测评结果放回专业选择、岗位探索与长期发展语境。",
          href: "/career/guides",
          typeLabel: "指南",
        },
        {
          title: "关于 FermatMind",
          description: "查看产品定位、方法原则、使用边界与团队说明。",
          href: "/help/about",
          typeLabel: "说明",
        },
      ],
    },
    finalCta: {
      title: "从一个问题开始。",
      body: "先进入测评入口，再选最适合当下问题的版本。",
      primaryCta: "开始免费测评",
      primaryHref: "/tests",
      secondaryCta: "浏览测评入口",
      secondaryHref: "/tests",
    },
    header: {
      testsLabel: "测评入口",
      testsTitle: "先从一个你最想回答的问题开始。",
      testsBody: "职业方向、人格结构、情绪状态和协作风格，都从这里进入。",
      browseAllLabel: "查看全部测评",
      browseAllHref: "/tests",
      groups: [
        {
          title: "按问题开始",
          links: [
            { title: "职业方向", description: "职业兴趣与路径探索", href: "/career/tests/riasec" },
            { title: "人格结构", description: "MBTI 与大五双版本", href: "/tests/category/personality" },
            { title: "情绪状态", description: "先看近期基线", href: "/tests/depression-screening-test-standard-edition/take" },
            { title: "协作风格", description: "沟通与关系判断", href: "/tests/eq-test-emotional-intelligence-assessment/take" },
          ],
        },
        {
          title: "热门测评",
          links: [
            { title: "MBTI 性格测试", description: "93Q / 144Q", href: "/tests/mbti-personality-test-16-personality-types" },
            { title: "大五人格测试", description: "90Q / 120Q", href: "/tests/big-five-personality-test-ocean-model" },
            { title: "抑郁筛查", href: "/tests/depression-screening-test-standard-edition/take" },
            { title: "IQ 测评", href: "/tests/iq-test-intelligence-quotient-assessment/take" },
          ],
        },
        {
          title: "继续浏览",
          links: [
            { title: "全部测试", href: "/tests" },
            { title: "人格画像", href: "/personality" },
            { title: "职业发展中心", href: "/career" },
            { title: "帮助中心", href: "/help" },
          ],
        },
      ],
    },
    footer: {
      groups: [
        {
          title: "热门测评",
          links: [
            { label: "MBTI 性格测试", href: "/tests/mbti-personality-test-16-personality-types" },
            { label: "大五人格测试", href: "/tests/big-five-personality-test-ocean-model" },
            { label: "抑郁筛查", href: "/tests/depression-screening-test-standard-edition" },
          ],
        },
        {
          title: "分类",
          links: [
            { label: "全部测试", href: "/tests" },
            { label: "人格与风格", href: "/tests/category/personality" },
            { label: "职业与方向", href: "/tests/category/career" },
          ],
        },
        {
          title: "资源",
          links: [
            { label: "MBTI 入门", href: "/articles/mbti-basics" },
            { label: "职业发展指南", href: "/career/guides" },
            { label: "帮助中心", href: "/help" },
          ],
        },
        {
          title: "支持与政策",
          links: [
            { label: "隐私政策", href: "/privacy" },
            { label: "服务条款", href: "/terms" },
            { label: "联系支持", href: "/help/contact" },
          ],
        },
      ],
      supportEmailLabel: "支持邮箱",
      tailnote: "识微，见远。See the Micro. Lead the Macro.",
    },
    seo: {
      title: "FermatMind / 费马测试",
      description: "费马测试是一个面向自我理解、学习、职业方向与协作判断的结构化测评产品。先从测评入口开始，再用结果支持更清晰的下一步判断。",
      quickStartListTitle: "费马测试首页快速开始入口",
      quickStartListDescription: "按用户问题组织的首页入口，包括职业方向、人格结构、情绪状态、认知能力与协作风格。",
      familyListTitle: "费马测试测评家族入口",
      familyListDescription: "首页可见的测评家族导航，覆盖人格与风格、职业与方向、情绪与状态、认知与能力以及关系与协作。",
      organizationDescription: "FermatMind / 费马测试提供用于自我理解、学习、职业方向与协作判断的结构化测评与解释内容。",
    },
  },
  en: {
    hero: {
      eyebrow: "See the Micro. Lead the Macro.",
      brand: "FermatMind",
      title: "Understand yourself more clearly, then move learning, career, and collaboration decisions into the next step.",
      body: "Use structured assessments and result interpretation to turn vague feeling into a next-step reference.",
      primaryCta: "Start a free assessment",
      primaryHref: "/tests",
      secondaryCta: "Browse assessment entry points",
      secondaryHref: "#home-quick-start",
      trustRail: ["Free to start", "About 15 minutes", "Anonymous available", "Results support judgment, not identity"],
      visualEyebrow: "Results preview",
      visualTitle: "Move from one question into one result surface.",
      visualSummary: "Entry choice, structure, and next move hold together inside one mature assessment surface.",
      visualPoints: ["Trait structure", "Direction cues", "State interpretation"],
    },
    quickStart: {
      kicker: "Quick Start",
      title: "Start directly from the question in front of you.",
      body: "Five high-intent entry points. Go straight into the right assessment.",
      items: [
        {
          title: "What career direction fits me best?",
          description: "Narrow the direction first, then focus on the paths worth exploring.",
          href: "/career/tests/riasec",
          label: "Start now",
          hints: ["Holland Code", "Values", "Career style"],
        },
        {
          title: "What does my personality structure look like?",
          description: "See preferences and stable traits first, then choose the right report depth.",
          href: "/tests/category/personality",
          label: "Start now",
          hints: ["MBTI 93Q", "MBTI 144Q", "Big Five 90Q"],
        },
        {
          title: "How is my current emotional state?",
          description: "Check the recent baseline first, then decide whether to go deeper.",
          href: "/tests/depression-screening-test-standard-edition/take",
          label: "Start now",
          hints: ["SDS-20", "Mood baseline", "Support signals"],
        },
        {
          title: "Where are my cognitive strengths and ability signals?",
          description: "Bring ability cues back into learning and career judgment.",
          href: "/tests/iq-test-intelligence-quotient-assessment/take",
          label: "Start now",
          hints: ["IQ", "Reasoning", "Ability cues"],
        },
        {
          title: "How do I show up in relationships and collaboration?",
          description: "Start from communication, feedback, and collaboration style.",
          href: "/tests/eq-test-emotional-intelligence-assessment/take",
          label: "Start now",
          hints: ["EQ", "Communication", "Relating style"],
        },
      ],
    },
    families: {
      kicker: "Featured Paths",
      title: "Browse by family when you already know the domain.",
      body: "When the direction is clear but the exact test is not, start here.",
      items: [
        {
          title: "Personality and style",
          description: "Preferences, stable tendencies, and expression style.",
          exploreLabel: "Browse this family",
          exploreHref: "/tests/category/personality",
          links: [
            { title: "MBTI personality test", href: "/tests/mbti-personality-test-16-personality-types" },
            { title: "Big Five personality test", href: "/tests/big-five-personality-test-ocean-model" },
            { title: "Personality profiles", href: "/personality" },
          ],
        },
        {
          title: "Career and direction",
          description: "Turn self-understanding into field, role, and long-range direction judgment.",
          exploreLabel: "Browse this family",
          exploreHref: "/tests/category/career",
          links: [
            { title: "Career interest test", href: "/career/tests/riasec" },
            { title: "Career recommendations", href: "/career/recommendations" },
            { title: "Career guides", href: "/career/guides" },
          ],
        },
        {
          title: "Emotion and state",
          description: "Check current baseline and decide whether to go deeper.",
          exploreLabel: "Browse this family",
          exploreHref: "/tests",
          links: [
            { title: "Depression screening", href: "/tests/depression-screening-test-standard-edition/take" },
            { title: "Depression and anxiety assessment", href: "/tests/clinical-depression-anxiety-assessment-professional-edition/take" },
            { title: "Help center", href: "/help/faq" },
          ],
        },
        {
          title: "Cognition and ability",
          description: "Reasoning, abstraction, and ability cues.",
          exploreLabel: "Browse this family",
          exploreHref: "/tests",
          links: [
            { title: "IQ assessment", href: "/tests/iq-test-intelligence-quotient-assessment/take" },
            { title: "Career tests", href: "/career/tests" },
            { title: "Career recommendation center", href: "/career/recommendations" },
          ],
        },
        {
          title: "Relationships and collaboration",
          description: "Communication, feedback, and collaboration patterns.",
          exploreLabel: "Browse this family",
          exploreHref: "/tests",
          links: [
            { title: "EQ assessment", href: "/tests/eq-test-emotional-intelligence-assessment/take" },
            { title: "ENTJ personality", href: "/personality/entj" },
            { title: "ENFJ personality", href: "/personality/enfj" },
          ],
        },
      ],
    },
    results: {
      kicker: "Results Preview",
      title: "The result is not the end. It moves judgment one step forward.",
      body: "See what the result actually brings back.",
      previews: [
        {
          eyebrow: "Trait structure preview",
          title: "See stable tendencies as a structure instead of a single label.",
          summary: "View dimension balance, stronger and weaker axes, and context differences in one surface.",
          metrics: ["Openness", "Conscientiousness", "Energy pattern"],
          tone: "traits",
        },
        {
          eyebrow: "Career direction preview",
          title: "Narrow better-fit directions into a range worth exploring.",
          summary: "Role fit, environment fit, and next-step reading sit on the same result surface.",
          metrics: ["Role fit", "Environment", "Next reads"],
          tone: "career",
        },
        {
          eyebrow: "State interpretation preview",
          title: "Check baseline first, then decide whether you need deeper support.",
          summary: "The output gives a state explanation, risk framing, and the next reasonable move.",
          metrics: ["Mood baseline", "Pressure signals", "Next move"],
          tone: "state",
        },
      ],
      valuePoints: [
        "See structure instead of just labels",
        "Put the result back into learning, career, and collaboration contexts",
        "Use it to choose the next step, not to define a life",
      ],
    },
    trust: {
      kicker: "Trust & Boundaries",
      title: "State the trustworthy parts clearly, and state the boundaries clearly too.",
      body: "Method, boundaries, privacy, and usage scenarios stay public and readable.",
      items: [
        {
          title: "Method basis",
          summary: "Structured questionnaires, readable reports, and ongoing calibration help people understand where the result comes from.",
          paragraphs: [
            "FermatMind uses structured questionnaires and explicit interpretation paths so results can be read, discussed, and revisited.",
            "We continuously review item wording, completion flow, and explanation tone to improve judgment quality in practice.",
          ],
          href: "/help/about",
          hrefLabel: "Read methodology notes",
        },
        {
          title: "Result boundaries",
          summary: "Results support judgment. They do not replace clinical diagnosis and they do not promise deterministic life outcomes.",
          paragraphs: [
            "They are built for self-understanding, learning direction, career exploration, and collaboration discussion.",
            "We do not present one score or one type as a complete definition of a person.",
          ],
        },
        {
          title: "Privacy and anonymity",
          summary: "Users can start anonymously. Results default to the individual, and policy pages stay explicitly visible.",
          paragraphs: [
            "We follow a minimum-necessary data approach for report generation, reliability, and de-identified quality work.",
            "Privacy, terms, and support details stay on public pages rather than inside vague reassurance copy.",
          ],
          href: "/privacy",
          hrefLabel: "View privacy policy",
        },
        {
          title: "Usage scenarios",
          summary: "The product is built for real questions around learning direction, career planning, growth review, and collaboration work.",
          paragraphs: [
            "Typical use cases include self-understanding, growth planning, coach or workshop preparation, and team retrospectives.",
            "When the situation is more sensitive or risky, we choose more conservative language and clearer boundaries.",
          ],
          href: "/help/used-and-mentioned",
          hrefLabel: "View usage scenarios",
        },
      ],
    },
    resources: {
      kicker: "Resources",
      title: "If you need more context, start with three high-signal reads.",
      body: "They help explain the tests, career direction work, and product boundaries without taking over the page.",
      items: [
        {
          title: "MBTI basics",
          description: "Understand the MBTI frame, its limits, and how to read the report without overclaiming certainty.",
          href: "/articles/mbti-basics",
          typeLabel: "Article",
        },
        {
          title: "Career guides",
          description: "Put assessment results back into major choice, role exploration, and long-term development context.",
          href: "/career/guides",
          typeLabel: "Guide",
        },
        {
          title: "About FermatMind",
          description: "Review product position, method principles, boundaries, and the team behind the product.",
          href: "/help/about",
          typeLabel: "Overview",
        },
      ],
    },
    finalCta: {
      title: "Start from one question.",
      body: "Enter the assessment hub, then choose the version that fits the question in front of you.",
      primaryCta: "Start a free assessment",
      primaryHref: "/tests",
      secondaryCta: "Browse assessment entry points",
      secondaryHref: "/tests",
    },
    header: {
      testsLabel: "Assessment entry points",
      testsTitle: "Start from the question you want to answer first.",
      testsBody: "Career direction, personality structure, emotional state, cognitive ability, and collaboration style all start here.",
      browseAllLabel: "View all assessments",
      browseAllHref: "/tests",
      groups: [
        {
          title: "Start by question",
          links: [
            { title: "Career direction", description: "Interest and path exploration", href: "/career/tests/riasec" },
            { title: "Personality structure", description: "MBTI and Big Five entry", href: "/tests/category/personality" },
            { title: "Emotional state", description: "Check the recent baseline", href: "/tests/depression-screening-test-standard-edition/take" },
            { title: "Collaboration style", description: "Communication and relationship judgment", href: "/tests/eq-test-emotional-intelligence-assessment/take" },
          ],
        },
        {
          title: "Popular assessments",
          links: [
            { title: "MBTI personality test", href: "/tests/mbti-personality-test-16-personality-types" },
            { title: "Big Five personality test", href: "/tests/big-five-personality-test-ocean-model" },
            { title: "Depression screening", href: "/tests/depression-screening-test-standard-edition/take" },
            { title: "IQ assessment", href: "/tests/iq-test-intelligence-quotient-assessment/take" },
          ],
        },
        {
          title: "Keep exploring",
          links: [
            { title: "All tests", href: "/tests" },
            { title: "Personality profiles", href: "/personality" },
            { title: "Career center", href: "/career" },
            { title: "Help center", href: "/help" },
          ],
        },
      ],
    },
    footer: {
      groups: [
        {
          title: "Top assessments",
          links: [
            { label: "MBTI personality test", href: "/tests/mbti-personality-test-16-personality-types" },
            { label: "Big Five personality test", href: "/tests/big-five-personality-test-ocean-model" },
            { label: "Depression screening", href: "/tests/depression-screening-test-standard-edition" },
          ],
        },
        {
          title: "Categories",
          links: [
            { label: "All tests", href: "/tests" },
            { label: "Personality & style", href: "/tests/category/personality" },
            { label: "Career & direction", href: "/tests/category/career" },
          ],
        },
        {
          title: "Resources",
          links: [
            { label: "MBTI basics", href: "/articles/mbti-basics" },
            { label: "Career guides", href: "/career/guides" },
            { label: "Help center", href: "/help" },
          ],
        },
        {
          title: "Support and policy",
          links: [
            { label: "Privacy policy", href: "/privacy" },
            { label: "Terms", href: "/terms" },
            { label: "Contact support", href: "/help/contact" },
          ],
        },
      ],
      supportEmailLabel: "Support",
      tailnote: "See the Micro. Lead the Macro.",
    },
    seo: {
      title: "FermatMind",
      description: "FermatMind is a structured self-understanding product for learning, career direction, and collaboration judgment. Start from the assessment hub, then use results to support a clearer next step.",
      quickStartListTitle: "FermatMind quick-start entry points",
      quickStartListDescription: "Question-led homepage entry points for career direction, personality structure, emotional state, cognitive ability, and collaboration style.",
      familyListTitle: "FermatMind assessment families",
      familyListDescription: "Visible homepage assessment families covering personality and style, career and direction, emotion and state, cognition and ability, and relationships and collaboration.",
      organizationDescription: "FermatMind provides structured assessments and interpretable guidance for self-understanding, learning, career direction, and collaboration judgment.",
    },
  },
};

export function getHomePageContent(locale: Locale) {
  return HOME_PAGE_CONTENT[locale];
}
