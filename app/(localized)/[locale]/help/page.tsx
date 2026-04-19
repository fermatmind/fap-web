import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { listContentPages } from "@/lib/cms/content-pages";
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
  const gatewaySurface = await getHelpGatewaySurface(locale);
  const landingSurface = gatewaySurface?.landingSurface ?? null;
  const heroBlock = landingSurface?.summaryBlocks[0] ?? null;
  const title = heroBlock?.title || (locale === "zh" ? "帮助中心" : "Help Center");

  return buildPageMetadata({
    locale,
    pathname,
    title,
    description: heroBlock?.body || title,
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
  const gatewaySurface = await getHelpGatewaySurface(locale);
  const landingSurface = gatewaySurface?.landingSurface ?? null;
  const pages = await listContentPages(locale, "help");
  const pagesBySlug = new Map(pages.map((page) => [page.slug.replace(/^help-/, ""), page]));
  const gatewayItems = landingSurface?.discoverabilityItems ?? [];
  const orderedPages = gatewayItems.length
    ? gatewayItems
        .map((item) => pagesBySlug.get(item.key))
        .filter((page): page is NonNullable<typeof page> => Boolean(page))
    : pages;
  const quickActions = landingSurface?.ctaBundle ?? [];
  const heroTitle = landingSurface?.summaryBlocks[0]?.title || (locale === "zh" ? "帮助中心" : "Help Center");
  const heroSummary = landingSurface?.summaryBlocks[0]?.body || "";

  return (
    <Container as="main" className="max-w-5xl space-y-6 py-10" data-testid="help-home-main">
      <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)]" data-testid="help-home-hero">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
          {locale === "zh" ? "支持中心" : "Support Center"}
        </p>
        <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)] md:text-4xl">
          {heroTitle}
        </h1>
        {heroSummary ? <p className="m-0 max-w-3xl text-[var(--fm-text-muted)]">{heroSummary}</p> : null}
      </section>

      {quickActions.length > 0 ? (
        <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]" data-testid="help-home-actions">
          <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "正式入口" : "Formal entry points"}
          </h2>
          <div className="grid gap-3 md:grid-cols-3" data-testid="help-home-quick-actions">
            {quickActions.map((action) => (
              <Link key={action.key} href={action.href} className="fm-help-topic-card">
                <span className="m-0 text-base font-semibold text-[var(--fm-text)]">{action.label}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {orderedPages.length > 0 ? (
        <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]" data-testid="help-home-topics">
          <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">
            {locale === "zh" ? "浏览帮助主题" : "Browse help topics"}
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            {orderedPages.map((page) => (
              <Link
                key={page.slug}
                href={withLocale(page.path)}
                className="fm-help-topic-card"
              >
                <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">{page.title}</h3>
                <p className="m-0 text-sm text-[var(--fm-text-muted)]">{page.summary}</p>
                <span className="fm-help-topic-action">{locale === "zh" ? "进入主题" : "Open topic"}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </Container>
  );
}
