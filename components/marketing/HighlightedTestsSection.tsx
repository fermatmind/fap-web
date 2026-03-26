import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

export type HomeHighlightedCard =
  | {
      kind: "live";
      slug: string;
      title: string;
      description: string;
      category: string;
      tags: string[];
      questionsCount: number;
      timeMinutes: number;
      footnote: string;
    }
  | {
      kind: "coming_soon";
      id: string;
      title: string;
      description: string;
    };

const SECTION_COPY = {
  en: {
    kicker: "Decision Entry Matrix",
    title: "Decision Entry Matrix",
    subtitle:
      "This is not about choosing a fun test. It is about choosing the right judgment module for the decision you are actually making.",
    cta: "Enter module",
  },
  zh: {
    kicker: "决策入口矩阵",
    title: "决策入口矩阵",
    subtitle: "不是选择一个“好玩的测试”，而是进入一个更适合当前问题的判断模块。",
    cta: "进入模块",
  },
} as const;

export function HighlightedTestsSection({
  locale,
  cards,
}: {
  locale: Locale;
  cards: HomeHighlightedCard[];
}) {
  const withLocale = (path: string) => localizedPath(path, locale);
  const copy = SECTION_COPY[locale];

  return (
    <section
      id="home-highlighted-tests-section"
      data-testid="home-highlighted-tests-section"
      className="fm-home-tests relative py-[var(--fm-section-y-lg)] text-[var(--fm-text)]"
    >
      <Container className="relative z-10">
        <div className="fm-home-matrix-shell mx-auto max-w-[78rem] px-[var(--fm-space-4)] pb-[var(--fm-space-8)] pt-[var(--fm-space-9)] md:px-[var(--fm-space-7)] md:pb-[var(--fm-space-10)] md:pt-[var(--fm-space-11)]">
          <div className="mx-auto max-w-[46rem] space-y-3 text-center">
            <p className="fm-home-section-kicker m-0">{copy.kicker}</p>
            <h2 className="m-0 text-[clamp(2rem,4vw,3rem)] font-semibold tracking-[-0.045em] text-[#0b0f14]">
              {copy.title}
            </h2>
            <p className="m-0 text-[0.98rem] leading-7 text-[#55616e] md:text-[1.04rem]">{copy.subtitle}</p>
          </div>

          <div className="mt-[var(--fm-space-8)] grid gap-[var(--fm-space-5)] md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              if (card.kind !== "live") {
                return null;
              }

              return (
                <article key={card.slug} className="fm-home-test-card group flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <p className="m-0 text-sm font-semibold tracking-[-0.02em] text-[#0b0f14]">{card.category}</p>
                    <p className="m-0 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#737d8a]">
                      {card.footnote}
                    </p>
                  </div>

                  <div className="mt-5 space-y-4">
                    <Link
                      href={withLocale(`/tests/${card.slug}`)}
                      title={card.title}
                      className="inline-flex text-[1.34rem] font-semibold leading-tight tracking-[-0.04em] text-[#0b0f14] transition hover:text-[#15253d]"
                    >
                      {card.title}
                    </Link>
                    <p className="m-0 text-sm leading-7 text-[#4c5966]">{card.description}</p>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {card.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-[#d6dbe2] bg-[#f6f7fa] px-3 py-1 text-[0.72rem] font-medium text-[#606b77]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#d7dce3] pt-5">
                    <div className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#737d8a]">
                      <span>{card.timeMinutes} min</span>
                      <span className="mx-2 text-[#b4bbc4]">/</span>
                      <span>{card.questionsCount} items</span>
                    </div>

                    <Link
                      href={withLocale(`/tests/${card.slug}/take`)}
                      className="fm-home-test-card-cta inline-flex items-center gap-2 text-sm font-semibold text-[#0b0f14]"
                    >
                      {copy.cta}
                      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 group-active:translate-x-0.5">
                        →
                      </span>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
