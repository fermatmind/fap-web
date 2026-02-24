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
  role: string;
  quote: string;
  testSlug: string;
  testLabel: string;
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
    role: "Product Manager",
    quote: "The structure is clear and the final explanation is practical enough to discuss with my team immediately.",
    testSlug: "big-five-personality-test",
    testLabel: "Big Five test",
  },
  {
    id: "review_2",
    author: "M. Carter",
    role: "Career Coach",
    quote: "Clients finish it quickly and we can directly use the trait breakdown to plan next actions.",
    testSlug: "personality-mbti-test",
    testLabel: "MBTI test",
  },
  {
    id: "review_3",
    author: "S. Li",
    role: "Team Lead",
    quote: "The report language is easy to align around, especially for communication and role-fit discussions.",
    testSlug: "disc-personality-test",
    testLabel: "DISC test",
  },
  {
    id: "review_4",
    author: "R. Gomez",
    role: "Operations Analyst",
    quote: "I like the no-friction flow and the way it keeps the focus on useful decisions rather than labels.",
    testSlug: "stress-level-check",
    testLabel: "Stress level check",
  },
];
