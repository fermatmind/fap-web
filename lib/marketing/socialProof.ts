export type SocialTrustSignal = {
  id: string;
  label: {
    en: string;
    zh: string;
  };
  detail: {
    en: string;
    zh: string;
  };
};

export type Testimonial = {
  id: string;
  author: string;
  role: {
    en: string;
    zh: string;
  };
  quote: {
    en: string;
    zh: string;
  };
  testSlug: string;
  testLabel: {
    en: string;
    zh: string;
  };
};

export const SOCIAL_TRUST_SIGNALS: SocialTrustSignal[] = [
  {
    id: "learning_cohorts",
    label: { en: "Learning Cohorts", zh: "学习型群组" },
    detail: { en: "Structured reflection inside study programs", zh: "用于学习项目中的结构化复盘" },
  },
  {
    id: "coaching_practices",
    label: { en: "Coaching Practices", zh: "教练实践" },
    detail: { en: "Career and growth coaching workflows", zh: "职业发展与成长辅导流程" },
  },
  {
    id: "people_ops_reviews",
    label: { en: "People Ops Reviews", zh: "组织与人效复盘" },
    detail: { en: "Communication and role-fit discussions", zh: "团队沟通与岗位适配讨论" },
  },
  {
    id: "mentorship_networks",
    label: { en: "Mentorship Networks", zh: "导师网络" },
    detail: { en: "Mentor-led growth conversations", zh: "导师主导的成长对话场景" },
  },
  {
    id: "editorial_communities",
    label: { en: "Editorial Communities", zh: "内容与研究社群" },
    detail: { en: "Evidence-informed writing and curation", zh: "循证导向的内容写作与策展" },
  },
  {
    id: "operator_teams",
    label: { en: "Operator Teams", zh: "运营与管理团队" },
    detail: { en: "Decision support for real operating contexts", zh: "服务真实管理与决策场景" },
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "review_1",
    author: "A. Chen",
    role: { en: "Product Manager", zh: "产品经理" },
    quote: {
      en: "The structure is clear and the final explanation is practical enough to discuss with my team immediately.",
      zh: "结构很清楚，最后给出的解释足够具体，拿去和团队讨论也不会显得空泛。",
    },
    testSlug: "big-five-personality-test-ocean-model",
    testLabel: { en: "Big Five Personality Test", zh: "大五人格测试" },
  },
  {
    id: "review_2",
    author: "M. Carter",
    role: { en: "Career Coach", zh: "职业教练" },
    quote: {
      en: "Clients finish it quickly and we can directly use the trait breakdown to plan next actions.",
      zh: "来访者完成得很快，而且我们可以直接根据分维度结果讨论下一步行动。",
    },
    testSlug: "mbti-personality-test-16-personality-types",
    testLabel: { en: "MBTI Personality Test", zh: "MBTI 性格测试" },
  },
  {
    id: "review_3",
    author: "S. Li",
    role: { en: "Team Lead", zh: "团队负责人" },
    quote: {
      en: "The report language is easy to align around, especially for communication and role-fit discussions.",
      zh: "报告语言很容易形成共识，尤其适合放到沟通协作和岗位匹配的讨论里。",
    },
    testSlug: "clinical-depression-anxiety-assessment-professional-edition",
    testLabel: { en: "Depression & Anxiety Assessment", zh: "抑郁焦虑综合检测" },
  },
  {
    id: "review_4",
    author: "R. Gomez",
    role: { en: "Operations Analyst", zh: "运营分析师" },
    quote: {
      en: "I like the no-friction flow and the way it keeps the focus on useful decisions rather than labels.",
      zh: "我喜欢它足够顺畅的流程，也喜欢它把重点放在有用的判断，而不是标签本身。",
    },
    testSlug: "depression-screening-test-standard-edition",
    testLabel: { en: "Depression Screening (Standard)", zh: "抑郁测评（标准版）" },
  },
];
