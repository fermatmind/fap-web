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
    <div
      data-testid="highlighted-card-rating"
      className="flex items-center gap-1 text-[var(--fm-gold)]"
      aria-label={`rating-${rounded}`}
    >
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
  const liveCards = cards.filter((card): card is Extract<HomeHighlightedCard, { kind: "live" }> => card.kind === "live");
  const comingSoonCards = cards.filter(
    (card): card is Extract<HomeHighlightedCard, { kind: "coming_soon" }> => card.kind === "coming_soon"
  );
  const featuredCard = liveCards[0] ?? null;
  const spotlightCards = liveCards.slice(1, 4);
  const archiveCards = liveCards.slice(4);

  return (
    <section
      data-testid="home-highlighted-tests-section"
      id="home-highlighted-tests-section"
      className="fm-home-highlighted relative py-[var(--fm-section-y-lg)] text-[var(--fm-text)]"
    >
      <Container className="relative z-10">
        <div className="fm-home-highlighted-shell mx-auto max-w-[76rem]">
          <div className="mx-auto max-w-3xl space-y-[var(--fm-gap-sm)] text-center">
            <p className="fm-home-section-kicker">{dict.home.hero.kicker}</p>
            <h2 className="m-0 font-serif text-3xl font-semibold text-[var(--fm-trust-blue-strong)]">
              {dict.home.highlighted.title}
            </h2>
            <p className="m-0 text-[var(--fm-text-muted)]">{dict.home.highlighted.subtitle}</p>
          </div>

          <div className="mt-[var(--fm-space-8)] grid gap-[var(--fm-space-6)] lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            {featuredCard ? (
              <article className="fm-home-featured-test">
                <div className="space-y-[var(--fm-gap-sm)]">
                  <div className="flex flex-wrap items-center gap-[var(--fm-gap-xs)]">
                    {featuredCard.scaleCode ? <Badge>{featuredCard.scaleCode}</Badge> : null}
                    {featuredCard.isClinical ? (
                      <Badge className="border-amber-300 bg-amber-100 text-amber-900">
                        {dict.home.highlighted.clinicalBadge}
                      </Badge>
                    ) : null}
                  </div>

                  <h3 className="m-0 max-w-[16ch] font-serif text-4xl font-semibold leading-[1.02] tracking-tight text-white md:text-5xl">
                    {formatTestTitleForUi(featuredCard.title).plain}
                  </h3>
                  <p className="m-0 max-w-[42rem] text-base leading-8 text-blue-50/88">{featuredCard.excerpt}</p>
                </div>

                <div className="mt-[var(--fm-space-8)] flex flex-wrap items-center gap-[var(--fm-gap-sm)]">
                  <Link
                    href={withLocale(`/tests/${featuredCard.slug}/take`)}
                    className="inline-flex min-h-[48px] items-center rounded-full bg-white px-[var(--fm-space-6)] py-[var(--fm-space-3)] text-sm font-semibold text-[var(--fm-trust-blue-strong)] shadow-[var(--fm-shadow-md)] transition hover:bg-slate-100"
                  >
                    {dict.home.highlighted.cta}
                  </Link>
                  <Link
                    href={withLocale(`/tests/${featuredCard.slug}`)}
                    className="inline-flex min-h-[48px] items-center rounded-full border border-white/28 px-[var(--fm-space-6)] py-[var(--fm-space-3)] text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    {dict.common.details}
                  </Link>
                </div>

                <div className="fm-home-featured-rating">{renderStars(featuredCard.rating)}</div>
              </article>
            ) : null}

            <div className="fm-home-spotlight-list">
              {spotlightCards.map((card, index) => {
                const titleDisplay = formatCardTitleForUi({
                  title: card.title,
                  slug: card.slug,
                  locale,
                  surface: "home_highlighted",
                });

                return (
                  <article
                    key={`spotlight-${card.slug}`}
                    className={`fm-home-spotlight-item${index > 0 ? " fm-home-spotlight-item--bordered" : ""}`}
                  >
                    <div className="space-y-[var(--fm-gap-sm)]">
                      <div className="flex flex-wrap items-center gap-[var(--fm-gap-xs)]">
                        {card.scaleCode ? <Badge>{card.scaleCode}</Badge> : null}
                        {card.isClinical ? (
                          <Badge className="border-amber-300 bg-amber-100 text-amber-900">
                            {dict.home.highlighted.clinicalBadge}
                          </Badge>
                        ) : null}
                      </div>
                      <Link
                        href={withLocale(`/tests/${card.slug}`)}
                        title={titleDisplay.plain}
                        className="block font-serif text-[1.7rem] font-semibold leading-[1.08] tracking-tight text-[var(--fm-trust-blue-strong)]"
                      >
                        {titleDisplay.multilineFallback ? (
                          <span className="inline-flex flex-col">
                            <span>{titleDisplay.line1}</span>
                            <span>{titleDisplay.line2}</span>
                          </span>
                        ) : (
                          titleDisplay.line1
                        )}
                      </Link>
                      <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{card.excerpt}</p>
                    </div>

                    <Link
                      href={withLocale(`/tests/${card.slug}/take`)}
                      className="inline-flex items-center text-sm font-semibold text-[var(--fm-trust-blue)] transition hover:text-[var(--fm-trust-blue-strong)]"
                    >
                      {dict.home.highlighted.cta} <span aria-hidden className="ml-2">↗</span>
                    </Link>
                  </article>
                );
              })}
            </div>
          </div>

          {archiveCards.length > 0 || comingSoonCards.length > 0 ? (
            <div className="fm-home-test-index">
              {archiveCards.map((card) => (
                <article key={`archive-${card.slug}`} className="fm-home-test-index-item">
                  <div className="space-y-[var(--fm-gap-xs)]">
                    <div className="flex flex-wrap items-center gap-[var(--fm-gap-xs)]">
                      {card.scaleCode ? <Badge>{card.scaleCode}</Badge> : null}
                      {card.isClinical ? (
                        <Badge className="border-amber-300 bg-amber-100 text-amber-900">
                          {dict.home.highlighted.clinicalBadge}
                        </Badge>
                      ) : null}
                    </div>
                    <h3 className="m-0 font-sans text-lg font-semibold tracking-tight text-[var(--fm-trust-blue-strong)]">
                      {formatTestTitleForUi(card.title).plain}
                    </h3>
                    <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{card.excerpt}</p>
                  </div>
                  <Link
                    href={withLocale(`/tests/${card.slug}/take`)}
                    className="inline-flex items-center text-sm font-semibold text-[var(--fm-trust-blue)] transition hover:text-[var(--fm-trust-blue-strong)]"
                  >
                    {dict.home.highlighted.cta} <span aria-hidden className="ml-2">→</span>
                  </Link>
                </article>
              ))}

              {comingSoonCards.map((card) => (
                <article key={`coming-${card.id}`} className="fm-home-test-index-item fm-home-test-index-item--muted">
                  <div className="space-y-[var(--fm-gap-xs)]">
                    <Badge className="border-amber-300 bg-amber-100 text-amber-900">
                      {dict.home.highlighted.comingSoonBadge}
                    </Badge>
                    <h3 className="m-0 font-sans text-lg font-semibold tracking-tight text-[var(--fm-trust-blue-strong)]">
                      {formatTestTitleForUi(card.title).plain}
                    </h3>
                    <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{card.description}</p>
                  </div>
                  <p className="m-0 text-sm font-semibold text-[var(--fm-text-muted)]">{dict.home.highlighted.comingSoonCta}</p>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
