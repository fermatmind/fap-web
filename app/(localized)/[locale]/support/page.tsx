import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ArrowRight, BookOpenText, FileQuestion, LifeBuoy, Mail, ReceiptText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { getContentPage } from "@/lib/cms/content-pages";
import { getHelpGatewaySurface } from "@/lib/publicGateway";
import { buildInterpretationGuidePath, buildSupportArticlePath, listInterpretationGuides, listSupportArticles } from "@/lib/cms/supportTrust";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

function labels(locale: Locale) {
  if (locale === "zh") {
    return {
      headingFallback: "支持与信任中心",
      summaryFallback: "从找回报告，到读懂结果，再到方法边界与数据控制，把最常见的问题放在正式入口里。",
      toolsTitle: "快速自助工具",
      helpTitle: "帮助主题",
      methodBoundariesTitle: "测评科学与边界",
      methodBoundariesSummary: "了解 FermatMind 测评能提供什么参考、不能替代什么判断，以及数据和隐私边界。",
      methodBoundariesBadge: "信任",
      supportArticlesTitle: "支持文章",
      guidesTitle: "结果解读指南",
      contactTitle: "联系支持",
      viewAll: "查看详情",
      supportPathTitle: "常用帮助路径",
      officialEntry: "自助入口",
      topicBadge: "帮助主题",
      articleBadge: "支持文章",
      guideBadge: "解读指南",
      helpFallbackTitle: "帮助中心",
    };
  }

  return {
    headingFallback: "Support & Trust Center",
    summaryFallback:
      "From report recovery, to understanding results, to method boundaries and data controls, the most common questions live behind formal entry points.",
    toolsTitle: "Quick self-serve tools",
    helpTitle: "Help topics",
    methodBoundariesTitle: "Science & boundaries",
    methodBoundariesSummary:
      "Understand what FermatMind assessments can support, what they cannot replace, and where data and privacy boundaries apply.",
    methodBoundariesBadge: "Trust",
    supportArticlesTitle: "Support articles",
    guidesTitle: "Interpretation guides",
    contactTitle: "Contact support",
    viewAll: "View details",
    supportPathTitle: "Common support paths",
    officialEntry: "Self-serve",
    topicBadge: "Help topic",
    articleBadge: "Support article",
    guideBadge: "Guide",
    helpFallbackTitle: "Help center",
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const gateway = await getHelpGatewaySurface(locale);
  const copy = labels(locale);
  const hero = gateway?.landingSurface?.summaryBlocks[0];

  return buildPageMetadata({
    locale,
    pathname: localizedPath("/support", locale),
    title: hero?.title || copy.headingFallback,
    description: hero?.body || copy.summaryFallback,
    alternatesByLocale: {
      en: "/en/support",
      zh: "/zh/support",
      xDefault: "/zh/support",
    },
  });
}

function SectionCard({
  title,
  summary,
  href,
  badge,
  icon,
}: {
  title: string;
  summary: string;
  href: string;
  badge?: string | null;
  icon?: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group flex min-h-[9.5rem] flex-col justify-between rounded-lg border border-[var(--fm-border-soft)] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[var(--fm-accent)] hover:shadow-[0_18px_44px_rgba(15,23,42,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--fm-bg-soft)] text-[var(--fm-accent)]">
              {icon}
            </span>
          ) : null}
          <h3 className="m-0 text-lg font-semibold leading-7 text-[var(--fm-text)] transition group-hover:text-[var(--fm-accent)]">
            {title}
          </h3>
        </div>
        {badge ? (
          <span className="shrink-0 rounded-full border border-[var(--fm-border-soft)] bg-[var(--fm-bg-page)] px-2.5 py-1 text-[11px] font-semibold text-[var(--fm-text-subtle)]">
            {badge}
          </span>
        ) : null}
      </div>
      {summary ? <p className="mt-3 text-sm leading-7 text-[var(--fm-text-muted)]">{summary}</p> : null}
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--fm-accent)]">
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}

function quickToolIcon(index: number) {
  const className = "h-4 w-4";
  if (index === 0) return <ReceiptText className={className} aria-hidden />;
  if (index === 1) return <Mail className={className} aria-hidden />;
  if (index === 2) return <LifeBuoy className={className} aria-hidden />;
  return <ShieldCheck className={className} aria-hidden />;
}

const SUPPORT_CONTACT_SOURCE_SLUGS = [
  "help-contact",
  "help-payment-refund",
  "help-unlock-failure",
  "help-result-recovery",
] as const;

async function getSupportContact(locale: Locale): Promise<string | null> {
  for (const slug of SUPPORT_CONTACT_SOURCE_SLUGS) {
    const page = await getContentPage(slug, locale).catch(() => null);
    if (page?.supportContact) {
      return page.supportContact;
    }
  }

  return null;
}

export default async function SupportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const copy = labels(locale);

  const [gateway, supportArticles, guides, supportContact] = await Promise.all([
    getHelpGatewaySurface(locale),
    listSupportArticles(locale).catch(() => []),
    listInterpretationGuides(locale).catch(() => []),
    getSupportContact(locale),
  ]);

  if (!gateway?.landingSurface) {
    notFound();
  }

  const hero = gateway.landingSurface.summaryBlocks[0];

  return (
    <main className="fm-page-background text-[var(--fm-text)]" data-testid="support-hub">
      <Container className="py-10 md:py-14">
        <section className="grid gap-8 rounded-lg border border-[var(--fm-border-soft)] bg-white px-6 py-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] md:px-8 md:py-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
          <div className="space-y-5">
            <h1 className="m-0 max-w-4xl font-serif text-4xl font-semibold tracking-normal text-[var(--fm-text)] md:text-5xl">
              {hero?.title || copy.headingFallback}
            </h1>
          </div>

          <div className="rounded-lg border border-[var(--fm-border-soft)] bg-[var(--fm-bg-page)] p-5">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-[var(--fm-accent)]">
                <LifeBuoy className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="m-0 text-sm font-semibold text-[var(--fm-text)]">{copy.contactTitle}</p>
                {supportContact ? (
                  <a
                    href={`mailto:${supportContact}`}
                    className="mt-1 block break-all text-sm text-[var(--fm-text-muted)] hover:text-[var(--fm-accent)]"
                  >
                    {supportContact}
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
          <div className="space-y-10">
            <section className="space-y-5" data-testid="support-quick-tools">
              <div className="space-y-2">
                <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{copy.toolsTitle}</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {gateway.landingSurface.ctaBundle.map((cta, index) => (
                  <SectionCard
                    key={cta.key}
                    title={cta.label}
                    summary=""
                    href={cta.href}
                    badge={copy.officialEntry}
                    icon={quickToolIcon(index)}
                  />
                ))}
              </div>
            </section>

            <section className="space-y-5" data-testid="support-topic-groups">
              <div className="space-y-2">
                <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{copy.supportPathTitle}</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {gateway.landingSurface.discoverabilityItems.map((item) => (
                  <SectionCard
                    key={item.key}
                    title={item.title}
                    summary={item.summary}
                    href={item.href}
                    badge={item.badgeLabel || copy.topicBadge}
                    icon={<FileQuestion className="h-4 w-4" aria-hidden />}
                  />
                ))}
                <SectionCard
                  title={copy.methodBoundariesTitle}
                  summary={copy.methodBoundariesSummary}
                  href={localizedPath("/method-boundaries", locale)}
                  badge={copy.methodBoundariesBadge}
                  icon={<ShieldCheck className="h-4 w-4" aria-hidden />}
                />
              </div>
            </section>

            {supportArticles.length ? (
              <section className="space-y-5" data-testid="support-article-groups">
                <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{copy.supportArticlesTitle}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {supportArticles.map((article) => (
                    <SectionCard
                      key={article.id}
                      title={article.title}
                      summary={article.summary}
                      href={buildSupportArticlePath(article.slug, locale)}
                      badge={article.supportCategory || copy.articleBadge}
                      icon={<BookOpenText className="h-4 w-4" aria-hidden />}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {guides.length ? (
              <section className="space-y-5" data-testid="support-guide-groups">
                <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{copy.guidesTitle}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {guides.map((guide) => (
                    <SectionCard
                      key={guide.id}
                      title={guide.title}
                      summary={guide.summary}
                      href={buildInterpretationGuidePath(guide.slug, locale)}
                      badge={guide.testFamily || copy.guideBadge}
                      icon={<BookOpenText className="h-4 w-4" aria-hidden />}
                    />
                  ))}
                </div>
              </section>
            ) : null}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            {supportContact ? (
              <section
                className="rounded-lg border border-[var(--fm-border-soft)] bg-white p-5 shadow-[0_16px_38px_rgba(15,23,42,0.05)]"
                data-testid="support-contact-card"
              >
                <p className="m-0 text-sm font-semibold text-[var(--fm-text)]">{copy.contactTitle}</p>
                <a
                  href={`mailto:${supportContact}`}
                  className="mt-3 block break-all text-sm font-semibold text-[var(--fm-accent)]"
                >
                  {supportContact}
                </a>
              </section>
            ) : null}
            <AnswerSurfaceSection
              surface={gateway.answerSurface}
              locale={locale}
              testId="support-answer-surface"
              hideHeading
              hideSummaryLabel
            />
          </aside>
        </section>
      </Container>
    </main>
  );
}
