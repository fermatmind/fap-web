"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { FaqSection } from "./FaqSection";
import type { FaqContent, KnowledgeMethodsContent, RouteKey } from "./homepageContent";

type KnowledgeMethodsSectionProps = {
  locale: Locale;
  content: KnowledgeMethodsContent;
  faq: FaqContent;
  routes: Pick<Record<RouteKey, string>, "help" | "articles" | "mbtiBasics">;
};

export function KnowledgeMethodsSection({ locale, content, faq, routes }: KnowledgeMethodsSectionProps) {
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section data-testid="home-knowledge-methods-section" className="fm-home-section-shell">
      <Container className="max-w-[1200px] grid gap-8 lg:grid-cols-[5fr_7fr] lg:items-start">
        <div className="space-y-4">
          <p className="fm-home-section-kicker">{locale === "zh" ? "方法说明" : "Method Guide"}</p>
          <h2 className="m-0 text-3xl font-semibold tracking-tight text-[var(--fm-trust-blue-strong)] md:text-4xl">
            {content.title}
          </h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">{content.supporting}</p>

          <div className="grid gap-3">
            {content.cards.map((item) => {
              const route = routes[item.routeKey];
              return (
                <article key={item.title} className="rounded-xl border border-[var(--fm-border)] bg-white p-4">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
                    {item.label}
                  </p>
                  <h3 className="mt-1 m-0 text-lg font-semibold text-[var(--fm-text)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{item.body}</p>
                  <Link
                    href={withLocale(route)}
                    className={buttonVariants({
                      size: "sm",
                      className: "mt-3 h-auto min-h-[40px] px-3",
                    })}
                  >
                    {item.cta}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        <FaqSection locale={locale} content={faq} routes={{ help: routes.help }} compact />
      </Container>
    </section>
  );
}
