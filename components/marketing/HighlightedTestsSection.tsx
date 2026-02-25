import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";
import { formatCardTitleForUi, formatTestTitleForUi } from "@/lib/ui/testTitleDisplay";

export type HomeHighlightedCard =
  | {
      kind: "live";
      slug: string;
      title: string;
      scaleCode?: string;
      excerpt: string;
      rating: number;
      isClinical: boolean;
    }
  | {
      kind: "coming_soon";
      id: string;
      title: string;
      description: string;
    };

function renderStars(rating: number) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-1 text-[var(--fm-gold)]" aria-label={`rating-${rounded}`}>
      {Array.from({ length: 5 }, (_, idx) => (
        <span key={idx} aria-hidden className={idx < rounded ? "opacity-100" : "opacity-35"}>
          ★
        </span>
      ))}
    </div>
  );
}

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
    <section data-testid="home-highlighted-tests-section" className="fm-section-highlighted relative py-20 text-[var(--fm-text)]">
      <Container className="relative z-10">
        <div className="fm-highlighted-panel mx-auto max-w-5xl px-4 pb-8 pt-10 md:px-7 md:pb-10 md:pt-12">
          <div className="relative z-10 mx-auto max-w-3xl space-y-3 text-center">
            <h2 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-trust-blue-strong)]">
              {dict.home.highlighted.title}
            </h2>
            <p className="m-0 text-[var(--fm-text-muted)]">{dict.home.highlighted.subtitle}</p>
          </div>

          <div className="relative z-10 mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              if (card.kind === "live") {
                const titleDisplay = formatCardTitleForUi({
                  title: card.title,
                  slug: card.slug,
                  locale,
                  surface: "home_highlighted",
                });
                return (
                  <article
                    key={`live-${card.slug}`}
                    className="group flex h-full flex-col rounded-2xl border border-[#d4deec] bg-white p-6 text-[var(--fm-text)] shadow-[var(--fm-shadow-sm)] transition duration-200 hover:-translate-y-0.5 hover:border-[#bacce5] hover:shadow-[var(--fm-shadow-md)]"
                  >
                    <div className="flex min-h-[4.9rem] flex-col items-start gap-2">
                      <Link
                        href={withLocale(`/tests/${card.slug}`)}
                        title={titleDisplay.plain}
                        className="w-full font-sans text-[1.22rem] font-semibold leading-[1.2] tracking-tight text-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue-strong)] md:text-[1.27rem]"
                      >
                        {titleDisplay.multilineFallback ? (
                          <span className="inline-flex flex-col break-words">
                            <span>{titleDisplay.line1}</span>
                            <span className="mt-1">{titleDisplay.line2}</span>
                          </span>
                        ) : (
                          <span className="block overflow-hidden text-ellipsis whitespace-nowrap">{titleDisplay.line1}</span>
                        )}
                      </Link>
                      {renderStars(card.rating)}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {card.scaleCode ? <Badge>{card.scaleCode}</Badge> : null}
                      {card.isClinical ? (
                        <Badge className="border-amber-300 bg-amber-100 text-amber-900">{dict.home.highlighted.clinicalBadge}</Badge>
                      ) : null}
                    </div>

                    <p className="mt-4 text-sm leading-6 text-[var(--fm-text-muted)]">{card.excerpt}</p>

                    <div className="mt-auto pt-5">
                      <Link
                        href={withLocale(`/tests/${card.slug}/take`)}
                        className="text-sm font-semibold text-[var(--fm-trust-blue)] transition group-hover:text-[var(--fm-trust-blue-strong)]"
                      >
                        {dict.home.highlighted.cta} →
                      </Link>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={`coming-${card.id}`}
                  className="relative flex h-full flex-col rounded-2xl border border-[#d8dfdc] bg-[#f8faf8] p-6 text-[var(--fm-text)] shadow-[var(--fm-shadow-sm)]"
                  data-disabled="1"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="m-0 font-sans text-[1.2rem] font-semibold leading-[1.2] tracking-tight text-[var(--fm-trust-blue-strong)]">
                      {formatTestTitleForUi(card.title).plain}
                    </h3>
                    <Badge className="border-amber-300 bg-amber-100 text-amber-900">{dict.home.highlighted.comingSoonBadge}</Badge>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[var(--fm-text-muted)]">{card.description}</p>

                  <p className="mt-auto pt-5 text-sm font-semibold text-[var(--fm-text-muted)]">{dict.home.highlighted.comingSoonCta}</p>
                </article>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
