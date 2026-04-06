import type { Locale } from "@/lib/i18n/locales";

export const MBTI_SCENE_DEEP_PRIORITY_TYPES = ["ENTJ", "INTP", "INTJ", "ENFJ"] as const;
export type MbtiSceneDeepPriorityType = (typeof MBTI_SCENE_DEEP_PRIORITY_TYPES)[number];

export const MBTI_SCENE_DEEP_PRIORITY_SCENES = [
  "career_direction",
  "team_collaboration",
  "major_selection",
] as const;
export type MbtiSceneDeepSceneKey = (typeof MBTI_SCENE_DEEP_PRIORITY_SCENES)[number];

export type MbtiSceneDeepLink = {
  key: string;
  label: string;
  href: string;
  kind?: "link" | "start_test";
  targetAction?: string;
};

export type MbtiSceneDeepModule = {
  sceneKey: MbtiSceneDeepSceneKey;
  title: string;
  summary: string;
  whyTypeRelevant: string;
  links: MbtiSceneDeepLink[];
};

export type MbtiTestLandingContinuityItem = {
  key: string;
  title: string;
  body: string;
  href: string;
};

function withLocale(locale: Locale, path: string): string {
  return `/${locale}${path}`;
}

function normalizeTypeCode(typeCode: string): string {
  return String(typeCode ?? "").trim().toUpperCase().slice(0, 4);
}

function isPriorityType(typeCode: string): typeCode is MbtiSceneDeepPriorityType {
  return MBTI_SCENE_DEEP_PRIORITY_TYPES.includes(typeCode as MbtiSceneDeepPriorityType);
}

function buildPriorityRouteBundle(locale: Locale, typeCode: MbtiSceneDeepPriorityType): {
  personalityPath: string;
  recommendationPath: string;
  topicPath: string;
  guidePath: string;
  basicsArticlePath: string;
  growthArticlePath: string;
  narrativeArticlePath: string;
  testPath: string;
  recommendationHubPath: string;
} {
  const slug = typeCode.toLowerCase();
  const variantSlug = `${slug}-a`;

  return {
    personalityPath: withLocale(locale, `/personality/${variantSlug}`),
    recommendationPath: withLocale(locale, `/career/recommendations/mbti/${variantSlug}`),
    topicPath: withLocale(locale, "/topics/mbti"),
    guidePath: withLocale(locale, "/career/guides/from-mbti-to-job-fit"),
    basicsArticlePath: withLocale(locale, "/articles/mbti-basics"),
    growthArticlePath: withLocale(locale, "/articles/mbti-growth-guide"),
    narrativeArticlePath: withLocale(locale, "/articles/mbti-narrative-portrait"),
    testPath: withLocale(locale, "/tests/mbti-personality-test-16-personality-types"),
    recommendationHubPath: withLocale(locale, "/career/recommendations"),
  };
}

export function buildMbtiTopicScenarioDeepModules(locale: Locale): MbtiSceneDeepModule[] {
  const isZh = locale === "zh";
  const topicPath = withLocale(locale, "/topics/mbti");
  const personalityPath = withLocale(locale, "/personality");
  const recommendationPath = withLocale(locale, "/career/recommendations");
  const guidePath = withLocale(locale, "/career/guides/from-mbti-to-job-fit");
  const testPath = withLocale(locale, "/tests/mbti-personality-test-16-personality-types");

  return [
    {
      sceneKey: "career_direction",
      title: isZh ? "职业方向：先建立匹配框架，再看岗位细节" : "Career direction: frame fit first, then evaluate roles",
      summary: isZh
        ? "先明确类型偏好如何映射到岗位职责、反馈节奏与成长路径，再进入 recommendation 详情页看 primary/secondary fit。这样可以减少“只看岗位名称”的误判。"
        : "Map type preferences to role scope, feedback rhythm, and growth path before diving into recommendation detail and primary/secondary fit. This avoids title-only decisions.",
      whyTypeRelevant: isZh
        ? "MBTI 主题页适合先做跨类型对照，快速判断哪些类型在同一职业赛道下的决策方式不同。"
        : "The MBTI topic hub is best for cross-type comparison before committing to one career lane.",
      links: [
        { key: "go_recommendation_hub", label: isZh ? "查看职业推荐入口" : "Open career recommendations", href: recommendationPath },
        { key: "go_mbti_guide", label: isZh ? "阅读职业匹配指南" : "Read MBTI job-fit guide", href: guidePath },
        {
          key: "start_mbti_test",
          label: isZh ? "开始 MBTI 测试" : "Start MBTI test",
          href: testPath,
          kind: "start_test",
          targetAction: "start_mbti_test_scene_career_direction",
        },
      ],
    },
    {
      sceneKey: "team_collaboration",
      title: isZh ? "团队协作：把风格差异转成可执行协作规则" : "Team collaboration: convert style differences into operating rules",
      summary: isZh
        ? "协作问题常来自信息偏好和反馈方式不一致。先看类型画像，再回到 topic 汇总协作共性，能更快形成团队沟通规则。"
        : "Most collaboration friction comes from mismatched information and feedback styles. Type detail plus topic-level synthesis helps teams set clear operating rules.",
      whyTypeRelevant: isZh
        ? "同一项目里，不同类型对节奏、决策透明度和冲突处理的需求不同，必须先有结构化解释。"
        : "Different types expect different cadence, transparency, and conflict handling. Structured interpretation is required before action.",
      links: [
        { key: "go_personality_hub", label: isZh ? "查看人格类型索引" : "Browse personality types", href: personalityPath },
        { key: "go_growth_article", label: isZh ? "阅读成长实践指南" : "Read growth guide", href: withLocale(locale, "/articles/mbti-growth-guide") },
        { key: "go_topic_hub", label: isZh ? "回到 MBTI 主题页" : "Return to MBTI topic hub", href: topicPath },
      ],
    },
    {
      sceneKey: "major_selection",
      title: isZh ? "专业选择：用类型偏好校准方向，不只看热门专业" : "Major selection: use type signals, not trend-only choices",
      summary: isZh
        ? "专业选择需要同时考虑学习动机、工作环境偏好与长期投入耐受度。先用 MBTI 建立判断框架，再进入类型与职业推荐页校准方向。"
        : "Major choice should align motivation, work-environment preference, and long-term commitment. Use MBTI as the frame, then validate with type and recommendation pages.",
      whyTypeRelevant: isZh
        ? "类型不是结论，但能提供“你为什么会持续投入或持续摩擦”的可解释线索。"
        : "Type is not destiny, but it explains why some paths compound and others keep causing friction.",
      links: [
        { key: "go_topic_hub", label: isZh ? "查看 MBTI 主题框架" : "Review MBTI topic framework", href: topicPath },
        { key: "go_narrative_article", label: isZh ? "阅读类型叙事画像" : "Read narrative portrait", href: withLocale(locale, "/articles/mbti-narrative-portrait") },
        {
          key: "start_mbti_test",
          label: isZh ? "先做测试再选方向" : "Take test before choosing path",
          href: testPath,
          kind: "start_test",
          targetAction: "start_mbti_test_scene_major_selection",
        },
      ],
    },
  ];
}

function buildPriorityTypeFocus(typeCode: MbtiSceneDeepPriorityType, locale: Locale): {
  career: string;
  team: string;
  major: string;
} {
  const isZh = locale === "zh";
  const zhMap: Record<MbtiSceneDeepPriorityType, { career: string; team: string; major: string }> = {
    ENTJ: {
      career: "ENTJ 通常更容易在高目标密度、可衡量产出和决策权明确的岗位中持续增长。",
      team: "ENTJ 在协作中擅长推进决策，但需要显式管理“速度快于共识”的风险。",
      major: "ENTJ 做专业选择时，应优先考虑是否能长期进入战略与执行一体化场景。",
    },
    INTP: {
      career: "INTP 往往在问题定义复杂、允许深度思考与模型迭代的岗位中表现更稳定。",
      team: "INTP 协作优势在于结构化推理，需要配套明确的同步机制避免信息断层。",
      major: "INTP 选择专业时，应优先看是否支持长期探索与抽象能力持续增长。",
    },
    INTJ: {
      career: "INTJ 在系统设计与长期规划导向岗位中更容易形成复利优势。",
      team: "INTJ 协作中重视逻辑一致性，需要把隐含判断前提显式化来降低误解。",
      major: "INTJ 做专业选择时，应优先看长期路径与能力杠杆，而不是短期热门度。",
    },
    ENFJ: {
      career: "ENFJ 通常在需要驱动人和目标对齐、兼顾沟通与推进的岗位里更有优势。",
      team: "ENFJ 协作中擅长组织共识，但需要避免过度承担情绪调和成本。",
      major: "ENFJ 选择专业时应同时评估价值感、协作密度和长期发展空间。",
    },
  };
  const enMap: Record<MbtiSceneDeepPriorityType, { career: string; team: string; major: string }> = {
    ENTJ: {
      career: "ENTJ usually compounds faster in roles with explicit ownership, measurable outcomes, and strategic leverage.",
      team: "ENTJ often drives decisions quickly and should explicitly manage pace-vs-consensus risk.",
      major: "ENTJ major decisions should prioritize strategic leverage and long-term execution scope.",
    },
    INTP: {
      career: "INTP tends to perform best in roles with complex problem framing and room for model iteration.",
      team: "INTP collaboration strengths are analytical clarity and should be paired with explicit sync rituals.",
      major: "INTP major choices should optimize for deep exploration and long-horizon learning loops.",
    },
    INTJ: {
      career: "INTJ compounds in system-design and long-range planning roles with clear autonomy boundaries.",
      team: "INTJ collaboration benefits from making hidden assumptions explicit early in group decisions.",
      major: "INTJ major selection should prioritize long-term capability leverage over short-term trend signals.",
    },
    ENFJ: {
      career: "ENFJ often scales in roles that align people, goals, and execution under changing constraints.",
      team: "ENFJ collaboration strengths include alignment and momentum, with caution on emotional over-ownership.",
      major: "ENFJ major choices should balance purpose fit, collaboration density, and growth runway.",
    },
  };

  return isZh ? zhMap[typeCode] : enMap[typeCode];
}

export function buildMbtiPersonalityScenarioDeepModules(input: {
  locale: Locale;
  typeCode: string;
}): MbtiSceneDeepModule[] {
  const typeCode = normalizeTypeCode(input.typeCode);
  if (!isPriorityType(typeCode)) {
    return [];
  }

  const isZh = input.locale === "zh";
  const focus = buildPriorityTypeFocus(typeCode, input.locale);
  const routeBundle = buildPriorityRouteBundle(input.locale, typeCode);

  return [
    {
      sceneKey: "career_direction",
      title: isZh ? `${typeCode} 的职业方向判断` : `${typeCode} career direction signals`,
      summary: isZh
        ? `${focus.career} 先看 recommendation 的匹配岗位矩阵，再结合 guide 把“适合”转成执行路径。`
        : `${focus.career} Start with recommendation fit matrix, then convert fit into action using guides.`,
      whyTypeRelevant: isZh
        ? `${focus.career} 这就是该类型在职业方向上最容易形成长期优势的原因。`
        : `${focus.career} This is why this type compounds in specific career lanes over time.`,
      links: [
        { key: "to_recommendation", label: isZh ? "查看该类型职业推荐" : "View type recommendation", href: routeBundle.recommendationPath },
        { key: "to_guide", label: isZh ? "阅读职业匹配指南" : "Read job-fit guide", href: routeBundle.guidePath },
        {
          key: "to_test",
          label: isZh ? "重新测试验证类型" : "Retake test to validate",
          href: routeBundle.testPath,
          kind: "start_test",
          targetAction: "start_mbti_test_scene_career_direction",
        },
      ],
    },
    {
      sceneKey: "team_collaboration",
      title: isZh ? `${typeCode} 的团队协作策略` : `${typeCode} team collaboration playbook`,
      summary: isZh
        ? `${focus.team} 先把协作偏好翻译成“会议节奏、反馈格式、冲突处理”三条团队规则。`
        : `${focus.team} Translate collaboration preference into three rules: meeting cadence, feedback format, and conflict protocol.`,
      whyTypeRelevant: isZh
        ? `${focus.team} 如果没有显式规则，类型优势容易在团队里被误读为沟通问题。`
        : `${focus.team} Without explicit rules, type strengths are often misread as communication friction.`,
      links: [
        { key: "to_type_detail", label: isZh ? "查看当前类型页" : "Review this type profile", href: routeBundle.personalityPath },
        { key: "to_growth_article", label: isZh ? "阅读成长实践指南" : "Read growth guide", href: routeBundle.growthArticlePath },
        { key: "to_topic", label: isZh ? "回到 MBTI 主题页" : "Return to MBTI topic", href: routeBundle.topicPath },
      ],
    },
    {
      sceneKey: "major_selection",
      title: isZh ? `${typeCode} 的专业选择线索` : `${typeCode} major-selection cues`,
      summary: isZh
        ? `${focus.major} 先用 topic 建立判断框架，再用 recommendation 与基础文章对照实际路径。`
        : `${focus.major} Build a frame from topic first, then validate with recommendation and baseline articles.`,
      whyTypeRelevant: isZh
        ? `${focus.major} 这能把“兴趣”转成“可持续投入与回报结构”的判断。`
        : `${focus.major} This turns interest into a decision about sustained investment and return structure.`,
      links: [
        { key: "to_topic", label: isZh ? "查看 MBTI 主题框架" : "Review MBTI topic framework", href: routeBundle.topicPath },
        { key: "to_basics_article", label: isZh ? "阅读 MBTI 基础指南" : "Read MBTI basics", href: routeBundle.basicsArticlePath },
        {
          key: "to_test",
          label: isZh ? "先测后选" : "Test before choosing",
          href: routeBundle.testPath,
          kind: "start_test",
          targetAction: "start_mbti_test_scene_major_selection",
        },
      ],
    },
  ];
}

export function buildMbtiRecommendationScenarioDeepModules(input: {
  locale: Locale;
  typeCode: string;
}): MbtiSceneDeepModule[] {
  const typeCode = normalizeTypeCode(input.typeCode);
  if (!isPriorityType(typeCode)) {
    return [];
  }

  const isZh = input.locale === "zh";
  const focus = buildPriorityTypeFocus(typeCode, input.locale);
  const routeBundle = buildPriorityRouteBundle(input.locale, typeCode);

  return [
    {
      sceneKey: "career_direction",
      title: isZh ? `${typeCode} 职业方向的落地路径` : `${typeCode} career direction execution path`,
      summary: isZh
        ? `${focus.career} 当前 recommendation 页负责给出岗位矩阵；下一步要把岗位、能力和节奏约束放到同一决策面里。`
        : `${focus.career} Recommendation gives the fit matrix; next step is to align role, capability, and cadence constraints in one decision frame.`,
      whyTypeRelevant: isZh
        ? `${focus.career} 这决定了该类型是“短期高兴奋”还是“长期可复利”。`
        : `${focus.career} This separates short-term excitement from long-term compounding fit.`,
      links: [
        { key: "to_recommendation_hub", label: isZh ? "查看更多职业推荐" : "Explore recommendation hub", href: routeBundle.recommendationHubPath },
        { key: "to_guide", label: isZh ? "阅读职业匹配指南" : "Read job-fit guide", href: routeBundle.guidePath },
        {
          key: "to_test",
          label: isZh ? "重新测试验证路径" : "Retake test to verify",
          href: routeBundle.testPath,
          kind: "start_test",
          targetAction: "start_mbti_test_scene_career_direction",
        },
      ],
    },
    {
      sceneKey: "team_collaboration",
      title: isZh ? `${typeCode} 在团队协作中的高杠杆做法` : `${typeCode} high-leverage team collaboration moves`,
      summary: isZh
        ? `${focus.team} 把类型偏好提前写进协作约定，可以显著降低项目推进中的沟通摩擦。`
        : `${focus.team} Encoding type preferences into team agreements early reduces collaboration drag in execution.`,
      whyTypeRelevant: isZh
        ? "职业匹配不仅是岗位本身，也包括你在团队中的协作成本与影响半径。"
        : "Role fit includes not just role scope but also collaboration cost and influence radius.",
      links: [
        { key: "to_type_detail", label: isZh ? "查看该类型协作画像" : "View type collaboration profile", href: routeBundle.personalityPath },
        { key: "to_topic", label: isZh ? "回到 MBTI 主题页" : "Back to MBTI topic", href: routeBundle.topicPath },
        { key: "to_growth_article", label: isZh ? "阅读成长实践指南" : "Read growth guide", href: routeBundle.growthArticlePath },
      ],
    },
    {
      sceneKey: "major_selection",
      title: isZh ? `${typeCode} 的专业选择与职业衔接` : `${typeCode} major choice to career linkage`,
      summary: isZh
        ? `${focus.major} 先用专业方向筛掉不适配路径，再进入岗位层验证，能减少反复试错成本。`
        : `${focus.major} Filter paths at major-level before role-level validation to reduce expensive trial-and-error.`,
      whyTypeRelevant: isZh
        ? "专业选择是职业路径前置决策，必须和人格偏好在同一框架里判断。"
        : "Major choice is an upstream career decision and should be evaluated with personality preference in one frame.",
      links: [
        { key: "to_topic", label: isZh ? "查看专业选择框架" : "Review major-selection framework", href: routeBundle.topicPath },
        { key: "to_narrative_article", label: isZh ? "阅读类型叙事画像" : "Read narrative portrait", href: routeBundle.narrativeArticlePath },
        {
          key: "to_test",
          label: isZh ? "开始测试补齐判断" : "Start test to complete decision",
          href: routeBundle.testPath,
          kind: "start_test",
          targetAction: "start_mbti_test_scene_major_selection",
        },
      ],
    },
  ];
}

export function buildMbtiTestLandingContinuityItems(locale: Locale): MbtiTestLandingContinuityItem[] {
  const isZh = locale === "zh";

  return [
    {
      key: "to_topic",
      title: isZh ? "先看 MBTI 主题框架" : "Start with the MBTI topic framework",
      body: isZh
        ? "如果你还不确定从哪个角度进入，先看 topic 框架再开始测试，会更容易理解后续结果。"
        : "If you are unsure where to start, review the topic framework first for cleaner result interpretation.",
      href: withLocale(locale, "/topics/mbti"),
    },
    {
      key: "to_personality",
      title: isZh ? "快速浏览人格类型" : "Quickly scan personality types",
      body: isZh
        ? "先看类型差异再进入测试，可以减少“只看标签”的误解。"
        : "A quick type scan before testing reduces label-only interpretation.",
      href: withLocale(locale, "/personality"),
    },
    {
      key: "to_recommendation",
      title: isZh ? "查看职业推荐入口" : "Preview career recommendation entry",
      body: isZh
        ? "你可以先看职业推荐入口，明确测试后最想验证的问题。"
        : "Preview recommendation entry to define what you want to validate after taking the test.",
      href: withLocale(locale, "/career/recommendations"),
    },
  ];
}
