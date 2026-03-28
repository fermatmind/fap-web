export type ScenarioValidation = {
  id: string;
  code: string;
  slotCode: string;
  protocol: string;
  status: string;
  label: {
    en: string;
    zh: string;
  };
  summary: {
    en: string;
    zh: string;
  };
  layer: {
    en: string;
    zh: string;
  };
  source: {
    en: string;
    zh: string;
  };
  detail: {
    en: string;
    zh: string;
  };
  output: {
    en: string;
    zh: string;
  };
};

export type EvidenceLog = {
  id: string;
  auditId: string;
  slotCode: string;
  date: string;
  verificationScore: string;
  author: string;
  signalLabel: {
    en: string;
    zh: string;
  };
  role: {
    en: string;
    zh: string;
  };
  quote: {
    en: string;
    zh: string;
  };
  scenario: {
    en: string;
    zh: string;
  };
  useCase: {
    en: string;
    zh: string;
  };
  verifiedValue: {
    en: string;
    zh: string;
  };
  testSlug: string;
  testLabel: {
    en: string;
    zh: string;
  };
  facetPreview: number[];
};

export const SCENARIO_VALIDATIONS: ScenarioValidation[] = [
  {
    id: "learning-groups",
    code: "S-01",
    slotCode: "DEPLOY-01",
    protocol: "LEARNING_FEEDBACK_LOOP",
    status: "VERIFIED",
    label: { en: "Learning cohorts", zh: "学习型群组" },
    summary: {
      en: "Used to stabilize project retrospectives and role re-alignment after multi-party work.",
      zh: "用于项目复盘与角色再校准，帮助多方协作中的判断收拢。",
    },
    layer: { en: "Learning retrospective layer", zh: "学习复盘层" },
    source: { en: "Role calibration interface", zh: "角色校准接口" },
    detail: {
      en: "Used for project retrospectives, role calibration, and growth feedback loops.",
      zh: "用于项目复盘、角色定位与成长反馈",
    },
    output: {
      en: "Retrospective calibration",
      zh: "复盘校准",
    },
  },
  {
    id: "coaching",
    code: "S-02",
    slotCode: "DEPLOY-02",
    protocol: "COACHING_DECISION_SUPPORT",
    status: "VERIFIED",
    label: { en: "Coaching practices", zh: "教练实践" },
    summary: {
      en: "Used as a structured decision scaffold inside education and career coaching conversations.",
      zh: "用于教育与职业辅导场景中的结构化决策支架。",
    },
    layer: { en: "Career coaching layer", zh: "生涯辅导层" },
    source: { en: "Decision support interface", zh: "决策支持接口" },
    detail: {
      en: "Used as structured reference in career-development judgment and coaching workflows.",
      zh: "用于职业发展判断与辅导流程中的结构化参考",
    },
    output: {
      en: "Career judgment reference",
      zh: "职业判断参考",
    },
  },
  {
    id: "org-reviews",
    code: "S-03",
    slotCode: "DEPLOY-03",
    protocol: "ROLE_FIT_DIAGNOSTICS",
    status: "VERIFIED",
    label: { en: "Org & people reviews", zh: "组织与人效复盘" },
    summary: {
      en: "Used in collaboration reviews and role-fit diagnostics where judgment needs a shared reference.",
      zh: "用于协作复盘与岗位拟合判断，为多人讨论提供共享参照。",
    },
    layer: { en: "Organization review layer", zh: "组织复盘层" },
    source: { en: "Role-fit diagnostic interface", zh: "岗位拟合接口" },
    detail: {
      en: "Used in collaboration reviews, role fit discussions, and communication diagnostics.",
      zh: "用于协作、岗位拟合与沟通机制讨论",
    },
    output: {
      en: "Role-fit diagnostics",
      zh: "岗位诊断",
    },
  },
  {
    id: "mentor-network",
    code: "S-04",
    slotCode: "DEPLOY-04",
    protocol: "LONG_HORIZON_CHECKPOINT",
    status: "VERIFIED",
    label: { en: "Mentor networks", zh: "导师网络" },
    summary: {
      en: "Used in long-horizon growth checkpoints where early labels need to be translated into path decisions.",
      zh: "用于长期成长校验点，把早期结果转化为路径判断。",
    },
    layer: { en: "Mentorship conversation layer", zh: "导师对谈层" },
    source: { en: "Long-horizon checkpoint interface", zh: "长期校验接口" },
    detail: {
      en: "Used inside long-horizon growth conversations and mentorship checkpoints.",
      zh: "用于长期成长路径中的认知对话",
    },
    output: {
      en: "Long-horizon checkpoint",
      zh: "长期校验点",
    },
  },
  {
    id: "research-communities",
    code: "S-05",
    slotCode: "DEPLOY-05",
    protocol: "METHOD_TRANSMISSION",
    status: "VERIFIED",
    label: { en: "Content & research communities", zh: "内容与研究社群" },
    summary: {
      en: "Used when evidence-informed writing needs a stable interpretation backbone rather than mood-driven claims.",
      zh: "用于循证写作与方法传播，避免观点只停留在感受层。",
    },
    layer: { en: "Editorial research layer", zh: "研究写作层" },
    source: { en: "Method transmission interface", zh: "方法传播接口" },
    detail: {
      en: "Used for evidence-informed writing, editorial curation, and method transmission.",
      zh: "用于循证写作、观点策展与方法传播",
    },
    output: {
      en: "Editorial method transfer",
      zh: "方法传播输出",
    },
  },
  {
    id: "ops-teams",
    code: "S-06",
    slotCode: "DEPLOY-06",
    protocol: "PRESSURE_CADENCE_REVIEW",
    status: "VERIFIED",
    label: { en: "Operations & management teams", zh: "运营与管理团队" },
    summary: {
      en: "Used to review pressure load, work division, and decision cadence inside operating teams.",
      zh: "用于运营与管理团队中的压力、分工与决策节奏复核。",
    },
    layer: { en: "Operational execution layer", zh: "运营执行层" },
    source: { en: "Cadence review interface", zh: "节奏复核接口" },
    detail: {
      en: "Used to judge pressure load, division of work, and decision cadence.",
      zh: "用于压力、分工与决策节奏判断",
    },
    output: {
      en: "Pressure cadence review",
      zh: "节奏复核",
    },
  },
];

export const EVIDENCE_LOGS: EvidenceLog[] = [
  {
    id: "log-01",
    auditId: "#FM-2026-089",
    slotCode: "REG-01",
    date: "2026-03-06",
    verificationScore: "5.0/5.0",
    author: "A. Chen",
    signalLabel: { en: "Team cohesion scan", zh: "团队协同校验" },
    role: { en: "Product Manager", zh: "产品经理" },
    quote: {
      en: "Used in a team discussion to separate immediate communication comfort from longer-term role alignment.",
      zh: "用于团队讨论中区分即时沟通顺畅感与长期岗位适配之间的差异。",
    },
    scenario: { en: "Team discussion", zh: "团队讨论" },
    useCase: { en: "Team cohesion scan", zh: "团队协同校验" },
    verifiedValue: {
      en: "Distinguishes communication smoothness from long-term role fit.",
      zh: "帮助区分沟通顺畅感与长期岗位适配之间的差异。",
    },
    testSlug: "big-five-personality-test-ocean-model",
    testLabel: { en: "Big Five Personality Test", zh: "大五人格测试" },
    facetPreview: [0, 2, 5, 8, 12, 17, 21, 24, 28],
  },
  {
    id: "log-02",
    auditId: "#FM-2026-104",
    slotCode: "REG-02",
    date: "2026-03-11",
    verificationScore: "4.9/5.0",
    author: "M. Carter",
    signalLabel: { en: "Career path decision", zh: "职业路径判断" },
    role: { en: "Career Coach", zh: "职业教练" },
    quote: {
      en: "Used in coaching flow to translate trait structure into the next executable guidance step.",
      zh: "用于辅导流程中把特质结构直接推进到下一步可执行建议。",
    },
    scenario: { en: "Coaching workflow", zh: "辅导流程" },
    useCase: { en: "Career path decision", zh: "职业路径判断" },
    verifiedValue: {
      en: "Moves the conversation from trait labels into the next executable coaching step.",
      zh: "把讨论从人格标签推进到下一步可执行的辅导动作。",
    },
    testSlug: "mbti-personality-test-16-personality-types",
    testLabel: { en: "MBTI Personality Test", zh: "MBTI 性格测试" },
    facetPreview: [1, 4, 7, 10, 14, 18, 19, 23, 27],
  },
  {
    id: "log-03",
    auditId: "#FM-2026-127",
    slotCode: "REG-03",
    date: "2026-03-17",
    verificationScore: "4.8/5.0",
    author: "S. Li",
    signalLabel: { en: "Team fit audit", zh: "岗位适配审计" },
    role: { en: "Team Lead", zh: "团队负责人" },
    quote: {
      en: "Used in role-fit review to create a shared language under collaboration and pressure discussions.",
      zh: "用于岗位匹配复核，在协作与高压讨论中建立共享判断语言。",
    },
    scenario: { en: "Role-fit review", zh: "岗位匹配讨论" },
    useCase: { en: "Team fit audit", zh: "岗位适配审计" },
    verifiedValue: {
      en: "Creates a shared language for discussing role alignment under pressure.",
      zh: "在高压讨论中建立岗位匹配的共享语言。",
    },
    testSlug: "clinical-depression-anxiety-assessment-professional-edition",
    testLabel: { en: "Depression & Anxiety Assessment", zh: "抑郁焦虑综合检测" },
    facetPreview: [0, 3, 6, 11, 15, 20, 22, 25, 29],
  },
  {
    id: "log-04",
    auditId: "#FM-2026-141",
    slotCode: "REG-04",
    date: "2026-03-21",
    verificationScore: "4.9/5.0",
    author: "R. Gomez",
    signalLabel: { en: "Risk-load review", zh: "风险负载复核" },
    role: { en: "Operations Analyst", zh: "运营分析师" },
    quote: {
      en: "Used in operations planning to keep the discussion anchored on actionable risk decisions rather than labels.",
      zh: "用于运营判断中把讨论锚定在可执行的风险决策，而不是抽象标签。",
    },
    scenario: { en: "Operational planning", zh: "运营判断" },
    useCase: { en: "Risk-load review", zh: "风险负载复核" },
    verifiedValue: {
      en: "Keeps the conversation on useful risk decisions instead of abstract labels.",
      zh: "让讨论停留在有用的风险判断上，而不是抽象标签。",
    },
    testSlug: "depression-screening-test-standard-edition",
    testLabel: { en: "Depression Screening (Standard)", zh: "抑郁测评（标准版）" },
    facetPreview: [2, 5, 9, 13, 16, 18, 22, 26, 28],
  },
];
