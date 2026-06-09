import type { Metadata } from "next";
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
      emptySupportArticles: "当前还没有公开的支持文章。",
      emptyGuides: "当前还没有公开的结果解读指南。",
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
    emptySupportArticles: "No public support articles are published yet.",
    emptyGuides: "No public interpretation guides are published yet.",
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
}: {
  title: string;
  summary: string;
  href: string;
  badge?: string | null;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-[var(--fm-border)] bg-white p-5 transition hover:border-[var(--fm-accent)] hover:shadow-[var(--fm-shadow-sm)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)] transition group-hover:text-[var(--fm-accent)]">
          {title}
        </h3>
        {badge ? (
          <span className="rounded-full border border-[var(--fm-border)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--fm-text-subtle)]">
            {badge}
          </span>
        ) : null}
      </div>
      {summary ? <p className="mt-3 text-sm leading-7 text-[var(--fm-text-muted)]">{summary}</p> : null}
    </Link>
  );
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
        <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                {copy.helpFallbackTitle}
              </p>
              <h1 className="m-0 max-w-4xl font-serif text-4xl font-semibold tracking-tight text-[var(--fm-text)] md:text-5xl">
                {hero?.title || copy.headingFallback}
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-[var(--fm-text-muted)]">
                {hero?.body || copy.summaryFallback}
              </p>
            </div>

            <section className="space-y-4" data-testid="support-quick-tools">
              <div className="space-y-2">
                <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{copy.toolsTitle}</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {gateway.landingSurface.ctaBundle.map((cta) => (
                  <SectionCard key={cta.key} title={cta.label} summary="" href={cta.href} badge={cta.kind} />
                ))}
              </div>
            </section>

            <section className="space-y-4" data-testid="support-topic-groups">
              <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{copy.helpTitle}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {gateway.landingSurface.discoverabilityItems.map((item) => (
                  <SectionCard
                    key={item.key}
                    title={item.title}
                    summary={item.summary}
                    href={item.href}
                    badge={item.badgeLabel}
                  />
                ))}
                <SectionCard
                  title={copy.methodBoundariesTitle}
                  summary={copy.methodBoundariesSummary}
                  href={localizedPath("/method-boundaries", locale)}
                  badge={copy.methodBoundariesBadge}
                />
              </div>
            </section>

            <section className="space-y-4" data-testid="support-article-groups">
              <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{copy.supportArticlesTitle}</h2>
              {supportArticles.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {supportArticles.map((article) => (
                    <SectionCard
                      key={article.id}
                      title={article.title}
                      summary={article.summary}
                      href={buildSupportArticlePath(article.slug, locale)}
                      badge={article.supportCategory}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-[var(--fm-text-muted)]">{copy.emptySupportArticles}</p>
              )}
            </section>

            <section className="space-y-4" data-testid="support-guide-groups">
              <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{copy.guidesTitle}</h2>
              {guides.length ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {guides.map((guide) => (
                    <SectionCard
                      key={guide.id}
                      title={guide.title}
                      summary={guide.summary}
                      href={buildInterpretationGuidePath(guide.slug, locale)}
                      badge={guide.testFamily}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm leading-7 text-[var(--fm-text-muted)]">{copy.emptyGuides}</p>
              )}
            </section>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24">
            {supportContact ? (
              <section
                className="rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5"
                data-testid="support-contact-card"
              >
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
                  {copy.contactTitle}
                </p>
                <a
                  href={`mailto:${supportContact}`}
                  className="mt-3 block break-all text-sm font-semibold text-[var(--fm-text)] hover:text-[var(--fm-accent)]"
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
