"use client";

import { useState } from "react";
import { Container } from "@/components/layout/Container";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import type { FaqContent, FaqItem, RouteKey } from "./homepageContent";

type FaqSectionProps = {
  locale: Locale;
  content: FaqContent;
  routes: Pick<Record<RouteKey, string>, "help">;
};

function FaqItemRow({ item, index, isOpen, onToggle }: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: (index: number) => void;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[var(--fm-shadow-sm)]">
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

export function FaqSection({ locale, content, routes }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number>(0);
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section className="py-[clamp(56px,8vw,112px)]" data-testid="home-faq-section">
      <Container className="space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 className="m-0 font-serif text-3xl font-semibold tracking-tight text-[var(--fm-trust-blue-strong)] md:text-4xl">
            {content.title}
          </h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">{content.helpText}</p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {content.items.map((item, index) => (
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
          {content.helpText}
        </a>
      </Container>
    </section>
  );
}
