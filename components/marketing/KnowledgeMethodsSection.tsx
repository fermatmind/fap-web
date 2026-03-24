"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { FaqContent, FaqItem, KnowledgeMethodsContent, RouteKey } from "./homepageContent";

type KnowledgeMethodsSectionProps = {
  locale: Locale;
  content: KnowledgeMethodsContent;
  faq: FaqContent;
  routes: Pick<Record<RouteKey, string>, "help" | "articles" | "mbtiBasics">;
};

function FaqItemRow({
  item,
  index,
  isOpen,
  onToggle,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}) {
  return (
    <article className="rounded-2xl border border-[var(--fm-border)] bg-white/85 p-4">
      <button
        type="button"
        onClick={() => onToggle(index)}
        className="flex w-full min-h-[44px] items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)]"
        aria-expanded={isOpen}
      >
        <h3 className="m-0 text-base font-semibold text-[var(--fm-text)]">{item.question}</h3>
        <span className="text-sm font-semibold text-[var(--fm-trust-blue)]" aria-hidden>
          {isOpen ? "−" : "+"}
        </span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height,opacity] duration-200 ${
          isOpen ? "mt-3 max-h-48 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className={`m-0 text-sm leading-7 text-[var(--fm-text-muted)] ${isOpen ? "" : "sr-only"}`}>{item.answer}</p>
      </div>
    </article>
  );
}

export function KnowledgeMethodsSection({ locale, content, faq, routes }: KnowledgeMethodsSectionProps) {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section
      data-testid="home-knowledge-methods-section"
      className="fm-home-section-shell"
    >
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
                <article key={item.title} className="fm-home-compact-card">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-text-muted)]">
                    {item.cta}
                  </p>
                  <h3 className="mt-1 m-0 text-lg font-semibold text-[var(--fm-text)]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{item.body}</p>
                  <Link
                    href={withLocale(route)}
                    className={buttonVariants({
                      size: "sm",
                      className: "mt-4 h-auto min-h-[40px] px-3",
                    })}
                  >
                    {item.cta}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>

        <section className="space-y-4">
          <div className="space-y-2">
            <p className="fm-home-section-kicker">FAQ</p>
            <h3 className="m-0 text-3xl font-semibold tracking-tight text-[var(--fm-trust-blue-strong)] md:text-4xl">
              {faq.title}
            </h3>
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">{faq.helpText}</p>
          </div>

          <div className="space-y-3">
            {faq.items.map((item, index) => (
              <FaqItemRow
                key={item.question}
                item={item}
                index={index}
                isOpen={openIndex === index}
                onToggle={(target) => setOpenIndex((prev) => (prev === target ? -1 : target))}
              />
            ))}
          </div>

          <a href={withLocale(routes.help)} className="inline-flex min-h-[44px] text-sm font-semibold text-[var(--fm-trust-blue)]">
            {faq.helpLinkText ?? (locale === "zh" ? "前往帮助中心" : "Go to Help Center")}
          </a>
        </section>
      </Container>
    </section>
  );
}
