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
    id: "learning_labs",
    label: { en: "Learning Labs", zh: "学习实验室" },
    detail: { en: "Educational cohorts", zh: "教育项目与学习社群" },
  },
  {
    id: "career_coaching",
    label: { en: "Career Coaching", zh: "职业教练团队" },
    detail: { en: "Career transition support", zh: "职业转型与辅导场景" },
  },
  {
    id: "people_ops",
    label: { en: "People Ops Teams", zh: "组织与人效团队" },
    detail: { en: "Team communication reviews", zh: "团队协作与沟通复盘" },
  },
  {
    id: "content_communities",
    label: { en: "Growth Communities", zh: "成长内容社群" },
    detail: { en: "Evidence-informed content", zh: "循证导向内容实践" },
  },
  {
    id: "mentorship_groups",
    label: { en: "Mentorship Programs", zh: "导师计划" },
    detail: { en: "1:1 reflection workflows", zh: "一对一成长反馈流程" },
  },
  {
    id: "research_review",
    label: { en: "Review Panels", zh: "评审小组" },
    detail: { en: "Structured interpretation feedback", zh: "结构化解读反馈机制" },
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "review_1",
    author: "A. Chen",
    role: { en: "Product Manager", zh: "产品经理" },
    quote: {
      en: "The structure is clear and the final explanation is practical enough to discuss with my team immediately.",
      zh: "结构清晰，最终结果解释足够实用，可以直接拿去和团队讨论下一步决策。",
    },
    testSlug: "big-five-personality-test-ocean-model",
    testLabel: { en: "Big Five test", zh: "大五人格测试" },
  },
  {
    id: "review_2",
    author: "M. Carter",
    role: { en: "Career Coach", zh: "职业教练" },
    quote: {
      en: "Clients finish it quickly and we can directly use the trait breakdown to plan next actions.",
      zh: "客户体验完整性不错，测试完成快，特质分解可以直接用于制定职业发展动作。",
    },
    testSlug: "mbti-personality-test-16-personality-types",
    testLabel: { en: "MBTI test", zh: "MBTI 性格测试" },
  },
  {
    id: "review_3",
    author: "S. Li",
    role: { en: "Team Lead", zh: "团队负责人" },
    quote: {
      en: "The report language is easy to align around, especially for communication and role-fit discussions.",
      zh: "报告语言对齐度高，尤其适合做沟通风格和角色匹配的讨论。",
    },
    testSlug: "clinical-depression-anxiety-assessment-professional-edition",
    testLabel: { en: "Clinical assessment", zh: "抑郁焦虑综合检测" },
  },
  {
    id: "review_4",
    author: "R. Gomez",
    role: { en: "Operations Analyst", zh: "运营分析师" },
    quote: {
      en: "I like the friction-free flow and the way it keeps the focus on useful decisions rather than labels.",
      zh: "交互顺畅，且始终把重点放在可执行决策，而不是停留在标签命名上。",
    },
    testSlug: "depression-screening-test-standard-edition",
    testLabel: { en: "Depression screening", zh: "抑郁测评（标准版）" },
  },
];
