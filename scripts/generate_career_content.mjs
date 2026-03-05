import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

function yamlList(items, indent = 0) {
  const prefix = " ".repeat(indent);
  return items.map((item) => `${prefix}- ${String(item).replace(/\n/g, " ")}`).join("\n");
}

function buildJobFrontmatter({
  slug,
  locale,
  title,
  summary,
  industry,
  salary,
  outlook,
  skills,
  work,
  growth,
  fit,
  mbtiPrimary,
  mbtiSecondary,
  riasec,
  big5,
  iq,
  eq,
  market,
}) {
  return `---
slug: ${slug}
locale: ${locale}
title: "${title}"
summary: "${summary}"
industry_slug: ${industry}
salary_range: "${salary}"
job_outlook: "${outlook}"
skills:
${yamlList(skills, 2)}
work_contents:
${yamlList(work, 2)}
growth_path:
${yamlList(growth, 2)}
fit_personality:
${yamlList(fit, 2)}
mbti_primary:
${yamlList(mbtiPrimary, 2)}
mbti_secondary:
${yamlList(mbtiSecondary, 2)}
riasec_vector:
  R: ${riasec.R}
  I: ${riasec.I}
  A: ${riasec.A}
  S: ${riasec.S}
  E: ${riasec.E}
  C: ${riasec.C}
big5_targets:
  openness:
    min: ${big5.openness.min}
    max: ${big5.openness.max}
  conscientiousness:
    min: ${big5.conscientiousness.min}
    max: ${big5.conscientiousness.max}
  extraversion:
    min: ${big5.extraversion.min}
    max: ${big5.extraversion.max}
  agreeableness:
    min: ${big5.agreeableness.min}
    max: ${big5.agreeableness.max}
  neuroticism:
    min: ${big5.neuroticism.min}
    max: ${big5.neuroticism.max}
iq_range:
  min: ${iq.min}
  max: ${iq.max}
eq_range:
  min: ${eq.min}
  max: ${eq.max}
market_demand: ${market}
updatedAt: "2026-03-05"
---`;
}

const industries = [
  {
    slug: "technology",
    en: {
      title: "Technology Industry",
      summary: "Innovation-driven sector covering software, AI, cloud, and digital products.",
      overview: "Technology remains the most dynamic talent market and rewards continuous learning.",
      salary: "Entry to senior pay rises quickly with specialization and product impact.",
      growth: "Strong growth in AI, cloud-native engineering, cybersecurity, and data platforms.",
      trends: [
        "AI productization is reshaping job scopes across technical and non-technical roles.",
        "Cross-functional collaboration and product sense are becoming core hiring criteria.",
        "Security and privacy-by-design capabilities are now baseline expectations.",
      ],
    },
    zh: {
      title: "科技行业",
      summary: "以创新驱动的行业，覆盖软件、AI、云计算与数字化产品。",
      overview: "科技行业仍是变化最快的人才市场，持续学习是核心竞争力。",
      salary: "从初级到高级阶段，薪酬会随着专业深度和产品影响力快速提升。",
      growth: "AI、云原生工程、安全与数据平台方向保持强增长。",
      trends: [
        "AI 产品化正在重塑技术与非技术岗位的职责边界。",
        "跨职能协作能力与产品意识成为招聘核心标准。",
        "安全与隐私内建能力已从加分项变为基础要求。",
      ],
    },
    jobs: ["software-engineer", "frontend-engineer", "backend-engineer", "data-scientist", "cloud-architect"],
  },
  {
    slug: "finance",
    en: {
      title: "Finance Industry",
      summary: "Capital allocation, risk management, and financial decision support across markets.",
      overview: "Finance values analytical rigor, regulatory awareness, and disciplined execution.",
      salary: "Compensation is competitive with clear links to performance and risk responsibility.",
      growth: "Growth continues in fintech analytics, quantitative investing, and compliance tech.",
      trends: [
        "Data automation is reducing repetitive reporting and elevating strategic analysis.",
        "Regulatory transparency requirements are increasing demand for governance roles.",
        "Hybrid finance-tech profiles are becoming more valuable than single-track specialists.",
      ],
    },
    zh: {
      title: "金融行业",
      summary: "围绕资本配置、风险管理和财务决策支持展开的核心行业。",
      overview: "金融行业强调分析严谨性、合规意识与稳定执行力。",
      salary: "整体薪酬竞争力高，通常与绩效结果和风险责任直接挂钩。",
      growth: "金融科技分析、量化投资与合规科技方向持续增长。",
      trends: [
        "数据自动化正在减少重复报表工作，提升策略分析价值。",
        "监管透明度要求提升，带动治理与合规岗位需求。",
        "金融+技术复合型人才价值持续上升。",
      ],
    },
    jobs: ["investment-analyst", "financial-planner", "business-analyst"],
  },
  {
    slug: "healthcare",
    en: {
      title: "Healthcare Industry",
      summary: "Clinical services, patient outcomes, and medical system operations.",
      overview: "Healthcare combines human-centered service with strict professional standards.",
      salary: "Compensation varies by specialty, credential, and care setting complexity.",
      growth: "Aging populations and digital health are expanding demand for multidisciplinary talent.",
      trends: [
        "Telehealth and digital records are changing care workflows.",
        "Mental-health support roles are gaining broader social recognition.",
        "Quality and safety metrics are increasingly tied to team incentives.",
      ],
    },
    zh: {
      title: "医疗行业",
      summary: "围绕临床服务、患者结局与医疗系统运营展开的行业。",
      overview: "医疗行业兼具以人为本服务和严格专业规范两大特征。",
      salary: "薪酬受专业方向、资质等级和服务场景复杂度影响较大。",
      growth: "人口老龄化与数字医疗推动复合型人才需求持续提升。",
      trends: [
        "远程医疗与电子病历正在重塑服务流程。",
        "心理健康支持岗位获得更广泛社会重视。",
        "质量与安全指标越来越与团队绩效绑定。",
      ],
    },
    jobs: ["physician", "nurse", "pharmacist", "psychological-counselor"],
  },
  {
    slug: "education",
    en: {
      title: "Education Industry",
      summary: "Learning design, teaching delivery, and student development services.",
      overview: "Education rewards long-term influence, communication clarity, and patience.",
      salary: "Salary ranges vary by institution, subject, and teaching stage.",
      growth: "EdTech and lifelong learning are creating new pathways beyond traditional schools.",
      trends: [
        "Blended learning models are now common in both K-12 and higher education.",
        "Outcome-based curriculum design is replacing content-only delivery.",
        "Career readiness and interdisciplinary competencies are rising priorities.",
      ],
    },
    zh: {
      title: "教育行业",
      summary: "聚焦课程设计、教学交付与学习者发展支持的行业。",
      overview: "教育行业强调长期影响力、清晰沟通和耐心陪伴。",
      salary: "薪酬区间受机构类型、学科方向和教学阶段影响显著。",
      growth: "教育科技与终身学习推动了传统学校之外的新职业路径。",
      trends: [
        "线上线下融合教学成为常态。",
        "以学习结果为导向的课程设计逐步替代内容堆叠。",
        "职业准备度和跨学科能力成为关键指标。",
      ],
    },
    jobs: ["teacher", "researcher"],
  },
  {
    slug: "design",
    en: {
      title: "Design Industry",
      summary: "Creative problem solving across product, brand, and service experiences.",
      overview: "Design careers blend user insight, visual communication, and iterative testing.",
      salary: "Compensation grows with portfolio quality and business impact of design decisions.",
      growth: "Demand is strong in product UX, service design, and brand systems.",
      trends: [
        "Design systems are becoming strategic infrastructure in product organizations.",
        "Research-informed design is replacing purely aesthetic decision-making.",
        "AI-assisted design workflows are accelerating production cycles.",
      ],
    },
    zh: {
      title: "设计行业",
      summary: "在产品、品牌与服务体验中进行创造性问题解决的行业。",
      overview: "设计职业融合用户洞察、视觉沟通和迭代验证能力。",
      salary: "薪酬增长通常与作品质量和设计决策的业务影响挂钩。",
      growth: "产品体验、服务设计和品牌系统方向需求持续增长。",
      trends: [
        "设计系统正在成为产品组织的战略基础设施。",
        "基于研究的设计正在替代纯审美驱动决策。",
        "AI 辅助设计流程显著提升交付效率。",
      ],
    },
    jobs: ["ui-ux-designer", "content-strategist", "brand-manager"],
  },
  {
    slug: "business",
    en: {
      title: "Business Industry",
      summary: "Strategy, operations, growth, and organizational performance management.",
      overview: "Business roles require balancing short-term execution with long-term strategy.",
      salary: "Pay progression aligns with ownership scope and measurable business outcomes.",
      growth: "Strong growth in data-enabled strategy and scalable operational leadership.",
      trends: [
        "Operational analytics is now central to management decisions.",
        "Cross-market expansion requires stronger localization capabilities.",
        "Scenario planning and resilience design are now standard management practices.",
      ],
    },
    zh: {
      title: "商业行业",
      summary: "围绕战略、运营、增长与组织绩效管理展开的行业。",
      overview: "商业岗位要求在短期执行与长期战略之间保持平衡。",
      salary: "薪酬提升通常与责任范围和可量化业务结果正相关。",
      growth: "数据驱动战略与规模化运营管理方向增长明显。",
      trends: [
        "运营分析已成为管理决策的核心能力。",
        "跨区域扩张对本地化能力提出更高要求。",
        "情景规划与韧性建设成为标准管理动作。",
      ],
    },
    jobs: ["product-manager", "operations-manager", "sales-manager", "hr-business-partner"],
  },
  {
    slug: "media",
    en: {
      title: "Media Industry",
      summary: "Content production, audience growth, and multi-channel communication.",
      overview: "Media careers combine storytelling, distribution strategy, and data feedback loops.",
      salary: "Income patterns vary by platform model, audience scale, and commercialization.",
      growth: "Creator economy and branded content continue to open specialized opportunities.",
      trends: [
        "Short-form and multi-format workflows are now baseline capabilities.",
        "Audience analytics is driving editorial planning and monetization.",
        "Cross-platform content IP management is becoming increasingly important.",
      ],
    },
    zh: {
      title: "传媒行业",
      summary: "聚焦内容生产、受众增长与多渠道传播的行业。",
      overview: "传媒职业融合叙事表达、分发策略与数据反馈闭环。",
      salary: "收入结构受平台模式、受众规模和商业化能力影响明显。",
      growth: "创作者经济与品牌内容带来更多专业化机会。",
      trends: [
        "短内容与多形态制作能力成为基础要求。",
        "受众分析正在主导选题规划与商业变现。",
        "跨平台内容 IP 管理的重要性持续上升。",
      ],
    },
    jobs: ["digital-marketing-manager", "content-strategist", "brand-manager"],
  },
  {
    slug: "consulting",
    en: {
      title: "Consulting Industry",
      summary: "Problem diagnosis, strategic advisory, and transformation execution support.",
      overview: "Consulting emphasizes structured thinking, communication, and stakeholder alignment.",
      salary: "Compensation is generally strong with clear performance-linked advancement.",
      growth: "Demand is rising for digital, AI, and organizational transformation consulting.",
      trends: [
        "Clients expect faster value realization and implementation depth.",
        "Domain specialization is increasingly rewarded over generic consulting profiles.",
        "Data storytelling has become a core deliverable skill.",
      ],
    },
    zh: {
      title: "咨询行业",
      summary: "聚焦问题诊断、战略建议与转型落地支持的行业。",
      overview: "咨询岗位强调结构化思考、沟通表达和多方协同。",
      salary: "整体薪酬较有竞争力，晋升路径与绩效表现关联紧密。",
      growth: "数字化、AI 与组织转型咨询需求持续提升。",
      trends: [
        "客户更关注价值实现速度与落地深度。",
        "相比通用型顾问，领域专精更受市场认可。",
        "数据叙事能力成为核心交付能力。",
      ],
    },
    jobs: ["management-consultant", "business-analyst", "policy-analyst"],
  },
  {
    slug: "operations",
    en: {
      title: "Operations Industry",
      summary: "Process management, delivery reliability, and execution efficiency.",
      overview: "Operations roles keep organizations stable while continuously improving throughput.",
      salary: "Pay scales with system complexity, team scope, and delivery accountability.",
      growth: "Supply chain digitalization and automation are expanding high-skill operation roles.",
      trends: [
        "Operational intelligence platforms are becoming mainstream.",
        "Risk control and contingency planning are now required competencies.",
        "Cross-functional operating models are replacing siloed execution.",
      ],
    },
    zh: {
      title: "运营行业",
      summary: "围绕流程管理、交付稳定与执行效率提升的行业。",
      overview: "运营岗位在保障组织稳定的同时持续优化产出效率。",
      salary: "薪酬通常与系统复杂度、团队范围和交付责任相关。",
      growth: "供应链数字化与自动化推动高技能运营岗位增长。",
      trends: [
        "运营智能平台逐步成为主流工具。",
        "风控与应急预案能力成为必备能力。",
        "跨职能一体化运营模式替代部门孤岛。",
      ],
    },
    jobs: ["operations-manager", "supply-chain-manager"],
  },
  {
    slug: "legal",
    en: {
      title: "Legal Industry",
      summary: "Regulatory interpretation, legal risk control, and rights protection.",
      overview: "Legal careers require precision, ethics, and long-term professional discipline.",
      salary: "Compensation depends on specialization, experience, and case complexity.",
      growth: "Growth is visible in compliance, data governance, and cross-border legal services.",
      trends: [
        "Data and privacy regulations are expanding legal advisory scope.",
        "Contract lifecycle management is increasingly technology-enabled.",
        "Business-facing legal roles need stronger communication with non-legal teams.",
      ],
    },
    zh: {
      title: "法律行业",
      summary: "围绕法规解释、法律风险控制与权益保护展开的行业。",
      overview: "法律职业要求高准确性、职业伦理和长期专业积累。",
      salary: "薪酬水平受专业领域、经验和案件复杂度影响。",
      growth: "合规、数据治理与跨境法律服务方向增长明显。",
      trends: [
        "数据与隐私监管扩大了法律服务边界。",
        "合同全生命周期管理正在被技术化重构。",
        "面向业务的法律岗位更强调跨团队沟通能力。",
      ],
    },
    jobs: ["lawyer"],
  },
  {
    slug: "public-service",
    en: {
      title: "Public Service",
      summary: "Policy implementation, social welfare support, and public governance.",
      overview: "Public service roles focus on long-term societal value and stable execution.",
      salary: "Salary growth is typically stable with strong emphasis on role responsibility.",
      growth: "Data-informed policy design and social program evaluation are expanding.",
      trends: [
        "Evidence-based policy analysis is becoming a key capability.",
        "Cross-sector collaboration between government and social organizations is increasing.",
        "Public communication and trust-building are core execution requirements.",
      ],
    },
    zh: {
      title: "公共服务",
      summary: "聚焦政策执行、社会福利支持与公共治理的领域。",
      overview: "公共服务岗位强调长期社会价值和稳定执行能力。",
      salary: "薪酬增长通常较稳定，更重视岗位责任与服务质量。",
      growth: "数据驱动政策设计与社会项目评估需求持续扩大。",
      trends: [
        "循证政策分析能力的重要性持续提升。",
        "政府与社会组织的跨界协作增多。",
        "公共沟通与信任建设成为执行关键。",
      ],
    },
    jobs: ["policy-analyst", "psychological-counselor"],
  },
  {
    slug: "manufacturing",
    en: {
      title: "Manufacturing Industry",
      summary: "Product manufacturing, quality assurance, and industrial process optimization.",
      overview: "Manufacturing careers demand execution discipline and systems-level problem solving.",
      salary: "Compensation improves with process expertise, quality ownership, and automation skills.",
      growth: "Smart manufacturing and industrial digitalization are transforming role requirements.",
      trends: [
        "Digital twin and predictive maintenance capabilities are rising in demand.",
        "Quality management is increasingly integrated with real-time data systems.",
        "Supply chain resilience has become a strategic priority.",
      ],
    },
    zh: {
      title: "制造业",
      summary: "围绕产品制造、质量保障与工业流程优化的核心行业。",
      overview: "制造业岗位要求执行纪律与系统级问题解决能力。",
      salary: "薪酬提升与流程专业深度、质量责任和自动化能力相关。",
      growth: "智能制造与工业数字化正在重塑岗位能力要求。",
      trends: [
        "数字孪生与预测性维护能力需求上升。",
        "质量管理正在与实时数据系统深度融合。",
        "供应链韧性成为战略级优先事项。",
      ],
    },
    jobs: ["supply-chain-manager", "operations-manager"],
  },
];

const jobs = [
  ["software-engineer", "Software Engineer", "软件工程师", "technology"],
  ["product-manager", "Product Manager", "产品经理", "business"],
  ["data-analyst", "Data Analyst", "数据分析师", "technology"],
  ["ui-ux-designer", "UI/UX Designer", "UI/UX 设计师", "design"],
  ["psychological-counselor", "Psychological Counselor", "心理咨询师", "healthcare"],
  ["digital-marketing-manager", "Digital Marketing Manager", "数字营销经理", "media"],
  ["investment-analyst", "Investment Analyst", "投资分析师", "finance"],
  ["lawyer", "Lawyer", "律师", "legal"],
  ["physician", "Physician", "医生", "healthcare"],
  ["teacher", "Teacher", "教师", "education"],
  ["data-scientist", "Data Scientist", "数据科学家", "technology"],
  ["machine-learning-engineer", "Machine Learning Engineer", "机器学习工程师", "technology"],
  ["frontend-engineer", "Frontend Engineer", "前端工程师", "technology"],
  ["backend-engineer", "Backend Engineer", "后端工程师", "technology"],
  ["fullstack-engineer", "Fullstack Engineer", "全栈工程师", "technology"],
  ["cybersecurity-analyst", "Cybersecurity Analyst", "网络安全分析师", "technology"],
  ["cloud-architect", "Cloud Architect", "云架构师", "technology"],
  ["operations-manager", "Operations Manager", "运营经理", "operations"],
  ["hr-business-partner", "HR Business Partner", "HRBP", "business"],
  ["sales-manager", "Sales Manager", "销售经理", "business"],
  ["management-consultant", "Management Consultant", "管理咨询顾问", "consulting"],
  ["financial-planner", "Financial Planner", "财务规划师", "finance"],
  ["business-analyst", "Business Analyst", "商业分析师", "consulting"],
  ["content-strategist", "Content Strategist", "内容策略师", "media"],
  ["brand-manager", "Brand Manager", "品牌经理", "design"],
  ["researcher", "Researcher", "研究员", "education"],
  ["nurse", "Nurse", "护士", "healthcare"],
  ["pharmacist", "Pharmacist", "药师", "healthcare"],
  ["supply-chain-manager", "Supply Chain Manager", "供应链经理", "operations"],
  ["policy-analyst", "Policy Analyst", "政策分析师", "public-service"],
];

const riasecPresets = {
  tech: { R: 55, I: 88, A: 48, S: 42, E: 50, C: 68 },
  product: { R: 44, I: 72, A: 66, S: 58, E: 78, C: 61 },
  data: { R: 40, I: 90, A: 45, S: 38, E: 46, C: 72 },
  design: { R: 38, I: 62, A: 90, S: 54, E: 60, C: 44 },
  service: { R: 34, I: 58, A: 50, S: 92, E: 55, C: 62 },
  business: { R: 42, I: 66, A: 56, S: 60, E: 88, C: 70 },
  finance: { R: 36, I: 86, A: 42, S: 40, E: 63, C: 84 },
  legal: { R: 33, I: 80, A: 40, S: 47, E: 52, C: 90 },
  health: { R: 48, I: 64, A: 42, S: 88, E: 54, C: 74 },
  ops: { R: 52, I: 60, A: 36, S: 52, E: 70, C: 90 },
  policy: { R: 30, I: 78, A: 46, S: 68, E: 58, C: 80 },
};

const mbtiGroups = {
  analyst: { primary: ["INTJ", "INTP", "ENTJ"], secondary: ["ENTP", "ISTJ", "INFJ"] },
  creator: { primary: ["INFP", "ENFP", "ISFP"], secondary: ["INFJ", "ENTP", "ESFP"] },
  operator: { primary: ["ESTJ", "ISTJ", "ESFJ"], secondary: ["ISFJ", "ENTJ", "ESTP"] },
  service: { primary: ["ENFJ", "ISFJ", "INFJ"], secondary: ["ESFJ", "INFP", "ENFP"] },
  business: { primary: ["ENTJ", "ENFJ", "ESTP"], secondary: ["ENFP", "ESTJ", "ENTP"] },
};

function jobConfig(slug) {
  if (slug.includes("engineer") || slug.includes("architect") || slug.includes("cybersecurity")) {
    return { riasec: riasecPresets.tech, mbti: mbtiGroups.analyst, market: 92, iq: { min: 65, max: 100 }, eq: { min: 45, max: 90 } };
  }
  if (slug.includes("data") || slug.includes("analyst") || slug.includes("researcher")) {
    return { riasec: riasecPresets.data, mbti: mbtiGroups.analyst, market: 85, iq: { min: 62, max: 100 }, eq: { min: 40, max: 86 } };
  }
  if (slug.includes("designer") || slug.includes("content") || slug.includes("brand")) {
    return { riasec: riasecPresets.design, mbti: mbtiGroups.creator, market: 78, iq: { min: 45, max: 95 }, eq: { min: 52, max: 96 } };
  }
  if (slug.includes("counselor") || slug === "teacher" || slug === "nurse" || slug === "physician" || slug === "pharmacist") {
    return { riasec: riasecPresets.health, mbti: mbtiGroups.service, market: 86, iq: { min: 50, max: 100 }, eq: { min: 60, max: 100 } };
  }
  if (slug.includes("manager") || slug.includes("partner") || slug.includes("consultant")) {
    return { riasec: riasecPresets.business, mbti: mbtiGroups.business, market: 82, iq: { min: 50, max: 98 }, eq: { min: 55, max: 100 } };
  }
  if (slug.includes("finance") || slug.includes("investment")) {
    return { riasec: riasecPresets.finance, mbti: mbtiGroups.analyst, market: 76, iq: { min: 60, max: 100 }, eq: { min: 46, max: 92 } };
  }
  if (slug.includes("lawyer")) {
    return { riasec: riasecPresets.legal, mbti: mbtiGroups.operator, market: 70, iq: { min: 62, max: 100 }, eq: { min: 52, max: 95 } };
  }
  if (slug.includes("policy")) {
    return { riasec: riasecPresets.policy, mbti: mbtiGroups.operator, market: 66, iq: { min: 58, max: 100 }, eq: { min: 54, max: 98 } };
  }
  return { riasec: riasecPresets.ops, mbti: mbtiGroups.operator, market: 74, iq: { min: 48, max: 95 }, eq: { min: 48, max: 92 } };
}

const defaultBig5 = {
  openness: { min: 40, max: 80 },
  conscientiousness: { min: 50, max: 90 },
  extraversion: { min: 35, max: 82 },
  agreeableness: { min: 35, max: 85 },
  neuroticism: { min: 10, max: 55 },
};

const guideItems = [
  ["how-to-find-right-career-direction", "How to Find the Right Career Direction", "如何找到适合自己的职业方向", "career-planning"],
  ["how-to-choose-college-major", "How to Choose a College Major", "如何选择大学专业", "education-decision"],
  ["career-transition-playbook", "Career Transition Playbook", "职业转型行动手册", "career-transition"],
  ["build-five-year-career-roadmap", "Build a Five-Year Career Roadmap", "如何制定五年职业路线图", "career-planning"],
  ["improve-workplace-competitiveness", "Improve Workplace Competitiveness", "如何提升职场竞争力", "skill-growth"],
  ["from-mbti-to-job-fit", "From MBTI to Job Fit", "如何将 MBTI 用于职业匹配", "assessment-usage"],
  ["big5-for-career-decisions", "Using Big Five for Career Decisions", "如何用大五人格做职业决策", "assessment-usage"],
  ["iq-eq-balance-at-work", "Balancing IQ and EQ at Work", "IQ 与 EQ 如何协同影响职业表现", "assessment-usage"],
  ["first-90-days-in-new-role", "First 90 Days in a New Role", "新岗位前 90 天行动指南", "onboarding"],
  ["career-growth-with-manager", "Career Growth with Your Manager", "如何与上级共建职业成长路径", "workplace-communication"],
  ["build-portfolio-for-career-switch", "Build a Portfolio for Career Switching", "转岗时如何构建高质量作品集", "career-transition"],
  ["networking-that-actually-works", "Networking That Actually Works", "高质量职业人脉搭建方法", "workplace-communication"],
  ["interview-strategy-by-role", "Interview Strategy by Role", "按岗位定制面试策略", "job-search"],
  ["salary-negotiation-framework", "Salary Negotiation Framework", "薪资谈判实战框架", "job-search"],
  ["prevent-burnout-while-growing", "Prevent Burnout While Growing", "成长阶段如何预防职业倦怠", "wellbeing"],
  ["leader-track-vs-expert-track", "Leader Track vs Expert Track", "管理路径与专家路径如何选择", "career-planning"],
  ["cross-industry-move-strategy", "Cross-Industry Move Strategy", "跨行业转型策略", "career-transition"],
  ["career-risk-management", "Career Risk Management", "职业风险管理指南", "career-planning"],
  ["personal-brand-for-professionals", "Personal Brand for Professionals", "专业人士个人品牌建设", "workplace-communication"],
  ["annual-career-review-system", "Annual Career Review System", "年度职业复盘系统", "career-planning"],
];

const mbtiTypes = ["INTJ","INTP","ENTJ","ENTP","INFJ","INFP","ENFJ","ENFP","ISTJ","ISFJ","ESTJ","ESFJ","ISTP","ISFP","ESTP","ESFP"];

const big5Traits = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"];
const big5Bands = ["high", "balanced", "low"];

const allJobSlugs = jobs.map((item) => item[0]);

function pickJobs(seed, count) {
  const start = seed % allJobSlugs.length;
  const out = [];
  for (let i = 0; i < count; i += 1) {
    out.push(allJobSlugs[(start + i * 2) % allJobSlugs.length]);
  }
  return [...new Set(out)].slice(0, count);
}

for (const [slug, titleEn, titleZh, industry] of jobs) {
  const config = jobConfig(slug);
  const salaryEn = "$55,000 - $180,000 (varies by region and seniority)";
  const salaryZh = "人民币 18万 - 90万/年（视城市与资历而定）";
  const outlookEn = `Demand for ${titleEn.toLowerCase()} talent remains strong in data-driven organizations.`;
  const outlookZh = `${titleZh} 在数据化与精细化运营背景下仍保持较高需求。`;

  const skillsEn = [
    "Structured problem solving",
    "Stakeholder communication",
    "Execution management",
    "Data-informed decision making",
    "Continuous learning",
  ];
  const skillsZh = ["结构化问题解决", "跨角色沟通", "执行推进能力", "数据驱动决策", "持续学习能力"];

  const workEn = [
    `Define key responsibilities and delivery metrics for ${titleEn.toLowerCase()} workstreams.`,
    "Coordinate cross-functional stakeholders and align execution priorities.",
    "Track progress, risks, and quality signals to ensure stable outcomes.",
  ];
  const workZh = [
    `明确${titleZh}核心职责与交付指标。`,
    "协同跨团队角色并统一执行优先级。",
    "跟踪进度、风险与质量信号，保障结果稳定交付。",
  ];

  const growthEn = [
    "0-2 years: build core execution competency and domain literacy.",
    "3-5 years: own medium-complexity projects and cross-team collaboration.",
    "5+ years: move toward specialist leadership or managerial scope.",
  ];
  const growthZh = [
    "0-2 年：建立基础执行能力与行业认知。",
    "3-5 年：独立负责中等复杂度项目并推进跨团队协作。",
    "5 年以上：走向专家型负责人或管理型角色。",
  ];

  const fitEn = [
    "Prefers clear goals and measurable outputs.",
    "Can balance analytical thinking with practical delivery.",
    "Willing to iterate and adapt under changing constraints.",
  ];
  const fitZh = ["偏好目标清晰、结果可衡量的工作方式。", "能够兼顾分析思维与落地执行。", "在约束变化下愿意持续迭代优化。"];

  const bodyEn = `${buildJobFrontmatter({
    slug,
    locale: "en",
    title: titleEn,
    summary: `A practical role profile for ${titleEn.toLowerCase()} including responsibilities, required skills, salary, and growth path.`,
    industry,
    salary: salaryEn,
    outlook: outlookEn,
    skills: skillsEn,
    work: workEn,
    growth: growthEn,
    fit: fitEn,
    mbtiPrimary: config.mbti.primary,
    mbtiSecondary: config.mbti.secondary,
    riasec: config.riasec,
    big5: defaultBig5,
    iq: config.iq,
    eq: config.eq,
    market: config.market,
  })}

# ${titleEn}

## Role Overview
${titleEn} is a role where performance compounds through execution quality, communication precision, and long-term learning velocity.

## Core Work Scope
This role contributes to business outcomes by translating goals into high-quality deliverables, collaborating across functions, and continuously improving process quality.

## Career Development Advice
Use 90-day cycles to track output metrics, capability growth, and collaboration impact. Review your progress every quarter and adjust your growth plan based on evidence.
`;

  const bodyZh = `${buildJobFrontmatter({
    slug,
    locale: "zh",
    title: titleZh,
    summary: `面向${titleZh}的实用岗位画像，覆盖职责范围、能力要求、薪资区间与成长路径。`,
    industry,
    salary: salaryZh,
    outlook: outlookZh,
    skills: skillsZh,
    work: workZh,
    growth: growthZh,
    fit: fitZh,
    mbtiPrimary: config.mbti.primary,
    mbtiSecondary: config.mbti.secondary,
    riasec: config.riasec,
    big5: defaultBig5,
    iq: config.iq,
    eq: config.eq,
    market: config.market,
  })}

# ${titleZh}

## 岗位概览
${titleZh} 是一个通过执行质量、沟通精度与持续学习能力持续放大职业价值的岗位。

## 核心工作范围
该岗位通过把目标拆解为可落地任务、推进跨团队协同，并持续优化流程质量来影响业务结果。

## 职业发展建议
建议按 90 天为周期跟踪交付指标、能力增长和协作影响，每季度做一次基于证据的职业复盘并调整成长策略。
`;

  writeFile(path.join(ROOT, "content/career/jobs", slug, "en.mdx"), bodyEn);
  writeFile(path.join(ROOT, "content/career/jobs", slug, "zh.mdx"), bodyZh);
}

for (const industry of industries) {
  const en = `---
slug: ${industry.slug}
locale: en
title: "${industry.en.title}"
summary: "${industry.en.summary}"
overview: "${industry.en.overview}"
hot_jobs:
${yamlList(industry.jobs, 2)}
salary_overview: "${industry.en.salary}"
growth_outlook: "${industry.en.growth}"
trends:
${yamlList(industry.en.trends, 2)}
updatedAt: "2026-03-05"
---

# ${industry.en.title}

## Industry Overview
${industry.en.overview}

## Career Opportunities
This industry offers multiple role tracks across entry, specialist, and leadership levels. Build your path by combining domain depth with transferable collaboration skills.

## Career Strategy
Prioritize one target role, one adjacent role, and one long-term stretch role. Re-evaluate every two quarters based on market demand and personal fit evidence.
`;

  const zh = `---
slug: ${industry.slug}
locale: zh
title: "${industry.zh.title}"
summary: "${industry.zh.summary}"
overview: "${industry.zh.overview}"
hot_jobs:
${yamlList(industry.jobs, 2)}
salary_overview: "${industry.zh.salary}"
growth_outlook: "${industry.zh.growth}"
trends:
${yamlList(industry.zh.trends, 2)}
updatedAt: "2026-03-05"
---

# ${industry.zh.title}

## 行业概览
${industry.zh.overview}

## 职业机会
该行业通常包含入门、专家和管理三类成长轨道。建议以“领域深度 + 可迁移协作能力”双主线规划长期发展。

## 发展策略
建议同时维护一个当前目标岗位、一个可横向迁移岗位和一个长期冲刺岗位，并每两个季度根据市场变化做一次调整。
`;

  writeFile(path.join(ROOT, "content/career/industries", industry.slug, "en.mdx"), en);
  writeFile(path.join(ROOT, "content/career/industries", industry.slug, "zh.mdx"), zh);
}

for (let i = 0; i < guideItems.length; i += 1) {
  const [slug, titleEn, titleZh, category] = guideItems[i];
  const relatedJobs = pickJobs(i + 3, 3);
  const relatedIndustries = [industries[i % industries.length].slug, industries[(i + 4) % industries.length].slug];

  const en = `---
slug: ${slug}
locale: en
title: "${titleEn}"
summary: "Actionable framework to improve decision quality and execution in career development."
category: ${category}
related_job_slugs:
${yamlList(relatedJobs, 2)}
related_industry_slugs:
${yamlList(relatedIndustries, 2)}
publishedAt: "2026-03-05"
updatedAt: "2026-03-05"
---

# ${titleEn}

## Why This Matters
Career growth is a compound system. Better decisions early reduce switching costs and improve long-term optionality.

## Practical Framework
1. Define one 12-month target role with explicit success criteria.
2. Build a capability backlog across knowledge, projects, and collaboration behavior.
3. Run 4-week execution sprints and collect measurable evidence.
4. Review outcomes quarterly and adjust strategy using market and fit signals.

## Implementation Checklist
- Clear role target and industry context
- Evidence-based skill gap map
- Portfolio or project proof
- Feedback loop with mentors and stakeholders
`;

  const zh = `---
slug: ${slug}
locale: zh
title: "${titleZh}"
summary: "用于提升职业决策质量与执行结果的实操框架。"
category: ${category}
related_job_slugs:
${yamlList(relatedJobs, 2)}
related_industry_slugs:
${yamlList(relatedIndustries, 2)}
publishedAt: "2026-03-05"
updatedAt: "2026-03-05"
---

# ${titleZh}

## 为什么重要
职业成长是一个长期复利系统。越早建立高质量决策机制，越能降低试错成本并提升未来选择权。

## 实操框架
1. 明确 12 个月目标岗位及可量化成功标准。
2. 建立“知识-项目-协作行为”三层能力差距清单。
3. 以 4 周为一个执行 Sprint，形成可验证证据。
4. 每季度复盘结果，并结合市场变化与个人匹配度做调整。

## 落地清单
- 明确岗位目标与行业场景
- 证据化能力差距地图
- 作品或项目证明材料
- 与导师及关键协作方的反馈闭环
`;

  writeFile(path.join(ROOT, "content/career/guides", slug, "en.mdx"), en);
  writeFile(path.join(ROOT, "content/career/guides", slug, "zh.mdx"), zh);
}

for (let i = 0; i < mbtiTypes.length; i += 1) {
  const type = mbtiTypes[i];
  const recJobs = pickJobs(i + 1, 6);
  const avoidJobs = pickJobs(i + 9, 3);

  const en = `---
locale: en
profile_type: mbti
key: ${type}
title: "Best Career Paths for ${type}"
summary: "Role recommendations and work-environment guidance for ${type} profiles."
recommended_jobs:
${yamlList(recJobs, 2)}
avoid_jobs:
${yamlList(avoidJobs, 2)}
work_env: "High-autonomy role scope, clear success metrics, and consistent feedback cadence."
strengths:
  - Strategic pattern recognition
  - Stable execution under constraints
  - Strong ownership on meaningful goals
risks:
  - Over-specialization without cross-functional exposure
  - Delayed feedback loops causing slower iteration
updatedAt: "2026-03-05"
---

# Best Career Paths for ${type}

## Profile Insight
${type} profiles often perform best when role expectations are clear and growth opportunities are evidence-driven.

## Recommendation Logic
This recommendation combines personality fit, interest alignment, and capability thresholds. Use it as a decision support tool, not a fixed label.
`;

  const zh = `---
locale: zh
profile_type: mbti
key: ${type}
title: "${type} 适合的职业方向"
summary: "基于 ${type} 人格画像的职业建议与工作环境匹配策略。"
recommended_jobs:
${yamlList(recJobs, 2)}
avoid_jobs:
${yamlList(avoidJobs, 2)}
work_env: "高自主度、目标清晰、反馈节奏稳定的工作环境。"
strengths:
  - 战略性模式识别
  - 在约束下保持执行稳定
  - 对关键目标具备持续投入能力
risks:
  - 过度单一专精导致横向能力不足
  - 反馈周期过长影响迭代速度
updatedAt: "2026-03-05"
---

# ${type} 适合的职业方向

## 画像洞察
${type} 类型通常在目标明确、成长路径可量化的岗位中更容易稳定发挥。

## 推荐逻辑
该推荐综合了人格匹配、兴趣贴合与能力阈值信号。它是职业决策辅助工具，而不是固定标签。
`;

  writeFile(path.join(ROOT, "content/career/recommendations/mbti", type, "en.mdx"), en);
  writeFile(path.join(ROOT, "content/career/recommendations/mbti", type, "zh.mdx"), zh);
}

for (let t = 0; t < big5Traits.length; t += 1) {
  const trait = big5Traits[t];
  for (let b = 0; b < big5Bands.length; b += 1) {
    const band = big5Bands[b];
    const recJobs = pickJobs(t * 3 + b + 2, 6);
    const avoidJobs = pickJobs(t * 5 + b + 7, 3);

    const en = `---
locale: en
profile_type: big5
key: ${trait}
band: ${band}
title: "${trait} (${band}) Career Fit"
summary: "Career guidance for ${trait} with ${band} tendency."
recommended_jobs:
${yamlList(recJobs, 2)}
avoid_jobs:
${yamlList(avoidJobs, 2)}
work_env: "Balanced autonomy, explicit collaboration norms, and measurable role outcomes."
strengths:
  - Predictable behavioral signals in role execution
  - Better fit visibility under structured evaluation
risks:
  - Context shift may change trait expression over time
  - Role fit declines when environment assumptions change quickly
updatedAt: "2026-03-05"
---

# ${trait} (${band}) Career Fit

## Interpretation
Trait-level guidance should be interpreted with context. Use this profile together with MBTI and RIASEC signals for stronger career decisions.
`;

    const zh = `---
locale: zh
profile_type: big5
key: ${trait}
band: ${band}
title: "${trait}（${band}）职业匹配建议"
summary: "面向 ${trait} 倾向为 ${band} 的职业发展建议。"
recommended_jobs:
${yamlList(recJobs, 2)}
avoid_jobs:
${yamlList(avoidJobs, 2)}
work_env: "自主度适中、协作规则明确、结果可量化的工作环境。"
strengths:
  - 行为表现更可预测，便于岗位匹配
  - 在结构化评估中更容易识别优势
risks:
  - 不同情境会导致特质表达波动
  - 当环境假设快速变化时匹配度可能下降
updatedAt: "2026-03-05"
---

# ${trait}（${band}）职业匹配建议

## 解读方式
特质层建议需要结合情境使用。建议与 MBTI 和 RIASEC 结果联合判断，以提高职业决策稳定性。
`;

    writeFile(path.join(ROOT, "content/career/recommendations/big5", `${trait}-${band}`, "en.mdx"), en);
    writeFile(path.join(ROOT, "content/career/recommendations/big5", `${trait}-${band}`, "zh.mdx"), zh);
  }
}

console.log("Career content generated:", {
  jobs: jobs.length,
  industries: industries.length,
  guides: guideItems.length,
  mbti: mbtiTypes.length,
  big5Profiles: big5Traits.length * big5Bands.length,
});
