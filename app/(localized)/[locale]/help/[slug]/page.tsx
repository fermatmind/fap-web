import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { AnswerSurfaceSection } from "@/components/content/AnswerSurfaceSection";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  HELP_CENTER_SLUGS,
  getHelpCenterContent,
  getHelpCenterPage,
  listHelpCenterPages,
  type HelpCenterPageContent,
} from "@/lib/help/helpCenterContent";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { getHelpDetailGatewaySurface } from "@/lib/publicGateway";
import {
  buildBreadcrumbJsonLd,
  buildFAQPageJsonLd,
  buildWebPageJsonLd,
} from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

const HELP_LIFECYCLE_PATHS = [
  "/orders/lookup",
  "/email/preferences",
  "/email/unsubscribe",
] as const;

function buildCanonicalPath(locale: "en" | "zh", slug: string): string {
  return locale === "zh" ? `/zh/help/${slug}` : `/en/help/${slug}`;
}

function buildHelpAnswerFirst(page: HelpCenterPageContent, locale: "en" | "zh"): string {
  if (locale === "zh") {
    return `${page.cardSummary} 这页先告诉你应该从哪里开始处理，再补充需要准备的信息、边界和下一步入口，避免在订单、政策与支持流程之间来回切换。`;
  }

  return `${page.cardSummary} This page starts with the shortest practical answer, then shows the context, limits, and next public links so you can move without bouncing between support, policy, and product pages.`;
}

export function generateStaticParams() {
  return HELP_CENTER_SLUGS.flatMap((slug) => [
    { locale: "en", slug },
    { locale: "zh", slug },
  ]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const page = getHelpCenterPage(locale, slug);

  if (!page) {
    return {
      title: "Help Page Not Found",
      robots: { index: false, follow: false },
    };
  }

  return buildPageMetadata({
    locale,
    pathname: buildCanonicalPath(locale, page.slug),
    title: page.title,
    description: page.subtitle,
    alternatesByLocale: {
      en: buildCanonicalPath("en", page.slug),
      zh: buildCanonicalPath("zh", page.slug),
      xDefault: "/",
    },
  });
}

export default async function HelpDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = resolveLocale(localeParam);
  const page = getHelpCenterPage(locale, slug);

  if (!page) {
    notFound();
  }

  const content = getHelpCenterContent(locale);
  const pages = listHelpCenterPages(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const gatewaySurface = await getHelpDetailGatewaySurface(page.slug, locale);
  const landingSurface = gatewaySurface?.landingSurface ?? null;
  const answerSurface = gatewaySurface?.answerSurface ?? null;
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fermatmind.com";
  const canonicalPath = buildCanonicalPath(locale, page.slug);
  const answerFirst = landingSurface?.summaryBlocks[0]?.body || buildHelpAnswerFirst(page, locale);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd([
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "帮助中心" : "Help Center", path: localizedPath("/help", locale) },
    { name: page.title, path: canonicalPath },
  ]);
  const webPageJsonLd = buildWebPageJsonLd({
    path: canonicalPath,
    title: page.title,
    description: page.subtitle,
    locale,
  });
  const isFaqPage = page.slug === "faq" && (page.faqItems?.length ?? 0) > 0;
  const hasLifecycleLinks = HELP_LIFECYCLE_PATHS.every((path) =>
    page.relatedLinks.some((item) => item.href === path)
  );
  const lifecycleSupportCopy = locale === "zh"
    ? "先用订单查询处理报告找回、订单查询、交付状态确认和重发交付邮件，再用管理邮件偏好处理邮件设置；如果你只是想停邮，请使用退订邮件或邮件中的专属退订链接，之后仍无法解决再联系支持。"
    : "Start with Order lookup for report recovery, order lookup, delivery status, and resend delivery email. Then use Manage email preferences for email settings. If you only want to stop emails, use Unsubscribe from emails or the dedicated unsubscribe link in any email before contacting support.";

  return (
    <Container as="main" className="max-w-6xl py-10" data-testid={`help-detail-${page.slug}`}>
      <JsonLd id={`help-webpage-${page.slug}`} data={webPageJsonLd} />
      <JsonLd id={`help-breadcrumb-${page.slug}`} data={breadcrumbJsonLd} />
      {isFaqPage ? <JsonLd id={`help-faq-${page.slug}`} data={buildFAQPageJsonLd(page.faqItems ?? [])} /> : null}
      <Breadcrumb
        items={[
          { label: locale === "zh" ? "首页" : "Home", href: localizedPath("/", locale) },
          { label: locale === "zh" ? "帮助中心" : "Help Center", href: withLocale("/help") },
          { label: page.title },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="space-y-5">
          <section
            id="answer-first"
            className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)]"
          >
            <Link
              href={withLocale("/help")}
              className="inline-flex text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
            >
              {content.labels.backToHome}
            </Link>
            <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">
              {landingSurface?.summaryBlocks[0]?.title || page.title}
            </h1>
            <p className="m-0 text-lg text-[var(--fm-text)]">{page.subtitle}</p>
            <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{answerFirst}</p>
          </section>

          <AnswerSurfaceSection surface={answerSurface} locale={locale} testId={`help-answer-surface-${page.slug}`} />

          {page.sections.map((section) => (
            <section
              key={section.title}
              className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
            >
              <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">{section.title}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">
                  {paragraph}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="m-0 list-disc space-y-2 pl-5 text-sm leading-7 text-[var(--fm-text-muted)]">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          {page.faqItems?.length ? (
            <section
              id="faq"
              className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
            >
              <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">{content.labels.faqTitle}</h2>
              <dl className="m-0 space-y-4">
                {page.faqItems.map((item) => (
                  <div key={item.question} className="space-y-1">
                    <dt className="font-medium text-[var(--fm-text)]">{item.question}</dt>
                    <dd className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{item.answer}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          <section
            className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
            data-testid={`help-detail-related-links-${page.slug}`}
          >
            <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">{content.labels.relatedTitle}</h2>
            {hasLifecycleLinks ? (
              <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{lifecycleSupportCopy}</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {(landingSurface?.ctaBundle.length
                ? landingSurface.ctaBundle.map((item) => ({
                    href: item.href.replace(/^\/(en|zh)/, ""),
                    label: item.label,
                  }))
                : page.relatedLinks
              ).map((item) => (
                <Link key={item.href} href={withLocale(item.href)} className="fm-help-chip-link">
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={withLocale("/personality")} className="fm-help-chip-link">
                {locale === "zh" ? "人格画像" : "Personality hub"}
              </Link>
              <Link href={withLocale("/topics")} className="fm-help-chip-link">
                {locale === "zh" ? "主题聚合" : "Topic hubs"}
              </Link>
              <Link href={withLocale("/career/recommendations")} className="fm-help-chip-link">
                {locale === "zh" ? "职业推荐" : "Career recommendations"}
              </Link>
            </div>
            {page.slug === "contact" ? (
              <p className="m-0 text-sm text-[var(--fm-text-muted)]">
                {locale === "zh" ? "支持邮箱：" : "Support email: "}
                <a className="font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]" href={`mailto:${supportEmail}`}>
                  {supportEmail}
                </a>
              </p>
            ) : null}
          </section>
        </article>

        <aside className="h-fit rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 shadow-[var(--fm-shadow-sm)] lg:sticky lg:top-24">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-accent)]">
            {content.home.title}
          </p>
          <nav className="mt-3 grid gap-2" aria-label={content.home.title}>
            {pages.map((item) => {
              const isActive = item.slug === page.slug;
              return (
                <Link
                  key={item.slug}
                  href={withLocale(`/help/${item.slug}`)}
                  className={isActive ? "fm-help-side-link fm-help-side-link--active" : "fm-help-side-link"}
                >
                  {item.navLabel}
                </Link>
              );
            })}
          </nav>
        </aside>
      </div>
    </Container>
  );
}
