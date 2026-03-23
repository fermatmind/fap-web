import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import {
  getHelpCenterContent,
  listHelpCenterPages,
} from "@/lib/help/helpCenterContent";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { getHelpGatewaySurface } from "@/lib/publicGateway";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const pathname = locale === "zh" ? "/zh/help" : "/en/help";
  const content = getHelpCenterContent(locale);

  return buildPageMetadata({
    locale,
    pathname,
    title: content.home.title,
    description: content.home.subtitle,
    alternatesByLocale: {
      en: "/en/help",
      zh: "/zh/help",
      xDefault: "/",
    },
  });
}

export default async function HelpPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const withLocale = (path: string) => localizedPath(path, locale);
  const content = getHelpCenterContent(locale);
  const gatewaySurface = await getHelpGatewaySurface(locale);
  const landingSurface = gatewaySurface?.landingSurface ?? null;
  const pages = listHelpCenterPages(locale);
  const gatewayItems = landingSurface?.discoverabilityItems ?? [];
  const pagesBySlug = new Map<string, (typeof pages)[number]>(
    pages.map((page) => [page.slug, page]),
  );
  const orderedPages = gatewayItems.length > 0
    ? gatewayItems
        .map((item) => pagesBySlug.get(item.key))
        .filter((page): page is NonNullable<typeof page> => Boolean(page))
    : pages;
  const quickActions = landingSurface?.ctaBundle.length
    ? landingSurface.ctaBundle.map((cta) => ({
        href: cta.href.replace(/^\/(en|zh)/, ""),
        label: cta.label,
        description: "",
      }))
    : content.quickActions;
  const heroTitle = landingSurface?.summaryBlocks[0]?.title || content.home.title;
  const heroSummary = landingSurface?.summaryBlocks[0]?.body || content.home.subtitle;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fermatmind.com";

  return (
    <Container as="main" className="max-w-5xl space-y-6 py-10" data-testid="help-home-main">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)]" data-testid="help-home-hero">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {content.home.kicker}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)] md:text-4xl">
          {heroTitle}
        </h1>
        <p className="m-0 max-w-3xl text-[var(--fm-text-muted)]">{heroSummary}</p>
      </section>

      <section className="grid gap-4 md:grid-cols-2" data-testid="help-home-actions">
        <article className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
          <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">{content.home.quickActionsTitle}</h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">{content.home.quickActionsSubtitle}</p>
          <div className="grid gap-3" data-testid="help-home-quick-actions">
            {quickActions.map((action) => (
              <article key={action.href} className="fm-help-topic-card">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
                  {locale === "zh" ? "正式入口" : "Formal path"}
                </p>
                <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">{action.label}</h3>
                {action.description ? <p className="m-0 text-sm text-[var(--fm-text-muted)]">{action.description}</p> : null}
                <div>
                  <Link href={withLocale(action.href)} className="inline-flex">
                    <Button type="button" variant="outline">{action.label}</Button>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
          <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">{content.home.contactTitle}</h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">{content.home.contactSubtitle}</p>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh" ? "支持邮箱：" : "Support email: "}
            <a className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]" href={`mailto:${supportEmail}`}>
              {supportEmail}
            </a>
          </p>
          <Link href={withLocale("/help/contact")} className="inline-flex">
            <Button type="button">{locale === "zh" ? "查看联系说明" : "Contact instructions"}</Button>
          </Link>
        </article>
      </section>

      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]" data-testid="help-home-topics">
        <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{content.home.topicsTitle}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {orderedPages.map((page) => (
            <Link
              key={page.slug}
              href={withLocale(`/help/${page.slug}`)}
              className="fm-help-topic-card"
            >
              <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">{page.title}</h3>
              <p className="m-0 text-sm text-[var(--fm-text-muted)]">{page.cardSummary}</p>
              <span className="fm-help-topic-action">{content.home.browseButton}</span>
            </Link>
          ))}
        </div>
      </section>
    </Container>
  );
}
