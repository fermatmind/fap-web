import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/layout/Container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HELP_CENTER_SLUGS,
  getHelpCenterContent,
  getHelpCenterPage,
  listHelpCenterPages,
} from "@/lib/help/helpCenterContent";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";

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
    pathname: locale === "zh" ? `/zh/help/${page.slug}` : `/en/help/${page.slug}`,
    title: page.title,
    description: page.subtitle,
    alternatesByLocale: {
      en: `/en/help/${page.slug}`,
      zh: `/zh/help/${page.slug}`,
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
  const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fermatmind.com";

  return (
    <Container as="main" className="max-w-6xl py-10" data-testid={`help-detail-${page.slug}`}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article className="space-y-5">
          <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-6 shadow-[var(--fm-shadow-sm)]">
            <Link
              href={withLocale("/help")}
              className="inline-flex text-sm font-semibold text-[var(--fm-accent)] hover:text-[var(--fm-accent-strong)]"
            >
              {content.labels.backToHome}
            </Link>
            <h1 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-text)]">{page.title}</h1>
            <p className="m-0 text-[var(--fm-text-muted)]">{page.subtitle}</p>
          </section>

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
            <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
              <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">{content.labels.faqTitle}</h2>
              <Accordion>
                {page.faqItems.map((item) => (
                  <AccordionItem key={item.question}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ) : null}

          <section className="space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
            <h2 className="m-0 font-serif text-xl font-semibold text-[var(--fm-text)]">{content.labels.relatedTitle}</h2>
            <div className="flex flex-wrap gap-2">
              {page.relatedLinks.map((item) => (
                <Link key={item.href} href={withLocale(item.href)} className="fm-help-chip-link">
                  {item.label}
                </Link>
              ))}
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
