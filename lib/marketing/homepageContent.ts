import type { Locale } from "@/lib/i18n/locales";

export type HomeLinkItem = {
  title: string;
  description?: string;
  href: string;
  label?: string;
  meta?: string;
};

type HomeFamily = {
  title: string;
  description: string;
  exploreLabel: string;
  exploreHref: string;
  links: HomeLinkItem[];
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
    items: Array<{
      title: string;
      description: string;
      bullets: string[];
    }>;
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
    introLabel: string;
    introBody: string;
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
      title: "更清晰地理解自己，把学习、职业与协作判断落到下一步。",
      body: "通过结构化测评与情境化解释，获得可讨论、可行动的自我认知参考。",
      primaryCta: "开始免费测评",
      primaryHref: "/tests/mbti-personality-test-16-personality-types/take",
      secondaryCta: "浏览测评入口",
      secondaryHref: "#home-quick-start",
      trustRail: ["免费开始", "约 15 分钟", "结果用于支持判断，不定义一个人"],
      visualEyebrow: "可执行的自我认知",
      visualTitle: "从一个起点问题，进入结构化结果。",
      visualSummary: "把测评入口、结果结构与下一步建议放进同一张认知地图，而不是把用户丢进库存墙。",
      visualPoints: [
        "问题路径优先，而不是方法术语优先",
        "结构结果可回看、可讨论、可复盘",
        "学习、职业、协作与状态判断共享一套解释框架",
      ],
    },
    quickStart: {
      kicker: "快速开始",
      title: "从你当下最想解决的问题开始。",
      body: "先选问题，再进入合适的测评入口。这个区域的目标不是展示库存，而是帮你更快开始。",
      items: [
        {
          title: "我适合什么职业方向？",
          description: "先用职业兴趣与方向测试缩小探索范围，再进入职业推荐与指南。",
          href: "/career/tests/riasec",
          label: "职业兴趣测试",
          meta: "约 10 分钟",
        },
        {
          title: "我的人格结构是什么？",
          description: "用 MBTI 作为最快速的结构起点，再决定是否继续看更稳定的特质分布。",
          href: "/tests/mbti-personality-test-16-personality-types/take",
          label: "MBTI 性格测试",
          meta: "免费开始",
        },
        {
          title: "我的情绪或状态如何？",
          description: "先查看近期情绪基线，再判断是否需要进一步支持或更完整的综合测评。",
          href: "/tests/depression-screening-test-standard-edition/take",
          label: "抑郁筛查",
          meta: "约 5 分钟",
        },
        {
          title: "我的协作与关系风格是什么？",
          description: "用情绪与共情相关入口切入，帮助你判断沟通、反馈与合作中的倾向。",
          href: "/tests/eq-test-emotional-intelligence-assessment/take",
          label: "EQ 测评",
          meta: "约 10 分钟",
        },
        {
          title: "我应该从哪个测评开始？",
          description: "先看全部测评入口，再按主题、时长与用途筛选最合适的起点。",
          href: "/tests",
          label: "查看全部测评",
          meta: "按主题浏览",
        },
      ],
    },
    families: {
      kicker: "测评家族",
      title: "把测评广度组织成可浏览、可发现的家族结构。",
      body: "每个家族都给你一个明确主题、代表入口和继续探索的路径，让 discoverability 服务于决策，而不是制造噪音。",
      items: [
        {
          title: "人格与特质结构",
          description: "理解偏好、稳定特质与自我表达方式，是学习、工作与关系判断的基础层。",
          exploreLabel: "浏览人格相关入口",
          exploreHref: "/tests",
          links: [
            { title: "MBTI 性格测试", href: "/tests/mbti-personality-test-16-personality-types/take" },
            { title: "大五人格测试", href: "/tests/big-five-personality-test-ocean-model/take" },
            { title: "人格画像", href: "/personality" },
            { title: "MBTI 入门", href: "/articles/mbti-basics" },
          ],
        },
        {
          title: "学习与职业方向",
          description: "把自我理解转化为方向判断，帮助你处理专业选择、角色匹配与发展路径问题。",
          exploreLabel: "浏览职业方向入口",
          exploreHref: "/career",
          links: [
            { title: "职业兴趣测试", href: "/career/tests/riasec" },
            { title: "职业推荐", href: "/career/recommendations" },
            { title: "职业发展指南", href: "/career/guides" },
            { title: "职业库", href: "/career/jobs" },
          ],
        },
        {
          title: "情绪状态与支持优先级",
          description: "先识别近期状态与压力负荷，再决定是否需要更完整的支持与解释。",
          exploreLabel: "浏览状态相关入口",
          exploreHref: "/tests",
          links: [
            { title: "抑郁筛查", href: "/tests/depression-screening-test-standard-edition/take" },
            { title: "抑郁焦虑综合测评", href: "/tests/clinical-depression-anxiety-assessment-professional-edition/take" },
            { title: "帮助中心", href: "/help/faq" },
          ],
        },
        {
          title: "协作与关系判断",
          description: "把自我觉察、共情和沟通风格放回真实协作场景，帮助你更稳地做关系判断。",
          exploreLabel: "浏览协作相关入口",
          exploreHref: "/personality",
          links: [
            { title: "EQ 测评", href: "/tests/eq-test-emotional-intelligence-assessment/take" },
            { title: "ENTJ 人格", href: "/personality/entj" },
            { title: "ENFJ 人格", href: "/personality/enfj" },
            { title: "EQ 工具说明", href: "/articles/eq-test-tool-guide" },
          ],
        },
        {
          title: "认知与能力信号",
          description: "用于理解推理、抽象识别与任务负载准备度，适合和学习或职业决策一起看。",
          exploreLabel: "浏览能力相关入口",
          exploreHref: "/career/tests",
          links: [
            { title: "IQ 测评", href: "/tests/iq-test-intelligence-quotient-assessment/take" },
            { title: "职业测试", href: "/career/tests" },
            { title: "职业推荐中心", href: "/career/recommendations" },
          ],
        },
      ],
    },
    results: {
      kicker: "结果如何帮助判断",
      title: "结果不是结论终点，而是把判断推进一格。",
      body: "FermatMind 更关注结果如何帮助你理解情境、展开讨论、形成下一步，而不是给出戏剧化的命运宣判。",
      items: [
        {
          title: "把学习与决策模式说清楚",
          description: "把抽象的“我好像是这样的人”变成更可复盘的结构，便于你回看自己在信息处理、选择偏好和执行方式上的规律。",
          bullets: ["理解偏好结构", "看到强弱轴与情境差异", "避免单一标签替代判断"],
        },
        {
          title: "把职业方向缩小到可讨论范围",
          description: "结果可以作为职业探索的过滤器，让你更快排除不适配方向，把注意力集中到更值得投入的路径上。",
          bullets: ["连接职业兴趣与角色适配", "辅助专业与岗位探索", "为后续职业资料阅读建立坐标"],
        },
        {
          title: "把协作与关系判断拉回现实场景",
          description: "报告更适合拿来讨论沟通、反馈和合作中的模式差异，而不是证明谁对谁错。",
          bullets: ["帮助解释合作摩擦", "支持团队复盘与沟通准备", "为反馈方式提供参考"],
        },
      ],
    },
    trust: {
      kicker: "方法、隐私与信任",
      title: "把值得信任的部分说清楚，也把边界说清楚。",
      body: "真正的信任来自方法纪律、解释边界、隐私规则和持续改进，而不是徽章墙或夸张背书。",
      items: [
        {
          title: "方法依据",
          summary: "结构化问卷、可读报告和迭代质量校准，是首页应当明确展示的真实方法资产。",
          paragraphs: [
            "FermatMind 采用结构化问卷与透明解释路径，让用户能看懂结果如何形成，而不是只拿到一个标签。",
            "我们持续审查题项表达、完成流畅度和解释口径，优先修正会影响理解质量的部分。",
          ],
          href: "/help/about",
          hrefLabel: "查看方法说明",
        },
        {
          title: "结果边界",
          summary: "结果用于支持自我理解与决策讨论，不是临床诊断，也不承诺确定性人生结果。",
          paragraphs: [
            "FermatMind 的结果适合用于教育、自我反思、职业探索和协作讨论，不替代专业医疗或心理支持。",
            "我们避免把分数或类型包装成绝对真理，也避免把测评结果表述成对人的完整定义。",
          ],
        },
        {
          title: "隐私与匿名",
          summary: "结果默认面向本人，隐私政策、条款与支持渠道是明确可见的产品表面，而不是隐蔽角落。",
          paragraphs: [
            "结果默认仅对你可见。我们遵循最小必要原则处理数据，用于生成报告、保障稳定性和做脱敏质量优化。",
            "涉及隐私与政策的细节都应该通过公开页面查看，而不是靠模糊承诺。",
          ],
          href: "/privacy",
          hrefLabel: "查看隐私政策",
        },
        {
          title: "使用场景",
          summary: "产品聚焦于学习方向、职业规划、团队复盘与沟通协作等真实问题，而不是做概念展示。",
          paragraphs: [
            "常见使用场景包括个人自我认知、成长规划、教练或工作坊准备，以及团队沟通复盘。",
            "当用户风险较高时，我们会采用更保守的表达和更明确的使用边界。",
          ],
          href: "/help/used-and-mentioned",
          hrefLabel: "查看使用场景",
        },
        {
          title: "团队与持续改进",
          summary: "由心理测量、产品、工程与内容质量共同协作，持续做小步、可验证的改进。",
          paragraphs: [
            "FermatMind 由跨职能团队协作：心理测量与内容、产品与体验、工程与数据、支持与运营各自负责关键质量面。",
            "我们优先解决影响用户理解、判断和安全感的问题，而不是追求表面上的戏剧化更新。",
          ],
          href: "/help/team",
          hrefLabel: "查看团队说明",
        },
      ],
    },
    resources: {
      kicker: "资源入口",
      title: "继续阅读时，先给你少而准的四个入口。",
      body: "首页不堆目录墙，只保留最适合承接理解和搜索发现的资源入口。",
      items: [
        {
          title: "MBTI 入门",
          description: "理解 MBTI 的基础框架、使用边界和报告阅读方式。",
          href: "/articles/mbti-basics",
          typeLabel: "文章",
        },
        {
          title: "大五工具说明",
          description: "了解稳定特质视角适合回答什么问题，以及何时比类型入口更合适。",
          href: "/articles/big-five-tool-guide",
          typeLabel: "文章",
        },
        {
          title: "职业发展指南",
          description: "把测评结果放回专业选择、岗位探索和长期发展语境。",
          href: "/career/guides",
          typeLabel: "指南中心",
        },
        {
          title: "关于 FermatMind",
          description: "查看产品定位、方法原则、使用边界与团队协作方式。",
          href: "/help/about",
          typeLabel: "帮助中心",
        },
      ],
    },
    finalCta: {
      title: "先从一次免费测评开始，把问题放到结构里。",
      body: "如果你现在只做一个动作，就先开始一个最适合当下问题的入口。后续的结果、资源和解释都会围绕这个起点展开。",
      primaryCta: "开始免费测评",
      primaryHref: "/tests/mbti-personality-test-16-personality-types/take",
      secondaryCta: "查看全部测评",
      secondaryHref: "/tests",
    },
    header: {
      testsLabel: "测评入口",
      testsTitle: "从问题出发，而不是从库存出发。",
      testsBody: "把高频问题、代表性测评和主题入口放在一层，帮助用户在 1 次展开内完成定位。",
      browseAllLabel: "查看全部测评",
      browseAllHref: "/tests",
      groups: [
        {
          title: "按问题开始",
          links: [
            { title: "职业方向", description: "职业兴趣与路径探索", href: "/career/tests/riasec" },
            { title: "人格结构", description: "MBTI 结构起点", href: "/tests/mbti-personality-test-16-personality-types/take" },
            { title: "情绪状态", description: "先看近期基线", href: "/tests/depression-screening-test-standard-edition/take" },
            { title: "协作风格", description: "沟通与关系判断", href: "/tests/eq-test-emotional-intelligence-assessment/take" },
          ],
        },
        {
          title: "高频测评",
          links: [
            { title: "MBTI 性格测试", href: "/tests/mbti-personality-test-16-personality-types/take" },
            { title: "大五人格测试", href: "/tests/big-five-personality-test-ocean-model/take" },
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
      introLabel: "首页导航",
      introBody: "把高频测评、分类入口、资源与支持页面组织在同一处，服务用户导航，也服务长期 discoverability。",
      groups: [
        {
          title: "热门测评",
          links: [
            { label: "MBTI 性格测试", href: "/tests/mbti-personality-test-16-personality-types" },
            { label: "大五人格测试", href: "/tests/big-five-personality-test-ocean-model" },
            { label: "抑郁筛查", href: "/tests/depression-screening-test-standard-edition" },
            { label: "EQ 测评", href: "/tests/eq-test-emotional-intelligence-assessment" },
            { label: "IQ 测评", href: "/tests/iq-test-intelligence-quotient-assessment" },
          ],
        },
        {
          title: "测评分类",
          links: [
            { label: "全部测试", href: "/tests" },
            { label: "人格画像", href: "/personality" },
            { label: "职业测试", href: "/career/tests" },
            { label: "职业推荐", href: "/career/recommendations" },
            { label: "主题聚合", href: "/topics" },
          ],
        },
        {
          title: "资源入口",
          links: [
            { label: "全部文章", href: "/articles" },
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
            { label: "退款说明", href: "/refund" },
            { label: "联系支持", href: "/help/contact" },
          ],
        },
      ],
      supportEmailLabel: "支持邮箱",
      tailnote: "识微，见远。See the Micro. Lead the Macro.",
    },
    seo: {
      title: "FermatMind / 费马测试",
      description: "费马测试是一个面向自我理解、学习、职业方向与协作判断的结构化测评产品。先从免费测评开始，再用结果支持更清晰的下一步判断。",
      quickStartListTitle: "费马测试首页快速开始入口",
      quickStartListDescription: "按用户问题组织的高频测评入口，包括职业方向、人格结构、情绪状态、协作风格与测评选择建议。",
      familyListTitle: "费马测试测评家族",
      familyListDescription: "首页可见的测评家族导航，覆盖人格结构、职业方向、情绪状态、协作关系与认知能力。",
      organizationDescription: "FermatMind / 费马测试提供用于自我理解、学习、职业方向与协作判断的结构化测评与解释内容。",
    },
  },
  en: {
    hero: {
      eyebrow: "See the Micro. Lead the Macro.",
      brand: "FermatMind",
      title: "Understand yourself more clearly, then turn learning, career, and collaboration decisions into the next step.",
      body: "Use structured assessments and scenario-based interpretation to get a self-understanding reference you can discuss and act on.",
      primaryCta: "Start a free assessment",
      primaryHref: "/tests/mbti-personality-test-16-personality-types/take",
      secondaryCta: "Browse assessment entry points",
      secondaryHref: "#home-quick-start",
      trustRail: ["Free to start", "About 15 minutes", "Results support judgment, not identity"],
      visualEyebrow: "Decision-ready self-understanding",
      visualTitle: "Move from one starting question into a structured result.",
      visualSummary: "Bring entry paths, report structure, and next-step guidance into one map instead of dropping users into an inventory wall.",
      visualPoints: [
        "Question-led entry before method jargon",
        "Structured results that stay reviewable and discussable",
        "Learning, career, collaboration, and state-check decisions share one explanation frame",
      ],
    },
    quickStart: {
      kicker: "Quick Start",
      title: "Start from the question you need to answer right now.",
      body: "Choose the question first, then move into the right assessment. This block exists to reduce friction, not to expose inventory.",
      items: [
        {
          title: "What career direction fits me best?",
          description: "Start with career-interest signals, then move into recommendations and guides with a narrower search space.",
          href: "/career/tests/riasec",
          label: "Career interest test",
          meta: "About 10 min",
        },
        {
          title: "What does my personality structure look like?",
          description: "Use MBTI as the fastest structural entry, then decide whether you need a more stable trait-distribution view.",
          href: "/tests/mbti-personality-test-16-personality-types/take",
          label: "MBTI personality test",
          meta: "Free start",
        },
        {
          title: "How is my current emotional state?",
          description: "Check your recent baseline first, then decide whether deeper support or a more complete assessment is needed.",
          href: "/tests/depression-screening-test-standard-edition/take",
          label: "Depression screening",
          meta: "About 5 min",
        },
        {
          title: "How do I collaborate and relate to people?",
          description: "Use an emotional-intelligence entry to review self-awareness, empathy, and regulation in practical collaboration contexts.",
          href: "/tests/eq-test-emotional-intelligence-assessment/take",
          label: "EQ assessment",
          meta: "About 10 min",
        },
        {
          title: "Which assessment should I start with?",
          description: "Browse all test entry points, then filter by topic, time, and decision use case.",
          href: "/tests",
          label: "View all assessments",
          meta: "Browse by topic",
        },
      ],
    },
    families: {
      kicker: "Test Families",
      title: "Organize breadth into families people can browse and discover.",
      body: "Each family has a clear theme, representative entry points, and a next layer to explore, so discoverability serves decision-making instead of noise.",
      items: [
        {
          title: "Personality and trait structure",
          description: "Understand preferences, stable trait tendencies, and how you show up across learning, work, and relationships.",
          exploreLabel: "Explore personality entry points",
          exploreHref: "/tests",
          links: [
            { title: "MBTI personality test", href: "/tests/mbti-personality-test-16-personality-types/take" },
            { title: "Big Five personality test", href: "/tests/big-five-personality-test-ocean-model/take" },
            { title: "Personality profiles", href: "/personality" },
            { title: "MBTI basics", href: "/articles/mbti-basics" },
          ],
        },
        {
          title: "Learning and career direction",
          description: "Turn self-understanding into direction decisions by narrowing role fit, field choices, and development paths.",
          exploreLabel: "Explore career direction entry points",
          exploreHref: "/career",
          links: [
            { title: "Career interest test", href: "/career/tests/riasec" },
            { title: "Career recommendations", href: "/career/recommendations" },
            { title: "Career guides", href: "/career/guides" },
            { title: "Job library", href: "/career/jobs" },
          ],
        },
        {
          title: "Emotional state and support priority",
          description: "Identify recent baseline and pressure load first, then decide whether deeper support or interpretation is needed.",
          exploreLabel: "Explore state-related entry points",
          exploreHref: "/tests",
          links: [
            { title: "Depression screening", href: "/tests/depression-screening-test-standard-edition/take" },
            { title: "Depression and anxiety assessment", href: "/tests/clinical-depression-anxiety-assessment-professional-edition/take" },
            { title: "Help center", href: "/help/faq" },
          ],
        },
        {
          title: "Collaboration and relationship judgment",
          description: "Bring empathy, feedback style, and communication patterns back into real collaboration scenarios.",
          exploreLabel: "Explore collaboration entry points",
          exploreHref: "/personality",
          links: [
            { title: "EQ assessment", href: "/tests/eq-test-emotional-intelligence-assessment/take" },
            { title: "ENTJ personality", href: "/personality/entj" },
            { title: "ENFJ personality", href: "/personality/enfj" },
            { title: "EQ tool guide", href: "/articles/eq-test-tool-guide" },
          ],
        },
        {
          title: "Cognitive and ability signals",
          description: "Review reasoning readiness and task-load fit, ideally alongside learning and career decisions.",
          exploreLabel: "Explore ability entry points",
          exploreHref: "/career/tests",
          links: [
            { title: "IQ assessment", href: "/tests/iq-test-intelligence-quotient-assessment/take" },
            { title: "Career tests", href: "/career/tests" },
            { title: "Career recommendation center", href: "/career/recommendations" },
          ],
        },
      ],
    },
    results: {
      kicker: "How Results Help",
      title: "Results are not the end of judgment. They move judgment forward one step.",
      body: "FermatMind focuses on how results help users interpret context, discuss differences, and choose better next moves instead of making theatrical destiny claims.",
      items: [
        {
          title: "Make learning and decision patterns easier to name",
          description: "Turn the vague feeling of 'I might work this way' into a more reviewable structure you can revisit across information processing, preference, and execution habits.",
          bullets: ["See preference structure", "Notice strong and weak axes", "Avoid letting one label replace judgment"],
        },
        {
          title: "Narrow career direction into a discussable range",
          description: "Use results as a filter for exploration so attention moves toward better-fit roles, fields, and development paths sooner.",
          bullets: ["Connect trait signals to role fit", "Support major and job exploration", "Create a reading frame for deeper career content"],
        },
        {
          title: "Bring collaboration judgment back to real situations",
          description: "Reports work best as a discussion surface for communication, feedback, and teamwork differences rather than as proof that one person is right.",
          bullets: ["Explain collaboration friction", "Support team retrospectives", "Suggest more workable feedback styles"],
        },
      ],
    },
    trust: {
      kicker: "Methodology / Privacy / Trust",
      title: "State the trustworthy parts clearly, and state the boundaries clearly too.",
      body: "Real trust comes from methodological discipline, interpretation boundaries, privacy rules, and steady iteration instead of badges or inflated proof signals.",
      items: [
        {
          title: "Method basis",
          summary: "Structured questionnaires, readable reports, and iterative quality calibration are the real trust assets the homepage should surface.",
          paragraphs: [
            "FermatMind uses structured questionnaires and transparent interpretation paths so users can understand how a result is formed instead of receiving a label without context.",
            "We continuously review item wording, completion flow, and interpretation tone, prioritizing improvements that change understanding quality in practice.",
          ],
          href: "/help/about",
          hrefLabel: "Read methodology notes",
        },
        {
          title: "Result boundaries",
          summary: "Results support self-understanding and decision discussion. They are not clinical diagnosis and they do not promise deterministic life outcomes.",
          paragraphs: [
            "FermatMind results are meant for education, self-reflection, career exploration, and collaboration discussion, not for replacing medical or therapeutic care.",
            "We avoid presenting scores or types as absolute truth and avoid implying that a test result fully defines a person.",
          ],
        },
        {
          title: "Privacy and anonymity",
          summary: "Results default to the user. Privacy policy, terms, and support channels are visible product surfaces rather than hidden promises.",
          paragraphs: [
            "Results default to the individual user. We follow a minimum-necessary data principle for report generation, reliability, and de-identified quality work.",
            "Policy and privacy details should always be reachable through explicit pages, not inferred from vague copy.",
          ],
          href: "/privacy",
          hrefLabel: "View privacy policy",
        },
        {
          title: "Usage scenarios",
          summary: "The product is built for real questions around learning direction, career planning, team retrospectives, and communication work.",
          paragraphs: [
            "Typical use cases include self-understanding, growth planning, coach or workshop preparation, and team communication review.",
            "When user risk is involved, we choose more conservative language and more explicit boundaries.",
          ],
          href: "/help/used-and-mentioned",
          hrefLabel: "View usage scenarios",
        },
        {
          title: "Team and ongoing improvement",
          summary: "A cross-functional team across psychometrics, product, engineering, and content quality makes small, testable improvements over time.",
          paragraphs: [
            "FermatMind is maintained by a cross-functional team spanning psychometrics and content, product and UX, engineering and data, and support operations.",
            "We prioritize improvements that reduce misunderstanding, sharpen decisions, and preserve user trust instead of chasing theatrical updates.",
          ],
          href: "/help/team",
          hrefLabel: "Read team overview",
        },
      ],
    },
    resources: {
      kicker: "Resources Hub",
      title: "If users keep reading, give them four high-signal paths instead of a directory wall.",
      body: "The homepage should only keep the resources that best support understanding and search discovery.",
      items: [
        {
          title: "MBTI basics",
          description: "Understand the MBTI frame, its boundaries, and how to read the report without overclaiming certainty.",
          href: "/articles/mbti-basics",
          typeLabel: "Article",
        },
        {
          title: "Big Five tool guide",
          description: "Learn when a stable trait-distribution view is more useful than a type-led starting point.",
          href: "/articles/big-five-tool-guide",
          typeLabel: "Article",
        },
        {
          title: "Career guides",
          description: "Put assessment results back into major choice, role exploration, and long-term development context.",
          href: "/career/guides",
          typeLabel: "Guide hub",
        },
        {
          title: "About FermatMind",
          description: "Review the product position, method principles, usage boundaries, and team operating model.",
          href: "/help/about",
          typeLabel: "Help center",
        },
      ],
    },
    finalCta: {
      title: "Start with one free assessment and put the question into structure.",
      body: "If you only take one action now, pick the entry point that best matches your current question. The result, related resources, and next-step guidance can build from there.",
      primaryCta: "Start a free assessment",
      primaryHref: "/tests/mbti-personality-test-16-personality-types/take",
      secondaryCta: "View all assessments",
      secondaryHref: "/tests",
    },
    header: {
      testsLabel: "Assessment entry points",
      testsTitle: "Start from the question, not from the inventory.",
      testsBody: "Put high-intent questions, representative assessments, and explore hubs in one layer so users can orient within a single interaction.",
      browseAllLabel: "View all assessments",
      browseAllHref: "/tests",
      groups: [
        {
          title: "Start by question",
          links: [
            { title: "Career direction", description: "Interest and path exploration", href: "/career/tests/riasec" },
            { title: "Personality structure", description: "Fast MBTI entry point", href: "/tests/mbti-personality-test-16-personality-types/take" },
            { title: "Emotional state", description: "Check recent baseline", href: "/tests/depression-screening-test-standard-edition/take" },
            { title: "Collaboration style", description: "Communication and relationship judgment", href: "/tests/eq-test-emotional-intelligence-assessment/take" },
          ],
        },
        {
          title: "Popular assessments",
          links: [
            { title: "MBTI personality test", href: "/tests/mbti-personality-test-16-personality-types/take" },
            { title: "Big Five personality test", href: "/tests/big-five-personality-test-ocean-model/take" },
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
      introLabel: "Homepage Navigation",
      introBody: "Group high-frequency assessments, categories, resources, and support pages in one place for real navigation value and long-term discoverability.",
      groups: [
        {
          title: "Top assessments",
          links: [
            { label: "MBTI personality test", href: "/tests/mbti-personality-test-16-personality-types" },
            { label: "Big Five personality test", href: "/tests/big-five-personality-test-ocean-model" },
            { label: "Depression screening", href: "/tests/depression-screening-test-standard-edition" },
            { label: "EQ assessment", href: "/tests/eq-test-emotional-intelligence-assessment" },
            { label: "IQ assessment", href: "/tests/iq-test-intelligence-quotient-assessment" },
          ],
        },
        {
          title: "Categories",
          links: [
            { label: "All tests", href: "/tests" },
            { label: "Personality profiles", href: "/personality" },
            { label: "Career tests", href: "/career/tests" },
            { label: "Career recommendations", href: "/career/recommendations" },
            { label: "Topic clusters", href: "/topics" },
          ],
        },
        {
          title: "Resources",
          links: [
            { label: "All articles", href: "/articles" },
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
            { label: "Refund", href: "/refund" },
            { label: "Contact support", href: "/help/contact" },
          ],
        },
      ],
      supportEmailLabel: "Support",
      tailnote: "See the Micro. Lead the Macro.",
    },
    seo: {
      title: "FermatMind",
      description: "FermatMind is a structured self-understanding product for learning, career direction, and collaboration judgment. Start with a free assessment, then use the results to support better next-step decisions.",
      quickStartListTitle: "FermatMind quick-start entry points",
      quickStartListDescription: "Question-led homepage entry points for career direction, personality structure, emotional state, collaboration style, and choosing the right assessment.",
      familyListTitle: "FermatMind assessment families",
      familyListDescription: "Visible homepage assessment families covering personality structure, career direction, emotional state, collaboration patterns, and cognitive ability.",
      organizationDescription: "FermatMind provides structured assessments and interpretable guidance for self-understanding, learning, career direction, and collaboration judgment.",
    },
  },
};

export function getHomePageContent(locale: Locale) {
  return HOME_PAGE_CONTENT[locale];
}
