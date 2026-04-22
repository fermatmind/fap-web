import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

type SupportLink = {
  label: string;
  href: string;
  description?: string;
  kind: "tool" | "guide";
};

type SupportTopic = {
  key: string;
  title: string;
  summary: string;
  items: SupportLink[];
};

const copy = {
  zh: {
    eyebrow: "Support & Trust",
    title: "支持与信任中心",
    subtitle: "从找回报告，到读懂结果，再到方法边界与数据控制，把最常见的问题放在正式入口里。",
    quickTitle: "快速自助工具",
    quickSubtitle: "这些入口已经接入正式产品路径，可以直接处理订单找回、邮件偏好与退订。",
    topicTitle: "按主题继续处理",
    contactTitle: "需要进一步协助？",
    contactBody:
      "如果自助入口没有解决问题，请前往联系支持页面。为了更快定位问题，请准备订单号、购买邮箱、截图和发生时间。",
    contactCta: "联系支持",
    toolLabel: "工具",
    guideLabel: "说明",
    quickActions: [
      {
        label: "查询订单与找回报告",
        href: "/orders/lookup",
        description: "用订单号和购买邮箱找回报告，查看交付状态。",
        kind: "tool",
      },
      {
        label: "邮件偏好管理",
        href: "/email/preferences",
        description: "管理通知与邮件偏好；这不是报告找回入口。",
        kind: "tool",
      },
      {
        label: "退订通知邮件",
        href: "/email/unsubscribe",
        description: "停止通知邮件，也可使用邮件内专属退订链接。",
        kind: "tool",
      },
      {
        label: "隐私与数据说明",
        href: "/privacy",
        description: "查看隐私政策、数据请求渠道与处理说明。",
        kind: "guide",
      },
    ] satisfies SupportLink[],
    topics: [
      {
        key: "orders",
        title: "报告与订单",
        summary: "处理订单查询、报告找回、支付异常和退款说明。",
        items: [
          { label: "查询订单", href: "/orders/lookup", kind: "tool" },
          { label: "找回报告", href: "/orders/lookup", kind: "tool" },
          { label: "支付异常与退款说明", href: "/help/faq", kind: "guide" },
        ],
      },
      {
        key: "results",
        title: "读懂结果",
        summary: "了解结果阅读方式、免费结果与完整结果差异，以及常见解释问题。",
        items: [
          { label: "结果怎么看", href: "/help/faq", kind: "guide" },
          { label: "免费结果与完整结果差异", href: "/help/faq", kind: "guide" },
          { label: "常见问题说明", href: "/help/faq", kind: "guide" },
        ],
      },
      {
        key: "science",
        title: "测评科学与边界",
        summary: "确认测什么、不测什么、非诊断边界和方法说明。",
        items: [
          { label: "测什么 / 不测什么", href: "/about", kind: "guide" },
          { label: "非诊断边界", href: "/help/about", kind: "guide" },
          { label: "方法说明", href: "/about", kind: "guide" },
        ],
      },
      {
        key: "data",
        title: "账户与数据",
        summary: "管理邮件入口、退订、隐私说明，以及数据请求说明。",
        items: [
          { label: "邮件偏好", href: "/email/preferences", kind: "tool" },
          { label: "退订", href: "/email/unsubscribe", kind: "tool" },
          { label: "隐私说明", href: "/privacy", kind: "guide" },
          { label: "数据请求说明", href: "/privacy", kind: "guide" },
        ],
      },
    ] satisfies SupportTopic[],
  },
  en: {
    eyebrow: "Support & Trust",
    title: "Support & Trust Center",
    subtitle:
      "From report recovery, to understanding results, to method boundaries and data controls, the most common questions live behind formal entry points.",
    quickTitle: "Quick self-serve tools",
    quickSubtitle:
      "These entries already connect to formal product paths for report recovery, email preferences, and unsubscribe flows.",
    topicTitle: "Continue by topic",
    contactTitle: "Need further help?",
    contactBody:
      "If the self-serve paths do not resolve the issue, open the contact support page. Please prepare your order number, purchase email, screenshots, and the time it happened.",
    contactCta: "Contact support",
    toolLabel: "Tool",
    guideLabel: "Guide",
    quickActions: [
      {
        label: "Look up an order and recover a report",
        href: "/orders/lookup",
        description: "Use your order number and purchase email to recover reports and check delivery status.",
        kind: "tool",
      },
      {
        label: "Manage email preferences",
        href: "/email/preferences",
        description: "Manage notification and email preferences; this is separate from report recovery.",
        kind: "tool",
      },
      {
        label: "Unsubscribe from notification emails",
        href: "/email/unsubscribe",
        description: "Stop notification emails, or use the dedicated unsubscribe link inside an email.",
        kind: "tool",
      },
      {
        label: "Privacy and data information",
        href: "/privacy",
        description: "Review privacy terms, data request channels, and processing notes.",
        kind: "guide",
      },
    ] satisfies SupportLink[],
    topics: [
      {
        key: "orders",
        title: "Reports & orders",
        summary: "Handle order lookup, report recovery, payment exceptions, and refund information.",
        items: [
          { label: "Order lookup", href: "/orders/lookup", kind: "tool" },
          { label: "Recover a report", href: "/orders/lookup", kind: "tool" },
          { label: "Payment exceptions and refund information", href: "/help/faq", kind: "guide" },
        ],
      },
      {
        key: "results",
        title: "Understand results",
        summary: "Read result guidance, free versus full result differences, and common explanation notes.",
        items: [
          { label: "How to read results", href: "/help/faq", kind: "guide" },
          { label: "Free result and full result differences", href: "/help/faq", kind: "guide" },
          { label: "FAQ and formal explanations", href: "/help/faq", kind: "guide" },
        ],
      },
      {
        key: "science",
        title: "Assessment science & boundaries",
        summary: "Check what the assessments measure, what they do not measure, non-diagnostic boundaries, and methodology notes.",
        items: [
          { label: "What we measure / do not measure", href: "/about", kind: "guide" },
          { label: "Non-diagnostic boundaries", href: "/help/about", kind: "guide" },
          { label: "Methodology notes", href: "/about", kind: "guide" },
        ],
      },
      {
        key: "data",
        title: "Account & data",
        summary: "Manage email paths, unsubscribe, privacy information, and data request instructions.",
        items: [
          { label: "Email preferences", href: "/email/preferences", kind: "tool" },
          { label: "Unsubscribe", href: "/email/unsubscribe", kind: "tool" },
          { label: "Privacy information", href: "/privacy", kind: "guide" },
          { label: "Data request instructions", href: "/privacy", kind: "guide" },
        ],
      },
    ] satisfies SupportTopic[],
  },
} satisfies Record<Locale, {
  eyebrow: string;
  title: string;
  subtitle: string;
  quickTitle: string;
  quickSubtitle: string;
  topicTitle: string;
  contactTitle: string;
  contactBody: string;
  contactCta: string;
  toolLabel: string;
  guideLabel: string;
  quickActions: SupportLink[];
  topics: SupportTopic[];
}>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const current = copy[locale];

  return buildPageMetadata({
    locale,
    pathname: localizedPath("/support", locale),
    title: current.title,
    description: current.subtitle,
    alternatesByLocale: {
      en: "/en/support",
      zh: "/zh/support",
      xDefault: "/support",
    },
  });
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const current = copy[locale];
  const withLocale = (path: string) => localizedPath(path, locale);
  const labelFor = (kind: SupportLink["kind"]) => (kind === "tool" ? current.toolLabel : current.guideLabel);

  return (
    <main className="bg-white text-[var(--fm-text)]" data-testid="support-center-main">
      <Container className="max-w-6xl py-10 md:py-14">
        <section className="grid gap-8 border-b border-[var(--fm-border)] py-10 md:grid-cols-[minmax(0,1fr)_18rem] md:py-14">
          <div className="max-w-4xl space-y-5">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
              {current.eyebrow}
            </p>
            <h1 className="m-0 font-serif text-4xl font-semibold leading-tight text-[var(--fm-text)] md:text-6xl">
              {current.title}
            </h1>
            <p className="m-0 max-w-3xl text-lg leading-8 text-[var(--fm-text-muted)] md:text-xl md:leading-9">
              {current.subtitle}
            </p>
          </div>
          <aside className="h-fit rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5">
            <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
              {current.contactTitle}
            </h2>
            <p className="mb-5 mt-3 text-sm leading-6 text-[var(--fm-text-muted)]">
              {current.contactBody}
            </p>
            <Link
              href={withLocale("/help/contact")}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--fm-accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--fm-accent-strong)]"
            >
              {current.contactCta}
            </Link>
          </aside>
        </section>

        <section className="space-y-5 py-10 md:py-14" aria-labelledby="support-quick-tools">
          <div className="max-w-3xl space-y-2">
            <h2 id="support-quick-tools" className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)] md:text-3xl">
              {current.quickTitle}
            </h2>
            <p className="m-0 text-base leading-7 text-[var(--fm-text-muted)]">{current.quickSubtitle}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="support-quick-tools">
            {current.quickActions.map((action) => (
              <Link
                key={action.href}
                href={withLocale(action.href)}
                className="grid gap-2 rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 no-underline transition hover:border-[var(--fm-accent)]"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                  {labelFor(action.kind)}
                </span>
                <span className="m-0 text-base font-semibold text-[var(--fm-text)]">{action.label}</span>
                {action.description ? <span className="text-sm leading-6 text-[var(--fm-text-muted)]">{action.description}</span> : null}
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-5 border-t border-[var(--fm-border)] py-10 md:py-14" aria-labelledby="support-topic-groups">
          <h2 id="support-topic-groups" className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)] md:text-3xl">
            {current.topicTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-2" data-testid="support-topic-groups">
            {current.topics.map((topic) => (
              <article key={topic.key} className="rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5">
                <div className="space-y-2">
                  <h3 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">{topic.title}</h3>
                  <p className="m-0 text-sm leading-6 text-[var(--fm-text-muted)]">{topic.summary}</p>
                </div>
                <div className="mt-5 grid gap-2">
                  {topic.items.map((item) => (
                    <Link
                      key={`${topic.key}-${item.label}`}
                      href={withLocale(item.href)}
                      className="flex items-center justify-between gap-3 rounded-md border border-[var(--fm-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--fm-text)] transition hover:border-[var(--fm-accent)] hover:text-[var(--fm-accent)]"
                    >
                      <span>{item.label}</span>
                      <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-muted)]">
                        {labelFor(item.kind)}
                      </span>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}
