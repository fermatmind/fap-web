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

export type HelpCenterQuickActionItem = HelpCenterLinkItem & {
  description: string;
  actionLabel: string;
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
  quickActions: HelpCenterQuickActionItem[];
  pageOrder: HelpCenterSlug[];
  pages: Record<HelpCenterSlug, HelpCenterPageContent>;
};

const HELP_CENTER_CONTENT: Record<Locale, HelpCenterLocaleContent> = {
  en: {
    home: {
      kicker: "Support Center",
      title: "Help Center",
      subtitle:
        "Find the formal entry points for report recovery, email preferences, unsubscribe, and common support questions.",
      topicsTitle: "Browse help topics",
      quickActionsTitle: "Formal entry points",
      quickActionsSubtitle:
        "Use Order lookup to recover a report with your order number and purchase email. Manage email preferences is separate from report recovery. Unsubscribe from emails stops messages here, and the dedicated unsubscribe link inside any email still works.",
      contactTitle: "Need personal support?",
      contactSubtitle:
        "Start with Order lookup first, then Manage email preferences if the issue is about email settings. Use Unsubscribe from emails when you only want to stop messages. Contact support after those formal paths if the issue is still unresolved.",
      browseButton: "Open topic",
    },
    labels: {
      backToHome: "Back to Help Center",
      relatedTitle: "Related links",
      faqTitle: "Frequently asked questions",
    },
    quickActions: [
      {
        href: "/orders/lookup",
        label: "Order lookup",
        description: "Recover my report with your order number and purchase email.",
        actionLabel: "Recover my report",
      },
      {
        href: "/email/preferences",
        label: "Manage email preferences",
        description: "Update email settings without changing report recovery or order lookup.",
        actionLabel: "Manage preferences",
      },
      {
        href: "/email/unsubscribe",
        label: "Unsubscribe from emails",
        description: "Stop emails here, or use the dedicated unsubscribe link inside any email you already received.",
        actionLabel: "Unsubscribe",
      },
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
        cardSummary: "Report recovery, delivery email resend, email settings, unsubscribe, and payment support entry points.",
        sections: [
          {
            title: "Before you contact support",
            paragraphs: [
              "Use the formal recovery and email-control paths before you contact support.",
            ],
            bullets: [
              "Go to Order lookup with your order number and purchase email first.",
              "Use Order lookup for report recovery, order lookup, delivery status, and resend delivery email.",
              "Use Manage email preferences for email settings. This is separate from report recovery.",
              "Use Unsubscribe from emails to stop messages, or use the dedicated unsubscribe link inside any email you already received.",
              "Check your purchase email inbox and spam folder for report links.",
              "From the order detail page, you can review delivery status, resend the delivery email, and return to Order lookup for purchase-email recovery.",
              "If payment failed, retry from the order page instead of creating duplicate orders.",
              "Contact support after these formal paths if the issue is still unresolved.",
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
              "Open Order lookup with your order number and purchase email. If the report is ready, the order detail page will show delivery status, report access, PDF download, resend delivery email, and a path back to Order lookup for purchase-email recovery.",
          },
          {
            question: "How do email preferences and unsubscribe links work?",
            answer:
              "Report recovery and email settings are separate. Use Manage email preferences to update email settings. Use Unsubscribe from emails or the dedicated unsubscribe link inside any email to stop messages. If you need a new report email instead, go to Order lookup with your order number and purchase email.",
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
          { href: "/email/preferences", label: "Manage email preferences" },
          { href: "/email/unsubscribe", label: "Unsubscribe from emails" },
          { href: "/help/contact", label: "Contact support" },
          { href: "/refund", label: "Refund policy" },
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
        cardSummary: "Formal recovery paths, support email, preparation checklist, and expected response rhythm.",
        sections: [
          {
            title: "Use these formal paths before support",
            paragraphs: [
              "Start with Order lookup for report recovery, order lookup, delivery status, and resend delivery email.",
              "Use Manage email preferences if the issue is about email settings. Use Unsubscribe from emails if you only want to stop messages.",
              "The dedicated unsubscribe link inside any email still works. Contact support after those paths if the issue is still unresolved.",
            ],
          },
          {
            title: "What to include if you still need support",
            bullets: [
              "Order number (if applicable)",
              "Purchase email used at checkout",
              "Whether you already checked Order lookup and the order detail delivery status",
              "A short issue summary and what you have already tried",
              "Screenshots or exact error message when available",
            ],
          },
          {
            title: "Response timing",
            paragraphs: [
              "We typically respond in sequence based on urgency and completeness of information.",
              "Supplying order number and purchase email first usually reduces turnaround time. Order detail also shows delivery status and resend actions before you contact us.",
            ],
          },
        ],
        relatedLinks: [
          { href: "/orders/lookup", label: "Order lookup" },
          { href: "/email/preferences", label: "Manage email preferences" },
          { href: "/email/unsubscribe", label: "Unsubscribe from emails" },
          { href: "/help/faq", label: "FAQ" },
        ],
      },
    },
  },
  zh: {
    home: {
      kicker: "支持中心",
      title: "帮助中心",
      subtitle: "集中查看报告找回、邮件偏好、退订与常见支持问题的正式处理入口。",
      topicsTitle: "浏览帮助主题",
      quickActionsTitle: "正式入口",
      quickActionsSubtitle:
        "报告找回请使用订单查询，并准备订单号和购买邮箱。管理邮件偏好与报告找回是两条不同设置。退订邮件可走退订页面，邮件里的专属退订链接仍然有效。",
      contactTitle: "需要人工支持？",
      contactSubtitle:
        "请先走订单查询，再用管理邮件偏好处理邮件设置；如果你只是想停邮，请直接使用退订邮件。以上正式路径仍无法解决时，再联系人工支持。",
      browseButton: "进入主题",
    },
    labels: {
      backToHome: "返回帮助中心",
      relatedTitle: "相关链接",
      faqTitle: "常见问题",
    },
    quickActions: [
      {
        href: "/orders/lookup",
        label: "订单查询",
        description: "使用订单号和购买邮箱找回报告。",
        actionLabel: "找回报告",
      },
      {
        href: "/email/preferences",
        label: "管理邮件偏好",
        description: "调整邮件设置，但不会替代报告找回或订单查询。",
        actionLabel: "管理偏好",
      },
      {
        href: "/email/unsubscribe",
        label: "退订邮件",
        description: "在这里停邮，或继续使用你已收到邮件中的专属退订链接。",
        actionLabel: "立即退订",
      },
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
        cardSummary: "报告找回、交付邮件重发、邮件设置、退订与支付支持入口。",
        sections: [
          {
            title: "联系客服前建议先做",
            paragraphs: ["请先走正式的报告找回与邮件设置入口，再决定是否联系人工支持。"],
            bullets: [
              "先带着订单号和购买邮箱进入订单查询",
              "报告找回、订单查询、交付状态确认与重发交付邮件，都先走订单查询",
              "管理邮件偏好用于处理邮件设置，这和报告找回是两条不同入口",
              "退订邮件可直接使用退订页面，也可以继续使用邮件中的专属退订链接",
              "先检查购买邮箱收件箱和垃圾箱中的报告邮件",
              "进入订单详情页查看交付状态、最近发送情况，并按需重发交付邮件",
              "如需购买邮箱恢复，可从订单详情页返回订单查询继续操作",
              "支付失败时优先在原订单页重试，不要重复创建订单",
              "以上正式路径仍无法解决时，再联系支持",
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
              "请先用订单号和购买邮箱进入订单查询。若报告已生成，订单详情页会显示交付状态，并提供查看报告、下载 PDF、重发交付邮件，以及返回订单查询执行购买邮箱恢复的入口。",
          },
          {
            question: "邮件偏好和退订链接如何使用？",
            answer:
              "报告找回和邮件设置是两件事。请使用管理邮件偏好处理邮件设置；如需停邮，请使用退订邮件页面或邮件中的专属退订链接。如果你需要新的报告邮件，请带着订单号和购买邮箱前往订单查询。",
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
          { href: "/email/preferences", label: "管理邮件偏好" },
          { href: "/email/unsubscribe", label: "退订邮件" },
          { href: "/help/contact", label: "联系支持" },
          { href: "/refund", label: "退款政策" },
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
        cardSummary: "正式找回入口、支持邮箱、提交前清单与响应节奏说明。",
        sections: [
          {
            title: "联系支持前请先走这些正式入口",
            paragraphs: [
              "报告找回、订单查询、交付状态确认与重发交付邮件，请先使用订单查询。",
              "邮件设置请使用管理邮件偏好；如果你只是想停邮，请直接使用退订邮件。",
              "邮件中的专属退订链接仍然有效。以上路径仍无法解决时，再联系人工支持。",
            ],
          },
          {
            title: "仍需联系支持时建议提供的信息",
            bullets: [
              "订单号（如有）",
              "购买时使用的邮箱",
              "是否已查看订单查询与订单详情页中的交付状态",
              "问题简述与已尝试步骤",
              "截图或精确报错信息（如有）",
            ],
          },
          {
            title: "响应节奏",
            paragraphs: [
              "我们会按问题紧急程度和信息完整度依次处理。",
              "优先提供订单号和购买邮箱，通常可显著缩短处理时间。联系前也建议先在订单详情页确认交付状态并尝试重发。",
            ],
          },
        ],
        relatedLinks: [
          { href: "/orders/lookup", label: "订单查询" },
          { href: "/email/preferences", label: "管理邮件偏好" },
          { href: "/email/unsubscribe", label: "退订邮件" },
          { href: "/help/faq", label: "常见问题" },
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
