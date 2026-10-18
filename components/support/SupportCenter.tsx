"use client";

import { useId, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Check, ChevronRight, CircleHelp, FileText, Fingerprint, Mail, Plus, ReceiptText, RotateCcw, Search, ShieldCheck, Users, X } from "lucide-react";
import type { LandingCtaViewModel } from "@/lib/landing/landingSurface";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import { renderCmsInlineMarkdown } from "@/lib/content/markdownInline";
import { matchesHelpSearch, matchesHelpTopic, type HelpEntry, type HelpQuestion, type HelpTopic } from "@/lib/support/helpCenter";
import styles from "./SupportCenter.module.css";

const topicIcons = { all: CircleHelp, results: FileText, orders: ReceiptText, email: Mail, assessments: BookOpen, privacy: Fingerprint, business: Users };
const topicIds: HelpTopic[] = ["all", "results", "orders", "email", "assessments", "privacy", "business"];

function getCopy(locale: Locale) {
  return locale === "zh" ? {
    eyebrow: "FERMATMIND · 帮助中心",
    intro: "找回已保存的结果、查询订单，或找到你需要的答案。",
    search: "搜索本页帮助",
    placeholder: "试试“报告”“支付”或“邮件”",
    suggestions: ["报告", "退款", "邮件"],
    popular: "你可能在找",
    clear: "清除搜索",
    jump: "浏览帮助主题",
    quickTitle: "常用操作",
    results: "找回已保存的结果",
    resultsHint: "使用保存结果时填写的邮箱。",
    orderHint: "使用订单号和购买邮箱查询。",
    emailHint: "了解邮件专属链接的使用方式。",
    emailNote: "管理偏好与退订请使用邮件中的专属链接；普通入口提供使用说明。",
    contactHint: "告诉我们你遇到的问题。",
    topicHeading: "按主题查找",
    topics: { all: "全部帮助", results: "结果与报告", orders: "订单与支付", email: "邮件设置", assessments: "理解测评", privacy: "隐私与数据", business: "企业与研究" },
    faq: "常见问题",
    faqIntro: "先看看这些问题，答案也许就在这里。",
    faqLink: "查看完整常见问题",
    readMore: "阅读帮助",
    resources: "更多帮助与指南",
    tools: "自助与设置入口",
    guide: "解读指南",
    article: "帮助文章",
    tool: "操作入口",
    matches: (n: number) => `${n} 条相关帮助`,
    queryLabel: (q: string) => `“${q}”的搜索结果`,
    emptyTitle: "暂时没有找到相关内容",
    emptyBody: "换一个更简短的关键词，或直接联系支持。",
    reset: "查看全部帮助",
    contactTitle: "仍然需要帮助？",
    contactIntro: "把遇到的问题、已尝试的步骤和报错信息告诉我们。",
    contactNote: "涉及订单时可附订单识别信息。截图前请遮盖私密结果链接和支付信息。",
    contactDetails: "查看联系说明",
    trustEyebrow: "清楚了解，放心使用",
    trustTitle: "关于测评与数据，你有权了解更多。",
    method: "测评方法与使用边界",
    privacy: "隐私与数据说明",
    terms: "服务条款",
    about: "了解费马测试",
  } : {
    eyebrow: "FERMATMIND · HELP CENTER",
    intro: "Find saved results, check an order, or find the answer you need.",
    search: "Search this help center",
    placeholder: "Try “results”, “payment” or “email”",
    suggestions: ["results", "refund", "email"],
    popular: "You might be looking for",
    clear: "Clear search",
    jump: "Browse help topics",
    quickTitle: "Quick actions",
    results: "Find saved results",
    resultsHint: "Use the email you saved your results with.",
    orderHint: "Use your order number and purchase email.",
    emailHint: "Learn how the links in your emails work.",
    emailNote: "Use the personal links in your emails to change preferences or unsubscribe. The general pages explain how.",
    contactHint: "Tell us what you need help with.",
    topicHeading: "Browse by topic",
    topics: { all: "All help", results: "Results & reports", orders: "Orders & payments", email: "Email settings", assessments: "Understanding assessments", privacy: "Privacy & data", business: "Business & research" },
    faq: "Common questions",
    faqIntro: "A good place to start. Your answer may already be here.",
    faqLink: "View all common questions",
    readMore: "Read help",
    resources: "More help & guides",
    tools: "Self-service & settings",
    guide: "Interpretation guide",
    article: "Help article",
    tool: "Self-service",
    matches: (n: number) => `${n} relevant help ${n === 1 ? "item" : "items"}`,
    queryLabel: (q: string) => `Results for “${q}”`,
    emptyTitle: "No matching help just yet",
    emptyBody: "Try a shorter search, or get in touch with support.",
    reset: "View all help",
    contactTitle: "Still need a hand?",
    contactIntro: "Tell us about the issue, what you have tried, and any error message.",
    contactNote: "For an order issue, include order identification. Hide private result links and payment information in screenshots.",
    contactDetails: "Contact details",
    trustEyebrow: "CLARITY BUILDS CONFIDENCE",
    trustTitle: "Understand your assessments. Stay informed about your data.",
    method: "Assessment methods & boundaries",
    privacy: "Privacy & data information",
    terms: "Terms of service",
    about: "About FermatMind",
  };
}

export type SupportCenterProps = {
  locale: Locale;
  title: string;
  entries: HelpEntry[];
  questions: HelpQuestion[];
  tools: LandingCtaViewModel[];
  contactHref: string | null;
  contactLabel: string | null;
  contactLink: ReactNode;
};

export function SupportCenter({ locale, title, entries, questions, tools, contactHref, contactLabel, contactLink }: SupportCenterProps) {
  const copy = useMemo(() => getCopy(locale), [locale]);
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<HelpTopic>("all");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const searching = query.trim().length > 0;
  const filtering = searching || topic !== "all";
  const filteredEntries = useMemo(() => entries.filter((entry) =>
    matchesHelpTopic(topic, entry.topic, entry.title, entry.href) && matchesHelpSearch(query, entry.title, entry.summary, copy.topics[entry.topic]),
  ), [entries, query, topic, copy.topics]);
  const filteredQuestions = useMemo(() => questions.filter((question) =>
    matchesHelpTopic(topic, question.topic, question.question) && matchesHelpSearch(query, question.question, question.answer, copy.topics[question.topic]),
  ), [questions, query, topic, copy.topics]);
  const total = filteredEntries.length + filteredQuestions.length;
  const order = tools.find((tool) => tool.key === "order_lookup" || tool.href.endsWith("/orders/lookup"));
  const email = tools.find((tool) => tool.key === "email_preferences" || tool.href.endsWith("/email/preferences"));
  const faq = entries.find((entry) => entry.href.endsWith("/help/faq"));
  const about = entries.filter((entry) => /\/(about|team|used-and-mentioned)$/.test(entry.href));
  const visibleArticles = filteredEntries.filter((entry) => entry.kind !== "tool" && (filtering || !about.includes(entry)));
  const visibleTools = filteredEntries.filter((entry) => entry.kind === "tool");

  function reset() {
    setQuery("");
    setTopic("all");
    setOpenQuestion(null);
  }

  return (
    <main className={styles.center} data-testid="support-hub">
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.heroInner}>
            <p className={styles.eyebrow}><span aria-hidden />{copy.eyebrow}</p>
            <h1>{title}</h1>
            <p className={styles.intro}>{copy.intro}</p>
            <div className={styles.searchBox} role="search" aria-label={copy.search}>
              <Search aria-hidden className={styles.searchIcon} size={23} />
              <label htmlFor={searchId} className="sr-only">{copy.search}</label>
              <input id={searchId} type="search" value={query} placeholder={copy.placeholder} autoComplete="off" maxLength={200}
                onChange={(event) => { setQuery(event.target.value); setTopic("all"); }}
                onKeyDown={(event) => { if (event.key === "Escape") reset(); }} aria-controls="help-content" />
              {query ? <button type="button" onClick={reset} aria-label={copy.clear} className={styles.clear}><X size={19} aria-hidden /></button> : null}
              <span className={styles.searchKey} aria-hidden><Search size={17} /></span>
            </div>
            <div className={styles.suggestions}>
              <span>{copy.popular}</span>
              {copy.suggestions.map((word) => <button type="button" key={word} onClick={() => { setQuery(word); setTopic("all"); }}>{word}<ArrowUpRight size={12} aria-hidden /></button>)}
            </div>
          </div>
          <a className={styles.browseLink} href="#help-topics">{copy.jump}<ArrowDown size={15} aria-hidden /></a>
        </div>
      </section>

      <section className={styles.quickSection} aria-label={copy.quickTitle}>
        <div className={`${styles.container} ${styles.quickGrid}`}>
          <Link href={localizedPath("/results/lookup", locale)} className={styles.quickAction}>
            <span className={styles.actionIcon}><RotateCcw size={23} strokeWidth={1.5} aria-hidden /></span>
            <span><strong>{copy.results}</strong><small>{copy.resultsHint}</small></span><ArrowUpRight size={18} aria-hidden className={styles.actionArrow} />
          </Link>
          {order ? <Link href={order.href} className={styles.quickAction}>
            <span className={styles.actionIcon}><ReceiptText size={23} strokeWidth={1.5} aria-hidden /></span>
            <span><strong>{order.label}</strong><small>{copy.orderHint}</small></span><ArrowUpRight size={18} aria-hidden className={styles.actionArrow} />
          </Link> : null}
          {email ? <Link href={email.href} className={styles.quickAction}>
            <span className={styles.actionIcon}><Mail size={23} strokeWidth={1.5} aria-hidden /></span>
            <span><strong>{email.label}</strong><small>{copy.emailHint}</small></span><ArrowUpRight size={18} aria-hidden className={styles.actionArrow} />
          </Link> : null}
          {contactHref ? <Link href={contactHref} className={styles.quickAction}>
            <span className={styles.actionIcon}><CircleHelp size={23} strokeWidth={1.5} aria-hidden /></span>
            <span><strong>{contactLabel}</strong><small>{copy.contactHint}</small></span><ArrowUpRight size={18} aria-hidden className={styles.actionArrow} />
          </Link> : null}
        </div>
      </section>

      <div className={`${styles.container} ${styles.workspace}`} id="help-topics">
        <aside className={styles.sidebar}>
          <nav aria-label={copy.topicHeading}>
            <p className={styles.navHeading}>{copy.topicHeading}</p>
            <div className={styles.topicList}>
              {topicIds.map((id) => {
                const Icon = topicIcons[id];
                return <button key={id} type="button" className={`${styles.topic} ${topic === id ? styles.activeTopic : ""}`} aria-pressed={topic === id} aria-controls="help-content" onClick={() => setTopic(id)}>
                  <Icon size={17} strokeWidth={1.6} aria-hidden /><span>{copy.topics[id]}</span>{topic === id ? <ChevronRight size={14} aria-hidden /> : null}
                </button>;
              })}
            </div>
          </nav>
          <div className={styles.sideNote}><ShieldCheck size={19} strokeWidth={1.5} aria-hidden /><p>{locale === "zh" ? "先了解结果的含义，再决定下一步。" : "Understand your results before deciding what comes next."}</p><Link href={localizedPath("/method-boundaries", locale)}>{copy.method}<ArrowUpRight size={13} aria-hidden /></Link></div>
        </aside>

        <div className={styles.content} id="help-content" data-testid="support-topic-groups">
          <div className={styles.contentHeading}>
            <div><p className={styles.sectionEyebrow}>{filtering ? copy.topicHeading : "HELP & ANSWERS"}</p><h2>{searching ? copy.queryLabel(query.trim()) : topic !== "all" ? copy.topics[topic] : copy.faq}</h2></div>
            <span className={styles.resultCount} role="status" aria-live="polite">{filtering ? copy.matches(total) : String(questions.length).padStart(2, "0")}</span>
          </div>
          {!filtering ? <p className={styles.sectionIntro}>{copy.faqIntro}</p> : null}

          {filtering && total === 0 ? <div className={styles.empty} data-testid="support-search-empty"><Search size={28} strokeWidth={1.3} aria-hidden /><h3>{copy.emptyTitle}</h3><p>{copy.emptyBody}</p><button type="button" onClick={reset}>{copy.reset}<ArrowRight size={16} aria-hidden /></button></div> : null}

          {filteredQuestions.length ? <section className={styles.faqList} aria-label={copy.faq}>
            {filteredQuestions.map((question, index) => {
              const isOpen = openQuestion === question.key;
              const answerId = `help-answer-${question.key.replace(/[^a-zA-Z0-9_-]/g, "-")}`;
              return <div className={`${styles.question} ${isOpen ? styles.openQuestion : ""}`} key={question.key}>
                <h3><button type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setOpenQuestion(isOpen ? null : question.key)}><span className={styles.questionNumber} aria-hidden>{String(index + 1).padStart(2, "0")}</span><span>{question.question}</span><Plus size={20} aria-hidden /></button></h3>
                <div id={answerId} hidden={!isOpen} className={styles.answer}>
                  {question.answer.split(/\n\s*\n/).map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{renderCmsInlineMarkdown(paragraph, `${question.key}-${paragraphIndex}`, { locale })}</p>)}
                  {question.topic === "email" ? <p className={styles.emailNote}>{copy.emailNote}</p> : null}
                </div>
              </div>;
            })}
          </section> : null}

          {!filtering && faq ? <Link href={faq.href} className={styles.textLink}>{copy.faqLink}<ArrowRight size={16} aria-hidden /></Link> : null}

          {visibleArticles.length ? <section className={styles.resources} data-testid="support-article-groups">
            <div className={styles.sectionHeader}><h2>{copy.resources}</h2><BookOpen size={19} strokeWidth={1.5} aria-hidden /></div>
            <div className={styles.resourceList}>{visibleArticles.map((entry) => <Link href={entry.href} key={entry.key} className={styles.resource}>
              <span><span className={styles.resourceKind}>{entry.kind === "guide" ? copy.guide : copy.article}</span><strong>{entry.title}</strong>{entry.summary ? <span className={styles.resourceSummary}>{entry.summary}</span> : null}</span><ArrowUpRight size={18} aria-hidden />
            </Link>)}</div>
          </section> : null}

          {visibleTools.length ? <section className={styles.selfService} data-testid="support-quick-tools">
            <h2>{copy.tools}</h2><div className={styles.toolLinks}>{visibleTools.map((entry) => <Link href={entry.href} key={entry.key}>{entry.title}<ArrowUpRight size={15} aria-hidden /></Link>)}</div>
            {visibleTools.some((entry) => entry.topic === "email") ? <p className={styles.emailNote}>{copy.emailNote}</p> : null}
          </section> : null}

          {about.length && !filtering ? <section className={styles.aboutLinks}><span>{copy.about}</span>{about.map((entry) => <Link href={entry.href} key={entry.key}>{entry.title}<ArrowUpRight size={12} aria-hidden /></Link>)}</section> : null}
        </div>
      </div>

      <section className={`${styles.container} ${styles.contactWrap}`} data-testid="support-contact-card">
        <div className={styles.contactBand}>
          <div><span className={styles.contactEyebrow}><Mail size={15} aria-hidden />FERMATMIND SUPPORT</span><h2>{copy.contactTitle}</h2><p>{copy.contactIntro}</p><p className={styles.contactNote}>{copy.contactNote}</p></div>
          <div className={styles.contactActions}>{contactLink}{contactHref ? <Link href={contactHref}>{copy.contactDetails}<ArrowUpRight size={15} aria-hidden /></Link> : null}</div>
        </div>
      </section>

      <section className={`${styles.container} ${styles.trust}`}>
        <div><p className={styles.sectionEyebrow}><Check size={14} aria-hidden />{copy.trustEyebrow}</p><h2>{copy.trustTitle}</h2></div>
        <div className={styles.trustLinks}>
          <Link href={localizedPath("/method-boundaries", locale)}><BookOpen size={18} aria-hidden />{copy.method}<ArrowUpRight size={15} aria-hidden /></Link>
          <Link href={localizedPath("/privacy", locale)}><ShieldCheck size={18} aria-hidden />{copy.privacy}<ArrowUpRight size={15} aria-hidden /></Link>
          <Link href={localizedPath("/terms", locale)}><FileText size={18} aria-hidden />{copy.terms}<ArrowUpRight size={15} aria-hidden /></Link>
        </div>
      </section>
    </main>
  );
}
