import type { Locale } from "@/lib/i18n/locales";

export const HELP_CENTER_SLUGS = [
  "faq",
  "about",
  "team",
  "used-and-mentioned",
  "for-business-and-research",
  "contact",
] as const;

export type HelpCenterSlug = (typeof HELP_CENTER_SLUGS)[number];

export type HelpCenterLinkItem = {
  href: string;
  label: string;
};

export type HelpCenterFaqItem = {
  question: string;
  answer: string;
};

export type HelpCenterSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type HelpCenterPageContent = {
  slug: HelpCenterSlug;
  navLabel: string;
  title: string;
  subtitle: string;
  cardSummary: string;
  sections: HelpCenterSection[];
  faqItems?: HelpCenterFaqItem[];
  relatedLinks: HelpCenterLinkItem[];
};

type HelpCenterLocaleContent = {
  home: {
    kicker: string;
    title: string;
    subtitle: string;
    topicsTitle: string;
    quickActionsTitle: string;
    quickActionsSubtitle: string;
    contactTitle: string;
    contactSubtitle: string;
    browseButton: string;
  };
  labels: {
    backToHome: string;
    relatedTitle: string;
    faqTitle: string;
  };
  quickActions: HelpCenterLinkItem[];
  pageOrder: HelpCenterSlug[];
  pages: Record<HelpCenterSlug, HelpCenterPageContent>;
};

const HELP_CENTER_CONTENT: Record<Locale, HelpCenterLocaleContent> = {
  en: {
    home: {
      kicker: "Support Center",
      title: "Help Center",
      subtitle:
        "Find practical answers about reports, payment, policies, and enterprise usage.",
      topicsTitle: "Browse help topics",
      quickActionsTitle: "Quick actions",
      quickActionsSubtitle: "Use these shortcuts first for the most common support tasks.",
      contactTitle: "Need personal support?",
      contactSubtitle:
        "If your issue includes an order, include the order number and purchase email to speed up handling.",
      browseButton: "Open topic",
    },
    labels: {
      backToHome: "Back to Help Center",
      relatedTitle: "Related links",
      faqTitle: "Frequently asked questions",
    },
    quickActions: [
      { href: "/orders/lookup", label: "Order lookup" },
      { href: "/refund", label: "Refund policy" },
      { href: "/privacy", label: "Privacy policy" },
    ],
    pageOrder: [
      "faq",
      "about",
      "team",
      "used-and-mentioned",
      "for-business-and-research",
      "contact",
    ],
    pages: {
      faq: {
        slug: "faq",
        navLabel: "FAQ",
        title: "Frequently Asked Questions",
        subtitle: "Common answers for reports, payment, and account-related requests.",
        cardSummary: "Report delivery, payment retry, refund scope, and policy entry points.",
        sections: [
          {
            title: "Before you contact support",
            paragraphs: [
              "Most delivery and payment issues can be resolved through order lookup first.",
            ],
            bullets: [
              "Check your purchase email inbox and spam folder for report links.",
              "Use order lookup to refresh status before opening a ticket.",
              "If payment failed, retry from the order page instead of creating duplicate orders.",
            ],
          },
          {
            title: "Typical support topics",
            bullets: [
              "Report not received after successful payment",
              "Payment declined or interrupted",
              "Refund request and eligibility review",
              "Retake guidance and result sharing",
              "Business or research usage requests",
            ],
          },
        ],
        faqItems: [
          {
            question: "How do I get my report after payment?",
            answer:
              "Open order lookup with your order number and purchase email. If the report is ready, you can access it directly from the order detail page.",
          },
          {
            question: "What should I do if payment fails?",
            answer:
              "Return to the order page and retry payment from the built-in flow. Avoid creating duplicate orders unless the original order is canceled.",
          },
          {
            question: "Can I request a refund?",
            answer:
              "Refund requests are handled according to our Refund Policy. Please submit your order number, purchase email, and reason so we can review eligibility.",
          },
          {
            question: "Can I use FermatMind tests in my company or research project?",
            answer:
              "Yes, but usage scope and rights differ by scenario. Please review the dedicated business/research page and contact us for authorization details.",
          },
        ],
        relatedLinks: [
          { href: "/orders/lookup", label: "Order lookup" },
          { href: "/refund", label: "Refund policy" },
          { href: "/privacy", label: "Privacy policy" },
          { href: "/terms", label: "Terms of Service" },
        ],
      },
      about: {
        slug: "about",
        navLabel: "About",
        title: "About FermatMind",
        subtitle: "Who we are, what we build, and the standards behind our assessment product.",
        cardSummary: "Company positioning, methodology, product principles, and safety boundaries.",
        sections: [
          {
            title: "Our mission",
            paragraphs: [
              "FermatMind builds practical assessment tools for personality insight, growth planning, and role-fit reflection.",
              "We focus on clear interpretation language that can be applied in real decisions, not abstract labels.",
            ],
          },
          {
            title: "Assessment approach",
            bullets: [
              "Structured questionnaires with transparent scoring logic",
              "Readable reports focused on behavior and decision implications",
              "Iterative quality review across item wording and flow completion",
            ],
          },
          {
            title: "Privacy and safety boundary",
            paragraphs: [
              "FermatMind reports are designed for education and self-reflection. They are not medical diagnosis and do not replace professional care.",
              "We avoid absolute claims and continuously align product practice with applicable privacy principles.",
            ],
          },
        ],
        relatedLinks: [
          { href: "/privacy", label: "Privacy policy" },
          { href: "/terms", label: "Terms of Service" },
          { href: "/help/contact", label: "Contact support" },
        ],
      },
      team: {
        slug: "team",
        navLabel: "Team",
        title: "Our Team",
        subtitle: "A cross-functional team covering psychometrics, product, engineering, and content quality.",
        cardSummary: "Team roles and collaboration model without fabricated personal biographies.",
        sections: [
          {
            title: "Core functions",
            bullets: [
              "Psychometrics and content: framework design, item quality, interpretation tone",
              "Product and UX: completion flow, clarity, and usability validation",
              "Engineering and data: reliability, privacy controls, and secure delivery",
              "Support and operations: policy handling, issue triage, and response workflow",
            ],
          },
          {
            title: "How we work",
            paragraphs: [
              "We ship in small, testable iterations and prioritize measurable clarity improvements.",
              "When user risk is involved, we choose conservative language and explicit boundaries.",
            ],
          },
        ],
        relatedLinks: [
          { href: "/help/about", label: "About FermatMind" },
          { href: "/help/contact", label: "Contact support" },
        ],
      },
      "used-and-mentioned": {
        slug: "used-and-mentioned",
        navLabel: "Used & Mentioned",
        title: "Used and Mentioned",
        subtitle: "How FermatMind content is typically used and how to cite it correctly.",
        cardSummary: "Usage scenarios and citation guidance without fabricated endorsements.",
        sections: [
          {
            title: "Where users apply FermatMind",
            bullets: [
              "Personal self-reflection and growth planning",
              "Coaching conversations and workshop preparation",
              "Team retrospectives and communication alignment",
              "Educational examples in assessment literacy contexts",
            ],
          },
          {
            title: "Citation guidance",
            paragraphs: [
              "If you reference a FermatMind report or article, cite the exact page URL, title, and access date.",
              "Do not represent FermatMind as endorsing an organization unless explicit written permission exists.",
            ],
          },
        ],
        relatedLinks: [
          { href: "/articles", label: "Articles" },
          { href: "/help/for-business-and-research", label: "Business and research usage" },
        ],
      },
      "for-business-and-research": {
        slug: "for-business-and-research",
        navLabel: "Business & Research",
        title: "Using FermatMind for Business and Research",
        subtitle: "Scope, authorization, and compliance notes for organizational usage.",
        cardSummary: "Usage boundary, bulk-access process, and compliance considerations.",
        sections: [
          {
            title: "Usage scope",
            paragraphs: [
              "FermatMind can support hiring, team development, and internal learning scenarios when used responsibly.",
            ],
            bullets: [
              "Clarify purpose, participant consent, and result visibility before launch",
              "Avoid use as a sole decision criterion in high-stakes personnel decisions",
              "Align your workflow with local legal and privacy requirements",
            ],
          },
          {
            title: "Bulk and project access",
            paragraphs: [
              "For business or research deployment, contact support with expected participant volume, timeline, and required outputs.",
              "We will provide the appropriate support path for policy, billing, and delivery scope.",
            ],
          },
        ],
        relatedLinks: [
          { href: "/business", label: "Business overview" },
          { href: "/help/contact", label: "Contact support" },
          { href: "/privacy", label: "Privacy policy" },
        ],
      },
      contact: {
        slug: "contact",
        navLabel: "Contact",
        title: "Contact Support",
        subtitle: "Share complete context so we can resolve your issue faster.",
        cardSummary: "Support email, preparation checklist, and expected response rhythm.",
        sections: [
          {
            title: "What to include",
            bullets: [
              "Order number (if applicable)",
              "Purchase email used at checkout",
              "A short issue summary and what you have already tried",
              "Screenshots or exact error message when available",
            ],
          },
          {
            title: "Response timing",
            paragraphs: [
              "We typically respond in sequence based on urgency and completeness of information.",
              "Supplying order number and purchase email first usually reduces turnaround time.",
            ],
          },
        ],
        relatedLinks: [
          { href: "/orders/lookup", label: "Order lookup" },
          { href: "/help/faq", label: "FAQ" },
          { href: "/refund", label: "Refund policy" },
        ],
      },
    },
  },
  zh: {
    home: {
      kicker: "支持中心",
      title: "帮助中心",
      subtitle: "集中查看报告、支付、政策与企业使用相关问题的处理入口。",
      topicsTitle: "浏览帮助主题",
      quickActionsTitle: "快速操作",
      quickActionsSubtitle: "优先使用这些入口处理最常见问题。",
      contactTitle: "需要人工支持？",
      contactSubtitle: "若涉及订单，请在邮件中附上订单号和购买邮箱，可显著缩短处理时间。",
      browseButton: "进入主题",
    },
    labels: {
      backToHome: "返回帮助中心",
      relatedTitle: "相关链接",
      faqTitle: "常见问题",
    },
    quickActions: [
      { href: "/orders/lookup", label: "订单查询" },
      { href: "/refund", label: "退款政策" },
      { href: "/privacy", label: "隐私政策" },
    ],
    pageOrder: [
      "faq",
      "about",
      "team",
      "used-and-mentioned",
      "for-business-and-research",
      "contact",
    ],
    pages: {
      faq: {
        slug: "faq",
        navLabel: "常见问题",
        title: "常见问题解答",
        subtitle: "覆盖报告获取、支付异常、退款与账户相关高频问题。",
        cardSummary: "报告交付、支付重试、退款范围与政策入口。",
        sections: [
          {
            title: "联系客服前建议先做",
            paragraphs: ["多数报告交付与支付问题可先通过订单查询自行定位。"],
            bullets: [
              "先检查购买邮箱收件箱和垃圾箱中的报告邮件",
              "使用订单查询刷新状态，避免重复提交工单",
              "支付失败时优先在原订单页重试，不要重复创建订单",
            ],
          },
          {
            title: "高频咨询主题",
            bullets: [
              "支付成功但未收到报告",
              "支付被拒绝或中断",
              "退款申请与适用条件",
              "是否可重测、如何分享结果",
              "企业或研究场景是否可使用",
            ],
          },
        ],
        faqItems: [
          {
            question: "支付完成后如何获取报告？",
            answer:
              "请使用订单号和购买邮箱进入订单查询。若报告已生成，可在订单详情页直接查看。",
          },
          {
            question: "支付失败怎么办？",
            answer:
              "返回订单页使用内置重试流程继续支付。除非原订单已取消，否则不建议重复创建新订单。",
          },
          {
            question: "可以申请退款吗？",
            answer:
              "退款将按退款政策审核。请提交订单号、购买邮箱和退款原因，便于我们快速判断是否符合条件。",
          },
          {
            question: "可以把费马测试用于公司或研究吗？",
            answer:
              "可以，但不同场景的授权和使用边界不同。请先阅读企业/研究页面，再联系支持获取适配方案。",
          },
        ],
        relatedLinks: [
          { href: "/orders/lookup", label: "订单查询" },
          { href: "/refund", label: "退款政策" },
          { href: "/privacy", label: "隐私政策" },
          { href: "/terms", label: "服务条款" },
        ],
      },
      about: {
        slug: "about",
        navLabel: "关于我们",
        title: "关于 FermatMind",
        subtitle: "我们是谁、做什么，以及测评产品背后的方法边界。",
        cardSummary: "公司定位、方法框架、产品原则与安全边界。",
        sections: [
          {
            title: "我们的目标",
            paragraphs: [
              "FermatMind 聚焦人格洞察、成长规划与角色匹配，提供可执行的测评工具。",
              "我们强调可读、可用、可落地的解释语言，而不仅是标签化结论。",
            ],
          },
          {
            title: "测评方法",
            bullets: [
              "结构化问卷与透明评分逻辑",
              "结果解释聚焦行为表现与决策影响",
              "持续优化题项表达与流程完成率",
            ],
          },
          {
            title: "隐私与安全边界",
            paragraphs: [
              "FermatMind 报告用于教育和自我认知，不是医疗诊断，也不替代专业治疗建议。",
              "我们避免绝对化承诺，并按适用情形持续对齐隐私保护原则。",
            ],
          },
        ],
        relatedLinks: [
          { href: "/privacy", label: "隐私政策" },
          { href: "/terms", label: "服务条款" },
          { href: "/help/contact", label: "联系支持" },
        ],
      },
      team: {
        slug: "team",
        navLabel: "团队",
        title: "团队介绍",
        subtitle: "由心理测量、产品、工程与内容质量共同协作的跨职能团队。",
        cardSummary: "团队分工与协作机制，不虚构个人履历。",
        sections: [
          {
            title: "核心分工",
            bullets: [
              "心理测量与内容：框架设计、题项质量、解释口径",
              "产品与体验：流程设计、可理解性与可用性验证",
              "工程与数据：稳定性、隐私控制与安全交付",
              "支持与运营：政策处理、问题分级与反馈闭环",
            ],
          },
          {
            title: "协作方式",
            paragraphs: [
              "我们以小步可验证方式持续迭代，优先解决影响用户决策质量的问题。",
              "涉及风险的场景采用更保守表达与更明确的使用边界。",
            ],
          },
        ],
        relatedLinks: [
          { href: "/help/about", label: "关于 FermatMind" },
          { href: "/help/contact", label: "联系支持" },
        ],
      },
      "used-and-mentioned": {
        slug: "used-and-mentioned",
        navLabel: "使用与提及",
        title: "使用和提及",
        subtitle: "说明费马内容常见使用方式与规范引用方法。",
        cardSummary: "应用场景与引用规范，不伪造品牌背书。",
        sections: [
          {
            title: "常见使用场景",
            bullets: [
              "个人自我认知与成长规划",
              "教练咨询与工作坊准备",
              "团队复盘与沟通协作讨论",
              "教学与科普中的测评素养示例",
            ],
          },
          {
            title: "引用说明",
            paragraphs: [
              "引用 FermatMind 内容时，请标注原始页面链接、标题和访问日期。",
              "未经明确书面授权，不得将 FermatMind 表述为对某组织或项目的背书。",
            ],
          },
        ],
        relatedLinks: [
          { href: "/articles", label: "文章" },
          { href: "/help/for-business-and-research", label: "企业与研究使用" },
        ],
      },
      "for-business-and-research": {
        slug: "for-business-and-research",
        navLabel: "企业与研究",
        title: "将 FermatMind 用于企业与研究",
        subtitle: "组织场景下的使用边界、授权流程与合规注意事项。",
        cardSummary: "组织使用边界、批量接入流程与合规提示。",
        sections: [
          {
            title: "使用边界",
            paragraphs: ["FermatMind 可用于招聘辅助、团队发展与内部学习等场景。"],
            bullets: [
              "上线前明确目的、参与者知情与结果可见范围",
              "避免将测评作为高风险人事决策的唯一依据",
              "结合所在地区法律及隐私要求设计执行流程",
            ],
          },
          {
            title: "批量接入与项目支持",
            paragraphs: [
              "如需企业或研究接入，请提供预计参与人数、时间范围和输出要求。",
              "我们将按场景提供政策、计费与交付范围建议。",
            ],
          },
        ],
        relatedLinks: [
          { href: "/business", label: "企业服务" },
          { href: "/help/contact", label: "联系支持" },
          { href: "/privacy", label: "隐私政策" },
        ],
      },
      contact: {
        slug: "contact",
        navLabel: "联系方式",
        title: "联系支持",
        subtitle: "提供完整上下文，有助于更快定位并解决问题。",
        cardSummary: "支持邮箱、提交前清单与响应节奏说明。",
        sections: [
          {
            title: "建议提供的信息",
            bullets: [
              "订单号（如有）",
              "购买时使用的邮箱",
              "问题简述与已尝试步骤",
              "截图或精确报错信息（如有）",
            ],
          },
          {
            title: "响应节奏",
            paragraphs: [
              "我们会按问题紧急程度和信息完整度依次处理。",
              "优先提供订单号和购买邮箱，通常可显著缩短处理时间。",
            ],
          },
        ],
        relatedLinks: [
          { href: "/orders/lookup", label: "订单查询" },
          { href: "/help/faq", label: "常见问题" },
          { href: "/refund", label: "退款政策" },
        ],
      },
    },
  },
};

export function isHelpCenterSlug(value: string): value is HelpCenterSlug {
  return (HELP_CENTER_SLUGS as readonly string[]).includes(value);
}

export function getHelpCenterContent(locale: Locale): HelpCenterLocaleContent {
  return HELP_CENTER_CONTENT[locale];
}

export function listHelpCenterPages(locale: Locale): HelpCenterPageContent[] {
  const content = getHelpCenterContent(locale);
  return content.pageOrder.map((slug) => content.pages[slug]);
}

export function getHelpCenterPage(locale: Locale, slug: string): HelpCenterPageContent | null {
  if (!isHelpCenterSlug(slug)) return null;
  const content = getHelpCenterContent(locale);
  return content.pages[slug] ?? null;
}
