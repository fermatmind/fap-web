import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";

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
    }
  | {
      kind: "coming_soon";
      id: string;
      title: string;
      description: string;
    };

export function HighlightedTestsSection({
  dict,
  locale,
  cards,
}: {
  dict: SiteDictionary;
  locale: Locale;
  cards: HomeHighlightedCard[];
}) {
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section
      id="home-highlighted-tests-section"
      data-testid="home-highlighted-tests-section"
      className="fm-section-highlighted fm-home-tests relative py-[var(--fm-section-y-lg)] text-[var(--fm-text)]"
    >
      <Container className="relative z-10">
        <div className="fm-highlighted-panel mx-auto max-w-[76rem] px-[var(--fm-space-4)] pb-[var(--fm-space-8)] pt-[var(--fm-space-10)] md:px-[var(--fm-space-7)] md:pb-[var(--fm-space-10)] md:pt-[var(--fm-space-12)]">
          <div className="relative z-10 mx-auto max-w-3xl space-y-[var(--fm-gap-sm)] text-center">
            <p className="m-0 text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#5f7290]">
              {locale === "zh" ? "核心测评入口" : "Core assessment entry points"}
            </p>
            <h2 className="m-0 text-[clamp(2rem,4vw,2.85rem)] font-semibold tracking-[-0.04em] text-[var(--fm-trust-blue-strong)]">
              {dict.home.highlighted.title}
            </h2>
            <p className="m-0 text-[var(--fm-text-muted)] md:text-[1.02rem]">{dict.home.highlighted.subtitle}</p>
          </div>

          <div className="relative z-10 mt-[var(--fm-space-8)] grid gap-[var(--fm-space-5)] md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              if (card.kind === "live") {
                return (
                  <article
                    key={`live-${card.slug}`}
                    className="fm-home-test-card group flex h-full flex-col rounded-[1.55rem] border border-[#d4deec] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,251,255,0.94)_100%)] p-[var(--fm-space-6)] text-[var(--fm-text)] shadow-[0_16px_34px_rgba(19,41,71,0.08)] transition duration-200"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <Badge className="border-[#d6e0eb] bg-[#f5f8fc] text-[#5d7391]">{card.category}</Badge>
                      <p className="m-0 text-xs font-medium text-[#6d829d]">
                        {card.timeMinutes}
                        {locale === "zh" ? " " : " "}
                        {dict.common.minutes_unit}
                        <span className="mx-2 text-[#b3c0d2]">•</span>
                        {card.questionsCount}
                        {locale === "zh" ? dict.common.questions_unit : ` ${dict.common.questions_unit}`}
                      </p>
                    </div>

                    <div className="mt-[var(--fm-space-4)] min-h-[5.25rem]">
                      <Link
                        href={withLocale(`/tests/${card.slug}`)}
                        title={card.title}
                        className="inline-flex text-[1.24rem] font-semibold leading-tight tracking-[-0.035em] text-[var(--fm-trust-blue-strong)] transition hover:text-[var(--fm-trust-blue)]"
                      >
                        {card.title}
                      </Link>
                      <p className="m-0 mt-3 text-sm leading-7 text-[var(--fm-text-muted)]">{card.description}</p>
                    </div>

                    <div className="mt-[var(--fm-space-5)] flex flex-wrap gap-2">
                      {card.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full border border-[#d8e2ec] bg-white/82 px-3 py-1 text-[0.74rem] font-semibold tracking-[0.04em] text-[#4f6685]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-3 pt-[var(--fm-space-6)]">
                      <Link
                        href={withLocale(`/tests/${card.slug}`)}
                        className="text-sm font-medium text-[#627996] transition hover:text-[var(--fm-trust-blue-strong)]"
                      >
                        {locale === "zh" ? "查看详情" : "View details"}
                      </Link>
                      <Link
                        href={withLocale(`/tests/${card.slug}/take`)}
                        className="fm-home-test-card-cta inline-flex items-center gap-2 text-sm font-semibold text-[var(--fm-trust-blue)] transition group-hover:text-[var(--fm-trust-blue-strong)]"
                      >
                        {dict.home.highlighted.cta}
                        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1 group-active:translate-x-0.5">
                          →
                        </span>
                      </Link>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={`coming-${card.id}`}
                  className="relative flex h-full flex-col rounded-2xl border border-[#d8dfdc] bg-[#f8faf8] p-[var(--fm-space-6)] text-[var(--fm-text)] shadow-[var(--fm-shadow-sm)]"
                  data-disabled="1"
                >
                  <div className="flex items-start justify-between gap-[var(--fm-gap-sm)]">
                    <h3 className="m-0 font-sans text-[1.2rem] font-semibold leading-[1.2] tracking-tight text-[var(--fm-trust-blue-strong)]">
                      {card.title}
                    </h3>
                    <Badge className="border-amber-300 bg-amber-100 text-amber-900">{dict.home.highlighted.comingSoonBadge}</Badge>
                  </div>

                  <p className="mt-[var(--fm-space-3)] text-sm leading-6 text-[var(--fm-text-muted)]">{card.description}</p>

                  <p className="mt-auto pt-[var(--fm-space-5)] text-sm font-semibold text-[var(--fm-text-muted)]">{dict.home.highlighted.comingSoonCta}</p>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
