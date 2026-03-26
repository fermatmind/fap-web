export type ScenarioValidation = {
  id: string;
  code: string;
  protocol: string;
  label: {
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
  verificationScore: string;
  author: string;
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
    protocol: "LEARNING_FEEDBACK_LOOP",
    label: { en: "Learning cohorts", zh: "学习型群组" },
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
    protocol: "COACHING_DECISION_SUPPORT",
    label: { en: "Coaching practices", zh: "教练实践" },
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
    protocol: "ROLE_FIT_DIAGNOSTICS",
    label: { en: "Org & people reviews", zh: "组织与人效复盘" },
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
    protocol: "LONG_HORIZON_CHECKPOINT",
    label: { en: "Mentor networks", zh: "导师网络" },
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
    protocol: "METHOD_TRANSMISSION",
    label: { en: "Content & research communities", zh: "内容与研究社群" },
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
    protocol: "PRESSURE_CADENCE_REVIEW",
    label: { en: "Operations & management teams", zh: "运营与管理团队" },
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
    verificationScore: "5.0/5.0",
    author: "A. Chen",
    role: { en: "Product Manager", zh: "产品经理" },
    quote: {
      en: "The structure is clear and the final explanation is concrete enough to use in team discussion immediately.",
      zh: "结构很清楚，最后给出的解释足够具体，拿去和团队讨论也不会显得空泛。",
    },
    scenario: { en: "Team discussion", zh: "团队讨论" },
    useCase: { en: "Team cohesion scan", zh: "团队协同校验" },
    testSlug: "big-five-personality-test-ocean-model",
    testLabel: { en: "Big Five Personality Test", zh: "大五人格测试" },
    facetPreview: [0, 2, 5, 8, 12, 17, 21, 24, 28],
  },
  {
    id: "log-02",
    auditId: "#FM-2026-104",
    verificationScore: "4.9/5.0",
    author: "M. Carter",
    role: { en: "Career Coach", zh: "职业教练" },
    quote: {
      en: "Clients finish it quickly and we can move straight from the trait breakdown into the next practical step.",
      zh: "来访者完成得很快，而且我们可以直接根据分维度结果讨论下一步行动。",
    },
    scenario: { en: "Coaching workflow", zh: "辅导流程" },
    useCase: { en: "Career path decision", zh: "职业路径判断" },
    testSlug: "mbti-personality-test-16-personality-types",
    testLabel: { en: "MBTI Personality Test", zh: "MBTI 性格测试" },
    facetPreview: [1, 4, 7, 10, 14, 18, 19, 23, 27],
  },
  {
    id: "log-03",
    auditId: "#FM-2026-127",
    verificationScore: "4.8/5.0",
    author: "S. Li",
    role: { en: "Team Lead", zh: "团队负责人" },
    quote: {
      en: "The report language creates fast alignment, especially when we are discussing collaboration and role fit.",
      zh: "报告语言很容易形成共识，尤其适合放到沟通协作和岗位匹配的讨论里。",
    },
    scenario: { en: "Role-fit review", zh: "岗位匹配讨论" },
    useCase: { en: "Team fit audit", zh: "岗位适配审计" },
    testSlug: "clinical-depression-anxiety-assessment-professional-edition",
    testLabel: { en: "Depression & Anxiety Assessment", zh: "抑郁焦虑综合检测" },
    facetPreview: [0, 3, 6, 11, 15, 20, 22, 25, 29],
  },
  {
    id: "log-04",
    auditId: "#FM-2026-141",
    verificationScore: "4.9/5.0",
    author: "R. Gomez",
    role: { en: "Operations Analyst", zh: "运营分析师" },
    quote: {
      en: "I like how smooth the flow is and how it keeps attention on useful decisions rather than labels.",
      zh: "我喜欢它足够顺畅的流程，也喜欢它把重点放在有用的判断，而不是标签本身。",
    },
    scenario: { en: "Operational planning", zh: "运营判断" },
    useCase: { en: "Risk-load review", zh: "风险负载复核" },
    testSlug: "depression-screening-test-standard-edition",
    testLabel: { en: "Depression Screening (Standard)", zh: "抑郁测评（标准版）" },
    facetPreview: [2, 5, 9, 13, 16, 18, 22, 26, 28],
  },
];
