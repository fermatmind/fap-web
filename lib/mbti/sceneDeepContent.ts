import type { Locale } from "@/lib/i18n/locales";

export const MBTI_SCENE_DEEP_PRIORITY_TYPES = [
  "ENTJ",
  "INTP",
  "INTJ",
  "ENFJ",
  "ENTP",
  "INFJ",
  "ENFP",
  "ESTP",
  "ISTJ",
  "ISFJ",
] as const;
export type MbtiSceneDeepPriorityType = (typeof MBTI_SCENE_DEEP_PRIORITY_TYPES)[number];

export const MBTI_SCENE_DEEP_GROWTH_EXPANSION_TYPES = [
  "ENTP",
  "INFJ",
  "ENFP",
  "ESTP",
  "ISTJ",
  "ISFJ",
] as const;
export type MbtiSceneDeepGrowthExpansionType = (typeof MBTI_SCENE_DEEP_GROWTH_EXPANSION_TYPES)[number];

export const MBTI_SCENE_DEEP_PRIORITY_SCENES = [
  "career_direction",
  "team_collaboration",
  "major_selection",
  "growth_planning",
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

function isGrowthExpansionType(typeCode: string): typeCode is MbtiSceneDeepGrowthExpansionType {
  return MBTI_SCENE_DEEP_GROWTH_EXPANSION_TYPES.includes(typeCode as MbtiSceneDeepGrowthExpansionType);
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
  const entpBundle = buildPriorityRouteBundle(locale, "ENTP");
  const infjBundle = buildPriorityRouteBundle(locale, "INFJ");
  const enfpBundle = buildPriorityRouteBundle(locale, "ENFP");
  const estpBundle = buildPriorityRouteBundle(locale, "ESTP");
  const istjBundle = buildPriorityRouteBundle(locale, "ISTJ");
  const isfjBundle = buildPriorityRouteBundle(locale, "ISFJ");
  const guidePath = withLocale(locale, "/career/guides/from-mbti-to-job-fit");
  const growthGuidePath = withLocale(locale, "/articles/mbti-growth-guide");
  const testPath = withLocale(locale, "/tests/mbti-personality-test-16-personality-types");

  return [
    {
      sceneKey: "career_direction",
      title: isZh ? "职业方向：先核任务证据，再讨论工作偏好" : "Career direction: frame fit first, then evaluate roles",
      summary: isZh
        ? "把类型描述作为讨论问题，分别核对岗位任务、兴趣、能力证据、反馈节奏与现实条件。推荐页的分组只能提供待检验线索，不能证明适配、能力或工作结果。"
        : "Map type preferences to role scope, feedback rhythm, and growth path before diving into recommendation detail and primary/secondary fit. This avoids title-only decisions.",
      whyTypeRelevant: isZh
        ? "跨类型阅读可以帮助提出不同的讨论问题；是否符合你的经历，要用具体任务、行为和反例核对，不能从类型推出职业结论。"
        : "The MBTI topic hub is best for cross-type comparison before committing to one career lane.",
      links: [
        { key: "go_recommendation_hub", label: isZh ? "查看职业推荐入口" : "Open career recommendations", href: recommendationPath },
        {
          key: "go_entp_recommendation",
          label: isZh ? "查看 ENTP 职业探索线索" : "See ENTP recommendation sample",
          href: entpBundle.recommendationPath,
        },
        { key: "go_mbti_guide", label: isZh ? "阅读职业探索指南" : "Read MBTI job-fit guide", href: guidePath },
        {
          key: "start_mbti_test",
          label: isZh ? "开始 MBTI 免费测试" : "Start the free MBTI test",
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
        ? "先记录协作中的具体分歧、信息缺口与反馈需求，再把类型描述作为待核对的问题。沟通约定应结合任务、角色和参与者的实际意见。"
        : "Most collaboration friction comes from mismatched information and feedback styles. Type detail plus topic-level synthesis helps teams set clear operating rules.",
      whyTypeRelevant: isZh
        ? "同一类型的人也可能有不同需求。先询问对方需要什么信息与支持，再观察约定是否适用于这次任务，不按类型分配角色。"
        : "Different types expect different cadence, transparency, and conflict handling. Structured interpretation is required before action.",
      links: [
        { key: "go_personality_hub", label: isZh ? "查看人格类型索引" : "Browse personality types", href: personalityPath },
        {
          key: "go_infj_profile",
          label: isZh ? "查看 INFJ 协作画像" : "Review INFJ collaboration profile",
          href: infjBundle.personalityPath,
        },
        {
          key: "go_estp_profile",
          label: isZh ? "查看 ESTP 协作画像" : "Review ESTP collaboration profile",
          href: estpBundle.personalityPath,
        },
        { key: "go_growth_article", label: isZh ? "阅读成长实践指南" : "Read growth guide", href: withLocale(locale, "/articles/mbti-growth-guide") },
        { key: "go_topic_hub", label: isZh ? "回到 MBTI 主题页" : "Return to MBTI topic hub", href: topicPath },
      ],
    },
    {
      sceneKey: "major_selection",
      title: isZh ? "专业选择：核对课程、兴趣与能力证据" : "Major selection: use type signals, not trend-only choices",
      summary: isZh
        ? "专业选择需要核对课程任务、学习兴趣、已有能力证据与投入条件。类型说明可用于提出自我观察问题，不能代替课程体验或确定适合的专业。"
        : "Major choice should align motivation, work-environment preference, and long-term commitment. Use MBTI as the frame, then validate with type and recommendation pages.",
      whyTypeRelevant: isZh
        ? "投入或困难的原因需要结合具体经历核对。类型描述不能单独解释原因，也不能据此排除一个专业或承诺学习结果。"
        : "Type is not destiny, but it explains why some paths compound and others keep causing friction.",
      links: [
        { key: "go_topic_hub", label: isZh ? "查看 MBTI 主题框架" : "Review MBTI topic framework", href: topicPath },
        {
          key: "go_istj_profile",
          label: isZh ? "查看 ISTJ 类型讨论线索" : "Review ISTJ major-fit profile",
          href: istjBundle.personalityPath,
        },
        {
          key: "go_isfj_profile",
          label: isZh ? "查看 ISFJ 类型讨论线索" : "Review ISFJ major-fit profile",
          href: isfjBundle.personalityPath,
        },
        { key: "go_narrative_article", label: isZh ? "阅读类型叙事画像" : "Read narrative portrait", href: withLocale(locale, "/articles/mbti-narrative-portrait") },
        {
          key: "start_mbti_test",
          label: isZh ? "了解测试与使用边界" : "Take test before choosing path",
          href: testPath,
          kind: "start_test",
          targetAction: "start_mbti_test_scene_major_selection",
        },
      ],
    },
    {
      sceneKey: "growth_planning",
      title: isZh
        ? "成长建议：用具体行为与反例复盘"
        : "Growth planning: convert type strengths into quarter-level actions",
      summary: isZh
        ? "从一个可观察的日常问题开始，记录行为、情境与反例，再选择低风险、可退出的调整。类型与推荐内容只提供讨论线索，不替你确定行动优先级。"
        : "Growth depth is now expanded for ENTP, INFJ, ENFP, ESTP, ISTJ, and ISFJ. Use topic-level framing first, then validate action priority in type and recommendation layers.",
      whyTypeRelevant: isZh
        ? "是否有帮助，需要根据你的任务、资源和实际观察复盘。测试结果不能保证成长或持续执行，也不用于判断能力与未来结果。"
        : "Growth guidance must align with type-specific drive patterns and constraints, otherwise execution decays after initial intent.",
      links: [
        { key: "go_growth_article", label: isZh ? "阅读 MBTI 成长指南" : "Read MBTI growth guide", href: growthGuidePath },
        {
          key: "go_enfp_recommendation",
          label: isZh ? "查看 ENFP 成长讨论线索" : "Open ENFP growth-oriented recommendation",
          href: enfpBundle.recommendationPath,
        },
        {
          key: "go_infj_recommendation",
          label: isZh ? "查看 INFJ 成长讨论线索" : "Open INFJ growth-oriented recommendation",
          href: infjBundle.recommendationPath,
        },
        {
          key: "start_mbti_test",
          label: isZh ? "MBTI免费测试" : "Free MBTI test",
          href: testPath,
          kind: "start_test",
          targetAction: "start_mbti_test_scene_growth_planning",
        },
      ],
    },
  ];
}

function buildPriorityTypeFocus(typeCode: MbtiSceneDeepPriorityType, locale: Locale): {
  career: string;
  team: string;
  major: string;
  growth: string;
} {
  const isZh = locale === "zh";
  const zhMap: Record<MbtiSceneDeepPriorityType, { career: string; team: string; major: string; growth: string }> = {
    ENTJ: {
      career: "ENTJ 通常更容易在高目标密度、可衡量产出和决策权明确的岗位中持续增长。",
      team: "ENTJ 在协作中擅长推进决策，但需要显式管理“速度快于共识”的风险。",
      major: "ENTJ 做专业选择时，应优先考虑是否能长期进入战略与执行一体化场景。",
      growth: "ENTJ 的成长建议要把“高标准”落成可授权流程，否则容易陷入亲自兜底。",
    },
    INTP: {
      career: "INTP 往往在问题定义复杂、允许深度思考与模型迭代的岗位中表现更稳定。",
      team: "INTP 协作优势在于结构化推理，需要配套明确的同步机制避免信息断层。",
      major: "INTP 选择专业时，应优先看是否支持长期探索与抽象能力持续增长。",
      growth: "INTP 的成长建议应围绕“研究-表达-落地”闭环，避免只停留在思考层。",
    },
    INTJ: {
      career: "INTJ 在系统设计与长期规划导向岗位中更容易形成复利优势。",
      team: "INTJ 协作中重视逻辑一致性，需要把隐含判断前提显式化来降低误解。",
      major: "INTJ 做专业选择时，应优先看长期路径与能力杠杆，而不是短期热门度。",
      growth: "INTJ 的成长建议重点是把长期规划拆成可验证里程碑，避免策略过重执行过慢。",
    },
    ENFJ: {
      career: "ENFJ 通常在需要驱动人和目标对齐、兼顾沟通与推进的岗位里更有优势。",
      team: "ENFJ 协作中擅长组织共识，但需要避免过度承担情绪调和成本。",
      major: "ENFJ 选择专业时应同时评估价值感、协作密度和长期发展空间。",
      growth: "ENFJ 的成长建议要兼顾边界管理与影响力扩张，避免长期情绪透支。",
    },
    ENTP: {
      career: "ENTP 在高变化、需要快速试错与策略迭代的岗位中更容易把想法转成机会。",
      team: "ENTP 协作优势在于激发方案空间，但需要补足收敛机制与责任边界。",
      major: "ENTP 选择专业时应优先考虑跨学科弹性与项目驱动学习环境。",
      growth: "ENTP 的成长建议应聚焦“发散后收敛”的执行闭环，避免想法密度高于交付密度。",
    },
    INFJ: {
      career: "INFJ 通常在需要长期洞察、价值判断与深度沟通的岗位中更具持续优势。",
      team: "INFJ 协作中重视意义与信任，需要把隐性判断转成团队可见规则。",
      major: "INFJ 选择专业时应结合价值感、研究深度与未来影响半径评估方向。",
      growth: "INFJ 的成长建议要把理想目标拆解成可度量行动，防止长期只在内在准备阶段。",
    },
    ENFP: {
      career: "ENFP 在人群连接与新机会探索导向岗位中更容易形成阶段性突破。",
      team: "ENFP 协作优势是激活团队动能，但要设置优先级边界避免并行过载。",
      major: "ENFP 选专业时要优先看是否支持项目实践与多路径探索。",
      growth: "ENFP 的成长建议应围绕“聚焦单一主线 + 保留探索窗口”来稳定输出。",
    },
    ESTP: {
      career: "ESTP 在即时反馈强、需要临场判断与资源调度的岗位里通常表现更快。",
      team: "ESTP 协作中擅长推进行动，但要补足复盘机制避免重复踩坑。",
      major: "ESTP 选专业时应优先关注实践密度、现实反馈速度与应用场景。",
      growth: "ESTP 的成长建议要把“快速行动”配上结构化复盘，才能形成长期复利。",
    },
    ISTJ: {
      career: "ISTJ 在规则清晰、质量要求高、流程可优化的岗位里更容易建立稳定优势。",
      team: "ISTJ 协作中擅长守住执行质量，需提前同步变化预案以提升灵活性。",
      major: "ISTJ 选专业时应优先考虑知识体系完整且可长期深耕的方向。",
      growth: "ISTJ 的成长建议重点是逐步提高不确定环境下的应变容量，而非放弃稳健优势。",
    },
    ISFJ: {
      career: "ISFJ 通常在需要稳定支持、服务质量与长期责任感的岗位中表现突出。",
      team: "ISFJ 协作优势在于可靠交付，但需要主动表达边界与资源需求。",
      major: "ISFJ 选专业时应结合长期服务价值与可持续投入节奏判断。",
      growth: "ISFJ 的成长建议应围绕“稳定贡献 + 主动进阶”双轨设计，避免长期低估自身杠杆。",
    },
  };
  const enMap: Record<MbtiSceneDeepPriorityType, { career: string; team: string; major: string; growth: string }> = {
    ENTJ: {
      career: "ENTJ usually compounds faster in roles with explicit ownership, measurable outcomes, and strategic leverage.",
      team: "ENTJ often drives decisions quickly and should explicitly manage pace-vs-consensus risk.",
      major: "ENTJ major decisions should prioritize strategic leverage and long-term execution scope.",
      growth: "ENTJ growth plans should turn high standards into delegable operating systems, not personal overextension.",
    },
    INTP: {
      career: "INTP tends to perform best in roles with complex problem framing and room for model iteration.",
      team: "INTP collaboration strengths are analytical clarity and should be paired with explicit sync rituals.",
      major: "INTP major choices should optimize for deep exploration and long-horizon learning loops.",
      growth: "INTP growth plans should enforce a research-to-delivery loop so insight consistently reaches execution.",
    },
    INTJ: {
      career: "INTJ compounds in system-design and long-range planning roles with clear autonomy boundaries.",
      team: "INTJ collaboration benefits from making hidden assumptions explicit early in group decisions.",
      major: "INTJ major selection should prioritize long-term capability leverage over short-term trend signals.",
      growth: "INTJ growth planning should decompose strategic intent into verifiable milestones to avoid execution lag.",
    },
    ENFJ: {
      career: "ENFJ often scales in roles that align people, goals, and execution under changing constraints.",
      team: "ENFJ collaboration strengths include alignment and momentum, with caution on emotional over-ownership.",
      major: "ENFJ major choices should balance purpose fit, collaboration density, and growth runway.",
      growth: "ENFJ growth plans should pair influence expansion with boundary management to prevent emotional burnout.",
    },
    ENTP: {
      career: "ENTP scales in roles that reward rapid experimentation, reframing, and strategic opportunity sensing.",
      team: "ENTP collaboration works best with strong ideation plus explicit convergence and ownership rules.",
      major: "ENTP major choices should favor interdisciplinary flexibility and project-driven learning environments.",
      growth: "ENTP growth plans should enforce convergence after exploration so idea volume turns into shipped outcomes.",
    },
    INFJ: {
      career: "INFJ often compounds in roles requiring long-horizon insight, value judgment, and deep communication.",
      team: "INFJ collaboration benefits from turning implicit judgment into explicit team-level decision rules.",
      major: "INFJ major selection should balance purpose alignment, depth of inquiry, and long-term impact.",
      growth: "INFJ growth plans should translate ideals into measurable action loops to avoid permanent preparation mode.",
    },
    ENFP: {
      career: "ENFP tends to grow quickly in people-facing roles with high opportunity discovery and momentum building.",
      team: "ENFP collaboration strengths include energy activation; explicit priority boundaries prevent overload.",
      major: "ENFP major choices should prioritize practical exploration space and optionality in path design.",
      growth: "ENFP growth planning should anchor one clear execution lane while preserving a bounded exploration window.",
    },
    ESTP: {
      career: "ESTP performs strongly in roles with fast feedback, real-world constraints, and decisive resource moves.",
      team: "ESTP collaboration gains when rapid action is paired with explicit retrospective and learning loops.",
      major: "ESTP major selection should prioritize practice density, applied context, and immediate feedback cycles.",
      growth: "ESTP growth plans should combine speed with structured retrospectives to convert action into repeatable edge.",
    },
    ISTJ: {
      career: "ISTJ compounds in roles with high quality standards, clear structures, and process optimization leverage.",
      team: "ISTJ collaboration strengths include reliability and quality; proactive change briefings improve adaptability.",
      major: "ISTJ major choices should favor coherent knowledge systems and long-run professional depth.",
      growth: "ISTJ growth planning should expand uncertainty-handling capacity without abandoning core execution strength.",
    },
    ISFJ: {
      career: "ISFJ grows in roles centered on dependable support, service quality, and long-term responsibility.",
      team: "ISFJ collaboration strength is stable delivery; proactive boundary signaling prevents hidden load build-up.",
      major: "ISFJ major choices should align contribution value with sustainable investment rhythm.",
      growth: "ISFJ growth plans should pair stable contribution with deliberate capability upgrades to avoid plateauing.",
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

  const modules: MbtiSceneDeepModule[] = [
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
          label: isZh ? "MBTI免费测试" : "Free MBTI test",
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
          label: isZh ? "MBTI免费测试" : "Free MBTI test",
          href: routeBundle.testPath,
          kind: "start_test",
          targetAction: "start_mbti_test_scene_major_selection",
        },
      ],
    },
  ];

  if (isGrowthExpansionType(typeCode)) {
    modules.push({
      sceneKey: "growth_planning",
      title: isZh ? `${typeCode} 的成长建议路径` : `${typeCode} growth-planning route`,
      summary: isZh
        ? `${focus.growth} 先在类型页确认你的主增长杠杆，再去 recommendation 页把它映射到具体行动场景。`
        : `${focus.growth} Confirm your primary growth lever on type detail first, then map it to concrete action contexts on recommendation pages.`,
      whyTypeRelevant: isZh
        ? `${focus.growth} 成长建议只有和该类型的驱动模式匹配，才会持续有效。`
        : `${focus.growth} Growth advice only compounds when it matches this type's drive pattern.`,
      links: [
        { key: "to_growth_article", label: isZh ? "阅读成长实践指南" : "Read growth guide", href: routeBundle.growthArticlePath },
        {
          key: "to_recommendation",
          label: isZh ? "查看该类型职业推荐" : "Open type recommendation",
          href: routeBundle.recommendationPath,
        },
        {
          key: "to_test",
          label: isZh ? "MBTI免费测试" : "Free MBTI test",
          href: routeBundle.testPath,
          kind: "start_test",
          targetAction: "start_mbti_test_scene_growth_planning",
        },
      ],
    });
  }

  return modules;
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

  const modules: MbtiSceneDeepModule[] = [
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
          label: isZh ? "MBTI免费测试" : "Free MBTI test",
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
          label: isZh ? "MBTI免费测试" : "Free MBTI test",
          href: routeBundle.testPath,
          kind: "start_test",
          targetAction: "start_mbti_test_scene_major_selection",
        },
      ],
    },
  ];

  if (isGrowthExpansionType(typeCode)) {
    modules.push({
      sceneKey: "growth_planning",
      title: isZh ? `${typeCode} 成长建议的职业化落点` : `${typeCode} growth advice with career execution`,
      summary: isZh
        ? `${focus.growth} 在 recommendation 层要把成长建议落成“岗位选择 + 协作机制 + 学习节奏”三件事。`
        : `${focus.growth} On recommendation pages, growth guidance should resolve into role choice, collaboration setup, and learning cadence.`,
      whyTypeRelevant: isZh
        ? "同一个成长动作在不同类型上成本差异很大，必须按类型配置执行路径。"
        : "The same growth action has very different costs across types, so execution paths must be type-configured.",
      links: [
        { key: "to_growth_article", label: isZh ? "阅读成长实践指南" : "Read growth guide", href: routeBundle.growthArticlePath },
        {
          key: "to_type_detail",
          label: isZh ? "回到类型页校准倾向" : "Return to type detail for calibration",
          href: routeBundle.personalityPath,
        },
        {
          key: "to_test",
          label: isZh ? "MBTI免费测试" : "Free MBTI test",
          href: routeBundle.testPath,
          kind: "start_test",
          targetAction: "start_mbti_test_scene_growth_planning",
        },
      ],
    });
  }

  return modules;
}

export function buildMbtiTestLandingContinuityItems(locale: Locale): MbtiTestLandingContinuityItem[] {
  const isZh = locale === "zh";

  return [
    {
      key: "to_intp_scene_summary",
      title: isZh ? "先探索 INTP 轮廓" : "Explore the INTP profile first",
      body: isZh
        ? "先看 INTP 人格页，快速确认职业偏好、协作方式和成长建议的落地差异。"
        : "Start with the INTP personality profile to confirm practical differences in career fit, collaboration style, and growth direction.",
      href: withLocale(locale, "/topics/mbti"),
    },
    {
      key: "to_personality",
      title: isZh ? "快速浏览人格类型" : "Quickly scan personality types",
      body: isZh
        ? "先看类型差异再进入测试，可以减少“只看标签”的误解，也更容易选定你的优先场景。"
        : "A quick type scan before testing reduces label-only interpretation and helps you choose a priority scenario.",
      href: withLocale(locale, "/personality"),
    },
    {
      key: "to_recommendation",
      title: isZh ? "看职业建议" : "Review career recommendations",
      body: isZh
        ? "先看职业建议，明确你想验证的场景，再回到测试前会更容易形成有效决策闭环。"
        : "Review career recommendations first so the test can be used to validate clearer decisions.",
      href: withLocale(locale, "/career/recommendations"),
    },
    {
      key: "to_recommendation_intp",
      title: isZh ? "看 INTP 团队协作与成长建议" : "Review INTP team collaboration and growth guidance",
      body: isZh
        ? "如果你需要立即判断协作摩擦和成长节奏，先去 INTP 类型页里拿到可执行承接。"
        : "If you need immediate clarity on collaboration friction and growth cadence, go to INTP pages for the execution-first continuation.",
      href: withLocale(locale, "/personality/intp-a"),
    },
  ];
}
